import { test, expect, type Page } from '@playwright/test';

// Screenshot comparison per section. Update on purpose with: npm run test:update
const sections = ['header.hdr', '.hero', '.numbers', '#work .sh-wrap', '#design-systems', '#experience', '#about', 'footer.ftr'];

// Each section is shot starting on a whole pixel. Content above a section can end on a fraction of a pixel, which
// shifts its text by a subpixel and changes how it renders. So before each shot, a tiny top margin (under 1px)
// moves the section onto the next whole pixel. Sections are shot top to bottom, so each one is snapped in turn.
async function shoot(page: Page, sel: string, name: string, mask: string[] = []) {
  const b = await page.locator(sel).first().evaluate((e) => {
    const el = e as HTMLElement; const y = el.getBoundingClientRect().top + scrollY; const frac = y - Math.floor(y);
    if (frac > 0.001) el.style.marginTop = `${parseFloat(getComputedStyle(el).marginTop) + (1 - frac)}px`;
    const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  });
  await expect(page).toHaveScreenshot(name, { fullPage: true, mask: mask.map((m) => page.locator(m)), clip: { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.w), height: Math.round(b.h) } });
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

// Case study pages. The live page is another site, so its iframe is masked.
test('case study summary looks the same as the approved screenshots', async ({ page }) => {
  await page.goto('/project/flex-academy');
  await loadImages(page);
  await shoot(page, '[data-case-summary]', 'case-summary.png', ['[data-live] iframe', '[data-live] video']);
  await shoot(page, '[data-next-case]', 'case-next.png');
});
