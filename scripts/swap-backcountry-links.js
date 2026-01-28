#!/usr/bin/env node
/**
 * Backcountry Affiliate Link Swap Script
 *
 * Swaps Amazon affiliate links with Backcountry links where products exist in the feed.
 * Backcountry offers 8% commission (vs Amazon's ~3-4%) with 30-day referral period.
 *
 * Usage: node scripts/swap-backcountry-links.js [--dry-run] [--file <path>]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    feedPath: path.join(__dirname, '../data/backcountry-products.txt'),
    blogDir: path.join(__dirname, '../blog'),
    // Target files for Backcountry link swap (products they carry)
    targetFiles: [
        'best-running-watches-2026.html',
        'best-triathlon-watches-2026.html',
        'best-running-shoes-2026.html',
        'best-trail-running-shoes-2026.html',
        'best-cycling-shoes-2026.html',
        'best-bike-computers-2026.html',
        'best-smart-trainers-2026.html',
        'best-power-meters-2026.html',
        'best-heart-rate-monitors-2026.html',
        'best-fitness-trackers-2026.html'
    ],
    // Brands we want to swap to Backcountry (verified in feed)
    targetBrands: [
        'Garmin', 'COROS', 'Suunto', 'Wahoo', 'Polar',
        'Nike', 'Brooks', 'HOKA', 'Altra', 'Saucony',
        'Shimano', 'Sidi', 'Giro', 'Lake',
        'Castelli', 'PEARL iZUMi', 'Pearl Izumi'
    ]
};

// Product name normalization for matching
function normalizeProductName(name) {
    return name
        .toLowerCase()
        .replace(/['']/g, "'")
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s'-]/g, '')
        .trim();
}

// Extract base product name (remove size, color variants)
function getBaseProductName(fullName) {
    // Remove common suffixes like size, color
    const name = fullName
        .replace(/,?\s*(men's|women's|unisex)/gi, '')
        .replace(/,?\s*\d+(\.\d+)?\s*(mm|cm|m|"|inch|size)?$/gi, '')
        .replace(/,?\s*(black|white|grey|gray|blue|red|green|navy|charcoal|orange|yellow|silver|gold|purple|pink|brown|tan|beige)[\s,]*$/gi, '')
        .replace(/,?\s*[SML]$/gi, '')
        .replace(/,?\s*(small|medium|large|x-?large|xx-?large)$/gi, '')
        .trim();
    return name;
}

// Load and parse Backcountry product feed
function loadBackcountryFeed() {
    console.log('Loading Backcountry product feed...');
    const feedContent = fs.readFileSync(CONFIG.feedPath, 'utf8');
    const lines = feedContent.split('\n');

    // Skip header row
    const products = [];
    const productsByBrand = new Map();
    const productsByName = new Map();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = line.split('\t');
        if (cols.length < 22) continue;

        const product = {
            sku: cols[0],
            name: cols[1],
            url: cols[2],
            imageUrl: cols[3],
            price: cols[4],
            inStock: cols[5] === 'Y',
            manufacturer: cols[15],
            parentSku: cols[20],
            parentName: cols[21]
        };

        // Skip out of stock items
        if (!product.inStock) continue;

        // Only index products from target brands
        const brandMatch = CONFIG.targetBrands.find(b =>
            product.manufacturer.toLowerCase() === b.toLowerCase()
        );
        if (!brandMatch) continue;

        products.push(product);

        // Index by manufacturer
        const brandKey = product.manufacturer.toLowerCase();
        if (!productsByBrand.has(brandKey)) {
            productsByBrand.set(brandKey, []);
        }
        productsByBrand.set(brandKey, [...productsByBrand.get(brandKey), product]);

        // Index by normalized parent name (more reliable for matching)
        if (product.parentName) {
            const nameKey = normalizeProductName(product.parentName);
            if (!productsByName.has(nameKey)) {
                productsByName.set(nameKey, product);
            }
        }

        // Also index by product name
        const prodNameKey = normalizeProductName(getBaseProductName(product.name));
        if (!productsByName.has(prodNameKey)) {
            productsByName.set(prodNameKey, product);
        }
    }

    console.log(`Loaded ${products.length} products from ${productsByBrand.size} target brands`);
    return { products, productsByBrand, productsByName };
}

// Products that should NOT be matched (accessories, not main products)
const EXCLUDE_PATTERNS = [
    'case', 'mount', 'strap', 'band', 'holder', 'adapter', 'adaptor',
    'charger', 'cable', 'tool', 'cleat', 'replacement'
];

// Manual product mappings for known products that need special handling
// Maps normalized search term to Backcountry parent name
const MANUAL_MAPPINGS = {
    // Power meters
    'garmin rally xc200': 'Rally XC Dual-Sided Power Meter Pedals',
    'garmin rally xc100': 'Rally XC Single-Sided Power Meter Pedals',
    'garmin rally rs200': 'Rally RS Dual-Sided Power Meter Pedals',
    'garmin rally rs100': 'Rally RS Single-Sided Power Meter Pedals',
    'garmin rally rk200': 'Rally RK Dual-Sided Power Meter Pedals',
    'garmin rally rk100': 'Rally RK Single-Sided Power Meter Pedals',
    // Cycling shoes
    'shimano s-phyre rc9': 'RC903 S-PHYRE Cycling Shoe',
    'shimano rc903': 'RC903 S-PHYRE Cycling Shoe',
    'shimano rc702': 'RC702 Cycling Shoe',
    'shimano rc502': 'RC502 Cycling Shoe',
    'shimano xc502': 'XC502 Mountain Bike Shoe',
    'shimano xc702': 'XC702 Mountain Bike Shoe',
    // Bike computers
    'garmin edge 1040': 'Edge 1040 Solar GPS Bike Computer',
    'garmin edge 1040 solar': 'Edge 1040 Solar GPS Bike Computer',
    'garmin edge explore 2': 'Edge Explore 2 GPS',
    'garmin edge 550': 'Edge 550 Bike Computer',
    'garmin edge 850': 'Edge 850 Bike Computer',
    // Trail shoes
    'hoka speedgoat 6': 'Speedgoat 6 Trail Running Shoe',
    'altra timp 5': 'Timp 5 Trail Running Shoe'
};

// Find best matching Backcountry product for a given product name/brand
function findBackcountryMatch(productName, brand, feed) {
    const { productsByBrand, productsByName } = feed;

    // Normalize search terms
    const searchName = normalizeProductName(productName);
    const searchBrand = brand ? brand.toLowerCase() : '';

    // Extract the model number/name from search (e.g., "265" from "Forerunner 265")
    const searchModel = searchName.match(/\b(\d{3,4})\b/)?.[1] || '';

    // Check manual mappings first
    if (MANUAL_MAPPINGS[searchName]) {
        const targetName = normalizeProductName(MANUAL_MAPPINGS[searchName]);
        // Find product by parent name
        for (const [key, product] of productsByName) {
            if (normalizeProductName(product.parentName || '').includes(targetName) ||
                targetName.includes(normalizeProductName(product.parentName || ''))) {
                return product;
            }
        }
    }

    // Try exact parent name match first
    if (productsByName.has(searchName)) {
        const match = productsByName.get(searchName);
        const matchNameLower = (match.parentName || match.name).toLowerCase();
        // Skip if it's an accessory
        if (!EXCLUDE_PATTERNS.some(p => matchNameLower.includes(p))) {
            return match;
        }
    }

    // Try matching by brand + keywords
    if (searchBrand && productsByBrand.has(searchBrand)) {
        const brandProducts = productsByBrand.get(searchBrand);

        // Extract key identifiers from product name
        const keywords = searchName.split(' ').filter(w =>
            w.length > 2 && !['the', 'and', 'for', 'with', 'mens', 'womens'].includes(w)
        );

        // Score each product
        let bestMatch = null;
        let bestScore = 0;

        for (const product of brandProducts) {
            const productNameNorm = normalizeProductName(product.parentName || product.name);
            const productNameLower = (product.parentName || product.name).toLowerCase();

            // Skip accessories/cases
            if (EXCLUDE_PATTERNS.some(p => productNameLower.includes(p))) {
                continue;
            }

            // Count matching keywords
            let score = 0;
            for (const kw of keywords) {
                if (productNameNorm.includes(kw)) {
                    score += 2;
                }
            }

            // CRITICAL: Model number must match exactly if present in search
            const productModel = productNameNorm.match(/\b(\d{3,4})\b/)?.[1] || '';
            if (searchModel && productModel) {
                if (searchModel === productModel) {
                    score += 10; // Big bonus for exact model match
                } else {
                    // Different model numbers - penalize heavily
                    score -= 20;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = product;
            }
        }

        // Require minimum match quality
        if (bestScore >= 4) {
            return bestMatch;
        }
    }

    return null;
}

// Extract product info from Amazon link context
function extractProductFromContext(html, amazonUrl) {
    // Try to find product name near the Amazon link
    const urlEscaped = amazonUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Look for alt text in nearby img tags
    const altMatch = html.match(new RegExp(`<img[^>]*alt=["']([^"']+)["'][^>]*>[\\s\\S]{0,500}${urlEscaped}|${urlEscaped}[\\s\\S]{0,500}<img[^>]*alt=["']([^"']+)["']`, 'i'));
    if (altMatch) {
        return altMatch[1] || altMatch[2];
    }

    // Look for product name in nearby text
    const contextMatch = html.match(new RegExp(`>([^<]*(?:Garmin|COROS|Suunto|Wahoo|Polar|Nike|Brooks|HOKA|Altra|Saucony|Shimano|Sidi|Giro|Lake)[^<]*)<[\\s\\S]{0,300}${urlEscaped}`, 'i'));
    if (contextMatch) {
        return contextMatch[1].trim();
    }

    return null;
}

// Process a single HTML file
function processFile(filePath, feed, dryRun = false) {
    console.log(`\nProcessing: ${path.basename(filePath)}`);

    let html = fs.readFileSync(filePath, 'utf8');
    let swapCount = 0;
    let noMatchCount = 0;
    const swaps = [];

    // Find all Amazon affiliate links
    const amazonLinkPattern = /https:\/\/www\.amazon\.com\/(?:dp\/[A-Z0-9]+|s\?k=[^"&]+)[^"]*tag=runbikecalc-20/g;
    const matches = html.match(amazonLinkPattern) || [];
    const uniqueLinks = [...new Set(matches)];

    console.log(`  Found ${uniqueLinks.length} unique Amazon links`);

    for (const amazonUrl of uniqueLinks) {
        // Extract product info from context
        const productName = extractProductFromContext(html, amazonUrl);

        if (!productName) {
            console.log(`  - Could not extract product name for: ${amazonUrl.substring(0, 60)}...`);
            noMatchCount++;
            continue;
        }

        // Detect brand from product name
        const brandMatch = CONFIG.targetBrands.find(b =>
            productName.toLowerCase().includes(b.toLowerCase())
        );

        if (!brandMatch) {
            console.log(`  - No target brand found in: "${productName}"`);
            noMatchCount++;
            continue;
        }

        // Find Backcountry match
        const bcProduct = findBackcountryMatch(productName, brandMatch, feed);

        if (bcProduct) {
            swaps.push({
                original: amazonUrl,
                replacement: bcProduct.url,
                productName: productName,
                bcProductName: bcProduct.parentName || bcProduct.name,
                price: bcProduct.price
            });
            swapCount++;
        } else {
            console.log(`  - No Backcountry match for: "${productName}" (${brandMatch})`);
            noMatchCount++;
        }
    }

    // Apply swaps
    if (!dryRun && swaps.length > 0) {
        for (const swap of swaps) {
            // Replace Amazon URL with Backcountry URL
            html = html.split(swap.original).join(swap.replacement);
        }

        // Ensure all Backcountry links have rel="sponsored"
        html = html.replace(
            /(href="https:\/\/backcountry\.tnu8\.net[^"]*")/g,
            (match) => {
                // Check if already has rel attribute
                return match;
            }
        );

        // Update "Check Price on Amazon" buttons to "Check Price on Backcountry"
        html = html.replace(/Check Price on Amazon/g, 'Check Price on Backcountry');

        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`  Wrote ${swaps.length} swaps to file`);
    }

    // Report
    console.log(`  Results: ${swapCount} swapped, ${noMatchCount} kept as Amazon`);

    return { swapCount, noMatchCount, swaps };
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const singleFile = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

    console.log('='.repeat(60));
    console.log('Backcountry Affiliate Link Swap Script');
    console.log('='.repeat(60));
    if (dryRun) console.log('*** DRY RUN - No files will be modified ***\n');

    // Load feed
    const feed = loadBackcountryFeed();

    // Determine files to process
    let files = [];
    if (singleFile) {
        files = [path.resolve(singleFile)];
    } else {
        files = CONFIG.targetFiles.map(f => path.join(CONFIG.blogDir, f));
    }

    // Process each file
    let totalSwaps = 0;
    let totalKept = 0;
    const allSwaps = [];

    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.log(`\nSkipping (not found): ${path.basename(file)}`);
            continue;
        }

        const result = processFile(file, feed, dryRun);
        totalSwaps += result.swapCount;
        totalKept += result.noMatchCount;
        allSwaps.push(...result.swaps);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total links swapped to Backcountry: ${totalSwaps}`);
    console.log(`Total links kept as Amazon: ${totalKept}`);

    if (allSwaps.length > 0) {
        console.log('\nSwapped products:');
        for (const swap of allSwaps) {
            console.log(`  - ${swap.productName} -> ${swap.bcProductName} ($${swap.price})`);
        }
    }

    if (dryRun) {
        console.log('\n*** DRY RUN COMPLETE - Run without --dry-run to apply changes ***');
    }
}

main();
