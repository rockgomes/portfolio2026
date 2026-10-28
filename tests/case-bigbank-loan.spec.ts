import { test, expect } from '@playwright/test';

// The Bigbank Loan flow case study (Figma sketch 458:736), on the case study template.
const PAGE = '/project/bigbank---loan-flow';

test('summary: title, subtitle, facts, problem, decision, result, and no buttons', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Loan flow');
  await expect(s.locator('.sub')).toHaveText('Bigbank · 2019 · loan application flow');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
  // No public link or prototype on the old page
  await expect(s.locator('[data-case-links]')).toHaveCount(0);
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(PAGE);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('the main picture is the card picture, with its caption', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('[data-live]')).toHaveCount(0);
  await expect(s.locator('[data-switch]')).toHaveCount(0);
  await expect(s.locator('figure img')).toHaveAttribute('alt', /Five phones on a blue background/);
  await expect(s.locator('figcaption')).toHaveText('The new application on mobile: personal details, the offer, additional data and the contract.');
});

test('sections of the sketch, in order', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['What I made', 'How I got there', 'What changed']);
  await expect(page.locator('#made [data-case-block] h3')).toHaveText(['Four steps, always in view', 'Change the offer without starting over', 'Short forms, one topic per screen']);
  await expect(page.locator('#process [data-case-block] h3')).toHaveText(['Ask clients and country managers', 'One design for every country']);
  await expect(page.locator('#process .pills li')).toHaveText(['clients', 'country managers']);
});

test('the steps tabs start on Review offer, and every step swaps the screen', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="steps"]');
  await expect(sw.getByRole('tab')).toHaveText(['Fill in application', 'Review offer', 'Additional data', 'Sign contract']);
  await expect(sw.getByRole('tab', { name: 'Review offer' })).toHaveAttribute('aria-selected', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('Step 2: the offer');
  await sw.getByRole('tab', { name: 'Fill in application' }).click();
  await expect(sw.getByRole('tab', { name: 'Fill in application' })).toHaveAttribute('aria-selected', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('Step 1: personal details');
  await sw.getByRole('tab', { name: 'Sign contract' }).click();
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('Step 4: a short loan summary');
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
  await sw.getByRole('tab', { name: 'Sign contract' }).press('ArrowLeft');
  await expect(sw.getByRole('tab', { name: 'Additional data' })).toBeFocused();
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('Step 3: payment and ID details');
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Challenge');
  await expect(page.locator('main')).not.toContainText('seamless');
});

test('result: outcome and what I learned', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#result [data-two-col] .k')).toHaveText(['outcome', 'what I learned']);
});

test('next case study is Financial Back-office', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('[data-next-case] .title a')).toHaveAttribute('href', '/project/bigbank---financial-backoffice');
});

test('no Figma layer on the page', async ({ page }) => {
  await page.goto(PAGE);
  for (const sel of ['[data-overlay]', '.cursor', '.sel', '.cm', '.thread', '.rl', '.dim', '.note', '[data-view-option]'])
    await expect(page.locator(`main ${sel}, header.hdr ${sel}`), sel).toHaveCount(0);
});

test('ids are unique', async ({ page }) => {
  await page.goto(PAGE);
  const dupes = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(dupes).toEqual([]);
});

for (const width of [320, 400]) {
  test(`no sideways scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto(PAGE);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the steps show Review offer only', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('[data-switch="steps"] [data-proof-panel]:visible')).toHaveCount(1);
    await expect(page.locator('[data-switch="steps"] [data-proof-panel]:visible figcaption')).toContainText('Step 2: the offer');
  });
});

// Screenshots, made by CI on the pull request (never commit local ones). The sections hold large photos, so each
// screenshot gets more time to settle.
test('looks the same as the approved screenshots', async ({ page }) => {
  test.slow();
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of ['[data-case-summary]', '#made', '#process', '#result', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`bigbank-loan-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`, { timeout: 15_000 });
});
