#!/bin/bash
# Weekly Amazon product data refresh script
# Run via cron: 0 0 * * 0 /path/to/refresh-products.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "======================================"
echo "Amazon Product Refresh - $(date)"
echo "======================================"

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Fetch latest product data
echo ""
echo "Step 1: Fetching product data from Amazon..."
python3 scripts/amazon-products.py

# Update HTML files
echo ""
echo "Step 2: Updating affiliate pages..."
python3 scripts/update-affiliate-pages.py

# Check for changes
if git diff --quiet; then
    echo ""
    echo "No changes to commit."
else
    echo ""
    echo "Step 3: Committing changes..."
    git add -A
    git commit -m "Weekly product data refresh - $(date +%Y-%m-%d)"

    echo ""
    echo "Step 4: Pushing to remote..."
    git push
fi

echo ""
echo "======================================"
echo "Refresh complete!"
echo "======================================"
