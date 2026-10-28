import { test, expect } from '@playwright/test';

// The Inbank Customer Service Back-office case study (Figma sketch D, 442:10204), on the case study template.
const PAGE = '/project/inbank---customer-service-backoffice';

test('summary: title, subtitle, facts, problem, decision, result, and no buttons', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Customer Service Back-office');
  await expect(s.locator('.sub')).toHaveText('Inbank · 2024 · internal tool');
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

test('the main picture starts on After, and Before shows the old customer page', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-case-summary] [data-switch="ba"]');
  await expect(sw.getByRole('radio', { name: 'After' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /after the redesign/);
  await sw.getByRole('radio', { name: 'Before' }).click();
  await expect(sw.getByRole('radio', { name: 'Before' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /before the redesign/);
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
  await sw.getByRole('radio', { name: 'Before' }).press('ArrowRight');
  await expect(sw.getByRole('radio', { name: 'After' })).toBeFocused();
  await expect(sw.getByRole('radio', { name: 'After' })).toHaveAttribute('aria-checked', 'true');
});

test('sections of the sketch, in order', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Three decisions I would defend', 'How I got there', 'The parts behind it', 'What changed']);
  await expect(page.locator('#decisions [data-decision] h3')).toHaveText(['Records open beside the customer', 'Every status sits next to its fix', 'One search for every number']);
  await expect(page.locator('#process [data-case-block] h3')).toHaveText(['Map every screen before drawing one', 'Ask the people who use it, then check the data', 'A moodboard before the screens', 'Stay close to the build']);
  await expect(page.locator('#process .pills li')).toHaveText(['support agents', 'team leads', 'product managers', 'developers']);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('My Role');
});

test('parts: a pin outlines its part and marks its line, with no Light / Dark control', async ({ page }) => {
  await page.goto(PAGE);
  const ins = page.locator('#parts [data-inspect]');
  await expect(ins.locator('.ui-callout')).toHaveText([/Data card/, /Status pill/, /Table with a filter/, /Tabs with counts/]);
  await expect(ins.locator('[data-inspect-mode]')).toHaveCount(0);
  await expect(ins.locator('[data-inspect-panel]')).toHaveCount(0);
  await ins.locator('.layer .ui-pin').nth(1).click();
  await expect(ins.locator('.ui-callout').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(ins.locator('[data-layer="1"]')).toHaveClass(/on/);
  await ins.locator('.ui-callout').nth(3).click();
  await expect(ins.locator('.ui-callout').nth(1)).toHaveAttribute('aria-pressed', 'false');
  await expect(ins.locator('[data-layer="3"]')).toHaveClass(/on/);
});

test('result: outcome and what I learned', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#result [data-two-col] .k')).toHaveText(['outcome', 'what I learned']);
});

test('next case study is Hire Purchase checkout', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('[data-next-case] .title a')).toHaveAttribute('href', '/project/inbank---hire-purchase');
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
  test('the main picture shows After only', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('[data-switch="ba"] [data-proof-panel]:visible')).toHaveCount(1);
    await expect(page.locator('[data-switch="ba"] [data-proof-panel]:visible img')).toHaveAttribute('alt', /after the redesign/);
  });
});
