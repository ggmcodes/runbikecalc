#!/bin/bash
# Extract cycling jerseys from specific brands with key details
awk -F'\t' '
NR==1 {next}  # Skip header
$6=="Y" && tolower($2) ~ /jersey/ && ($16=="Castelli" || $16=="Pearl Izumi" || $16=="Rapha" || $16=="MAAP" || $16=="Giordana" || $16=="Sportful") {
    # Print: Product Name | Price | URL | Brand | Gender
    print $2 "|" $5 "|" $3 "|" $16 "|" $25
}' backcountry-products.txt | head -40
