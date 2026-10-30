import { test, expect } from '@playwright/test';

// The Well case study (Figma sketch 582:1292). Its three maps are state maps you drive (StateMap.astro). Tests run
// with reduced motion, so each step lands at once.
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

test('nothing moves until you act; events and dashed states take a step, the log keeps them', async ({ page }) => {
  await page.goto(PAGE);
  const map = page.locator('[data-state-map]').first();
  await map.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await expect(map.locator('[data-now]')).toHaveText('Requested');
  await expect(map.locator('[data-log] li')).toHaveText(['Requested']);
  // The events you can fire now, as buttons
  const events = map.locator('[data-events] button');
  await expect(events).toHaveText(['→ Labelling and checking']);
  await events.first().click();
  await expect(map.locator('[data-now]')).toHaveText('Labelling and checking');
  await expect(map.locator('[data-node="labelling"]')).toHaveAttribute('aria-current', 'true');
  // A state with a dashed border works the same way
  await map.getByRole('button', { name: 'Go to FlowRX' }).click();
  await expect(map.locator('[data-now-note]')).toHaveText('A column on the cycle board. Two ways on from here.');
  await expect(events).toHaveText(['issue found → Exceptions', '→ Ready to dispatch']);
  await map.locator('[data-events] button', { hasText: 'issue found' }).click();
  await expect(map.locator('[data-now]')).toHaveText('Exceptions');
  await expect(map.locator('[data-log] li')).toHaveText(['Requested', '→ Labelling and checking', '→ FlowRX', 'issue found → Exceptions']);
  await map.getByRole('button', { name: 'Start again' }).click();
  await expect(map.locator('[data-now]')).toHaveText('Requested');
  await expect(map.locator('[data-log] li')).toHaveCount(1);
});

test('the profile map lands on the tab it leaves from', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="well-maps"]');
  await sw.locator('.ctrl button').nth(2).click();
  const map = sw.locator('[data-state-map]:visible');
  await map.locator('[data-events] button').first().click();
  await expect(map.locator('[data-node="home"] .tab.on')).toHaveText('Units');
});

test('a sample run plays to the end, and can be paused', async ({ page }) => {
  await page.goto(PAGE);
  const map = page.locator('[data-state-map]').first();
  await map.scrollIntoViewIfNeeded();
  const play = map.locator('[data-play]');
  await expect(play).toHaveText('Play a sample order');
  await play.click();
  await expect(play).toHaveText('Pause');
  await expect(map.locator('[data-now]')).toHaveText('Delivered', { timeout: 10_000 });
  await expect(play).toHaveText('Play a sample order');
  await expect(map.locator('[data-events] button')).toHaveText(['issue → Claim failed']);
  // The next sample takes the other way, and Pause hands it back to you
  await play.click();
  await expect(map.locator('[data-now]')).toHaveText('Labelling and checking', { timeout: 5000 });
  await play.click();
  await expect(play).toHaveText('Play a sample order');
  await expect(map.locator('[data-events] button').first()).toBeVisible({ timeout: 5000 });
});

for (const width of [320, 400]) {
  test(`no sideways scroll at ${width}px; the map scrolls inside its box`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto(PAGE);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}
