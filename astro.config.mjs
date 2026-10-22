// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rockgomes.com',
  // Match Webflow: /project/slug, no trailing slash.
  trailingSlash: 'never',
  build: { format: 'file' },
});
