/**
 * Conversion Popup - Purchase-focused exit-intent popup
 * Triggers on mouse-exit (desktop) or 75% scroll depth (mobile/desktop)
 * Shows once per session via sessionStorage
 *
 * Configure via window.POPUP_CONFIG before loading this script:
 * window.POPUP_CONFIG = {
 *   headline: 'Wait — Special Offer!',
 *   product: 'Product Name',
 *   description: 'Short product pitch',
 *   price: '$19',
 *   ctaText: 'Get Instant Access — $19',
 *   ctaUrl: 'https://buy.stripe.com/xxx',
 *   secondaryText: 'No thanks',
 *   accentColor: '#2563eb',
 *   excludePaths: ['/premium', '/success']
 * };
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'conversionPopupShown';
  var SCROLL_THRESHOLD = 0.75;
  var config = window.POPUP_CONFIG || {};

  function isExcludedPath() {
    var path = window.location.pathname;
    var excludes = config.excludePaths || [];
    for (var i = 0; i < excludes.length; i++) {
      if (path.indexOf(excludes[i]) !== -1) return true;
    }
    return false;
  }

  function hasBeenShown() {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  }

  function markAsShown() {
    sessionStorage.setItem(STORAGE_KEY, 'true');
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) {
      for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
      }
    }
    return el;
  }

  function createGiftIcon() {
    var svg = svgEl('svg', { width: '32', height: '32', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    svg.appendChild(svgEl('polyline', { points: '20 12 20 22 4 22 4 12' }));
    svg.appendChild(svgEl('rect', { x: '2', y: '7', width: '20', height: '5' }));
    svg.appendChild(svgEl('line', { x1: '12', y1: '22', x2: '12', y2: '7' }));
    svg.appendChild(svgEl('path', { d: 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z' }));
    svg.appendChild(svgEl('path', { d: 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' }));
    return svg;
  }

  function createLockIcon() {
    var svg = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' });
    svg.appendChild(svgEl('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }));
    svg.appendChild(svgEl('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }));
    return svg;
  }

  function createPopup() {
    var accent = config.accentColor || '#2563eb';

    var overlay = document.createElement('div');
    overlay.className = 'cp-overlay';
    overlay.id = 'cpOverlay';

    var modal = document.createElement('div');
    modal.className = 'cp-modal';
    modal.style.setProperty('--cp-accent', accent);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'cp-close';
    closeBtn.setAttribute('aria-label', 'Close popup');
    closeBtn.textContent = '\u00D7';

    var content = document.createElement('div');
    content.className = 'cp-content';

    var iconDiv = document.createElement('div');
    iconDiv.className = 'cp-icon';
    iconDiv.style.setProperty('--cp-accent', accent);
    iconDiv.appendChild(createGiftIcon());

    var headline = document.createElement('h2');
    headline.className = 'cp-headline';
    headline.textContent = config.headline || 'Wait \u2014 Before You Go!';

    var product = document.createElement('p');
    product.className = 'cp-product';
    product.textContent = config.product || '';

    var desc = document.createElement('p');
    desc.className = 'cp-description';
    desc.textContent = config.description || '';

    var cta = document.createElement('a');
    cta.className = 'cp-cta';
    cta.href = config.ctaUrl || '#';
    cta.textContent = config.ctaText || 'Get Access Now';

    var dismiss;
    if (config.secondaryUrl) {
      dismiss = document.createElement('a');
      dismiss.href = config.secondaryUrl;
      dismiss.className = 'cp-dismiss';
      dismiss.style.textDecoration = 'underline';
    } else {
      dismiss = document.createElement('button');
      dismiss.className = 'cp-dismiss';
      dismiss.type = 'button';
    }
    dismiss.textContent = config.secondaryText || 'No thanks';

    var trust = document.createElement('div');
    trust.className = 'cp-secure';
    trust.textContent = config.trustText || 'No spam. Unsubscribe anytime.';

    content.appendChild(iconDiv);
    content.appendChild(headline);
    if (config.product) content.appendChild(product);
    content.appendChild(desc);
    content.appendChild(cta);
    content.appendChild(dismiss);
    content.appendChild(trust);

    modal.appendChild(closeBtn);
    modal.appendChild(content);
    overlay.appendChild(modal);

    return overlay;
  }

  function showPopup() {
    if (hasBeenShown()) return;
    var overlay = document.getElementById('cpOverlay');
    if (overlay) {
      overlay.classList.add('cp-active');
      markAsShown();
      document.body.style.overflow = 'hidden';
    }
  }

  function hidePopup() {
    var overlay = document.getElementById('cpOverlay');
    if (overlay) {
      overlay.classList.remove('cp-active');
      document.body.style.overflow = '';
    }
  }

  function init() {
    if (hasBeenShown() || isExcludedPath()) return;

    var popup = createPopup();
    document.body.appendChild(popup);

    var overlay = document.getElementById('cpOverlay');
    var closeBtn = overlay.querySelector('.cp-close');
    var dismissBtn = overlay.querySelector('.cp-dismiss');

    closeBtn.addEventListener('click', hidePopup);
    dismissBtn.addEventListener('click', hidePopup);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) hidePopup();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') hidePopup();
    });

    var exitTriggered = false;
    document.addEventListener('mouseout', function(e) {
      if (exitTriggered) return;
      if (e.clientY <= 0) {
        exitTriggered = true;
        showPopup();
      }
    });

    var scrollTriggered = false;
    window.addEventListener('scroll', function() {
      if (scrollTriggered || hasBeenShown()) return;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0 && (scrollTop / scrollHeight) >= SCROLL_THRESHOLD) {
        scrollTriggered = true;
        showPopup();
      }
    });

    // Time-based fallback: show after 20s on page if user hasn't already seen it
    setTimeout(function() {
      if (!hasBeenShown()) {
        showPopup();
      }
    }, 20000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
