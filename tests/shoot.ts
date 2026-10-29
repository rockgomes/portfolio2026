import { expect, type Page } from '@playwright/test';

// Each section is shot starting on a whole pixel. Content above a section can end on a fraction of a pixel, which
// shifts its text by a subpixel and changes how it renders. So before each shot, a tiny top margin (under 1px)
// moves the section onto the next whole pixel. Sections are shot top to bottom, so each one is snapped in turn.
export async function shoot(page: Page, sel: string, name: string, mask: string[] = []) {
  const b = await page.locator(sel).first().evaluate((e) => {
    const el = e as HTMLElement; const y = el.getBoundingClientRect().top + scrollY; const frac = y - Math.floor(y);
    if (frac > 0.001) el.style.marginTop = `${parseFloat(getComputedStyle(el).marginTop) + (1 - frac)}px`;
    const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  });
  await expect(page).toHaveScreenshot(name, { fullPage: true, mask: mask.map((m) => page.locator(m)), clip: { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.w), height: Math.round(b.h) } });
}

export const loadImages = (page: Page) => page.evaluate(async () => { await document.fonts.ready; for (const img of Array.from(document.images)) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
