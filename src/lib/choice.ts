// One choice out of a few: a row of tabs (Tabs.astro, or the .utab underline tabs, role="tab") or a segmented
// control (Segmented.astro, role="radio"). The one place where these get their clicks and arrow keys.
// Click or arrow keys select; only the selected option is in the tab order; an option with aria-disabled="true" is
// skipped. Each option can show one panel (the others get `hidden`). Motion as in the Experience client tabs: the box
// eases to its new height and the new panel fades in (`animate: false` swaps at once). With reduced motion the swap
// is always instant.
import { gsap, reduceMotion } from './motion';

interface Choice {
  options: HTMLElement[];
  panels?: (HTMLElement | null)[];
  box?: HTMLElement; // the element whose height eases (usually the panels' parent)
  onSelect?: (i: number) => void;
  animate?: boolean;
}

const attrOf = (o?: HTMLElement) => (o?.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-selected');

/** Marks option `i` as the selected one (and the only one in the tab order), with no event and no motion. */
export function mark(options: HTMLElement[], i: number) {
  const attr = attrOf(options[0]);
  options.forEach((o, j) => { o.setAttribute(attr, String(j === i)); o.tabIndex = j === i ? 0 : -1; });
}

export function bindChoice({ options, panels = [], box, onSelect, animate = true }: Choice) {
  const off = (i: number) => options[i].getAttribute('aria-disabled') === 'true';
  const select = (i: number, focus = false) => {
    if (off(i)) return;
    const from = box?.offsetHeight ?? 0;
    mark(options, i);
    panels.forEach((p, j) => { if (p) p.hidden = j !== i; });
    onSelect?.(i);
    if (focus) options[i].focus();
    if (!animate || reduceMotion()) return;
    if (box) gsap.fromTo(box, { height: from }, { height: box.scrollHeight, duration: 0.35, ease: 'power2.out', clearProps: 'height' });
    const shown = panels[i] ?? box;
    if (shown) gsap.fromTo(shown, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
  };
  options.forEach((o, i) => {
    o.addEventListener('click', () => select(i));
    o.addEventListener('keydown', (e) => {
      // Tabs use left and right only (up and down keep scrolling the page); radios also take up and down
      const radio = attrOf(o) === 'aria-checked';
      const n = e.key === 'ArrowRight' || (radio && e.key === 'ArrowDown') ? 1 : e.key === 'ArrowLeft' || (radio && e.key === 'ArrowUp') ? -1 : 0;
      if (!n) return;
      e.preventDefault();
      let j = i;
      do j = (j + n + options.length) % options.length; while (off(j) && j !== i);
      if (j !== i) select(j, true);
    });
  });
  return select;
}
