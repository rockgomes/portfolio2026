import { test, expect } from '@playwright/test';

// No sideways scroll on wide screens, in any view. Overlays show from 1200px, where the comments
// used to stick out past the edge (they are placed for 1440px and now move with their card or table).
for (const width of [1200, 1240, 1280, 1320, 1440, 1920]) {
  test(`no sideways scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const view of ['design', 'engineer', 'recruiter']) {
      await page.goto(`/?view=${view}`);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(over, `${view} view`).toBe(0);
    }
  });
}
