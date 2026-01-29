#!/usr/bin/env python3
import csv

brands = ['Castelli', 'Pearl Izumi', 'Rapha', 'MAAP', 'Giordana', 'Sportful']
results = []

with open('backcountry-products.txt', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    header = next(reader)

    for row in reader:
        if len(row) < 25:
            continue

        stock = row[5]  # Stock Availability
        product_name = row[1]  # Product Name
        manufacturer = row[15] if len(row) > 15 else ''  # Manufacturer
        price = row[4]  # Current Price
        url = row[2]  # Product URL
        gender = row[24] if len(row) > 24 else ''  # Gender

        # Filter for in-stock jerseys from target brands
        if stock == 'Y' and 'jersey' in product_name.lower() and manufacturer in brands:
            results.append(f"{product_name}|{price}|{url}|{manufacturer}|{gender}")

# Print first 50 results
for r in results[:50]:
    print(r)
