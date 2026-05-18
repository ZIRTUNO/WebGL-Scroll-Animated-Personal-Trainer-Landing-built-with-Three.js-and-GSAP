/* eslint-env browser */

let initialized = false;

export function initFocusModality() {
  if (initialized) return;
  initialized = true;

  const root = document.documentElement;
  const clearKeyboardModality = () => {
    root.classList.remove('is-keyboard-modality');
  };

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      root.classList.add('is-keyboard-modality');
    }
  }, { capture: true });

  window.addEventListener('pointerdown', clearKeyboardModality, { capture: true, passive: true });
  window.addEventListener('mousedown', clearKeyboardModality, { capture: true, passive: true });
  window.addEventListener('touchstart', clearKeyboardModality, { capture: true, passive: true });
}
