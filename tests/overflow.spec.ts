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

// The tests above run with reduced motion, so the hero story never plays in them. This one plays it at the
// narrowest width where the cursors show, and checks the page width all the way through.
test.describe('hero story', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'the story only plays on wide screens');

  test('no sideways scroll while the hero story plays at 1200px', async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    const thread = page.locator('[data-story-thread]');
    await expect(thread).toHaveAttribute('data-state', 'story', { timeout: 10_000 });
    let worst = 0;
    while ((await thread.getAttribute('data-state')) === 'story') {
      worst = Math.max(worst, await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
      await page.waitForTimeout(250);
    }
    expect(worst).toBe(0);
  });
});
