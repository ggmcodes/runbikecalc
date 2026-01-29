#!/usr/bin/env python3
import csv

brands = ['Castelli', 'Giro', 'Pearl Izumi', 'Rapha', 'Sportful', 'POC']
gloves = []

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
            gloves.append(f"{name}|{price}|{url}|{manufacturer}")

# Print results
for glove in gloves[:30]:  # Limit to first 30 matches
    print(glove)
