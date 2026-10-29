// Makes the link preview image (public/og.png, 1200x630 at 2x) from the real homepage: the header and the hero,
// in the design lead view, light theme, with motion off so the hero is at rest. Drawn at 2x (2400x1260) so it
// stays sharp on high-density screens. The resolved comment thread under the table is hidden: at this size only
// its top edge fits, cut off at the bottom of the image. The orange half of the headline starts on its own line,
// so it does not share a line with the black half (Rock, 29 Oct).
// Run against a built site:  npx astro preview --port 4371  then  node scripts/make-share-image.mjs [url]
import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://localhost:4371';
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
await page.goto(`${url}/?view=design`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: '[data-story-thread] { display: none !important; } .h1-box .accent { display: block; }' });
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('wrote public/og.png');
