import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const external = process.env.CONTAINMENT_URL || process.env.JEZZBALL_URL;
const url = external || 'http://127.0.0.1:4174';
const server = external ? null : spawn(process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], { stdio: 'pipe' });
const directory = 'artifacts/compatibility'; await mkdir(directory, { recursive: true });
const results = [];
const phoneSizes = [[320, 568], [360, 640], [375, 667], [390, 844], [414, 896], [430, 932], [568, 320], [667, 375], [844, 390]];
async function phoneLayouts(page, engine) {
  const checked = [];
  // Live touch play is exercised above. Hold the run paused while comparing
  // geometry so window focus changes and wall outcomes cannot alter the fixture.
  assert.equal(await page.getByRole('button', { name: 'Resume game' }).isEnabled(), true);
  for (const [width, height] of phoneSizes) {
    await page.setViewportSize({ width, height });
    await page.locator('.game-layout').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const layout = await page.evaluate(() => {
      const board = document.querySelector('jezz-chamber').getBoundingClientRect();
      const buttons = [...document.querySelectorAll('.actions button')].map(element => {
        const box = element.getBoundingClientRect(), hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return { text: element.textContent.trim(), top: box.top, bottom: box.bottom, height: box.height, reachable: element === hit || element.contains(hit) };
      });
      return { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth,
        boardTop: board.top, boardBottom: board.bottom,
        boardHit: document.elementFromPoint(board.x + board.width / 2, board.y + board.height / 2)?.tagName, buttons };
    });
    assert.equal(layout.documentWidth, width, `${engine} ${width}x${height}: horizontal overflow`);
    assert.ok(layout.boardTop >= 0 && layout.boardBottom <= height + 1, `${engine} ${width}x${height}: board clipped ${JSON.stringify(layout)}`);
    assert.equal(layout.boardHit, 'CANVAS', `${engine} ${width}x${height}: board covered`);
    for (const button of layout.buttons) assert.ok(button.reachable && button.top >= 0 && button.bottom <= height + 1 && button.height >= 44,
      `${engine} ${width}x${height}: unreachable touch control ${button.text}`);
    const pixels = await visibleChamber(page, `${engine} ${width}x${height} paused`);
    await page.getByText('Game options', { exact: true }).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `${engine} ${width}x${height}: expanded options overflow`);
    await page.getByText('Game options', { exact: true }).click();
    checked.push({ ...layout, renderedPixels: pixels, expandedOptions: 'no horizontal overflow' });
    if (width === 320 || width === 568) await page.screenshot({ path: `${directory}/${engine}-${width}x${height}.png` });
  }
  return checked;
}
async function visibleChamber(page, label) {
  // DOM size alone cannot detect a cleared WebGL buffer after a paused resize.
  const png = await page.locator('jezz-chamber canvas').screenshot();
  const brightFraction = await page.evaluate(async base64 => {
    const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height); let bright = 0;
    for (let i = 0; i < data.length; i += 4) if (Math.max(data[i], data[i + 1], data[i + 2]) > 115) bright++;
    return bright / (canvas.width * canvas.height);
  }, png.toString('base64'));
  assert.ok(brightFraction > 0.01, `${label}: rendered bezel/grid missing (${brightFraction})`);
  return brightFraction;
}
try {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(url)).ok) break; } catch { /* Preview is starting. */ }
    if (i === 59) throw new Error('Preview failed to start');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  for (const [name, type] of [['chromium', chromium], ['firefox', firefox], ['webkit', webkit]]) {
    const browser = await type.launch(name === 'chromium' ? { args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] } : {});
    try {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light', hasTouch: true });
      const page = await context.newPage(), problems = [];
      page.on('pageerror', error => problems.push(error.message));
      page.on('console', message => { if (message.type() === 'error') problems.push(message.text()); });
      await page.goto(url); await page.locator('jezz-chamber[data-ready="true"]').waitFor();
      await page.getByRole('button', { name: 'Start game' }).click();
      await page.locator('.game-layout').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
      const positions = await page.evaluate(() => {
        const panel = document.querySelector('.console').getBoundingClientRect(), board = document.querySelector('jezz-chamber').getBoundingClientRect();
        return { panelBottom: panel.bottom, boardTop: board.top, boardBottom: board.bottom, viewport: innerHeight,
          grid: getComputedStyle(document.querySelector('.game-layout')).display,
          background: getComputedStyle(document.body).backgroundColor,
          overflow: document.documentElement.scrollWidth > innerWidth };
      });
      assert.equal(positions.grid, 'grid'); assert.equal(positions.overflow, false);
      assert.ok(positions.boardTop >= positions.panelBottom - 1, `${name}: sticky controls obscure the board`);
      assert.ok(positions.boardBottom <= positions.viewport + 1, `${name}: board does not fit with controls`);
      const board = await page.locator('jezz-chamber').boundingBox();
      await page.touchscreen.tap(board.x + board.width / 2, board.y + board.height / 2);
      await page.waitForFunction(() => Number(document.querySelector('#score')?.textContent?.replaceAll(',', '')) > 0);
      await page.getByRole('button', { name: 'Pause game' }).click();
      const clock = await page.locator('#clock').textContent(); await page.waitForTimeout(200);
      assert.equal(await page.locator('#clock').textContent(), clock);
      await page.getByRole('button', { name: 'Vertical wall' }).click(); await page.getByRole('button', { name: 'Horizontal wall' }).waitFor();
      const portraitPixels = await visibleChamber(page, `${name} portrait`);
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(audit.violations.map(v => v.id), [], `${name}: accessibility audit`);
      await page.screenshot({ path: `${directory}/${name}-portrait.png`, fullPage: true });
      await page.setViewportSize({ width: 844, height: 390 });
      await page.locator('.game-layout').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
      const landscape = await page.evaluate(() => {
        const board = document.querySelector('jezz-chamber').getBoundingClientRect(), controls = document.querySelector('.actions').getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth, boardBottom: board.bottom, controlsBottom: controls.bottom, viewport: innerHeight };
      });
      assert.equal(landscape.overflow, false); assert.ok(landscape.boardBottom <= landscape.viewport + 1, `${name}: landscape board clipped`);
      assert.ok(landscape.controlsBottom <= landscape.viewport + 1, `${name}: landscape controls clipped`);
      const landscapePixels = await visibleChamber(page, `${name} paused landscape resize`);
      assert.equal(await page.locator('#clock').evaluate(element => element.getClientRects().length), 1, `${name}: clock wrapped`);
      await page.screenshot({ path: `${directory}/${name}-landscape.png` });
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      const dark = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(dark.violations.map(v => v.id), [], `${name}: dark theme audit`);
      const phones = await phoneLayouts(page, name);
      assert.deepEqual(problems, [], `${name}: browser console errors`);
      results.push({ engine: name, version: browser.version(), portrait: positions, landscape, phones, renderedPixels: { portrait: portraitPixels, landscape: landscapePixels }, play: 'touch construction, score, pause, rotation, paused resize passed', accessibility: 'light and dark A/AA audits passed', problems });
      console.log(`${name}: ${phones.length} phone layouts, real WebGL, reachable controls, and accessibility passed`);
    } finally { await browser.close(); }
  }
  await writeFile(`${directory}/report.json`, JSON.stringify({ checkedAt: new Date().toISOString(), results,
    limit: 'Automated desktop browser engines with touch emulation; this is not physical-phone or shipping Safari evidence.' }, null, 2));
} finally { server?.kill('SIGTERM'); }
