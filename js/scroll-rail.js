const ACTIVE_MARKER_RATIO = 0.5;
const ACTIVE_SECTION_EVENT = 'site:active-section';

export function initScrollRail() {
  const rail = document.querySelector('.scroll-rail');
  const navLinks = [...document.querySelectorAll('.nav ul a[href^="#"]')];
  const sections = navLinks
    .map((link) => ({
      id: link.getAttribute('href').slice(1),
      node: document.querySelector(link.getAttribute('href')),
    }))
    .filter((section) => section.id && section.node);
  if (!sections.length || !rail) return;

  let dots = [...rail.querySelectorAll('.dot')];
  if (dots.length !== sections.length) {
    dots.forEach((dot) => dot.remove());
    dots = sections.map((_, index) => {
      const dot = document.createElement('span');
      dot.className = `dot${index === 0 ? ' active' : ''}`;
      dot.dataset.i = String(index);
      rail.appendChild(dot);
      return dot;
    });
  }
  if (!dots.length) return;

  const setActive = (id) => {
    const index = sections.findIndex((section) => section.id === id);
    if (index < 0) return;
    dots.forEach((dot) => dot.classList.remove('active'));
    dots[index]?.classList.add('active');
  };

  const updateActiveFromScroll = () => {
    const marker = window.scrollY + window.innerHeight * ACTIVE_MARKER_RATIO;
    let current = sections[0];

    for (const section of sections) {
      if (section.node.offsetTop <= marker) current = section;
    }

    setActive(current.id);
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
  window.addEventListener(ACTIVE_SECTION_EVENT, (event) => setActive(event.detail?.id));
}
