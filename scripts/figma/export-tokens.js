// Figma -> tokens.json. Runs inside the Figma file MfrBjIutW2nsL0mimJgMnt as plugin code (for example with the
// Figma MCP use_figma tool) and returns the full src/styles/tokens.json. Save the result there, then run
// `npm run tokens` to rebuild tokens.css. Format: W3C design tokens (DTCG). Modes live in $extensions.
const MODES = { dark: 'Dark', engineer: 'Light - Dev', 'engineer-dark': 'Dark - Dev', recruiter: 'Light - Recruiter', 'recruiter-dark': 'Dark - Recruiter' };
const BASE = 'Light - Crisp';
// Font fallbacks are not stored in Figma; the site uses these stacks.
const STACKS = {
  'IBM Plex Sans': ['IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
  'IBM Plex Mono': ['IBM Plex Mono', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
};
const FONT_KEY = { 'IBM Plex Sans': 'sans', 'IBM Plex Mono': 'mono' };
const WEIGHT = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };

const col = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === 'tokens');
const modeId = (name) => col.modes.find((m) => m.name === name).modeId;
const vars = await Promise.all(col.variableIds.map((id) => figma.variables.getVariableByIdAsync(id)));
const byId = Object.fromEntries(vars.map((v) => [v.id, v]));

const r3 = (n) => Math.round(n * 1000) / 1000;
const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
const color = (c) => ({ colorSpace: 'srgb', components: [c.r, c.g, c.b].map(r3), alpha: r3(c.a ?? 1), hex: hex(c) });
const path = (name) => name.split('/');
const ref = (v) => `{${path(v.name).join('.')}}`;
const set = (obj, keys, val) => { let o = obj; keys.slice(0, -1).forEach((k) => (o = o[k] || (o[k] = {}))); o[keys[keys.length - 1]] = val; };

// Alias values are written as references, colours as DTCG colour objects.
const value = (v, raw) => {
  if (raw?.type === 'VARIABLE_ALIAS') return ref(byId[raw.id]);
  if (v.resolvedType === 'COLOR') return color(raw);
  return `${raw}px`;
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const out = {
  $description: 'Exported from the Figma file MfrBjIutW2nsL0mimJgMnt (collection "tokens") with scripts/figma/export-tokens.js. Do not edit by hand.',
};
for (const v of vars) {
  const base = value(v, v.valuesByMode[modeId(BASE)]);
  const token = { $type: v.resolvedType === 'COLOR' ? 'color' : 'dimension', $value: base };
  if (v.description) token.$description = v.description;
  const modes = {};
  for (const [key, name] of Object.entries(MODES)) {
    const val = value(v, v.valuesByMode[modeId(name)]);
    if (!same(val, base)) modes[key] = val;
  }
  if (Object.keys(modes).length) token.$extensions = { 'com.rockgomes.modes': modes };
  set(out, path(v.name), token);
}

for (const [family, stack] of Object.entries(STACKS)) set(out, ['font', FONT_KEY[family]], { $type: 'fontFamily', $value: stack });

for (const s of await figma.getLocalTextStylesAsync()) {
  const lh = s.lineHeight.unit === 'PIXELS' ? `${s.lineHeight.value}px` : Math.round(s.lineHeight.value) / 100;
  const ls = s.letterSpacing.unit === 'PERCENT' ? r3(s.letterSpacing.value / 100) : 0;
  const token = {
    $type: 'typography',
    $value: { fontFamily: `{font.${FONT_KEY[s.fontName.family]}}`, fontWeight: WEIGHT[s.fontName.style], fontSize: `${s.fontSize}px`, lineHeight: lh, letterSpacing: `${ls}em` },
  };
  const fluid = s.description.match(/fluid:\s*(.+)$/m);
  if (fluid) token.$extensions = { 'com.rockgomes.fluid': fluid[1].trim() };
  set(out, ['typography', ...s.name.toLowerCase().replace(/ /g, '-').split('/')], token);
}

for (const s of await figma.getLocalEffectStylesAsync()) {
  const name = s.name.split('/').pop().toLowerCase();
  set(out, ['shadow', name], {
    $type: 'shadow',
    $value: s.effects.filter((e) => e.type === 'DROP_SHADOW').map((e) => ({ color: color(e.color), offsetX: `${e.offset.x}px`, offsetY: `${e.offset.y}px`, blur: `${e.radius}px`, spread: `${e.spread ?? 0}px` })),
  });
}

return JSON.stringify(out, null, 2);
