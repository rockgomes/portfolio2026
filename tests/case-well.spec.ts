import { test, expect } from '@playwright/test';

// The Well case study (Figma sketch 582:1292). Its three maps are state maps that move (StateMap.astro). Tests run
// with reduced motion, so nothing plays on its own and a click moves at once.
const PAGE = '/project/well---care-homes-backoffice';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Care homes backoffice');
  await expect(s.locator('.sub')).toHaveText('Well · 2026 · internal tool');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('the maps switch, and each starts at its first state', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="well-maps"]');
  await expect(sw.locator('.ctrl button')).toHaveText(['Order stages', 'Patient states', 'Care home profile']);
  await expect(sw.locator('[data-state-map]:visible [data-now]')).toHaveText('Requested');
  await sw.locator('.ctrl button').nth(1).click();
  await expect(sw.locator('[data-state-map]:visible [data-now]')).toHaveText('Patient added');
  await sw.locator('.ctrl button').nth(2).click();
  await expect(sw.locator('[data-state-map]:visible [data-now]')).toHaveText('Care homes list');
});

test('with reduced motion it waits; click the next state to move, start again to go back', async ({ page }) => {
  await page.goto(PAGE);
  const map = page.locator('[data-state-map]').first();
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('[data-play]')).toHaveAttribute('aria-pressed', 'false');
  await page.waitForTimeout(1500);
  await expect(map.locator('[data-now]')).toHaveText('Requested');
  // Only the states one move away can be clicked
  await expect(map.locator('.node.next')).toHaveCount(1);
  await map.getByRole('button', { name: 'Go to Labelling and checking' }).click();
  await expect(map.locator('[data-now]')).toHaveText('Labelling and checking');
  await expect(map.locator('[data-node="labelling"]')).toHaveAttribute('aria-current', 'true');
  await map.getByRole('button', { name: 'Go to FlowRX' }).click();
  // From FlowRX there are two ways on
  await expect(map.locator('.node.next')).toHaveCount(2);
  await map.getByRole('button', { name: 'Go to Exceptions' }).click();
  await expect(map.locator('[data-now]')).toHaveText('Exceptions');
  await map.getByRole('button', { name: 'Start again' }).click();
  await expect(map.locator('[data-now]')).toHaveText('Requested');
});

test('the profile map lands on the tab it leaves from', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="well-maps"]');
  await sw.locator('.ctrl button').nth(2).click();
  const map = sw.locator('[data-state-map]:visible');
  await map.getByRole('button', { name: 'Go to Care home profile' }).click();
  await expect(map.locator('[data-node="home"] .tab.on')).toHaveText('Units');
});

test('play and pause', async ({ page }) => {
  await page.goto(PAGE);
  const map = page.locator('[data-state-map]').first();
  await map.scrollIntoViewIfNeeded();
  const play = map.locator('[data-play]');
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  await expect(play).toHaveAttribute('aria-label', 'Pause');
  await expect(map.locator('[data-now]')).not.toHaveText('Requested', { timeout: 5000 });
  await play.click();
  await expect(play).toHaveAttribute('aria-label', 'Play');
});

for (const width of [320, 400]) {
  test(`no sideways scroll at ${width}px; the map scrolls inside its box`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto(PAGE);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}
