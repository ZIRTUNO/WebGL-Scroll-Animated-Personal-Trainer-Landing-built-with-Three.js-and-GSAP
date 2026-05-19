/* eslint-env browser */

const MIN_VISIBLE_MS = 750;
const MAX_WAIT_MS = 6500;
const LIB_POLL_MS = 60;
const LIB_POLL_MAX = 60;

export function initIntro() {
  const intro = document.getElementById('intro');
  if (!intro) {
    document.documentElement.classList.remove('is-intro-active');
    return;
  }

  const bar = intro.querySelector('.intro-cover-bar-fill');
  const startedAt = performance.now();

  let currentProgress = 0;
  const setProgress = (target) => {
    const next = Math.max(currentProgress, Math.min(100, target));
    if (next === currentProgress) return;
    currentProgress = next;
    if (bar) bar.style.width = currentProgress + '%';
  };

  setProgress(12);

  const images = Array.from(document.querySelectorAll('img'));
  const totalImages = Math.max(1, images.length);
  let loadedImages = 0;
  const imageWeight = 55;

  const onImage = () => {
    loadedImages += 1;
    setProgress(15 + (loadedImages / totalImages) * imageWeight);
  };

  images.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      onImage();
    } else {
      img.addEventListener('load', onImage, { once: true });
      img.addEventListener('error', onImage, { once: true });
    }
  });

  if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
    document.fonts.ready.then(() => setProgress(80));
  } else {
    setTimeout(() => setProgress(80), 600);
  }

  let removed = false;
  const finish = () => {
    if (removed) return;
    removed = true;
    setProgress(100);
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      intro.classList.add('is-loaded');
      document.documentElement.classList.remove('is-intro-active');
      const onTransitionEnd = (event) => {
        if (event.target !== intro) return;
        intro.removeEventListener('transitionend', onTransitionEnd);
        intro.parentNode?.removeChild(intro);
      };
      intro.addEventListener('transitionend', onTransitionEnd);
      setTimeout(() => {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
      }, 1400);
    }, wait + 200);
  };

  const waitForLibs = () => {
    let attempts = 0;
    const tick = () => {
      attempts += 1;
      const ready = window.gsap && window.ScrollTrigger;
      if (ready) {
        setProgress(95);
        finish();
        return;
      }
      if (attempts >= LIB_POLL_MAX) {
        finish();
        return;
      }
      setProgress(80 + (attempts / LIB_POLL_MAX) * 15);
      setTimeout(tick, LIB_POLL_MS);
    };
    tick();
  };

  if (document.readyState === 'complete') {
    waitForLibs();
  } else {
    window.addEventListener('load', waitForLibs, { once: true });
  }

  setTimeout(finish, MAX_WAIT_MS);
}
