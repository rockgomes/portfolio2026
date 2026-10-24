import { test, expect } from '@playwright/test';

// Below 1040px the nav links live in a menu panel.
test('the menu opens, moves focus, and closes with Escape or a link', async ({ page, viewport }) => {
  await page.goto('/');
  const btn = page.locator('[data-menu-btn]');
  if ((viewport?.width ?? 0) > 1040) { await expect(btn).toBeHidden(); return; }
  await btn.click();
  await expect(page.locator('[data-menu]')).toBeVisible();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-menu-link]').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-menu]')).toBeHidden();
  await expect(btn).toBeFocused();
  await btn.click();
  await page.locator('[data-menu-link]', { hasText: 'About' }).click();
  await expect(page.locator('[data-menu]')).toBeHidden();
  await expect(page).toHaveURL(/#about$/);
});

test('the menu opens under its button, over a backdrop that closes it', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) > 1040, 'the menu is for small screens');
  await page.goto('/');
  await page.locator('[data-menu-btn]').click();
  const [btn, panel] = await Promise.all([page.locator('[data-menu-btn]').boundingBox(), page.locator('[data-menu]').boundingBox()]);
  expect(Math.round(panel!.y - (btn!.y + btn!.height))).toBe(8);
  await expect(page.locator('[data-menu-backdrop]')).toBeVisible();
  await page.mouse.click(viewport!.width / 2, viewport!.height - 40);
  await expect(page.locator('[data-menu]')).toBeHidden();
});

test('section links stop with the title just under the header', async ({ page }) => {
  await page.goto('/#about');
  await page.waitForTimeout(300);
  const gap = await page.evaluate(() => document.querySelector('#about h2')!.getBoundingClientRect().top - document.querySelector('header.hdr')!.getBoundingClientRect().bottom);
  expect(gap).toBeGreaterThan(10); expect(gap).toBeLessThan(40);
});
