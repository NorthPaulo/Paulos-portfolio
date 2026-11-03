/* Contact footer: "Start a conversation" opens the form in place. Submitting
   sends it to Formspree in the background, so the visitor stays on the same
   page and sees the result inline. If this script does not run, the form
   still posts to Formspree directly. */
(function () {
  'use strict';

  var toggle = document.getElementById('contact-toggle');
  var panel = document.getElementById('contact-panel');
  if (!toggle || !panel) return;

  var form = panel.querySelector('form');
  var nameField = form.elements.name;
  var submit = form.querySelector('.site-footer__button');
  var status = form.querySelector('.contact-form__status');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 701px)');

  function setStatus(message, state) {
    status.textContent = message;
    if (state) {
      status.setAttribute('data-state', state);
    } else {
      status.removeAttribute('data-state');
    }
  }

  function open() {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = 'Close';
    panel.removeAttribute('inert');
    panel.classList.add('is-open');

    var settled = false;
    function settle() {
      if (settled) return;
      settled = true;
      panel.removeEventListener('transitionend', onEnd);
      // On wide screens the first field is focused. On phones focus is left
      // alone, so the page does not jump while the form is opening.
      if (wide.matches) nameField.focus({ preventScroll: true });
      panel.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
    function onEnd(event) {
      if (event.target === panel && event.propertyName === 'grid-template-rows') settle();
    }
    panel.addEventListener('transitionend', onEnd);
    window.setTimeout(settle, 400); // covers reduced motion, where no transition runs
  }

  function close() {
    // Keep focus from being left inside the inert region.
    if (panel.contains(document.activeElement)) toggle.focus();
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Start a conversation';
    panel.classList.remove('is-open');
    panel.setAttribute('inert', '');
  }

  toggle.addEventListener('click', function () {
    if (toggle.getAttribute('aria-expanded') === 'true') {
      close();
    } else {
      open();
    }
  });

  form.addEventListener('submit', function (event) {
    if (!window.fetch || !window.FormData) return; // native POST fallback
    event.preventDefault();
    if (!form.reportValidity()) return;

    submit.disabled = true;
    setStatus('', null);
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Formspree responded ' + response.status);
        form.reset();
        setStatus('Thanks. I\u2019ll get back to you soon.', 'success');
      })
      .catch(function () {
        setStatus('Something went wrong. Please try again.', 'error');
      })
      .then(function () {
        submit.disabled = false;
      });
  });
})();
