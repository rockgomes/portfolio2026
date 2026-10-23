// Shared motion rules (see the motion plan): each element moves once, when it comes into view, then stays still.
// The page renders in its end state. Motion only runs when JS loads and the visitor has not asked for reduced motion,
// so screenshot tests (run with reduced motion) and no-JS visitors always see the finished page.
import { gsap } from 'gsap';

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.defaults({ ease: 'power3.out', duration: 0.5 });

/**
 * Plays `play` once when `el` comes into view. `start` sets the first frame right before that,
 * so nothing sits hidden at rest. Elements already on screen at load play straight away.
 */
export function playOnce(el: Element | null, start: () => void, play: () => unknown, threshold = 0.35) {
  if (!el || reduceMotion()) return;
  const r = el.getBoundingClientRect();
  start();
  if (r.top < innerHeight && r.bottom > 0 && r.width > 0) { play(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); play(); }
  }, { threshold });
  io.observe(el);
}

export { gsap };
