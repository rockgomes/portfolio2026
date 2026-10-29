import { test, expect } from '@playwright/test';

// The header: one "Projects" link (client work and experiments are one list), and the view switch in the same place
// in every view, on every screen size.
test('the nav has one Projects link', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('header .nav, header .mpanel');
  await expect(nav.getByRole('link', { name: 'Projects', includeHidden: true }).first()).toHaveAttribute('href', '/#work');
  await expect(nav.getByRole('link', { name: /^(Work|Experiments)$/, includeHidden: true })).toHaveCount(0);
});

test('the view switch stays in the same place in every view', async ({ page, viewport }) => {
  // Wider screens: the radio group, centred (its middle stays). Less room: the "View as" dropdown, next to Menu (its
  // right edge stays).
  const small = (viewport?.width ?? 0) <= 520;
  const spots: { x: number; y: number }[] = [];
  for (const view of ['design', 'recruiter', 'engineer']) {
    await page.goto(`/?view=${view}`);
    const b = (await page.locator(small ? '[data-view-dd] [data-sb-dd-btn]' : '.switch > .ui-seg').boundingBox())!;
    spots.push({ x: small ? b.x + b.width : b.x + b.width / 2, y: b.y });
  }
  // Within 1px: the bold label of the chosen view is a little wider, so the centred switch can move by half a pixel
  for (const s of spots) { expect(Math.abs(s.x - spots[0].x)).toBeLessThanOrEqual(1); expect(Math.abs(s.y - spots[0].y)).toBeLessThanOrEqual(1); }
});

test('the switch says "View as" and the first view is "Designer"', async ({ page }) => {
  await page.goto('/');
  // Two radio groups: the header and the menu (smallest screens). Only one shows at a time.
  await expect(page.getByRole('radiogroup', { name: 'View as', includeHidden: true })).toHaveCount(2);
  await expect(page.locator('[data-view-option="design"]').first()).toHaveText('Designer');
  const lab = page.locator('.switch .lab');
  if (await lab.isVisible()) await expect(lab).toHaveText('View as');
});

// The header is one row at every width. As the room runs out, the switch gets smaller in steps: the radio group, then
// a "View as" dropdown (520px and below), then the radio group at the bottom of the Menu (380px and below).
test.describe('less room: the switch is a dropdown', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 520, 'small screens only');
  const ddBtn = '[data-view-dd] [data-sb-dd-btn]';

  test('one row: the label, the dropdown showing the chosen view, and Menu', async ({ page }) => {
    await page.goto('/?view=recruiter');
    await expect(page.locator('.switch > .ui-seg')).toBeHidden();
    await expect(page.locator('.switch .lab')).toBeVisible();
    const btn = page.locator(ddBtn);
    await expect(btn).toHaveText(/Recruiter/);
    await expect(btn).toHaveAccessibleName('View as: Recruiter');
    const [b, m] = await Promise.all([btn.boundingBox(), page.locator('[data-menu-btn]').boundingBox()]);
    expect(Math.abs(b!.y - m!.y)).toBeLessThanOrEqual(1);
    expect((await page.locator('header.hdr').boundingBox())!.height).toBeLessThan(80);
  });

  test('choosing a view closes the dropdown and changes the view', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator(ddBtn);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-view-dd] [data-value="Designer"]')).toBeFocused();
    await page.locator('[data-view-dd] [data-value="Engineer"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-view', 'engineer');
    await expect(page.locator('[data-view-dd] [role="menu"]')).toBeHidden();
    await expect(btn).toHaveText(/Engineer/);
    await expect(btn).toBeFocused();
  });

  test('keyboard: arrow down opens and moves, Escape and a tap outside close', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator(ddBtn);
    await btn.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-view-dd] [data-value="Designer"]')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-view-dd] [data-value="Recruiter"]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
    await btn.click();
    await page.mouse.click(20, 400);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('smallest screens: the switch is in the menu', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 720, 'phones only');
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 360, height: 760 }); });

  test('the header has only the name and Menu; the switch is after the links, full width', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.switch')).toBeHidden();
    await page.locator('[data-menu-btn]').click();
    const block = page.locator('.mview');
    await expect(block).toBeVisible();
    await expect(block.locator('.lab')).toHaveText('View as');
    const [about, sw, email, panel] = await Promise.all([
      page.locator('.mpanel a', { hasText: 'About' }).boundingBox(), block.locator('.ui-seg').boundingBox(),
      page.locator('.mcopy').boundingBox(), page.locator('.mpanel').boundingBox()]);
    expect(sw!.y).toBeGreaterThan(about!.y);
    expect(email!.y).toBeGreaterThan(sw!.y);
    expect(sw!.width).toBeGreaterThan(panel!.width - 40); // fills the panel (minus its padding)
    const widths = await block.locator('[role="radio"]').evaluateAll((b) => b.map((e) => Math.round(e.getBoundingClientRect().width)));
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1); // three equal options
  });

  test('choosing a view in the menu closes it and every form of the switch shows the new view', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-btn]').click();
    await page.locator('.mview [data-view-option="recruiter"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-view', 'recruiter');
    await expect(page.locator('[data-menu]')).toBeHidden();
    for (const o of await page.locator('[data-view-option="recruiter"]').all()) await expect(o).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-view-dd] [data-sb-dd-value]')).toHaveText('Recruiter');
  });
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
      // 12px: at 721px the space is about 16px on Linux (CI) and 23px on a Mac, in every view
      expect(Math.min(left, right), `${view} at ${width}px`).toBeGreaterThanOrEqual(12);
    }
  }
});

test('only the chosen view is in the tab order of the switch, and arrow keys move it', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) <= 520, 'the radio group shows above 520px (the dropdown has its own keyboard test)');
  await page.goto('/?view=recruiter');
  const opts = page.locator('.switch [role="radio"]');
  await expect(opts).toHaveCount(3);
  expect(await opts.evaluateAll((b) => b.map((e) => (e as HTMLElement).tabIndex))).toEqual([-1, 0, -1]);
  await opts.nth(1).focus();
  await page.keyboard.press('ArrowRight');
  await expect(opts.nth(2)).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('data-view', 'engineer');
  expect(await opts.evaluateAll((b) => b.map((e) => (e as HTMLElement).tabIndex))).toEqual([-1, -1, 0]);
});
