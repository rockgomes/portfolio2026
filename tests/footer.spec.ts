import { test, expect } from '@playwright/test';

// Footer (motion plan, moment 07): inside the footer, the visitor's pointer becomes the "You" cursor.
test.describe('footer pointer', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' }, permissions: ['clipboard-read', 'clipboard-write'] });
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'overlays only show on wide screens');

  test('the "You" cursor follows the mouse and leaves a comment on copy', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer.ftr'); await footer.scrollIntoViewIfNeeded();
    const f = (await footer.boundingBox())!;
    await page.mouse.move(f.x + 300, f.y + 40); await page.mouse.move(f.x + 320, f.y + 90, { steps: 3 });
    await expect(footer).toHaveClass(/you-here/);
    const tip = (await page.locator('footer .cursor.c-you .arrow').boundingBox())!;
    expect(Math.abs(tip.x + 1 - (f.x + 320))).toBeLessThan(2); expect(Math.abs(tip.y + 1 - (f.y + 90))).toBeLessThan(2);
    await page.locator('footer [data-copy]').click();
    await expect(page.locator('[data-copied]')).toBeVisible();
  });
});

// The ruler starts hidden and draws itself once the footer scrolls into view. It used to stay hidden for good
// when the footer was below the fold at load (Chrome counts a fully clipped element as 0% visible).
test.describe('footer ruler', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test('draws when the footer scrolls into view', async ({ page }) => {
    await page.goto('/');
    const ruler = page.locator('[data-ruler]');
    await expect(ruler).toHaveAttribute('style', /inset\(0px 100%/); // hidden while below the fold
    await page.locator('footer.ftr').scrollIntoViewIfNeeded();
    await expect.poll(() => ruler.evaluate((el) => (el as HTMLElement).style.clipPath), { timeout: 4000 }).toBe('');
  });
});
