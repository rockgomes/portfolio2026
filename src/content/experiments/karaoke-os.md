---
name: "Karaoke OS"
summary: "The karaoke bar I go to has a QR code on the wall that opens a PDF with thousands of songs. You scroll until you give up. So I built what that QR code should have opened, and it grew into a small SaaS."
cardImage: "../../assets/experiments/karaoke-os/karaoke.png"
heroImage: "../../assets/experiments/karaoke-os/experiment-karaoke-os-venue-and-guest.png"
date: "2026-08-30"
tools: "Next.js, Supabase, Postgres, Tailwind, Netlify, Claude Code"
liveDemoUrl: "https://karaoke-os.netlify.app"
sourceCodeUrl: "https://github.com/rockgomes/karaoke-os"
featured: false
category: "Code"
readTime: "2 min read"
type: "experiment"
industry: ["B2C"]
focus: ["Code"]
tagsToCheck: true
private: false
webflowId: "6a946eecf979c245ce6165be"
---

The karaoke bar I go to has a QR code on the wall. Scan it and you get a PDF with thousands of songs. You scroll page after page on your phone, and then you give up and ask the DJ. Most people don't even know how to search on a PDF on mobile.

So I built what that QR code should have opened. A song list you can search and sort, made for a phone. No app to install, no account to make.

### How it is built

Next.js and Supabase, hosted on Netlify. The database decides who can see and change what, so a bug in a screen cannot show one bar's songs to another.

### The part that was actually interesting

The search page was the easy part. Keeping the song list up to date is the hard part, and that was never going to be me. It has to be the bar.

So the bar needs its own screen: add a song, import a list, print the code for the tables, open and close karaoke for the night. That is a backoffice. And once one bar has one, someone has to look after all the bars. That is a third screen, for whoever runs the service.

So there are three parts now. Guests see the song list. Bar staff see their own bar and nothing else. Whoever runs the service sees every bar, and still cannot open one unless they work there.

### Try it

Press the button on the front page and you get your own copy of a bar. No account, no email. The songs are there with their artwork, and every screen works: add a song, import a list, print a code, open the night. The system deletes it overnight, so change whatever you like.

### Why I could build it

I go to that bar, so I knew the problem. I knew how to design the answer. Coding it was the part I could not do on my own.

That is why I started this project. I wanted to see how far design thinking and AI could get me. I made the product and design decisions and directed the build. Claude Code wrote the code.

It is not a business. There is no billing and no sign-up (at least not publicly yet). But this demo works, and you can play around with it.
