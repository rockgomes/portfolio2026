import { test, expect } from '@playwright/test';

// The Well case study (Figma sketch 582:1292). Its two maps play by themselves (StateMap.astro). Tests run with
// reduced motion, so they see the still map.
const PAGE = '/project/well---care-homes-backoffice';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Care homes backoffice');
  await expect(s.locator('.sub')).toHaveText('Well · 2026 · internal tool');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('the maps switch; each is a still map, with no controls', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="well-maps"]');
  await expect(sw.locator('.ctrl button')).toHaveText(['Order stages', 'Patient states']);
  const map = sw.locator('[data-state-map]:visible');
  await expect(map.locator('[data-node]')).toHaveCount(8);
  await expect(map.locator('button')).toHaveCount(0);
  await sw.locator('.ctrl button').nth(1).click();
  await expect(sw.locator('[data-state-map]:visible [data-node]')).toHaveCount(6);
});

test('with motion on, the map plays by itself', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(PAGE);
  const map = page.locator('[data-state-map]').first();
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('[data-node="requested"]')).toHaveClass(/current/);
  await expect(map.locator('[data-node="labelling"]')).toHaveClass(/current/, { timeout: 5000 });
  await ctx.close();
});

for (const width of [320, 400]) {
  test(`no sideways scroll at ${width}px; the map scrolls inside its box`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto(PAGE);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}
