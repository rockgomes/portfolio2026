// Puts an overlay page on top of a Shotkit card picture and saves the card (1940 x 1576 JPEG).
// From the repo root: node thumbnails/overlays/render.mjs thumbnails/overlays/formalist-store.html src/assets/cards/formalist.jpg
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const [html, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1940, height: 1576 } });
await page.goto(pathToFileURL(resolve(html)).href);
await page.evaluate(() => document.fonts.ready);
await page.locator('.shot').screenshot({ path: out, type: 'jpeg', quality: 90 });
await browser.close();
