# Work card pictures

The 14 Work card pictures in `src/assets/cards/` are made with Shotkit (github.com/rockgomes/shotkit), from the screenshots listed in `cards.json`. Each picture is 1940 x 1576, the card frame (485 x 394) at 4x, so the card shows the whole picture and cuts nothing.

To make them again, from a Shotkit checkout:

    npm run render -- /path/to/portfolio2026/thumbnails/cards.json

- `cards.json` lists each card: its screenshot (or up to three phone screens) and where the picture goes.
- `sources/` holds the screenshots that are not already in `src/assets`: phone screens cut out of case study pictures, the cleaned Interactive Panels picture, the App Management crop, and the side project screenshots.
- `tests/work-cards.spec.ts` checks that every card picture has the shape of its frame.
