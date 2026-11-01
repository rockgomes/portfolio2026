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
  await expect(sw.locator('.ctrl button')).toHaveText(['Order stages', 'Patient states']);
  await expect(sw.locator('[data-state-map]:visible [data-now]')).toHaveText('Requested');
  await sw.locator('.ctrl button').nth(1).click();
  await expect(sw.locator('[data-state-map]:visible [data-now]')).toHaveText('Patient added');
});

test('nothing moves until you press a button; only the actions that can happen work', async ({ page }) => {
  await page.goto(PAGE);
  const map = page.locator('[data-state-map]').first();
  const btn = (name: string) => map.getByRole('button', { name, exact: true });
  await expect(map.locator('[data-now]')).toHaveText('Requested');
  await expect(btn('Next stage')).toBeEnabled();
  for (const name of ['Issue found', 'Resolved', 'Claim issue', 'Start again']) await expect(btn(name)).toBeDisabled();
  await btn('Next stage').click();
  await btn('Next stage').click();
  await expect(map.locator('[data-now]')).toHaveText('FlowRX');
  await expect(map.locator('[data-node="flowrx"]')).toHaveClass(/current/);
  await expect(btn('Issue found')).toBeEnabled();
  await expect(btn('Resolved')).toBeDisabled();
  await btn('Issue found').click();
  await expect(map.locator('[data-now]')).toHaveText('Exceptions');
  await expect(btn('Next stage')).toBeDisabled();
  await btn('Resolved').click();
  await expect(map.locator('[data-now]')).toHaveText('FlowRX');
  for (let i = 0; i < 3; i++) await btn('Next stage').click();
  await expect(map.locator('[data-now]')).toHaveText('Delivered');
  await btn('Claim issue').click();
  await expect(map.locator('[data-now]')).toHaveText('Claim failed');
  await expect(btn('Next stage')).toBeDisabled();
  await btn('Start again').click();
  await expect(map.locator('[data-now]')).toHaveText('Requested');
  await expect(btn('Start again')).toBeDisabled();
});

test('patient states: the actions follow the map', async ({ page }) => {
  await page.goto(PAGE);
  const sw = page.locator('[data-switch="well-maps"]');
  await sw.locator('.ctrl button').nth(1).click();
  const map = sw.locator('[data-state-map]:visible');
  const btn = (name: string) => map.getByRole('button', { name, exact: true });
  await btn('Next state').click();
  await btn('Move to hospital').click();
  await expect(map.locator('[data-now]')).toHaveText('Hospitalised');
  await expect(btn('Mark as deceased')).toBeDisabled();
  await btn('Patient returns').click();
  await expect(map.locator('[data-now]')).toHaveText('Active');
});

for (const width of [320, 400]) {
  test(`no sideways scroll at ${width}px; the map scrolls inside its box`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto(PAGE);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}
