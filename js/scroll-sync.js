/* eslint-env browser */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SCROLL_PUMP_MS = 900;
const INPUT_PUMP_MS = 1800;

let initialized = false;
let scrollTriggerFrame = 0;
let viewportRefreshFrame = 0;
let viewportRefreshTimer = 0;
let forceViewportRefresh = false;
let lastViewportSignature = getViewportSignature();
let scrollPumpFrame = 0;
let scrollPumpUntil = 0;

export function initNativeScrollSync() {
  if (initialized) return null;
  initialized = true;

  clearLegacyLenisState();

  const ScrollTrigger = window.ScrollTrigger;
  requestViewportRefresh(ScrollTrigger, true);

  window.addEventListener('scroll', () => {
    startScrollTriggerPump(ScrollTrigger, SCROLL_PUMP_MS);
    requestScrollTriggerUpdate(ScrollTrigger);
  }, { passive: true });

  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey) {
      requestViewportRefresh(ScrollTrigger);
      return;
    }
    requestScrollTriggerUpdate(ScrollTrigger);
  }, { passive: true, capture: true });

  const startInputPump = (event) => {
    if (event.button === 1 || isScrollbarPointer(event)) {
      startScrollTriggerPump(ScrollTrigger, INPUT_PUMP_MS);
      requestScrollTriggerUpdate(ScrollTrigger);
    }
  };

  window.addEventListener('pointerdown', startInputPump, { passive: true, capture: true });
  window.addEventListener('mousedown', startInputPump, { passive: true, capture: true });
  window.addEventListener('resize', () => requestViewportRefresh(ScrollTrigger), { passive: true });
  window.addEventListener('orientationchange', () => requestViewportRefresh(ScrollTrigger), { passive: true });
  window.visualViewport?.addEventListener('resize', () => requestViewportRefresh(ScrollTrigger), { passive: true });
  window.addEventListener('load', () => requestViewportRefresh(ScrollTrigger, true), { passive: true });
  document.fonts?.ready?.then(() => requestViewportRefresh(ScrollTrigger, true)).catch(() => {});

  return null;
}

export function smoothScrollTo(target, options = {}) {
  if (!target && target !== 0) return;

  const behavior = REDUCED_MOTION || options.duration === 0 ? 'auto' : 'smooth';
  if (typeof target === 'number') {
    const top = Number.isFinite(options.offset) ? target + options.offset : target;
    window.scrollTo({ top: Math.max(0, top), behavior });
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

function requestScrollTriggerUpdate(ScrollTrigger = window.ScrollTrigger) {
  if (!ScrollTrigger || scrollTriggerFrame) return;
  scrollTriggerFrame = requestAnimationFrame(() => {
    scrollTriggerFrame = 0;
    ScrollTrigger.update();
  });
}

function requestViewportRefresh(ScrollTrigger = window.ScrollTrigger, force = false) {
  if (!ScrollTrigger) return;
  forceViewportRefresh = forceViewportRefresh || force;
  requestScrollTriggerUpdate(ScrollTrigger);
  window.clearTimeout(viewportRefreshTimer);
  viewportRefreshTimer = window.setTimeout(() => {
    if (viewportRefreshFrame) return;
    viewportRefreshFrame = requestAnimationFrame(() => {
      viewportRefreshFrame = 0;
      const shouldRefresh = forceViewportRefresh || hasViewportChanged();
      forceViewportRefresh = false;
      if (!shouldRefresh) return;
      lastViewportSignature = getViewportSignature();
      ScrollTrigger.refresh(true);
      requestScrollTriggerUpdate(ScrollTrigger);
    });
  }, 120);
}

function startScrollTriggerPump(ScrollTrigger = window.ScrollTrigger, duration = SCROLL_PUMP_MS) {
  if (!ScrollTrigger) return;
  scrollPumpUntil = performance.now() + duration;
  if (scrollPumpFrame) return;

  const pump = () => {
    requestScrollTriggerUpdate(ScrollTrigger);
    if (performance.now() < scrollPumpUntil) {
      scrollPumpFrame = requestAnimationFrame(pump);
    } else {
      scrollPumpFrame = 0;
    }
  };

  scrollPumpFrame = requestAnimationFrame(pump);
}

function isScrollbarPointer(event) {
  const doc = document.documentElement;
  return event.clientX >= doc.clientWidth || event.clientY >= doc.clientHeight;
}

function getViewportSignature() {
  const visualViewport = window.visualViewport;
  return [
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio || 1,
    visualViewport?.width || 0,
    visualViewport?.height || 0,
    visualViewport?.scale || 1,
  ].join(':');
}

function hasViewportChanged() {
  return getViewportSignature() !== lastViewportSignature;
}

function clearLegacyLenisState() {
  const classes = ['lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling'];
  document.documentElement.classList.remove(...classes);
  document.body.classList.remove(...classes);
}
