import { test, expect } from '@playwright/test';

// Case study pages (docs/superpowers/specs/2026-10-27-case-study-design.md). Flex Academy is the first one built this way.
const FLEX = '/project/flex-academy';

test('summary: title, facts, problem, decision, result', async ({ page }) => {
  await page.goto(FLEX);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Flex Academy');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(FLEX);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('buttons link to the live page, the prototype and the source', async ({ page }) => {
  await page.goto(FLEX);
  const a = page.locator('[data-case-links] a');
  await expect(a).toHaveText(['Open the live page ↗', 'Figma prototype ↗', 'Source code ↗']);
  await expect(a.nth(0)).toHaveAttribute('href', 'https://flex-academy-prototype.netlify.app');
  await expect(a.nth(0)).toHaveClass(/btn-primary/);
  await expect(a.nth(2)).toHaveAttribute('href', 'https://github.com/rockgomes/flex-academy-prototype');
});

test('pages without the new fields keep the old layout', async ({ page }) => {
  await page.goto('/project/dealfront-dynamic-lists');
  await expect(page.locator('[data-case-summary]')).toHaveCount(0);
  await expect(page.locator('article.article h1')).toHaveCount(1);
});

test('live page: iframe on desktop, video on phones', async ({ page, viewport }) => {
  await page.goto(FLEX);
  const live = page.locator('[data-live]');
  await expect(live.locator('figcaption')).toContainText('The live page, scaled to fit');
  if ((viewport?.width ?? 0) >= 1200) {
    await expect(live.locator('iframe')).toBeVisible();
    await expect(live).not.toHaveAttribute('data-phone', '');
  } else {
    await expect(live).toHaveAttribute('data-phone', '');
    await expect(live.locator('video')).toBeVisible();
  }
});

test('live page video does not play on its own with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 });
  await page.goto(FLEX);
  const v = page.locator('[data-live] video');
  await expect(v).toHaveAttribute('controls', '');
  expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
});

test('next case study is the next project by card order', async ({ page }) => {
  await page.goto(FLEX);
  const next = page.locator('[data-next-case]');
  await expect(next.locator('.title a')).toHaveAttribute('href', '/project/inbank---customer-service-backoffice');
  await expect(next.locator('.meta .n')).toHaveCount(0);
});

test('no Figma layer on the case study page', async ({ page }) => {
  await page.goto(FLEX);
  // Cursors, selections, comments, resolved threads and labels, dimension lines, notes, and the view switch.
  // The footer is left out on purpose: it stays as it is on every page, with its "You" cursor (Rock, Oct 2026).
  for (const sel of ['[data-overlay]', '.cursor', '.sel', '.cm', '.thread', '.rl', '.dim', '.note', '[data-view-option]'])
    await expect(page.locator(`main ${sel}, header.hdr ${sel}`), sel).toHaveCount(0);
});

for (const width of [320, 400]) {
  test(`no sideways scroll on the Flex page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto(FLEX);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

// Case pages are the same for every visitor: a view chosen on the homepage must not follow the visitor here.
test('a stored recruiter or engineer view does not change the case page', async ({ page }) => {
  await page.goto('/?view=recruiter');
  await page.goto(FLEX);
  await expect(page.locator('[data-case-summary]')).toBeVisible();
  await page.goto('/?view=engineer');
  await page.goto(FLEX);
  await expect(page.locator('[data-next-case] .meta .co')).toBeVisible();
  await expect(page.locator('[data-next-case] .meta .file')).toBeHidden();
});

test('the old body under the summary keeps the article styles', async ({ page }) => {
  await page.goto(FLEX);
  expect(await page.locator('.case-old h2').first().evaluate((e) => getComputedStyle(e).fontSize)).toBe('28px');
});

test.describe('live page with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test('if the browser blocks autoplay, the recording gets its controls back', async ({ page }) => {
    await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError')); });
    await page.setViewportSize({ width: 400, height: 860 });
    await page.goto(FLEX);
    await expect(page.locator('[data-live] video')).toHaveAttribute('controls', '');
  });
});
