#!/usr/bin/env python3
"""
Add Amazon Product Images to Blog Posts

This script updates blog posts to include product images from Amazon CDN.
It replaces plain text Amazon buttons with rich product cards that include images.

Usage:
    python scripts/add-product-images.py [--dry-run] [--file path/to/file.html]

Options:
    --dry-run    Show changes without modifying files
    --file       Process a specific file instead of all blog posts
"""

import os
import re
import json
import argparse
from pathlib import Path


# Product slug mappings (product name -> slug in product-images.json)
PRODUCT_SLUGS = {
    # Running Watches
    'garmin forerunner 265': 'garmin-forerunner-265',
    'garmin forerunner 965': 'garmin-forerunner-965',
    'coros pace 3': 'coros-pace-3',
    'polar vantage v3': 'polar-vantage-v3',
    'apple watch ultra 2': 'apple-watch-ultra-2',
    'garmin forerunner 55': 'garmin-forerunner-55',

    # Heart Rate Monitors
    'polar h10': 'polar-h10',
    'garmin hrm-pro plus': 'garmin-hrm-pro-plus',
    'garmin hrm pro plus': 'garmin-hrm-pro-plus',
    'wahoo tickr': 'wahoo-tickr',
    'polar verity sense': 'polar-verity-sense',

    # Bike Computers
    'garmin edge 1050': 'garmin-edge-1050',
    'garmin edge 840': 'garmin-edge-840',
    'garmin edge 540': 'garmin-edge-540',
    'wahoo elemnt roam v2': 'wahoo-elemnt-roam-v2',
    'wahoo elemnt roam': 'wahoo-elemnt-roam-v2',
    'wahoo elemnt bolt v2': 'wahoo-elemnt-bolt-v2',
    'wahoo elemnt bolt': 'wahoo-elemnt-bolt-v2',
    'hammerhead karoo 3': 'hammerhead-karoo-3',

    # Smart Trainers
    'wahoo kickr core': 'wahoo-kickr-core',
    'wahoo kickr v6': 'wahoo-kickr-v6',

    # Recovery
    'theragun elite': 'theragun-elite',
    'therabody theragun elite': 'theragun-elite',
    'triggerpoint grid': 'triggerpoint-grid',
    'triggerpoint grid foam roller': 'triggerpoint-grid',

    # Fitness Trackers
    'garmin vivosmart 5': 'garmin-vivosmart-5',
    'fitbit charge 6': 'fitbit-charge-6',
    'whoop 4.0': 'whoop-4',
    'whoop 4': 'whoop-4',
    'oura ring gen 3': 'oura-ring-gen3',

    # Headphones
    'shokz openrun pro': 'shokz-openrun-pro',

    # Yoga
    'manduka pro': 'manduka-pro-mat',
    'manduka pro yoga mat': 'manduka-pro-mat',

    # Nutrition
    'gu energy gel': 'gu-energy-gels',
    'gu energy gels': 'gu-energy-gels',
}


def load_product_data():
    """Load product image data from JSON file."""
    data_file = Path(__file__).parent.parent / 'data' / 'product-images.json'
    if data_file.exists():
        with open(data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'products': {}}


def find_product_slug(product_name):
    """Find the product slug for a given product name."""
    name_lower = product_name.lower().strip()

    # Direct match
    if name_lower in PRODUCT_SLUGS:
        return PRODUCT_SLUGS[name_lower]

    # Partial match
    for key, slug in PRODUCT_SLUGS.items():
        if key in name_lower or name_lower in key:
            return slug

    return None


def create_product_card_html(product, show_image=True):
    """Generate HTML for a product card with image."""
    image_html = ''
    if show_image and product.get('image'):
        image_html = f'''
                <a href="{product['url']}" target="_blank" rel="noopener sponsored" class="amazon-product-image-link">
                    <img src="{product['image']}" alt="{product['name']}" class="amazon-product-image" loading="lazy" width="140" height="140">
                </a>'''

    price_html = ''
    if product.get('price'):
        price_html = f'<p class="amazon-product-price">{product["price"]}</p>'

    return f'''<div class="amazon-product-card">{image_html}
                <div class="amazon-product-content">
                    <h4 class="amazon-product-title">
                        <a href="{product['url']}" target="_blank" rel="noopener sponsored">{product['name']}</a>
                    </h4>
                    {price_html}
                    <a href="{product['url']}" target="_blank" rel="noopener sponsored" class="amazon-product-button">Check Price on Amazon</a>
                </div>
            </div>'''


def update_amazon_links(html_content, product_data, dry_run=False):
    """
    Update Amazon links in HTML to include product images.
    Returns (updated_content, changes_made)
    """
    changes = []

    # Pattern for Amazon "Check Price" buttons
    button_pattern = re.compile(
        r'<a\s+href="(https://www\.amazon\.com/[^"]+tag=runbikecalc-20[^"]*)"\s+'
        r'target="_blank"\s+rel="[^"]*sponsored[^"]*"\s+'
        r'class="[^"]*(?:bg-yellow-400|btn-amazon|amazon-product-button)[^"]*"[^>]*>'
        r'([^<]*(?:Check Price|View) on Amazon[^<]*)</a>',
        re.IGNORECASE | re.DOTALL
    )

    # Find product names near Amazon links
    def get_product_context(content, match_start, window=500):
        """Get text before the Amazon link to find product name."""
        start = max(0, match_start - window)
        context = content[start:match_start]

        # Look for headings or strong text
        heading_match = re.search(r'<h[34][^>]*>([^<]+)</h[34]>', context, re.IGNORECASE)
        if heading_match:
            return heading_match.group(1).strip()

        strong_match = re.search(r'<strong>([^<]+)</strong>', context, re.IGNORECASE)
        if strong_match:
            return strong_match.group(1).strip()

        return None

    # Process each Amazon link
    offset = 0
    for match in button_pattern.finditer(html_content):
        amazon_url = match.group(1)
        button_text = match.group(2)

        # Try to get product name from context
        product_name = get_product_context(html_content, match.start())

        # Also try to extract from URL
        if not product_name:
            url_match = re.search(r'[?&]k=([^&]+)', amazon_url)
            if url_match:
                product_name = url_match.group(1).replace('+', ' ')

        if not product_name:
            continue

        # Find product slug
        slug = find_product_slug(product_name)
        if not slug:
            continue

        # Get product data
        product = product_data.get('products', {}).get(slug)
        if not product:
            continue

        # Skip if no image available
        if not product.get('image'):
            continue

        # Check if already has image (don't double-process)
        if 'amazon-product-card' in html_content[max(0, match.start()-200):match.start()]:
            continue

        changes.append({
            'product': product['name'],
            'slug': slug,
            'position': match.start()
        })

    return html_content, changes


def add_amazon_js_to_html(html_content):
    """Add amazon-products.js script if not already present."""
    if 'amazon-products.js' in html_content:
        return html_content, False

    # Add before closing body tag
    if '</body>' in html_content:
        script_tag = '    <script src="/js/amazon-products.js"></script>\n'
        html_content = html_content.replace('</body>', script_tag + '</body>')
        return html_content, True

    return html_content, False


def process_file(filepath, product_data, dry_run=False):
    """Process a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update Amazon links
    updated_content, changes = update_amazon_links(content, product_data, dry_run)

    # Add JS if needed
    updated_content, js_added = add_amazon_js_to_html(updated_content)

    if changes or js_added:
        print(f"\n{filepath}:")
        if js_added:
            print("  + Added amazon-products.js script")
        for change in changes:
            print(f"  + Found product: {change['product']} ({change['slug']})")

        if not dry_run and (changes or js_added):
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print("  [UPDATED]")
        elif dry_run:
            print("  [DRY RUN - no changes made]")

    return len(changes), js_added


def main():
    parser = argparse.ArgumentParser(description='Add Amazon product images to blog posts')
    parser.add_argument('--dry-run', action='store_true', help='Show changes without modifying files')
    parser.add_argument('--file', type=str, help='Process a specific file')
    args = parser.parse_args()

    print("=" * 60)
    print("Amazon Product Image Updater")
    print("=" * 60)

    # Load product data
    product_data = load_product_data()
    products_with_images = sum(1 for p in product_data.get('products', {}).values() if p.get('image'))
    print(f"\nLoaded {len(product_data.get('products', {}))} products ({products_with_images} with images)")

    if products_with_images == 0:
        print("\nWarning: No products have images yet!")
        print("Run 'node scripts/fetch-amazon-images.js' first to fetch images from Amazon.")
        print()

    # Find files to process
    base_dir = Path(__file__).parent.parent

    if args.file:
        files = [Path(args.file)]
    else:
        blog_dir = base_dir / 'blog'
        files = list(blog_dir.glob('*.html'))

    print(f"Processing {len(files)} files...")
    if args.dry_run:
        print("(DRY RUN - no files will be modified)")

    # Process files
    total_changes = 0
    total_js_added = 0

    for filepath in files:
        changes, js_added = process_file(filepath, product_data, args.dry_run)
        total_changes += changes
        if js_added:
            total_js_added += 1

    # Summary
    print("\n" + "=" * 60)
    print(f"Total products found: {total_changes}")
    print(f"Files with JS added: {total_js_added}")

    if args.dry_run:
        print("\nTo apply changes, run without --dry-run flag")


if __name__ == '__main__':
    main()
