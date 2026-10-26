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
  test('a visitor can save their own view', async ({ page }) => {
    await expect(page.locator('[data-save-view]')).toBeHidden();
    await page.click('[data-rm]');
    await page.click('[data-add]'); await page.getByRole('menuitem', { name: 'Employees more than 500' }).click();
    await page.click('[data-save-view]');
    const tab = page.getByRole('tab', { name: 'Over 500 people' });
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-save-view]')).toBeHidden();
    await page.reload();
    await expect(page.getByRole('tab', { name: 'Over 500 people' })).toHaveAttribute('aria-selected', 'true');
    await expect(count(page)).toHaveText('22');
  });
  test('the Columns menu hides and shows columns, and remembers it', async ({ page }) => {
    await page.click('[data-columns]');
    await expect(page.locator('[data-cols-menu]')).toBeVisible();
    await expect(page.locator('[data-col-toggle="company"]')).toBeDisabled();
    await page.click('[data-col-toggle="industry"]');
    await expect(page.locator('[data-col-toggle="industry"]')).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('th[data-col="industry"]')).toBeHidden();
    await expect(page.locator('[data-rows] td[data-col="industry"]').first()).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-cols-menu]')).toBeHidden();
    await expect(page.locator('[data-columns]')).toBeFocused();
    await page.reload();
    await expect(page.locator('th[data-col="industry"]')).toBeHidden();
    await page.click('[data-columns]'); await page.click('[data-col-toggle="industry"]');
    await expect(page.locator('th[data-col="industry"]')).toBeVisible();
  });
  test('sorting and saved state survive a reload', async ({ page }) => {
    await page.click('[data-sort="employees"]');
    await expect(page.locator('th[data-col="employees"]')).toHaveAttribute('aria-sort', 'ascending');
    await page.reload();
    await expect(page.locator('th[data-col="employees"]')).toHaveAttribute('aria-sort', 'ascending');
  });
});

test.describe('hero story', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'the story only plays on wide screens');

  test('clicking the table skips to the end state and saves nothing', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-tabs] .tab')).toHaveCount(2); // the story starts before the view exists
    await page.locator('[data-count]').click();
    await expect(page.locator('[data-count]')).toHaveText('28');
    await expect(page.getByRole('tab', { name: 'ICP · Not churned' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-story-thread]')).toHaveAttribute('data-state', 'end');
    expect(await page.evaluate(() => localStorage.getItem('rg-hero-table'))).toBeNull();
  });

  test('the resolved comment opens and folds the conversation', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-count]').click();
    const toggle = page.locator('[data-resolved]');
    await expect(toggle).toContainText('Show');
    await expect(page.locator('[data-story-thread] [data-msg]:visible')).toHaveCount(1);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toContainText('Hide');
    await expect(page.locator('[data-story-thread] [data-msg]:visible')).toHaveCount(4);
    await toggle.click();
    await expect(page.locator('[data-story-thread] [data-msg]:visible')).toHaveCount(1);
  });
});
