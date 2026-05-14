import { initFaq } from './faq.js';
import { initScrollRail } from './scroll-rail.js';
import { initScrollFx } from './scroll-fx.js';
import { initMagneticButtons } from './magnetic-buttons.js';
import { initDumbbell3D } from './dumbbell-3d.js';
import { initSectionNavigation } from './navigation.js';
import { initCardFx } from './card-fx.js';
import { initScrollSmoother } from './scroll-smoother.js';
import { initNavMenu } from './nav-menu.js';

const GSAP_TIMEOUT_MS = 2500;

async function awaitGsap(timeoutMs = GSAP_TIMEOUT_MS) {
  if (window.gsap && window.ScrollTrigger && window.Flip) return true;
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = () => {
      if (window.gsap && window.ScrollTrigger && window.Flip) return resolve(true);
      if (performance.now() - start > timeoutMs) return resolve(false);
      requestAnimationFrame(tick);
    };
    tick();
  });
}

async function boot() {
  initSectionNavigation();
  const gsapReady = await awaitGsap();

  if (gsapReady) {
    initScrollSmoother();
    initScrollFx();
    initMagneticButtons();
  }

  initCardFx();
  initFaq();
  initScrollRail();
  initNavMenu();
  initDumbbell3D();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
