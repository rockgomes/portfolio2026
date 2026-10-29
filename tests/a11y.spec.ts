import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Automated accessibility check (axe-core, WCAG 2.2 A and AA rules) on every page type, in light and dark.
// The first test must pass. The second test holds the problems we know about and have not fixed yet:
// it is marked as expected to fail. When one is fixed, Playwright reports it as "unexpectedly passed":
// then remove it from KNOWN so it is guarded from then on.
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
// Known problems: where they are, which rules they break, on which page, at which width and in which theme.
// A problem is only checked where it shows (for example the filter panel is folded away at mobile width).
const KNOWN = [
  // Filter tags are under 24px tall. The "Filter mode" tab list also holds the live project count.
  { name: 'filter panel', where: '[data-side]', rules: ['target-size', 'aria-required-children'], url: '/?view=design', desktopOnly: true, scheme: null },
  // The Variant / State / Size buttons in the design system section are under 24px tall.
  { name: 'component property buttons', where: '[data-prop]', rules: ['target-size'], url: '/?view=design', desktopOnly: false, scheme: null as string | null },
  // The small "404" label uses the redline orange #ee5a36 (3.41 on white). Rock chose this orange over a darker one.
  { name: '404 label', where: '.eyebrow', rules: ['color-contrast'], url: '/404', desktopOnly: false, scheme: 'light' },
];
type Known = (typeof KNOWN)[number];
// Disabled-state samples in the design system section. WCAG does not ask disabled controls to pass contrast.
const DISABLED_SAMPLES = '[data-v].dis';

// One line per problem, so the CI log says what is wrong and where. Each problem is tagged with the KNOWN entry it
// belongs to (or null when it is new).
async function scan(page: Page, url: string) {
  await page.goto(url);
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).exclude(DISABLED_SAMPLES).analyze();
  const found: { line: string; known: string | null }[] = [];
  for (const v of violations) {
    for (const n of v.nodes) {
      const target = n.target.join(' ');
      const known = await page.evaluate(
        ({ target, rule, entries }) => {
          const el = document.querySelector(target);
          const hit = entries.find((k) => k.rules.includes(rule) && el && (el.closest(k.where) || el.querySelector(k.where)));
          return hit?.name ?? null;
        },
        { target, rule: v.id, entries: KNOWN.map(({ name, where, rules }) => ({ name, where, rules })) },
      );
      found.push({ line: `${v.id}: ${target} - ${n.failureSummary?.split('\n')[1]?.trim() ?? v.help}`, known });
    }
  }
  return found;
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    for (const url of PAGES) {
      test(`no accessibility problems on ${url}`, async ({ page }) => {
        expect((await scan(page, url)).filter((p) => !p.known).map((p) => p.line)).toEqual([]);
      });
    }

    for (const k of (KNOWN as Known[]).filter((k) => !k.scheme || k.scheme === scheme)) {
      test(`known problem on ${k.url}: ${k.name} (not fixed yet)`, async ({ page }, info) => {
        test.skip(k.desktopOnly && info.project.name !== 'desktop', 'hidden at this width');
        test.fail(true, `known problem: ${k.rules.join(', ')}`);
        expect((await scan(page, k.url)).filter((p) => p.known === k.name).map((p) => p.line)).toEqual([]);
      });
    }
  });
}
