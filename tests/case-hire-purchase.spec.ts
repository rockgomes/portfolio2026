import { test, expect } from '@playwright/test';

// The Inbank Hire Purchase checkout case study (Figma sketch 454:435), on the case study template.
const PAGE = '/project/inbank---hire-purchase';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Hire Purchase checkout');
  await expect(s.locator('.sub')).toHaveText('Inbank · 2023 · checkout redesign');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(PAGE);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('one button opens the live mockup', async ({ page }) => {
  await page.goto(PAGE);
  const a = page.locator('[data-case-links] a');
  await expect(a).toHaveText(['Open the live mockup ↗']);
  await expect(a.first()).toHaveAttribute('href', 'https://inbank-loan-app.vercel.app/');
  await expect(a.first()).toHaveClass(/btn-primary/);
});

test('the main picture starts on After, and Before shows the old first screen', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-case-summary] [data-switch="ba"]');
  await expect(sw.getByRole('radio', { name: 'After' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /^The new first screen/);
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('The payment plan comes first');
  await sw.getByRole('radio', { name: 'Before' }).click();
  await expect(sw.getByRole('radio', { name: 'Before' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /^The old first screen/);
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
  await sw.getByRole('radio', { name: 'Before' }).press('ArrowRight');
  await expect(sw.getByRole('radio', { name: 'After' })).toBeFocused();
  await expect(sw.getByRole('radio', { name: 'After' })).toHaveAttribute('aria-checked', 'true');
});

test('sections of the sketch, in order', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Three decisions I would defend', 'Try the flow', 'How I got there', 'What changed']);
  await expect(page.locator('#decisions [data-decision] h3')).toHaveText(['Mobile sets the structure', 'The payment plan comes first', 'One pattern, many outcomes']);
  await expect(page.locator('#decisions .pills li')).toHaveText(['mobile first', 'desktop from the same structure', 'new and returning customers', 'several ID methods', 'country rules']);
  await expect(page.locator('#process [data-case-block] h3')).toHaveText(['Map the whole journey first', 'Learn the rules with product and analytics', 'Country rules inside one structure', 'Stay close to the build']);
  await expect(page.locator('#process [data-case-block] .label')).toHaveText(['audit', 'research', 'flows', 'delivery']);
  await expect(page.locator('#process .pills li')).toHaveText(['country rules', 'data and edge cases', 'new and returning customers']);
});

test('the map switch starts on The map I made, and swaps to The map I found', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="map"]');
  await expect(sw.getByRole('radio', { name: 'The map I made' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('My map: every step and decision');
  await sw.getByRole('radio', { name: 'The map I found' }).click();
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('How the flow was mapped before I arrived');
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
});

test('the flow tabs start on Main flow, and swap to the Estonian AIS flow', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="flow"]');
  await expect(sw.getByRole('tab', { name: 'Main flow' })).toHaveAttribute('aria-selected', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('The main flow in eight stages');
  await sw.getByRole('tab', { name: 'Estonia · AIS flow' }).click();
  await expect(sw.getByRole('tab', { name: 'Estonia · AIS flow' })).toHaveAttribute('aria-selected', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('The Estonian AIS flow');
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
});

test('the payment plan comes first: a pin outlines its part and shows its note under it', async ({ page }) => {
  await page.goto(PAGE);
  const ins = page.locator('[data-decision="2"] [data-inspect]');
  await expect(ins.locator('.callouts .ui-callout')).toHaveText([/monthly payment is the largest/, /Down payment and payment day/, /Amount, merchant and payment method/, /Continue is the only strong colour/]);
  await expect(ins.locator('[data-inspect-mode]')).toHaveCount(0);
  await expect(ins.locator('[data-note]:visible')).toHaveCount(0);
  await ins.locator('.layer .ui-pin').nth(1).click();
  await expect(ins.locator('.callouts .ui-callout').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(ins.locator('[data-layer="1"]')).toHaveClass(/on/);
  const note = ins.locator('[data-note="1"]');
  await expect(note).toBeVisible();
  const layer = (await ins.locator('[data-layer="1"]').boundingBox())!;
  const box = (await note.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(layer.y + layer.height);
  await ins.locator('.callouts .ui-callout').nth(3).click();
  await expect(ins.locator('.callouts .ui-callout').nth(1)).toHaveAttribute('aria-pressed', 'false');
  await expect(ins.locator('[data-layer="3"]')).toHaveClass(/on/);
  await expect(ins.locator('[data-note="3"]')).toBeVisible();
  await expect(note).toBeHidden();
});

test('result: outcome and what I learned', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#result [data-two-col] .k')).toHaveText(['outcome', 'what I learned']);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Core design principles');
  await expect(page.locator('main iframe:not([data-live] iframe)')).toHaveCount(0);
});

test('the live mockup: the coded prototype, framed under the decisions', async ({ page }) => {
  await page.goto(PAGE);
  const live = page.locator('#live [data-live]');
  await expect(live).toHaveCount(1);
  await expect(live.locator('iframe')).toHaveAttribute('src', 'https://inbank-loan-app.vercel.app/');
  await expect(live.locator('.addr')).toHaveText('inbank-loan-app.vercel.app');
  await expect(live.locator('figcaption')).toContainText('made with Claude');
  await expect(live.locator('img.still')).toHaveAttribute('src', '/media/projects/inbank---hire-purchase/live.jpg');
});

test('facts: Senior Product Designer, the four countries, the team and the tools', async ({ page }) => {
  await page.goto(PAGE);
  const dd = page.locator('[data-case-summary] [data-facts] dd');
  await expect(dd.nth(0)).toContainText('Senior Product Designer');
  await expect(dd.nth(1)).toContainText('Estonia, Latvia, Lithuania and Czechia');
  await expect(dd.nth(1)).toContainText('I was the only designer');
  await expect(dd.nth(3)).toHaveText('Figma for the design. Claude for the coded prototype.');
  await expect(page.locator('main')).not.toContainText('NN');
  await expect(page.locator('main')).not.toContainText('No numbers I can share');
});

test('next case study is Pipedrive App management', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('[data-next-case] .title a')).toHaveAttribute('href', '/project/pipedrive---app-management');
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
    await expect(page.locator('[data-switch="ba"] [data-proof-panel]:visible img')).toHaveAttribute('alt', /^The new first screen/);
  });
});

// Screenshots, made by CI on the pull request (never commit local ones)
test('looks the same as the approved screenshots', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of ['[data-case-summary]', '#decisions', '#process', '#result', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`hire-purchase-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`);
});
