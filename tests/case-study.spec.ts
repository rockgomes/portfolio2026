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

test('live page: a browser bar with the address and a Reload button', async ({ page }) => {
  await page.goto(FLEX);
  const live = page.locator('[data-live]');
  await expect(live.locator('.addr')).toHaveText('flex-academy-prototype.netlify.app');
  const reload = live.getByRole('button', { name: 'Reload the live page' });
  await expect(reload).toBeVisible();
  // Same sizes as the Figma Browser bar: a 24px Button with the 10px icon slot, in a 37px bar
  expect(await reload.locator('svg').boundingBox()).toMatchObject({ width: 10, height: 10 });
  expect((await reload.boundingBox())?.height).toBe(24);
  expect((await live.locator('.bar').boundingBox())?.height).toBe(37);
});

test('live page: Reload loads the prototype again on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1000, 'desktop shows the iframe');
  await page.goto(FLEX);
  const live = page.locator('[data-live]');
  await live.scrollIntoViewIfNeeded();
  await expect(live.locator('iframe')).toBeVisible();
  let loads = 0;
  page.on('framenavigated', (f) => { if (f.url().includes('flex-academy-prototype')) loads++; });
  await live.getByRole('button', { name: 'Reload the live page' }).click();
  await expect.poll(() => loads).toBeGreaterThan(0);
});

test('live page video does not play on its own with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 });
  await page.goto(FLEX);
  const v = page.locator('[data-live] video');
  await expect(v).toHaveAttribute('controls', '');
  expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
  expect(await v.evaluate((e: HTMLVideoElement) => e.loop)).toBe(false);
});

test('method steps: the side note goes under the text when the column is narrow', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(FLEX);
  const view = page.locator('[data-method] .step:visible [data-view-of="solo"]');
  const main = await view.locator('.main').boundingBox();
  const side = await view.locator('.side').boundingBox();
  expect(side!.y).toBeGreaterThanOrEqual(main!.y + main!.height);
  expect(main!.width).toBeGreaterThan(300);
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

test('the old Webflow page is gone: no embeds, and the sections of the sketch in order', async ({ page }) => {
  await page.goto(FLEX);
  await expect(page.locator('.fa-mount, script[src*="flex-academy-embeds"], .prose')).toHaveCount(0);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Three decisions I would defend', 'How I got there', 'The design system behind it', 'Built, not just drawn', 'If it shipped']);
});

test('method: seven steps, solo and team', async ({ page }) => {
  await page.goto(FLEX);
  const m = page.locator('[data-method]');
  await expect(m.getByRole('tab')).toHaveCount(7);
  await expect(m.locator('[role="tabpanel"]:visible')).toContainText('Gate: every later choice is checked against the principles.');
  await m.getByRole('tab', { name: '03 Structure' }).click();
  await expect(m.locator('[role="tabpanel"]:visible')).toContainText('every state');
  await m.getByRole('radio', { name: 'With a team' }).click();
  await expect(m.locator('[role="tabpanel"]:visible')).toContainText('Wireframes reviewed with PM and engineering');
  await m.getByRole('tab', { name: '03 Structure' }).press('ArrowRight');
  await expect(m.getByRole('tab', { name: '04 Diverge' })).toBeFocused();
  await expect(m.locator('[role="tabpanel"]:visible')).toContainText('Two or three designers explore in parallel');
});

test('compare slider moves with the arrow keys', async ({ page }) => {
  await page.goto(FLEX);
  const c = page.locator('[data-compare]');
  const range = c.locator('input[type="range"]');
  await range.focus();
  await page.keyboard.press('ArrowRight');
  await expect(range).toHaveValue('51');
  expect(await c.evaluate((e) => getComputedStyle(e).getPropertyValue('--x').trim())).toBe('51%');
});

test('art directions: three tabs with their verdicts', async ({ page }) => {
  await page.goto(FLEX);
  const d = page.locator('[data-switch="dirs"]');
  await expect(d.getByRole('tab')).toHaveText(['Lights On', 'Your Next Unit', 'The Calendar · chosen']);
  await d.getByRole('tab', { name: 'Your Next Unit' }).click();
  await expect(d.locator('[data-proof-panel]:visible figcaption')).toContainText('a question slows down people');
});

test('inspect: a pin lists its tokens, and Dark changes the values', async ({ page }) => {
  await page.goto(FLEX);
  const ins = page.locator('[data-inspect]');
  const panel = ins.locator('[data-inspect-panel]');
  await expect(ins.locator('.ui-pin')).toHaveCount(8); // four on the picture, four in the list
  await ins.getByRole('button', { name: /Button, Kind=Launch/ }).click();
  await expect(ins.getByRole('button', { name: /Button, Kind=Launch/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(panel).toContainText('launch/accent');
  await expect(panel).toContainText('#284E4C');
  await ins.getByRole('radio', { name: 'Dark' }).click();
  await expect(panel).toContainText('#2F6360');
  await expect(ins.locator('img[src*="dark-hero"]')).toBeVisible();
});

test('design system stats: the Stat from the homepage, four of them, and the coverage line', async ({ page }) => {
  await page.goto(FLEX);
  await expect(page.locator('#system [data-stats] [data-stat]')).toHaveCount(4);
  await expect(page.locator('#system [data-stats]')).toContainText('component sets, each with a description');
  await expect(page.locator('#system')).toContainText('1,182/1,182 gaps and padding');
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
