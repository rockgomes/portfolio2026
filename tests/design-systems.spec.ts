import { test, expect } from '@playwright/test';

// The four "how I build them" cards are small working tools.
// Scoped to #design-systems: the engineer view has its own copy of some parts (DesignSystemsDev.astro).
test.describe('design system cards', () => {
  test('the properties panel changes the button', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('#design-systems [data-btn]');
    await page.click('#design-systems [data-prop="variant"]');
    await expect(btn).toHaveAttribute('data-variant', 'Secondary');
    await expect(page.locator('#design-systems [data-prop="variant"]')).toHaveText('Secondary ▾');
    await page.click('#design-systems [data-prop="size"]');
    await expect(btn).toHaveAttribute('data-size', 'Large');
    await page.fill('#design-systems #ds-label', 'Export list');
    await expect(btn).toContainText('Export list');
    await page.click('#design-systems [data-prop="show"]');
    await expect(page.locator('#design-systems [data-prop="show"]')).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('#design-systems [data-icon]')).toBeHidden();
  });

  test('picking a variant updates the panel', async ({ page }) => {
    await page.goto('/');
    await page.click('#design-systems [data-set] .b[data-v="Ghost"][data-s="Disabled"]');
    await expect(page.locator('#design-systems [data-set] .b[data-v="Ghost"][data-s="Disabled"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#design-systems [data-prop="state"]')).toHaveText('Disabled ▾');
    await expect(page.locator('#design-systems [data-pick]')).toHaveText(' / Ghost, Disabled');
  });

  test('the rebrand swatch restyles the Primary buttons, the semantic token stays', async ({ page }) => {
    await page.goto('/');
    const primary = page.locator('#design-systems [data-set] .b[data-v="Primary"][data-s="Default"]');
    const before = await primary.evaluate((e) => getComputedStyle(e).backgroundColor);
    await page.click('#design-systems [data-rebrand]');
    await expect(page.locator('#design-systems [data-prim]')).toHaveText('blue.600');
    await expect(page.locator('#design-systems [data-chains] .chain').first().locator('.sem')).toHaveText('color.action.primary');
    await expect.poll(() => primary.evaluate((e) => getComputedStyle(e).backgroundColor)).not.toBe(before);
  });

  test('the mode switch flips this page', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.click('#design-systems [data-mode-switch]');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#design-systems [data-mode-switch]')).toHaveText('Switch this page to light');
    await expect(page.locator('#design-systems [data-theme-sample="dark"]')).toHaveAttribute('data-active', '');
  });
});
