/* eslint-env browser */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DESKTOP_QUERY = window.matchMedia('(min-width: 1025px)');

export function initNavMenu() {
  const toggle = document.querySelector('.nav-hamburger');
  const overlay = document.querySelector('.nav-overlay');
  if (!toggle || !overlay) return;

  const backdrop = overlay.querySelector('.nav-overlay-bg');
  const items = overlay.querySelectorAll('.nav-overlay-list li');
  const cta = overlay.querySelector('.nav-overlay-cta');
  const links = overlay.querySelectorAll('.nav-overlay-list a');
  const focusables = [...links, cta].filter(Boolean);

  let isOpen = false;
  let lastFocused = null;
  let openTween = null;

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocused = document.activeElement;

    overlay.removeAttribute('hidden');
    overlay.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('nav-open');

    if (REDUCED_MOTION || !window.gsap) {
      items.forEach((li) => { li.style.opacity = '1'; });
      if (cta) cta.style.opacity = '1';
      focusables[0]?.focus({ preventScroll: true });
      return;
    }

    if (openTween) openTween.kill();
    openTween = window.gsap.timeline({
      onComplete: () => focusables[0]?.focus({ preventScroll: true }),
    });
    openTween.fromTo(
      items,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power3.out' },
      0.05,
    );
    if (cta) {
      openTween.fromTo(
        cta,
        { opacity: 0, y: 16, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' },
        '<+0.15',
      );
    }
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    overlay.classList.remove('is-open');
    document.body.classList.remove('nav-open');

    const finishHide = () => {
      overlay.setAttribute('hidden', '');
      items.forEach((li) => { li.style.opacity = '0'; li.style.transform = ''; });
      if (cta) { cta.style.opacity = '0'; cta.style.transform = ''; }
    };

    if (REDUCED_MOTION || !window.gsap) {
      finishHide();
    } else {
      if (openTween) openTween.kill();
      const exit = window.gsap.timeline({ onComplete: finishHide });
      exit.to(items, { opacity: 0, y: 12, duration: 0.25, stagger: 0.025, ease: 'power2.in' });
      if (cta) {
        exit.to(cta, { opacity: 0, y: 8, duration: 0.2, ease: 'power2.in' }, '<');
      }
    }

    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function toggleMenu() { isOpen ? close() : open(); }

  toggle.addEventListener('click', toggleMenu);
  links.forEach((a) => a.addEventListener('click', () => close()));
  if (cta) cta.addEventListener('click', () => close());
  backdrop?.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab' && focusables.length) {
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  DESKTOP_QUERY.addEventListener('change', (e) => { if (e.matches) close(); });
}
