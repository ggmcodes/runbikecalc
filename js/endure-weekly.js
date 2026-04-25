/**
 * Endure Weekly — newsletter signup for runbikecalc
 * Three placements:
 *   1) Footer block — auto-injected on every page that has <footer>
 *   2) Sticky bottom bar — appears after 8s, dismissable for 14 days
 *   3) Inline CTA — auto-renders any <div data-endure-weekly></div> placeholder
 * Form posts to Beehiiv magic-link endpoint.
 */
(function () {
  "use strict";

  var MAGIC_BASE = "https://magic.beehiiv.com/v1/89554d0d-f1fb-44f3-9bb0-5a991540103b";
  var DISMISS_KEY = "endureWeeklyStickyDismissed";
  var DISMISS_DAYS = 14;

  function isDismissed() {
    try {
      var v = localStorage.getItem(DISMISS_KEY);
      if (!v) return false;
      var until = parseInt(v, 10);
      if (isNaN(until)) return false;
      if (Date.now() > until) { localStorage.removeItem(DISMISS_KEY); return false; }
      return true;
    } catch (e) { return false; }
  }

  function markDismissed() {
    try {
      var until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_KEY, String(until));
    } catch (e) {}
  }

  function submitHandler(input, ctx) {
    return function (e) {
      e.preventDefault();
      var email = (input.value || "").trim();
      if (!email || email.indexOf("@") === -1) {
        input.focus();
        input.style.borderColor = "#dc2626";
        return;
      }
      var url = MAGIC_BASE + "?email=" + encodeURIComponent(email);
      if (window.gtag) {
        try {
          window.gtag("event", "newsletter_signup", {
            placement: ctx,
            newsletter: "endure_weekly",
            email_domain: email.split("@")[1] || ""
          });
        } catch (e) {}
      }
      window.open(url, "_blank", "noopener");
      input.value = "";
      input.blur();
      if (ctx === "sticky") dismissSticky();
      var btn = input.parentNode.querySelector('button[type="submit"]');
      if (btn) {
        var original = btn.textContent;
        btn.textContent = "Thanks!";
        btn.disabled = true;
        setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 2500);
      }
    };
  }

  function makeInput(placeholder) {
    var input = document.createElement("input");
    input.type = "email";
    input.name = "email";
    input.required = true;
    input.autocomplete = "email";
    input.placeholder = placeholder;
    return input;
  }

  // ---- Footer block injection ----
  function buildFooterBlock() {
    var wrap = document.createElement("section");
    wrap.className = "ew-footer";
    wrap.setAttribute("aria-label", "Subscribe to Endure Weekly newsletter");

    var eyebrow = document.createElement("div");
    eyebrow.className = "ew-eyebrow";
    eyebrow.textContent = "The Newsletter";

    var h = document.createElement("h3");
    h.className = "ew-headline";
    h.textContent = "Endure Weekly";

    var tag = document.createElement("p");
    tag.className = "ew-tagline";
    tag.textContent = "Train. Race. Endure.";

    var sub = document.createElement("p");
    sub.className = "ew-sub";
    sub.textContent = "One weekly email for runners, cyclists, triathletes, and Hyrox athletes. Gear drops, training intel, race calendar. Free.";

    var form = document.createElement("form");
    form.setAttribute("novalidate", "");
    var input = makeInput("your@email.com");
    var submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Subscribe";
    form.appendChild(input);
    form.appendChild(submit);
    form.addEventListener("submit", submitHandler(input, "footer"));

    var trust = document.createElement("p");
    trust.className = "ew-trust";
    trust.textContent = "No spam. Unsubscribe in one click.";

    wrap.appendChild(eyebrow);
    wrap.appendChild(h);
    wrap.appendChild(tag);
    wrap.appendChild(sub);
    wrap.appendChild(form);
    wrap.appendChild(trust);
    return wrap;
  }

  function injectFooterBlock() {
    var footer = document.querySelector("footer");
    if (!footer) return;
    if (document.querySelector(".ew-footer")) return;
    var block = buildFooterBlock();
    // Inject the newsletter block IMMEDIATELY BEFORE the footer
    // (sits above the dark footer, below page content)
    footer.parentNode.insertBefore(block, footer);
  }

  // ---- Sticky bottom bar ----
  var stickyEl = null;
  function dismissSticky() {
    markDismissed();
    if (stickyEl && stickyEl.parentNode) stickyEl.parentNode.removeChild(stickyEl);
    stickyEl = null;
  }

  function buildSticky() {
    var bar = document.createElement("div");
    bar.className = "ew-sticky";
    bar.setAttribute("role", "complementary");
    bar.setAttribute("aria-label", "Endure Weekly newsletter signup");

    var icon = document.createElement("span");
    icon.className = "ew-icon";
    icon.textContent = "→";

    var copy = document.createElement("div");
    copy.className = "ew-copy";
    var strong = document.createElement("strong");
    strong.textContent = "Endure Weekly";
    var span = document.createElement("span");
    span.textContent = "Weekly intel for runners, cyclists, triathletes, Hyrox athletes. Free.";
    copy.appendChild(strong);
    copy.appendChild(span);

    var form = document.createElement("form");
    form.setAttribute("novalidate", "");
    var input = makeInput("your@email.com");
    var submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Subscribe";
    form.appendChild(input);
    form.appendChild(submit);
    form.addEventListener("submit", submitHandler(input, "sticky"));

    var close = document.createElement("button");
    close.className = "ew-close";
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss newsletter signup");
    close.textContent = "×";
    close.addEventListener("click", dismissSticky);

    bar.appendChild(icon);
    bar.appendChild(copy);
    bar.appendChild(form);
    bar.appendChild(close);
    return bar;
  }

  function injectSticky() {
    if (isDismissed()) return;
    if (document.querySelector(".ew-sticky")) return;
    setTimeout(function () {
      stickyEl = buildSticky();
      document.body.appendChild(stickyEl);
    }, 8000);
  }

  // ---- Inline CTA — renders into any <div data-endure-weekly></div> ----
  function buildInline(opts) {
    opts = opts || {};
    var wrap = document.createElement("section");
    wrap.className = "ew-inline";
    wrap.setAttribute("aria-label", "Endure Weekly inline signup");

    var eyebrow = document.createElement("span");
    eyebrow.className = "ew-eyebrow";
    eyebrow.textContent = opts.eyebrow || "Endure Weekly";

    var h = document.createElement("h3");
    h.className = "ew-headline";
    h.textContent = opts.headline || "Get the weekly endurance brief.";

    var sub = document.createElement("p");
    sub.className = "ew-sub";
    sub.textContent = opts.sub || "One email per week — gear, training, races. Free for runners, cyclists, triathletes, and Hyrox athletes.";

    var form = document.createElement("form");
    form.setAttribute("novalidate", "");
    var input = makeInput("your@email.com");
    var submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = opts.button || "Subscribe";
    form.appendChild(input);
    form.appendChild(submit);
    form.addEventListener("submit", submitHandler(input, opts.placement || "inline"));

    wrap.appendChild(eyebrow);
    wrap.appendChild(h);
    wrap.appendChild(sub);
    wrap.appendChild(form);
    return wrap;
  }

  function injectInline() {
    var slots = document.querySelectorAll("[data-endure-weekly]");
    Array.prototype.forEach.call(slots, function (slot) {
      if (slot.dataset.ewRendered) return;
      slot.dataset.ewRendered = "1";
      var opts = {
        eyebrow: slot.dataset.eyebrow,
        headline: slot.dataset.headline,
        sub: slot.dataset.sub,
        button: slot.dataset.button,
        placement: slot.dataset.placement || "inline"
      };
      slot.appendChild(buildInline(opts));
    });
  }

  function init() {
    injectFooterBlock();
    injectSticky();
    injectInline();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
