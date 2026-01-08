#!/usr/bin/env python3
"""
Update affiliate pages with Amazon product data.
- Tier 1 (buying guides): Add product cards with images, prices, ratings
- Tier 2 & 3 (guides/calculators): Update links to use direct ASINs
"""

import os
import re
import json
from bs4 import BeautifulSoup
from urllib.parse import unquote_plus

import config

# Product card template for Tier 1 pages
PRODUCT_CARD_TEMPLATE = '''
<div class="product-card flex flex-col md:flex-row gap-6 mb-6 p-4 bg-white rounded-lg shadow-lg border border-gray-100" data-asin="{asin}">
    <div class="md:w-1/3 flex-shrink-0">
        <a href="{url}" target="_blank" rel="noopener sponsored">
            <img src="{image_url}" alt="{title}" class="w-full rounded-lg hover:opacity-90 transition">
        </a>
    </div>
    <div class="md:w-2/3">
        <a href="{url}" target="_blank" rel="noopener sponsored" class="hover:text-blue-600">
            <h4 class="text-lg font-bold text-gray-900 mb-2">{title}</h4>
        </a>
        <div class="flex items-center gap-2 mb-3">
            <span class="text-yellow-500 text-lg">{stars_html}</span>
            <span class="text-gray-500 text-sm">({review_count} reviews)</span>
        </div>
        <p class="text-2xl font-bold text-green-600 mb-4">{price_display}</p>
        <a href="{url}" target="_blank" rel="noopener sponsored"
           class="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition shadow-sm">
            Check Price on Amazon &rarr;
        </a>
    </div>
</div>
'''


def load_data():
    """Load product config and cache."""
    products_config = {}
    products_cache = {}

    if os.path.exists(config.PRODUCTS_CONFIG):
        with open(config.PRODUCTS_CONFIG, 'r', encoding='utf-8') as f:
            products_config = json.load(f)

    if os.path.exists(config.PRODUCTS_CACHE):
        with open(config.PRODUCTS_CACHE, 'r', encoding='utf-8') as f:
            products_cache = json.load(f)

    return products_config, products_cache


def get_product_by_name(name, products_config, products_cache):
    """Find product data by name."""
    # First find ASIN from config
    all_products = products_config.get('products', {})
    product_info = all_products.get(name, {})
    asin = product_info.get('asin')

    if not asin:
        return None

    # Get full product data from cache
    cached_products = products_cache.get('products', {})
    product_data = cached_products.get(asin, {})

    if not product_data:
        # Return minimal data if not in cache
        return {
            'asin': asin,
            'title': name,
            'url': f"https://www.amazon.com/dp/{asin}?tag={config.PARTNER_TAG}",
            'image_url': None,
            'price_display': None,
            'stars_html': '',
            'review_count': 0
        }

    return product_data


def extract_product_name_from_link(href):
    """Extract product name from Amazon search URL."""
    match = re.search(r'[?&]k=([^&]+)', href)
    if match:
        return unquote_plus(match.group(1)).replace('+', ' ').strip()
    return None


def update_tier1_page(filepath, page_data, products_config, products_cache):
    """Update a Tier 1 buying guide with product cards."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')
    modified = False

    # Find all Amazon links
    for link in soup.find_all('a', href=True):
        href = link['href']
        if 'amazon.com' not in href or config.PARTNER_TAG not in href:
            continue

        # Skip if already an ASIN link
        if '/dp/' in href:
            continue

        # Extract product name
        product_name = extract_product_name_from_link(href)
        if not product_name:
            continue

        # Get product data
        product = get_product_by_name(product_name, products_config, products_cache)
        if not product or not product.get('asin'):
            continue

        # Update the link to use ASIN
        new_href = product.get('url', f"https://www.amazon.com/dp/{product['asin']}?tag={config.PARTNER_TAG}")
        link['href'] = new_href
        modified = True

        # Check if we should insert a product card
        # Only add card if this link is in a "Check Price" button context
        link_text = link.get_text().strip().lower()
        if 'check price' in link_text or 'view on amazon' in link_text or 'buy' in link_text:
            # Check if there's already a product card nearby
            parent = link.parent
            if parent and not parent.find_previous_sibling(class_='product-card'):
                # Only add card if we have image and price
                if product.get('image_url') and product.get('price_display'):
                    card_html = PRODUCT_CARD_TEMPLATE.format(
                        asin=product.get('asin', ''),
                        url=new_href,
                        image_url=product.get('image_url', ''),
                        title=product.get('title', product_name),
                        stars_html=product.get('stars_html', ''),
                        review_count=product.get('review_count', 0) or 0,
                        price_display=product.get('price_display', '')
                    )

                    # Insert card before the link's parent container
                    card_soup = BeautifulSoup(card_html, 'html.parser')
                    card = card_soup.find('div', class_='product-card')

                    # Find a suitable insertion point
                    insert_point = link.find_parent('div', class_=['bg-yellow-50', 'mt-4', 'mb-4'])
                    if insert_point:
                        insert_point.insert_before(card)
                        modified = True

    if modified:
        # Write updated content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))

    return modified


def update_tier2_page(filepath, page_data, products_config, products_cache):
    """Update a Tier 2/3 page - just update links to use ASINs."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    modified = False

    # Find all Amazon search links and replace with ASIN links
    def replace_link(match):
        nonlocal modified
        href = match.group(0)

        # Extract product name
        product_name = extract_product_name_from_link(href)
        if not product_name:
            return href

        # Get product data
        product = get_product_by_name(product_name, products_config, products_cache)
        if not product or not product.get('asin'):
            return href

        # Create new ASIN-based URL
        new_href = f"https://www.amazon.com/dp/{product['asin']}?tag={config.PARTNER_TAG}"
        modified = True
        return new_href

    # Pattern to match Amazon search URLs
    pattern = r'https://www\.amazon\.com/s\?k=[^"\'>\s]+'
    content = re.sub(pattern, replace_link, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return modified


def main():
    print("=" * 60)
    print("Affiliate Page Updater")
    print("=" * 60)

    # Load data
    products_config, products_cache = load_data()

    if not products_config:
        print("\nError: No product config found. Run extract-products.py first.")
        return

    if not products_cache:
        print("\nWarning: No product cache found. Run amazon-products.py first.")
        print("Proceeding with link updates only (no product cards).\n")

    pages = products_config.get('pages', {})
    print(f"\nProcessing {len(pages)} pages...\n")

    stats = {'tier1': 0, 'tier2': 0, 'tier3': 0, 'updated': 0, 'skipped': 0}

    for rel_path, page_data in sorted(pages.items()):
        filepath = os.path.join(config.BASE_DIR, rel_path)
        tier = page_data.get('tier', 2)

        if not os.path.exists(filepath):
            print(f"  Skip (not found): {rel_path}")
            stats['skipped'] += 1
            continue

        if tier == 1:
            stats['tier1'] += 1
            modified = update_tier1_page(filepath, page_data, products_config, products_cache)
        else:
            stats[f'tier{tier}'] += 1
            modified = update_tier2_page(filepath, page_data, products_config, products_cache)

        if modified:
            stats['updated'] += 1
            print(f"  [Tier {tier}] Updated: {rel_path}")
        else:
            print(f"  [Tier {tier}] No changes: {rel_path}")

    print(f"\n{'=' * 60}")
    print("Summary:")
    print(f"  Tier 1 (buying guides): {stats['tier1']}")
    print(f"  Tier 2 (training guides): {stats['tier2']}")
    print(f"  Tier 3 (calculators): {stats['tier3']}")
    print(f"  Updated: {stats['updated']}")
    print(f"  Skipped: {stats['skipped']}")


if __name__ == '__main__':
    main()
