/**
 * Inline Contextual CTA
 * Injects a styled CTA card after calculator results
 *
 * Configure via window.INLINE_CTA_CONFIG before loading:
 * window.INLINE_CTA_CONFIG = {
 *   badge: 'Premium',
 *   headline: 'Take Your Results Further',
 *   body: 'Get the complete toolkit...',
 *   ctaText: 'Get It Now — $19',
 *   ctaUrl: 'https://buy.stripe.com/xxx',
 *   secondaryText: 'Learn more',
 *   secondaryUrl: '/premium/',
 *   accentColor: '#2563eb',
 *   bgFrom: '#eff6ff',
 *   bgTo: '#f0f9ff',
 *   borderColor: '#bfdbfe',
 *   targetSelector: null,
 *   excludePaths: ['/premium', '/success']
 * };
 */
(function() {
  'use strict';

  var config = window.INLINE_CTA_CONFIG || {};

  function isExcludedPath() {
    var path = window.location.pathname;
    var excludes = config.excludePaths || [];
    for (var i = 0; i < excludes.length; i++) {
      if (path.indexOf(excludes[i]) !== -1) return true;
    }
    return false;
  }

  function createCTA() {
    var accent = config.accentColor || '#2563eb';

    var card = document.createElement('div');
    card.className = 'icta-card';
    card.style.setProperty('--icta-accent', accent);
    if (config.bgFrom) card.style.setProperty('--icta-bg-from', config.bgFrom);
    if (config.bgTo) card.style.setProperty('--icta-bg-to', config.bgTo);
    if (config.borderColor) card.style.setProperty('--icta-border', config.borderColor);

    if (config.badge) {
      var badge = document.createElement('span');
      badge.className = 'icta-badge';
      badge.textContent = config.badge;
      card.appendChild(badge);
    }

    var headline = document.createElement('h3');
    headline.className = 'icta-headline';
    headline.textContent = config.headline || '';
    card.appendChild(headline);

    var body = document.createElement('p');
    body.className = 'icta-body';
    body.textContent = config.body || '';
    card.appendChild(body);

    var btn = document.createElement('a');
    btn.className = 'icta-btn';
    btn.href = config.ctaUrl || '#';
    btn.textContent = config.ctaText || 'Get Access';
    card.appendChild(btn);

    if (config.secondaryText && config.secondaryUrl) {
      var sec = document.createElement('div');
      sec.className = 'icta-secondary';
      var secLink = document.createElement('a');
      secLink.href = config.secondaryUrl;
      secLink.textContent = config.secondaryText;
      sec.appendChild(secLink);
      card.appendChild(sec);
    }

    return card;
  }

  function init() {
    if (isExcludedPath()) return;

    var cta = createCTA();

    // Try to find a target element to insert after
    if (config.targetSelector) {
      var targets = document.querySelectorAll(config.targetSelector);
      if (targets.length > 0) {
        // Insert after the last matching target
        var target = targets[targets.length - 1];
        target.parentNode.insertBefore(cta, target.nextSibling);
        return;
      }
    }

    // Fallback: look for common result containers
    var selectors = [
      '#results', '.results', '[data-results]',
      '#calculator-results', '.calculator-results',
      '#output', '.output', '.result-section',
      '.calculator-output', '#calculatorOutput'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        el.parentNode.insertBefore(cta, el.nextSibling);
        return;
      }
    }

    // Last fallback: append to main content area
    var main = document.querySelector('main') || document.querySelector('.main-content') || document.querySelector('#content');
    if (main) {
      main.appendChild(cta);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
