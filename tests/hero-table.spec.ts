import { test, expect } from '@playwright/test';

test.describe('hero table', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload(); });
  const count = (page: any) => page.locator('[data-count]');

  test('saved views change the result count', async ({ page }) => {
    await expect(count(page)).toHaveText('28');
    await page.click('[data-preset="all"]'); await expect(count(page)).toHaveText('40');
    await page.click('[data-preset="icp"]'); await expect(count(page)).toHaveText('28');
  });
  test('conditions can be removed and added', async ({ page }) => {
    await page.click('[data-rm]'); await expect(count(page)).toHaveText('40');
    await page.click('[data-add]'); await page.getByRole('menuitem', { name: 'Employees more than 500' }).click();
    await expect(count(page)).toHaveText('22');
  });
  test('the + Condition menu is closed on load', async ({ page }) => {
    await expect(page.locator('[data-add-menu]')).toBeHidden();
  });
  test('a visitor can save their own view', async ({ page }) => {
    await expect(page.locator('[data-save-view]')).toBeHidden();
    await page.click('[data-rm]');
    await page.click('[data-add]'); await page.getByRole('menuitem', { name: 'Employees more than 500' }).click();
    await page.click('[data-save-view]');
    const tab = page.getByRole('tab', { name: 'Over 500 people' });
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-save-view]')).toBeHidden();
    await page.reload();
    await expect(page.getByRole('tab', { name: 'Over 500 people' })).toHaveAttribute('aria-selected', 'true');
    await expect(count(page)).toHaveText('22');
  });
  test('the Columns menu hides and shows columns, and remembers it', async ({ page }) => {
    await page.click('[data-columns]');
    await expect(page.locator('[data-cols-menu]')).toBeVisible();
    await expect(page.locator('[data-col-toggle="company"]')).toBeDisabled();
    await page.click('[data-col-toggle="industry"]');
    await expect(page.locator('[data-col-toggle="industry"]')).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('th[data-col="industry"]')).toBeHidden();
    await expect(page.locator('[data-rows] td[data-col="industry"]').first()).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-cols-menu]')).toBeHidden();
    await expect(page.locator('[data-columns]')).toBeFocused();
    await page.reload();
    await expect(page.locator('th[data-col="industry"]')).toBeHidden();
    await page.click('[data-columns]'); await page.click('[data-col-toggle="industry"]');
    await expect(page.locator('th[data-col="industry"]')).toBeVisible();
  });
  test('sorting and saved state survive a reload', async ({ page }) => {
    await page.click('[data-sort="employees"]');
    await expect(page.locator('th[data-col="employees"]')).toHaveAttribute('aria-sort', 'ascending');
    await page.reload();
    await expect(page.locator('th[data-col="employees"]')).toHaveAttribute('aria-sort', 'ascending');
  });
});

test.describe('hero story', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'the story only plays on wide screens');

  test('clicking the table skips to the end state and saves nothing', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-tabs] .tab')).toHaveCount(2); // the story starts before the view exists
    await page.locator('[data-count]').click();
    await expect(page.locator('[data-count]')).toHaveText('28');
    await expect(page.getByRole('tab', { name: 'ICP · Not churned' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-story-thread]')).toHaveAttribute('data-state', 'end');
    expect(await page.evaluate(() => localStorage.getItem('rg-hero-table'))).toBeNull();
  });

  test('leaving the design lead view ends the story', async ({ page }) => {
    await page.goto('/');
    const thread = page.locator('[data-story-thread]');
    await expect(thread).toHaveAttribute('data-state', 'story', { timeout: 10_000 });
    await page.waitForTimeout(2500); // the PM is on the table
    await page.click('[data-view-option="engineer"]');
    // The story jumps to its end, as a click on the table does: the condition is added and the view is saved
    await expect(thread).toHaveAttribute('data-state', 'end');
    await expect(page.locator('[data-count]')).toHaveText('28');
    await expect(page.getByRole('tab', { name: 'ICP · Not churned' })).toHaveAttribute('aria-selected', 'true');
    // ...and nothing goes on moving
    await page.waitForTimeout(3000);
    await expect(thread).toHaveAttribute('data-state', 'end');
    const cursors = await page.locator('.hero .cursor').evaluateAll((els) => els.filter((c) => getComputedStyle(c).visibility !== 'hidden' && +getComputedStyle(c).opacity > 0).length);
    expect(cursors).toBe(0);
    await expect(page.locator('[data-say]:visible')).toHaveCount(0); // the messages went with their cursors
  });

  test('each message sits by its cursor and moves with it, then the story ends as the resolved comment', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    const thread = page.locator('[data-story-thread]');
    // The PM's message shows by the PM's cursor; the thread is hidden while the story plays
    await expect(page.locator('.cursor.c-pm [data-say="0"]')).toBeVisible({ timeout: 15_000 });
    await expect(thread).toBeHidden();
    // Rock's message sits above his cursor (20px) and goes with him from + Condition into the menu,
    // without covering the menu
    const rock = () => page.evaluate(() => {
      const a = document.querySelector('[data-specimen] > .cursor.c-rock .arrow')!.getBoundingClientRect();
      const b = document.querySelector('.cursor.c-rock [data-say="1"]')!.getBoundingClientRect();
      const m = document.querySelector('[data-add-menu]')!.getBoundingClientRect();
      return { y: a.top, gap: a.top - b.bottom, coversMenu: b.left < m.right && b.right > m.left && b.top < m.bottom && b.bottom > m.top };
    });
    await expect(page.locator('[data-add-menu]')).toBeVisible({ timeout: 20_000 }); // Rock has opened the menu
    await expect(page.locator('[data-say="1"]')).toBeVisible();
    const before = await rock();
    await page.waitForTimeout(2000); // Rock moves down to the condition
    const after = await rock();
    expect(after.y - before.y).toBeGreaterThan(50);
    expect(Math.round(before.gap)).toBe(20); expect(Math.round(after.gap)).toBe(20);
    expect(after.coversMenu).toBe(false);
    // End state, as before: no messages by the cursors, one resolved comment that opens
    await expect(thread).toHaveAttribute('data-state', 'end', { timeout: 30_000 });
    await expect(page.locator('[data-say]:visible')).toHaveCount(0);
    await expect(page.locator('[data-story-thread] [data-msg]:visible')).toHaveCount(1);
    await expect(page.locator('[data-resolved]')).toContainText('Show');
  });

  test('the resolved comment opens and folds the conversation', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-count]').click();
    const toggle = page.locator('[data-resolved]');
    await expect(toggle).toContainText('Show');
    await expect(page.locator('[data-story-thread] [data-msg]:visible')).toHaveCount(1);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toContainText('Hide');
    await expect(page.locator('[data-story-thread] [data-msg]:visible')).toHaveCount(4);
    await toggle.click();
    await expect(page.locator('[data-story-thread] [data-msg]:visible')).toHaveCount(1);
  });
});

// Plays the whole story and checks, every 200ms, that the PM's cursor never sits on a message from the Dev's question on
// (the PM leaves as the Dev comes in). A cursor is its arrow and its name tag. Only what is clearly on screen counts.
for (const width of [1200, 1440]) test.describe(`hero story at ${width}px`, () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' }, viewport: { width, height: 900 } });
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'the story only plays on wide screens');

  test('the PM leaves before the Dev asks, so the PM cursor never sits on the question or the answer', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    const thread = page.locator('[data-story-thread]');
    await expect(thread).toHaveAttribute('data-state', 'story', { timeout: 10_000 });
    const hits = new Set<string>();
    while ((await thread.getAttribute('data-state')) === 'story') {
      for (const h of await page.evaluate(() => {
        const shown = (e: Element) => { let o = 1; for (let n: Element | null = e; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o > 0.5; };
        const box = (es: Element[]) => { const rs = es.map((e) => e.getBoundingClientRect()); return { l: Math.min(...rs.map((r) => r.left)), t: Math.min(...rs.map((r) => r.top)), r: Math.max(...rs.map((r) => r.right)), b: Math.max(...rs.map((r) => r.bottom)) }; };
        const meet = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
        const cursors = [...document.querySelectorAll('[data-specimen] > .cursor')].filter(shown);
        const cards = [...document.querySelectorAll('[data-say]')].filter(shown);
        const name = (e: Element) => e.closest('.cursor')!.className.match(/c-(\w+)/)![1];
        const out: string[] = [];
        for (const c of cursors) for (const m of cards) if (m.closest('.cursor') !== c && meet(box([c.querySelector('.arrow')!, c.querySelector('.tag')!]), box([m]))) out.push(`${name(c)} cursor on message ${(m as HTMLElement).dataset.say}`);
        return out;
      })) hits.add(h);
      await page.waitForTimeout(200);
    }
    expect([...hits].filter((h) => /^pm cursor on message [23]$/.test(h))).toEqual([]);
  });
});
