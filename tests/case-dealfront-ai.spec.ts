import { test, expect } from '@playwright/test';

// The Dealfront AI in the Company Profile case study (Figma sketch 452:237), on the case study template: the live
// replica as the main picture (no recording, so a still on phones), four decisions, the process, the result.
const PAGE = '/project/dealfront-ai-company-profile';
const LIVE = 'https://dealfront-ai-company-profile.netlify.app';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('AI in the Company Profile');
  await expect(s.locator('.sub')).toHaveText('Dealfront · 2025 · AI feature in a live product');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
  await expect(s.locator('[data-facts]')).toContainText('Senior Product Designer on the Company Profile team.');
  await expect(s).not.toContainText('NN');
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
  await expect(a.nth(0)).toHaveAttribute('href', LIVE);
  await expect(a.nth(0)).toHaveClass(/btn-primary/);
});

// No screen recording: on phones the still picture shows, and there is nothing to reload
test('live page: iframe on desktop, still picture on phones', async ({ page, viewport }) => {
  await page.goto(PAGE);
  const live = page.locator('[data-live]');
  await expect(live.locator('.addr')).toHaveText('dealfront-ai-company-profile.netlify.app');
  await expect(live.locator('iframe')).toHaveAttribute('src', LIVE);
  await expect(live.locator('figcaption')).toHaveText('The interactive replica of the Company Profile. A guided tour opens on its own, and the pill at the bottom right runs it again.');
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

test('sections of the sketch, in order', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Four decisions I would defend', 'How I got there', 'What changed']);
  await expect(page.locator('#decisions [data-decision] h3')).toHaveText(['Questions, not one automatic summary', 'Filter the table, do not mark the rows', 'Show where the answer comes from', 'Edit a pin, not a question you already asked']);
  await expect(page.locator('#decisions .pills li')).toHaveText(['internal users', 'real users, same week', 'MVP scope']);
  await expect(page.locator('#process [data-case-block] h3')).toHaveText(['Research and design side by side', 'One block, three places', 'Join the house pattern, keep the log in view', 'A pin has a title and a prompt']);
  await expect(page.locator('#process .pills li')).toHaveText(['PMs', 'CS reps', 'clients', 'C-level']);
});

// Each switch: [id, option it starts on, a word of its caption, the other option, a word of that caption]
const switches = [
  ['design', 'Dropped: Generate', 'no way to steer', 'Shipped: question cards', 'already wanted to ask'],
  ['table', 'Shipped: filter toggle', 'only the recommended people show', 'Dropped: icon and hover', 'you hover to find out why'],
  ['source', 'AI Insights', 'the claims carry links', 'Activity', ''],
  ['pinning', 'Nine cards', 'Nine cards fit', 'Pin a question', 'You write the prompt once'],
] as const;

for (const [id, start, startText, other, otherText] of switches) {
  test(`the ${id} switch starts on ${start} and swaps to ${other}`, async ({ page }) => {
    await page.goto(PAGE);
    const sw = page.locator(`[data-switch="${id}"]`);
    const role = id === 'source' || id === 'pinning' ? 'tab' : 'radio';
    const state = role === 'tab' ? 'aria-selected' : 'aria-checked';
    await expect(sw.getByRole(role, { name: start })).toHaveAttribute(state, 'true');
    await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText(startText);
    await sw.getByRole(role, { name: other }).click();
    await expect(sw.getByRole(role, { name: other })).toHaveAttribute(state, 'true');
    // An empty caption means the option has no caption at all
    if (otherText) await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText(otherText);
    else await expect(sw.locator('[data-proof-panel]:visible figcaption')).toHaveCount(0);
    await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
  });
}

test('round two: a pin outlines its part and shows its note under it', async ({ page }) => {
  await page.goto(PAGE);
  const ins = page.locator('#process [data-inspect]');
  await expect(ins.locator('.callouts .ui-callout')).toHaveText([/AI summary and Filter share one space/, /The house pattern/, /Example prompts/, /activity log stays near the top/]);
  await expect(ins.locator('[data-inspect-mode]')).toHaveCount(0);
  await expect(ins.locator('[data-note]:visible')).toHaveCount(0);
  await ins.locator('.layer .ui-pin').nth(1).click();
  await expect(ins.locator('.callouts .ui-callout').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(ins.locator('[data-layer="1"]')).toHaveClass(/on/);
  await expect(ins.locator('[data-note="1"]')).toBeVisible();
  await ins.locator('.callouts .ui-callout').nth(3).click();
  await expect(ins.locator('.callouts .ui-callout').nth(1)).toHaveAttribute('aria-pressed', 'false');
  await expect(ins.locator('[data-layer="3"]')).toHaveClass(/on/);
  await expect(ins.locator('[data-note="3"]')).toBeVisible();
  await expect(ins.locator('[data-note]:visible')).toHaveCount(1);
});

test('result: outcome and what I learned', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#result [data-two-col] .k')).toHaveText(['outcome', 'what I learned']);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('The version we got wrong first');
});

test('next case study is Dynamic Lists', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('[data-next-case] .title a')).toHaveAttribute('href', '/project/dealfront-dynamic-lists');
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

// Screenshots, made by CI on the pull request (never commit local ones). The live page is another site, so it is masked.
test('looks the same as the approved screenshots', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of ['[data-case-summary]', '#decisions', '#process', '#result', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`dealfront-ai-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`, { mask: [page.locator('[data-live] iframe')], timeout: 15000 });
});
