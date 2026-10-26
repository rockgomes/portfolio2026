import { test, expect } from '@playwright/test';

test('engineer view: photo labels as data-* attributes, the alt text and a file command', async ({ page }) => {
  await page.goto('/?view=engineer#about');
  const about = page.locator('#about');
  await expect(about.locator('.tag').first()).toHaveText('data-scene="mountain lake, morning haze"', { useInnerText: true });
  await expect(about.locator('.cmd')).toHaveText('$ file portrait.png');
  await expect(about.locator('.alt')).toContainText('alt="Rock standing on a rock');
  await expect(about.locator('.portrait .sel')).toBeHidden();
  await expect(about.locator('.dim')).toBeHidden();
  // The design view keeps its labels and has none of the code
  await page.goto('/?view=design#about');
  await expect(about.locator('.tag').first()).toHaveText('scene: mountain lake, morning haze', { useInnerText: true });
  for (const sel of ['.cmd', '.alt']) await expect(about.locator(sel)).toBeHidden();
});

test('engineer view: the portrait does not drag, and the projects have no comments', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'dragging and comments are desktop only');
  await page.goto('/?view=engineer#about');
  const p = page.locator('#about .portrait');
  await p.scrollIntoViewIfNeeded();
  const b = (await p.boundingBox())!;
  await page.mouse.move(b.x + 200, b.y + 200); await page.mouse.down();
  await page.mouse.move(b.x + 260, b.y + 240, { steps: 6 }); await page.mouse.up();
  const after = (await p.boundingBox())!;
  expect(Math.round(after.x - b.x)).toBe(0); expect(Math.round(after.y - b.y)).toBe(0);
  await expect(page.locator('#work .cm')).toHaveCount(3);
  for (const cm of await page.locator('#work .cm').all()) await expect(cm).toBeHidden();
});

test('engineer view: no cursors on the page, only the visitor\'s own in the footer', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'cursors are desktop only');
  await page.goto('/?view=engineer');
  const cursors = page.locator('#main .cursor');
  expect(await cursors.count()).toBeGreaterThan(0);
  for (const c of await cursors.all()) await expect(c).toBeHidden();
  await expect(page.locator('footer .cursor.c-you')).toHaveCount(1);
});
