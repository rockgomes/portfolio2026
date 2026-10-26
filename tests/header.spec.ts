import { test, expect } from '@playwright/test';

// The header: one "Projects" link (client work and experiments are one list), and the view switch in the same place
// in every view, on every screen size.
test('the nav has one Projects link', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('header .nav, header .mpanel');
  await expect(nav.getByRole('link', { name: 'Projects', includeHidden: true }).first()).toHaveAttribute('href', '/#work');
  await expect(nav.getByRole('link', { name: /^(Work|Experiments)$/, includeHidden: true })).toHaveCount(0);
});

test('the view switch stays in the same place in every view', async ({ page }) => {
  const spots: { x: number; y: number }[] = [];
  for (const view of ['design', 'recruiter', 'engineer']) {
    await page.goto(`/?view=${view}`);
    spots.push((await page.locator('.switch .seg').boundingBox())!);
  }
  // Within 1px: the bold label of the chosen view is a little wider, so the centred switch can move by half a pixel
  for (const s of spots) { expect(Math.abs(s.x - spots[0].x)).toBeLessThanOrEqual(1); expect(Math.abs(s.y - spots[0].y)).toBeLessThanOrEqual(1); }
});
