import { test, expect } from '@playwright/test';

// Guards against overlay drift: every overlay must sit on the thing it points at.
test.describe('overlays stay on their targets', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'overlays are hidden below 1200px');

  test('a dragged selection stays, shows its offset, and goes back on double-click', async ({ page }) => {
    await page.goto('/');
    const box = page.locator('.h1-box'); const label = box.locator('[data-size]');
    const b = (await box.boundingBox())!;
    await page.mouse.move(b.x + 100, b.y + 80); await page.mouse.down();
    await page.mouse.move(b.x + 160, b.y + 110, { steps: 6 });
    await expect(label).toHaveText('x +60 · y +30');
    await page.mouse.up();
    await expect(label).toHaveText(/^\d+ × \d+$/);
    const moved = (await box.boundingBox())!;
    expect(Math.round(moved.x - b.x)).toBe(60); expect(Math.round(moved.y - b.y)).toBe(30);
    await box.dblclick({ position: { x: 100, y: 80 } });
    await expect(box).not.toHaveClass(/moved/);
  });

  test('headline selection wraps the letters, and its label is its size', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const ink = await page.evaluate(() => { const r = document.createRange(); r.selectNodeContents(document.querySelector('#hero-title .h1-box')!.firstChild!); const rs = [...r.getClientRects(), ...(() => { const q = document.createRange(); q.selectNodeContents(document.querySelector('#hero-title .accent')!); return [...q.getClientRects()]; })()]; return { l: Math.min(...rs.map((x) => x.left)), t: Math.min(...rs.map((x) => x.top)), r: Math.max(...rs.map((x) => x.right)), b: Math.max(...rs.map((x) => x.bottom)) }; });
    const s = (await page.locator('.h1-box .sel').boundingBox())!;
    expect(s.x).toBeLessThanOrEqual(ink.l + 1); expect(s.y).toBeLessThanOrEqual(ink.t + 1);
    expect(s.x + s.width).toBeGreaterThanOrEqual(ink.r - 1); expect(s.y + s.height).toBeGreaterThanOrEqual(ink.b - 1);
    await expect(page.locator('.h1-box [data-size]')).toHaveText(`${Math.round(s.width)} × ${Math.round(s.height)}`);
  });

  test('portrait selection matches the portrait', async ({ page }) => {
    await page.goto('/');
    const p = (await page.locator('#about .portrait').boundingBox())!; const s = (await page.locator('#about .portrait .sel').boundingBox())!;
    for (const k of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(p[k] - s[k]), k).toBeLessThan(3);
  });

  test('overlays follow their card when the filter hides others', async ({ page }) => {
    await page.goto('/');
    await page.click('.row[data-key="industry"][data-val="Fintech"]');
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"]')).toBeHidden();
    await expect(page.locator('.card[data-id="bigbank---loan-flow"] .cursor')).toHaveCount(1);
    await page.waitForTimeout(800);
    const [card, cur] = await page.evaluate(() => [document.querySelector('.card[data-id="bigbank---loan-flow"]')!, document.querySelector('.card[data-id="bigbank---loan-flow"] .cursor .arrow')!].map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; }));
    expect(cur.x).toBeGreaterThan(card.x); expect(cur.x).toBeLessThan(card.x + card.w); expect(cur.y).toBeGreaterThan(card.y);
  });

  test('with reduced motion, Projects shows the comments without cursors', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-grid] .thumb-wrap > .cursor').first()).toBeHidden();
    await expect(page.locator('.card[data-id="inbank---hire-purchase"] .cm')).toContainText('Great job!');
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"] .cm')).toContainText('Dev');
    await expect(page.locator('.card[data-id="bigbank---loan-flow"] .cm')).toContainText('PM');
  });
});
