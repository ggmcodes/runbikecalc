/**
 * Speculation Rules API - Prefetch for instant navigation
 * Recommended by Google AdSense for improved page views and ad revenue.
 * Only loads in browsers that support the API (Chrome 121+).
 */
if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
  var s = document.createElement('script');
  s.type = 'speculationrules';
  s.textContent = JSON.stringify({
    prefetch: [{
      where: {
        and: [
          { href_matches: '/*' },
          { not: { href_matches: '/success' } },
          { not: { selector_matches: '[rel=nofollow]' } }
        ]
      },
      eagerness: 'moderate'
    }]
  });
  document.head.appendChild(s);
}
