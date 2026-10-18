'use strict';
(() => {
  const cue = document.getElementById('hero-scroll-cue');
  if (!cue) return;
  const listeners = new AbortController();
  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    cue.dataset.dismissed = 'true';
    cue.setAttribute('aria-hidden', 'true');
    cue.tabIndex = -1;
    listeners.abort();
  }
  function onScroll() {
    if (window.scrollY > 8) dismiss();
  }
  onScroll();
  if (dismissed) return;
  window.addEventListener('scroll', onScroll, { passive: true, signal: listeners.signal });
  window.addEventListener('pagehide', dismiss, { signal: listeners.signal });
  cue.addEventListener('click', dismiss, { signal: listeners.signal });
})();
