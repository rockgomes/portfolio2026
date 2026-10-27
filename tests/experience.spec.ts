import { test, expect } from '@playwright/test';

// Experience: independent work is one entry with a tab per client.
test('client tabs switch the details, with mouse and arrow keys', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#client-panel-well')).toBeVisible();
  await expect(page.locator('#client-panel-dealfront')).toBeHidden();
  await page.click('#client-tab-dealfront');
  await expect(page.locator('#client-tab-dealfront')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#client-panel-dealfront')).toBeVisible();
  await expect(page.locator('#client-panel-well')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#client-tab-romeo')).toBeFocused();
  await expect(page.locator('#client-panel-romeo')).toBeVisible();
  await expect(page.locator('#experience')).not.toContainText('Δ');
});

// Switching views adds or removes sections above Experience; the timeline must measure the page again.
test.describe('timeline after a view switch', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test('engineer to design lead: the timeline still draws to the last role', async ({ page }) => {
    await page.goto('/?view=engineer');
    await page.click('[data-view-option="design"]');
    // Wait for the switch motion to end (a scroll by script in the middle of it is not a visitor's scroll)
    await page.waitForFunction(() => !('switching' in document.documentElement.dataset));
    await page.evaluate(() => { const items = document.querySelectorAll('[data-timeline] .item'); const last = items[items.length - 1]; scrollTo(0, scrollY + last.getBoundingClientRect().top - innerHeight * 0.4); });
    const last = page.locator('[data-timeline] .item .body').last();
    await expect.poll(() => last.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  });
});

// Engineer view: the timeline reads as a git log (Figma: Experience A - git log graph).
test('engineer view: git log graph and branches', async ({ page }) => {
  await page.goto('/?view=engineer');
  const exp = page.locator('#experience');
  await expect(exp.locator('.cmd')).toHaveText('$ git log --graph --since=2016');
  await expect(exp.locator('.dim')).toBeHidden();
  await expect(exp.locator('.ref')).toHaveText('HEAD -> main');
  await expect(exp.locator('#client-tab-well')).toHaveText('well', { useInnerText: true });
  // The design lead view keeps the redline
  await page.goto('/?view=design');
  await expect(exp.locator('.cmd')).toBeHidden();
  await expect(exp.locator('.ref')).toBeHidden();
  await expect(exp.locator('#client-tab-well')).toHaveText('Well', { useInnerText: true });
});
