import { test, expect } from '@playwright/test';

// Below 1040px the nav links live in a menu panel.
test('the menu opens, moves focus, and closes with Escape or a link', async ({ page, viewport }) => {
  await page.goto('/');
  const btn = page.locator('[data-menu-btn]');
  if ((viewport?.width ?? 0) > 1040) { await expect(btn).toBeHidden(); return; }
  await btn.click();
  await expect(page.locator('[data-menu]')).toBeVisible();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-menu-link]').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-menu]')).toBeHidden();
  await expect(btn).toBeFocused();
  await btn.click();
  await page.locator('[data-menu-link]', { hasText: 'About' }).click();
  await expect(page.locator('[data-menu]')).toBeHidden();
  await expect(page).toHaveURL(/#about$/);
});
