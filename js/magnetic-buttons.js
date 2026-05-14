/* eslint-env browser */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const MAX_PULL = 12;
const PULL_FACTOR = 0.25;
const ARROW_FACTOR = 0.5;

export function initMagneticButtons() {
  const gsap = window.gsap;
  if (!gsap || REDUCED_MOTION || !FINE_POINTER) return;

  document.querySelectorAll('.btn-primary').forEach((btn) => attach(btn, gsap));
}

function attach(btn, gsap) {
  const arrow = btn.querySelector('.arrow');

  const onMove = (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const x = clamp(dx * PULL_FACTOR, -MAX_PULL, MAX_PULL);
    const y = clamp(dy * PULL_FACTOR, -MAX_PULL, MAX_PULL);

    gsap.to(btn, { x, y, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
    if (arrow) {
      gsap.to(arrow, {
        x: x * ARROW_FACTOR,
        y: y * ARROW_FACTOR,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }
  };

  const onLeave = () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
    if (arrow) {
      gsap.to(arrow, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
    }
  };

  btn.addEventListener('pointermove', onMove);
  btn.addEventListener('pointerleave', onLeave);
  btn.addEventListener('blur', onLeave);
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
