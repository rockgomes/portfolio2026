import { test, expect } from '@playwright/test';

// Engineer view: the design systems section as one stacked story (DesignSystemsDev.astro).
test('the engineer view swaps in the stacked design systems section', async ({ page }) => {
  await page.goto('/?view=engineer');
  await expect(page.locator('#design-systems-dev')).toBeVisible();
  await expect(page.locator('#design-systems')).toBeHidden();
  for (const id of ['dsd-tokens', 'dsd-components', 'dsd-modes', 'dsd-a11y']) await expect(page.locator(`#${id}`)).toBeVisible();
  await page.locator('[data-view-option="design"]').click();
  await expect(page.locator('#design-systems')).toBeVisible();
  await expect(page.locator('#design-systems-dev')).toBeHidden();
});

test('a token change reaches the components, the mode panel and the contrast check', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/?view=engineer');
  const ds = page.locator('#design-systems-dev');
  const muted = ds.locator('[data-a11y="muted"] [data-r="light"]');
  await expect(muted).toContainText('3.3 : 1 fails');
  await ds.locator('[data-token="muted"] [data-opt="1"]').click();
  await expect(muted).toContainText('5.0 : 1 passes');
  await expect(ds.locator('[data-token="muted"] [data-hex]')).toHaveText('#6b6f76');
  await expect.poll(() => ds.locator('#dsd-components .meta').evaluate((e) => getComputedStyle(e).color)).toBe('rgb(107, 111, 118)');
  await expect.poll(() => ds.locator('[data-mode-panel="light"] .meta').evaluate((e) => getComputedStyle(e).color)).toBe('rgb(107, 111, 118)');
  await expect.poll(() => ds.locator('[data-mode-panel="dark"] .meta').evaluate((e) => getComputedStyle(e).color)).toBe('rgb(124, 130, 139)'); // Dark keeps its own value
  await ds.locator('[data-reset]').click();
  await expect(muted).toContainText('3.3 : 1 fails');
});

test('swatches work with the arrow keys', async ({ page }) => {
  await page.goto('/?view=engineer');
  const group = page.locator('#design-systems-dev [data-token="accent"]');
  await group.locator('[data-opt="0"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.locator('[data-opt="1"]')).toBeFocused();
  await expect(group.locator('[data-opt="1"]')).toHaveAttribute('aria-checked', 'true');
});

test('Components: a property change updates the code and the preview', async ({ page }) => {
  await page.goto('/?view=engineer');
  const ds = page.locator('#design-systems-dev');
  await ds.locator('[data-prop="variant"]').click();
  await expect(ds.locator('[data-code]')).toContainText('variant="secondary"');
  await expect(ds.locator('[data-btn]')).toHaveAttribute('data-variant', 'Secondary');
});

test('the mode switch changes the page; swatches follow the mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/?view=engineer');
  const ds = page.locator('#design-systems-dev');
  await ds.locator('[data-mode="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(ds.locator('[data-token="text"] [data-hex]')).toHaveText('#e8eaee');
  await expect(ds.locator('[data-mode-panel="dark"]')).toHaveAttribute('data-current', '');
});
