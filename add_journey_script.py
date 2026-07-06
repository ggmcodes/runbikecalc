#!/usr/bin/env python3
"""Insert Mediavine Journey ads script before </head> on all HTML pages."""
from pathlib import Path

ROOT = Path(__file__).parent

JOURNEY_SCRIPT = '<script type="text/javascript" async="async" data-noptimize="1" data-cfasync="false" src="//scripts.scriptwrapper.com/tags/bc575d1f-11b1-403f-a988-30dd4e93bdca.js"></script>'
MARKER = "scriptwrapper.com/tags/bc575d1f-11b1-403f-a988-30dd4e93bdca"

added = 0
skipped = 0
no_head = []

for html_file in ROOT.rglob("*.html"):
    if "node_modules" in str(html_file):
        continue
    content = html_file.read_text(encoding="utf-8")
    if MARKER in content:
        skipped += 1
        continue
    if "</head>" not in content:
        no_head.append(str(html_file.relative_to(ROOT)))
        continue
    content = content.replace(
        "</head>",
        f"  <!-- Mediavine Journey ads -->\n  {JOURNEY_SCRIPT}\n</head>",
        1,
    )
    html_file.write_text(content, encoding="utf-8")
    added += 1

print(f"Added: {added}")
print(f"Skipped (already present): {skipped}")
if no_head:
    print(f"No </head> tag: {len(no_head)} files, e.g. {no_head[:5]}")
