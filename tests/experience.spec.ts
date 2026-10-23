import { test, expect } from '@playwright/test';

// Experience: independent work is one entry with a tab per client.
test('client tabs switch the details, with mouse and arrow keys', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#client-well')).toBeVisible();
  await expect(page.locator('#client-dealfront')).toBeHidden();
  await page.click('#client-tab-dealfront');
  await expect(page.locator('#client-tab-dealfront')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#client-dealfront')).toBeVisible();
  await expect(page.locator('#client-well')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#client-tab-romeo')).toBeFocused();
  await expect(page.locator('#client-romeo')).toBeVisible();
  await expect(page.locator('#experience')).not.toContainText('Δ');
});
