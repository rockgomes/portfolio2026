import { test, expect } from '@playwright/test';

// The Fieldset experiment (Figma sketch 11, 462:858), on the lighter experiment template: summary with the live demo,
// one section, no "How I got there" or "What changed".
const PAGE = '/experiments/fieldset';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Filter builder');
  await expect(s.locator('.sub')).toHaveText('Fieldset · 2026 · experiment');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(PAGE);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('buttons open the live demo and the source code', async ({ page }) => {
  await page.goto(PAGE);
  const a = page.locator('[data-case-links] a');
  await expect(a).toHaveText(['Open the live demo ↗', 'Source code ↗']);
  await expect(a.nth(0)).toHaveAttribute('href', 'https://fieldset-filter-builder.netlify.app');
  await expect(a.nth(0)).toHaveClass(/btn-primary/);
  await expect(a.nth(1)).toHaveAttribute('href', 'https://github.com/rockgomes/filter-builder');
});

// No screen recording: on phones the still picture shows, and there is nothing to reload
test('live demo: iframe on desktop, still picture on phones', async ({ page, viewport }) => {
  await page.goto(PAGE);
  const live = page.locator('[data-live]');
  await expect(live.locator('.addr')).toHaveText('fieldset-filter-builder.netlify.app');
  await expect(live.locator('figcaption')).toHaveText('The live demo. Flip 5k to 50k and scroll.');
  await expect(live.locator('video')).toHaveCount(0);
  const reload = live.getByRole('button', { name: 'Reload the live page' });
  if ((viewport?.width ?? 0) >= 1200) {
    await expect(live.locator('iframe')).toBeVisible();
    await expect(live.locator('.still')).toBeHidden();
    await expect(reload).toBeVisible();
  } else {
    await expect(live).toHaveAttribute('data-phone', '');
    await expect(live.locator('.still')).toBeVisible();
    await expect(live.locator('iframe')).toBeHidden();
    await expect(reload).toBeHidden();
  }
});

test('one section, in the order of the sketch', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Four things it does differently']);
  await expect(page.locator('#differently [data-case-block] h3')).toHaveText(['206 selected, 173 still match', 'Edits survive a switch', 'A deleted field does not break a view', 'A way back that cannot break', 'The logic has no React near it']);
  await expect(page.locator('#differently .pills li')).toHaveText(['React', 'TypeScript', 'Vitest', 'no backend']);
});

test('the selection switch starts on Filter changed, and Selected shows the selection', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="selection"]');
  await expect(sw.getByRole('radio', { name: 'Filter changed' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('The app shows both numbers and asks');
  await sw.getByRole('radio', { name: 'Selected' }).click();
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('All 206 matching rows selected');
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Try these in the demo');
});

test('no Figma layer on the page', async ({ page }) => {
  await page.goto(PAGE);
  for (const sel of ['[data-overlay]', '.cursor', '.sel', '.cm', '.thread', '.rl', '.dim', '.note', '[data-view-option]'])
    await expect(page.locator(`main ${sel}, header.hdr ${sel}`), sel).toHaveCount(0);
});

for (const width of [320, 400]) {
  test(`no sideways scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto(PAGE);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

// Screenshots, made by CI on the pull request (never commit local ones). The live demo is another site, so it is masked.
test('looks the same as the approved screenshots', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of ['[data-case-summary]', '#differently', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`fieldset-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`, { mask: [page.locator('[data-live] iframe')] });
});
