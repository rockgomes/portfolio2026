import { test, expect } from '@playwright/test';

// The "Recruiter" view: a one-page summary instead of the homepage content.
test('the recruiter view replaces the homepage and links back', async ({ page }) => {
  await page.goto('/?view=recruiter');
  await expect(page.locator('[data-recruiter]')).toBeVisible();
  await expect(page.locator('.hero')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Senior Product Designer.');
  await expect(page.locator('[data-recruiter] .work li')).toHaveCount(5);
  // Below the summary: Numbers, Experience and About, without the work and design systems sections
  for (const sel of ['.numbers', '#experience', '#about']) await expect(page.locator(sel)).toBeVisible();
  for (const sel of ['#work', '#design-systems']) await expect(page.locator(sel)).toBeHidden();
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

test('Download CV links to the PDF, which is served', async ({ page, request }) => {
  await page.goto('/?view=recruiter');
  const link = page.locator('[data-recruiter] a.cv');
  await expect(link).toHaveAttribute('href', '/Rock_Gomes_CV.pdf');
  const r = await request.get('/Rock_Gomes_CV.pdf');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-type']).toContain('pdf');
});

// Each view has its own accent: blue for design lead, violet for recruiter (light theme).
test('the recruiter view uses the violet accent', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/?view=recruiter');
  const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-annotation-measure').trim());
  expect(await accent()).toBe('#6e5be8');
  await page.locator('[data-view-option="design"]').click();
  expect(await accent()).toBe('#1b6fe3');
});

// In dark mode each view keeps its own accent: cyan, light green, light violet.
test('each view has its own accent in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-annotation-measure').trim());
  for (const [view, colour] of [['design', '#4fd3ea'], ['engineer', '#3dd68c'], ['recruiter', '#a98bfa']]) {
    await page.goto(`/?view=${view}`);
    expect(await accent()).toBe(colour);
  }
});

// The recruiter view is sober: the shared sections lose their designer layer there (Figma 94:6774).
test('the recruiter view has no designer layer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?view=recruiter');
  const hidden = ['#experience .num', '#experience .dim', '#experience .exp-thread', '#about .num', '#about .dim', '#about .sh .sub', '#about .tag', '#about .facts', '#about [data-overlay]'];
  for (const sel of hidden) for (const el of await page.locator(sel).all()) await expect(el, sel).toBeHidden();
  await expect(page.locator('#experience h2')).toHaveCSS('font-size', '44px');
  await page.goto('/?view=design');
  await expect(page.locator('#experience .exp-thread')).toBeVisible();
  await expect(page.locator('#about .facts')).toBeVisible();
});
