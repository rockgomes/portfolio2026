import { test, expect } from '@playwright/test';

// The Dealfront Dynamic Lists case study (Figma sketch 453:338), on the case study template: summary with the live
// demo (no screen recording, so a still picture on phones), three decisions, the process, and what changed.
const PAGE = '/project/dealfront-dynamic-lists';
const DEMO = 'https://dealfront-dynamic-lists-cd-7c276e015d.netlify.app';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Dynamic Lists');
  await expect(s.locator('.sub')).toHaveText('Dealfront · 2025 · product feature');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(PAGE);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('one button opens the live demo', async ({ page }) => {
  await page.goto(PAGE);
  const a = page.locator('[data-case-links] a');
  await expect(a).toHaveText(['Open the live demo ↗']);
  await expect(a.nth(0)).toHaveAttribute('href', DEMO);
  await expect(a.nth(0)).toHaveClass(/btn-primary/);
});

// No screen recording: on phones the still picture shows, and there is nothing to reload
test('live demo: iframe on desktop, still picture on phones', async ({ page, viewport }) => {
  await page.goto(PAGE);
  const live = page.locator('[data-live]');
  await expect(live.locator('.addr')).toHaveText('dealfront-dynamic-lists-cd-7c276e015d.netlify.app');
  await expect(live.locator('figcaption')).toHaveText('A working copy of the design, built with AI from the real Figma files. Not the real product. Filter the list, change columns, save views and switch between them.');
  await expect(live.locator('video')).toHaveCount(0);
  const reload = live.getByRole('button', { name: 'Reload the live page' });
  if ((viewport?.width ?? 0) >= 1200) {
    await expect(live.locator('iframe')).toBeVisible();
    await expect(live.locator('iframe')).toHaveAttribute('src', DEMO);
    await expect(live.locator('.still')).toBeHidden();
    await expect(reload).toBeVisible();
  } else {
    await expect(live).toHaveAttribute('data-phone', '');
    await expect(live.locator('.still')).toBeVisible();
    await expect(live.locator('iframe')).toBeHidden();
    await expect(reload).toBeHidden();
  }
});

test('sections of the sketch, in order', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Three decisions I would defend', 'How I got there', 'What changed']);
  await expect(page.locator('#decisions [data-decision] h3')).toHaveText(['Views belong to one list', 'Filters and columns are one idea', 'The state is always honest']);
  await expect(page.locator('#decisions [data-case-block] .label')).toHaveText(['decision 1 of 3', 'decision 2 of 3', 'decision 3 of 3']);
  await expect(page.locator('#decisions .pills li')).toHaveText(['dropped: a new list every time', 'dropped: views shared across lists', 'chosen: views inside their list']);
  await expect(page.locator('#process [data-case-block] h3')).toHaveText(['Five places for the controls', 'Filtering, kept simple', 'Something to try, not only to read']);
  await expect(page.locator('#process .pills li')).toHaveText(['sidebar', 'flyout', 'popup', 'side panel', 'tabbed modal', 'built with AI', 'guided tour']);
});

test('decision 2: the switch starts on Shipped, and Explored shows the tabbed modal', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="stage"]');
  await expect(sw.getByRole('radio', { name: 'Shipped' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('Save as new view');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('alt', /Save as new view modal/);
  await sw.getByRole('radio', { name: 'Explored' }).click();
  await expect(sw.getByRole('radio', { name: 'Explored' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('A road not taken');
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
});

test('decision 3: a pin outlines its part and shows its note under it', async ({ page }) => {
  await page.goto(PAGE);
  const ins = page.locator('#decisions [data-inspect]');
  await expect(ins.locator('.callouts .ui-callout')).toHaveText([/Filtered by/, /A dot on the filter icon/, /The view selector/, /Data is updated every hour/]);
  await expect(ins.locator('[data-inspect-mode]')).toHaveCount(0);
  await expect(ins.locator('[data-note]:visible')).toHaveCount(0);
  await ins.locator('.layer .ui-pin').nth(0).click();
  await expect(ins.locator('.callouts .ui-callout').nth(0)).toHaveAttribute('aria-pressed', 'true');
  await expect(ins.locator('[data-layer="0"]')).toHaveClass(/on/);
  const note = ins.locator('[data-note="0"]');
  await expect(note).toBeVisible();
  const layer = (await ins.locator('[data-layer="0"]').boundingBox())!;
  const box = (await note.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(layer.y + layer.height);
  await ins.locator('.callouts .ui-callout').nth(2).click();
  await expect(ins.locator('.callouts .ui-callout').nth(0)).toHaveAttribute('aria-pressed', 'false');
  await expect(ins.locator('[data-layer="2"]')).toHaveClass(/on/);
  await expect(ins.locator('[data-note="2"]')).toBeVisible();
  await expect(note).toBeHidden();
});

// Parts near the right edge line their note up with their right edge, so the note stays inside the picture
test('decision 3: notes of parts on the right stay inside the picture', async ({ page }) => {
  await page.goto(PAGE);
  const ins = page.locator('#decisions [data-inspect]');
  const stage = (await ins.locator('.stage').boundingBox())!;
  for (const i of [1, 2]) {
    await ins.locator('.layer .ui-pin').nth(i).click();
    const note = ins.locator(`[data-note="${i}"]`);
    await expect(note).toBeVisible();
    const box = (await note.boundingBox())!;
    const layer = (await ins.locator(`[data-layer="${i}"]`).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(stage.x);
    expect(box.x + box.width).toBeLessThanOrEqual(layer.x + layer.width + 1);
    expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width);
  }
});

test('result: outcome and what I learned', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#result [data-two-col] .k')).toHaveText(['outcome', 'what I learned']);
  await expect(page.locator('#result [data-two-col] li')).toHaveCount(5);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Overview');
  await expect(page.locator('main')).not.toContainText('Try it yourself');
});

test('next case study is Flex Academy', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('[data-next-case] .title a')).toHaveAttribute('href', '/project/flex-academy');
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

// Screenshots, made by CI on the pull request (never commit local ones). The live demo is another site, so it is masked.
test('looks the same as the approved screenshots', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of ['[data-case-summary]', '#decisions', '#process', '#result', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`dynamic-lists-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`, { mask: [page.locator('[data-live] iframe')] });
});
