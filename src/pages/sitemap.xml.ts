// The sitemap search engines read (robots.txt points here): the homepage and every public case study and
// experiment. Private pages are left out, as they are left out of the listings (see src/lib/private.ts).
// The audience views (?view=...) are the same page, so they are not listed.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isPrivate } from '../lib/private';

export const GET: APIRoute = async ({ site }) => {
  const projects = (await getCollection('projects')).filter((e) => !isPrivate(e.data));
  const experiments = (await getCollection('experiments')).filter((e) => !isPrivate(e.data));
  const paths = ['/', ...projects.map((e) => `/project/${e.id}`), ...experiments.map((e) => `/experiments/${e.id}`)];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
