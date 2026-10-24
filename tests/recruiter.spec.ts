import { test, expect } from '@playwright/test';

// The "Recruiter" view: a one-page summary instead of the homepage content.
test('the recruiter view replaces the homepage and links back', async ({ page }) => {
  await page.goto('/?view=recruiter');
  await expect(page.locator('[data-recruiter]')).toBeVisible();
  await expect(page.locator('.hero')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Senior Product Designer.');
  await expect(page.locator('[data-recruiter] .work li')).toHaveCount(5);
  await page.locator('[data-view-link]').click();
  await expect(page.locator('html')).toHaveAttribute('data-view', 'design');
  await expect(page.locator('.hero')).toBeVisible();
});

test('the header switch opens the recruiter view', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-recruiter]')).toBeHidden();
  await page.locator('[data-view-option="recruiter"]').click();
  await expect(page.locator('[data-recruiter]')).toBeVisible();
  await expect(page).toHaveURL(/view=recruiter/);
});
