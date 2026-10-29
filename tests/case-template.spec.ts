import { test, expect } from '@playwright/test';

// The Portfolio presentation template experiment (Figma sketch 14, 463:1958), on the lighter experiment template:
// summary with the live demo, one section, no "How I got there" or "What changed".
const PAGE = '/experiments/portfolio-presentation-template';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Portfolio presentation template');
  await expect(s.locator('.sub')).toHaveText('Template · 2026 · experiment');
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
  await expect(a.nth(0)).toHaveAttribute('href', 'https://rockgomes-portfolio-template.netlify.app');
  await expect(a.nth(0)).toHaveClass(/btn-primary/);
  await expect(a.nth(1)).toHaveAttribute('href', 'https://github.com/rockgomes/portfolio-presentation-template');
});

// No screen recording: on phones the still picture shows, and there is nothing to reload
// The template site sends X-Frame-Options: DENY, so it cannot show in a frame: the still picture shows at every size
test('live demo: a still picture under the browser bar, at every size', async ({ page }) => {
  await page.goto(PAGE);
  const live = page.locator('[data-live]');
  await expect(live.locator('.addr')).toHaveText('rockgomes-portfolio-template.netlify.app');
  await expect(live.locator('figcaption')).toHaveText('The live template. Open it, scroll down and open a chapter.');
  await expect(live.locator('iframe')).toHaveCount(0);
  await expect(live.locator('video')).toHaveCount(0);
  await expect(live.locator('.still')).toBeVisible();
  await expect(live.getByRole('button', { name: 'Reload the live page' })).toBeHidden();
});

test('one section, in the order of the sketch', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['How it is built']);
  await expect(page.locator('#built [data-case-block] h3')).toHaveText(['A card that opens into a chapter', 'All the content is in one file', 'Next time, shared demo parts']);
  await expect(page.locator('#built .pills li')).toHaveText(['Vite', 'GSAP', 'Lenis', 'no framework']);
});

test('the chapter switch starts on Card, and Open chapter shows the open chapter', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="chapter"]');
  await expect(sw.getByRole('radio', { name: 'Card' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toHaveText('The chapter index: one card per case study.');
  await sw.getByRole('radio', { name: 'Open chapter' }).click();
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toHaveText('The first chapter, zoomed open to full screen.');
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('So I built the alternative');
});

test('next case study goes back to card 01', async ({ page }) => {
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
  for (const sel of ['[data-case-summary]', '#built', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`template-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`, { mask: [page.locator('[data-live] iframe')] });
});
