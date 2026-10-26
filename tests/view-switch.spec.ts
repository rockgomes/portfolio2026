import { test, expect } from '@playwright/test';

test('audience switch sets the view and the URL', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-view-option="engineer"]');
  await expect(page.locator('html')).toHaveAttribute('data-view', 'engineer');
  await expect(page).toHaveURL(/view=engineer/);
  await page.goto('/?view=recruiter');
  await expect(page.locator('html')).toHaveAttribute('data-view', 'recruiter');
  await expect(page.locator('[data-view-option="recruiter"]')).toHaveAttribute('aria-checked', 'true');
});

// The switch motion (src/lib/view-switch.ts), in each version (?motion=). The other tests run with reduced motion,
// where the switch is instant.
for (const m of ['a', 'b', 'c', 'd', 'e']) test.describe(`view switch motion ${m}`, () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  const blocks = '#main > section, body > footer';
  const settled = (page: import('@playwright/test').Page) => page.waitForFunction(() => { const h = document.documentElement; return !('switching' in h.dataset) && !h.classList.contains('view-fading'); });
  // Inline styles left on the sections, the page or the footer, and the extra layers of versions c and d
  const leftovers = (page: import('@playwright/test').Page) => page.evaluate((sel) => [
    ...[...document.querySelectorAll(`${sel}, #main`)].filter((e) => e.getAttribute('style')).map((e) => e.className || e.id),
    ...[...document.querySelectorAll('.view-wipe')].map(() => 'view-wipe'),
    ...(document.documentElement.classList.contains('view-zoom') ? ['view-zoom'] : []),
  ], blocks);

  for (const [from, to, shows, hides] of [
    ['design', 'recruiter', '[data-recruiter]', '.hero'],
    ['design', 'engineer', '.repos', '#design-systems'],
    ['recruiter', 'design', '.hero', '[data-recruiter]'],
  ] as const) {
    test(`${from} to ${to} ends in the right state, with no sideways scroll`, async ({ page }) => {
      await page.goto(`/?view=${from}&motion=${m}`);
      await page.waitForLoadState('load');
      let widest = 0;
      const watch = setInterval(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth).then((w) => { widest = Math.max(widest, w); }).catch(() => {}), 40);
      await page.click(`[data-view-option="${to}"]`);
      await expect(page.locator('html')).toHaveAttribute('data-view', to);
      await settled(page);
      clearInterval(watch);
      await expect(page.locator(shows).first()).toBeVisible();
      await expect(page.locator(hides).first()).toBeHidden();
      expect(await leftovers(page)).toEqual([]);
      expect(widest).toBe(0);
    });
  }

  test('fast clicks end in the last view chosen', async ({ page }) => {
    await page.goto(`/?motion=${m}`);
    await page.waitForLoadState('load');
    for (const v of ['recruiter', 'engineer', 'design', 'recruiter']) await page.click(`[data-view-option="${v}"]`);
    await expect(page.locator('html')).toHaveAttribute('data-view', 'recruiter');
    await settled(page);
    await expect(page.locator('[data-view-option="recruiter"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-recruiter]')).toBeVisible();
    await expect(page.locator('.hero')).toBeHidden();
    expect(await leftovers(page)).toEqual([]);
  });

  // Design lead to Engineer at the top: the hero is in both views and does not move, so only a fade shows the switch
  if (m === 'b' || m === 'e') test('design lead to engineer at the top is seen', async ({ page }) => {
    await page.goto(`/?motion=${m}`);
    await page.waitForLoadState('load');
    await page.evaluate(() => { const w = window as unknown as { low: number }; w.low = 1; const f = () => { w.low = Math.min(w.low, +getComputedStyle(document.querySelector('#main')!).opacity); if ('switching' in document.documentElement.dataset) requestAnimationFrame(f); }; document.querySelector<HTMLElement>('[data-view-option="engineer"]')!.click(); requestAnimationFrame(f); });
    await settled(page);
    expect(await page.evaluate(() => (window as unknown as { low: number }).low)).toBeLessThan(0.5);
  });

  test('the section being read stays in place', async ({ page }) => {
    await page.goto(`/?motion=${m}`);
    await page.waitForLoadState('load');
    const exp = page.locator('#experience');
    await exp.evaluate((e) => scrollTo(0, e.getBoundingClientRect().top + scrollY - 200));
    const before = await exp.evaluate((e) => e.getBoundingClientRect().top);
    await page.click('[data-view-option="recruiter"]');
    await settled(page);
    const after = await exp.evaluate((e) => e.getBoundingClientRect().top);
    expect(Math.abs(after - before)).toBeLessThan(2);
  });

  test('a section the new view does not have takes the page to the top', async ({ page }) => {
    await page.goto(`/?motion=${m}`);
    await page.waitForLoadState('load');
    await page.locator('#work').evaluate((e) => scrollTo(0, e.getBoundingClientRect().top + scrollY - 200));
    await page.click('[data-view-option="recruiter"]');
    await settled(page);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });
});
