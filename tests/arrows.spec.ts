import { test, expect } from '@playwright/test';

// iPhones draw ↗ and ↔ as colour emoji unless "︎" (text style) follows them. Every arrow on these pages must have it.
for (const path of ['/', '/project/flex-academy', '/experiments/karaoke-os']) {
  test(`arrows stay plain text on ${path}`, async ({ page }) => {
    await page.goto(path);
    const bare = await page.evaluate(() => (document.body.textContent ?? '').match(/[↗↔](?!︎)/g)?.length ?? 0);
    expect(bare).toBe(0);
  });
}
