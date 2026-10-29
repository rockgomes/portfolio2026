import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

// The 404 page (src/pages/404.astro). It has one version per view and no view switch: it uses the view the
// visitor chose last. Most tests run with reduced motion, where choices go to their page at once.
const MISSING = '/no-such-page';
const publicPages = (dir: string, base: string) =>
  readdirSync(`src/content/${dir}`)
    .filter((f) => !/^private:\s*true\s*$/m.test(readFileSync(`src/content/${dir}/${f}`, 'utf8')))
    .map((f) => `${base}/${f.replace(/\.mdx?$/, '')}`);
const pages = [...publicPages('projects', '/project'), ...publicPages('experiments', '/experiments')].sort();
const wide = (w?: number) => (w ?? 0) >= 1200;

test('an unknown address returns status 404 with the custom page and no view switch', async ({ page }) => {
  const r = await page.goto(MISSING);
  expect(r?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found - Rock Gomes');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('[data-view-option]')).toHaveCount(0);
});

test.describe('design view', () => {
  test('the frame name and the missing component note show the address', async ({ page }) => {
    await page.goto(MISSING);
    await expect(page.locator('[data-frame-name]')).toHaveText(MISSING);
    await expect(page.locator('.missing')).toContainText(`The main component for ${MISSING} was deleted.`);
    await expect(page.getByRole('heading', { level: 1, name: 'This page does not exist.' })).toBeVisible();
  });

  test('Swap instance lists every public page, in two groups', async ({ page }) => {
    await page.goto(MISSING);
    const hrefs = await page.locator('[data-swap-list] a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect([...hrefs].sort()).toEqual(pages);
    await expect(page.locator('[data-swap-list] .gh')).toHaveText(['Case studies', 'Experiments']);
    // Every option has a card picture for the preview.
    for (const src of await page.locator('[data-swap-list] a').evaluateAll((as) => as.map((a) => (a as HTMLElement).dataset.swap)))
      expect(src).toMatch(/\.webp$/);
  });

  test('pointing at an option previews it in the frame; leaving puts the address back', async ({ page }) => {
    await page.goto(MISSING);
    const opt = page.locator('[data-swap-list] a').first();
    const title = (await opt.getAttribute('data-title'))!;
    await opt.hover();
    await expect(page.locator('[data-frame]')).toHaveClass(/previewing/);
    await expect(page.locator('[data-frame-name]')).toHaveText(title);
    await expect(page.locator('[data-swap-img]')).toHaveAttribute('src', (await opt.getAttribute('data-swap'))!);
    await page.locator('.actions').hover();
    await expect(page.locator('[data-frame]')).not.toHaveClass(/previewing/);
    await expect(page.locator('[data-frame-name]')).toHaveText(MISSING);
  });

  test('the keyboard previews an option too', async ({ page }) => {
    await page.goto(MISSING);
    const opt = page.locator('[data-swap-list] a').nth(1);
    await opt.focus();
    await expect(page.locator('[data-frame-name]')).toHaveText((await opt.getAttribute('data-title'))!);
  });

  test('choosing an option opens that page', async ({ page }) => {
    await page.goto(MISSING);
    const opt = page.locator('[data-swap-list] a').first();
    const href = (await opt.getAttribute('href'))!;
    await opt.click();
    await expect(page).toHaveURL(href);
  });

  test('Undo goes to the homepage', async ({ page }) => {
    await page.goto(MISSING);
    await page.getByRole('button', { name: /Undo/ }).click();
    await expect(page).toHaveURL('/');
  });

  test('Cmd+Z (Ctrl+Z) goes to the homepage', async ({ page }) => {
    await page.goto(MISSING);
    await page.keyboard.press('ControlOrMeta+z');
    await expect(page).toHaveURL('/');
  });

  test("Rock's comment shows on wide screens and hides below 1200px", async ({ page, viewport }) => {
    await page.goto(MISSING);
    const say = page.locator('[data-say]');
    if (wide(viewport?.width)) {
      await expect(say).toBeVisible();
      await expect(say).toContainText('Who deleted this page?');
      // The comment is a child of the frame it points at, and stays inside it.
      const [f, s] = await Promise.all([page.locator('[data-frame]').boundingBox(), say.boundingBox()]);
      expect(s!.x).toBeGreaterThanOrEqual(f!.x);
      expect(s!.x + s!.width).toBeLessThanOrEqual(f!.x + f!.width);
    } else await expect(say).toBeHidden();
  });
});

test.describe('motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test("Rock's cursor glides in, then the comment shows", async ({ page, viewport }) => {
    test.skip(!wide(viewport?.width), 'the cursor only shows on wide screens');
    await page.goto(MISSING);
    await expect(page.locator('[data-say]')).toHaveClass(/\bon\b/, { timeout: 4000 });
  });

  test('Undo fills the frame with the homepage first, then goes there', async ({ page }) => {
    await page.goto(MISSING);
    await page.getByRole('button', { name: /Undo/ }).click();
    await expect(page.locator('[data-frame]')).toHaveClass(/restored/);
    await expect(page).toHaveURL('/', { timeout: 4000 });
  });

  test('choosing an option fills the frame first, then opens the page', async ({ page }) => {
    await page.goto(MISSING);
    const opt = page.locator('[data-swap-list] a').first();
    const href = (await opt.getAttribute('href'))!;
    await opt.click();
    await expect(page.locator('[data-frame]')).toHaveClass(/swapped/);
    await expect(page).toHaveURL(href, { timeout: 4000 });
  });
});

test.describe('engineer view', () => {
  const term = (page: import('@playwright/test').Page) => page.locator('[data-term-in]');
  const out = (page: import('@playwright/test').Page) => page.locator('[data-out]');
  const run = async (page: import('@playwright/test').Page, cmd: string) => { await term(page).fill(cmd); await term(page).press('Enter'); };

  test('the view comes from ?view=engineer, with the failed cd in red', async ({ page }) => {
    await page.goto(`${MISSING}?view=engineer`);
    await expect(page.locator('.nf-dev')).toBeVisible();
    await expect(page.locator('.nf')).toBeHidden();
    await expect(page.locator('.nf-dev .err').first()).toHaveText('no such file or directory:');
    await expect(page.locator('.nf-dev [data-path]').first()).toHaveText(MISSING);
  });

  test('the view also comes from the last choice saved in the browser', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('rg-view', 'engineer'));
    await page.goto(MISSING);
    await expect(page.locator('.nf-dev')).toBeVisible();
  });

  test('ls lists the folders; ls project lists the case studies', async ({ page }) => {
    await page.goto(`${MISSING}?view=engineer`);
    await run(page, 'ls');
    await expect(out(page)).toContainText('project/');
    await expect(out(page)).toContainText('experiments/');
    await run(page, 'ls project');
    for (const p of pages.filter((p) => p.startsWith('/project/'))) await expect(out(page).locator(`a[href="${p}"]`)).toHaveCount(1);
  });

  test('cd to a missing page and an unknown command both answer with a red error', async ({ page }) => {
    await page.goto(`${MISSING}?view=engineer`);
    await run(page, 'cd nowhere');
    await expect(out(page)).toContainText('no such file or directory: nowhere');
    await run(page, 'dance');
    await expect(out(page)).toContainText('command not found: dance');
    await expect(out(page).locator('.err')).toHaveCount(2);
  });

  test('Tab completes a command and a page name', async ({ page }) => {
    await page.goto(`${MISSING}?view=engineer`);
    await term(page).fill('who');
    await term(page).press('Tab');
    await expect(term(page)).toHaveValue('whoami ');
    await expect(term(page)).toBeFocused();
    await term(page).fill('cd flex');
    await term(page).press('Tab');
    await expect(term(page)).toHaveValue('cd project/flex-academy');
  });

  test('Up shows the last command', async ({ page }) => {
    await page.goto(`${MISSING}?view=engineer`);
    await run(page, 'whoami');
    await term(page).press('ArrowUp');
    await expect(term(page)).toHaveValue('whoami');
  });

  test('cd to a page opens it', async ({ page }) => {
    await page.goto(`${MISSING}?view=engineer`);
    await run(page, 'cd flex-academy');
    await expect(page).toHaveURL('/project/flex-academy');
  });
});

test('recruiter view is plain text with a link home', async ({ page }) => {
  await page.goto(`${MISSING}?view=recruiter`);
  const art = page.locator('.nf-rec');
  await expect(art).toBeVisible();
  await expect(art.getByRole('heading', { level: 1 })).toHaveText('This page does not exist.');
  await expect(art.getByRole('link', { name: 'Go to the homepage' })).toHaveAttribute('href', '/');
  await expect(page.locator('.nf, .nf-dev')).toHaveCount(2);
  await expect(page.locator('.nf')).toBeHidden();
  await expect(page.locator('.nf-dev')).toBeHidden();
  await expect(page.locator('[data-overlay]:visible')).toHaveCount(0);
});

test('with reduced motion nothing on the page keeps moving', async ({ page }) => {
  for (const view of ['design', 'engineer']) {
    await page.goto(`${MISSING}?view=${view}`);
    await page.waitForTimeout(300);
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running, `${view} view`).toBe(0);
  }
});

test('no sideways scroll from 320px to 1920px, in any view', async ({ page }) => {
  for (const width of [320, 400, 768, 1200, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const view of ['design', 'engineer', 'recruiter']) {
      await page.goto(`${MISSING}?view=${view}`);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(over, `${view} view at ${width}px`).toBe(0);
    }
  }
});
