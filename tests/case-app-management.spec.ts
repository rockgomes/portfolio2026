import { test, expect } from '@playwright/test';

// The Pipedrive App Management case study (Figma frame 455:523), on the case study template.
const PAGE = '/project/pipedrive---app-management';

test('summary: title, subtitle, facts, problem, decision, result, and two link buttons', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('App Management');
  await expect(s.locator('.sub')).toHaveText('Pipedrive · 2021 · developer platform');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
  await expect(s.locator('[data-facts] dd').last()).toHaveText('Figma, Miro');
  // The public docs for this project, then the developer site
  const links = s.locator('[data-case-links] a');
  await expect(links).toHaveText(['App extensions docs', 'Pipedrive developer site']);
  await expect(links.nth(0)).toHaveAttribute('href', 'https://pipedrive.readme.io/docs/app-extensions-json-panels');
  await expect(links.nth(1)).toHaveAttribute('href', 'https://developers.pipedrive.com/');
  await expect(s).not.toContainText('No numbers');
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(PAGE);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('the main picture is the app extensions page, with its caption, not the card picture', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('[data-live]')).toHaveCount(0);
  await expect(s.locator('[data-switch]')).toHaveCount(0);
  const proof = s.locator('[data-proof]');
  await expect(proof).toHaveCount(1);
  await expect(proof.locator('img')).toHaveAttribute('alt', /^The app extensions page: Actions and JSON panels/);
  await expect(proof.locator('img')).toHaveAttribute('src', /case-hero/);
  await expect(proof.locator('figcaption')).toHaveText('The app extensions page: Actions and JSON panels at the top, Custom UI extensions (iframes) in their own section below.');
});

test('sections of the sketch, in order', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Two decisions I would defend', 'How I got there', 'One form for each extension', 'What changed']);
  await expect(page.locator('#decisions [data-decision] h3')).toHaveText(['Group the options by how they are built', 'A small drawing for each option']);
  await expect(page.locator('#decisions .pills li')).toHaveText(['based on developer feedback']);
  await expect(page.locator('#process [data-case-block] h3')).toHaveText(['Start from research we already had', 'Flows first, with the PM and engineers']);
  await expect(page.locator('#process .pills li')).toHaveText(['market study', 'HVC buying criteria', 'trial company research']);
  await expect(page.locator('#forms [data-case-block] h3')).toHaveText(['Short forms, with the limits under each field']);
});

test('decision 1: a pin outlines its part and shows its note right under it', async ({ page }) => {
  await page.goto(PAGE);
  const ins = page.locator('#decisions [data-inspect]');
  await expect(ins.locator('.callouts .ui-callout')).toHaveText([/^1Actions:/, /^2JSON panels:/, /^3Custom UI extensions:/]);
  await expect(ins.locator('[data-inspect-mode]')).toHaveCount(0);
  await expect(ins.locator('[data-note]:visible')).toHaveCount(0);
  for (const i of [0, 1, 2]) {
    await ins.locator('.layer .ui-pin').nth(i).click();
    await expect(ins.locator('.callouts .ui-callout').nth(i)).toHaveAttribute('aria-pressed', 'true');
    await expect(ins.locator(`[data-layer="${i}"]`)).toHaveClass(/on/);
    const note = ins.locator(`[data-note="${i}"]`);
    await expect(note).toBeVisible();
    await expect(ins.locator('[data-note]:visible')).toHaveCount(1);
    const layer = (await ins.locator(`[data-layer="${i}"]`).boundingBox())!;
    const box = (await note.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(layer.y + layer.height);
    // Inside the picture, so its frame never cuts it
    const stage = (await ins.locator('.stage').boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width);
    expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height);
  }
  await ins.locator('.callouts .ui-callout').nth(0).click();
  await expect(ins.locator('.callouts .ui-callout').nth(2)).toHaveAttribute('aria-pressed', 'false');
  await expect(ins.locator('[data-layer="0"]')).toHaveClass(/on/);
});

test('the form tabs start on Action, and each tab swaps the form', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="form"]');
  await expect(sw.getByRole('tab')).toHaveText(['Action', 'JSON panel', 'Custom panel', 'Custom modal']);
  await expect(sw.getByRole('tab', { name: 'Action' })).toHaveAttribute('aria-selected', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /^The Action form/);
  for (const [name, alt] of [['JSON panel', /^The JSON panel form/], ['Custom panel', /^The Custom surface panel form/], ['Custom modal', /^The Custom surface modal form/]] as const) {
    await sw.getByRole('tab', { name, exact: true }).click();
    await expect(sw.getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', alt);
    await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
  }
  await sw.getByRole('tab', { name: 'Custom modal' }).press('ArrowLeft');
  await expect(sw.getByRole('tab', { name: 'Custom panel' })).toBeFocused();
  await expect(sw.getByRole('tab', { name: 'Custom panel' })).toHaveAttribute('aria-selected', 'true');
});

test('result: outcome and what I learned', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#result [data-two-col] .k')).toHaveText(['outcome', 'what I learned']);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Problem Statement');
});

test('next case study is Loan flow', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('[data-next-case] .title a')).toHaveAttribute('href', '/project/bigbank---loan-flow');
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
  test('the form tabs show the Action form only', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('[data-switch="form"] [data-proof-panel]:visible')).toHaveCount(1);
    await expect(page.locator('[data-switch="form"] [data-proof-panel]:visible img')).toHaveAttribute('alt', /^The Action form/);
  });
});

// Screenshots, made by CI on the pull request (never commit local ones).
test('looks the same as the approved screenshots', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => {}))); });
  for (const sel of ['[data-case-summary]', '#decisions', '#process', '#forms', '#result', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`app-management-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`, { timeout: 15_000 });
});
