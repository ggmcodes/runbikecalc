#!/usr/bin/env python3
"""Add a "Check Backcountry" button beside Amazon product buttons.

Reads data/backcountry-map.json (ASIN -> verified Backcountry product slug,
tracked search fallback, or none) and, for every Amazon product button or gift
card whose ASIN maps to Backcountry, inserts a Backcountry link in front of the
Amazon one (Backcountry primary, Amazon secondary). Amazon links are never
removed and existing Backcountry links are never touched: any Amazon button
that already has a Backcountry link in its card is skipped.

Idempotent: inserted links carry data-bc="auto", so a second run changes
nothing. Usage: python3 scripts/add-backcountry-buttons.py [--dry-run]
"""
import json
import pathlib
import re
import sys
import urllib.parse as up
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parent.parent
MAP = json.load(open(ROOT / 'data' / 'backcountry-map.json'))['asins']
BASE = 'https://backcountry.tnu8.net/c/6910798/1942899/5311'
REL = 'nofollow sponsored noopener noreferrer'
MARK = 'data-bc="auto"'
LABEL = 'Check Backcountry &rarr;'

AMZ = re.compile(r'<a\b(?P<attrs>[^>]*)>(?P<inner>.*?)</a>', re.S)
HREF = re.compile(r'href="(https?://(?:www\.)?amazon\.com/(?:[^"]*?/)?(?:dp|gp/product)/([A-Z0-9]{10})[^"]*)"')
BTN_TEXT = re.compile(r'\b(check|see|view|shop|buy|price|amazon|options|product)\b', re.I)
AUTO_A = re.compile(r'<a\b[^>]*data-bc="auto"[^>]*>.*?</a>', re.S)
GIFT_CSS_ANCHOR = '.gift-card:hover .gift-btn { background: #C67B4E; }'
GIFT_CSS = """
      /* bc-dual-buttons */
      .gift-imglink { display: contents; }
      .gift-card .gift-name a { color: inherit !important; text-decoration: none !important; }
      .gift-btns { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
      .gift-btns .gift-btn { margin-top: 0; }
      .gift-card a.gift-btn { color: #FAF8F5 !important; text-decoration: none !important; }
      .gift-card a.gift-btn:hover { background: #C67B4E; }
      .gift-card a.gift-btn-alt, .gift-card:hover a.gift-btn-alt { background: #fff; color: #1A1A1A !important; box-shadow: inset 0 0 0 1px #1A1A1A; }
      .gift-card a.gift-btn-alt:hover { color: #C67B4E !important; box-shadow: inset 0 0 0 1px #C67B4E; }"""


def bc_url(entry):
    if entry['status'] == 'product':
        target = up.quote('https://www.backcountry.com/' + entry['slug'], safe='')
        sku = f"prodsku={entry['prodsku']}&amp;" if entry.get('prodsku') else ''
        return f'{BASE}?{sku}u={target}&amp;intsrc=CATF_15689'
    if entry['status'] == 'search':
        q = 'https://www.backcountry.com/store/search.jsp?q=' + up.quote_plus(entry['query'])
        return f'{BASE}?u={up.quote(q, safe="")}'
    return None


def attr(attrs, name):
    m = re.search(r'\b' + name + r'="([^"]*)"', attrs)
    return m.group(1) if m else None


def styled_bc(attrs, has_tailwind):
    """Return (style/class attribute string, separator placed before the Amazon link)."""
    cls, sty = attr(attrs, 'class'), attr(attrs, 'style')
    if sty and 'background' in sty:  # inline-styled filled button
        new = re.sub(r'background:[^;"]*;?', 'background:#FACC15;', sty)
        new = re.sub(r'(?<![-\w])color:[^;"]*;?', 'color:#111827;', new)
        return f'style="{new.rstrip().rstrip(";")};margin:0 0.5rem 0.5rem 0;"', ' '
    if cls and re.search(r'(^|\s)bg-', cls):  # Tailwind filled button
        toks = []
        for t in cls.split():
            if re.fullmatch(r'bg-[a-z]+-\d+', t):
                t = 'bg-yellow-400'
            elif re.fullmatch(r'hover:bg-[a-z]+-\d+', t):
                t = 'hover:bg-yellow-500'
            elif re.fullmatch(r'text-(white|[a-z]+-[5-9]00)', t):
                t = 'text-gray-900'
            elif re.fullmatch(r'hover:text-[a-z]+(-\d+)?', t):
                t = 'hover:text-gray-900'
            elif re.fullmatch(r'border-[a-z]+-\d+', t):
                t = 'border-yellow-400'
            toks.append(t)
        toks += ['mr-2', 'mb-2']
        out = f'class="{" ".join(dict.fromkeys(toks))}"'
        if not has_tailwind:
            out += ' style="background:#FACC15;color:#111827;"'
        return out, ' '
    sep = ' <span aria-hidden="true">&middot;</span> '
    if sty:  # inline-styled text link
        if re.search(r'(?<![-\w])color:', sty):
            new = re.sub(r'(?<![-\w])color:[^;"]*;?', 'color:#B45309;', sty)
        else:
            new = sty.rstrip().rstrip(';') + ';color:#B45309;'
        return f'style="{new}"', sep
    if cls:  # class-styled text link
        toks = []
        for t in cls.split():
            if t == 'btn-amazon':
                continue
            if re.fullmatch(r'text-(blue|primary|green|purple|indigo|sky|orange|red|teal|emerald)(-\d+)?', t):
                t = 'text-amber-700'
            elif re.fullmatch(r'hover:text-[a-z]+(-\d+)?', t):
                t = 'hover:text-amber-900'
            toks.append(t)
        return (f'class="{" ".join(toks)}"' if toks else ''), sep
    return '', sep


def in_table_cell(s, pos):
    pre = s[:pos]
    td = pre.rfind('<td')
    return td > pre.rfind('</td>') and td > pre.rfind('</table>')


def card_has_backcountry(s, start, end):
    window = AUTO_A.sub('', s[max(0, start - 1500):end + 800])
    return 'backcountry.tnu8.net' in window


def process(s, stats):
    has_tw = 'cdn.tailwindcss.com' in s
    blocked = [(m.start(), m.end()) for m in re.finditer(r'<script\b.*?</script>|<head\b.*?</head>', s, re.S)]
    edits = []  # (start, end, replacement)
    gift_done = False
    for m in AMZ.finditer(s):
        attrs, inner = m.group('attrs'), m.group('inner')
        h = HREF.search(attrs)
        if not h:
            continue
        if any(a <= m.start() < b for a, b in blocked):
            continue
        href, asin = h.group(1), h.group(2)
        entry = MAP.get(asin)
        cls = attr(attrs, 'class') or ''
        is_gift = re.search(r'(^|\s)gift-card(\s|$)', cls) is not None
        text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', inner)).strip()
        is_btn = (not is_gift and '<img' not in inner and '<span' not in inner
                  and '<div' not in inner and len(text) < 70 and BTN_TEXT.search(text))
        if not (is_gift or is_btn):
            continue
        if in_table_cell(s, m.start()):
            continue
        before = s[max(0, m.start() - 700):m.start()]
        if re.search(r'data-bc="auto"[^>]*>[^<]*</a>\s*(<span aria-hidden="true">&middot;</span>\s*)?$', before):
            continue  # already done (idempotency)
        if card_has_backcountry(s, m.start(), m.end()):
            stats['skipped_card_has_bc'] += 1
            continue
        if not entry:
            stats['skipped_unmapped'][asin] += 1
            continue
        if entry['status'] == 'none':
            stats['skipped_not_sold'][entry['name'] or asin] += 1
            continue
        url = bc_url(entry)
        stats['added_' + entry['status']] += 1
        if is_gift:
            rel = attr(attrs, 'rel') or 'nofollow noopener sponsored'
            amz = f'href="{href}" target="_blank" rel="{rel}"'
            new = re.sub(r'(<img\b[^>]*>)', rf'<a class="gift-imglink" {amz}>\1</a>', inner, count=1)
            new = re.sub(r'<span class="gift-name">(.*?)</span>',
                         lambda g: f'<span class="gift-name"><a {amz}>{g.group(1)}</a></span>', new, count=1, flags=re.S)
            new = re.sub(r'<span class="gift-btn">(.*?)</span>',
                         lambda g: (f'<span class="gift-btns"><a class="gift-btn" href="{url}" target="_blank" '
                                    f'rel="{REL}" {MARK}>{LABEL}</a><a class="gift-btn gift-btn-alt" {amz}>'
                                    f'{g.group(1)}</a></span>'), new, count=1, flags=re.S)
            edits.append((m.start(), m.end(), f'<div class="{cls}">{new}</div>'))
            gift_done = True
        else:
            look, sep = styled_bc(attrs, has_tw)
            bc = f'<a href="{url}" target="_blank" rel="{REL}" {look} {MARK}>{LABEL}</a>'.replace('  ', ' ')
            edits.append((m.start(), m.start(), bc + sep))
        stats['pages'].add(stats['_cur'])
    for a, b, rep in sorted(edits, reverse=True):
        s = s[:a] + rep + s[b:]
    if gift_done and '/* bc-dual-buttons */' not in s and GIFT_CSS_ANCHOR in s:
        s = s.replace(GIFT_CSS_ANCHOR, GIFT_CSS_ANCHOR + GIFT_CSS, 1)
    return s, len(edits)


def main():
    dry = '--dry-run' in sys.argv
    stats = {'added_product': 0, 'added_search': 0, 'skipped_card_has_bc': 0,
             'skipped_not_sold': Counter(), 'skipped_unmapped': Counter(), 'pages': set(), '_cur': ''}
    changed = 0
    for p in sorted(ROOT.rglob('*.html')):
        rel = p.relative_to(ROOT)
        if 'node_modules' in rel.parts or any(x.startswith('.') for x in rel.parts):
            continue
        s = p.read_text()
        stats['_cur'] = str(rel)
        new, n = process(s, stats)
        if n and new != s:
            changed += 1
            if not dry:
                p.write_text(new)
    print(f"files changed: {changed}{' (dry run)' if dry else ''}")
    print(f"backcountry buttons added: product={stats['added_product']} search={stats['added_search']}")
    print(f"skipped (card already has Backcountry): {stats['skipped_card_has_bc']}")
    ns = stats['skipped_not_sold']
    print(f"skipped (not sold at Backcountry): {sum(ns.values())} buttons, {len(ns)} products")
    for name, n in ns.most_common(12):
        print(f'  {n:4d}  {name}')
    um = stats['skipped_unmapped']
    print(f"skipped (ASIN not in data/backcountry-map.json yet): {sum(um.values())} buttons, {len(um)} ASINs")


if __name__ == '__main__':
    main()
