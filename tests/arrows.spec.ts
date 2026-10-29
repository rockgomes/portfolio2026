import { test, expect } from '@playwright/test';

// iPhones draw ↗ as a colour emoji, so links that open in a new tab use the arrow icon (IconArrowUpRight) instead of the
// character. ↔ stays a character, so it needs "︎" (text style) after it.
for (const path of ['/', '/project/flex-academy', '/experiments/karaoke-os']) {
  test(`no emoji arrows on ${path}`, async ({ page }) => {
    await page.goto(path);
    const text = await page.evaluate(() => document.body.textContent ?? '');
    expect(text).not.toContain('↗');
    expect(text.match(/↔(?!︎)/g)?.length ?? 0).toBe(0);
    expect(await page.locator('a[target="_blank"] svg.au').count()).toBeGreaterThan(0);
  });
}
