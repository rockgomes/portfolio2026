import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

// Launch basics: what search engines and link previews (LinkedIn, Slack, iMessage) read from the site.
// They only fetch files, so this runs once (desktop project); the pages look the same to them at every width.
test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'files only: one run is enough');

const SITE = 'https://rockgomes.com';
const slugs = (dir: string) => readdirSync(`src/content/${dir}`).map((f) => f.replace(/\.mdx?$/, ''));
const isPrivate = (dir: string, slug: string) =>
  /^private:\s*true\s*$/m.test(readFileSync(`src/content/${dir}/${readdirSync(`src/content/${dir}`).find((f) => f.startsWith(`${slug}.`))}`, 'utf8'));

test('robots.txt lets search engines in and points to the sitemap', async ({ request }) => {
  const r = await request.get('/robots.txt');
  expect(r.status()).toBe(200);
  const body = await r.text();
  expect(body).toMatch(/^User-agent: \*$/m);
  expect(body).not.toMatch(/^Disallow: \/\s*$/m);
  expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});

test('the sitemap lists the homepage and every public case study and experiment, and nothing else', async ({ request }) => {
  const r = await request.get('/sitemap.xml');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-type']).toContain('xml');
  const listed = [...(await r.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  const expected = [
    `${SITE}/`,
    ...slugs('projects').filter((s) => !isPrivate('projects', s)).map((s) => `${SITE}/project/${s}`),
    ...slugs('experiments').filter((s) => !isPrivate('experiments', s)).map((s) => `${SITE}/experiments/${s}`),
  ].sort();
  expect(listed).toEqual(expected);
  // Every address in it is a real page.
  for (const url of listed) expect((await request.get(url.replace(SITE, ''))).status(), url).toBe(200);
});

test('every page has the browser icons', async ({ page, request }) => {
  for (const url of ['/', '/project/flex-academy', '/404']) {
    await page.goto(url);
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]'), url).toHaveAttribute('href', '/favicon.svg');
    await expect(page.locator('link[rel="icon"][sizes="32x32"]'), url).toHaveAttribute('href', '/favicon.ico');
    await expect(page.locator('link[rel="apple-touch-icon"]'), url).toHaveAttribute('href', '/apple-touch-icon.png');
  }
  for (const [file, type] of [['/favicon.svg', 'svg'], ['/favicon.ico', 'icon'], ['/apple-touch-icon.png', 'png']]) {
    const r = await request.get(file);
    expect(r.status(), file).toBe(200);
    expect(r.headers()['content-type'], file).toContain(type);
  }
});

test('pages have link preview tags, with the page title, its description and the share image', async ({ page, request }) => {
  const meta = (key: string) => page.locator(`meta[property="${key}"], meta[name="${key}"]`).first();
  for (const url of ['/', '/project/flex-academy', '/experiments/fieldset']) {
    await page.goto(url);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description, url).toBeTruthy();
    await expect(meta('og:title'), url).toHaveAttribute('content', title);
    await expect(meta('og:description'), url).toHaveAttribute('content', description!);
    // The real address, with no .html, is also the canonical one.
    await expect(page.locator('link[rel="canonical"]'), url).toHaveAttribute('href', `${SITE}${url}`);
    await expect(meta('og:url'), url).toHaveAttribute('content', `${SITE}${url}`);
    await expect(meta('og:type'), url).toHaveAttribute('content', 'website');
    await expect(meta('og:image'), url).toHaveAttribute('content', `${SITE}/og.png`);
    await expect(meta('og:image:alt'), url).toHaveAttribute('content', /.+/);
    await expect(meta('twitter:card'), url).toHaveAttribute('content', 'summary_large_image');
  }
  // The image is the size the tags say: 1200x630, drawn at 2x.
  await page.goto('/');
  await expect(meta('og:image:width')).toHaveAttribute('content', '2400');
  await expect(meta('og:image:height')).toHaveAttribute('content', '1260');
  const r = await request.get('/og.png');
  expect(r.status()).toBe(200);
  const png = await r.body();
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([2400, 1260]);
});
