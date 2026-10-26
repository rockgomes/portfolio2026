// One choice out of a few: a row of tabs (.ui-tab, role="tab") or a segmented control (.ui-seg, role="radio").
// Click or arrow keys select; only the selected option is in the tab order. Each option can show one panel (the
// others get `hidden`). Motion as in the Experience client tabs: the box eases to its new height and the new panel
// fades in. With reduced motion the swap is instant. Used by Experience, ProofSwitch, MethodStepper and InspectPins.
import { gsap, reduceMotion } from './motion';

interface Choice {
  options: HTMLElement[];
  panels?: (HTMLElement | null)[];
  box?: HTMLElement; // the element whose height eases (usually the panels' parent)
  onSelect?: (i: number) => void;
}

export function bindChoice({ options, panels = [], box, onSelect }: Choice) {
  const attr = options[0]?.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-selected';
  const select = (i: number, focus = false) => {
    const from = box?.offsetHeight ?? 0;
    options.forEach((o, j) => { o.setAttribute(attr, String(j === i)); o.tabIndex = j === i ? 0 : -1; });
    panels.forEach((p, j) => { if (p) p.hidden = j !== i; });
    onSelect?.(i);
    if (focus) options[i].focus();
    if (reduceMotion()) return;
    if (box) gsap.fromTo(box, { height: from }, { height: box.scrollHeight, duration: 0.35, ease: 'power2.out', clearProps: 'height' });
    const shown = panels[i] ?? box;
    if (shown) gsap.fromTo(shown, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
  };
  options.forEach((o, i) => {
    o.addEventListener('click', () => select(i));
    o.addEventListener('keydown', (e) => {
      // Tabs use left and right only (up and down keep scrolling the page); radios also take up and down
      const radio = attr === 'aria-checked';
      const n = e.key === 'ArrowRight' || (radio && e.key === 'ArrowDown') ? 1 : e.key === 'ArrowLeft' || (radio && e.key === 'ArrowUp') ? -1 : 0;
      if (n) { e.preventDefault(); select((i + n + options.length) % options.length, true); }
    });
  });
  return select;
}
