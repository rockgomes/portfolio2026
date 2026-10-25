import { test, expect } from '@playwright/test';

// Engineer view: the design systems section as developer docs (DesignSystemsDev.astro).
test('the engineer view swaps in the docs version of design systems', async ({ page }) => {
  await page.goto('/?view=engineer');
  await expect(page.locator('#design-systems-dev')).toBeVisible();
  await expect(page.locator('#design-systems')).toBeHidden();
  await page.locator('[data-view-option="design"]').click();
  await expect(page.locator('#design-systems')).toBeVisible();
  await expect(page.locator('#design-systems-dev')).toBeHidden();
});

test('the side list switches the box, also with the arrow keys', async ({ page }) => {
  await page.goto('/?view=engineer');
  const ds = page.locator('#design-systems-dev');
  await expect(ds.locator('[data-pane="overview"]')).toBeVisible();
  await ds.getByRole('tab', { name: 'Components' }).click();
  await expect(ds.locator('[data-pane="components"]')).toBeVisible();
  await expect(ds.locator('[data-pane="overview"]')).toBeHidden();
  await page.keyboard.press('ArrowDown');
  await expect(ds.locator('[data-pane="modes"]')).toBeVisible();
  await expect(ds.getByRole('tab', { name: 'Modes' })).toBeFocused();
});

test('Components: a property change updates the props and the preview', async ({ page }) => {
  await page.goto('/?view=engineer');
  const ds = page.locator('#design-systems-dev');
  await ds.getByRole('tab', { name: 'Components' }).click();
  await ds.locator('[data-prop="variant"]').click();
  await expect(ds.locator('[data-code]')).toContainText('variant="secondary"');
  await expect(ds.locator('[data-btn]')).toHaveAttribute('data-variant', 'Secondary');
  await expect(ds.locator('[data-fig-props]')).toHaveText('Variant=Secondary, State=Default, Size=Medium');
});

test('Accessibility: ratios are read from the tokens, per mode', async ({ page }) => {
  await page.goto('/?view=engineer');
  const ds = page.locator('#design-systems-dev');
  await ds.getByRole('tab', { name: 'Accessibility' }).click();
  const pane = ds.locator('[data-pane="a11y"]');
  await pane.locator('[data-mode="light"]').click();
  await expect(pane.locator('[data-a11y="ratio"]')).toContainText('16.8 : 1'); // text/primary on white
  await pane.locator('[data-mode="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(pane.locator('[data-a11y="ratio"]')).toContainText('15.4 : 1');
});
