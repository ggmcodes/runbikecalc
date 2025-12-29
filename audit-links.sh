#!/bin/bash
cd /Users/glengomezmeade/Projects/runbikecalc

echo "=== BROKEN INTERNAL LINKS ==="
echo ""

# Extract all internal links
grep -rhoE 'href="/[^"#]*"' *.html blog/*.html 2>/dev/null | sed 's/href="//;s/"$//' | sort -u | while read link; do
  # Remove leading slash
  file="${link#/}"

  # Skip empty (homepage)
  if [ -z "$file" ]; then
    continue
  fi

  # Skip external resources
  if [[ "$file" == css/* ]] || [[ "$file" == js/* ]] || [[ "$file" == images/* ]] || [[ "$file" == favicon* ]] || [[ "$file" == manifest* ]]; then
    continue
  fi

  # Check if file exists (with or without .html)
  if [ -f "$file" ]; then
    continue
  elif [ -f "${file}.html" ]; then
    continue
  elif [ -f "${file}/index.html" ]; then
    continue
  elif [ -d "$file" ]; then
    continue
  else
    echo "BROKEN: $link"
  fi
done

echo ""
echo "=== UNSPLASH IMAGES ==="
echo ""
grep -rhoE 'https://images\.unsplash\.com/[^"'\'']*' *.html blog/*.html 2>/dev/null | sort -u | head -30

echo ""
echo "=== AFFILIATE LINKS ==="
echo ""
grep -rhoE 'href="https://(www\.)?(amazon|amzn|shareasale|awin|cj\.com|commission)[^"]*"' *.html blog/*.html 2>/dev/null | sort -u | head -30
