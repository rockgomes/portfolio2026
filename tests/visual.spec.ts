import { test, expect } from '@playwright/test';

// Screenshot comparison per section. Update on purpose with: npm run test:update
const sections = ['header.hdr', '.hero', '.numbers', '#work .sh-wrap', '#design-systems', '#experience', '#about', 'footer.ftr'];

test('sections look the same as the approved screenshots', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  for (const sel of sections) {
    const name = sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '');
    await expect(page.locator(sel).first()).toHaveScreenshot(`${name}.png`);
  }
});

test('first row of work cards', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('[data-grid] > .card').first();
  await first.scrollIntoViewIfNeeded();
  await page.evaluate(async () => { for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  await expect(first).toHaveScreenshot('work-card-first.png');
});
