/**
 * Affiliate Click Tracker — runbikecalc
 *
 * Fires a GA4 `affiliate_click` event on every outbound click to an affiliate
 * destination. Marks the session as engaged (fixes the "user clicked Amazon
 * within 10s, GA4 saw a bounce" measurement gap).
 *
 * In GA4 Admin → Events, mark `affiliate_click` as a Key Event to unlock
 * conversion reports.
 */
(function () {
  "use strict";

  var AFFILIATE_PATTERNS = [
    /(^|\.)amazon\./i,
    /(^|\.)amzn\.to$/i,
    /(^|\.)backcountry\./i,
    /(^|\.)backcountry\.tnu8\.net$/i,
    /(^|\.)rei\.com$/i,
    /(^|\.)wahoofitness\.com$/i,
    /(^|\.)garmin\.com$/i,
    /(^|\.)trainerroad\.com$/i,
    /(^|\.)zwift\.com$/i,
    /(^|\.)runrepeat\.com$/i,
    /(^|\.)runningwarehouse\.com$/i,
    /(^|\.)bikeinn\.com$/i,
    /(^|\.)competitivecyclist\.com$/i,
    /(^|\.)avantlink\./i,
    /(^|\.)impact\.com$/i,
    /(^|\.)rakuten\./i,
    /(^|\.)cj\.com$/i,
    /(^|\.)shareasale\.com$/i,
    /(^|\.)pjatr\.com$/i,
    /(^|\.)pjtra\.com$/i,
    /(^|\.)anrdoezrs\.net$/i,
    /(^|\.)tnu8\.net$/i,
    /(^|\.)stripe\.com$/i,
    /(^|\.)buy\.stripe\.com$/i
  ];

  function matchAffiliate(host) {
    if (!host) return false;
    for (var i = 0; i < AFFILIATE_PATTERNS.length; i++) {
      if (AFFILIATE_PATTERNS[i].test(host)) return true;
    }
    return false;
  }

  function extractAsin(url) {
    var m = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    return m ? m[1] : null;
  }

  function destinationCategory(host) {
    var h = (host || "").toLowerCase();
    if (h.indexOf("amazon") > -1 || h.indexOf("amzn") > -1) return "amazon";
    if (h.indexOf("backcountry") > -1) return "backcountry";
    if (h.indexOf("buy.stripe") > -1 || h.indexOf("stripe") > -1) return "stripe";
    if (h.indexOf("rei") > -1) return "rei";
    if (h.indexOf("rakuten") > -1) return "rakuten";
    if (h.indexOf("avantlink") > -1) return "avantlink";
    return "other";
  }

  function linkText(el) {
    var t = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ");
    return t.slice(0, 80);
  }

  function handleClick(e) {
    var el = e.target;
    while (el && el.tagName !== "A") el = el.parentNode;
    if (!el || !el.href) return;

    var url;
    try { url = new URL(el.href, window.location.origin); }
    catch (err) { return; }

    if (!matchAffiliate(url.hostname)) return;

    var payload = {
      destination_domain: url.hostname,
      destination_category: destinationCategory(url.hostname),
      destination_url: el.href,
      page_path: window.location.pathname,
      link_text: linkText(el),
      asin: extractAsin(el.href) || ""
    };

    if (window.gtag) {
      window.gtag("event", "affiliate_click", payload);
    }
    if (window.dataLayer) {
      window.dataLayer.push({ event: "affiliate_click", ...payload });
    }
  }

  document.addEventListener("click", handleClick, true);
  document.addEventListener("auxclick", function (e) {
    if (e.button === 1) handleClick(e);
  }, true);
})();
