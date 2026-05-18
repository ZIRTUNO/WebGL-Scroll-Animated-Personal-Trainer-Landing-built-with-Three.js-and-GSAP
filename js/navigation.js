/* eslint-env browser */

import { smoothScrollTo } from './scroll-sync.js';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ACTIVE_MARKER_RATIO = 0.5;
const ANCHOR_SCROLL_CLASS = 'is-anchor-scrolling';
const ACTIVE_SECTION_EVENT = 'site:active-section';

export function initSectionNavigation() {
  const nav = document.querySelector('.nav');
  const links = [...document.querySelectorAll('.nav ul a[href^="#"]')];
  if (!nav || !links.length) return;

  const targets = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const getOffset = () => nav.getBoundingClientRect().height + 14;
  let anchorScrollTimer = 0;
  let anchorScrollTargetId = '';

  const setActive = (id) => {
    if (!id) return;
    links.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    window.dispatchEvent(new CustomEvent(ACTIVE_SECTION_EVENT, { detail: { id } }));
  };

  const finishAnchorScroll = () => {
    if (!anchorScrollTargetId) return;
    window.clearTimeout(anchorScrollTimer);
    document.body.classList.remove(ANCHOR_SCROLL_CLASS);
    const targetId = anchorScrollTargetId;
    anchorScrollTargetId = '';
    setActive(targetId);
  };

  const scrollToTarget = (target) => {
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getOffset());
    smoothScrollTo(top, { duration: REDUCED_MOTION ? 0 : 1.4 });
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (target.id) {
        anchorScrollTargetId = target.id;
        document.body.classList.add(ANCHOR_SCROLL_CLASS);
        setActive(target.id);
        window.clearTimeout(anchorScrollTimer);
        anchorScrollTimer = window.setTimeout(finishAnchorScroll, REDUCED_MOTION ? 80 : 1250);
      }
      scrollToTarget(target);
      if (target.id) {
        history.replaceState(null, '', href);
      }
    });
  });

  const updateActiveFromScroll = () => {
    if (anchorScrollTargetId) return;
    const marker = window.scrollY + getOffset() + window.innerHeight * ACTIVE_MARKER_RATIO;
    let current = targets[0];

    for (const target of targets) {
      if (target.offsetTop <= marker) current = target;
    }

    if (current?.id) setActive(current.id);
  };

  let ticking = false;
  const requestActiveUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveFromScroll();
      ticking = false;
    });
  };

  updateActiveFromScroll();
  window.addEventListener('scroll', requestActiveUpdate, { passive: true });
  window.addEventListener('resize', requestActiveUpdate);
  window.addEventListener('scrollend', finishAnchorScroll);
}
