// Figma layer glyphs (❖ master, ◇ variant, ◆ property, ◐ boolean).
// IBM Plex Mono has no such characters, so browsers fall back to a font that draws them at about half
// the size Figma shows. Inline SVGs keep them at 1em (11px next to the mono labels), like in Figma.
const d = (cx: number, cy: number, r: number) => `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`;
const svg = (body: string) =>
  `<svg class="glyph" width="1em" height="1em" viewBox="0 0 12 12" aria-hidden="true" focusable="false">${body}</svg>`;

export const GLYPHS = {
  master: svg(`<path d="${d(6, 2.75, 2.55)}${d(9.25, 6, 2.55)}${d(6, 9.25, 2.55)}${d(2.75, 6, 2.55)}" fill="currentColor"/>`),
  variant: svg(`<path d="${d(6, 6, 5)}" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>`),
  prop: svg(`<path d="${d(6, 6, 5)}" fill="currentColor"/>`),
  bool: svg(`<circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6 1.5a4.5 4.5 0 0 0 0 9Z" fill="currentColor"/>`),
} as const;

export type GlyphKind = keyof typeof GLYPHS;
