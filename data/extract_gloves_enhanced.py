#!/usr/bin/env python3
import csv

brands = ['Castelli', 'Giro', 'Pearl Izumi', 'Rapha', 'Sportful', 'POC']
gloves_dict = {}

with open('/Users/glengomezmeade/Projects/runbikecalc/data/backcountry-products.txt', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    next(reader)  # Skip header

    for row in reader:
        if len(row) < 16:
            continue

        sku = row[0]
        name = row[1]
        url = row[2]
        image_url = row[3]
        price = row[4]
        stock = row[5]
        manufacturer = row[15]

        if stock == 'Y' and 'glove' in name.lower() and manufacturer in brands:
            # Extract base product name (without size/color)
            base_name = name.split(' - ')[0] if ' - ' in name else name

            if base_name not in gloves_dict:
                gloves_dict[base_name] = {
                    'name': name,
                    'price': price,
                    'url': url,
                    'manufacturer': manufacturer
                }

# Print unique products
for base_name, data in list(gloves_dict.items())[:40]:
    print(f"{data['name']}|{data['price']}|{data['url']}|{data['manufacturer']}")
