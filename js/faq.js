/* eslint-env browser */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initFaq() {
  const items = Array.from(document.querySelectorAll('[data-faq-item]'));
  if (!items.length) return;

  const toggles = items.map((item) => item.querySelector('.q-toggle')).filter(Boolean);

  toggles.forEach((toggle, idx) => {
    toggle.addEventListener('click', () => onToggle(items, idx));
    toggle.addEventListener('keydown', (e) => onKeydown(e, toggles, idx, items));
  });
}

function onToggle(items, idx) {
  const target = items[idx];
  const targetToggle = target.querySelector('.q-toggle');
  const targetBody = target.querySelector('.q-body');
  const isOpen = target.classList.contains('open');

  if (isOpen) {
    closeItem(target, targetToggle, targetBody);
    return;
  }

  items.forEach((sibling) => {
    if (sibling === target) return;
    if (!sibling.classList.contains('open')) return;
    closeItem(sibling, sibling.querySelector('.q-toggle'), sibling.querySelector('.q-body'));
  });

  openItem(target, targetToggle, targetBody);
}

function openItem(item, toggle, body) {
  if (!body) return;

  toggle.setAttribute('aria-expanded', 'true');
  body.removeAttribute('hidden');
  item.classList.add('open');

  if (REDUCED_MOTION) return;

  const inner = body.querySelector('.q-body-inner');
  const target = inner ? inner.scrollHeight : body.scrollHeight;
  const gsap = window.gsap;
  if (!gsap) return;

  gsap.fromTo(
    body,
    { height: 0, opacity: 0 },
    {
      height: target,
      opacity: 1,
      duration: 0.45,
      ease: 'power2.out',
      onComplete: () => { body.style.height = ''; },
    },
  );
}

function closeItem(item, toggle, body) {
  if (!body) return;
  toggle.setAttribute('aria-expanded', 'false');
  item.classList.remove('open');

  if (REDUCED_MOTION) {
    body.setAttribute('hidden', '');
    return;
  }

  const gsap = window.gsap;
  if (!gsap) {
    body.setAttribute('hidden', '');
    return;
  }

  const startHeight = body.scrollHeight;
  gsap.fromTo(
    body,
    { height: startHeight, opacity: 1 },
    {
      height: 0,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        body.style.height = '';
        body.setAttribute('hidden', '');
      },
    },
  );
}

function onKeydown(e, toggles, idx, items) {
  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      toggles[(idx + 1) % toggles.length].focus();
      return;
    }
    case 'ArrowUp': {
      e.preventDefault();
      toggles[(idx - 1 + toggles.length) % toggles.length].focus();
      return;
    }
    case 'Home':
      e.preventDefault();
      toggles[0].focus();
      return;
    case 'End':
      e.preventDefault();
      toggles[toggles.length - 1].focus();
      return;
    case 'Enter':
    case ' ':
    case 'Spacebar':
      e.preventDefault();
      onToggle(items, idx);
      return;
    default:
  }
}
