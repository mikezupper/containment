import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const run = promisify(execFile), root = process.cwd();
const greed = path.resolve(process.env.GREED_REPO || '../greed-dice-game');
const temporary = await mkdtemp(path.join(tmpdir(), 'containment-runtime-'));
const consumer = path.join(temporary, 'consumer');
const report = { checkedAt: new Date().toISOString(), consumers: [], checks: [] };
let server, browser;
try {
  await mkdir(consumer);
  const packed = JSON.parse((await run('npm', ['pack', '--workspace', '@local-games/runtime', '--pack-destination', temporary, '--json'], { cwd: root })).stdout)[0];
  assert.ok(packed.files.some(file => file.path === 'dist/core.d.ts'));
  assert.ok(packed.files.some(file => file.path === 'dist/gyral.js'));
  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  await run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', path.join(temporary, packed.filename)], { cwd: consumer });
  const core = await run(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { observeSelection } from '@local-games/runtime/core';
    const seen = [], stop = observeSelection({ get: () => 7, subscribe: () => () => {} }, n => n * 2, n => seen.push(n));
    assert.deepEqual(seen, [14]); stop();
    await assert.rejects(import('@gyral/core'), { code: 'ERR_MODULE_NOT_FOUND' });
    console.log('Core loads without the optional Gyral peer.');
  `], { cwd: consumer });
  report.checks.push(core.stdout.trim());

  const greedPackage = JSON.parse(await readFile(path.join(greed, 'package.json'), 'utf8'));
  await run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', path.join(root, 'vendor/gyral/0.3.1-next.1/gyral-core-0.3.1-next.1.tgz'), `zod@${greedPackage.dependencies.zod}`], { cwd: consumer });
  // These copies are test fixtures from the real checkout, not recreated session mocks.
  await cp(path.join(greed, 'src'), path.join(consumer, 'games/greed'), { recursive: true });
  for (const layer of ['game', 'runtime']) await cp(path.join(root, 'src', layer), path.join(consumer, 'games/jezz', layer), { recursive: true });
  for (const [name, file] of [['Greed', path.join(greed, 'src/state/local.ts')], ['Containment', path.join(root, 'src/runtime/session.ts')]]) {
    report.consumers.push({ name, sessionSource: file, sha256: createHash('sha256').update(await readFile(file)).digest('hex') });
  }
  await writeFile(path.join(consumer, 'index.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><title>Package consumer proof</title><body><main></main><script type="module" src="/consumer.ts"></script></body></html>');
  await writeFile(path.join(consumer, 'consumer.ts'), `
import { define, html, settled } from '@gyral/core';
import { observeSelection } from '@local-games/runtime/core';
import { createSessionBridge } from '@local-games/runtime/gyral';
import { localSession } from './games/greed/state/local.ts';
import type { Snapshot as GreedSnapshot } from './games/greed/state/session.ts';
import type { Move } from './games/greed/game/table.ts';
import { Session, type Snapshot, type Action } from './games/jezz/runtime/session.ts';

const greed = localSession(['Ada', 'Lin']), jezz = new Session(7);
const greedBridge = createSessionBridge<GreedSnapshot, Move, string>({ name: 'greed-proof', select: s => s.table.match.stage });
const jezzBridge = createSessionBridge<Snapshot, Action, string>({ name: 'jezz-proof', select: s => s.game.phase });
type Msg = { readonly _tag: 'Changed'; readonly value: string } | { readonly _tag: 'Start' } | { readonly _tag: 'Failed'; readonly message: string };
const GreedControl = define<string, Msg>('greed-package-proof', {
  shadow: false, init: () => ['', [greedBridge.watch(value => ({ _tag: 'Changed', value }))]],
  intent: { Start: () => ({ _tag: 'Start' }) },
  update: { Changed: (_, msg) => msg.value, Failed: (_, msg) => msg.message,
    Start: state => [state, [greedBridge.act({ type: 'Start' }, message => ({ _tag: 'Failed', message }))]] },
  view: (state, i) => html\`<button data-intent=\${i.Start}>Start Greed</button><output>\${state}</output>\`,
});
const JezzControl = define<string, Msg>('jezz-package-proof', {
  shadow: false, init: () => ['', [jezzBridge.watch(value => ({ _tag: 'Changed', value }))]],
  intent: { Start: () => ({ _tag: 'Start' }) },
  update: { Changed: (_, msg) => msg.value, Failed: (_, msg) => msg.message,
    Start: state => [state, [jezzBridge.act({ type: 'restart' }, message => ({ _tag: 'Failed', message }))]] },
  view: (state, i) => html\`<button data-intent=\${i.Start}>Start Containment</button><output>\${state}</output>\`,
});
const main = document.querySelector('main')!;
const a = document.createElement('section'), b = document.createElement('section'); main.append(a, b);
const stopGreed = greedBridge.provide(a, greed), stopJezz = jezzBridge.provide(b, jezz);
a.append(new GreedControl()); b.append(new JezzControl());
export const observed: Record<string, string[]> = { greed: [], jezz: [] };
const stopA = observeSelection(greed, s => s.table.match.stage, v => observed.greed.push(v));
const stopB = observeSelection(jezz, s => s.game.phase, v => observed.jezz.push(v));
export { settled };
export const dispose = () => { main.replaceChildren(); stopA(); stopB(); stopGreed(); stopJezz(); greed.close(); jezz.close(); };
`);
  await run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2023', '--module', 'ESNext', '--moduleResolution', 'bundler', '--allowImportingTsExtensions', 'consumer.ts'], { cwd: consumer });
  report.checks.push('Packed declarations typecheck against both real session contracts.');
  server = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), consumer, '--config', path.join(root, 'vite.config.ts'), '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { cwd: consumer, stdio: 'pipe' });
  let serverLog = ''; server.stdout.on('data', chunk => { serverLog += chunk; }); server.stderr.on('data', chunk => { serverLog += chunk; });
  const url = 'http://127.0.0.1:4175';
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(url)).ok) break; } catch { /* Wait for Vite startup. */ }
    if (server.exitCode !== null || attempt === 59) throw new Error(`Consumer server failed: ${serverLog}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch(); const page = await browser.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(url);
  await page.waitForFunction(() => document.querySelector('greed-package-proof output')?.textContent === 'lobby');
  assert.equal(await page.locator('jezz-package-proof output').textContent(), 'ready');
  await page.getByRole('button', { name: 'Start Greed', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('greed-package-proof output')?.textContent === 'opening');
  assert.equal(await page.locator('jezz-package-proof output').textContent(), 'ready');
  await page.getByRole('button', { name: 'Start Containment', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('jezz-package-proof output')?.textContent === 'playing');
  assert.equal(await page.locator('greed-package-proof output').textContent(), 'opening');
  const observed = await page.evaluate(async () => { const proof = await import('/consumer.ts'); await proof.settled(); const result = proof.observed; proof.dispose(); await proof.settled(); return result; });
  assert.deepEqual(observed, { greed: ['lobby', 'opening'], jezz: ['ready', 'playing'] });
  assert.deepEqual(errors, []);
  report.checks.push('Packed core and Gyral bridge run with unchanged Greed and Containment sessions in Chromium; dispatch and namespace isolation pass.');
  report.limit = 'Greed Start transition only; no dice worker, multiplayer, persistence migration, or production adoption. Sabacc still needs its game-owned aggregate adapter. No package was published.';
  await mkdir('artifacts/package', { recursive: true });
  await writeFile('artifacts/package/report.json', JSON.stringify({ ...report, archive: { filename: packed.filename, integrity: packed.integrity, files: packed.files.map(file => file.path) } }, null, 2));
  console.log(report.checks.join('\n'));
} finally {
  await browser?.close(); server?.kill('SIGTERM'); await rm(temporary, { recursive: true, force: true });
}
