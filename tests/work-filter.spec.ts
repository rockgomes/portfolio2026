import { test, expect } from '@playwright/test';

// On small screens the panel is folded into a "Filter projects" button; open it first.
const openFilters = async (page: any) => { const t = page.locator('[data-filter-toggle]'); if (await t.isVisible()) await t.click(); };

test.describe('Selected work filter', () => {
  const cards = (page: any) => page.locator('[data-grid] > .card:not([hidden])');
  test('starts with everything, nothing selected', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-filter-count]')).toHaveText('14 / 14');
    await expect(cards(page)).toHaveCount(14);
  });
  test('same group adds, different groups narrow, zero results are disabled', async ({ page }) => {
    await page.goto('/'); await openFilters(page);
    await page.click('.row[data-key="industry"][data-val="Fintech"]');
    await expect(page.locator('[data-filter-count]')).toHaveText('4 / 14');
    await page.click('.row[data-key="industry"][data-val="SaaS"]');
    await expect(page.locator('[data-filter-count]')).toHaveText('6 / 14');
    await expect(page.locator('.row[data-key="type"][data-val="experiment"]')).toBeDisabled();
  });
  test('filtering hides cards and shows them again', async ({ page }) => {
    await page.goto('/'); await openFilters(page);
    await page.click('.row[data-key="type"][data-val="experiment"]');
    await expect(cards(page)).toHaveCount(4);
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"]')).toBeHidden();
    await page.click('.row[data-key="type"][data-val="all"]');
    await expect(cards(page)).toHaveCount(14);
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"]')).toBeVisible();
  });
  test('filters live in the URL', async ({ page }) => {
    await page.goto('/?type=experiment#work'); await openFilters(page);
    await expect(page.locator('[data-filter-count]')).toHaveText('4 / 14');
    await page.click('.row[data-key="type"][data-val="all"]');
    await expect(page).not.toHaveURL(/type=/);
  });
  test('on small screens the panel folds into a button, and "Show N projects" closes it', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) > 1040, 'small screens only');
    await page.goto('/');
    await expect(page.locator('[data-filter-panel]')).toBeHidden();
    await page.click('[data-filter-toggle]');
    await page.click('.row[data-key="type"][data-val="experiment"]');
    await expect(page.locator('[data-filter-show]')).toHaveText('Show 4 projects');
    await expect(page.locator('[data-filter-toggle-count]')).toHaveText('4 / 14');
    await page.click('[data-filter-show]');
    await expect(page.locator('[data-filter-panel]')).toBeHidden();
  });
});
