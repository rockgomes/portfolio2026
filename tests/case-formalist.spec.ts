import { test, expect } from '@playwright/test';

// The Formalist side project (Figma sketch 519:19766), on the experiment template: summary with the live demo and
// three demo steps, then "How it is built".
const PAGE = '/experiments/formalist';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Formalist');
  await expect(s.locator('.sub')).toHaveText('Side project · 2026 · Chrome extension');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('buttons open the Chrome Web Store and the live demo', async ({ page }) => {
  await page.goto(PAGE);
  const a = page.locator('[data-case-links] a');
  await expect(a).toHaveText(['Get it for Chrome', 'Open the live demo']);
  await expect(a.nth(0)).toHaveAttribute('href', 'https://chromewebstore.google.com/detail/formalist/bnnfokenogbmmjkpallkfmfkibbbbfhb');
  await expect(a.nth(0)).toHaveClass(/btn-primary/);
  await expect(a.nth(1)).toHaveAttribute('href', 'https://formalist-demo.netlify.app');
});

test('live demo: iframe on desktop, still picture on phones', async ({ page, viewport }) => {
  await page.goto(PAGE);
  const live = page.locator('[data-live]');
  await expect(live.locator('.addr')).toHaveText('formalist-demo.netlify.app');
  if ((viewport?.width ?? 0) >= 1200) {
    await expect(live.locator('iframe')).toBeVisible();
    await expect(live.locator('iframe')).toHaveAttribute('title', 'Formalist demo');
  } else {
    await expect(live.locator('.still')).toBeVisible();
    await expect(live.locator('.still')).toHaveAttribute('src', '/media/experiments/formalist/live.jpg');
  }
});

test('demo steps, then the five blocks of "How it is built"', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.after-live [data-proof-strip] li')).toHaveCount(3);
  await expect(page.locator('#built [data-case-block]')).toHaveCount(5);
  await expect(page.locator('#built [data-badge-layers]')).toBeVisible();
  await expect(page.locator('#built [data-proof-list]')).toHaveCount(3);
  // The demo person is Alex Taylor; the old name must not come back in alt text
  await expect(page.locator('img[alt*="Ana"]')).toHaveCount(0);
});

test('no sideways scroll', async ({ page }) => {
  await page.goto(PAGE);
  const w = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(w).toBeLessThanOrEqual(0);
});
