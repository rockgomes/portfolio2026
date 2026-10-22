# Handoff - October 22, 2026

Where the rockgomes.com rebuild stands, and what comes next. Written for a new Claude Code session working on this repo.

## Done
1. **Content moved from Webflow** (`main`). 10 live case studies, 4 live experiments, all images and embed media downloaded locally. Word counts match Webflow. Drafts were left out on purpose.
2. **Project setup** (PR). CI with type check, build and Playwright; Netlify config; this file and `CLAUDE.md`.
3. **B2 tokens** (PR). Exported from Figma: Light - Crisp, Dark, and the engineer view's Dev Mode green.
4. **B2 homepage, design lead view** (PR). Header with the audience switch, hero with the live table, numbers, Selected work with the filter panel, design systems, experience, about, footer, multiplayer overlays. Checked side by side with Figma at 1440px. Tests cover the table, the filter, the switch, overlay alignment and per-section screenshots.

## Next, in this order
1. **Fix: several `<h1>` per case study page.** The Webflow import turned some section headings into `h1`. Shift them down one level (keep the page title as the only `h1`). Found by the smoke test.
2. **Hero table "Columns" button** - it does nothing yet. Make it a small menu to show and hide columns.
3. **Mobile navigation** - below 1040px the nav links are hidden and there is no menu.
4. **Recruiter view** (Figma `94:6774`). A one-page summary: role, availability pills, facts table, short work list, contact card, "Download CV (PDF)". It is currently a quick import with fixed colours in Figma; build it with tokens.
5. **Engineer view** (Figma `97:7542`). Same page as the design lead view with Dev Mode details: green annotations (already in tokens via `data-view="engineer"`), an inspect panel on the hero table condition instead of the client cursors, and a "Shipped, with source" row of repo cards instead of the numbers row. Read the real component and prop names from `rockgomes/filter-builder` for the code snippet before using them.
6. **View switch animation** with GSAP Flip: when the view changes, projects move to their new spots. Respect reduced motion.
7. **Case study and experiment pages** restyled to B2. Keep all embeds working.
8. **Per-project password protection.** Frontmatter `private: true` exists but protects nothing; it needs a Netlify Edge Function (or similar).
9. **Launch**: make the repo public, point rockgomes.com to Netlify, keep Webflow 2-4 weeks as fallback.

## Open questions for Rock (do not guess)
- Live demo count on the homepage ("NN" placeholder).
- Pipedrive: say "Global" or a number of countries.
- Final filter tags per project (`tagsToCheck: true`).
- Card copy for Flex Academy and the 3 Pipedrive projects (`cardToCheck: true`), and their years.
- Project order in Selected work (currently numbered as in Figma, newest client work first).
- Design systems cards use "—" bullets as in Figma. Keep or change to "-"?
- "10 years" in the recruiter view: confirm.
