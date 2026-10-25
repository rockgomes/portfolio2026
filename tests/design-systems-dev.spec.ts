import { test, expect } from '@playwright/test';

// Engineer view: Design systems as a small Storybook (Figma 218:2, phone 243:15).
const sb = '#design-systems-dev';

test.describe('storybook (desktop)', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1000, 'desktop layout');

  test('replaces the design lead section in the engineer view only', async ({ page }) => {
    await page.goto('/?view=engineer');
    await expect(page.locator(sb)).toBeVisible();
    await expect(page.locator('#design-systems')).toBeHidden();
    await page.locator('[data-view-option="design"]').click();
    await expect(page.locator(sb)).toBeHidden();
    await expect(page.locator('#design-systems')).toBeVisible();
  });

  test('the window has a fixed height and its page scrolls inside', async ({ page }) => {
    await page.goto('/?view=engineer');
    const box = await page.locator(`${sb} [data-sb]`).boundingBox();
    expect(Math.round(box!.height)).toBe(660); // clamp(560px, 100vh - 240px, 820px) at 900px tall
    const scroll = page.locator(`${sb} [data-sb-scroll]`);
    expect(await scroll.evaluate((e) => e.scrollHeight > e.clientHeight)).toBe(true);
  });

  test('the sidebar opens pages, and component pages open on Canvas', async ({ page }) => {
    await page.goto('/?view=engineer');
    const root = page.locator(sb);
    await expect(root.getByRole('tab', { name: 'Canvas' })).toHaveAttribute('aria-disabled', 'true');
    await root.getByRole('button', { name: 'Button', exact: true }).click();
    await expect(root.locator('[data-sb-go="button"]')).toHaveAttribute('aria-current', 'page');
    await expect(root.getByRole('tab', { name: 'Canvas' })).toHaveAttribute('aria-selected', 'true');
    await root.getByRole('tab', { name: 'Docs' }).click();
    await expect(root.locator('[data-sb-page="button"] [data-sb-panel="docs"]')).toBeVisible();
  });

  test('the Button controls drive a real .btn', async ({ page }) => {
    await page.goto('/?view=engineer');
    const root = page.locator(sb);
    await root.locator('[data-sb-go="button"]').click();
    const demo = root.locator('[data-sb-demo-btn]');
    await expect(demo).toHaveClass(/btn-primary/);
    await root.getByLabel('Label').fill('Save');
    await root.getByRole('radio', { name: 'Default' }).check();
    await expect(demo).toHaveText('Save');
    await expect(demo).not.toHaveClass(/btn-primary/);
    await root.getByLabel('State').selectOption('Focus');
    await expect(demo).toHaveClass(/is-focus/);
  });

  test('search filters the page list', async ({ page }) => {
    await page.goto('/?view=engineer');
    const root = page.locator(sb);
    await root.getByPlaceholder('Find components').fill('pill');
    await expect(root.locator('[data-sb-go]:visible')).toHaveCount(1);
    await root.getByPlaceholder('Find components').fill('zzz');
    await expect(root.locator('[data-sb-none]')).toBeVisible();
  });

  test('colour values are read live and follow the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/?view=engineer');
    const root = page.locator(sb);
    await root.locator('[data-sb-go="colour"]').click();
    const val = root.locator('[data-sb-page="colour"] [data-sb-val="annotation-measure"]');
    await expect(val).toHaveText('#0a7d44');
    await root.locator('[data-sb-theme-btn]').click();
    await expect(val).toHaveText('#3dd68c');
    await expect(root.locator('[data-sb-theme-btn] [data-sb-mode-name]')).toHaveText('Dark - Dev');
  });

  test('the demo segmented control works with arrow keys', async ({ page }) => {
    await page.goto('/?view=engineer');
    const root = page.locator(sb);
    await root.locator('[data-sb-go="segmented"]').click();
    const opts = root.locator('[data-sb-demo-seg] button');
    await opts.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(opts.nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(opts.nth(1)).toBeFocused();
  });
});

test.describe('storybook (phone)', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 760, 'phone layout');

  test('no fixed height, and the sidebar becomes a menu button', async ({ page }) => {
    await page.goto('/?view=engineer');
    const root = page.locator(sb);
    const menu = root.locator('[data-sb-menu]');
    await expect(menu).toBeVisible();
    await expect(root.locator('#sb-nav')).toBeHidden();
    expect(await root.locator('[data-sb-scroll]').evaluate((e) => getComputedStyle(e).overflowY)).toBe('visible');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await root.locator('[data-sb-go="pill"]').click();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toContainText('Status pill');
    await expect(root.locator('[data-sb-demo-pill]')).toBeVisible();
  });
});
