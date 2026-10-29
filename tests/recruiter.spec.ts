import { test, expect } from '@playwright/test';
import { chooseView } from './view';

// The "Recruiter" view: a one-page summary instead of the homepage content.
test('the recruiter view replaces the homepage', async ({ page }) => {
  await page.goto('/?view=recruiter');
  await expect(page.locator('[data-recruiter]')).toBeVisible();
  await expect(page.locator('.hero')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Senior Product Designer.');
  // Below the summary: Numbers, Experience and About, without the work and design systems sections
  for (const sel of ['.numbers', '#experience', '#about']) await expect(page.locator(sel)).toBeVisible();
  for (const sel of ['#work', '#design-systems']) await expect(page.locator(sel)).toBeHidden();
});

test('all the work is in the recruiter view: a scroll box on wide screens, the full list on small ones', async ({ page }) => {
  await page.goto('/?view=recruiter');
  const list = page.locator('#rec-list');
  await expect(page.locator('[data-recruiter] .count')).toHaveText('14 projects');
  await expect(list.locator('li')).toHaveCount(14);
  // Experiments link to their own pages
  await expect(list.locator('a[href="/experiments/fieldset"]')).toHaveCount(1);
  const box = await list.evaluate((l) => ({ h: l.clientHeight, sh: l.scrollHeight }));
  if ((page.viewportSize()?.width ?? 0) > 1040) {
    // The box cuts the list, with a fade until the end
    expect(box.sh).toBeGreaterThan(box.h);
    await expect(list).not.toHaveAttribute('data-end');
    await list.evaluate((l) => { l.scrollTop = l.scrollHeight; });
    await expect(list).toHaveAttribute('data-end', '');
    // Scrolling the list keeps the visitor in the recruiter view
    await expect(page.locator('html')).toHaveAttribute('data-view', 'recruiter');
  } else {
    expect(box.sh).toBe(box.h);
  }
});

test('the header switch opens the recruiter view', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-recruiter]')).toBeHidden();
  await chooseView(page, 'recruiter');
  await expect(page.locator('[data-recruiter]')).toBeVisible();
  await expect(page).toHaveURL(/view=recruiter/);
});

test('Download CV links to the PDF, which is served', async ({ page, request }) => {
  await page.goto('/?view=recruiter');
  const link = page.locator('[data-recruiter] a.cv');
  await expect(link).toHaveAttribute('href', '/Rock_Gomes_CV.pdf');
  const r = await request.get('/Rock_Gomes_CV.pdf');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-type']).toContain('pdf');
});

// Each view has its own accent: blue for design lead, violet for recruiter (light theme).
test('the recruiter view uses the violet accent', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/?view=recruiter');
  const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-annotation-measure').trim());
  expect(await accent()).toBe('#6854e0');
  await chooseView(page, 'design');
  expect(await accent()).toBe('#0a62d4');
});

// In dark mode each view keeps its own accent: cyan, light green, light violet.
test('each view has its own accent in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-annotation-measure').trim());
  for (const [view, colour] of [['design', '#4fd3ea'], ['engineer', '#3dd68c'], ['recruiter', '#a98bfa']]) {
    await page.goto(`/?view=${view}`);
    expect(await accent()).toBe(colour);
  }
});

// The recruiter view is sober: the shared sections lose their designer layer there (Figma 94:6774).
test('the recruiter view has no designer layer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?view=recruiter');
  const hidden = ['#experience .dim', '#about .dim', '#about .sh .sub', '#about .tag', '#about .facts', '#about [data-overlay]'];
  for (const sel of hidden) for (const el of await page.locator(sel).all()) await expect(el, sel).toBeHidden();
  await expect(page.locator('#experience h2')).toHaveCSS('font-size', '44px');
  await page.goto('/?view=design');
  await expect(page.locator('#about .facts')).toBeVisible();
});

test('recruiter view: the timeline in the recruiter accent, dots centred on the line', async ({ page }) => {
  await page.goto('/?view=recruiter#experience');
  const tl = page.locator('#experience .timeline');
  await tl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500); // the dots pop in
  const r = await tl.evaluate((el) => {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-annotation-measure').trim();
    const probe = document.createElement('i'); probe.style.color = accent; document.body.append(probe); const want = getComputedStyle(probe).color; probe.remove();
    const b = getComputedStyle(el, '::before'); const t = el.getBoundingClientRect();
    const line = t.left + parseFloat(b.left) + parseFloat(b.width) / 2;
    const dots = [...el.querySelectorAll('.marker i')].map((i) => { const d = i.getBoundingClientRect(); return d.left + d.width / 2; });
    return { want, line: b.backgroundColor, first: getComputedStyle(el.querySelector('.marker i')!).backgroundColor, off: Math.max(...dots.map((d) => Math.abs(d - line))) };
  });
  expect(r.line).toBe(r.want);
  expect(r.first).toBe(r.want);
  expect(r.off).toBeLessThan(0.6);
});

test.describe('recruiter footer', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' }, permissions: ['clipboard-read', 'clipboard-write'] });
  test('no ruler, no "You" cursor or comment, and the CV button', async ({ page, viewport }) => {
    await page.goto('/?view=recruiter');
    const footer = page.locator('footer.ftr'); await footer.scrollIntoViewIfNeeded();
    await expect(footer.locator('[data-ruler]')).toBeHidden();
    await expect(footer.locator('.cursor')).toBeHidden();
    await expect(footer.getByRole('link', { name: 'Download CV (PDF)' })).toBeVisible();
    const gap = await page.evaluate(() => document.querySelector('footer .headline')!.getBoundingClientRect().top - document.querySelector('footer')!.getBoundingClientRect().top);
    expect(gap).toBeGreaterThan(32); // the content sits inside the footer, under its top line
    if ((viewport?.width ?? 0) >= 1200) {
      const f = (await footer.boundingBox())!;
      await page.mouse.move(f.x + 300, f.y + 40); await page.mouse.move(f.x + 320, f.y + 90, { steps: 3 });
      await expect(footer).not.toHaveClass(/you-here/);
    }
    await footer.locator('[data-copy]').click();
    await expect(footer.locator('[data-copy]')).toContainText('copied');
    await expect(page.locator('[data-copied]')).toBeHidden();
  });
});
