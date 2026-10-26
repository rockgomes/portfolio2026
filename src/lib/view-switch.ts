// View switch motion (motion plan, moment 04, "on view switch"): the same move as the Selected work filter (0.55s,
// power3.inOut). Sections that leave fade out, sections in both views slide to their new place, sections that arrive
// fade in, and the colours of the new view fade in (base.css, .view-fading). The section being read stays where it is
// on the screen; if the new view does not have it, the page goes to the top and fades in. Only sections on screen animate.
// The slide is measured on the screen, not on the page: GSAP Flip measures page positions, so it would undo the
// scroll that keeps the reading position. With reduced motion the switch is instant.
// `viewchange` is sent when html[data-view] changes, and `viewsettled` once the page has its final layout (scroll
// animations measure the page again then, see Motion.astro).
import { gsap, reduceMotion } from './motion';

const root = document.documentElement;
const blocks = () => [...document.querySelectorAll<HTMLElement>('#main > section, body > footer')];
const shown = (el: HTMLElement) => el.getClientRects().length > 0;
const top = (el: HTMLElement) => el.getBoundingClientRect().top;
const onScreen = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight; };

const setView = (v: string) => { root.dataset.view = v; root.dispatchEvent(new CustomEvent('viewchange', { detail: v })); };
const settle = () => root.dispatchEvent(new CustomEvent('viewsettled', { detail: root.dataset.view }));

const INPUTS = ['wheel', 'touchmove', 'keydown'] as const;
const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];

let finish: (() => void) | null = null;
let colourTimer = 0;

/** Sets html[data-view] to `v`. `animate` is false on page load. */
export function switchView(v: string, animate = true) {
  finish?.(); // a second click ends the running switch at once, then starts the new one
  if (!animate || reduceMotion() || root.dataset.view === v) { setView(v); settle(); return; }

  const all = blocks();
  const before = new Map(all.filter((el) => shown(el) && onScreen(el)).map((el) => [el, top(el)]));
  // The section being read: the one across a line a third of the way down the screen, under the sticky header
  const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
  const line = header + (innerHeight - header) / 3;
  const anchor = [...before.keys()].find((el) => top(el) <= line && el.getBoundingClientRect().bottom > line);
  // If the visitor scrolls during the fade, their scroll wins and the page is not moved. Only real input counts:
  // the browser also moves the scroll by itself when images above load.
  let scrolled = false;
  const onInput = (e: Event) => { if (!(e instanceof KeyboardEvent) || SCROLL_KEYS.includes(e.key)) scrolled = true; };
  INPUTS.forEach((t) => addEventListener(t, onInput, { passive: true }));
  // Sections on screen that the new view hides: switch for one style read, then put the old view back
  const was = root.dataset.view!;
  root.dataset.view = v;
  const leaving = [...before.keys()].filter((el) => !shown(el));
  root.dataset.view = was;

  let fade: gsap.core.Tween | null = null;
  let swapped = false, done = false;
  root.dataset.switching = ''; // until the motion has ended (the tests wait for it)

  const swap = () => {
    swapped = true;
    clearTimeout(colourTimer);
    root.classList.add('view-fading');
    setView(v);
    if (leaving.length) gsap.set(leaving, { clearProps: 'opacity,visibility' });
    const kept = !!anchor && shown(anchor);
    const jumped = !kept && scrollY > 0; // a new page from the top: nothing slides, everything fades in
    INPUTS.forEach((t) => removeEventListener(t, onInput));
    if (!scrolled && kept) scrollBy({ top: top(anchor!) - before.get(anchor!)!, behavior: 'instant' });
    else if (!scrolled) scrollTo({ top: 0, behavior: 'instant' });
    const now = all.filter((el) => shown(el) && onScreen(el));
    const staying = jumped ? [] : now.filter((el) => before.has(el) && Math.abs(before.get(el)! - top(el)) > 1);
    const entering = now.filter((el) => jumped || !before.has(el));
    if (!staying.length && !entering.length) { end(); return; }
    const tl = gsap.timeline({ onComplete: end });
    staying.forEach((el) => tl.fromTo(el, { y: before.get(el)! - top(el) }, { y: 0, duration: 0.55, ease: 'power3.inOut' }, 0));
    if (entering.length) tl.fromTo(entering, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.15);
  };
  const end = () => {
    if (done) return;
    done = true; finish = null;
    delete root.dataset.switching;
    gsap.killTweensOf(all);
    gsap.set(all, { clearProps: 'opacity,visibility,transform' });
    colourTimer = window.setTimeout(() => root.classList.remove('view-fading'), 350);
    settle();
  };
  finish = () => { if (!swapped) { fade?.kill(); swap(); } end(); };

  if (leaving.length) fade = gsap.to(leaving, { autoAlpha: 0, duration: 0.2, ease: 'power2.in', onComplete: swap });
  else swap();
}
