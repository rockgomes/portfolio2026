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

// The switch motion (src/lib/view-switch.ts). The other tests run with reduced motion, where the switch is instant.
test.describe('view switch motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  const blocks = '#main > section, body > footer';
  const settled = (page: import('@playwright/test').Page) => page.waitForFunction(() => { const h = document.documentElement; return !('switching' in h.dataset) && !h.classList.contains('view-fading'); });
  // Inline styles left on the sections, the page or the footer
  const leftovers = (page: import('@playwright/test').Page) => page.evaluate((sel) => [...document.querySelectorAll(`${sel}, #main`)].filter((e) => e.getAttribute('style')).map((e) => e.className || e.id), blocks);

  for (const [from, to, shows, hides] of [
    ['design', 'recruiter', '[data-recruiter]', '.hero'],
    ['design', 'engineer', '.repos', '#design-systems'],
    ['recruiter', 'design', '.hero', '[data-recruiter]'],
  ] as const) {
    test(`${from} to ${to} ends in the right state, with no sideways scroll`, async ({ page }) => {
      await page.goto(`/?view=${from}`);
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
    await page.goto('/');
    await page.waitForLoadState('load');
    for (const v of ['recruiter', 'engineer', 'design', 'recruiter']) await page.click(`[data-view-option="${v}"]`);
    await expect(page.locator('html')).toHaveAttribute('data-view', 'recruiter');
    await settled(page);
    await expect(page.locator('[data-view-option="recruiter"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-recruiter]')).toBeVisible();
    await expect(page.locator('.hero')).toBeHidden();
    expect(await leftovers(page)).toEqual([]);
  });

  test('the page fades out and back in', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.evaluate(() => { const w = window as unknown as { low: number }; w.low = 1; const f = () => { w.low = Math.min(w.low, +getComputedStyle(document.querySelector('#main')!).opacity); if ('switching' in document.documentElement.dataset) requestAnimationFrame(f); }; document.querySelector<HTMLElement>('[data-view-option="engineer"]')!.click(); requestAnimationFrame(f); });
    await settled(page);
    expect(await page.evaluate(() => (window as unknown as { low: number }).low)).toBeLessThan(0.5);
  });

  // Something always moves: from Engineer to Design lead at the top (and back) the hero is in both views and stays in
  // place, so it rises
  for (const [from, to] of [['engineer', 'design'], ['design', 'engineer']]) test(`${from} to ${to} at the top moves the hero`, async ({ page }) => {
    await page.goto(`/?view=${from}`);
    await page.waitForLoadState('load');
    // Every style change on the hero is recorded (a frame can take longer than the rise when the machine is busy)
    await page.evaluate((to) => { const w = window as unknown as { far: number }; w.far = 0; const hero = document.querySelector<HTMLElement>('.hero')!; new MutationObserver(() => { w.far = Math.max(w.far, Math.abs(new DOMMatrix(getComputedStyle(hero).transform).m42)); }).observe(hero, { attributes: true, attributeFilter: ['style'] }); document.querySelector<HTMLElement>(`[data-view-option="${to}"]`)!.click(); }, to);
    await settled(page);
    expect(await page.evaluate(() => (window as unknown as { far: number }).far)).toBeGreaterThan(8);
  });

  test('the section being read stays in place', async ({ page }) => {
    await page.goto('/');
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
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.locator('#work').evaluate((e) => scrollTo(0, e.getBoundingClientRect().top + scrollY - 200));
    await page.click('[data-view-option="recruiter"]');
    await settled(page);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });
});
