/**
 * RunBikeCalc result-moment email capture
 * Reveals the #result-capture block the moment a calculator shows its
 * results, then opens the Endure Weekly Beehiiv magic link with the
 * user's email. Two reveal mechanisms are handled:
 *   1) Containers that start hidden (Tailwind "hidden" class, hidden
 *      attribute, or display:none) and get unhidden when results render.
 *   2) Always-visible containers whose content is injected in place
 *      (innerHTML / textContent updates). For these, a mutation only
 *      counts after the user has interacted with the page, so charts or
 *      defaults rendered on page load do not trigger the block.
 */
(function () {
  'use strict';

  var MAGIC_BASE = 'https://magic.beehiiv.com/v1/89554d0d-f1fb-44f3-9bb0-5a991540103b';

  function isShown(el) {
    if (!el || el.hidden) return false;
    if (el.classList && el.classList.contains('hidden')) return false;
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  }

  function init() {
    var block = document.getElementById('result-capture');
    if (!block) return;
    var source = block.getAttribute('data-source') || (window.location.hostname + ' (result)');
    var watchIds = (block.getAttribute('data-rc-watch') || 'results').split(',');
    var revealed = false;
    var observers = [];
    var armed = false;

    function arm() { armed = true; }
    // Only count injected-content mutations after a real user interaction,
    // so auto-calculations on page load do not reveal the block.
    document.addEventListener('click', arm, true);
    document.addEventListener('input', arm, true);
    document.addEventListener('change', arm, true);

    function reveal() {
      if (revealed) return;
      revealed = true;
      block.hidden = false;
      observers.forEach(function (o) { o.disconnect(); });
    }

    watchIds.forEach(function (id) {
      var target = document.getElementById(id.trim());
      if (!target) return;
      if (!isShown(target)) {
        // Reveal-type container: show the block when the calculator unhides it.
        var mo = new MutationObserver(function () {
          if (isShown(target)) reveal();
        });
        mo.observe(target, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
        observers.push(mo);
      } else {
        // Inject-type container: visible from the start, results are written
        // into it. Any content change after user interaction is the result moment.
        var mo2 = new MutationObserver(function () {
          if (armed) reveal();
        });
        mo2.observe(target, { childList: true, subtree: true, characterData: true });
        observers.push(mo2);
      }
    });

    var form = document.getElementById('rc-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('[name="email"]');
      var email = ((input && input.value) || '').trim();
      if (!email || email.indexOf('@') === -1) {
        if (input) input.focus();
        return;
      }
      var url = MAGIC_BASE + '?email=' + encodeURIComponent(email) +
        '&utm_source=runbikecalc&utm_medium=result_block';
      if (window.gtag) {
        try {
          window.gtag('event', 'email_capture', { method: 'result_block', source: source });
        } catch (err) {}
      }
      window.open(url, '_blank', 'noopener');
      // SECURITY: keep this success block a fully static string. Never
      // interpolate the email or any user input into it (XSS).
      block.innerHTML =
        '<p class="rc-headline">Check the new tab to confirm your spot.</p>' +
        '<p class="rc-sub">One free email each Wednesday with training tips for athletes who go long.</p>';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
