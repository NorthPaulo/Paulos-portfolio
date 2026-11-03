/* Header scrolled state: adds .is-scrolled past ~30px so navigation keeps
   contrast over page content. Header stays visible; no hide-on-scroll. */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  if (!header) return;

  var THRESHOLD = 30;
  var ticking = false;

  function update() {
    ticking = false;
    header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  update();
})();

/* Header logo mark: the outer shape turns by whole faces of the hexagon (60
   degrees each), always around its own centre. A first engagement (hover or
   keyboard focus) turns two faces; leaving turns one face. Engaging again
   within a few seconds extends the same turn by one more face each time, up
   to three levels. After IDLE_MS without interaction the count resets quietly.
   The running angle is kept here so every move is a continuous turn. Skipped
   entirely when reduced motion is requested. */
(function () {
  'use strict';

  var link = document.querySelector('.brand');
  var outer = document.querySelector('.brand-mark__outer');
  if (!link || !outer) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var FACE = 60;        // one face of the hexagon
  var OUT_TURN = 60;    // leaving: one face
  var MAX_LEVEL = 3;    // first engagement is level 1
  var IDLE_MS = 5000;   // quiet reset after this long without interaction
  var BASE_MS = '400ms';  // every move except the deepest engagement
  var DEEP_MS = '600ms';  // deepest engagement (level 3) turns more slowly

  var angle = 0;
  var level = 0;
  var lastActivity = -Infinity;
  var hovered = false;
  var focused = false;
  var engaged = false;

  function engage() {
    var t = Date.now();
    if (t - lastActivity > IDLE_MS) level = 0;
    level = Math.min(level + 1, MAX_LEVEL);
    lastActivity = t;
    return FACE * (level + 1);   // level 1 = 120 degrees, the original turn
  }

  function sync() {
    var now = hovered || focused;
    if (now === engaged) return;
    engaged = now;
    if (now) {
      angle += engage();
      outer.style.setProperty('--mark-duration', level === MAX_LEVEL ? DEEP_MS : BASE_MS);
    } else {
      // Return after the second engagement turns the contrary way, one face back.
      angle += (level === 2) ? -OUT_TURN : OUT_TURN;
      lastActivity = Date.now();
      outer.style.setProperty('--mark-duration', BASE_MS);
    }
    outer.style.setProperty('--mark-turn', angle + 'deg');
  }

  link.addEventListener('pointerenter', function () { hovered = true; sync(); });
  link.addEventListener('pointerleave', function () { hovered = false; sync(); });
  link.addEventListener('focusin', function () {
    focused = link.matches(':focus-visible');
    sync();
  });
  link.addEventListener('focusout', function () { focused = false; sync(); });
})();
