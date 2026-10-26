// View switch motion (motion plan, moment 04, "on view switch"). There are four versions to compare on the preview,
// chosen with ?motion= in the URL (Rock picks one, the others are then removed):
//   a (default) slide: the same move as the Selected work filter (0.55s, power3.inOut). Sections that leave fade out,
//     sections in both views slide to their new place, sections that arrive fade in.
//   b fade: the page fades out and fades back in with the new view.
//   c wipe: a band in the new view's page colour moves across the screen, the view changes under it. It moves in the
//     direction of the switch (to the right for an option to the right).
//   d zoom: the page gets smaller on the stage colour, like zooming out of a Figma frame, changes, and zooms back in.
// In every version the colours of the new view fade in (base.css, .view-fading), and the section being read stays
// where it is on the screen; if the new view does not have it, the page goes to the top. With reduced motion the
// switch is instant.
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
const headerBottom = () => document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;

const setView = (v: string) => { root.dataset.view = v; root.dispatchEvent(new CustomEvent('viewchange', { detail: v })); };
const settle = () => root.dispatchEvent(new CustomEvent('viewsettled', { detail: root.dataset.view }));
/** Runs `read` with html[data-view] set to `v` for one style read, then puts the old view back. */
const peek = <T>(v: string, read: () => T): T => { const was = root.dataset.view!; root.dataset.view = v; const r = read(); root.dataset.view = was; return r; };

const INPUTS = ['wheel', 'touchmove', 'keydown'] as const;
const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];

let finish: (() => void) | null = null;
let colourTimer = 0;

/** Sets html[data-view] to `v`. `animate` is false on page load. */
export function switchView(v: string, animate = true) {
  finish?.(); // a second click ends the running switch at once, then starts the new one
  if (!animate || reduceMotion() || root.dataset.view === v) { setView(v); settle(); return; }
  const m = new URL(location.href).searchParams.get('motion') ?? 'a';
  if (m === 'b' || m === 'c' || m === 'd') cover(v, m);
  else slide(v);
}

/** Remembers the section being read: the one across a line a third of the way down the screen, under the sticky
 *  header. Returns a function to call once the new view is set: it keeps that section in place, or goes to the top
 *  when the new view does not have it, and says which. */
function keepPlace() {
  const header = headerBottom();
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

const startColours = () => { clearTimeout(colourTimer); root.classList.add('view-fading'); };
const endColours = () => { colourTimer = window.setTimeout(() => root.classList.remove('view-fading'), 350); };

/** Version a. Only sections on screen animate. */
function slide(v: string) {
  const all = blocks();
  const before = new Map(all.filter((el) => shown(el) && onScreen(el)).map((el) => [el, top(el)]));
  const place = keepPlace();
  const leaving = peek(v, () => [...before.keys()].filter((el) => !shown(el)));

  let fade: gsap.core.Tween | null = null;
  let swapped = false, done = false;
  root.dataset.switching = ''; // until the motion has ended (the tests wait for it)

  const swap = () => {
    swapped = true;
    startColours();
    setView(v);
    if (leaving.length) gsap.set(leaving, { clearProps: 'opacity,visibility' });
    const wasDown = scrollY > 0;
    const kept = place();
    const jumped = !kept && wasDown; // a new page from the top: nothing slides, everything fades in
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
    endColours();
    settle();
  };
  finish = () => { if (!swapped) { fade?.kill(); swap(); } end(); };

  if (leaving.length) fade = gsap.to(leaving, { autoAlpha: 0, duration: 0.2, ease: 'power2.in', onComplete: swap });
  else swap();
}

/** Versions b, c and d: the page is covered (faded, wiped or zoomed out), the view changes, and the page comes back. */
function cover(v: string, m: 'b' | 'c' | 'd') {
  const frames = [...document.querySelectorAll<HTMLElement>('#main, body > footer')];
  const place = keepPlace();
  const tl = gsap.timeline({ onComplete: () => end() });
  let wipe: HTMLElement | null = null;
  let swapped = false, done = false;
  root.dataset.switching = '';

  const swap = () => {
    swapped = true;
    startColours();
    setView(v);
    place();
  };
  const end = () => {
    if (done) return;
    done = true; finish = null;
    delete root.dataset.switching;
    tl.kill();
    wipe?.remove();
    root.classList.remove('view-zoom');
    gsap.set([...frames, ...blocks()], { clearProps: 'opacity,transform,transformOrigin' });
    endColours();
    settle();
  };
  finish = () => { if (!swapped) swap(); end(); };

  if (m === 'b') {
    tl.to(frames, { opacity: 0, duration: 0.18, ease: 'power1.in' })
      .call(swap)
      .to(frames, { opacity: 1, duration: 0.3, ease: 'power1.out' });
  } else if (m === 'c') {
    const order = [...document.querySelectorAll<HTMLElement>('[data-view-option]')].map((b) => b.dataset.viewOption);
    const right = order.indexOf(v) > order.indexOf(root.dataset.view);
    wipe = document.createElement('div');
    wipe.className = 'view-wipe';
    wipe.style.top = `${headerBottom()}px`; // under the header, so the switch stays in sight
    // The views share the page colour, so the band's edges carry the new view's accent colour
    wipe.style.borderColor = peek(v, () => getComputedStyle(root).getPropertyValue('--color-annotation-measure'));
    document.body.append(wipe);
    tl.fromTo(wipe, { xPercent: right ? -100 : 100 }, { xPercent: 0, duration: 0.32, ease: 'power3.in' })
      .call(swap)
      .to(wipe, { xPercent: right ? 100 : -100, duration: 0.42, ease: 'power3.out' }, '+=0.06');
  } else {
    // The page and the footer shrink around the middle of the screen, so they stay together
    const centre = () => frames.forEach((f) => gsap.set(f, { transformOrigin: `${innerWidth / 2 - f.offsetLeft}px ${scrollY + innerHeight / 2 - f.offsetTop}px` }));
    root.classList.add('view-zoom');
    centre();
    // The sections fade out and back in (hidden ones too, where it does nothing), so the layout change is not seen
    const all = blocks();
    tl.to(frames, { scale: 0.92, duration: 0.3, ease: 'power2.inOut' })
      .to(all, { opacity: 0, duration: 0.12, ease: 'power1.in' }, 0.18)
      .call(() => {
        gsap.set(frames, { scale: 1 }); // the reading position is measured at full size
        swap();
        centre();
        gsap.set(frames, { scale: 0.92 });
      })
      .to(frames, { scale: 1, duration: 0.4, ease: 'power3.out' })
      .to(all, { opacity: 1, duration: 0.2, ease: 'power1.out' }, '<');
  }
}
