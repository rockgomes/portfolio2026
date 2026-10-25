# Handoff - October 25, 2026 (updated after the engineer view)

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
   - Hero story (`HeroStory.astro`): after the headline animation, the PM, Rock and the Dev act out a Dynamic Lists session on the live table; ends with a resolved comment that opens on click. Once per browser tab; "↻ replay the session" under the table.
   - Selected work: cards rise in; filters move cards with GSAP Flip; the Client, Dev and PM come in on three cards, comment, and leave.
   - Design system cards work (`DesignSystems.astro`): pick a variant, change properties, rebrand the Primary token, switch the page mode.
   - About labels appear one by one; in the footer the visitor's pointer becomes "You".
   - Draggable selections (headline, portrait, design system instance) stay where dropped; double-click resets.
7. **Every measurement on the page is real**, read live from the page (headline box, type spec, table size, portrait size, timeline span).
8. **Layout and copy** (#12, #13): Independent (2025 - now) entry with client tabs (Well, Dealfront, Romeo), Inbank 2023 - 2024; sticky header with a short "copy email" button; new hero copy (Rock's); filter panel scrolls inside on short screens; footer is its own zone with a canvas ruler; "170+ countries" and "7 live demos".
9. **"Save as view"** is a real feature of the hero table. The table saves only after a visitor's own action.
10. **One `h1` per page** on every case study and experiment page (#16); a smoke test keeps it that way.
11. **Columns menu** on the hero table (#17): show and hide columns, remembered.
12. **Small screens** (#18): a Menu button and panel below 1040px; the filter panel folds into a "Filter projects" button; side comments are hidden; section links stop with the title under the header.
13. **Recruiter view** (#19, Figma `94:6774`): the header switch on "Recruiter" (or `/?view=recruiter`) swaps the homepage for a one-page summary (`Recruiter.astro`): role, pills, facts, five projects, contact card. Facts follow the CV (10+ years; Well named). The hero story waits while it is open. "Download CV (PDF)" (header, and the contact card on phones) serves `public/Rock_Gomes_CV.pdf`, a copy of Rock's CV published with his OK; replace that file when the CV changes.
14. **Engineer view** (Figma `97:7542`): the switch on "Engineer" (or `/?view=engineer`) keeps the homepage and adds two things. (a) A Dev Mode inspect panel on the hero table (`Inspector.astro`): point at or click any part (condition, saved views, Columns, match count, column header, row) to see the matching `rockgomes/filter-builder` component, its real call site (linked to the lines at a fixed commit), the props this table has right now, and live layout and tokens. The story and its comment wait in this view. Hidden below 1200px. (b) "Shipped, with source" (`Repos.astro`): four repo cards; links and stack come from the experiment files (`liveDemoUrl`, `sourceCodeUrl`, `tools`).

15. **Engineer view: design systems as one stacked story** (`DesignSystemsDev.astro`). In the engineer view it replaces `DesignSystems.astro`. Four parts, one under the other, with a fixed side list that follows the scroll: Tokens (pick one of three values for four real tokens), Components (parts of the page built only from those tokens, plus Variant / State / Size), Modes (the same parts in Light and Dark), Accessibility (contrast for every text token, both modes). Token values come from `tokens.css` at build; edits stay inside the section, in the page's current mode, and "Reset" clears them. Copy is a draft.

## Testing notes
- Screenshot tests start each section on a whole pixel (`tests/visual.spec.ts`), so a change in one section does not fail the ones below it. When a section changes on purpose, delete its two screenshots in `tests/__screenshots__/visual.spec.ts/`; CI saves new ones on the PR (commit "Add approved screenshots from CI"). Mac screenshots differ from CI's Linux ones: never commit local screenshots.
- That bot commit does not trigger CI. To get a check on it, close and reopen the PR.
- Scripts that build elements with `innerHTML` need `:global(...)` styles; Astro's scoped styles do not reach them.

## Next, in this order
1. **Sideways scroll at 1200-1300px** (on the live site before the engineer view): the hero story comment and the Dev comment in Selected work stick out past the right edge.
2. **View switch animation** with GSAP Flip, once the two views exist (the filter already uses Flip; reuse that).
3. **Case study and experiment pages: a full pass.** Rock: "we have freedom to make it the way we want/need". Not a restyle only: rethink the layout and structure in the new design. Keep all embeds working and keep one `h1` per page (a smoke test checks it).
4. **Per-project password protection.** Frontmatter `private: true` protects nothing yet; needs a Netlify Edge Function (or similar).
5. **Launch**: make the repo public, point rockgomes.com to Netlify, keep Webflow 2-4 weeks as fallback.

## Open questions for Rock (do not guess)
- **Engineer design systems copy (draft):** the lede and the four points ("Tokens you import", "Props you can predict", ...). Check: did the code components at Inbank, Bigbank and Well really have the same Variant / State / Size props as Figma?
- **Draft copy he has not confirmed:** the hero story comments (PM, Rock, Dev); the Dev and PM comments in Selected work; the footer line ("© year Rock Gomes · Tallinn, Estonia" / "Updated month year"); "as of October 2026" in Numbers; the Experience comment "Four roles fit on one screen" (the client tabs now hide some details).
- **Romeo** (Independent client tab): business line, text, whether to name the work.
- Final filter tags per project (`tagsToCheck: true`).
- Card copy and years for Flex Academy and the 3 Pipedrive projects (`cardToCheck: true`).
- Project order in Selected work (currently as in Figma, newest client work first).
- Design systems cards use long-dash bullets as in Figma. Keep or change to "-"?
- **Engineer view vs Figma `97:7542`:** the panel uses the real names from the repo (`ConditionRow` with `cond`, `isFirst`, `joinerOp`, `dispatch`), not Figma's `FilterCondition` sample; the code box scrolls at Figma's height because real call sites are longer; the Numbers section stays (Figma's frame has none). The panel covers the last two table columns, as in Figma; it collapses to a small "Inspect" tab (remembered in the browser).
- Figma is behind the site in a few places Rock chose: section numbers hang in the margin, token row 1 is grey.900, hero cursors are hidden at rest, the footer is a grey zone. Update Figma or not.
