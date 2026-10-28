import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Shared filter tags. `tagsToCheck` stays true until Rock confirms the tags.
const tagging = {
  type: z.enum(['client', 'experiment']),
  industry: z.array(z.string()).default([]),
  focus: z.array(z.string()).default([]),
  tagsToCheck: z.boolean().default(false),
  // Private projects will ask for a password. Not enforced yet: see src/lib/private.ts.
  private: z.boolean().default(false),
  webflowId: z.string().optional(),
  // Homepage card (copy from Figma). cardToCheck = copy written by Claude, Rock to confirm.
  cardOrder: z.number().default(99),
  cardNumber: z.string().default(''),
  cardCompany: z.string().default(''),
  cardYear: z.string().default(''),
  cardTitle: z.string().default(''),
  cardLine: z.string().default(''),
  cardToCheck: z.boolean().default(false),
};

const projects = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      heroTitle: z.string().default(''),
      heroDescription: z.string().default(''),
      homeImage: image().optional(),
      homeImageAlt: z.string().default(''),
      tag1: z.string().default(''),
      tag2: z.string().default(''),
      demoUrl: z.string().default(''),
      // Case study summary (docs/superpowers/specs/2026-10-27-case-study-design.md). A page with `problem` uses the new layout.
      subtitle: z.string().default(''),
      facts: z.object({ role: z.string(), context: z.string(), made: z.string(), tools: z.string() }).optional(),
      problem: z.string().default(''),
      decision: z.string().default(''),
      result: z.string().default(''),
      links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
      // The live page in the summary (an iframe, with a screen recording on phones). Without it, the summary shows homeImage.
      live: z.object({ src: z.string().url(), title: z.string(), video: z.string(), videoLabel: z.string(), poster: z.string(), caption: z.string() }).optional(),
      // A Before / After switch in the summary (a segmented control), in place of the live page or homeImage.
      beforeAfter: z.object({ caption: z.string(), before: z.object({ src: image(), alt: z.string() }), after: z.object({ src: image(), alt: z.string() }) }).optional(),
      // copyToCheck = page copy written by Claude, Rock to confirm (the PR lists the sentences).
      copyToCheck: z.boolean().default(false),
      ...tagging,
    }),
});

const experiments = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experiments' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      summary: z.string().default(''),
      cardImage: image().optional(),
      heroImage: image().optional(),
      date: z.coerce.date().optional(),
      tools: z.string().default(''),
      liveDemoUrl: z.string().default(''),
      sourceCodeUrl: z.string().default(''),
      featured: z.boolean().default(false),
      category: z.string().default(''),
      readTime: z.string().default(''),
      ...tagging,
    }),
});

export const collections = { projects, experiments };
