import { test, expect, type Page } from '@playwright/test';

// Screenshot comparison per section. Update on purpose with: npm run test:update
const sections = ['header.hdr', '.hero', '.numbers', '#work .sh-wrap', '#design-systems', '#experience', '#about', 'footer.ftr'];

// Cut each section from the full page at whole-pixel position and size. An element screenshot rounds its top
// and bottom edges separately, so content above that ends on a fraction of a pixel changed the image size by 1px.
async function shoot(page: Page, sel: string, name: string) {
  const b = await page.locator(sel).first().evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; });
  await expect(page).toHaveScreenshot(name, { fullPage: true, clip: { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.w), height: Math.round(b.h) } });
}

const loadImages = (page: Page) => page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });

test('sections look the same as the approved screenshots', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await loadImages(page);
  for (const sel of sections) await shoot(page, sel, `${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`);
});

test('first row of work cards', async ({ page }) => {
  await page.goto('/');
  await loadImages(page);
  await shoot(page, '[data-grid] > .card', 'work-card-first.png');
});
