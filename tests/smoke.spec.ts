import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

const slugs = (dir: string) => readdirSync(`src/content/${dir}`).map((f) => f.replace(/\.mdx?$/, ''));

test('homepage loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('I design products, start to finish.');
  expect(errors).toEqual([]);
});

test('no sideways scroll on the homepage', async ({ page }) => {
  await page.goto('/');
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(sw).toBeLessThanOrEqual(cw);
});

test('every case study and experiment page works (same URLs as Webflow)', async ({ page }) => {
  // Each page has exactly one h1 (the page title); section headings start at h2.
  for (const s of slugs('projects')) { const r = await page.goto(`/project/${s}`); expect(r?.status(), s).toBe(200); await expect(page.locator('h1'), s).toHaveCount(1); }
  for (const s of slugs('experiments')) { const r = await page.goto(`/experiments/${s}`); expect(r?.status(), s).toBe(200); await expect(page.locator('h1'), s).toHaveCount(1); }
});
