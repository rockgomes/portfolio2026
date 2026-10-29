import { test } from '@playwright/test';
import { shoot, loadImages } from './shoot';

// Screenshot comparison per section. Update on purpose with: npm run test:update
const sections = ['header.hdr', '.hero', '.numbers', '#work .sh-wrap', '#design-systems', '#experience', '#about', 'footer.ftr'];

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
test('case study page looks the same as the approved screenshots', async ({ page }) => {
  await page.goto('/project/flex-academy');
  await loadImages(page);
  await shoot(page, '[data-case-summary]', 'case-summary.png', ['[data-live] iframe', '[data-live] video']);
  await shoot(page, '[data-next-case]', 'case-next.png');
  await shoot(page, '#decisions', 'case-decisions.png', ['#decisions video']);
  await shoot(page, '#process', 'case-process.png');
  await shoot(page, '#system', 'case-system.png');
  await shoot(page, '#built', 'case-built.png');
  await shoot(page, '#result', 'case-result.png');
});

test('Inbank case study page looks the same as the approved screenshots', async ({ page }) => {
  await page.goto('/project/inbank---customer-service-backoffice');
  await loadImages(page);
  for (const sel of ['[data-case-summary]', '#decisions', '#process', '#parts', '#result'])
    await shoot(page, sel, `inbank-${sel.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '')}.png`);
});
