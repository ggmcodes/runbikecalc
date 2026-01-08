#!/usr/bin/env python3
"""
Fetch detailed product data from Amazon PA-API.
Run weekly to refresh prices and images.
"""

import os
import json
import time

try:
    from amazon_paapi import AmazonApi
    HAS_PAAPI = True
except ImportError:
    HAS_PAAPI = False
    print("Error: python-amazon-paapi not installed. Run: pip install python-amazon-paapi")
    exit(1)

import config


def get_items_batch(amazon, asins):
    """Fetch product details for a batch of ASINs (max 10)."""
    try:
        response = amazon.get_items(asins)
        results = {}

        if response and response.items_result and response.items_result.items:
            for item in response.items_result.items:
                product = {
                    'asin': item.asin,
                    'title': None,
                    'price': None,
                    'price_display': None,
                    'image_url': None,
                    'image_url_medium': None,
                    'rating': None,
                    'review_count': None,
                    'url': f"https://www.amazon.com/dp/{item.asin}?tag={config.PARTNER_TAG}"
                }

                # Title
                if item.item_info and item.item_info.title:
                    product['title'] = item.item_info.title.display_value

                # Images
                if item.images and item.images.primary:
                    if item.images.primary.large:
                        product['image_url'] = item.images.primary.large.url
                    if item.images.primary.medium:
                        product['image_url_medium'] = item.images.primary.medium.url

                # Price
                if item.offers and item.offers.listings:
                    for listing in item.offers.listings:
                        if listing.price:
                            product['price'] = listing.price.amount
                            product['price_display'] = listing.price.display_amount
                            break

                # Reviews
                if item.customer_reviews:
                    if item.customer_reviews.star_rating:
                        product['rating'] = item.customer_reviews.star_rating.value
                    if item.customer_reviews.count:
                        product['review_count'] = item.customer_reviews.count

                results[item.asin] = product

        return results

    except Exception as e:
        print(f"  Error: {e}")
        return {}


def generate_stars_html(rating):
    """Generate star rating HTML."""
    if not rating:
        return ""

    full_stars = int(rating)
    half_star = rating - full_stars >= 0.5
    empty_stars = 5 - full_stars - (1 if half_star else 0)

    stars = "★" * full_stars
    if half_star:
        stars += "½"
    stars += "☆" * empty_stars

    return stars


def main():
    print("=" * 60)
    print("Amazon Product Data Fetcher")
    print("=" * 60)

    # Load product config
    if not os.path.exists(config.PRODUCTS_CONFIG):
        print(f"\nError: {config.PRODUCTS_CONFIG} not found.")
        print("Run extract-products.py first.")
        return

    with open(config.PRODUCTS_CONFIG, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Collect all unique ASINs
    asins = set()
    for name, product in data.get('products', {}).items():
        if product.get('asin'):
            asins.add(product['asin'])

    print(f"\nFound {len(asins)} unique ASINs to fetch\n")

    if not asins:
        print("No ASINs found. Run extract-products.py first.")
        return

    # Initialize API
    amazon = AmazonApi(
        key=config.ACCESS_KEY,
        secret=config.SECRET_KEY,
        tag=config.PARTNER_TAG,
        country='US'
    )

    # Fetch products in batches of 10
    all_products = {}
    asin_list = list(asins)

    for i in range(0, len(asin_list), 10):
        batch = asin_list[i:i+10]
        print(f"Fetching batch {i//10 + 1}/{(len(asin_list) + 9)//10}: {len(batch)} ASINs...")

        results = get_items_batch(amazon, batch)
        all_products.update(results)

        # Rate limit
        if i + 10 < len(asin_list):
            time.sleep(1.1)

    print(f"\n{'=' * 60}")
    print(f"Successfully fetched: {len(all_products)} products")

    # Add star HTML to each product
    for asin, product in all_products.items():
        product['stars_html'] = generate_stars_html(product.get('rating'))

    # Save cache
    cache = {
        'fetched': time.strftime('%Y-%m-%d %H:%M:%S'),
        'total_products': len(all_products),
        'products': all_products
    }

    with open(config.PRODUCTS_CACHE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2)

    print(f"Cache saved to: {config.PRODUCTS_CACHE}")

    # Summary
    with_price = sum(1 for p in all_products.values() if p.get('price'))
    with_image = sum(1 for p in all_products.values() if p.get('image_url'))
    with_rating = sum(1 for p in all_products.values() if p.get('rating'))

    print(f"\nProducts with price: {with_price}")
    print(f"Products with image: {with_image}")
    print(f"Products with rating: {with_rating}")

    # Show missing
    missing = set(asins) - set(all_products.keys())
    if missing:
        print(f"\nASINs not found ({len(missing)}):")
        for asin in missing:
            print(f"  - {asin}")


if __name__ == '__main__':
    main()
