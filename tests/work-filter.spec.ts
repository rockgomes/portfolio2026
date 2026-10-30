import { test, expect } from '@playwright/test';

// On small screens the panel is folded into a "Filter projects" button; open it first.
const openFilters = async (page: any) => { const t = page.locator('[data-filter-toggle]'); if (await t.isVisible()) await t.click(); };

test.describe('Projects filter', () => {
  const cards = (page: any) => page.locator('[data-grid] > .card:not([hidden])');
  test('starts with everything, nothing selected', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-filter-count]')).toHaveText('15 / 15');
    await expect(cards(page)).toHaveCount(15);
  });
  test('same group adds, different groups narrow, zero results are disabled', async ({ page }) => {
    await page.goto('/'); await openFilters(page);
    await page.click('.row[data-key="industry"][data-val="Fintech"]');
    await expect(page.locator('[data-filter-count]')).toHaveText('4 / 15');
    await page.click('.row[data-key="industry"][data-val="SaaS"]');
    await expect(page.locator('[data-filter-count]')).toHaveText('9 / 15');
    await expect(page.locator('.row[data-key="type"][data-val="experiment"]')).toBeDisabled();
  });
  test('filtering hides cards and shows them again', async ({ page }) => {
    await page.goto('/'); await openFilters(page);
    await page.click('.row[data-key="type"][data-val="experiment"]');
    await expect(cards(page)).toHaveCount(5);
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"]')).toBeHidden();
    await page.click('.row[data-key="type"][data-val="all"]');
    await expect(cards(page)).toHaveCount(15);
    await expect(page.locator('.card[data-id="dealfront-dynamic-lists"]')).toBeVisible();
  });
  test('filters live in the URL', async ({ page }) => {
    await page.goto('/?type=experiment#work'); await openFilters(page);
    await expect(page.locator('[data-filter-count]')).toHaveText('5 / 15');
    await page.click('.row[data-key="type"][data-val="all"]');
    await expect(page).not.toHaveURL(/type=/);
  });
  test('on small screens the panel folds into a button, and "Show N projects" closes it', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) > 1040, 'small screens only');
    await page.goto('/');
    await expect(page.locator('[data-filter-panel]')).toBeHidden();
    await page.click('[data-filter-toggle]');
    await page.click('.row[data-key="type"][data-val="experiment"]');
    await expect(page.locator('[data-filter-panel] [data-filter-show]')).toHaveText('Show 5 projects');
    await expect(page.locator('[data-filter-toggle-count]')).toHaveText('5 / 15');
    await page.click('[data-filter-panel] [data-filter-show]');
    await expect(page.locator('[data-filter-panel]')).toBeHidden();
  });
  test('engineer view: the filter as a terminal, with a prompt that finds a tag', async ({ page, viewport }) => {
    await page.goto('/?view=engineer#work');
    if ((viewport?.width ?? 0) <= 1040) await page.click('[data-filter-toggle]');
    const dev = page.locator('[data-dev-panel]');
    await expect(page.locator('[data-filter-panel]')).toBeHidden();
    // A flag value is a switch; the command line shows it
    const fintech = dev.locator('button.ln[data-key="industry"][data-val="Fintech"]');
    await fintech.click();
    await expect(fintech).toHaveAttribute('aria-checked', 'true');
    await expect(dev.locator('[data-dev-count]')).toHaveText('4 / 15');
    await expect(page).toHaveURL(/industry=fintech/);
    await expect(dev.locator('[data-dev-body]')).toContainText('ls work --type=all --industry=fintech');
    // The prompt is a real input: typing hides the values that do not match, Escape clears it
    const search = dev.getByRole('textbox', { name: 'Find a tag' });
    await search.fill('fin');
    await expect(fintech).toBeVisible();
    await expect(dev.locator('button.ln[data-key="type"]')).toHaveCount(0);
    await search.fill('zzz');
    await expect(dev.locator('[data-dev-body]')).toContainText('no tag matches "zzz"');
    await search.press('Escape');
    await expect(search).toHaveValue('');
    await expect(dev.locator('button.ln[data-key="type"]')).toHaveCount(3);
    await fintech.click();
    await expect(dev.locator('[data-dev-count]')).toHaveText('15 / 15');
  });
});
