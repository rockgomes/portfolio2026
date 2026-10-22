# rockgomes.com

Astro site. Content lives in `src/content/projects` and `src/content/experiments` (one Markdown file per item, slug = file name). Images sit next to each item in `src/assets/<collection>/<slug>/`.

- `npm run dev` - local preview
- `npm run build` - static build into `dist/`
- `scripts/migrate.mjs` - one-off import from the Webflow CMS export (already run)

Open items: homepage design, tag check (`tagsToCheck: true`), password protection for `private: true` items (see `src/lib/private.ts`), Netlify setup, domain switch.
