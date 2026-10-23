import { test, expect } from '@playwright/test';

// Guards against overlay drift: every overlay must sit on the thing it points at.
test.describe('overlays stay on their targets', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'overlays are hidden below 1200px');

  test('text selection covers the word "work"', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const sel = page.locator('[data-text-selection]');
    await expect(sel).toHaveClass(/on/);
    const word = await page.evaluate(() => {
      const t = document.querySelector('#work [data-title]')!; const n = t.firstChild as Text; const i = n.data.lastIndexOf('work');
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 4); const b = r.getBoundingClientRect(); return { x: b.left, w: b.width, y: b.top };
    });
    const box = (await sel.boundingBox())!;
    expect(Math.abs(box.x - (word.x - 2))).toBeLessThan(3);
    expect(Math.abs(box.width - (word.w + 5))).toBeLessThan(3);
  });

  test('Dev cursor sits on the Dynamic Lists thumbnail corner', async ({ page }) => {
    await page.goto('/');
    const thumb = (await page.locator('.card[data-id="dealfront-dynamic-lists"] .thumb').boundingBox())!;
    const cur = (await page.locator('.card[data-id="dealfront-dynamic-lists"] .cursor .arrow').boundingBox())!;
    expect(Math.abs(cur.x - (thumb.x + thumb.width - 6))).toBeLessThan(3);
    expect(Math.abs(cur.y - (thumb.y + thumb.height - 6))).toBeLessThan(3);
  });

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

  test('headline selection wraps the headline', async ({ page }) => {
    await page.goto('/');
    const h = (await page.locator('.h1-box').boundingBox())!; const s = (await page.locator('.h1-box .sel').boundingBox())!;
    expect(Math.abs(s.x - (h.x - 8))).toBeLessThan(2); expect(Math.abs(s.y - (h.y - 6))).toBeLessThan(2);
  });

  test('portrait selection matches the portrait', async ({ page }) => {
    await page.goto('/');
    const p = (await page.locator('#about .portrait').boundingBox())!; const s = (await page.locator('#about .portrait .sel').boundingBox())!;
    for (const k of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(p[k] - s[k]), k).toBeLessThan(3);
  });

  test('overlays follow their card when the filter hides others', async ({ page }) => {
    await page.goto('/');
    await page.click('.row[data-key="type"][data-val="experiment"]');
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"]')).toBeHidden();
    await expect(page.locator('.card[data-id="karaoke-os"] .cursor')).toHaveCount(1);
    const card = (await page.locator('.card[data-id="karaoke-os"]').boundingBox())!; const cur = (await page.locator('.card[data-id="karaoke-os"] .cursor .arrow').boundingBox())!;
    expect(cur.x).toBeGreaterThan(card.x); expect(cur.x).toBeLessThan(card.x + card.width); expect(cur.y).toBeGreaterThan(card.y);
  });
});
