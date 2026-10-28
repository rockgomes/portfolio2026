import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Automated accessibility check (axe-core, WCAG 2.2 A and AA rules) on every page type, in light and dark.
// The first test must pass. The second test holds the problems we know about and have not fixed yet:
// it is marked as expected to fail. When the last one is fixed, Playwright reports it as "unexpectedly passed":
// then move the rule out of KNOWN (or delete the second test) so it is guarded from then on.
const PAGES = [
  '/?view=design',
  '/?view=engineer',
  '/?view=recruiter',
  '/project/flex-academy',
  '/project/inbank---customer-service-backoffice',
  '/experiments/fieldset',
  '/404',
];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
// color-contrast: muted text and coloured tags fail, the new token values come from Figma.
// target-size: filter tags and Storybook option buttons are under 24px tall.
// aria-required-children: the "Filter mode" tab list also holds the live project count.
const KNOWN = ['color-contrast', 'target-size', 'aria-required-children'];
// Disabled-state samples in the design system section. WCAG does not ask disabled controls to pass contrast.
const DISABLED_SAMPLES = '[data-v].dis';

// One line per problem, so the CI log says what is wrong and where.
async function scan(page: Page, url: string, known: boolean) {
  await page.goto(url);
  const axe = new AxeBuilder({ page }).withTags(TAGS).exclude(DISABLED_SAMPLES);
  if (known) axe.withRules(KNOWN);
  else axe.disableRules(KNOWN);
  const { violations } = await axe.analyze();
  return violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} - ${n.failureSummary?.split('\n')[1]?.trim() ?? v.help}`),
  );
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    for (const url of PAGES) {
      test(`no accessibility problems on ${url}`, async ({ page }) => {
        expect(await scan(page, url, false)).toEqual([]);
      });

      test(`known problems on ${url} (not fixed yet)`, async ({ page }) => {
        test.fail(true, 'known problems: contrast, target size, filter tab list');
        expect(await scan(page, url, true)).toEqual([]);
      });
    }
  });
}
