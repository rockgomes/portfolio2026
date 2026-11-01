# Work card pictures

The 15 Work card pictures in `src/assets/cards/` are made with Shotkit (github.com/rockgomes/shotkit), from the screenshots listed in `cards.json`. Each picture is 1940 x 1576, the card frame (485 x 394) at 4x, so the card shows the whole picture and cuts nothing.

To make them again, from a Shotkit checkout:

    npm run render -- /path/to/portfolio2026/thumbnails/cards.json

- `cards.json` lists each card: its screenshot (or up to three phone screens) and where the picture goes. All cards share one background, sampled from the AI in the Company Profile screenshot (`groundFrom`).
- `sources/` holds the screenshots that are not already in `src/assets`: phone screens cut out of case study pictures, the cleaned Interactive Panels picture, the App Management crop, and the side project screenshots.
- `overlays/` adds things on top of a Shotkit picture. Formalist is the only one: Shotkit makes `sources/formalist-card.jpg`, then `formalist-store.html` puts Google's official Chrome Web Store badge on it (Figma 576:35071). From the repo root:

      node thumbnails/overlays/render.mjs thumbnails/overlays/formalist-store.html src/assets/cards/formalist.jpg

- `tests/work-cards.spec.ts` checks that every card picture has the shape of its frame.
