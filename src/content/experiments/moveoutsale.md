---
name: "MoveOutSale"
summary: "A marketplace for selling a flat's worth of furniture when you move. Next.js and Supabase, with a public demo that runs on its own throwaway database."
cardImage: "../../assets/experiments/moveoutsale/moveoutsale.png"
heroImage: "../../assets/experiments/moveoutsale/experiment-moveoutsale-photos.png"
date: "2026-08-28"
tools: "Next.js, Supabase, Tailwind, Playwright, Claude Code"
liveDemoUrl: "https://moving-out-demo.netlify.app"
sourceCodeUrl: "https://github.com/rockgomes/moving-out-webapp"
featured: false
category: "Code"
readTime: "2 min read"
type: "experiment"
industry: ["B2C"]
focus: ["Code"]
tagsToCheck: true
private: false
webflowId: "6a916f32a7daa4d848265485"
cardOrder: 13
cardNumber: "e.03"
cardCompany: "Side project"
cardYear: "site"
cardTitle: "MoveOutSale"
cardLine: "A marketplace for selling a flat's worth of furniture when you move. Next.js and Supabase."
cardToCheck: false
---

A marketplace built for one specific moment: someone is leaving a city and has three weeks to sell a flat's worth of furniture. Listings group into a single moving sale, so one person's whole clear-out reads as one thing instead of fourteen unrelated posts.

### How it is built

Next.js App Router, with Supabase for Postgres, auth and file storage. Every table sits behind row-level security, so what someone can read or write is decided in the database rather than in the interface. Photos are compressed in the browser before upload. Playwright covers the main flows.

### The part that was actually interesting

Making it publicly clickable without exposing the real thing.

The demo runs against its own Supabase project and never holds the production keys, so it cannot reach real data even if the code were wrong. One flag switches on anonymous sign-in: every visitor is quietly signed in as their own throwaway account and sees the app as a logged-in user, with row-level security still holding visitors apart from each other. The same flag adds a noindex header, so nothing a visitor types can surface in a search result.

A scheduled job wipes and re-seeds the demo nightly, but only when someone actually changed something. Most nights it checks, finds nothing, and does no work.

Worth knowing before you click: the demo resets, so anything you make there will not survive the night.
