import { test, expect } from '@playwright/test';

test.describe('hero table', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload(); });
  const count = (page: any) => page.locator('[data-count]');

  test('saved views change the result count', async ({ page }) => {
    await expect(count(page)).toHaveText('28');
    await page.click('[data-preset="all"]'); await expect(count(page)).toHaveText('40');
    await page.click('[data-preset="icp"]'); await expect(count(page)).toHaveText('28');
  });
  test('conditions can be removed and added', async ({ page }) => {
    await page.click('[data-rm]'); await expect(count(page)).toHaveText('40');
    await page.click('[data-add]'); await page.getByRole('menuitem', { name: 'Employees more than 500' }).click();
    await expect(count(page)).toHaveText('22');
  });
  test('the + Condition menu is closed on load', async ({ page }) => {
    await expect(page.locator('[data-add-menu]')).toBeHidden();
  });
  test('sorting and saved state survive a reload', async ({ page }) => {
    await page.click('[data-sort="employees"]');
    await expect(page.locator('th[data-col="employees"]')).toHaveAttribute('aria-sort', 'ascending');
    await page.reload();
    await expect(page.locator('th[data-col="employees"]')).toHaveAttribute('aria-sort', 'ascending');
  });
});
