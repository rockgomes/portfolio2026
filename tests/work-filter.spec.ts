import { test, expect } from '@playwright/test';

test.describe('Selected work filter', () => {
  const cards = (page: any) => page.locator('[data-grid] > .card:not([hidden])');
  test('starts with everything, nothing selected', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-filter-count]')).toHaveText('14 / 14');
    await expect(cards(page)).toHaveCount(14);
  });
  test('same group adds, different groups narrow, zero results are disabled', async ({ page }) => {
    await page.goto('/');
    await page.click('.row[data-key="industry"][data-val="Fintech"]');
    await expect(page.locator('[data-filter-count]')).toHaveText('4 / 14');
    await page.click('.row[data-key="industry"][data-val="SaaS"]');
    await expect(page.locator('[data-filter-count]')).toHaveText('6 / 14');
    await expect(page.locator('.row[data-key="type"][data-val="experiment"]')).toBeDisabled();
  });
  test('filtering hides cards and shows them again', async ({ page }) => {
    await page.goto('/');
    await page.click('.row[data-key="type"][data-val="experiment"]');
    await expect(cards(page)).toHaveCount(4);
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"]')).toBeHidden();
    await page.click('.row[data-key="type"][data-val="all"]');
    await expect(cards(page)).toHaveCount(14);
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"]')).toBeVisible();
  });
  test('filters live in the URL', async ({ page }) => {
    await page.goto('/?type=experiment#work');
    await expect(page.locator('[data-filter-count]')).toHaveText('4 / 14');
    await page.click('.row[data-key="type"][data-val="all"]');
    await expect(page).not.toHaveURL(/type=/);
  });
});
