import { getCollection } from 'astro:content';
import { isPrivate } from './private';

// Every public project and experiment as a Work card item, in card order: the homepage Projects grid and the
// "next case study" link on case pages use the same list, so they never disagree.
export async function workItems() {
  const projects = (await getCollection('projects')).filter((p) => !isPrivate(p.data)).map((p) => ({
    id: p.id, href: `/project/${p.id}`, img: p.data.homeImage, alt: p.data.homeImageAlt, demo: p.data.demoUrl, d: p.data,
  }));
  const experiments = (await getCollection('experiments')).filter((e) => !isPrivate(e.data)).map((e) => ({
    id: e.id, href: `/experiments/${e.id}`, img: e.data.cardImage, alt: '', demo: '', d: e.data,
  }));
  return [...projects, ...experiments].sort((a, b) => a.d.cardOrder - b.d.cardOrder);
}
