#!/usr/bin/env python3
"""
Extract product names from Amazon affiliate links and find ASINs using PA-API.
Run once to build the initial product database.
"""

import os
import re
import json
import glob
import time
from urllib.parse import unquote_plus
from bs4 import BeautifulSoup

try:
    from amazon_paapi import AmazonApi
    HAS_PAAPI = True
except ImportError:
    HAS_PAAPI = False
    print("Warning: python-amazon-paapi not installed. Run: pip install python-amazon-paapi")

import config

def extract_product_names_from_file(filepath):
    """Extract product names from Amazon affiliate links in an HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')
    products = []

    # Find all Amazon links with our affiliate tag
    for link in soup.find_all('a', href=True):
        href = link['href']
        if 'amazon.com' in href and config.PARTNER_TAG in href:
            # Extract product name from search query
            match = re.search(r'[?&]k=([^&]+)', href)
            if match:
                product_name = unquote_plus(match.group(1))
                # Clean up the product name
                product_name = product_name.replace('+', ' ').strip()
                if product_name and product_name not in [p['name'] for p in products]:
                    products.append({
                        'name': product_name,
                        'original_link': href,
                        'asin': None
                    })

            # Also check for existing ASIN links (dp/ASIN format)
            asin_match = re.search(r'/dp/([A-Z0-9]{10})', href)
            if asin_match:
                asin = asin_match.group(1)
                # Find if we already have this product
                for p in products:
                    if p['asin'] is None:
                        p['asin'] = asin
                        break

    return products


def search_amazon_for_asin(amazon, product_name):
    """Use PA-API to search for a product and get its ASIN."""
    if not HAS_PAAPI:
        return None

    try:
        search_result = amazon.search_items(keywords=product_name, item_count=1)

        if search_result and search_result.search_result and search_result.search_result.items:
            item = search_result.search_result.items[0]
            title = product_name
            if item.item_info and item.item_info.title:
                title = item.item_info.title.display_value
            return {
                'asin': item.asin,
                'title': title
            }
    except Exception as e:
        print(f"  API error searching for '{product_name}': {e}")

    return None


def get_page_tier(filepath):
    """Determine which tier a page belongs to."""
    filename = os.path.basename(filepath)

    if filename.startswith('best-'):
        return 1  # Product buying guides - full enhancement
    elif 'calculator' in filename or filename in ['ftp-calculator.html', 'vo2-max-race-predictor.html', 'ymca-cycle-ergometer-calculator.html']:
        return 3  # Calculator pages - link upgrade only
    else:
        return 2  # Training guides - link upgrade only


def main():
    print("=" * 60)
    print("Amazon Affiliate Product Extractor")
    print("=" * 60)

    # Find all HTML files with affiliate links
    all_files = glob.glob(os.path.join(config.BASE_DIR, '**/*.html'), recursive=True)
    affiliate_files = []

    for filepath in all_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            if config.PARTNER_TAG in f.read():
                affiliate_files.append(filepath)

    print(f"\nFound {len(affiliate_files)} files with affiliate links\n")

    # Extract products from each file
    all_products = {}
    unique_products = {}

    for filepath in sorted(affiliate_files):
        rel_path = os.path.relpath(filepath, config.BASE_DIR)
        products = extract_product_names_from_file(filepath)
        tier = get_page_tier(filepath)

        if products:
            all_products[rel_path] = {
                'tier': tier,
                'products': products
            }

            # Track unique products
            for p in products:
                if p['name'] not in unique_products:
                    unique_products[p['name']] = p

            print(f"[Tier {tier}] {rel_path}: {len(products)} products")

    print(f"\n{'=' * 60}")
    print(f"Total unique products: {len(unique_products)}")
    print(f"{'=' * 60}\n")

    # Initialize PA-API if available
    amazon = None
    if HAS_PAAPI:
        try:
            amazon = AmazonApi(
                key=config.ACCESS_KEY,
                secret=config.SECRET_KEY,
                tag=config.PARTNER_TAG,
                country='US'
            )
            print("PA-API initialized successfully\n")
        except Exception as e:
            print(f"Warning: Could not initialize PA-API: {e}\n")

    # Search for ASINs (if API available)
    if amazon:
        print("Searching for ASINs (this may take a while due to rate limits)...\n")

        for i, (name, product) in enumerate(unique_products.items()):
            if product.get('asin'):
                print(f"[{i+1}/{len(unique_products)}] {name}: Already has ASIN {product['asin']}")
                continue

            print(f"[{i+1}/{len(unique_products)}] Searching: {name}...", end=" ")
            result = search_amazon_for_asin(amazon, name)

            if result:
                product['asin'] = result['asin']
                product['amazon_title'] = result['title']
                print(f"Found: {result['asin']}")
            else:
                print("Not found")

            # Rate limit: 1 request per second
            time.sleep(1.1)

    # Update all_products with found ASINs
    for page_data in all_products.values():
        for product in page_data['products']:
            if product['name'] in unique_products:
                found = unique_products[product['name']]
                product['asin'] = found.get('asin')
                product['amazon_title'] = found.get('amazon_title')

    # Save results
    os.makedirs(config.DATA_DIR, exist_ok=True)

    output = {
        'generated': time.strftime('%Y-%m-%d %H:%M:%S'),
        'total_files': len(all_products),
        'total_unique_products': len(unique_products),
        'pages': all_products,
        'products': unique_products
    }

    with open(config.PRODUCTS_CONFIG, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"Results saved to: {config.PRODUCTS_CONFIG}")

    # Summary
    found = sum(1 for p in unique_products.values() if p.get('asin'))
    missing = len(unique_products) - found
    print(f"\nASINs found: {found}")
    print(f"ASINs missing: {missing}")

    if missing > 0:
        print("\nProducts without ASINs:")
        for name, p in unique_products.items():
            if not p.get('asin'):
                print(f"  - {name}")


if __name__ == '__main__':
    main()
