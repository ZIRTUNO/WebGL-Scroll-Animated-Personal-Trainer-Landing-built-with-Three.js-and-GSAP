/* eslint-env browser */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NATIVE_DIVERGENCE_PX = 4;
const NATIVE_SCROLL_PUMP_MS = 700;

let lenisInstance = null;
let scrollTriggerFrame = 0;
let nativeScrollPumpFrame = 0;
let nativeScrollPumpUntil = 0;

export function initScrollSmoother() {
  if (REDUCED_MOTION) return null;

  const Lenis = window.Lenis;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!Lenis) return null;

  const lenis = new Lenis({
    duration: 2.6,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    autoResize: true,
  });

  if (gsap) {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  if (ScrollTrigger) {
    lenis.on('scroll', () => requestScrollTriggerUpdate(ScrollTrigger));
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  installNativeScrollBridge(lenis, ScrollTrigger);
  installNativeScrollResets(lenis);
  installKeyboardRouter(lenis);
  lenisInstance = lenis;
  return lenis;
}

export function getLenis() {
  return lenisInstance;
}

export function smoothScrollTo(target, options = {}) {
  if (!target && target !== 0) return;
  if (lenisInstance) {
    const defaults = typeof target === 'number'
      ? { duration: 1.4 }
      : { duration: 1.4, offset: -10 };
    lenisInstance.scrollTo(target, { ...defaults, ...options });
    return;
  }

  const behavior = REDUCED_MOTION || options.duration === 0 ? 'auto' : 'smooth';
  if (typeof target === 'number') {
    const top = Number.isFinite(options.offset) ? target + options.offset : target;
    window.scrollTo({ top, behavior });
    return;
  }
  if (typeof target === 'string' || target instanceof Element) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    const rectTop = el.getBoundingClientRect().top + window.scrollY;
    const offset = Number.isFinite(options.offset) ? options.offset : 0;
    window.scrollTo({ top: Math.max(0, rectTop + offset), behavior });
  }
}

function requestScrollTriggerUpdate(ScrollTrigger) {
  if (!ScrollTrigger || scrollTriggerFrame) return;
  scrollTriggerFrame = requestAnimationFrame(() => {
    scrollTriggerFrame = 0;
    ScrollTrigger.update();
  });
}

function installNativeScrollBridge(lenis, ScrollTrigger) {
  window.addEventListener('scroll', () => {
    reconcileNativeScroll(lenis);
    startNativeScrollPump(ScrollTrigger);
    requestScrollTriggerUpdate(ScrollTrigger);
  }, { passive: true });
}

function startNativeScrollPump(ScrollTrigger) {
  if (!ScrollTrigger) return;
  nativeScrollPumpUntil = performance.now() + NATIVE_SCROLL_PUMP_MS;
  if (nativeScrollPumpFrame) return;

  const pump = () => {
    requestScrollTriggerUpdate(ScrollTrigger);
    if (performance.now() < nativeScrollPumpUntil) {
      nativeScrollPumpFrame = requestAnimationFrame(pump);
    } else {
      nativeScrollPumpFrame = 0;
    }
  };

  nativeScrollPumpFrame = requestAnimationFrame(pump);
}

function reconcileNativeScroll(lenis) {
  const nativeY = window.scrollY;
  const animated = Number.isFinite(lenis.animatedScroll) ? lenis.animatedScroll : nativeY;
  if (Math.abs(nativeY - animated) <= NATIVE_DIVERGENCE_PX) return;

  lenis.reset();
  lenis.emit();
}

function installNativeScrollResets(lenis) {
  const reset = () => {
    if (typeof lenis.reset === 'function') lenis.reset();
  };

  window.addEventListener('pointerdown', (event) => {
    if (event.button === 1 || isScrollbarPointer(event)) reset();
  }, { passive: true, capture: true });

  window.addEventListener('mousedown', (event) => {
    if (event.button === 1 || isScrollbarPointer(event)) reset();
  }, { passive: true, capture: true });

  window.addEventListener('touchstart', reset, { passive: true, capture: true });
}

function isScrollbarPointer(event) {
  const doc = document.documentElement;
  return event.clientX >= doc.clientWidth || event.clientY >= doc.clientHeight;
}

function installKeyboardRouter(lenis) {
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && t.matches && t.matches('input, textarea, select, [contenteditable], [contenteditable="true"]')) return;

    const v = window.innerHeight;
    const current = lenis.scroll ?? window.scrollY;
    const max = (document.documentElement.scrollHeight || document.body.scrollHeight) - v;

    let delta = null;
    let absolute = null;

    switch (e.key) {
      case 'ArrowDown': delta = 80; break;
      case 'ArrowUp': delta = -80; break;
      case 'PageDown': delta = v * 0.85; break;
      case 'PageUp': delta = -v * 0.85; break;
      case ' ':
      case 'Spacebar':
        delta = e.shiftKey ? -v * 0.85 : v * 0.85;
        break;
      case 'Home': absolute = 0; break;
      case 'End': absolute = max; break;
      default: return;
    }

    e.preventDefault();
    const target = absolute !== null
      ? Math.max(0, Math.min(max, absolute))
      : Math.max(0, Math.min(max, current + delta));
    lenis.scrollTo(target, { duration: 1.2, force: true });
  });
}
