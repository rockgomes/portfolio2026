import { test, expect } from '@playwright/test';

test('engineer view: photo labels as data-* attributes, the alt text and a file command', async ({ page }) => {
  await page.goto('/?view=engineer#about');
  const about = page.locator('#about');
  await expect(about.locator('.tag').first()).toHaveText('data-scene="mountain lake, morning haze"', { useInnerText: true });
  await expect(about.locator('.cmd')).toHaveText('$ file portrait.png');
  await expect(about.locator('.out')).toHaveText(/portrait\.png: JPEG image data, \d+x\d+/);
  await expect(about.locator('.alt')).toContainText('alt="Rock standing on a rock');
  await expect(about.locator('.portrait .sel')).toBeHidden();
  await expect(about.locator('.dim')).toBeHidden();
  // The design view keeps its labels and has none of the code
  await page.goto('/?view=design#about');
  await expect(about.locator('.tag').first()).toHaveText('scene: mountain lake, morning haze', { useInnerText: true });
  for (const sel of ['.cmd', '.out', '.alt']) await expect(about.locator(sel)).toBeHidden();
});
