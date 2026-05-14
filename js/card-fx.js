/* eslint-env browser */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const CARD_SELECTOR = '.svc, .testi, .shot';

const MAX_TILT = 4;
const LIFT = -7;

export function initCardFx() {
  const cards = [...document.querySelectorAll(CARD_SELECTOR)];
  if (!cards.length) return;

  cards.forEach((card) => card.classList.add('fx-card'));
  if (REDUCED_MOTION || !FINE_POINTER) return;

  const gsap = window.gsap;
  cards.forEach((card) => attachCard(card, gsap));
}

function attachCard(card, gsap) {
  const onMove = (event) => {
    const rect = card.getBoundingClientRect();
    const xRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const yRatio = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    const rotateY = (xRatio - 0.5) * MAX_TILT * 2;
    const rotateX = (0.5 - yRatio) * MAX_TILT * 2;

    card.style.setProperty('--fx-x', `${xRatio * 100}%`);
    card.style.setProperty('--fx-y', `${yRatio * 100}%`);
    card.style.setProperty('--fx-opacity', '.82');
    card.classList.add('is-card-active');

    if (gsap) {
      gsap.to(card, {
        y: LIFT,
        rotateX,
        rotateY,
        transformPerspective: 900,
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }
  };

  const onLeave = () => {
    card.style.setProperty('--fx-opacity', '0');
    card.classList.remove('is-card-active');

    if (gsap) {
      gsap.to(card, {
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.65,
        ease: 'elastic.out(1, 0.55)',
        overwrite: 'auto',
      });
    }
  };

  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerleave', onLeave);
  card.addEventListener('blur', onLeave);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
