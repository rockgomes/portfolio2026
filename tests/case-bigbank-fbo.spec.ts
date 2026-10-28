import { test, expect } from '@playwright/test';

// The Bigbank Financial Back-office case study (Figma sketch 459:784), on the case study template.
const PAGE = '/project/bigbank---financial-backoffice';

test('summary: title, subtitle, facts, problem, decision, result, and no buttons', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Financial Back-office');
  await expect(s.locator('.sub')).toHaveText('Bigbank · 2018 · internal tool');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
  // An internal tool: nothing public to open
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
  const main = page.locator('[data-case-summary] [data-proof]');
  await expect(main).toHaveCount(1);
  await expect(main.locator('img')).toHaveAttribute('alt', /Screens of the Financial Back-office at an angle/);
  await expect(main.locator('img')).toHaveAttribute('src', /bigbank-fbo/);
  await expect(main.locator('figcaption')).toHaveText('Screens of the Financial Back-office: lookup values, an invoice, a cost report and transactions.');
  await expect(page.locator('[data-case-summary] [data-live], [data-case-summary] [data-switch]')).toHaveCount(0);
});

test('sections of the sketch, in order', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['What I made', 'How I got there', 'What changed']);
  await expect(page.locator('#made [data-case-block] h3')).toHaveText(['Every list works the same way', 'Search opens beside the table', 'Long documents in clear groups', 'Many transactions on one screen']);
  await expect(page.locator('#made [data-case-block] .label')).toHaveText(['lists', 'search', 'forms', 'transactions']);
  await expect(page.locator('#process [data-case-block] h3')).toHaveText(['Working with the accountants every week']);
  await expect(page.locator('#process .pills li')).toHaveText(['developers', 'analysts', 'PMs', 'accountants']);
});

test('lists: a pin outlines its part and shows its note under it', async ({ page }) => {
  await page.goto(PAGE);
  const ins = page.locator('#made [data-inspect]');
  await expect(ins.locator('.callouts .ui-callout')).toHaveText([/Active filters as chips/, /Page actions in one place/, /Row actions on the selected row/, /Pages and items per page/]);
  await expect(ins.locator('[data-inspect-mode]')).toHaveCount(0);
  await expect(ins.locator('[data-note]:visible')).toHaveCount(0);
  await ins.locator('.layer .ui-pin').nth(2).click();
  await expect(ins.locator('.callouts .ui-callout').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(ins.locator('[data-layer="2"]')).toHaveClass(/on/);
  await expect(ins.locator('[data-note="2"]')).toBeVisible();
  await expect(ins.locator('[data-note="2"]')).toContainText('view, edit, delete');
  await ins.locator('.callouts .ui-callout').nth(0).click();
  await expect(ins.locator('.callouts .ui-callout').nth(2)).toHaveAttribute('aria-pressed', 'false');
  await expect(ins.locator('[data-layer="0"]')).toHaveClass(/on/);
  await expect(ins.locator('[data-note]:visible')).toHaveCount(1);
});

test('the search switch starts on Open, and Closed shows the table alone', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="search"]');
  await expect(sw.getByRole('radio', { name: 'Open' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toHaveText('Search open: the fields are next to the table.');
  await sw.getByRole('radio', { name: 'Closed' }).click();
  await expect(sw.getByRole('radio', { name: 'Closed' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toHaveText('Search closed: the table uses the full width.');
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
});

test('the document tabs start on Cost report, and Incoming invoice shows the invoice', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="document"]');
  await expect(sw.getByRole('tab', { name: 'Cost report' })).toHaveAttribute('aria-selected', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /A cost report in three groups/);
  await sw.getByRole('tab', { name: 'Incoming invoice' }).click();
  await expect(sw.getByRole('tab', { name: 'Incoming invoice' })).toHaveAttribute('aria-selected', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /An invoice preview page/);
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('What is Bigbank?');
});

test('result: outcome and what I learned', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#result [data-two-col] .k')).toHaveText(['outcome', 'what I learned']);
});

test('next case study is the Fieldset experiment', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('[data-next-case] .title a')).toHaveAttribute('href', '/experiments/fieldset');
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
  test('each switch shows its first choice only', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('[data-switch="search"] [data-proof-panel]:visible img')).toHaveAttribute('alt', /search panel open/);
    await expect(page.locator('[data-switch="document"] [data-proof-panel]:visible img')).toHaveAttribute('alt', /A cost report/);
  });
});

// Screenshots, made by CI on the pull request (never commit local ones).
test('looks the same as the approved screenshots', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of ['[data-case-summary]', '#made', '#process', '#result', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`bigbank-fbo-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`);
});
