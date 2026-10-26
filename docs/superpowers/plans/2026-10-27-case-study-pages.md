# Case study pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A new case study page structure (summary, decisions, how I got there, project sections, result, next case study), built first for Flex Academy, with the old Webflow embeds rebuilt as Astro components.

**Architecture:** Case study files can be MDX. A page whose frontmatter has `problem` uses the new layout: a summary from frontmatter, then the MDX body, which places case study components (`src/components/case/*`). Pages without it keep today's layout, untouched. Flex Academy data that the embeds held in JavaScript (method steps, pins, token values) moves to `src/data/flex-academy.ts`.

**Tech Stack:** Astro 6.4.8, `@astrojs/mdx@6.0.3` (the last line that supports Astro 6; 7.x and later need Astro 7), GSAP 3.15 via `src/lib/motion.ts`, Playwright 1.47.

**Spec:** `docs/superpowers/specs/2026-10-27-case-study-design.md`. Read it first. The Figma reference is sketch C, frame `375:10114` in file `MfrBjIutW2nsL0mimJgMnt` (Explorations page). Build each part from `get_design_context` on its node and compare a screenshot side by side.

## Global Constraints

- Plain English in code comments, commit messages and PR text. **No em dashes anywhere.** Use "-", a comma, a full stop or brackets.
- Never call the design "B2".
- Colours, type and shadows only via `var(--color-...)`, `var(--type-...)`, `var(--shadow-...)`, `var(--space-...)`, `var(--radius-...)`. Never raw hex in components. Never edit `src/styles/tokens.css`.
- Do not touch `HeroTable.astro`, `HeroStory.astro` or the values in `Hero.astro`.
- Do not edit the other nine files in `src/content/projects/`.
- No Figma layer on case pages: no view switch, section numbers, redlines, cursors, selection boxes, comment threads, "resolved" labels.
- Motion only as in `Experience.astro` client tabs (fade in about 0.3s, height ease about 0.35s) and videos that play in view. With `prefers-reduced-motion: reduce`: instant swaps, no autoplay, video controls shown.
- Every control works with the keyboard and has a visible `:focus-visible` outline (`2px solid var(--color-annotation-measure)`, like the work cards).
- No sideways scroll from 320px to 1920px on the Flex Academy page.
- Never invent numbers or copy. All copy comes from sketch C or from today's `flex-academy.md` and `public/embeds/flex-academy-embeds.js`.
- Flex Academy frontmatter gets `copyToCheck: true`. Each PR description lists every sentence Claude wrote that Rock has not confirmed (spec section 10).
- One branch and one PR per phase (below). Each PR passes `npm run check`, `npm run build`, `npm test`, and gets a Netlify preview. Rock merges. Never commit to `main`.
- Tests serve `dist/`, so run `npm run build` before `npx playwright test`.
- When a test writes new screenshots on purpose, say so in the PR. CI commits first-time screenshots.

## Review Focus

1. **Many controls on one page.** Seven tab or segmented groups live on the Flex page. Arrow keys in one group must never move another group, and ids must be unique on the page. Test: Task 6 checks two groups side by side.
2. **No JavaScript.** With JS off, every proof shows its first item and every video has a poster, so nothing is blank. Test: Task 6 (`javaScriptEnabled: false`).
3. **Phone widths.** Tab rows (seven method steps, three art directions) wrap; they never push the page sideways at 320px. Test: Task 5 overflow test runs again at the end of each phase.
4. **Reduced motion.** No video starts on its own; the live page shows the iframe or the video with controls, never an autoplaying video. Test: Task 6 and Task 4.
5. **The homepage must not change** when the work card moves into its own component. Test: Task 2 runs the existing homepage screenshots unchanged.

---

## Phase 1 (PR 1): template, summary, live page, next case study

Branch: `case-study-template`.

### Task 1: MDX and the new frontmatter fields

**Files:**
- Modify: `package.json` (add `"@astrojs/mdx": "6.0.3"` to dependencies)
- Modify: `astro.config.mjs` (add `integrations: [mdx()]`)
- Modify: `src/content.config.ts` (projects glob `'*.{md,mdx}'`; new optional fields)
- Rename: `src/content/projects/flex-academy.md` to `flex-academy.mdx` (body unchanged except `is:inline` on every `<script>` tag)
- Modify: `tests/smoke.spec.ts` (slug helper strips `.mdx` too)

**Interfaces:**
- Produces: these optional fields on `projects` entries:
  - `subtitle: z.string().default('')`
  - `facts: z.object({ role: z.string(), context: z.string(), made: z.string(), tools: z.string() }).optional()`
  - `problem: z.string().default('')`, `decision: z.string().default('')`, `result: z.string().default('')`
  - `links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([])`
  - `copyToCheck: z.boolean().default(false)`

- [ ] **Step 1: Change the smoke test slug helper**

```ts
const slugs = (dir: string) => readdirSync(`src/content/${dir}`).map((f) => f.replace(/\.mdx?$/, ''));
```

- [ ] **Step 2: Install MDX, add the integration, the glob and the fields, rename the file, add `is:inline` to its script tags**

Run: `npm install @astrojs/mdx@6.0.3 --save-exact`

- [ ] **Step 3: Build and run the smoke test**

Run: `npm run check && npm run build && npx playwright test smoke.spec.ts`
Expected: PASS. `/project/flex-academy` still returns 200 with one `h1`, and the old embeds still render (open it in `npm run preview` and look).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json astro.config.mjs src/content.config.ts src/content/projects tests/smoke.spec.ts
git commit -m "Case studies can be MDX; new summary fields (unused yet)"
```

### Task 2: Work card as its own component

**Files:**
- Create: `src/components/WorkCard.astro` (the `<li class="card">` markup from `SelectedWork.astro:65-86` and its card styles from `SelectedWork.astro:147-167`)
- Modify: `src/components/SelectedWork.astro` (use `<WorkCard>`; the per-card cursors and comments go into its `overlay` slot)

**Interfaces:**
- Produces: `WorkCard.astro` props `{ id: string; href: string; img?: ImageMetadata; alt: string; demo: string; d: ProjectOrExperimentData; hideNumber?: boolean }`, one named slot `overlay` inside `.thumb-wrap`. `cardTag` and `topics` move with it. `hideNumber` hides the `.n` index (used on case pages).
- Keeps: `.card`, `[data-id]`, `.thumb-wrap`, `.title a` class names, because the filter script and `Motion.astro` select them.

- [ ] **Step 1: Extract the component**

Scoped styles stop applying across components. Move every `.card ...`, `.thumb...`, `.meta...`, `.title...`, `.line`, `.foot`, `.demo...`, `.topic...` rule the card uses into `WorkCard.astro`. Keep grid, filter and `.card[hidden]` rules in `SelectedWork.astro` using `:global(.card)` where needed.

- [ ] **Step 2: Run the homepage tests, screenshots unchanged**

Run: `npm run build && npx playwright test visual.spec.ts work-filter.spec.ts overlays.spec.ts engineer.spec.ts recruiter.spec.ts`
Expected: PASS with no new or changed screenshots. A screenshot diff means a style did not move. Fix it; do not update screenshots.

- [ ] **Step 3: Commit**

```bash
git add src/components/WorkCard.astro src/components/SelectedWork.astro
git commit -m "Work card in its own component (no visual change)"
```

### Task 3: The case study layout and the summary

**Files:**
- Create: `src/components/case/CaseSummary.astro`
- Create: `src/components/case/CaseSection.astro`
- Modify: `src/pages/project/[slug].astro` (new layout when `d.problem` is set; today's layout otherwise)
- Modify: `src/content/projects/flex-academy.mdx` (frontmatter fields; remove the `fa-live` and `fa-facts` embed lines at the top of the body)
- Create: `tests/case-study.spec.ts`

**Interfaces:**
- Produces: `CaseSummary.astro` props `{ title: string; subtitle: string; lead: string; facts?: {role,context,made,tools}; problem: string; decision: string; result: string; links: {label,href}[] }`, plus a default slot for the main media. Root `<header data-case-summary>`. Facts are a `<dl data-facts>` with `dt` role, context, made, tools. The three blocks are `[data-pdr] > div` with a mono label (`problem`, `decision`, `result`). Links render in `[data-case-links]` as `<a class="btn">`, the first with `btn-primary`, all `target="_blank" rel="noopener"`.
- Produces: `CaseSection.astro` props `{ title: string; subtitle: string; id: string }`, default slot. Renders `<section aria-labelledby>` with `SectionHeader` (no `num`, no `dimension`).
- Produces: the page renders `<h1>` only in the summary title. `SectionHeader` renders `h2`, so the summary title is a separate `<h1>` styled like `SectionHeader .title` (`var(--type-display-row)`).

Flex frontmatter values (from sketch C, `375:10126`, and `fa-facts`):
- `subtitle: "The Flex · October 2026 · design challenge"`
- `facts`: role, context, made, tools exactly as in the `fa-facts` embed and the sketch.
- `problem`, `decision`, `result`: the full texts in sketch C (read them from the Figma node, they are cut in screenshots).
- `links`: `Open the live page ↗` `https://flex-academy-prototype.netlify.app`; `Figma prototype ↗` the `figma.com/proto/DTLIkqZYBhRsG82HONqHgC/...` URL in the embed script (decode `&amp;`); `Source code ↗` `https://github.com/rockgomes/flex-academy-prototype`.
- `copyToCheck: true`

- [ ] **Step 1: Write the failing tests**

```ts
import { test, expect } from '@playwright/test';

const FLEX = '/project/flex-academy';

test('summary: title, facts, problem, decision, result', async ({ page }) => {
  await page.goto(FLEX);
  const s = page.locator('[data-case-summary]');
  await expect(s.locator('h1')).toHaveText('Flex Academy');
  await expect(s.locator('[data-facts] dt')).toHaveText(['role', 'context', 'made', 'tools']);
  await expect(s.locator('[data-pdr] > div')).toHaveCount(3);
});

test('summary is in the first screen on desktop', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'desktop only');
  await page.goto(FLEX);
  const box = await page.locator('[data-pdr]').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
});

test('buttons link to the live page, the prototype and the source', async ({ page }) => {
  await page.goto(FLEX);
  const a = page.locator('[data-case-links] a');
  await expect(a).toHaveText(['Open the live page ↗', 'Figma prototype ↗', 'Source code ↗']);
  await expect(a.nth(0)).toHaveAttribute('href', 'https://flex-academy-prototype.netlify.app');
  await expect(a.nth(0)).toHaveClass(/btn-primary/);
  await expect(a.nth(2)).toHaveAttribute('href', 'https://github.com/rockgomes/flex-academy-prototype');
});

test('pages without the new fields keep the old layout', async ({ page }) => {
  await page.goto('/project/dealfront-dynamic-lists');
  await expect(page.locator('[data-case-summary]')).toHaveCount(0);
  await expect(page.locator('article.article h1')).toHaveCount(1);
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm run build && npx playwright test case-study.spec.ts`
Expected: FAIL (no `[data-case-summary]`). The last test passes already.

- [ ] **Step 3: Build `CaseSummary`, `CaseSection` and the layout switch; fill the Flex frontmatter**

Layout from sketch C `375:10126`: lead and facts on the left, problem / decision / result in three columns, buttons, then the media slot full width. One column below 800px.

- [ ] **Step 4: Run the tests**

Run: `npm run check && npm run build && npx playwright test case-study.spec.ts smoke.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/case src/pages/project src/content/projects/flex-academy.mdx tests/case-study.spec.ts
git commit -m "Case study layout: summary with facts, problem, decision, result and links"
```

### Task 4: The live page

**Files:**
- Create: `src/components/case/LivePage.astro`
- Modify: `src/content/projects/flex-academy.mdx` (frontmatter `live` field, or pass it in the page; see Interfaces)
- Modify: `src/content.config.ts` (`live: z.object({ src: z.string().url(), video: z.string(), poster: z.string(), caption: z.string() }).optional()`)
- Modify: `src/pages/project/[slug].astro` (renders `LivePage` in the summary media slot when `d.live` is set, else `homeImage`)
- Test: `tests/case-study.spec.ts`

**Interfaces:**
- Produces: `LivePage.astro` props `{ src: string; video: string; poster: string; caption: string; title: string }`. Root `<figure data-live>`. Holds an `<iframe loading="lazy" title={title}>` drawn at 1440×900 and scaled to the box width, and a `<video muted playsinline loop>` with `poster`. When the scale is under 0.5, the figure gets `data-phone`, the iframe hides and the video shows. With reduced motion, the video never autoplays and has `controls`. Behaviour from the `fa-live` embed (`fit()` function).

Flex values: `src: https://flex-academy-prototype.netlify.app`, `video: /embeds/flex-academy/flex-academy-hero-switch.mp4`, `poster: /embeds/flex-academy/flex-academy-hero-switch.jpg`, `caption: "The live page, scaled to fit. Try the switch, the calendar and the theme toggle."`, `title: "Flex Academy live page"`.

- [ ] **Step 1: Write the failing tests**

```ts
test('live page: iframe on desktop, video on phones', async ({ page, viewport }) => {
  await page.goto(FLEX);
  const live = page.locator('[data-live]');
  await expect(live.locator('figcaption')).toContainText('The live page, scaled to fit');
  if ((viewport?.width ?? 0) >= 1200) {
    await expect(live.locator('iframe')).toBeVisible();
    await expect(live).not.toHaveAttribute('data-phone', '');
  } else {
    await expect(live).toHaveAttribute('data-phone', '');
    await expect(live.locator('video')).toBeVisible();
  }
});

test('live page video does not play on its own with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 });
  await page.goto(FLEX);
  const v = page.locator('[data-live] video');
  await expect(v).toHaveAttribute('controls', '');
  expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm run build && npx playwright test case-study.spec.ts -g "live page"`
Expected: FAIL (no `[data-live]`).

- [ ] **Step 3: Build `LivePage` and wire it in**

- [ ] **Step 4: Run the tests**

Run: `npm run build && npx playwright test case-study.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/case/LivePage.astro src/content.config.ts src/pages/project src/content/projects/flex-academy.mdx tests/case-study.spec.ts
git commit -m "Case study: the live page, scaled to fit, with a video on phones"
```

### Task 5: Next case study, the generic rules, overflow and screenshots

**Files:**
- Create: `src/components/case/NextCase.astro`
- Modify: `src/pages/project/[slug].astro` (renders `NextCase` after the body, new layout only)
- Test: `tests/case-study.spec.ts`, `tests/visual.spec.ts`

**Interfaces:**
- Consumes: `WorkCard.astro` (Task 2) with `hideNumber`.
- Produces: `NextCase.astro` props `{ currentId: string }`. Picks the next public project by `cardOrder` (projects only, not experiments, skip `isPrivate`), wrapping to the first. Renders `<section data-next-case>` with the mono label `next case study` and one `WorkCard`.

- [ ] **Step 1: Write the failing tests**

```ts
test('next case study is the next project by card order', async ({ page }) => {
  await page.goto(FLEX);
  const next = page.locator('[data-next-case]');
  await expect(next.locator('.title a')).toHaveAttribute('href', '/project/inbank---customer-service-backoffice');
  await expect(next.locator('.meta .n')).toBeHidden();
});

test('no Figma layer on the case study page', async ({ page }) => {
  await page.goto(FLEX);
  for (const sel of ['.cursor', '[data-overlay]', '.selection', '.comment', '.resolved', '[data-view-option]', '.redline', '.dim'])
    await expect(page.locator(`main ${sel}, header ${sel}`), sel).toHaveCount(0);
});

for (const width of [320, 400]) {
  test(`no sideways scroll on the Flex page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto(FLEX);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}
```

Check the class names in the selector list against `Cursor.astro`, `SelectionBox.astro`, `Comment.astro`, `ResolvedThread.astro`, `ResolvedLabel.astro`, `Dimension.astro` and use their real root classes.

Add to `tests/visual.spec.ts` a test `case study summary looks the same as the approved screenshots` that opens `/project/flex-academy`, runs `loadImages`, and shoots `[data-case-summary]` (name `case-summary.png`) and `[data-next-case]` (name `case-next.png`) with `shoot()`. Hide the iframe content with a mask (`mask: [page.locator('[data-live] iframe')]` passed through `shoot`) so the remote page does not make the screenshot flaky.

- [ ] **Step 2: Run them to see them fail**

Run: `npm run build && npx playwright test case-study.spec.ts`
Expected: FAIL on the next case study test. The other two may pass already; if overflow fails, the old body below the summary is the cause, so fix it in the Flex MDX only.

- [ ] **Step 3: Build `NextCase` and wire it in**

- [ ] **Step 4: Run everything**

Run: `npm run check && npm run build && npx playwright test`
Expected: PASS, with new screenshots written for `case-summary` and `case-next`. Look at them before you commit.

- [ ] **Step 5: Commit, push, open PR 1**

```bash
git add src/components/case/NextCase.astro src/pages/project tests
git commit -m "Case study: next case study card, generic-page checks, screenshots"
git push -u origin case-study-template
```

PR body: what changed, the preview link `/project/flex-academy`, the list of new unconfirmed sentences (problem, decision, result), and that new screenshots were added on purpose.

---

## Phase 2 (PR 2): the three decisions

Branch: `case-study-decisions`, from `main` after PR 1 is merged.

### Task 6: Proof switch and proof video

**Files:**
- Create: `src/components/case/ProofSwitch.astro`
- Create: `src/components/case/ProofVideo.astro`
- Create: `src/components/case/Proof.astro` (one piece of proof: picture or video, with caption)
- Create: `tests/case-proof.spec.ts`

**Interfaces:**
- Produces: `ProofVideo.astro` props `{ src: string; poster: string; label: string; width: number; height: number; replay?: boolean }`. `<video muted playsinline loop preload="metadata">`, plays when 35% in view and pauses when out (IntersectionObserver). With reduced motion: `controls`, no `loop`, no autoplay. `replay` adds a `<button class="btn" data-replay>Replay</button>`. Behaviour from `auto()` in the `fa-truth` embed.
- Produces: `Proof.astro` props `{ media: { kind: 'image'; src: ImageMetadata | string; alt: string; width: number; height: number } | { kind: 'video'; src: string; poster: string; label: string; width: number; height: number }; caption?: string; replay?: boolean }`. Renders `<figure data-proof>`.
- Produces: `ProofSwitch.astro` props `{ kind: 'tabs' | 'segmented'; label: string; id: string; items: { label: string; caption: string; media: <same as Proof media> }[]; replay?: boolean }`. Root `[data-switch]`. `kind: 'tabs'` renders a `role="tablist"` of `.ctab`-style buttons (`Experience.astro:82-84` look, Figma Tab `195:113`); `kind: 'segmented'` renders a `role="radiogroup"` like `.seg` in `SiteHeader.astro:56-59` (Figma Segmented control `193:119`). Panels are `[data-proof-panel]`, all rendered, only the selected one visible. Ids are prefixed with `id`. Arrow keys move inside the group only. On switch: a playing video in the old panel pauses; the new panel's video plays if not reduced motion. Fade and height ease exactly like `Experience.astro:117-124`.

- [ ] **Step 1: Write the failing tests**

Use the Flex page, which gets two switches in Task 7. Write them now against the ids Task 7 will use (`d1` segmented, `d2` tabs):

```ts
import { test, expect } from '@playwright/test';
const FLEX = '/project/flex-academy';

test('a segmented switch swaps the picture and the caption', async ({ page }) => {
  await page.goto(FLEX);
  const sw = page.locator('[data-switch="d1"]');
  await expect(sw.getByRole('radio', { name: 'Starting out' })).toHaveAttribute('aria-checked', 'true');
  await sw.getByRole('radio', { name: 'I run units' }).click();
  await expect(sw.locator('[data-proof-panel]:visible figcaption')).toContainText('I run units');
});

test('arrow keys move inside one group only', async ({ page }) => {
  await page.goto(FLEX);
  const d2 = page.locator('[data-switch="d2"]');
  await d2.getByRole('tab', { name: 'Launch · webinar' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(d2.getByRole('tab', { name: 'Scale · strategy call' })).toBeFocused();
  await expect(d2.getByRole('tab', { name: 'Scale · strategy call' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-switch="d1"]').getByRole('radio', { name: 'Starting out' })).toHaveAttribute('aria-checked', 'true');
});

test('no video plays on its own with reduced motion', async ({ page }) => {
  await page.goto(FLEX);
  for (const v of await page.locator('main video').all()) {
    await v.scrollIntoViewIfNeeded();
    expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('every switch shows its first item and every video has a poster', async ({ page }) => {
    await page.goto(FLEX);
    for (const sw of await page.locator('[data-switch]').all()) await expect(sw.locator('[data-proof-panel]:visible')).toHaveCount(1);
    for (const v of await page.locator('main video').all()) await expect(v).toHaveAttribute('poster', /.+/);
  });
});

test.describe('with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test('the decision video plays when in view', async ({ page }) => {
    await page.goto(FLEX);
    const v = page.locator('[data-decision="3"] video');
    await v.scrollIntoViewIfNeeded();
    await expect.poll(() => v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(false);
  });
});
```

- [ ] **Step 2: Build the three components** (they are used in Task 7; the tests run there)

- [ ] **Step 3: Commit**

```bash
git add src/components/case/Proof*.astro tests/case-proof.spec.ts
git commit -m "Case study: proof, proof video and proof switch components"
```

### Task 7: Decisions 1 to 3 in the Flex page

**Files:**
- Create: `src/components/case/Decision.astro`
- Create: `src/assets/projects/flex-academy/flex-academy-hero-operator.jpg` (the operator hero still)
- Modify: `src/content/projects/flex-academy.mdx` (replace the old "Three decisions I would defend", "The moment of commitment" and the `fa-truth` and `fa-flows` embeds)
- Test: `tests/case-proof.spec.ts` (from Task 6), `tests/visual.spec.ts`

**Interfaces:**
- Consumes: `CaseSection` (Task 3), `Proof`, `ProofSwitch` (Task 6).
- Produces: `Decision.astro` props `{ n: number; of: number; title: string }`, slots: default (the text) and `proof`. Root `<article data-decision={n}>` with the mono label `decision {n} of {of}`, an `h3` title, text left and proof right on wide screens (sketch C `376:10124`).

Content (sketch C `376:10124`; read full texts from the node):
- Section: `CaseSection` title "Three decisions I would defend", subtitle "the ideas that made the page work", id `decisions`.
- Decision 1 "The calendar is the main idea": `ProofSwitch kind="segmented" id="d1" label="Path"` with items "Starting out" (image `public/embeds/flex-academy/flex-academy-hero.jpg`, caption from the sketch for the launch hero; if the sketch has none, reuse the summary caption wording and list it as new copy) and "I run units" (the operator still, caption: `The same hero for an operator: "I run units" changes the headline, the button and the calendar, and moves the "You are here" marker.`).
- Decision 2 "The call to action is a booking": `ProofSwitch kind="tabs" id="d2" label="Booking flow" replay` with "Launch · webinar" (`flex-academy-booking-launch.mp4`, poster `.jpg`, caption "Launch: name and email, then the seat is booked. 18 seconds.") and "Scale · strategy call" (`flex-academy-booking-scale.mp4`, caption from the `fa-flows` embed: "Scale: four questions, a day and a time, then the confirmation. 27 seconds."). Video labels from `fa-flows`.
- Decision 3 "Proof without promises": four Pills (`ui-tag`, Figma Pill `246:131` Small Neutral): since 2019, 7 cities, 150+ corporate partners, 130+ booking channels. `Proof` with the `flex-academy-hard-truth.mp4` video, poster `.jpg`, label from `fa-truth`, caption "Scrolling turns the same day from chaos into order."

The operator still: one frame of `public/embeds/flex-academy/flex-academy-hero-switch.mp4` at about 0.5s, 1440×900 JPEG (ffmpeg is not installed; a Playwright page with a `<video>`, seek with `currentTime = 0.5`, then `locator('video').screenshot()` works). Compare it with sketch C node `376:10152`, which holds the same frame.

- [ ] **Step 1: Make the operator still**

- [ ] **Step 2: Build `Decision` and rewrite the decisions part of the MDX**

- [ ] **Step 3: Add `[data-decision="1"]`, `"2"`, `"3"` to the visual test** (names `case-decision-1.png` and so on; mask videos)

- [ ] **Step 4: Run everything**

Run: `npm run check && npm run build && npx playwright test`
Expected: PASS, new decision screenshots written. Compare with sketch C `376:10124` side by side.

- [ ] **Step 5: Commit, push, open PR 2**

```bash
git add src/components/case/Decision.astro src/assets/projects/flex-academy src/content/projects/flex-academy.mdx tests
git commit -m "Flex Academy: the three decisions, with switchable proof"
git push -u origin case-study-decisions
```

PR body lists new copy: the decision 1 caption, the section subtitle, and any caption that is not in today's page.

---

## Phase 3 (PR 3): how I got there, design system, result

Branch: `case-study-process`, from `main` after PR 2 is merged.

### Task 8: Flex data file and the method stepper

**Files:**
- Create: `src/data/flex-academy.ts`
- Create: `src/components/case/MethodStepper.astro`
- Modify: `src/content/projects/flex-academy.mdx` (start of "How I got there"; remove the old "How I ran it" section and the `fa-method` embed)
- Test: `tests/case-study.spec.ts`

**Interfaces:**
- Produces in `src/data/flex-academy.ts`:
  - `export type Step = { name: string; short: string; solo: { lead: string; items: string[]; gate: string }; team: { lead: string; items: string[]; gate: string }; why: string }`
  - `export const steps: Step[]` (the seven entries of `P` in the `fa-method` embed, and the `why` texts from the same embed, verbatim)
  - `export type Pin = { name: string; kind: string; x: number; y: number; w: number; h: number; props: [ 'c' | 't' | 's' | 'x', string, string? ][] }`
  - `export const pins: Pin[]` (the `L` array in `fa-ins`; positions are on a 1440×905 hero)
  - `export const tokenValues: Record<string, [light: string, dark: string]>` (the `V` object in `fa-ins`). These hex values describe the Flex design system as content, so they are data, not site styles; the "no raw hex" rule is about the site's own components.
  - `export const spaceValues: Record<string, string>` (the `S` object)
- Produces: `MethodStepper.astro` props `{ steps: Step[] }`. Root `[data-method]`: a segmented control "This challenge, solo" / "With a team" (`role="radiogroup"`), seven tabs labelled `01 Frame` to `07 Build and verify`, and one panel. All seven panels are rendered in HTML for no-JS readers (solo view); JS only toggles.

- [ ] **Step 1: Write the failing test**

```ts
test('method: seven steps, solo and team', async ({ page }) => {
  await page.goto(FLEX);
  const m = page.locator('[data-method]');
  await expect(m.getByRole('tab')).toHaveCount(7);
  await m.getByRole('tab', { name: '03 Structure' }).click();
  await expect(m.locator('[role="tabpanel"]:visible')).toContainText('Ten sections');
  await m.getByRole('radio', { name: 'With a team' }).click();
  await expect(m.locator('[role="tabpanel"]:visible')).toContainText('Wireframes reviewed with PM and engineering');
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npm run build && npx playwright test case-study.spec.ts -g method`
Expected: FAIL.

- [ ] **Step 3: Write the data file and the stepper; place it under `CaseSection` "How I got there" (subtitle "the process, short", id `process`)**

- [ ] **Step 4: Run it**

Run: `npm run build && npx playwright test case-study.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/flex-academy.ts src/components/case/MethodStepper.astro src/content/projects/flex-academy.mdx tests/case-study.spec.ts
git commit -m "Flex Academy: method stepper, solo and team"
```

### Task 9: Research, wireframe vs final, art directions

**Files:**
- Create: `src/components/case/CompareSlider.astro`
- Create: `src/components/case/ProcessBlock.astro`
- Modify: `src/content/projects/flex-academy.mdx` (replace "Research" and "Exploration" sections and the `fa-cmp` and `fa-dirs` embeds)
- Test: `tests/case-study.spec.ts`

**Interfaces:**
- Consumes: `Proof`, `ProofSwitch` (Task 6).
- Produces: `ProcessBlock.astro` props `{ label: string; title: string }`, slots default (text) and `proof`. Same two-column layout as `Decision`, with a mono label.
- Produces: `CompareSlider.astro` props `{ before: {src, alt}; after: {src, alt}; beforeLabel: string; afterLabel: string; width: number; height: number }`. Root `[data-compare]` with `--x` (start `50%`). The control is an `<input type="range" min="0" max="100" value="50" aria-label="Compare wireframe and final">` over the images; the visible ⇆ handle follows it. Tags `beforeLabel` / `afterLabel` (`ui-tag`) sit at the bottom corners. Images from the `fa-cmp` embed.

Content (sketch C `376:10189`): three `ProcessBlock`s:
1. label "research", title "A board of reasons, not screenshots", the references image `src/assets/projects/flex-academy/flex-academy-references.jpg` with its existing caption.
2. label "structure first", title "The wireframe was right and still felt wrong", `CompareSlider` (wireframe `flex-academy-wireframe-hero.jpg`, final `flex-academy-hero.jpg`, labels "wireframe" / "final").
3. label "art directions", title "Same content, three ideas", `ProofSwitch kind="tabs" id="dirs" label="Art directions"` with "Lights On", "Your Next Unit", "The Calendar · chosen". Images and the one-line verdicts (as captions) from the `fa-dirs` embed (`N` array and its image list).

- [ ] **Step 1: Write the failing test**

```ts
test('compare slider moves with the arrow keys', async ({ page }) => {
  await page.goto(FLEX);
  const c = page.locator('[data-compare]');
  const range = c.locator('input[type="range"]');
  await range.focus();
  await page.keyboard.press('ArrowRight');
  await expect(range).toHaveValue('51');
  expect(await c.evaluate((e) => getComputedStyle(e).getPropertyValue('--x').trim())).toBe('51%');
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npm run build && npx playwright test case-study.spec.ts -g compare`
Expected: FAIL.

- [ ] **Step 3: Build `ProcessBlock` and `CompareSlider`; rewrite the MDX part**

- [ ] **Step 4: Run it, plus the proof tests (the new `dirs` switch is now on the page)**

Run: `npm run build && npx playwright test case-study.spec.ts case-proof.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/case/CompareSlider.astro src/components/case/ProcessBlock.astro src/content/projects/flex-academy.mdx tests/case-study.spec.ts
git commit -m "Flex Academy: research, wireframe vs final, art directions"
```

### Task 10: Inspect, stats and coverage

**Files:**
- Create: `src/components/case/InspectPins.astro`
- Create: `src/components/case/StatGrid.astro`
- Modify: `src/content/projects/flex-academy.mdx` (replace "The design system behind it", "Inspect it yourself", "Components" and the `fa-ins` and `fa-stats` embeds; the two component images are cut, spec section 5)
- Test: `tests/case-study.spec.ts`

**Interfaces:**
- Consumes: `pins`, `tokenValues`, `spaceValues` from `src/data/flex-academy.ts` (Task 8).
- Produces: `InspectPins.astro` props `{ pins: Pin[]; tokens: typeof tokenValues; spaces: typeof spaceValues; light: {src, alt}; dark: {src, alt} }`. Root `[data-inspect]`. A segmented control "Light" / "Dark". The pins are `<button class="pin" aria-pressed>` with the Figma Pin `21:125` look (number), placed with `%` from the pin data inside the hero picture's own box (children of the picture wrapper, overlays rule). The panel `[data-inspect-panel]` has `aria-live="polite"` and lists the selected layer's kind, name and props (swatch, token name, value in the current mode) like `draw()` in `fa-ins`. Start with pin 4 (Button) selected, as the embed does. Pins show at every width (they are content, not decoration); below 800px the panel sits under the picture.
- Produces: `StatGrid.astro` props `{ stats: { value: string; unit: string; copy: string }[]; note?: string }`. Root `[data-stats]`, Figma Stat (large) `61:2812` look. `note` is the coverage line under the grid.

Content (sketch C `377:10168`): `CaseSection` "The design system behind it", subtitle "every layer on a token, in Light and Dark", id `system`; text "Claims are easy, so inspect it" with the paragraph from the sketch; `InspectPins` with light `flex-academy-hero.jpg` and dark `flex-academy-dark-hero.jpg`; `StatGrid` with 15 sets "component sets, each with a description", 54 variants "with named properties, no detaching", 36 styles "text styles in six roles", 2 modes "Light and Dark, on every page"; note: the coverage line from the sketch (77/77, 329/329, 118/118, 1,182/1,182).

- [ ] **Step 1: Write the failing test**

```ts
test('inspect: a pin shows its tokens, dark mode changes the values', async ({ page }) => {
  await page.goto(FLEX);
  const ins = page.locator('[data-inspect]');
  const panel = ins.locator('[data-inspect-panel]');
  await ins.getByRole('button', { name: 'Inspect Headline' }).click();
  await expect(ins.getByRole('button', { name: 'Inspect Headline' })).toHaveAttribute('aria-pressed', 'true');
  await expect(panel).toContainText('text/primary');
  const light = await panel.innerText();
  await ins.getByRole('radio', { name: 'Dark' }).click();
  await expect.poll(() => panel.innerText()).not.toBe(light);
  await expect(page.locator('[data-stats] > *')).toHaveCount(4);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npm run build && npx playwright test case-study.spec.ts -g inspect`
Expected: FAIL.

- [ ] **Step 3: Build `InspectPins` and `StatGrid`; rewrite the MDX part**

- [ ] **Step 4: Run it**

Run: `npm run build && npx playwright test case-study.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/case/InspectPins.astro src/components/case/StatGrid.astro src/content/projects/flex-academy.mdx tests/case-study.spec.ts
git commit -m "Flex Academy: inspect the hero layers, stats and coverage"
```

### Task 11: Built, not just drawn; If it shipped; finish

**Files:**
- Create: `src/components/case/TwoCol.astro`
- Modify: `src/content/projects/flex-academy.mdx` (the last sections; delete what is left of the old body and the last `flex-academy-embeds.js` script tag)
- Modify: `tests/visual.spec.ts`, `docs/HANDOFF.md`

**Interfaces:**
- Produces: `TwoCol.astro` props `{ left: string; right: string }` (the two mono labels), named slots `left` and `right`. One column below 800px.

Content (sketch C `377:10244`, `377:10266`):
- `CaseSection` "Built, not just drawn", subtitle "a prototype held to production habits", id `built`: left "production habits" (the four bullets from today's page, shortened as in the sketch), right "how I worked with AI".
- `CaseSection` "If it shipped", subtitle "how I would measure it, and what I learned", id `result`: left "how I would measure it", right "what I learned".

- [ ] **Step 1: Write the test**

```ts
test('the old Webflow embeds are gone', async ({ page }) => {
  await page.goto(FLEX);
  await expect(page.locator('.fa-mount, script[src*="flex-academy-embeds"]')).toHaveCount(0);
  await expect(page.locator('main h2')).toHaveText(['Three decisions I would defend', 'How I got there', 'The design system behind it', 'Built, not just drawn', 'If it shipped']);
});
```

- [ ] **Step 2: Build `TwoCol`; finish the MDX**

Keep `public/embeds/flex-academy-embeds.js` (no page uses it after this, but deleting files is Rock's call; say so in the PR). The media files in `public/embeds/flex-academy/` stay: the components use them.

- [ ] **Step 3: Add the process, system, built and result sections to the visual test; run everything at 320, 400, 1440 and 1920**

Run: `npm run check && npm run build && npx playwright test`
Expected: PASS. New screenshots written. Compare each with sketch C side by side.

- [ ] **Step 4: Update `docs/HANDOFF.md`** (done items: case study template and Flex Academy; open: the other nine case studies, one PR each; delete the old embed script later)

- [ ] **Step 5: Commit, push, open PR 3**

```bash
git add src/components/case/TwoCol.astro src/content/projects/flex-academy.mdx tests docs/HANDOFF.md
git commit -m "Flex Academy: built, not just drawn; if it shipped; old embeds removed"
git push -u origin case-study-process
```

PR body lists the new copy (process block texts, subtitles, "How I got there", "If it shipped"), the cut content, and that sketch C in Figma should now be updated to match any copy changed in code (and its Work card file name fixed, spec section 10).
