# rockgomes.com (portfolio2026)

Rock Gomes's portfolio. Astro 6, static, hosted on Netlify. Content moved from Webflow in October 2026.
Design source: Figma file `MfrBjIutW2nsL0mimJgMnt` ("Portfolio References"). Refer to Figma frames by node id (listed under Design rules), not by page name. Do not call the design "B2".

## Who you are working with
Rock is a senior product designer, not a developer. He reads code and makes small CSS/token fixes, but explain changes in plain everyday English: short sentences, no jargon, no em dashes (use "-"). Never state numbers or facts you do not know - use a clear placeholder (like `NN` or `20NN`) and say so. Ask before changing anything he did not ask for.

## Process (always)
- Never commit to `main` directly. One branch and one pull request per piece of work, small enough to review.
- Every PR must pass CI: `npm run check`, `npm run build`, `npm test` (Playwright).
- Every PR gets a Netlify deploy preview. Rock reviews there and merges.
- Production deploys only from `main`. The rockgomes.com domain still points at Webflow until Rock says to switch.

## Design rules
- **Tokens come from Figma.** `src/styles/tokens.css` is exported from the tokens variable collection in that Figma file (modes: Light - Crisp = light, Dark, Light - Dev = engineer view). Do not hand-edit values; change Figma and re-export. Use `var(--color-...)`, `var(--type-...)`, `var(--shadow-...)` only, never raw hex in components.
- **Match Figma.** Build from `get_design_context` on the Figma node and compare a screenshot side by side before calling it done. The design lead view is frame `96:6774`; v3 full page is `90:6006`; recruiter view `94:6774`; engineer (dev mode) view `97:7542`.
- **Overlays never float on the page.** Cursors, selection boxes, comments and the text selection are children of the element they point at (see `Cursor.astro`, `SelectionBox.astro`). After any layout change, run `npx playwright test overlays.spec.ts`. Overlays hide below 1200px.
- **Reuse existing icons and components** from the Figma file before drawing new ones (for example the ❖ master and ◇ variant glyphs in IBM Plex Mono).
- Accessibility: real buttons and links, visible focus, `prefers-reduced-motion` turns motion off, no sideways scroll at 400px.

## Content
- Case studies: `src/content/projects/*.md`, experiments: `src/content/experiments/*.md`. File name = Webflow slug, so old URLs keep working (`/project/<slug>`, `/experiments/<slug>`).
- Homepage card fields live in each file's frontmatter (`cardTitle`, `cardLine`, ...). `cardToCheck: true` = copy written by Claude, Rock has not confirmed it. `tagsToCheck: true` = filter tags are a first guess.
- `scripts/migrate.mjs` re-imports from a Webflow export. Do not run it over edited files.

## Commands
- `npm run dev` - local site
- `npm run check` - TypeScript / Astro check
- `npm run build` - build to `dist/`
- `npm test` - Playwright (functional, overlay alignment, visual screenshots)
- `npm run test:update` - re-approve screenshots after an intended visual change (say so in the PR)

See `docs/HANDOFF.md` for current status and what is next.
