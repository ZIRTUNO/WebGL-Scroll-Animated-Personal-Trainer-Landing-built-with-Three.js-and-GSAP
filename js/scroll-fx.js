/* eslint-env browser */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const REVEAL_SELECTORS = [
  '[data-section]:not(:first-of-type):not(header)',
  '.reveal',
  '.story-card',
  '.step',
  '.sec-head h2',
  '.story-grid h2',
  '.final h2',
  '.eyebrow',
  '.lead',
  '.quote',
  '.svc',
  '.testi',
  '.shot',
  '.metric',
  '.final .lines b',
];

const SPLIT_HEADING_SELECTORS = [
  '.sec-head h2',
  '.story-grid h2',
];

export function initScrollFx() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const Flip = window.Flip;

  if (!gsap || !ScrollTrigger) return;

  if (REDUCED_MOTION) {
    showAllRevealElements(true);
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ...(Flip ? [Flip] : []));
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: 'power3.out', duration: 0.9 });

  primeInitialStates(gsap);

  whenFontsReady(() => {
    SPLIT_HEADING_SELECTORS.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => splitLines(el));
    });

    scheduleSectionReveals(gsap, ScrollTrigger);
    scheduleHeadingLineReveals(gsap, ScrollTrigger);
    scheduleFinalHeading(gsap, ScrollTrigger);
    scheduleBatches(gsap, ScrollTrigger);
    scheduleCountUps(gsap, ScrollTrigger);
    scheduleFinalCtaLines(gsap, ScrollTrigger);

    requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

function primeInitialStates(gsap) {
  gsap.set('[data-section]:not(:first-of-type):not(header)', { autoAlpha: 0, y: 60 });
  gsap.set('.reveal:not(.story-card):not(.step):not(.svc):not(.testi):not(.shot)', { autoAlpha: 0, y: 30 });
  gsap.set('.story-card', { autoAlpha: 0, y: 30, scale: 0.97, filter: 'blur(10px)' });
  gsap.set('.step', { autoAlpha: 0, y: 40 });
  gsap.set('.svc', { autoAlpha: 0, y: 50 });
  gsap.set('.testi', { autoAlpha: 0 });
  gsap.set('.shot', { autoAlpha: 0, scale: 0.94 });
  gsap.set('.metric', { autoAlpha: 0, y: 20 });
  gsap.set('.final .lines b', { scaleY: 0, transformOrigin: 'top center' });
}

function showAllRevealElements(reset) {
  REVEAL_SELECTORS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      if (reset) {
        el.style.transform = 'none';
        el.style.filter = 'none';
      }
    });
  });
}

function splitLines(el) {
  if (!el || el.dataset.linesSplit === '1') return;

  if (el.querySelector('br')) {
    splitExplicitBreaks(el);
    return;
  }

  const originalHTML = el.innerHTML;
  const tokens = [];
  flattenInline(el, tokens);

  el.innerHTML = '';
  const measurementSpans = tokens.map((tok) => {
    if (tok.kind === 'br') return null;
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    if (tok.gradient) span.className = 'grad-text';
    span.textContent = tok.text;
    el.appendChild(span);
    if (tok.trailingSpace) el.appendChild(document.createTextNode(' '));
    return span;
  });

  const lines = [];
  let currentLine = null;
  let currentTop = null;
  let tokenIndex = 0;
  for (const tok of tokens) {
    if (tok.kind === 'br') {
      if (currentLine) lines.push(currentLine);
      currentLine = [];
      currentTop = null;
      continue;
    }
    const span = measurementSpans[tokenIndex];
    tokenIndex++;
    if (!span) continue;
    const top = span.offsetTop;
    if (currentTop === null || top !== currentTop) {
      if (currentLine && currentLine.length) lines.push(currentLine);
      currentLine = [];
      currentTop = top;
    }
    currentLine.push(tok);
  }
  if (currentLine && currentLine.length) lines.push(currentLine);

  if (!lines.length) {
    el.innerHTML = originalHTML;
    return;
  }

  el.innerHTML = '';
  for (const line of lines) {
    const outer = document.createElement('span');
    outer.className = 'line';
    outer.style.display = 'block';
    outer.style.overflow = 'hidden';
    outer.style.paddingBlock = '0.14em 0.18em';
    outer.style.marginBlock = '-0.14em -0.18em';
    const inner = document.createElement('span');
    inner.className = 'line-i';
    inner.style.display = 'inline-block';

    line.forEach((tok, i) => {
      if (tok.gradient) {
        const grad = document.createElement('span');
        grad.className = 'grad-text';
        grad.textContent = tok.text;
        inner.appendChild(grad);
      } else {
        inner.appendChild(document.createTextNode(tok.text));
      }
      if (tok.trailingSpace && i < line.length - 1) {
        inner.appendChild(document.createTextNode(' '));
      }
    });
    outer.appendChild(inner);
    el.appendChild(outer);
  }

  el.dataset.linesSplit = '1';
}

function splitExplicitBreaks(el) {
  const lines = [[]];

  Array.from(el.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'br') {
      lines.push([]);
      return;
    }
    lines[lines.length - 1].push(child.cloneNode(true));
  });

  const meaningfulLines = lines.filter((line) => line.some((node) => (node.textContent || '').trim()));
  if (!meaningfulLines.length) return;

  el.innerHTML = '';
  meaningfulLines.forEach((line) => {
    const outer = document.createElement('span');
    outer.className = 'line';
    outer.style.display = 'block';
    outer.style.overflow = 'hidden';
    outer.style.paddingBlock = '0.14em 0.18em';
    outer.style.marginBlock = '-0.14em -0.18em';

    const inner = document.createElement('span');
    inner.className = 'line-i';
    inner.style.display = 'inline-block';

    line.forEach((node) => inner.appendChild(node));
    outer.appendChild(inner);
    el.appendChild(outer);
  });

  el.dataset.linesSplit = '1';
}

function flattenInline(node, tokens) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const words = (child.textContent || '').split(/(\s+)/);
      let pending = '';
      for (const w of words) {
        if (/^\s+$/.test(w)) {
          if (pending) {
            tokens.push({ kind: 'word', text: pending, trailingSpace: true });
            pending = '';
          }
        } else if (w) {
          pending = w;
        }
      }
      if (pending) tokens.push({ kind: 'word', text: pending, trailingSpace: false });
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'br') {
        tokens.push({ kind: 'br' });
      } else {
        const isGradient = child.classList && child.classList.contains('grad-text');
        const inner = (child.textContent || '').split(/(\s+)/);
        for (let i = 0; i < inner.length; i++) {
          const w = inner[i];
          if (/^\s+$/.test(w) || !w) continue;
          const trailingSpace = /^\s+$/.test(inner[i + 1] || '');
          tokens.push({ kind: 'word', text: w, gradient: isGradient, trailingSpace });
        }
      }
    }
  }
}

function scheduleSectionReveals(gsap, ScrollTrigger) {
  document.querySelectorAll('[data-section]:not(:first-of-type):not(header)')
    .forEach((sec) => {
      gsap.to(sec, {
        autoAlpha: 1,
        y: 0,
        duration: 1.0,
        scrollTrigger: {
          trigger: sec,
          start: 'top 82%',
          toggleClass: { targets: sec, className: 'in' },
          once: true,
        },
      });
    });
}

function scheduleHeadingLineReveals(gsap, ScrollTrigger) {
  SPLIT_HEADING_SELECTORS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((heading) => {
      const lines = heading.querySelectorAll('.line-i');
      if (!lines.length) return;
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, {
        yPercent: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: heading, start: 'top 78%', once: true },
      });
    });
  });
}

function scheduleBatches(gsap, ScrollTrigger) {
  ScrollTrigger.batch('.reveal:not(.story-card):not(.step):not(.svc):not(.testi):not(.shot)', {
    start: 'top 85%',
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }),
    once: true,
  });

  ScrollTrigger.batch('.story-card', {
    start: 'top 80%',
    onEnter: (batch) => gsap.to(batch, {
      autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.12,
    }),
    once: true,
  });

  ScrollTrigger.batch('.step', {
    start: 'top 78%',
    onEnter: (batch) => gsap.to(batch, {
      autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1,
      onComplete: () => batch.forEach((el) => el.classList.add('visible')),
    }),
    once: true,
  });

  ScrollTrigger.batch('.svc', {
    start: 'top 80%',
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.0, stagger: 0.14 }),
    once: true,
  });

  ScrollTrigger.batch('.testi', {
    start: 'top 80%',
    onEnter: (batch) => batch.forEach((el, i) => {
      gsap.set(el, { x: i % 2 === 0 ? -30 : 30 });
      gsap.to(el, { autoAlpha: 1, x: 0, duration: 0.9, delay: i * 0.12 });
    }),
    once: true,
  });

  ScrollTrigger.batch('.shot', {
    start: 'top 78%',
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, scale: 1, duration: 0.9, stagger: 0.12 }),
    once: true,
  });

  ScrollTrigger.batch('.metric', {
    start: 'top 82%',
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 }),
    once: true,
  });
}

function scheduleCountUps(gsap, ScrollTrigger) {
  document.querySelectorAll('[data-count]').forEach((node) => {
    const raw = (node.textContent || '').trim();
    const match = raw.match(/^([^\d-]*)(-?\d+(?:[.,]\d+)?)([^\d]*)$/);
    if (!match) return;
    const [, prefix, numericText, suffix] = match;
    const target = parseFloat(numericText.replace(',', '.'));
    if (!Number.isFinite(target)) return;
    const padTo = numericText.replace(/[^\d]/g, '').length;

    const state = { value: 0 };
    const isHero = node.closest('.hero') !== null;
    let hasRun = false;

    const render = (value) => {
      const padded = String(Math.round(value)).padStart(padTo, '0');
      node.textContent = `${prefix}${padded}${suffix}`;
    };

    const runCount = (delay = 0) => {
      hasRun = true;
      gsap.killTweensOf(state);
      state.value = 0;
      render(0);
      gsap.to(state, {
        value: target,
        duration: 1.6,
        ease: 'power3.out',
        delay,
        onUpdate: () => render(state.value),
      });
    };

    render(0);

    const trigger = ScrollTrigger.create({
      trigger: node,
      start: isHero ? 'top 92%' : 'top 85%',
      end: 'bottom 15%',
      onEnter: () => runCount(isHero ? 0.4 : 0),
      onEnterBack: () => runCount(),
    });

    if (isHero) {
      requestAnimationFrame(() => {
        if (!hasRun && trigger.isActive) runCount(0.4);
      });
    }
  });
}

function scheduleFinalHeading(gsap, ScrollTrigger) {
  const spans = document.querySelectorAll('.final h2 > span');
  if (!spans.length) return;
  gsap.set(spans, { yPercent: 60, autoAlpha: 0 });
  gsap.to(spans, {
    yPercent: 0,
    autoAlpha: 1,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
    scrollTrigger: { trigger: '.final', start: 'top 78%', once: true },
  });
}

function scheduleFinalCtaLines(gsap, ScrollTrigger) {
  const bars = document.querySelectorAll('.final .lines b');
  if (!bars.length) return;
  gsap.to(bars, {
    scaleY: 1,
    duration: 1.2,
    stagger: 0.06,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.final', start: 'top 80%', once: true },
  });
}

function whenFontsReady(cb) {
  if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
    document.fonts.ready.then(cb).catch(() => setTimeout(cb, 100));
  } else {
    setTimeout(cb, 100);
  }
}
