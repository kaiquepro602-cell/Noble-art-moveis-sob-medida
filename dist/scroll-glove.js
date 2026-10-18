'use strict';
(() => {
  const root = document.getElementById('hero-scroll-indicator');
  if (!root) return;

  const dismissButton = root.querySelector('.scroll-glove-dismiss');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const passive = { passive: true, signal: listeners.signal };
  let dismissed = false;
  let pointerStart = null;
  let touchStart = null;
  const initialScrollY = window.scrollY;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    root.dataset.cueHidden = 'true';
    dismissButton.hidden = true;
    listeners.abort();
  }

  function isVerticalGesture(start, x, y) {
    if (!start) return false;
    const dx = Math.abs(x - start.x);
    const dy = Math.abs(y - start.y);
    return dy >= 8 && dy > dx;
  }

  // A dica é inicial: não reaparece ao voltar ao topo na mesma visita.
  root.dataset.cueReady = 'true';
  if (initialScrollY > 8 || reducedMotion.matches) {
    dismiss();
    return;
  }

  window.addEventListener('scroll', () => {
    if (Math.abs(window.scrollY - initialScrollY) > 0) dismiss();
  }, passive);
  window.addEventListener('wheel', event => {
    if (!event.ctrlKey && Math.abs(event.deltaY) > 0) dismiss();
  }, passive);
  window.addEventListener('pointerdown', event => {
    if (!event.isPrimary) return;
    pointerStart = { x: event.clientX, y: event.clientY };
  }, passive);
  window.addEventListener('pointermove', event => {
    if (event.isPrimary && isVerticalGesture(pointerStart, event.clientX, event.clientY)) dismiss();
  }, passive);
  const clearPointer = () => { pointerStart = null; };
  window.addEventListener('pointerup', clearPointer, passive);
  window.addEventListener('pointercancel', clearPointer, passive);
  window.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : null;
  }, passive);
  window.addEventListener('touchmove', event => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (isVerticalGesture(touchStart, touch.clientX, touch.clientY)) dismiss();
  }, passive);
  const clearTouch = () => { touchStart = null; };
  window.addEventListener('touchend', clearTouch, passive);
  window.addEventListener('touchcancel', clearTouch, passive);
  dismissButton.addEventListener('click', dismiss, { signal: listeners.signal });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) dismiss();
  }, { signal: listeners.signal });
  window.addEventListener('pagehide', dismiss, { signal: listeners.signal });
})();
