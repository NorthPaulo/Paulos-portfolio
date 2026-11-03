/* Quiet block reveal: one shared IntersectionObserver, animate once.
   The hero copy is triggered together via .hero-content.is-visible;
   generic .reveal elements trigger individually. Progressive
   enhancement: without JS (or observer support, or reduced motion)
   all content simply stays visible. */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll('.hero-content, .reveal');
  if (!targets.length) return;

  document.documentElement.classList.add('motion-ready');

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        entry.target.classList.add('is-visible');
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  targets.forEach(function (el) { io.observe(el); });
})();
