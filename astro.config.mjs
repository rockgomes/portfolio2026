// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://rockgomes.com',
  // Match Webflow: /project/slug, no trailing slash.
  trailingSlash: 'never',
  build: { format: 'file' },
  // Case studies can be MDX, so a page can place components (decisions, proof) inside the text.
  integrations: [mdx()],
});
