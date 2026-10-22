---
name: "Portfolio presentation template"
summary: "A scroll-driven case-study page where chapter cards zoom open into full-screen chapters with working prototypes inside them. Built in code, no framework."
cardImage: "../../assets/experiments/portfolio-presentation-template/template.png"
heroImage: "../../assets/experiments/portfolio-presentation-template/experiment-portfolio-presentation-template.png"
date: "2026-08-28"
tools: "Vite, GSAP (ScrollTrigger + Flip), Lenis, Claude Code"
liveDemoUrl: "https://rockgomes-portfolio-template.netlify.app"
sourceCodeUrl: "https://github.com/rockgomes/portfolio-presentation-template"
featured: true
category: "Motion"
readTime: "1 min read"
type: "experiment"
industry: []
focus: ["Code", "Motion"]
tagsToCheck: true
private: false
webflowId: "6a916f120e5bacb3e9ef55a3"
cardOrder: 14
cardNumber: "e.04"
cardCompany: "Template"
cardYear: "site"
cardTitle: "Portfolio presentation template"
cardLine: "Scroll-driven case-study page, chapter cards zoom into full-screen chapters with working prototypes."
cardToCheck: false
---

A portfolio PDF flattens interaction design into screenshots. If the work was about how something behaves, a still image is the wrong medium for it.

So I built the alternative. One continuous page: a hero, a short bio strip, then a chapter index. Click a chapter card and it FLIP-zooms open into a full-screen chapter, with the narrative running alongside working, interactive rebuilds of the shipped designs.

### How it is built

Vite, GSAP (ScrollTrigger and Flip), and Lenis for the scrolling. No framework. The whole bundle is 123 kB of JavaScript, 45 kB gzipped.

All the content lives in one file, src/data/chapters.js. Each chapter is a single object holding its copy, its imagery, and which interactive demo to mount. Swapping in a different set of case studies means editing that one file and never touching the layout.

### What I would change

The chapter demos are hand-built per project, which does not scale. Using this again, I would want a small shared set of demo primitives instead of bespoke code inside every chapter.
