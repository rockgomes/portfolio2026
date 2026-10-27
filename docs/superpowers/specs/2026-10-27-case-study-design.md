# Case study pages: design

Date: October 27, 2026
Status: direction approved by Rock (sketch C). Not built yet.

Figma (file `MfrBjIutW2nsL0mimJgMnt`, Explorations page):

- **Sketch C, Flex Academy:** frame `375:10114`. This is the reference for the build.
- Sketch B, Dealfront Dynamic Lists, generic: frame `374:10052`. The first try at "generic". C replaces it as the reference.
- Sketch A, Dealfront Dynamic Lists in the design view style: frame `370:9947`. Rejected: too much of the Figma layer.

## 1. Why

The site has left Webflow, so the case study pages can use the space as they need. Today `src/pages/project/[slug].astro` shows a title, a lead, one image and the Markdown body. It is text on a screen.

Rock's goal, in his words: a way to show his projects that is "clear, engaging, and helpful", so people understand the project and the process, or "just generally feel like they can trust me".

What the research (posts by hiring managers and recruiters) says, in short:

- **Two readers, two speeds.** A recruiter skims for about 30 seconds. A hiring manager reads the parts that interest them.
- **Result first.** Say the problem, the main decision and the result at the top. Do not make people scroll to find out what happened.
- **Decisions over process.** "What I chose, why, and what I gave up" builds trust. A long list of process steps does not.
- **Say what you owned.** Role, team, time, tools.
- **Images that prove a point.** Every image answers one question. No decorative mockups.
- **Show impact honestly.** Real numbers when there are some. When there are none, say how you would measure it.

## 2. Goals, non-goals, anti-goals

**Goals**

- One page structure for every case study (section 4).
- In the first 30 seconds a reader knows: what the project was, what Rock did, the main decision, and the result.
- Decisions come before process, when a project has them (section 4).
- Where a project has interactive proof (a live page, videos, a before/after), the page lets the reader try it.
- The same page for every visitor. Recruiters, design leads and engineers all see it.
- Flex Academy is the first page built this way.

**Non-goals (not in this work)**

- Restructuring the other nine case studies. Each one needs new copy from Rock. They come later, one pull request each (section 9).
- The experiment pages (`/experiments/<slug>`). A separate design pass later.
- Password protection for private projects.
- The About rewrite.

**Anti-goals (a failure even if it works)**

- Any part of the design view's Figma layer on a case study page: no view switch, no section numbers, no redlines, no cursors, no selection boxes, no comment threads, no "resolved" labels.
- Invented numbers, quotes or results. A fact that has no source does not go on the page.
- New motion that is not already on the site (section 6).
- A process essay. If a process step does not explain a decision, it is cut or made short.
- Old URLs that stop working.

## 3. Constraints

- Astro 6, static, Netlify. URLs stay `/project/<slug>`, and the file name is the slug.
- Colours, type and shadows only from `src/styles/tokens.css` (`var(--color-...)`, `var(--type-...)`, `var(--shadow-...)`). Never raw hex in components. Never hand-edit `tokens.css`.
- Reuse the Figma components that sketch C uses: Section header `20:28` (index hidden), Button set `193:109`, Tab `195:113`, Segmented control `193:119`, Pill `246:131`, Tag `246:112`, Pin `21:125`, Callout `21:121`, Stat (large) `61:2812`, Work card `333:262`. In code, some of these exist only as CSS inside other components (for example the client tabs in `Experience.astro`, the switch in `SiteHeader.astro`). Where the case page needs one, make a small shared Astro component that matches the Figma component. Do not draw new UI.
- The header has no view switch on case pages. `Base.astro` already does this (`showSwitch` is false).
- The footer stays as it is today.
- Accessibility: real buttons and links, visible `:focus-visible`, keyboard use for every control, `prefers-reduced-motion` turns motion off, no sideways scroll from 320px to 1920px.
- Pins point at a picture, so they are children of that picture, like the overlays on the homepage.
- Every pull request passes `npm run check`, `npm run build`, `npm test`, and gets a Netlify preview. Rock merges.

## 4. The page structure

From top to bottom. A part only shows when the case study has content for it.

1. **Header.** The site header, no switch.
2. **Summary (the 30-second part).**
   - Title (Section header, no index) with a subtitle: company · month and year · kind of project.
   - Lead paragraph.
   - Facts in four rows: role, context, made, tools.
   - Three short blocks side by side: problem, decision, result.
   - Buttons to the real thing (live page, prototype, source code). Only the ones that have a URL. The first one is Primary.
   - The main picture, video or live page, with a one-line caption.
3. **Decisions (optional).** Rule of thumb: 2 to 4 decisions. A case study can also have none: then the whole section is left out, and the page goes from the summary to "How I got there". The title uses the real count, for example "Two decisions I would defend" (Flex Academy has three). Each decision has: a small label ("decision 1 of 3"), a title, a short text, and one piece of proof (picture, video or interactive) with a caption. A decision can have a tab or segmented control that changes its proof.
4. **How I got there.** The process, short. Each block has a small label, a title, a short text and one piece of proof.
5. **Project sections.** Parts only one project has, for example "The design system behind it" in Flex Academy.
6. **Result.** Two columns. For a project with real results: "Outcome" (what changed) and "What I learned". For a project without them, like Flex Academy: "If it shipped" with "How I would measure it" and "What I learned".
7. **Next case study.** One Work card for the next project by `cardOrder` (after the last, go back to the first). The card index is hidden.
8. **Footer.** As today.

Layout on wide screens follows sketch C: a 1440px frame, text on the left, proof on the right or full width. Below about 800px everything is one column and proof is full width.

## 5. Flex Academy, part by part

Source content: `src/content/projects/flex-academy.md` and the embeds in `public/embeds/flex-academy-embeds.js` (9 embeds). The embeds come from Webflow: one script that injects its own HTML and CSS with raw hex colours. **Do not reuse the script.** Rebuild each one as Astro markup with the site's tokens and components, and keep its text and data. The screenshots and videos of the Flex page keep their own colours: they are pictures of another product.

| Part (sketch C node) | Content | Interaction | From |
|---|---|---|---|
| Summary (`375:10126`) | Title "Flex Academy", subtitle "The Flex · October 2026 · design challenge". Lead from `heroDescription`. Facts from the `fa-facts` embed. Problem, decision and result: text in the sketch. Buttons: "Open the live page ↗" (Primary), "Figma prototype ↗", "Source code ↗". | The live page in an iframe, scaled to fit at 1440×900. When the scale would be under 50% (phones), show the hero-switch video instead. Caption: "The live page, scaled to fit. Try the switch, the calendar and the theme toggle." | `fa-live`, `fa-facts` |
| Decision 1, the calendar (`376:10124`) | Text in the sketch. | Segmented control "Starting out / I run units" swaps two stills of the hero: the launch hero and the operator hero. The caption changes with it. | `fa-live` video frames |
| Decision 2, the booking | Text in the sketch. Merges the old section "The moment of commitment". | Tabs "Launch · webinar / Scale · strategy call" swap the two booking videos and their captions, with a replay button. | `fa-flows` |
| Decision 3, proof without promises | Pills: since 2019, 7 cities, 150+ corporate partners, 130+ booking channels. | "The hard truth" video plays when it is in view. Caption "Scrolling turns the same day from chaos into order." | `fa-truth` |
| How I got there: method (`376:10189`) | All seven steps and their text from the embed. | Segmented control "This challenge, solo / With a team", seven tabs, and a panel with "what I did" and "why this step matters" (or the team version). | `fa-method` |
| How I got there: research | "A board of reasons, not screenshots", text in the sketch. | The references image (`flex-academy-references.jpg`). | Markdown |
| How I got there: wireframe vs final | "The wireframe was right and still felt wrong". | Compare slider: drag the ⇆ handle, or use the arrow keys. Tags "wireframe" and "final" at the bottom. | `fa-cmp` |
| How I got there: art directions | "Same content, three ideas". | Tabs "Lights On / Your Next Unit / The Calendar · chosen" swap the image and the one-line verdict. | `fa-dirs` |
| The design system behind it (`377:10168`) | "Claims are easy, so inspect it". | The hero with numbered Pins on real layers (positions from the embed data). A click on a pin shows its tokens and text styles in a panel. Segmented control "Light / Dark" swaps the hero and the token values. Below: 4 Stats (15 sets, 54 variants, 36 styles, 2 modes) and the coverage line. | `fa-ins`, `fa-stats` |
| Built, not just drawn (`377:10244`) | Two columns: "production habits" and "how I worked with AI". | None. | Markdown |
| If it shipped (`377:10266`) | Two columns: "how I would measure it" and "what I learned". | None. | Markdown |
| Next case study (`377:10288`) | Inbank, Customer Service Back-office (`cardOrder` 4). | Link. | Frontmatter |

**Cut from today's page** (Rock can ask for any of these back):

- "The brief" section. Its point (trust is the hard part) now sits in the problem block.
- "Research" and "Exploration" as long sections. They are now short blocks under "How I got there".
- The two images under "Components": the button states (`flex-academy-buttons.jpg`) and the Tokens page (`flex-academy-tokens.jpg`). The Inspect part and the Stats show the same point.
- The summary hero image above the body. The live page takes its place.

The page goes from about 12,930px to about 9,400px tall on desktop.

## 6. Interactions and motion

Only patterns the site already has:

- **Tabs and segmented controls:** like the client tabs in `Experience.astro`. Click or arrow keys. The new content fades in and the height eases (GSAP, about 0.3s). With reduced motion: an instant swap.
- **Videos:** muted, `playsinline`, play when in view and pause when out of view. With reduced motion: no autoplay, the controls show.
- **Compare slider:** a real control that works with mouse, touch and arrow keys, with a label.
- **Inspect pins:** buttons with `aria-pressed`. The panel updates for screen readers (polite live region).
- **Live page iframe:** loads lazily, has a title, and has the "Open the live page" button as the way out.

No scroll animation, no new reveal effects, no cursors. Interactions only on the parts in section 5. Rock said more interactions can come later: those go through a sketch first.

## 7. Content model

How a case study file says what goes where:

- **Summary fields go in the frontmatter**, next to the card fields. New optional fields for: subtitle, the four facts, problem, decision, result, and the button links. The Flex links are in the embed script today: live page `https://flex-academy-prototype.netlify.app`, Figma prototype (the `figma.com/proto/DTLIkqZYBhRsG82HONqHgC/...` link), source `https://github.com/rockgomes/flex-academy-prototype`.
- **The body uses MDX**, so decisions and proof blocks can be components inside the text. This is my call: it adds the official `@astrojs/mdx` integration. Flex Academy becomes `flex-academy.mdx` (same slug, same URL). The other projects stay `.md` and keep working.
- **A case study without the new fields** shows today's simple layout, with its body exactly as it is now. Do not edit the other nine content files in this work, even where their Webflow HTML has raw hex or fixed sizes. If a test finds a problem on one of those pages, report it; it gets fixed in that page's own pull request. (My call.)
- **New copy that Claude wrote and Rock has not confirmed** gets one frontmatter flag per page, `copyToCheck: true`, like `cardToCheck`. Nothing shows on the page. The pull request description lists every new sentence, so Rock can check each one on the preview. This is safe because rockgomes.com still points at Webflow, so nothing reaches the public until Rock switches the domain. (My call.)

## 8. Tests

- Keep the smoke test (every project page returns 200 and has one `h1`).
- New tests for the Flex Academy page:
  - The summary (title, facts, problem, decision, result) is in the first screen on desktop.
  - The buttons link to the right URLs.
  - Every tab and segmented control works with the mouse and with arrow keys.
  - The compare slider moves with the arrow keys.
  - A pin click fills the panel. Light and Dark change the values.
  - With reduced motion, no video plays on its own.
  - No Figma-layer elements on any case study page (no cursor, selection box, redline, comment thread, view switch).
  - No sideways scroll at 320px and 400px on the Flex Academy page. Each other project page gets this test in its own pull request, when it moves to the new structure. (My call: their Webflow bodies may fail it today, and this work does not touch them.)
- Approved screenshots of the Flex page parts (desktop and mobile), the same way as the homepage sections.

## 9. Order of work

A suggestion. The plan decides the exact cut.

1. The template, the summary and the shared components, with Flex Academy's summary.
2. Flex Academy decisions.
3. "How I got there", the design system part, the result and the next case study.
4. Later, one pull request per case study, after Rock gives or confirms the new copy.

After the build, sketch C becomes the Figma source for the case study page. When copy changes in code, update the frame too.

## 10. Open items for Rock (not blockers)

- **New copy to confirm.** Claude wrote these in sketch C: the problem, decision and result blocks; the decision 1 caption; the section subtitles; the titles "How I got there" and "If it shipped"; the short process block texts. They ship with `copyToCheck: true`, the pull request lists them, and Rock confirms them on the preview.
- **The cuts in section 5.** Rock checks them on the preview.
- **The Figma Work card in sketch C** shows the file name `dealfront-ai-company-profile.md` for the Inbank card. Fix it in Figma when the frame is updated.

## 11. Left to the builder

- Component names, file structure and props.
- How the embed data (method steps, pin positions, token values, captions) moves into code: frontmatter, a data file, or component props.
- Exact breakpoints, as long as the page matches sketch C at 1440px and has no sideways scroll at any width.
- How the hero stills for decision 1 are made (frames from `flex-academy-hero-switch.mp4`, or new exports).
