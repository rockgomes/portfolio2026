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

  test('Dynamic Lists selection matches its thumbnail', async ({ page }) => {
    await page.goto('/');
    const thumb = (await page.locator('.card[data-id="dealfront-dynamic-lists"] .thumb').boundingBox())!;
    const sel = (await page.locator('.card[data-id="dealfront-dynamic-lists"] .sel').boundingBox())!;
    for (const k of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(thumb[k] - sel[k]), k).toBeLessThan(2);
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
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"]')).toHaveCount(0);
    await expect(page.locator('.card[data-id="karaoke-os"] .cursor')).toHaveCount(1);
    const card = (await page.locator('.card[data-id="karaoke-os"]').boundingBox())!; const cur = (await page.locator('.card[data-id="karaoke-os"] .cursor .arrow').boundingBox())!;
    expect(cur.x).toBeGreaterThan(card.x); expect(cur.x).toBeLessThan(card.x + card.width); expect(cur.y).toBeGreaterThan(card.y);
  });
});
