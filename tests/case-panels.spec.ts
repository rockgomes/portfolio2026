import { test, expect } from '@playwright/test';

// The Pipedrive Interactive Panels case study (Figma sketch 457:669), on the case study template.
const PAGE = '/project/pipedrive---interactive-panels';

test('summary: title, subtitle, facts, problem, decision, result, and the docs button', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Interactive Panels');
  await expect(s.locator('.sub')).toHaveText('Pipedrive · 2022 · integration platform');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
  await expect(s.locator('[data-facts] dd').last()).toHaveText('Figma');
  // One button: the Pipedrive developer docs for app panels, in a new tab
  const docs = s.locator('[data-case-links] a');
  await expect(docs).toHaveCount(1);
  await expect(docs).toHaveText('Pipedrive docs for app panels ↗');
  await expect(docs).toHaveAttribute('href', 'https://pipedrive.readme.io/docs/app-extensions-json-panels');
  await expect(docs).toHaveAttribute('target', '_blank');
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(PAGE);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('the main picture starts on After, and Before shows the old panel', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-case-summary] [data-switch="ba"]');
  await expect(sw.getByRole('radio', { name: 'After' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /^A panel after/);
  await sw.getByRole('radio', { name: 'Before' }).click();
  await expect(sw.getByRole('radio', { name: 'Before' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /^A panel before/);
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
  await sw.getByRole('radio', { name: 'Before' }).press('ArrowRight');
  await expect(sw.getByRole('radio', { name: 'After' })).toBeFocused();
  await expect(sw.getByRole('radio', { name: 'After' })).toHaveAttribute('aria-checked', 'true');
});

test('sections of the sketch, in order', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Two decisions I would defend', 'How I got there', 'What changed']);
  await expect(page.locator('#decisions [data-decision] h3')).toHaveText(['Actions sit next to the data they change', 'Show the main action and put the rest in a dropdown']);
  await expect(page.locator('#decisions [data-decision="1"] .pills li')).toHaveText(['object actions', 'field actions', 'global actions']);
  await expect(page.locator('#process [data-case-block] h3')).toHaveText(['Find out why actions were missed', 'Patterns that work for any app', 'Animated prototypes, then design support during the build']);
  await expect(page.locator('#process .pills li')).toHaveText(['usage data', 'expected actions', 'schema limits', 'action close to data', 'progressive disclosure', 'consistency across apps', 'scalability']);
});

test('decision 1: the prototype plays as a video with controls and a poster', async ({ page }) => {
  await page.goto(PAGE);
  const v = page.locator('#decisions [data-decision="1"] video[data-proof-video]');
  await expect(v).toHaveCount(1);
  await expect(v).toHaveAttribute('controls', '');
  await expect(v).toHaveAttribute('poster', '/media/projects/pipedrive---interactive-panels/app-actions.jpg');
  await expect(v.locator('source')).toHaveAttribute('src', '/media/projects/pipedrive---interactive-panels/app-actions.mp4');
  await expect(v).toHaveAttribute('aria-label', /Animation of a Trello panel/);
  const res = await page.request.get('/media/projects/pipedrive---interactive-panels/app-actions.mp4');
  expect(res.ok()).toBe(true);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Core principles');
  await expect(page.locator('main img[src$=".gif"]')).toHaveCount(0);
});

test('result: outcome and what I learned', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#result [data-two-col] .k')).toHaveText(['outcome', 'what I learned']);
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
  test('the main picture shows After only', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('[data-switch="ba"] [data-proof-panel]:visible')).toHaveCount(1);
    await expect(page.locator('[data-switch="ba"] [data-proof-panel]:visible img')).toHaveAttribute('alt', /^A panel after/);
  });
});

// Screenshots, made by CI on the pull request (never commit local ones). With reduced motion the video shows its poster.
test('looks the same as the approved screenshots', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of ['[data-case-summary]', '#decisions', '#process', '#result', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`panels-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`, { mask: [page.locator('[data-proof-video]')] });
});
