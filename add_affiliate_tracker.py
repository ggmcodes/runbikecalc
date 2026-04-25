#!/usr/bin/env python3
"""Inject /js/affiliate-click-tracker.js into every HTML page. Idempotent."""

from pathlib import Path

ROOT = Path(__file__).parent
TAG = '<script src="/js/affiliate-click-tracker.js" defer></script>'
MARKER = "affiliate-click-tracker.js"


def main() -> int:
    files = list(ROOT.rglob("*.html"))
    touched = 0
    for path in files:
        if "node_modules" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        if MARKER in text:
            continue
        if "</body>" not in text:
            continue
        new = text.replace("</body>", TAG + "\n</body>", 1)
        path.write_text(new, encoding="utf-8")
        touched += 1
    print(f"Updated {touched}/{len(files)} HTML files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
