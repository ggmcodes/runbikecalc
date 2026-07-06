#!/usr/bin/env python3
"""Remove all Google AdSense code from every HTML page (switch to Mediavine Journey, Jul 2026).
Handles: loader scripts (any pub id / attribute order), <ins> ad-unit blocks, and push() calls.
Reversible via git. Does NOT touch GA4/gtag."""
import re
from pathlib import Path

ROOT = Path(__file__).parent

# 1. AdSense loader script — any client id (real or XXXX placeholder), any attribute order, possibly multi-line
loader_re = re.compile(
    r'[ \t]*<script[^>]*pagead2\.googlesyndication\.com/pagead/js[^>]*>\s*</script>[ \t]*\n?'
)
# 2. Whole <ins> ad-unit block: optional "<!-- AdSense Ad Unit -->" comment + wrapping <div>
#    containing the <ins ...adsbygoogle...></ins> and its push <script>.
ins_block_re = re.compile(
    r'[ \t]*(?:<!--[^>]*AdSense[^>]*-->\s*)?'
    r'<div[^>]*>\s*'
    r'<ins\b[^>]*adsbygoogle[^>]*>\s*</ins>\s*'
    r'<script>\s*\(adsbygoogle = window\.adsbygoogle \|\| \[\]\)\.push\(\{\}\);\s*</script>\s*'
    r'</div>[ \t]*\n?'
)
# 3. Any remaining standalone <ins ...adsbygoogle...></ins>
ins_re = re.compile(r'[ \t]*<ins\b[^>]*adsbygoogle[^>]*>\s*</ins>[ \t]*\n?')
# 4. Any remaining bare push() call
push_re = re.compile(r'^[ \t]*<script>\s*\(adsbygoogle = window\.adsbygoogle \|\| \[\]\)\.push\(\{\}\);\s*</script>[ \t]*\n?', re.MULTILINE)
push_line_re = re.compile(r'^[ \t]*\(adsbygoogle = window\.adsbygoogle \|\| \[\]\)\.push\(\{\}\);[ \t]*\n', re.MULTILINE)
# 5. Leftover "AdSense" HTML comments
comment_re = re.compile(r'^[ \t]*<!--[^>]*AdSense[^>]*-->[ \t]*\n', re.MULTILINE)

changed = 0
for f in ROOT.rglob("*.html"):
    if "node_modules" in str(f):
        continue
    c = f.read_text(encoding="utf-8")
    orig = c
    c = ins_block_re.sub("", c)
    c = loader_re.sub("", c)
    c = ins_re.sub("", c)
    c = push_re.sub("", c)
    c = push_line_re.sub("", c)
    c = comment_re.sub("", c)
    if c != orig:
        f.write_text(c, encoding="utf-8")
        changed += 1

print(f"Files changed: {changed}")
