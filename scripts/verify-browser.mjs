import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const directory = 'artifacts/browser'; await mkdir(directory, { recursive: true });
const external = process.env.CONTAINMENT_URL || process.env.JEZZBALL_URL;
const url = external || 'http://127.0.0.1:4173';
const server = external ? null : spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'pipe' });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
const problems = [], results = [];
function observe(page) {
  page.on('pageerror', error => problems.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) problems.push(message.text()); });
}
async function audit(page, label) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.equal(violations.length, 0, `${label}: ${JSON.stringify(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })))}`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label}: horizontal overflow`);
  results.push(`${label}: no axe WCAG A/AA violations or horizontal overflow`);
}
try {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(url)).ok) break; } catch { /* Preview is starting. */ }
    if (i === 59) throw new Error('Preview server did not start.');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' });
  const page = await context.newPage(); observe(page); await page.goto(url);
  await page.locator('jezz-chamber[data-ready="true"]').waitFor();
  await page.getByRole('button', { name: 'Start game' }).waitFor();
  assert.equal(await page.locator('h1').count(), 1); assert.equal(await page.locator('main').count(), 1);
  assert.equal(await page.title(), 'Containment — Play the 3D territory game');
  assert.equal(await page.getByRole('heading', { name: 'Containment', exact: true }).count(), 1);
  assert.match(await page.locator('meta[name="description"]').getAttribute('content'), /^Play Containment,/);
  assert.match(await page.locator('meta[property="og:title"]').getAttribute('content'), /^Containment —/);
  await page.getByRole('link', { name: 'Containment home', exact: true }).waitFor();
  await audit(page, 'Desktop ready'); await page.screenshot({ path: `${directory}/desktop.png`, fullPage: true });
  await page.getByText('Game options', { exact: true }).click();
  await page.getByRole('button', { name: 'Slow pace' }).click();
  await page.getByRole('button', { name: 'Start game' }).click();
  const chamber = page.getByRole('group', { name: 'Containment chamber' });
  await chamber.focus(); await page.keyboard.press('Enter');
  await page.waitForFunction(() => Number(document.querySelector('#score')?.textContent?.replaceAll(',', '')) > 0);
  await page.getByRole('button', { name: 'Pause game' }).click();
  const time = await page.locator('#clock').textContent();
  await page.waitForTimeout(500); assert.equal(await page.locator('#clock').textContent(), time);
  await audit(page, 'Desktop paused'); await page.screenshot({ path: `${directory}/paused.png`, fullPage: true });
  await page.getByRole('button', { name: 'Vertical wall' }).click(); await page.getByRole('button', { name: 'Horizontal wall' }).waitFor();
  await page.getByRole('button', { name: 'Resume game' }).click();
  await page.evaluate(async () => {
    const canvas = document.querySelector('jezz-chamber canvas'), extension = canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('Context-loss testing extension is unavailable');
    await new Promise(resolve => { canvas.addEventListener('webglcontextlost', resolve, { once: true }); extension.loseContext(); });
  });
  await page.locator('jezz-chamber[data-graphics="lost"]').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Resume game' }).isDisabled(), true);
  const frozen = await page.locator('#clock').textContent();
  await audit(page, 'Graphics interrupted'); await page.screenshot({ path: `${directory}/graphics-interrupted.png`, fullPage: true });
  await page.getByRole('button', { name: 'Try 3D again' }).click();
  await page.locator('jezz-chamber[data-ready="true"]').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Resume game' }).isDisabled(), false);
  assert.equal(await page.locator('#clock').textContent(), frozen);
  results.push('Real WebGL loss pauses and blocks play; visible retry recreates the chamber without auto-resuming');
  await page.getByRole('button', { name: 'Resume game' }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.getByRole('button', { name: 'Resume game' }).waitFor();
  const best = await page.locator('.personal-best strong').textContent();
  await page.reload(); await page.getByRole('button', { name: 'Start game' }).waitFor();
  assert.equal(await page.locator('.personal-best strong').textContent(), best);
  results.push('Keyboard construction, capture points, pause, rotation, blur pause, and persisted best passed');
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await audit(page, 'Dark theme / reduced motion'); await page.screenshot({ path: `${directory}/dark.png`, fullPage: true });
  await page.setViewportSize({ width: 720, height: 900 });
  await audit(page, '720 px (1440 px at 200% equivalent layout width)');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'light' });
  const mobile = await mobileContext.newPage(); observe(mobile); await mobile.goto(url);
  await mobile.locator('jezz-chamber[data-ready="true"]').waitFor();
  await audit(mobile, 'Mobile ready'); await mobile.screenshot({ path: `${directory}/mobile.png`, fullPage: true });
  await mobile.getByRole('button', { name: 'Start game' }).tap();
  await mobile.getByRole('button', { name: 'Vertical wall' }).tap();
  await mobile.locator('jezz-chamber').scrollIntoViewIfNeeded();
  const box = await mobile.locator('jezz-chamber').boundingBox(); assert.ok(box);
  await mobile.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await mobile.waitForFunction(() => document.querySelector('.game-notice')?.textContent !== 'Chamber open. Place your first wall.');
  await mobile.getByRole('button', { name: 'Pause game' }).tap(); await audit(mobile, 'Mobile paused after tap');
  await mobileContext.close();
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJs = await noJsContext.newPage(); await noJs.goto(url);
  assert.match(await noJs.locator('#how-to-play').textContent(), /75%/); assert.equal(await noJs.locator('h1').textContent(), 'Containment.');
  await noJsContext.close(); results.push('Rules and game description remain readable without JavaScript');
  if (!external) {
    const files = await readdir('dist/assets');
    const three = files.find(name => /^three-.*\.js$/.test(name)); assert.ok(three);
    const gzip = gzipSync(await readFile(`dist/assets/${three}`)).length;
    assert.ok(gzip < 150 * 1024, `Three.js exceeds 150 KiB gzip budget: ${gzip}`);
    results.push(`Lazy Three.js chunk: ${(gzip / 1024).toFixed(1)} KiB gzip (150 KiB budget)`);
  }
  assert.deepEqual(problems, [], 'Browser console must be clean');
  await writeFile(`${directory}/report.json`, JSON.stringify({ checkedAt: new Date().toISOString(), results, problems }, null, 2));
  console.log(results.join('\n'));
} finally { await browser.close(); server?.kill('SIGTERM'); }
