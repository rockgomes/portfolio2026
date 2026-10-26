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
