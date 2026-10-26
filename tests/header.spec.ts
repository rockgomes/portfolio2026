import { test, expect } from '@playwright/test';

// The header: one "Projects" link (client work and experiments are one list), and the view switch in the same place
// in every view, on every screen size.
test('the nav has one Projects link', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('header .nav, header .mpanel');
  await expect(nav.getByRole('link', { name: 'Projects', includeHidden: true }).first()).toHaveAttribute('href', '/#work');
  await expect(nav.getByRole('link', { name: /^(Work|Experiments)$/, includeHidden: true })).toHaveCount(0);
});

test('the view switch stays in the same place in every view', async ({ page }) => {
  const spots: { x: number; y: number }[] = [];
  for (const view of ['design', 'recruiter', 'engineer']) {
    await page.goto(`/?view=${view}`);
    spots.push((await page.locator('.switch .seg').boundingBox())!);
  }
  // Within 1px: the bold label of the chosen view is a little wider, so the centred switch can move by half a pixel
  for (const s of spots) { expect(Math.abs(s.x - spots[0].x)).toBeLessThanOrEqual(1); expect(Math.abs(s.y - spots[0].y)).toBeLessThanOrEqual(1); }
});

// The recruiter view shows Experience and About; the other views also show Projects (the recruiter view has no
// Projects section).
// Wide screens show them in the header, small screens in the menu.
for (const [view, want] of [
  ['design', [['Projects', '/#work'], ['Experience', '/#experience'], ['About', '/#about']]],
  ['engineer', [['Projects', '/#work'], ['Experience', '/#experience'], ['About', '/#about']]],
  ['recruiter', [['Experience', '/#experience'], ['About', '/#about']]],
] as const) {
  test(`the ${view} view shows its links`, async ({ page, viewport }) => {
    await page.goto(`/?view=${view}`);
    const small = (viewport?.width ?? 0) <= 1040;
    if (small) await page.locator('[data-menu-btn]').click();
    const links = page.locator(small ? '[data-menu-link]:visible' : 'header .nav a:not(.btn):visible');
    await expect(links).toHaveCount(want.length);
    for (const [i, [label, href]] of want.entries()) {
      await expect(links.nth(i)).toContainText(label);
      await expect(links.nth(i)).toHaveAttribute('href', href);
    }
    if (small) await expect(links.first()).toBeFocused();
  });
}

// From 1041px to 1279px the recruiter header has no room for its links and copy email next to the CV button:
// they are in the Menu, and the CV button stays
test('the recruiter header at 1100px: CV button and Menu', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 700 });
  await page.goto('/?view=recruiter');
  await expect(page.locator('header .nav .cv-btn')).toBeVisible();
  await expect(page.locator('header .nav .copy')).toBeHidden();
  await expect(page.locator('header .nav a:not(.btn):visible')).toHaveCount(0);
  await page.locator('[data-menu-btn]').click();
  await expect(page.locator('[data-menu-link]:visible')).toHaveText([/Experience/, /About/]);
});

// Nothing on either side touches the centred switch, in any view, at the widths where the header is tightest
test('the header parts never touch the switch', async ({ page }) => {
  for (const width of [721, 1040, 1041, 1100, 1101, 1200, 1279, 1280, 1440]) {
    await page.setViewportSize({ width, height: 600 });
    for (const view of ['design', 'recruiter', 'engineer']) {
      await page.goto(`/?view=${view}`);
      const [left, right] = await page.evaluate(() => { const sw = document.querySelector('.switch')!.getBoundingClientRect(); return [sw.left - document.querySelector('.brand')!.getBoundingClientRect().right, document.querySelector('.end')!.getBoundingClientRect().left - sw.right]; });
      expect(Math.min(left, right), `${view} at ${width}px`).toBeGreaterThanOrEqual(16);
    }
  }
});
