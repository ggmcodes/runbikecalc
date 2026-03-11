/**
 * Sticky Promotional Banner
 * Fixed top banner, hides on scroll down, shows on scroll up
 * Dismissible with localStorage persistence
 * Auto-adjusts body padding-top to prevent CLS
 *
 * Configure via window.BANNER_CONFIG before loading:
 * window.BANNER_CONFIG = {
 *   message: 'Get the Pro Toolkit',
 *   highlight: '$19',
 *   detail: '13 tools included',
 *   ctaText: 'Shop Now',
 *   ctaUrl: 'https://buy.stripe.com/xxx',
 *   bgColor: '#2563eb',
 *   textColor: '#ffffff',
 *   excludePaths: ['/success']
 * };
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'stickyBannerDismissed';
  var config = window.BANNER_CONFIG || {};

  function isDismissed() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  function isExcludedPath() {
    var path = window.location.pathname;
    var excludes = config.excludePaths || [];
    for (var i = 0; i < excludes.length; i++) {
      if (path.indexOf(excludes[i]) !== -1) return true;
    }
    return false;
  }

  function createBanner() {
    var banner = document.createElement('div');
    banner.className = 'sb-banner';
    banner.id = 'stickyBanner';
    banner.style.setProperty('--sb-bg', config.bgColor || '#2563eb');
    banner.style.setProperty('--sb-text', config.textColor || '#ffffff');

    var inner = document.createElement('div');
    inner.className = 'sb-banner-inner';

    var link = document.createElement('a');
    link.href = config.ctaUrl || '#';

    var msg = document.createElement('span');
    msg.className = 'sb-msg';
    msg.textContent = config.message || '';

    var highlight = document.createElement('span');
    highlight.className = 'sb-highlight';
    highlight.textContent = ' ' + (config.highlight || '');

    link.appendChild(msg);
    link.appendChild(highlight);

    if (config.detail) {
      var detail = document.createElement('span');
      detail.className = 'sb-detail';
      detail.textContent = ' \u2014 ' + config.detail;
      link.appendChild(detail);
    }

    if (config.ctaText) {
      var pill = document.createElement('span');
      pill.className = 'sb-cta-pill';
      pill.textContent = config.ctaText;
      var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrow.setAttribute('width', '14');
      arrow.setAttribute('height', '14');
      arrow.setAttribute('viewBox', '0 0 24 24');
      arrow.setAttribute('fill', 'none');
      arrow.setAttribute('stroke', 'currentColor');
      arrow.setAttribute('stroke-width', '2');
      arrow.setAttribute('stroke-linecap', 'round');
      arrow.setAttribute('stroke-linejoin', 'round');
      var arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrowPath.setAttribute('d', 'M9 5l7 7-7 7');
      arrow.appendChild(arrowPath);
      pill.appendChild(arrow);
      link.appendChild(pill);
    }

    inner.appendChild(link);

    var dismiss = document.createElement('button');
    dismiss.className = 'sb-dismiss';
    dismiss.setAttribute('aria-label', 'Dismiss banner');
    dismiss.textContent = '\u00D7';

    inner.appendChild(dismiss);
    banner.appendChild(inner);

    return banner;
  }

  function adjustBodyPadding(banner) {
    var height = banner.offsetHeight;
    document.body.style.paddingTop = height + 'px';
  }

  function removeBanner() {
    var banner = document.getElementById('stickyBanner');
    if (banner) {
      banner.remove();
      document.body.style.paddingTop = '';
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }

  function init() {
    if (isDismissed() || isExcludedPath()) return;

    var banner = createBanner();
    document.body.insertBefore(banner, document.body.firstChild);

    adjustBodyPadding(banner);

    // Re-adjust on resize
    window.addEventListener('resize', function() {
      var b = document.getElementById('stickyBanner');
      if (b && !b.classList.contains('sb-hidden')) {
        adjustBodyPadding(b);
      }
    });

    // Dismiss button
    var dismissBtn = banner.querySelector('.sb-dismiss');
    dismissBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      removeBanner();
    });

    // Scroll hide/show
    var lastScrollY = window.pageYOffset || 0;
    var scrollThreshold = 100;

    window.addEventListener('scroll', function() {
      var currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      var b = document.getElementById('stickyBanner');
      if (!b) return;

      if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        b.classList.add('sb-hidden');
      } else {
        b.classList.remove('sb-hidden');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
