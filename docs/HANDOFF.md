# Handoff - October 24, 2026

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

## Testing notes
- Screenshot tests start each section on a whole pixel (`tests/visual.spec.ts`), so a change in one section does not fail the ones below it. When a section changes on purpose, delete its two screenshots in `tests/__screenshots__/visual.spec.ts/`; CI saves new ones on the PR (commit "Add approved screenshots from CI"). Mac screenshots differ from CI's Linux ones: never commit local screenshots.
- That bot commit does not trigger CI. To get a check on it, close and reopen the PR.
- Scripts that build elements with `innerHTML` need `:global(...)` styles; Astro's scoped styles do not reach them.

## Next, in this order
1. **Fix: several `<h1>` on one case study page.** `pipedrive---app-management` has 4. Shift section headings down one level; keep the page title as the only `h1`.
2. **Hero table "Columns" button** - it does nothing yet. Make it a small menu to show and hide columns.
3. **Mobile navigation** - below 1040px the nav links are hidden and there is no menu.
4. **Recruiter view** (Figma `94:6774`). A one-page summary: role, availability pills, facts table, short work list, contact card, "Download CV (PDF)". Build it with tokens.
5. **Engineer view** (Figma `97:7542`). Same page with Dev Mode details: green annotations (`data-view="engineer"` tokens), an inspect panel on the hero table, a "Shipped, with source" row of repo cards. Read real component and prop names from `rockgomes/filter-builder` first.
6. **View switch animation** with GSAP Flip, once the two views exist (the filter already uses Flip; reuse that).
7. **Case study and experiment pages** restyled to the new design. Keep all embeds working.
8. **Per-project password protection.** Frontmatter `private: true` protects nothing yet; needs a Netlify Edge Function (or similar).
9. **Launch**: make the repo public, point rockgomes.com to Netlify, keep Webflow 2-4 weeks as fallback.

## Open questions for Rock (do not guess)
- **Draft copy he has not confirmed:** the hero story comments (PM, Rock, Dev); the Dev and PM comments in Selected work; the footer line ("© year Rock Gomes · Tallinn, Estonia" / "Updated month year"); "as of October 2026" in Numbers; the Experience comment "Four roles fit on one screen" (the client tabs now hide some details).
- **Romeo** (Independent client tab): business line, text, whether to name the work.
- Final filter tags per project (`tagsToCheck: true`).
- Card copy and years for Flex Academy and the 3 Pipedrive projects (`cardToCheck: true`).
- Project order in Selected work (currently as in Figma, newest client work first).
- Design systems cards use long-dash bullets as in Figma. Keep or change to "-"?
- "10 years" in the recruiter view: confirm.
- Figma is behind the site in a few places Rock chose: section numbers hang in the margin, token row 1 is grey.900, hero cursors are hidden at rest, the footer is a grey zone. Update Figma or not.
