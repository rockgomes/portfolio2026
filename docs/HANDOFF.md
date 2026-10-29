# Handoff - October 27, 2026 (updated after the Flex Academy case study page)

Where the rockgomes.com rebuild stands, and what comes next. Written for a new Claude Code session working on this repo. Read `CLAUDE.md` first.

## Where things are
- **Live (Netlify, not the real domain yet):** https://rockgomes-portfolio2026.netlify.app. Netlify site `rockgomes-portfolio2026`, connected to this repo. Every PR gets a deploy preview (`deploy-preview-<N>--rockgomes-portfolio2026.netlify.app`). Netlify builds only `main` and PRs into `main`; for a stacked PR, add its base branch in Netlify's branch settings while it is open.
- **rockgomes.com** still points at Webflow. Do not touch the domain until Rock says so.
- **Motion plan** (approved, with live demos): https://claude.ai/artifact/Y6JDGyVGEaNW7wKC5PDyjP

## Done
1. **Content moved from Webflow** (#1 base). 10 case studies, 4 experiments, images and embeds downloaded.
2. **Setup, tokens, homepage** (#1, #2, #3). CI, Netlify, design tokens from Figma, the design lead view.
3. **Matches Figma** (#5). Figma layer glyphs (❖ ◇ ◆ ◐) are inline SVGs at Figma size (`src/lib/glyphs.ts`, `Glyph.astro`); cursor arrows have the real outline.
4. **Figma notes turned into content** (#6). Design-choice notes became resolved comment threads (`ResolvedThread.astro`); spec notes got real copy.
5. **No more "B2"** (#4, #7). Components live in `src/components/`. Never call the design "B2".
6. **Motion** (#8 to #12, #14), all with GSAP 3.15 and one helper, `src/lib/motion.ts` (`playOnce`: play once when in view; nothing with reduced motion; the page renders finished without JS):
   - Redlines draw out from their label; selection boxes draw like a drag; number rules draw; the timeline line follows the scroll (`Motion.astro`).
   - Hero story (`HeroStory.astro`): after the headline animation, the PM, Rock and the Dev act out a Dynamic Lists session on the live table; ends with a resolved comment that opens on click. Once per browser tab; "↻ replay the session" under the table. While it plays, each message sits next to the cursor of the person who says it (a child of the cursor, in `Hero.astro`; text in `src/data/heroStory.ts`), so a visitor reads it during the action.
   - Projects: cards rise in; filters move cards with GSAP Flip; the Client, Dev and PM come in on three cards, comment, and leave.
   - Design system cards work (`DesignSystems.astro`): pick a variant, change properties, rebrand the Primary token, switch the page mode.
   - About labels appear one by one; in the footer the visitor's pointer becomes "You".
   - Draggable selections (headline, portrait, design system instance) stay where dropped; double-click resets.
7. **Every measurement on the page is real**, read live from the page (headline box, type spec, table size, portrait size, timeline span).
8. **Layout and copy** (#12, #13): Independent (2025 - now) entry with client tabs (Well, Dealfront, Romeo), Inbank 2023 - 2024; sticky header with a short "copy email" button; new hero copy (Rock's); filter panel scrolls inside on short screens; footer is its own zone with a canvas ruler; "170+ countries" and "7 live demos".
9. **"Save as view"** is a real feature of the hero table. The table saves only after a visitor's own action.
10. **One `h1` per page** on every case study and experiment page (#16); a smoke test keeps it that way.
11. **Columns menu** on the hero table (#17): show and hide columns, remembered.
12. **Small screens** (#18): a Menu button and panel below 1040px; the filter panel folds into a "Filter projects" button; side comments are hidden; section links stop with the title under the header.
13. **Recruiter view** (#19, Figma `94:6774`): the header switch on "Recruiter" (or `/?view=recruiter`) swaps the homepage for a one-page summary (`Recruiter.astro`): role, pills, facts, all 14 projects in a scroll box (5 picks first, a half row and a fade show there is more; the full list on small screens), contact card. Below it: Numbers, Experience and About, without the designer layer (no cursors, selections, comments or index numbers). The recruiter view stays sober. Facts follow the CV (10+ years; Well named). The hero story waits while it is open. "Download CV (PDF)" (header, and the contact card on phones) serves `public/Rock_Gomes_CV.pdf`, a copy of Rock's CV published with his OK; replace that file when the CV changes.
14. **Engineer view** (Figma `187:1648`): the switch on "Engineer" (or `/?view=engineer`) keeps the homepage and adds two things. (a) A Dev Mode inspect panel on the hero table (`Inspector.astro`): point at or click any part (condition, saved views, Columns, match count, column header, row) to see the matching `rockgomes/filter-builder` component, its real call site (linked to the lines at a fixed commit), the props this table has right now, and live layout and tokens. The story and its comment wait in this view. Hidden below 1200px. (b) "Shipped, with source" (`Repos.astro`): four repo cards; links and stack come from the experiment files (`liveDemoUrl`, `sourceCodeUrl`, `tools`).
15. **No sideways scroll at 1200-1300px** (#21, and the PM cursor fix after it). The comments move with their table or card. In the hero story the PM stops on the "Churned" pill, not beside it: at 1200px the table hides the Status column, and a PM beside the pill stuck out past the screen edge.
16. **Foundations** (#29, #30, #31, #32, #33):
   - **Tokens from Figma, checked by CI.** `src/styles/tokens.json` is exported from the Figma variables with `scripts/figma/export-tokens.js`. `npm run tokens` builds `tokens.css` from it; `npm run tokens:check` (in CI) fails when the two do not match. Never edit `tokens.css` by hand.
   - **Spacing and radius on a scale.** Space 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 120; radius tag 2, control 7, pill 999. Components use `var(--space-N)` and `var(--radius-*)`.
   - **Shared components** (global classes in `base.css`, matching Figma components): Button (`.btn`, `.btn-primary`), Underline tab (`.utabs`, `.utab`), Pill (`.ui-pill`, sizes and tones), Tag (`.ui-tag`, tones). Since PR 50 also Tab (`.ui-tabs`, `.ui-tab`), Segmented control (`.ui-seg`), Pin and Callout (`.ui-pin`, `.ui-pin-callout`, `.ui-callout`) and the "- " list helper (`.t-dash-list`). Tab and Segmented control markup comes only from `Tabs.astro` and `Segmented.astro`, and every tab row or segmented control (also the `.utab` ones) gets its clicks and arrow keys from `src/lib/choice.ts`. Proof videos play and pause through `src/lib/autoplay.ts`. `tests/dry.spec.ts` fails the build if one of these is copied. The Design systems demo buttons stay separate on purpose. **Before building any piece, look here and in `src/components` first and reuse it.**
17. **View switch motion** (`src/lib/view-switch.ts`): the page fades out, the view changes, and while it fades back in, sections that change place slide to their new place (same 0.55s and easing as the filter) and every other section on screen rises 16px into place, so something always moves. The colours fade too. The section being read stays in place on the screen; if the new view does not have it, the page goes to the top. Only sections on screen animate; a second click ends the running switch. Instant with reduced motion. The motion after the change starts one frame late, because laying out the new view takes the browser about 150ms. It sends `viewchange` when the view changes and `viewsettled` when the motion ends (scroll animations measure the page again then). While it runs, `<html data-switching>` is set; tests wait for it to go.

18. **Switching views ends the hero story** (#43): leaving the design lead view jumps the story to its end, as a click on the table does.
19. **Recruiter header** (#44, Figma `94:6775`): Experience and About links, Copy email and the CV button. From 1041px to 1279px the links move into the Menu, so they never touch the view switch.
20. **Copy confirmed by Rock** (October 26, 2026): the hero story comments, the Projects comments, the footer line and "as of October 2026" in Numbers. The Experience comment was removed.

21. **Case study template, built first for Flex Academy** (PR 50, Figma sketch C `375:10114`). A case file with `problem` in its frontmatter gets the new page: summary (`CaseSummary`, facts, problem / decision / result, buttons), the live page scaled to fit (`LivePage`, a recording on phones), then the MDX body, then the next case study (the homepage Work card). The body places components from `src/components/case/`: `CaseSection` (title, subtitle, gap 96/64/48), `CaseBlock` (text left, proof right), `Proof` (framed picture or video with caption), `ProofSwitch` (tabs or segmented control that swap proof), `ProofVideo` (plays in view, keeps its controls so it can be paused), `CompareSlider`, `TwoCol`, and Flex-only `MethodStepper` and `InspectPins` (data in `src/data/flex-academy.ts`). `Stats.astro` (Figma Stat 61:2812) is shared with the homepage Numbers. Case pages look the same in every view (no Figma layer). Files without `problem` keep the old article layout.

22. **The 404 page** (`src/pages/404.astro`, tests in `tests/not-found.spec.ts`). No view switch: it uses the view the visitor chose last (`readView` on Base). Design lead view: an empty dashed frame named after the missing address, a "Missing component" note, and a "Swap instance" list of every public page. Pointing at a page shows its card picture in the frame; clicking opens it. Undo (button or Cmd/Ctrl+Z) fills the frame with a picture of the homepage (`public/404-home.jpg`, made by `scripts/make-share-image.mjs`) and goes there. Rock's cursor asks "Who deleted this page?". Engineer view: a fake terminal (help, ls, cd, whoami, contact, clear; Tab completes, Up repeats). Recruiter view: plain text. Known gap: white "Rock" on the orange cursor tag is 3.4:1 contrast in light mode (listed in `tests/a11y.spec.ts`).

## Testing notes
- Screenshot tests start each section on a whole pixel (`tests/visual.spec.ts`), so a change in one section does not fail the ones below it. When a section changes on purpose, delete its two screenshots in `tests/__screenshots__/visual.spec.ts/`; CI saves new ones on the PR (commit "Add approved screenshots from CI"). Mac screenshots differ from CI's Linux ones: never commit local screenshots.
- That bot commit does not trigger CI. To get a check on it, close and reopen the PR.
- Scripts that build elements with `innerHTML` need `:global(...)` styles; Astro's scoped styles do not reach them.
- Tests run with reduced motion, so animations do not play in them. A test that needs the motion (the hero story, for example) must turn it on with `test.use({ contextOptions: { reducedMotion: 'no-preference' } })`. `overflow.spec.ts` plays the whole hero story at 1200px and checks the page width the whole time.
- Before you pick the next task from this file, check `git log` and the merged PRs: this list can be behind.

## Next, in this order
1. **Done: every case study and experiment uses the new template.** Keep one `h1` per page (a smoke test checks it). The unused `public/embeds/flex-academy-embeds.js` was deleted (Rock, 29 Oct).
   - Update sketch C in Figma to the copy changed in code, and fix its Work card file name.
2. **Per-project password protection.** Frontmatter `private: true` protects nothing yet; needs a Netlify Edge Function (or similar).
3. **Launch**: point rockgomes.com and www.rockgomes.com to Netlify, keep Webflow 2-4 weeks as fallback. Done already: the repo is public (29 Oct), and the launch basics PR adds the browser icons, the link preview image (`public/og.png`, remake with `scripts/make-share-image.mjs`), `robots.txt`, `/sitemap.xml` and canonical addresses without `.html`. The preview image URL points at rockgomes.com, so link previews only show it after the domain switch.

## Open questions for Rock (do not guess)
- **Romeo** (Independent client tab): business line, text, whether to name the work.
- Final filter tags per project (`tagsToCheck: true`).
- Card copy and years for Flex Academy and the 3 Pipedrive projects (`cardToCheck: true`).
- Project order in Projects (currently as in Figma, newest client work first).
- Design systems cards use long-dash bullets as in Figma. Keep or change to "-"?
- **Engineer view vs Figma `187:1648`:** the panel uses the real names from the repo (`ConditionRow` with `cond`, `isFirst`, `joinerOp`, `dispatch`), not Figma's `FilterCondition` sample; the code box scrolls at Figma's height because real call sites are longer; the Numbers section stays (Figma's frame has none). The panel covers the last two table columns, as in Figma; it collapses to a small "Inspect" tab (remembered in the browser).
- Figma is behind the site in a few places Rock chose: section numbers hang in the margin, token row 1 is grey.900, hero cursors are hidden at rest, the footer is a grey zone. Update Figma or not.
