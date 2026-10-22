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
  // Homepage card (copy from Figma B2). cardToCheck = copy written by Claude, Rock to confirm.
  cardOrder: z.number().default(99),
  cardNumber: z.string().default(''),
  cardCompany: z.string().default(''),
  cardYear: z.string().default(''),
  cardTitle: z.string().default(''),
  cardLine: z.string().default(''),
  cardToCheck: z.boolean().default(false),
};

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
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
