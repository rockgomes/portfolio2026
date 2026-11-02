import { test, expect } from '@playwright/test';

// The Pipedrive Floating Iframe case study (Figma sketch 540:1271), on the case study template.
const PAGE = '/project/pipedrive---floating-iframe';

test('summary: title, subtitle, facts, problem, decision, result', async ({ page }) => {
  await page.goto(PAGE);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Floating Iframe');
  await expect(s.locator('.sub')).toHaveText('Pipedrive · 2022 · integration');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-facts] dd').last()).toHaveText('Figma, Miro');
  await expect(s.locator('[data-pdr]')).toContainText('JustCall uses it for its Quick access feature');
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(PAGE);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('buttons open the Figma prototype, the developer docs and the JustCall app', async ({ page }) => {
  await page.goto(PAGE);
  const a = page.locator('[data-case-links] a');
  await expect(a).toHaveText(['Figma prototype', 'Developer docs', 'JustCall app']);
  await expect(a.nth(0)).toHaveAttribute('href', /^https:\/\/www\.figma\.com\/proto\/SCXg3AbVLFUSlZsD1HJFfP\/Pipedrive\?/);
  await expect(a.nth(0)).toHaveClass(/btn-primary/);
  await expect(a.nth(1)).toHaveAttribute('href', 'https://pipedrive.readme.io/docs/custom-ui-extensions-floating-window');
  await expect(a.nth(2)).toHaveAttribute('href', 'https://www.pipedrive.com/en/marketplace/app/just-call/d401831fa27bdb38');
});

test('the main picture is the prototype\'s first screen; the Figma prototype loads only after a click', async ({ page, viewport }) => {
  await page.goto(PAGE);
  const live = page.locator('[data-case-summary] [data-live]');
  await expect(live).toHaveCount(1);
  const frame = live.locator('iframe');
  await expect(frame).toHaveAttribute('data-src', /^https:\/\/embed\.figma\.com\/proto\/SCXg3AbVLFUSlZsD1HJFfP\/Pipedrive\?/);
  await expect(frame).not.toHaveAttribute('src');
  await expect(live.locator('figcaption')).toHaveText(/^The winning prototype: a calling app floats over a deal page in Pipedrive\./);
  await expect(live.locator('img.still')).toBeVisible();
  const load = live.getByRole('button', { name: 'Load the prototype' });
  if ((viewport?.width ?? 0) >= 1000) {
    await expect(load).toBeVisible();
    await expect(live.locator('[data-live-reload]')).toBeHidden();
    await page.route('https://embed.figma.com/**', (r) => r.fulfill({ contentType: 'text/html', body: '<p>prototype</p>' }));
    await load.click();
    await expect(frame).toHaveAttribute('src', /^https:\/\/embed\.figma\.com\/proto\//);
    await expect(live).not.toHaveAttribute('data-cover');
    await expect(live.locator('img.still')).toBeHidden();
    await expect(frame).toBeVisible();
    await expect(live.locator('[data-live-reload]')).toBeVisible();
  } else {
    await expect(live).toHaveAttribute('data-phone', '');
    await expect(load).toBeHidden();
  }
});

test('sections of the sketch, in order', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('main h2:not(.label)')).toHaveText(['Two decisions I would defend', 'How I got there', 'What I would measure']);
  await expect(page.locator('#decisions [data-decision] h3')).toHaveText(['Start with calling apps', 'A floating window that users can move or minimise']);
  await expect(page.locator('#decisions .pills li')).toHaveText(['used a lot', 'no good way to sync call data']);
  await expect(page.locator('#process [data-case-block] h3')).toHaveText(['Talk to partners and users', 'Work with the whole design team', 'Four prototypes, two per interview']);
  await expect(page.locator('#process .pills li')).toHaveText(['4 or 5 partner calls', '10 to 12 user interviews', '4 prototypes', '2 per interview', 'order changed each time']);
});

test('decision 2: a pin outlines its part and shows its note under it', async ({ page }) => {
  await page.goto(PAGE);
  const ins = page.locator('#decisions [data-inspect]');
  await expect(ins.locator('.callouts .ui-callout')).toHaveText([/in the top bar/, /installed integrations menu/, /Minimise the window/, /Answer, deny and end calls/]);
  await expect(ins.locator('[data-inspect-mode]')).toHaveCount(0);
  await expect(ins.locator('[data-note]:visible')).toHaveCount(0);
  await ins.locator('.layer .ui-pin').nth(2).click();
  await expect(ins.locator('.callouts .ui-callout').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(ins.locator('[data-layer="2"]')).toHaveClass(/on/);
  await expect(ins.locator('[data-note="2"]')).toBeVisible();
  await expect(ins.locator('[data-note]:visible')).toHaveCount(1);
  await ins.locator('.callouts .ui-callout').nth(0).click();
  await expect(ins.locator('.callouts .ui-callout').nth(2)).toHaveAttribute('aria-pressed', 'false');
  await expect(ins.locator('[data-layer="0"]')).toHaveClass(/on/);
  await expect(ins.locator('[data-note="0"]')).toBeVisible();
});

// The picture's frame cuts what sticks out, so every note must fit inside the picture
test('decision 2: every note stays inside the picture', async ({ page }) => {
  await page.goto(PAGE);
  const ins = page.locator('#decisions [data-inspect]');
  await ins.scrollIntoViewIfNeeded();
  const stage = (await ins.locator('.stage').boundingBox())!;
  for (let i = 0; i < 4; i++) {
    await ins.locator('.callouts .ui-callout').nth(i).click();
    const box = (await ins.locator(`[data-note="${i}"]`).boundingBox())!;
    expect(box.x + box.width, `note ${i + 1} right`).toBeLessThanOrEqual(stage.x + stage.width + 1);
    expect(box.y + box.height, `note ${i + 1} bottom`).toBeLessThanOrEqual(stage.y + stage.height + 1);
  }
});

test('result: what I would measure, and what I learned', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#result [data-two-col] .k')).toHaveText(['what I would measure', 'what I learned']);
  await expect(page.locator('#result [data-two-col] li')).toHaveCount(6);
});

test('the old Webflow body is gone', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.prose')).toHaveCount(0);
  await expect(page.locator('.case-body iframe')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Standard qualitative method');
});

test('next case study is Interactive Panels', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('[data-next-case] .title a')).toHaveAttribute('href', '/project/pipedrive---interactive-panels');
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

// Screenshots, made by CI on the pull request (never commit local ones). Each section is shot from the full page,
// snapped onto a whole pixel first (as in visual.spec.ts): element shots of a section taller than the screen moved
// the picture by a subpixel from run to run. The live prototype is on Figma's site, so its iframe is masked (as in visual.spec.ts).
test('looks the same as the approved screenshots', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of ['[data-case-summary]', '#decisions', '#process', '#result', '[data-next-case]']) {
    const b = await page.locator(sel).first().evaluate((e) => {
      const el = e as HTMLElement; const y = el.getBoundingClientRect().top + scrollY; const frac = y - Math.floor(y);
      if (frac > 0.001) el.style.marginTop = `${parseFloat(getComputedStyle(el).marginTop) + (1 - frac)}px`;
      const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
    });
    await expect(page).toHaveScreenshot(`floating-iframe-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`, { fullPage: true, mask: [page.locator('[data-live] iframe')], clip: { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.w), height: Math.round(b.h) }, timeout: 15_000 });
  }
});

test('testing: the winning prototype in three steps, from Figma', async ({ page }) => {
  await page.goto(PAGE);
  const strip = page.locator('#process [data-proof-strip]');
  await expect(strip.locator('.label')).toHaveText(['1. Open', '2. Use', '3. Minimise']);
  await expect(strip.locator('figcaption')).toHaveText('The winning prototype: open the app from the top bar, use it over the deal, minimise it.');
  for (const img of await strip.locator('img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
});

test('design rounds: the real design file with the team notes', async ({ page }) => {
  await page.goto(PAGE);
  const proof = page.locator('#process [data-case-block]').nth(1).locator('[data-proof]');
  await expect(proof.locator('figcaption')).toHaveText(/^Part of the shared design file\./);
  await expect(proof.locator('img')).toHaveAttribute('alt', /modal over call/);
});

test('result: it shipped, with the developer docs', async ({ page }) => {
  await page.goto(PAGE);
  const block = page.locator('#result [data-case-block]');
  await expect(block.locator('h3')).toHaveText('It shipped, with a part for calling apps');
  await expect(block.locator('figcaption')).toHaveText("Pipedrive's developer docs for the custom floating window.");
});
