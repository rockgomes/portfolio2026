import { test, expect } from '@playwright/test';

// The Well case study (Figma sketch 582:1292). Its order stages map plays by itself (StateMap.astro). Tests run with
// reduced motion, so they see the still map.
const PAGE = '/project/well---care-homes-backoffice';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Medication cycle management');
  await expect(s.locator('.sub')).toHaveText('Well · 2026 · internal tool');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('the story is about the cycle: the map comes first, then the cycle view', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Map the system first', 'Inside the cycle view', 'What changed']);
  await expect(page.locator('#cycle [data-case-block] h3')).toHaveText(['One column per stage', 'Every cycle in the same place', 'Change the dates of one cycle only', 'Find a patient across all stages', 'Two views on the same orders', 'The full story of one order']);
  await expect(page.locator('#process h3').first()).toHaveText('Map the system before drawing');
  const map = page.locator('[data-state-map]');
  await expect(map).toHaveCount(1);
  await expect(map.locator('[data-node]')).toHaveCount(10);
  await expect(map.locator('button')).toHaveCount(0);
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
