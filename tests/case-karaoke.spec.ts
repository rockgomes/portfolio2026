import { test, expect } from '@playwright/test';

// The Karaoke OS experiment (Figma 542:1353), on the lighter experiment template: summary with the live demo,
// one section, no "How I got there" or "What changed".
const PAGE = '/experiments/karaoke-os';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Karaoke OS');
  await expect(s.locator('.sub')).toHaveText('Side project · 2026 · experiment');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(PAGE);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('buttons open the live demo and the source code', async ({ page }) => {
  await page.goto(PAGE);
  const a = page.locator('[data-case-links] a');
  await expect(a).toHaveText(['Open the live demo', 'Source code']);
  await expect(a.nth(0)).toHaveAttribute('href', 'https://karaoke-os.netlify.app');
  await expect(a.nth(0)).toHaveClass(/btn-primary/);
  await expect(a.nth(1)).toHaveAttribute('href', 'https://github.com/rockgomes/karaoke-os');
});

// No screen recording: on phones the still picture shows, and there is nothing to reload
test('live demo: iframe on desktop, still picture on phones', async ({ page, viewport }) => {
  await page.goto(PAGE);
  const live = page.locator('[data-live]');
  await expect(live.locator('.addr')).toHaveText('karaoke-os.netlify.app');
  await expect(live.locator('figcaption')).toHaveText('The live demo. You can change anything. Your copy of a bar is deleted at night.');
  await expect(live.locator('video')).toHaveCount(0);
  const reload = live.getByRole('button', { name: 'Reload the live page' });
  if ((viewport?.width ?? 0) >= 1200) {
    await expect(live.locator('iframe')).toBeVisible();
    await expect(live.locator('.still')).toBeHidden();
    await expect(reload).toBeVisible();
  } else {
    await expect(live).toHaveAttribute('data-phone', '');
    await expect(live.locator('.still')).toBeVisible();
    await expect(live.locator('iframe')).toBeHidden();
    await expect(reload).toBeHidden();
  }
});

test('one section, in the order of the sketch', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['How it is built']);
  const blocks = page.locator('#built [data-case-block]');
  await expect(blocks.locator('> .text > .label')).toHaveText(['the guest view', 'the interesting part', 'who sees what', 'the demo', 'why I could build it']);
  await expect(blocks.locator('h3')).toHaveText(['Search first, on a phone', 'One search page became three parts', 'Database rules control who sees what', 'Your own copy of a bar', 'I designed it, and Claude Code wrote the code']);
  await expect(blocks.nth(1).locator('.pills li')).toHaveText(['guests', 'bar staff', 'service operator']);
  await expect(blocks.nth(2).locator('.pills li')).toHaveText(['Next.js', 'Supabase', 'Netlify']);
  await expect(blocks.nth(4).locator('.pills')).toHaveCount(0);
});

test('the three parts picture shows the backoffice and the guest list', async ({ page }) => {
  await page.goto(PAGE);
  const proof = page.locator('#built [data-case-block]').nth(1).locator('[data-proof]');
  await expect(proof.locator('figcaption')).toHaveText("The bar's backoffice, with the guest song list on a phone.");
  const img = proof.locator('img');
  await img.scrollIntoViewIfNeeded();
  await expect(img).toHaveAttribute('alt', /backoffice of The Anchor/);
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
});

test('the guest view: two real phone screens, open and search', async ({ page }) => {
  await page.goto(PAGE);
  const strip = page.locator('#built [data-proof-strip]');
  await expect(strip.locator('.label')).toHaveText(['open', 'type \u201cadele\u201d']);
  await expect(strip.locator('figcaption')).toHaveText('The guest view of the demo bar, The Anchor. Real screens from the live demo.');
});

test('who sees what: one bar, three people, each with a pinned part of a real screen', async ({ page }) => {
  await page.goto(PAGE);
  const rows = page.locator('#built [data-proof-rows]');
  await expect(rows.locator('.who .label')).toHaveText(['Guest at the table', 'Bar staff at The Anchor', 'The person who runs the service']);
  await expect(rows.locator('.part .ui-pin')).toHaveText(['1', '2', '3']);
  await expect(rows.locator('img').nth(2)).toHaveAttribute('alt', /Not staff/);
  // Each outline sits inside its own screen
  for (let i = 0; i < 3; i++) {
    const screen = rows.locator('.screen').nth(i);
    await screen.scrollIntoViewIfNeeded();
    const s = (await screen.boundingBox())!; const p = (await screen.locator('.part').boundingBox())!;
    expect(p.x >= s.x && p.y >= s.y && p.x + p.width <= s.x + s.width + 1 && p.y + p.height <= s.y + s.height + 1, `outline ${i + 1}`).toBe(true);
  }
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('It is not a business');
});

test('next case study is Move Out Sale', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('[data-next-case] .title a')).toHaveAttribute('href', '/experiments/moveoutsale');
});

test('no Figma layer on the page', async ({ page }) => {
  await page.goto(PAGE);
  for (const sel of ['[data-overlay]', '.cursor', '.sel', '.cm', '.thread', '.rl', '.dim', '.note', '[data-view-option]'])
    await expect(page.locator(`main ${sel}, header.hdr ${sel}`), sel).toHaveCount(0);
});

test('ids are unique', async ({ page }) => {
  await page.goto(PAGE);
  const dupes = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(dupes).toEqual([]);
});

for (const width of [320, 400]) {
  test(`no sideways scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto(PAGE);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

// Screenshots, made by CI on the pull request (never commit local ones). The live demo is another site, so it is masked.
test('looks the same as the approved screenshots', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of ['[data-case-summary]', '#built', '[data-next-case]'])
    await expect(page.locator(sel)).toHaveScreenshot(`karaoke-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`, { mask: [page.locator('[data-live] iframe')] });
});
