import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// One source for each shared piece. These checks read the code, so a copy of a shared piece fails the build
// before anyone has to spot it in review.
const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : [p]; });
const src = files('src').filter((f) => /\.(astro|ts|css)$/.test(f));
const where = (re: RegExp, skip: (line: string) => boolean = () => false) =>
  src.flatMap((f) => readFileSync(f, 'utf8').split('\n').flatMap((l, i) => (re.test(l) && !skip(l) ? [`${f}:${i + 1}`] : [])));
const inCodeSample = (l: string) => l.includes('<code>');

test.describe('shared pieces have one source', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1000, 'reads files, once is enough');

  test('segmented control markup only in Segmented.astro', () => {
    expect(where(/<button[^>]*role="radio"/, inCodeSample).filter((f) => !f.startsWith('src/components/Segmented.astro'))).toEqual([]);
  });
  test('tab markup only in Tabs.astro', () => {
    expect(where(/class(:list)?=[^>]*\bui-tab\b(?!s)/).filter((f) => !f.startsWith('src/components/Tabs.astro'))).toEqual([]);
  });
  test('arrow keys for tabs and segmented controls only in choice.ts', () => {
    expect(where(/ArrowRight/).filter((f) => !f.startsWith('src/lib/choice.ts'))).toEqual([]);
  });
  test('video play and pause in view only in autoplay.ts', () => {
    expect(where(/\.play\(\)\.catch|v\.pause\(\)|video\.pause\(\)/).filter((f) => !f.startsWith('src/lib/autoplay.ts'))).toEqual([]);
  });
  test('no copies of the global hidden and focus rules', () => {
    expect(where(/\[hidden\]\s*\{\s*display:\s*none/).filter((f) => !f.startsWith('src/styles/base.css'))).toEqual([]);
    expect(where(/:focus-visible\s*\{\s*outline:\s*2px solid var\(--color-annotation-measure\);\s*outline-offset:\s*2px;?\s*\}/).filter((f) => !f.startsWith('src/styles/base.css'))).toEqual([]);
  });
});
