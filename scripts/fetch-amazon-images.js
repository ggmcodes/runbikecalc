#!/usr/bin/env node
/**
 * Fetch Amazon Product Images
 *
 * Fetches product images from Amazon PA-API and saves them to a JSON file.
 * Run this script periodically (weekly) to keep images fresh.
 *
 * Usage:
 *   node scripts/fetch-amazon-images.js
 *
 * Or with npx (no install needed):
 *   npx tsx scripts/fetch-amazon-images.js
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { fetchProductImages, loadConfig } = require('../lib/amazon-paapi');

// Product catalog with VERIFIED ASINs from Amazon (January 2026)
// All ASINs have been verified via Amazon search
const PRODUCT_CATALOG = {
    // Running Watches - VERIFIED ASINs
    'garmin-forerunner-265': {
        asin: 'B0BS1T9J4Y',
        name: 'Garmin Forerunner 265',
        category: 'running-watches'
    },
    'garmin-forerunner-965': {
        asin: 'B0BS1XZY7T',
        name: 'Garmin Forerunner 965',
        category: 'running-watches'
    },
    'coros-pace-3': {
        asin: 'B0CFQQ9FDL',
        name: 'COROS PACE 3',
        category: 'running-watches'
    },
    'polar-vantage-v3': {
        asin: 'B0CZPRDRQG',
        name: 'Polar Vantage V3',
        category: 'running-watches'
    },
    'apple-watch-ultra-2': {
        asin: 'B0CHX9N594',
        name: 'Apple Watch Ultra 2',
        category: 'running-watches'
    },

    // Heart Rate Monitors - VERIFIED
    'polar-h10': {
        asin: 'B07PM54P4N',
        name: 'Polar H10 Heart Rate Monitor',
        category: 'heart-rate-monitors'
    },
    'garmin-hrm-pro-plus': {
        asin: 'B0DJKJL9J9',
        name: 'Garmin HRM-Pro Plus',
        category: 'heart-rate-monitors'
    },
    'wahoo-tickr': {
        asin: 'B078GRMFSN',
        name: 'Wahoo TICKR Heart Rate Monitor',
        category: 'heart-rate-monitors'
    },
    'polar-verity-sense': {
        asin: 'B08TRGNGF6',
        name: 'Polar Verity Sense',
        category: 'heart-rate-monitors'
    },

    // Bike Computers - VERIFIED
    'garmin-edge-1050': {
        asin: 'B0D6SBYCVH',
        name: 'Garmin Edge 1050',
        category: 'bike-computers'
    },
    'garmin-edge-840': {
        asin: 'B0BT36CRCQ',
        name: 'Garmin Edge 840',
        category: 'bike-computers'
    },
    'garmin-edge-540': {
        asin: 'B0BT36VBGM',
        name: 'Garmin Edge 540',
        category: 'bike-computers'
    },
    'wahoo-elemnt-roam': {
        asin: 'B0F4KRCY47',
        name: 'Wahoo ELEMNT ROAM',
        category: 'bike-computers'
    },
    'wahoo-elemnt-bolt': {
        asin: 'B0F4KR66TB',
        name: 'Wahoo ELEMNT BOLT',
        category: 'bike-computers'
    },
    'hammerhead-karoo-3': {
        asin: 'B0D5TC6BLS',
        name: 'Hammerhead Karoo 3',
        category: 'bike-computers'
    },

    // Smart Trainers - VERIFIED
    'wahoo-kickr-core': {
        asin: 'B07J16C4WL',
        name: 'Wahoo KICKR CORE',
        category: 'smart-trainers'
    },
    'wahoo-kickr': {
        asin: 'B0BFF3KH98',
        name: 'Wahoo KICKR V6',
        category: 'smart-trainers'
    },
    'tacx-neo-2t': {
        asin: 'B07W6QTHM9',
        name: 'Tacx NEO 2T',
        category: 'smart-trainers'
    },

    // Running Shoes - VERIFIED
    'nike-vaporfly-3': {
        asin: 'B0CWSS77CL',
        name: 'Nike Vaporfly 3',
        category: 'running-shoes'
    },
    'nike-pegasus-41': {
        asin: 'B0D2DQ8S6X',
        name: 'Nike Pegasus 41',
        category: 'running-shoes'
    },
    'asics-nimbus-26': {
        asin: 'B0CN8FK2QV',
        name: 'ASICS Gel-Nimbus 26',
        category: 'running-shoes'
    },
    'saucony-kinvara-15': {
        asin: 'B0D7VV4RNP',
        name: 'Saucony Kinvara 15',
        category: 'running-shoes'
    },

    // Fitness Trackers - VERIFIED
    'garmin-vivosmart-5': {
        asin: 'B09VY63659',
        name: 'Garmin Vivosmart 5',
        category: 'fitness-trackers'
    },
    'oura-ring-gen3': {
        asin: 'B0CSRN34BM',
        name: 'Oura Ring Gen 3',
        category: 'fitness-trackers'
    },
    'fitbit-charge-6': {
        asin: 'B0CC62ZG1M',
        name: 'Fitbit Charge 6',
        category: 'fitness-trackers'
    },

    // Recovery Tools - VERIFIED
    'theragun-elite': {
        asin: 'B0C42NTLYC',
        name: 'Theragun Elite',
        category: 'recovery'
    },
    'triggerpoint-grid': {
        asin: 'B0040EKZDY',
        name: 'TriggerPoint GRID Foam Roller',
        category: 'recovery'
    },
    'normatec-3': {
        asin: 'B0B72QBWHC',
        name: 'Normatec 3',
        category: 'recovery'
    },
    'hyperice-hypervolt-2': {
        asin: 'B0CDHLKJ2H',
        name: 'Hyperice Hypervolt 2',
        category: 'recovery'
    },

    // Headphones - VERIFIED
    'shokz-openrun-pro': {
        asin: 'B09BVXT8TJ',
        name: 'Shokz OpenRun Pro',
        category: 'running-headphones'
    },
    'jabra-elite-8': {
        asin: 'B0CB9563MB',
        name: 'Jabra Elite 8 Active',
        category: 'running-headphones'
    },
    'beats-fit-pro': {
        asin: 'B09JL41N9C',
        name: 'Beats Fit Pro',
        category: 'running-headphones'
    },

    // Cold Plunge / Ice Bath - VERIFIED
    'cold-plunge-tub-110gal': {
        asin: 'B0CPFMMTL2',
        name: 'Cold Plunge Tub 110 Gallon',
        category: 'cold-plunge'
    },
    'plunge-lab-xl': {
        asin: 'B0CFK88KTC',
        name: 'Plunge Lab Cold Plunge Tub XL',
        category: 'cold-plunge'
    },
    'ice-barrel-99gal': {
        asin: 'B0CNKNS31C',
        name: 'Ice Barrel Premium XL 99 Gallon',
        category: 'cold-plunge'
    },

    // Cycling Shoes - VERIFIED
    'shimano-rc903': {
        asin: 'B0CP65YRTP',
        name: 'Shimano S-PHYRE RC9 (RC903)',
        category: 'cycling-shoes'
    },
    'sidi-shot-2s': {
        asin: 'B0CJY3SXBS',
        name: 'Sidi Shot 2S',
        category: 'cycling-shoes'
    },
    'lake-cx332': {
        asin: 'B06XHR42CQ',
        name: 'Lake CX332',
        category: 'cycling-shoes'
    },

    // Sauna - VERIFIED
    'higherdose-sauna-blanket': {
        asin: 'B09M8YQ4KB',
        name: 'HigherDOSE Infrared Sauna Blanket',
        category: 'sauna'
    },
    'serenelife-infrared-sauna': {
        asin: 'B07WC64NPQ',
        name: 'SereneLife Portable Infrared Sauna',
        category: 'sauna'
    },
    'serenelife-steam-sauna': {
        asin: 'B084GY5CHB',
        name: 'SereneLife Portable Steam Sauna',
        category: 'sauna'
    },

    // Yoga Mats - VERIFIED
    'manduka-pro': {
        asin: 'B07Y6FFL66',
        name: 'Manduka PRO Yoga Mat',
        category: 'yoga-mats'
    },
    'jade-harmony': {
        asin: 'B000ECD6N2',
        name: 'JadeYoga Harmony Mat',
        category: 'yoga-mats'
    },
    'gaiam-essentials': {
        asin: 'B07JVWGQX3',
        name: 'Gaiam Essentials Premium Yoga Mat',
        category: 'yoga-mats'
    }
};

const OUTPUT_FILE = path.join(__dirname, '../data/product-images.json');

async function main() {
    console.log('='.repeat(60));
    console.log('Amazon Product Image Fetcher');
    console.log('='.repeat(60));

    const config = loadConfig();

    if (!config.accessKey || !config.secretKey) {
        console.error('\nError: Missing Amazon PA-API credentials.');
        console.error('Make sure .env.local contains:');
        console.error('  AMAZON_ACCESS_KEY=your_key');
        console.error('  AMAZON_SECRET_KEY=your_secret');
        console.error('  AMAZON_PARTNER_TAG=your_tag');
        process.exit(1);
    }

    // Collect all ASINs
    const asins = Object.values(PRODUCT_CATALOG)
        .map(p => p.asin)
        .filter(Boolean);

    console.log(`\nFetching ${asins.length} products from Amazon PA-API...\n`);

    try {
        const imageData = await fetchProductImages(asins, config);

        // Merge with catalog data
        const output = {
            generated: new Date().toISOString(),
            totalProducts: Object.keys(PRODUCT_CATALOG).length,
            products: {}
        };

        for (const [slug, product] of Object.entries(PRODUCT_CATALOG)) {
            const amazonData = imageData[product.asin] || {};

            output.products[slug] = {
                slug,
                asin: product.asin,
                name: product.name,
                category: product.category,
                title: amazonData.title || product.name,
                image: amazonData.image || null,
                imageMedium: amazonData.imageMedium || null,
                price: amazonData.price || null,
                starRating: amazonData.starRating || null,
                reviewCount: amazonData.reviewCount || null,
                url: amazonData.url || `https://www.amazon.com/dp/${product.asin}?tag=${config.partnerTag}`
            };
        }

        // Write to file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

        // Summary
        const withImages = Object.values(output.products).filter(p => p.image).length;
        const withPrices = Object.values(output.products).filter(p => p.price).length;

        console.log('='.repeat(60));
        console.log(`Total products: ${output.totalProducts}`);
        console.log(`Products with images: ${withImages}`);
        console.log(`Products with prices: ${withPrices}`);
        console.log(`\nSaved to: ${OUTPUT_FILE}`);

        // List products without images
        const noImage = Object.values(output.products).filter(p => !p.image);
        if (noImage.length > 0) {
            console.log(`\nProducts without images (${noImage.length}):`);
            noImage.forEach(p => console.log(`  - ${p.name} (${p.asin})`));
        }

    } catch (error) {
        console.error('Error fetching products:', error.message);
        process.exit(1);
    }
}

main();
