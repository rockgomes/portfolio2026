import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

const slugs = (dir: string) => readdirSync(`src/content/${dir}`).map((f) => f.replace(/\.md$/, ''));

test('every case study and experiment page works (same URLs as Webflow)', async ({ page }) => {
  for (const s of slugs('projects')) { const r = await page.goto(`/project/${s}`); expect(r?.status(), s).toBe(200); await expect(page.locator('h1').first()).toBeVisible(); }
  for (const s of slugs('experiments')) { const r = await page.goto(`/experiments/${s}`); expect(r?.status(), s).toBe(200); await expect(page.locator('h1').first()).toBeVisible(); }
});

test('no sideways scroll on the homepage', async ({ page }) => {
  await page.goto('/');
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(sw).toBeLessThanOrEqual(cw);
});
