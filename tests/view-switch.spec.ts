import { test, expect } from '@playwright/test';

test('audience switch sets the view and the URL', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-view-option="engineer"]');
  await expect(page.locator('html')).toHaveAttribute('data-view', 'engineer');
  await expect(page).toHaveURL(/view=engineer/);
  await page.goto('/?view=recruiter');
  await expect(page.locator('html')).toHaveAttribute('data-view', 'recruiter');
  await expect(page.locator('[data-view-option="recruiter"]')).toHaveAttribute('aria-checked', 'true');
});
