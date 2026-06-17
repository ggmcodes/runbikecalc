/**
 * Affiliate Click Tracker (canonical)
 *
 * Delegated, capture-phase click listener that fires a GA4 `affiliate_click`
 * event for any Amazon affiliate link. Uses transport_type:'beacon' so the
 * event survives the navigation away to Amazon (sendBeacon is not dropped when
 * the page unloads). Reuses the page's existing gtag/GA4 tag; does NOT load a
 * second GA4 tag.
 *
 * In GA4 Admin -> Events, mark `affiliate_click` as a Key Event for conversions.
 */
(function () {
  "use strict";

  function findAffiliateLink(el) {
    while (el && el !== document) {
      if (el.tagName === "A" && el.href &&
          /(^|\/\/|\.)amazon\.|amzn\.to/i.test(el.href)) {
        return el;
      }
      el = el.parentNode;
    }
    return null;
  }

  function extractAsin(url) {
    var m = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    return m ? m[1] : "";
  }

  function fire(a) {
    if (!a || typeof window.gtag !== "function") return;
    var text = (a.getAttribute("data-link-text") || a.textContent || "")
      .trim().replace(/\s+/g, " ").slice(0, 100);
    window.gtag("event", "affiliate_click", {
      transport_type: "beacon",
      link_url: a.href,
      link_domain: "amazon.com",
      affiliate_network: "amazon",
      product_asin: extractAsin(a.href),
      link_text: text,
      page_path: location.pathname
    });
  }

  document.addEventListener("click", function (e) {
    fire(findAffiliateLink(e.target));
  }, true);

  // Middle-click / cmd-click opens in a new tab (auxclick).
  document.addEventListener("auxclick", function (e) {
    if (e.button === 1) fire(findAffiliateLink(e.target));
  }, true);
})();
