import { test, expect } from '@playwright/test';

// The "Engineer" view (Figma 97:7542): Dev Mode inspect panel on the hero table, and repo cards.
test.use({ viewport: { width: 1440, height: 900 } });

test('the engineer view adds the repo cards, with real links', async ({ page }) => {
  await page.goto('/?view=engineer');
  const cards = page.locator('.repos .card');
  await expect(cards).toHaveCount(4);
  await expect(cards.first().locator('.name')).toHaveText('filter-builder');
  await expect(cards.first().locator('a.src')).toHaveAttribute('href', 'https://github.com/rockgomes/filter-builder');
  await expect(cards.first().getByRole('link', { name: /Live demo/ })).toHaveAttribute('href', 'https://fieldset-filter-builder.netlify.app');
  await page.locator('[data-view-option="design"]').click();
  await expect(page.locator('.repos')).toBeHidden();
});

test('the inspect panel follows the part you click, and its values are live', async ({ page }) => {
  await page.goto('/?view=engineer');
  const panel = page.locator('[data-panel]');
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-name]')).toHaveText('ConditionRow');
  await expect(page.locator('[data-story-thread]')).toBeHidden(); // the panel replaces the story here

  // The props tab shows the condition as it is now, and changes with it
  await panel.getByRole('tab', { name: 'Properties' }).click();
  await expect(panel.locator('[data-props]')).toContainText('"is_not"');
  await page.locator('[data-hero-table] .cond [data-op]').first().click();
  await expect(panel.locator('[data-props]')).toContainText('"is"');
  await expect(panel.locator('[data-props]')).not.toContainText('"is_not"');

  // Another part: the match count, linked to its real call site
  await page.locator('[data-hero-table] .count').click();
  await expect(panel.locator('[data-name]')).toHaveText('MatchCount');
  await expect(panel.getByRole('link', { name: /Open on GitHub/ })).toHaveAttribute('href', /filter-builder\/blob\/[0-9a-f]{40}\/src\/components\/FilterPanel\/FilterPanel\.tsx#L61-L72$/);
});

test('the Dev selection box sits on the part it names', async ({ page }) => {
  await page.goto('/?view=engineer');
  const cond = await page.locator('[data-hero-table] .cond').first().boundingBox();
  const box = await page.locator('[data-dsel]').boundingBox();
  expect(cond && box).toBeTruthy();
  for (const [a, b] of [[box!.x, cond!.x - 3], [box!.y, cond!.y - 3], [box!.width, cond!.width + 6], [box!.height, cond!.height + 6]]) expect(Math.abs(a - b)).toBeLessThan(1.5);
});

test('below 1200px the inspect panel hides, like the other overlays', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto('/?view=engineer');
  await expect(page.locator('.repos')).toBeVisible();
  await expect(page.locator('[data-panel]')).toBeHidden();
});

test('the inspect panel collapses to a small tab, and stays collapsed after a reload', async ({ page }) => {
  await page.goto('/?view=engineer');
  const fold = page.locator('[data-fold]');
  await fold.click();
  await expect(fold).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#insp-body')).toBeHidden();
  await expect(page.locator('[data-dsel]')).toBeHidden(); // the table shows clean
  await page.reload();
  await expect(page.locator('[data-fold]')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('[data-fold]').click();
  await expect(page.locator('#insp-body')).toBeVisible();
});
