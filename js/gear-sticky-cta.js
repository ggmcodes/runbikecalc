/** Gear Sticky CTA — affiliate bar for /blog/best-* pages */
(function () {
  'use strict';
  var SK = 'gsctDismiss', ST = 500, d = document, w = window;

  function ok() { return w.location.pathname.indexOf('/blog/best-') !== -1; }

  function dismissed() {
    try { var t = localStorage.getItem(SK); return t && Date.now() - +t < 864e5; }
    catch (e) { return false; }
  }

  function save() { try { localStorage.setItem(SK, '' + Date.now()); } catch (e) {} }

  function product() {
    var s = d.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < s.length; i++) {
      try {
        var j = JSON.parse(s[i].textContent);
        if (j['@type'] !== 'ItemList' || !j.itemListElement) continue;
        var f, els = j.itemListElement;
        for (var k = 0; k < els.length; k++) {
          if (els[k].position === 1) { f = els[k]; break; }
          if (!f) f = els[k];
        }
        if (f && f.item) {
          var p = f.item, o = p.offers;
          return { name: p.name || '', price: o && o.price ? '$' + o.price : '' };
        }
      } catch (e) {}
    }
    return null;
  }

  function links() {
    var a = d.querySelectorAll('a[href]'), az = '', bc = '';
    for (var i = 0; i < a.length; i++) {
      var h = a[i].href;
      if (!az && h.indexOf('runbikecalc-20') > -1) az = h;
      if (!bc && h.indexOf('backcountry.tnu8.net') > -1) bc = h;
      if (az && bc) break;
    }
    return { a: az, b: bc };
  }

  function css() {
    var s = d.createElement('style');
    s.textContent =
      '#gsct{position:fixed;z-index:9999;opacity:0;transform:translateY(100%);transition:opacity .3s,transform .3s;font-family:system-ui,sans-serif}' +
      '#gsct.v{opacity:1;transform:none}#gsct *{box-sizing:border-box;margin:0;padding:0}' +
      '.gc-a{background:#fb923c;color:#fff}.gc-b{background:#facc15;color:#1f2937}' +
      '.gc-n{display:block;color:#1f2937}.gc-p{color:#059669;font-weight:700}' +
      '.gc-l{font-weight:700;text-decoration:none;text-align:center}' +
      '.gc-x{border:0;background:0;font-size:18px;color:#9ca3af;cursor:pointer;width:24px;height:24px;display:flex;align-items:center;justify-content:center;padding:0}' +
      '@media(max-width:767px){' +
        '#gsct{bottom:0;left:0;right:0;height:64px;background:#fff;box-shadow:0 -4px 12px rgba(0,0,0,.12);display:flex;align-items:center;padding:0 10px;gap:8px}' +
        '.gc-i{flex:1;min-width:0}.gc-n{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '.gc-p{font-size:12px}.gc-g{display:flex;gap:6px;flex-shrink:0}' +
        '.gc-l{display:inline-block;padding:6px 12px;border-radius:6px;font-size:12px;white-space:nowrap}' +
        '.gc-badge,.gc-dl{display:none}}' +
      '@media(min-width:768px){' +
        '#gsct{bottom:20px;right:20px;width:280px;background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.16);padding:16px}' +
        '.gc-i{margin-bottom:12px}.gc-badge{display:inline-block;background:#059669;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-bottom:8px}' +
        '.gc-n{font-size:15px;font-weight:700;margin-bottom:2px}.gc-p{font-size:14px}' +
        '.gc-g{display:flex;flex-direction:column;gap:8px}' +
        '.gc-l{display:block;padding:10px 14px;border-radius:8px;font-size:13px;transition:filter .15s}.gc-l:hover{filter:brightness(1.08)}' +
        '.gc-x{position:absolute;top:8px;right:8px;border-radius:4px;transition:background .15s}.gc-x:hover{background:#f3f4f6;color:#6b7280}' +
        '.gc-ml{display:none}}';
    d.head.appendChild(s);
  }

  function el(tag, cls, txt) {
    var e = d.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  function btn(href, mTxt, dTxt, cls) {
    var a = el('a', 'gc-l ' + cls);
    a.href = href; a.target = '_blank'; a.rel = 'noopener sponsored';
    var m = el('span', 'gc-ml', mTxt);
    var dt = el('span', 'gc-dl', dTxt);
    a.appendChild(m); a.appendChild(dt);
    return a;
  }

  function build(p, l) {
    var wrap = el('div'); wrap.id = 'gsct';
    var info = el('div', 'gc-i');
    info.appendChild(el('span', 'gc-badge', '#1 Pick'));
    info.appendChild(el('span', 'gc-n', p.name));
    if (p.price) info.appendChild(el('span', 'gc-p', p.price));
    wrap.appendChild(info);
    var g = el('div', 'gc-g');
    if (l.a) g.appendChild(btn(l.a, 'Amazon', 'Check Price on Amazon', 'gc-a'));
    if (l.b) g.appendChild(btn(l.b, 'Backcountry', 'Check Price on Backcountry', 'gc-b'));
    wrap.appendChild(g);
    var x = el('button', 'gc-x', '\u00D7');
    x.setAttribute('aria-label', 'Close');
    x.addEventListener('click', function (e) {
      e.preventDefault(); wrap.classList.remove('v'); save();
      setTimeout(function () { wrap.remove(); }, 300);
    });
    wrap.appendChild(x);
    return wrap;
  }

  function init() {
    if (!ok() || dismissed()) return;
    var p = product(); if (!p) return;
    var l = links(); if (!l.a && !l.b) return;
    css();
    var cta = build(p, l);
    d.body.appendChild(cta);
    var vis = false;
    w.addEventListener('scroll', function () {
      var y = w.pageYOffset || d.documentElement.scrollTop;
      if (y > ST && !vis) { vis = true; cta.classList.add('v'); }
      else if (y <= ST && vis) { vis = false; cta.classList.remove('v'); }
    }, { passive: true });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})();
