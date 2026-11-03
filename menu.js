/* Site menu: one full-screen panel opened by the Menu control.
   Escape closes it, focus stays inside it while it is open, and the page
   behind it is made inert and does not scroll. */
(function () {
  'use strict';

  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('site-menu');
  if (!toggle || !panel) return;

  var label = toggle.querySelector('.menu-toggle__label');
  var behind = [document.querySelector('main'), document.querySelector('footer')].filter(Boolean);
  var isOpen = false;

  function setBehindInert(inert) {
    behind.forEach(function (el) {
      if (inert) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  function open() {
    isOpen = true;
    toggle.setAttribute('aria-expanded', 'true');
    label.textContent = 'Close';
    document.documentElement.classList.add('menu-open');
    panel.removeAttribute('inert');
    panel.classList.add('is-open');
    setBehindInert(true);
    /* Focus the panel itself rather than the first link. Focusing a link
       gave it the focus ring and made it look like the current page. */
    panel.setAttribute('tabindex', '-1');
    panel.focus();
  }

  function close(returnFocus) {
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    label.textContent = 'Menu';
    document.documentElement.classList.remove('menu-open');
    panel.classList.remove('is-open');
    panel.setAttribute('inert', '');
    setBehindInert(false);
    if (returnFocus !== false) toggle.focus();
  }

  toggle.addEventListener('click', function () {
    if (isOpen) close();
    else open();
  });

  document.addEventListener('keydown', function (event) {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'Tab') {
      // Focus cycles through the panel links and the Close control only.
      var links = Array.prototype.slice.call(panel.querySelectorAll('a[href]'));
      var cycle = links.concat([toggle]);
      var first = cycle[0];
      var last = cycle[cycle.length - 1];
      if (event.shiftKey && document.activeElement === panel) {
        // Shift+Tab straight off the panel wraps to the end of the cycle.
        event.preventDefault();
        last.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // A link to a section of this same page should close the menu as well.
  panel.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (link && link.hash && link.pathname === window.location.pathname) close(false);
  });
})();
