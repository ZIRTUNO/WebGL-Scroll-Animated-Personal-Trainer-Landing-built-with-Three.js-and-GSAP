/* eslint-env browser */

let initialized = false;

export function initFocusModality() {
  if (initialized) return;
  initialized = true;

  const root = document.documentElement;
  const clearKeyboardModality = () => {
    root.classList.remove('is-keyboard-modality');
  };
  const isKeyboardModality = () => root.classList.contains('is-keyboard-modality');

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      root.classList.add('is-keyboard-modality');
    }
  }, { capture: true });

  window.addEventListener('focusin', (event) => {
    const target = event.target;
    if (isKeyboardModality() || !(target instanceof HTMLElement)) return;
    if (target.classList.contains('skip-link')) target.blur();
  }, { capture: true });

  window.addEventListener('pointerdown', clearKeyboardModality, { capture: true, passive: true });
  window.addEventListener('mousedown', clearKeyboardModality, { capture: true, passive: true });
  window.addEventListener('touchstart', clearKeyboardModality, { capture: true, passive: true });
  window.addEventListener('scroll', clearKeyboardModality, { capture: true, passive: true });
}
