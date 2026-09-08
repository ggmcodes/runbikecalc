#!/usr/bin/env python3
"""Insert (idempotently) the companion-book card for Zone 2 Training for Runners and Cyclists.

Re-runnable: any existing <!-- kdp-book --> ... <!-- /kdp-book --> block is removed first,
then the block is inserted before the first matching anchor for that page.
Source of truth for ASINs/tag: ~/Projects/kdp-books/SITE-BOOKS.json (runbikecalc).
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
TAG = "runbikecalc-20"
BOOK = {
    "title": "Zone 2 Training for Runners and Cyclists",
    "author": "Drew Calloway",
    "kindle": "B0HGNKBHRX",
    "paperback": "B0HGP24KS2",
    "formats": ["kindle", "paperback"],
    "cover": "/images/books/zone-2-training-guide.jpg",
    "desc": ("Find your heart rate zones, build an aerobic base with 8- and 12-week plans, and use pace "
             "and power tables to train easy and race faster. Inside: zone tables by age, max HR, heart rate "
             "reserve (Karvonen) and LTHR, field tests for max HR, LTHR and FTP, four ways to verify Zone 2 "
             "without trusting your watch, and complete base plans for running and for cycling."),
}
START, END = "<!-- kdp-book -->", "<!-- /kdp-book -->"
DISCLOSURE = "As an Amazon Associate we earn from qualifying purchases."
REL = 'target="_blank" rel="sponsored nofollow"'


def link(asin):
    return f"https://www.amazon.com/dp/{asin}?tag={TAG}"


def card(need_disclosure):
    fmts = [f for f in BOOK["formats"] if BOOK.get(f)]
    if not fmts:
        return ""
    primary = link(BOOK["paperback"] if "paperback" in fmts else BOOK[fmts[0]])
    buttons = []
    if "paperback" in fmts:
        buttons.append(f'<a href="{link(BOOK["paperback"])}" {REL} class="inline-block bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded text-sm">Paperback on Amazon</a>')
    if "kindle" in fmts:
        buttons.append(f'<a href="{link(BOOK["kindle"])}" {REL} class="inline-block bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded text-sm">Kindle edition</a>')
    disc = f'\n      <p class="text-xs text-gray-500 mt-3"><em>{DISCLOSURE}</em></p>' if need_disclosure else ""
    return f'''<div class="bg-gray-50 rounded-lg border border-gray-200 p-5 flex items-start gap-5">
    <a href="{primary}" {REL} class="shrink-0 block w-24 md:w-32">
      <img src="{BOOK["cover"]}" alt="{BOOK["title"]} by {BOOK["author"]}, book cover" width="375" height="600" loading="lazy" class="w-full h-auto rounded shadow-sm">
    </a>
    <div class="flex-1 min-w-0">
      <span class="block text-xs font-bold uppercase tracking-wide text-orange-600 mb-1">The companion book</span>
      <a href="{primary}" {REL} class="block text-lg font-bold text-blue-700 hover:text-blue-900 leading-snug">{BOOK["title"]}</a>
      <span class="block text-sm text-gray-600 mt-1">by {BOOK["author"]}</span>
      <p class="text-sm text-gray-700 mt-2">{BOOK["desc"]}</p>
      <div class="flex flex-wrap gap-2 mt-3">
        {" ".join(buttons)}
      </div>{disc}
    </div>
  </div>'''


def block(variant, need_disclosure):
    inner = card(need_disclosure)
    if not inner:
        return ""
    if variant == "strip":  # homepage / plan page: full-width strip like the Top Picks strip
        return f'''{START}
<section class="kdp-book py-12 bg-white border-b border-charcoal/10">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <h3 class="font-display text-2xl font-medium mb-1">The Companion Book</h3>
    <p class="text-sm text-charcoal/60 mb-5">The heart-rate zones, field tests and base plans behind the calculators on this site, in one book.</p>
  {inner}
  </div>
</section>
{END}'''
    return f'''{START}
<section class="kdp-book my-8" aria-label="The companion book">
  {inner}
</section>
{END}'''


RELATED = r'<section[^>]*>\s*\n\s*<h2[^>]*>(?:Related Calculators|Related Tools)'
GENERIC = [RELATED, r'<section class="affiliate-products"', r'</main>', r'<footer']

PAGES = {
    "index.html": ("strip", [r'<!-- Top Picks strip \(affiliate\) -->']),
    "premium-training-plans.html": ("strip", [r'<section class="bg-cream-dark py-16">']),
    "zone-2-calculator.html": ("inline", GENERIC),
    "heart-rate-zone-calculator.html": ("inline", GENERIC),
    "advanced-heart-rate-zones-calculator.html": ("inline", GENERIC),
    "aerobic-anaerobic-calculator.html": ("inline", GENERIC),
    "lactate-threshold-calculator.html": ("inline", GENERIC),
    "lactate-threshold-pace-predictor.html": ("inline", GENERIC),
    "mhr-karvonen-calculator.html": ("inline", GENERIC),
    "target-heart-rate-calculator.html": ("inline", GENERIC),
    "max-heart-rate-calculator.html": ("inline", GENERIC),
    "hrr-calculator.html": ("inline", GENERIC),
    "zone-2-training-plan-generator.html": ("inline", GENERIC),
    "heart-rate-tools.html": ("inline", [r'<!-- Information Section -->'] + GENERIC),
    "heart-rate-training-hub.html": ("inline", [r'<section id="calculators"'] + GENERIC),
    "ultimate-heart-rate-training-guide-2025.html": ("inline", GENERIC),
    "guides/ultimate-zone-2-training.html": ("inline", [r'<!-- Related guides -->'] + GENERIC),
    "reviews/index.html": ("inline", [r'<h2>Before you buy anything</h2>'] + GENERIC),
    "2026-top-picks.html": ("inline", [r'<!-- Summer Essentials 2026 Section -->'] + GENERIC),
}


def strip_existing(html):
    return re.sub(r"[ \t]*" + re.escape(START) + r".*?" + re.escape(END) + r"\n?", "", html, flags=re.S)


def insert_before(html, blk, anchors):
    for pat in anchors:
        m = re.search(pat, html)
        if m:
            pos = html.rfind("\n", 0, m.start()) + 1
            return html[:pos] + blk + "\n" + html[pos:], pat
    return None, None


def main():
    changed = 0
    for rel, (variant, anchors) in PAGES.items():
        p = ROOT / rel
        if not p.exists():
            print(f"SKIP (missing) {rel}"); continue
        orig = p.read_text(encoding="utf-8")
        base = strip_existing(orig)
        need_disc = not re.search(r"amazon associate|affiliate disclosure|affiliate link|earn a commission|may earn|qualifying purchases", base, re.I)
        new, used = insert_before(base, block(variant, need_disc), anchors)
        if new is None:
            print(f"FAIL (no anchor) {rel}"); continue
        if new != orig:
            p.write_text(new, encoding="utf-8"); changed += 1
        print(f"OK {rel:48s} anchor={used[:40]!r}{' +disclosure' if need_disc else ''}")
    print(f"{changed} file(s) written")


if __name__ == "__main__":
    main()
