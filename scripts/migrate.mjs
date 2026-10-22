// One-off: Webflow CMS export -> Astro content files + local images.
// Usage: node scripts/migrate.mjs /home/claude/migration/items.json
import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';

const SRC = process.argv[2];
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const items = JSON.parse(fs.readFileSync(SRC, 'utf8'));

const TAGS = {
  'dealfront-ai-company-profile': { industry: ['B2B', 'SaaS'], focus: ['AI', 'Data'] },
  'dealfront-dynamic-lists': { industry: ['B2B', 'SaaS'], focus: ['Data'] },
  'inbank---customer-service-backoffice': { industry: ['B2B', 'Fintech'], focus: ['Back-office', 'Design systems'] },
  'inbank---hire-purchase': { industry: ['B2C', 'Fintech'], focus: ['Checkout'] },
  'bigbank---loan-flow': { industry: ['B2C', 'Fintech'], focus: ['Checkout'] },
  'bigbank---financial-backoffice': { industry: ['B2B', 'Fintech'], focus: ['Back-office', 'Data'] },
  'fieldset': { industry: ['B2B'], focus: ['Data', 'Code'] },
  'karaoke-os': { industry: ['B2C'], focus: ['Code'] },
  'moveoutsale': { industry: ['B2C'], focus: ['Code'] },
  'portfolio-presentation-template': { industry: [], focus: ['Code', 'Motion'] },
};

const downloads = []; // {url, file}
const report = { items: [], images: 0, scripts: 0, warnings: [] };

function cleanName(url, used) {
  let base = url.split('/').pop().split('?')[0];
  for (let k = 0; k < 3 && /%[0-9a-f]{2}/i.test(base); k++) base = decodeURIComponent(base);
  while (/^[0-9a-f]{24}_/.test(base)) base = base.slice(25);
  let ext = path.extname(base).toLowerCase() || '.bin';
  if (ext === '.jpeg') ext = '.jpg';
  let stem = path.basename(base, path.extname(base)).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'image';
  let name = stem + ext, n = 2;
  while (used.has(name)) name = `${stem}-${n++}${ext}`;
  used.add(name);
  return name;
}

// Find the balanced outer <div ...> starting at index i.
function balancedDiv(html, i) {
  const re = /<\/?div\b[^>]*>/gi; re.lastIndex = i; let depth = 0, m;
  while ((m = re.exec(html))) { depth += m[0][1] === '/' ? -1 : 1; if (depth === 0) return re.lastIndex; }
  return html.length;
}

function convert(html, coll, slug, used) {
  const assetDir = `src/assets/${coll}/${slug}`;
  const rel = `../../assets/${coll}/${slug}`;
  const local = (url) => {
    const hit = downloads.find(d => d.url === url);
    if (hit) return hit.name;
    const name = cleanName(url, used);
    if (/\.gif$/i.test(name)) {
      // Animated GIFs skip Astro's image pipeline (it would flatten them).
      downloads.push({ url, file: path.join(ROOT, 'public/media', coll, slug, name), name: `/media/${coll}/${slug}/${name}`, abs: true });
      return `/media/${coll}/${slug}/${name}`;
    }
    downloads.push({ url, file: path.join(ROOT, assetDir, name), name });
    return name;
  };
  const ref = (url) => { const n = local(url); return n.startsWith('/') ? n : `${rel}/${n}`; };
  // 1. Pull out embeds and video figures as raw HTML blocks.
  const raw = [];
  let out = '', i = 0;
  const startRe = /<div[^>]*data-rt-embed-type=['"]true['"][^>]*>|<figure[^>]*w-richtext-figure-type-video[^>]*>/gi;
  let m;
  while ((m = startRe.exec(html))) {
    const s = m.index;
    let e;
    if (m[0].startsWith('<figure')) e = html.indexOf('</figure>', s) + 9; else e = balancedDiv(html, s);
    out += html.slice(i, s);
    let block = html.slice(s, e);
    // Webflow-hosted scripts -> local copies in public/embeds
    block = block.replace(/src=["'](https:\/\/cdn\.prod\.website-files\.com\/[^"']+\.js)["']/g, (_, u) => {
      const name = decodeURIComponent(u.split('/').pop()).replace(/^[0-9a-f]{24}_/, '');
      if (!downloads.find(d => d.url === u)) { downloads.push({ url: u, file: path.join(ROOT, 'public/embeds', name), name }); report.scripts++; }
      return `src="/embeds/${name}"`;
    });
    block = block.replace(/\n\s*\n/g, '\n'); // no blank lines inside an HTML block
    out += `\n\nRAWBLOCK${raw.length}END\n\n`;
    raw.push(block.trim());
    i = startRe.lastIndex = e;
  }
  out += html.slice(i);

  // 2. Turndown with figure + caption rule.
  const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' });
  td.addRule('figure', {
    filter: (n) => n.nodeName === 'FIGURE',
    replacement: (_c, node) => {
      const img = node.querySelector('img');
      const cap = node.querySelector('figcaption');
      if (!img) return '\n\n' + node.outerHTML + '\n\n';
      const src = img.getAttribute('src');
      const alt = (img.getAttribute('alt') || '').replace(/[\[\]]/g, '').replace(/\s+/g, ' ').trim();
      let md = `\n\n![${alt}](${ref(src)})`;
      if (cap && cap.textContent.trim()) md += `\n<figcaption>${cap.innerHTML.trim()}</figcaption>`;
      return md + '\n\n';
    },
  });
  td.addRule('img', {
    filter: 'img',
    replacement: (_c, node) => `![${(node.getAttribute('alt') || '').replace(/[\[\]]/g, '')}](${ref(node.getAttribute('src'))})`,
  });
  let md = td.turndown(out);
  md = md.replace(/RAWBLOCK(\d+)END/g, (_, n) => raw[+n]);
  if (/website-files\.com/.test(md.replace(/\/embeds\//g, ''))) report.warnings.push(`${slug}: a Webflow CDN link is still in the body`);
  return { md: md.trim() + '\n', raws: raw.length };
}

const yaml = (v) => {
  if (v === null || v === undefined || v === '') return '""';
  if (Array.isArray(v)) return '[' + v.map(x => JSON.stringify(x)).join(', ') + ']';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  return JSON.stringify(String(v));
};

for (const [coll, list] of Object.entries(items)) {
  for (const it of list) {
    if (!it.lastPublished || it.isArchived) continue;
    const f = it.fieldData, slug = f.slug, used = new Set();
    const isProject = coll === 'projects';
    const tags = TAGS[slug] || { industry: [], focus: [] };
    const fm = {};
    const img = (field) => {
      const v = f[field];
      if (!v || !v.url) return '';
      const name = cleanName(v.url, used);
      downloads.push({ url: v.url, file: path.join(ROOT, `src/assets/${coll}/${slug}`, name), name });
      return `../../assets/${coll}/${slug}/${name}`;
    };
    fm.name = f.name;
    if (isProject) {
      fm.heroTitle = f['hero-title'] || '';
      fm.heroDescription = f['hero-description'] || '';
      fm.homeImage = img('home-page-image');
      fm.homeImageAlt = (f['home-page-image'] && f['home-page-image'].alt) || '';
      fm.tag1 = f['tag-1'] || '';
      fm.tag2 = f['tag-2'] || '';
    } else {
      fm.summary = f.summary || '';
      fm.cardImage = img('card-image');
      fm.heroImage = img('hero-image');
      fm.date = f.date ? f.date.slice(0, 10) : '';
      fm.tools = f.tools || '';
      fm.liveDemoUrl = f['live-demo-url'] || '';
      fm.sourceCodeUrl = f['source-code-url'] || '';
      fm.featured = !!f.featured;
      // Option field: export holds the option id; map to its name.
      const cats = { eb4509b3a9042cf47fd61c5730eda03b: 'AI', afb5d31441172e6e3e40ea9e72b31da5: 'Design', '407e4c2568b9870c92bf35c6ada8538d': 'Code', '67bced16248c4a730fba0fbf0b5ce60c': 'Motion', '6db7369bf7317f4695869ea4dcc26231': 'Prototype' };
      fm.category = cats[f.category] || f.category || '';
      fm.readTime = f['read-time'] || '';
    }
    fm.type = isProject ? 'client' : 'experiment';
    fm.industry = tags.industry;
    fm.focus = tags.focus;
    fm.tagsToCheck = true;
    fm.private = false;
    fm.webflowId = it.id;

    const { md, raws } = convert((isProject ? f.description : f.body) || '', coll, slug, used);
    for (const k of Object.keys(fm)) if (fm[k] === '' && /Image$/.test(k)) delete fm[k];
    const body = '---\n' + Object.entries(fm).map(([k, v]) => `${k}: ${yaml(v)}`).join('\n') + '\n---\n\n' + md;
    const file = path.join(ROOT, 'src/content', coll, slug + '.md');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
    report.items.push({ coll, slug, embeds: raws });
  }
}

// Download everything (sequential-ish, small set).
let ok = 0;
await Promise.all(downloads.map(async (d) => {
  fs.mkdirSync(path.dirname(d.file), { recursive: true });
  const r = await fetch(d.url);
  if (!r.ok) { report.warnings.push(`download failed ${r.status}: ${d.url}`); return; }
  const buf = Buffer.from(await r.arrayBuffer());
  if (!buf.length) { report.warnings.push(`empty file: ${d.url}`); return; }
  fs.writeFileSync(d.file, buf); ok++;
}));
report.images = downloads.filter(d => !d.file.endsWith('.js')).length;
report.downloaded = ok;
report.planned = downloads.length;
fs.writeFileSync(path.join(ROOT, 'scripts/migrate-report.json'), JSON.stringify({ ...report, downloads: downloads.map(d => ({ url: d.url, file: path.relative(ROOT, d.file) })) }, null, 1));
console.log(JSON.stringify({ items: report.items.length, images: report.images, scripts: report.scripts, downloaded: ok, planned: downloads.length, warnings: report.warnings }, null, 1));

// Embed scripts can point at more Webflow-hosted media (Flex Academy videos and posters).
// Copy those into public/embeds/<script-name>/ and point the script at the local copies.
for (const d of downloads.filter(d => d.file.endsWith('.js') && fs.existsSync(d.file))) {
  let js = fs.readFileSync(d.file, 'utf8');
  const urls = [...new Set(js.match(/https:\/\/cdn\.prod\.website-files\.com\/[^"'\s)\\]+/g) || [])];
  const dir = path.join(path.dirname(d.file), path.basename(d.file, '.js').replace(/-embeds$/, ''));
  for (const u of urls) {
    const name = u.split('/').pop().replace(/^[0-9a-f]{24}_/, '');
    fs.mkdirSync(dir, { recursive: true });
    const dst = path.join(dir, name);
    if (!fs.existsSync(dst)) {
      const r = await fetch(u);
      if (!r.ok) { console.log('embed media failed', u); continue; }
      fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer()));
    }
    js = js.split(u).join('/embeds/' + path.basename(dir) + '/' + name);
  }
  fs.writeFileSync(d.file, js);
  console.log(`localized ${urls.length} media links in ${path.basename(d.file)}`);
}
