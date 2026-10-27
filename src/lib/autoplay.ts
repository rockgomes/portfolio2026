// Screen recordings used as proof (ProofVideo, LivePage) play on their own while a third of them is in view, and pause
// when they leave it or are hidden (a closed switch panel, the live page video on desktop). They keep their controls,
// so a visitor can always pause one (WCAG 2.2.2), and a video the visitor paused stays paused. With reduced motion
// they never start on their own and do not loop. Blocked autoplay (iOS Low Power Mode) just leaves the controls.
import { reduceMotion } from './motion';

const held = new WeakSet<HTMLVideoElement>(); // paused by the visitor
const ours = new WeakSet<HTMLVideoElement>(); // a pause this script asked for
let io: IntersectionObserver | undefined;

export function autoplay(v: HTMLVideoElement) {
  if (reduceMotion()) { v.loop = false; return; }
  v.addEventListener('pause', () => { if (ours.has(v)) ours.delete(v); else held.add(v); });
  v.addEventListener('play', () => held.delete(v));
  io ??= new IntersectionObserver((entries) => entries.forEach((e) => {
    const el = e.target as HTMLVideoElement;
    if (e.isIntersecting) { if (!held.has(el)) el.play().catch(() => {}); }
    else if (!el.paused) { ours.add(el); el.pause(); }
  }), { threshold: 0.35 });
  io.observe(v);
}
