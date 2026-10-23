import { test, expect } from '@playwright/test';

// The four "how I build them" cards are small working tools.
test.describe('design system cards', () => {
  test('the properties panel changes the button', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('[data-btn]');
    await page.click('[data-prop="variant"]');
    await expect(btn).toHaveAttribute('data-variant', 'Secondary');
    await expect(page.locator('[data-prop="variant"]')).toHaveText('Secondary ▾');
    await page.click('[data-prop="size"]');
    await expect(btn).toHaveAttribute('data-size', 'Large');
    await page.fill('#ds-label', 'Export list');
    await expect(btn).toContainText('Export list');
    await page.click('[data-prop="show"]');
    await expect(page.locator('[data-prop="show"]')).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('[data-icon]')).toBeHidden();
  });

  test('picking a variant updates the panel', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-set] .b[data-v="Ghost"][data-s="Disabled"]');
    await expect(page.locator('[data-set] .b[data-v="Ghost"][data-s="Disabled"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-prop="state"]')).toHaveText('Disabled ▾');
    await expect(page.locator('[data-pick]')).toHaveText(' / Ghost, Disabled');
  });

  test('the rebrand swatch restyles the Primary buttons, the semantic token stays', async ({ page }) => {
    await page.goto('/');
    const primary = page.locator('[data-set] .b[data-v="Primary"][data-s="Default"]');
    const before = await primary.evaluate((e) => getComputedStyle(e).backgroundColor);
    await page.click('[data-rebrand]');
    await expect(page.locator('[data-prim]')).toHaveText('blue.600');
    await expect(page.locator('[data-chains] .chain').first().locator('.sem')).toHaveText('color.action.primary');
    await expect.poll(() => primary.evaluate((e) => getComputedStyle(e).backgroundColor)).not.toBe(before);
  });

  test('the mode switch flips this page', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.click('[data-mode-switch]');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-mode-switch]')).toHaveText('Switch this page to light');
    await expect(page.locator('[data-theme-sample="dark"]')).toHaveAttribute('data-active', '');
  });
});
