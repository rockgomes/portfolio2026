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

// Nothing may reach below the footer: the About cursor used to end its (hidden) drag below it and add space.
test.describe('page end', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test('the page ends at the footer, also after the About animation', async ({ page }) => {
    await page.goto('/');
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500); // the portrait selection and its cursor finish
    await page.locator('footer.ftr').scrollIntoViewIfNeeded();
    const gap = await page.evaluate(() => document.documentElement.scrollHeight - Math.round(document.querySelector('footer.ftr')!.getBoundingClientRect().bottom + scrollY));
    expect(gap).toBeLessThanOrEqual(0);
  });
});

test('engineer view: the footer shows the build line instead of "Updated"', async ({ page }) => {
  await page.goto('/?view=engineer');
  const build = page.locator('footer [data-build]');
  await expect(build).toBeVisible();
  await expect(build).toHaveText(/^\S+ @ [0-9a-f]{7} · built \d{4}-\d{2}-\d{2} · Astro · Netlify$/);
  await expect(page.locator('footer .colophon').getByText('Updated')).toBeHidden();
  await page.goto('/?view=design');
  await expect(build).toBeHidden();
  await expect(page.locator('footer .colophon').getByText('Updated')).toBeVisible();
});

test.describe('engineer footer', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' }, permissions: ['clipboard-read', 'clipboard-write'] });
  test('<footer> tags instead of the ruler, no "You" cursor, and copying prints a status line', async ({ page }) => {
    await page.goto('/?view=engineer');
    const footer = page.locator('footer.ftr'); await footer.scrollIntoViewIfNeeded();
    await expect(footer.locator('.ftag').first()).toHaveText('<footer>');
    await expect(footer.locator('.ftag-close')).toHaveText('</footer>');
    await expect(footer.locator('[data-ruler]')).toBeHidden();
    const f = (await footer.boundingBox())!;
    await page.mouse.move(f.x + 300, f.y + 40); await page.mouse.move(f.x + 320, f.y + 90, { steps: 3 });
    await expect(footer).not.toHaveClass(/you-here/);
    await footer.locator('[data-copy]').click();
    await expect(footer.locator('[data-copied-dev]')).toHaveText('✓ copied to clipboard');
    await expect(page.locator('[data-copied]')).toBeHidden();
    await expect(footer.locator('[data-copied-dev]')).toBeHidden({ timeout: 4000 });
  });
});
