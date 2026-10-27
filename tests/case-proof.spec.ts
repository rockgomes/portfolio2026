import { test, expect } from '@playwright/test';

// Case study proof: switches (segmented control or tabs) that swap a picture or a video, and videos that play in view.
const FLEX = '/project/flex-academy';

test('decision 1 starts on the operator hero, as in the sketch, and the switch swaps picture and caption', async ({ page }) => {
  await page.goto(FLEX);
  const sw = page.locator('[data-switch="d1"]');
  await expect(sw.getByRole('radio', { name: 'I run units' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('I run units');
  await sw.getByRole('radio', { name: 'Starting out' }).click();
  await expect(sw.getByRole('radio', { name: 'Starting out' })).toHaveAttribute('aria-checked', 'true');
  await expect(sw.locator('[data-proof-panel]:visible img')).toHaveAttribute('src', /hero-launch/);
  await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
});

test('arrow keys move inside one group only', async ({ page }) => {
  await page.goto(FLEX);
  const d2 = page.locator('[data-switch="d2"]');
  await d2.getByRole('tab', { name: 'Launch · webinar' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(d2.getByRole('tab', { name: 'Scale · strategy call' })).toBeFocused();
  await expect(d2.getByRole('tab', { name: 'Scale · strategy call' })).toHaveAttribute('aria-selected', 'true');
  await expect(d2.locator('[data-proof-panel]:visible figcaption')).toContainText('27 seconds');
  await expect(page.locator('[data-switch="d1"]').getByRole('radio', { name: 'I run units' })).toHaveAttribute('aria-checked', 'true');
});

test('ids are unique on the case page', async ({ page }) => {
  await page.goto(FLEX);
  const dupes = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(dupes).toEqual([]);
});

test('no video plays on its own with reduced motion, and each shows its controls', async ({ page }) => {
  await page.goto(FLEX);
  for (const v of await page.locator('[data-proof] video:visible').all()) {
    await v.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    expect(await v.evaluate((e: HTMLVideoElement) => e.controls)).toBe(true);
  }
  for (const v of await page.locator('[data-proof] video').all()) {
    expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
    expect(await v.evaluate((e: HTMLVideoElement) => e.loop)).toBe(false);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('every switch shows one item and every video has a poster', async ({ page }) => {
    await page.goto(FLEX);
    const switches = await page.locator('[data-switch]').all();
    expect(switches.length).toBeGreaterThanOrEqual(2);
    for (const sw of switches) await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
    for (const v of await page.locator('main video').all()) await expect(v).toHaveAttribute('poster', /.+/);
  });
});

test.describe('with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test('the decision 3 video plays when in view and pauses when out of view', async ({ page }) => {
    await page.goto(FLEX);
    const v = page.locator('[data-decision="3"] video');
    await v.scrollIntoViewIfNeeded();
    await expect.poll(() => v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
  });
  test('switching tabs pauses the old video and plays the new one', async ({ page }) => {
    await page.goto(FLEX);
    const d2 = page.locator('[data-switch="d2"]');
    const first = d2.locator('[data-proof-panel]').nth(0).locator('video');
    await first.scrollIntoViewIfNeeded();
    await expect.poll(() => first.evaluate((e: HTMLVideoElement) => e.paused)).toBe(false);
    await d2.getByRole('tab', { name: 'Scale · strategy call' }).click();
    await expect.poll(() => first.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
    const second = d2.locator('[data-proof-panel]').nth(1).locator('video');
    await expect.poll(() => second.evaluate((e: HTMLVideoElement) => e.paused)).toBe(false);
  });
  test('a playing video keeps its controls, so it can always be paused', async ({ page }) => {
    await page.goto(FLEX);
    const v = page.locator('[data-decision="3"] video');
    await v.scrollIntoViewIfNeeded();
    await expect.poll(() => v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(false);
    expect(await v.evaluate((e: HTMLVideoElement) => e.controls)).toBe(true);
  });
  test('a video the visitor paused stays paused when it comes back into view', async ({ page }) => {
    await page.goto(FLEX);
    const v = page.locator('[data-decision="3"] video');
    await v.scrollIntoViewIfNeeded();
    await expect.poll(() => v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(false);
    await v.evaluate((e: HTMLVideoElement) => e.pause());
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await v.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
  });
  test('the live page video on phones plays in view and pauses out of view', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 860 });
    await page.goto(FLEX);
    const v = page.locator('[data-live] video');
    await v.scrollIntoViewIfNeeded();
    await expect.poll(() => v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(false);
    await page.locator('[data-decision="3"]').scrollIntoViewIfNeeded();
    await expect.poll(() => v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
  });
});
