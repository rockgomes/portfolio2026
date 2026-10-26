// View switch motion (motion plan, moment 04, "on view switch"). The page fades out, the view changes, and while the
// page fades back in, sections that change place slide to their new place (the same move as the Projects filter:
// 0.55s, power3.inOut) and every other section on screen rises 16px into place. So something always moves, also
// when no section changes place (Design lead to Engineer at the top: the hero is in both views).
// The colours of the new view fade in (base.css, .view-fading), and the section being read stays where it is on the
// screen; if the new view does not have it, the page goes to the top. With reduced motion the switch is instant.
// The slide is measured on the screen, not on the page: GSAP Flip measures page positions, so it would undo the
// scroll that keeps the reading position.
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

/** Remembers the section being read: the one across a line a third of the way down the screen, under the sticky
 *  header. Returns a function to call once the new view is set: it keeps that section in place, or goes to the top
 *  when the new view does not have it, and says which. */
function keepPlace() {
  const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
  const line = header + (innerHeight - header) / 3;
  const anchor = blocks().find((el) => shown(el) && top(el) <= line && el.getBoundingClientRect().bottom > line);
  const at = anchor ? top(anchor) : 0;
  // If the visitor scrolls during the motion, their scroll wins and the page is not moved. Only real input counts:
  // the browser also moves the scroll by itself when images above load.
  let scrolled = false;
  const onInput = (e: Event) => { if (!(e instanceof KeyboardEvent) || SCROLL_KEYS.includes(e.key)) scrolled = true; };
  INPUTS.forEach((t) => addEventListener(t, onInput, { passive: true }));
  return () => {
    INPUTS.forEach((t) => removeEventListener(t, onInput));
    const kept = !!anchor && shown(anchor);
    if (!scrolled && kept) scrollBy({ top: top(anchor!) - at, behavior: 'instant' });
    else if (!scrolled) scrollTo({ top: 0, behavior: 'instant' });
    return kept;
  };
}

/** Sets html[data-view] to `v`. `animate` is false on page load. Only sections on screen animate. */
export function switchView(v: string, animate = true) {
  finish?.(); // a second click ends the running switch at once, then starts the new one
  if (!animate || reduceMotion() || root.dataset.view === v) { setView(v); settle(); return; }

  const all = blocks();
  const frames = [...document.querySelectorAll<HTMLElement>('#main, body > footer')];
  const before = new Map(all.filter((el) => shown(el) && onScreen(el)).map((el) => [el, top(el)]));
  const place = keepPlace();

  let swapped = false, done = false;
  root.dataset.switching = ''; // until the motion has ended (the tests wait for it)

  const swap = () => {
    swapped = true;
    clearTimeout(colourTimer);
    root.classList.add('view-fading');
    setView(v);
    const wasDown = scrollY > 0;
    const kept = place();
    const jumped = !kept && wasDown; // a new page from the top: nothing slides, everything rises
    const now = all.filter((el) => shown(el) && onScreen(el));
    const staying = jumped ? [] : now.filter((el) => before.has(el) && Math.abs(before.get(el)! - top(el)) > 1);
    const rising = now.filter((el) => !staying.includes(el));
    // The new view takes the browser a long frame (about 150ms) to lay out. The motion starts on the next frame, so
    // that time is not taken from it (otherwise the first half of the rise is never seen).
    const tl = gsap.timeline({ paused: true, onComplete: end });
    gsap.delayedCall(0, () => { if (!done) tl.play(); });
    tl.to(frames, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0);
    staying.forEach((el) => tl.fromTo(el, { y: before.get(el)! - top(el) }, { y: 0, duration: 0.55, ease: 'power3.inOut' }, 0));
    if (rising.length) tl.fromTo(rising, { y: 16 }, { y: 0, duration: 0.35, ease: 'power2.out' }, 0);
  };
  const end = () => {
    if (done) return;
    done = true; finish = null;
    delete root.dataset.switching;
    gsap.killTweensOf([...all, ...frames]);
    gsap.set(all, { clearProps: 'transform' });
    gsap.set(frames, { clearProps: 'opacity' });
    colourTimer = window.setTimeout(() => root.classList.remove('view-fading'), 350);
    settle();
  };
  const fade = gsap.to(frames, { opacity: 0, duration: 0.18, ease: 'power1.in', onComplete: swap });
  finish = () => { if (!swapped) { fade.kill(); swap(); } end(); };
}
