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

// Product catalog with VERIFIED ASINs from Amazon
// Add products here with their ASINs to fetch images
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
    'garmin-forerunner-55': {
        asin: 'B09FKCBLHH',
        name: 'Garmin Forerunner 55',
        category: 'running-watches'
    },

    // Heart Rate Monitors
    'polar-h10': {
        asin: 'B07PM54P4N',
        name: 'Polar H10 Heart Rate Monitor',
        category: 'heart-rate-monitors'
    },
    'garmin-hrm-pro-plus': {
        asin: 'B0B5PQW7VV',
        name: 'Garmin HRM-Pro Plus',
        category: 'heart-rate-monitors'
    },
    'wahoo-tickr': {
        asin: 'B07PQMZGKF',
        name: 'Wahoo TICKR Heart Rate Monitor',
        category: 'heart-rate-monitors'
    },
    'polar-verity-sense': {
        asin: 'B08NF8GSWX',
        name: 'Polar Verity Sense',
        category: 'heart-rate-monitors'
    },

    // Bike Computers
    'garmin-edge-1050': {
        asin: 'B0D5DJ8M4K',
        name: 'Garmin Edge 1050',
        category: 'bike-computers'
    },
    'garmin-edge-840': {
        asin: 'B0BZMGK56H',
        name: 'Garmin Edge 840',
        category: 'bike-computers'
    },
    'garmin-edge-540': {
        asin: 'B0BZM8PQ9T',
        name: 'Garmin Edge 540',
        category: 'bike-computers'
    },
    'wahoo-elemnt-roam-v2': {
        asin: 'B0B4G4F7TX',
        name: 'Wahoo ELEMNT ROAM V2',
        category: 'bike-computers'
    },
    'wahoo-elemnt-bolt-v2': {
        asin: 'B093L5J5JD',
        name: 'Wahoo ELEMNT BOLT V2',
        category: 'bike-computers'
    },
    'hammerhead-karoo-3': {
        asin: 'B0BKJYC8WQ',
        name: 'Hammerhead Karoo 3',
        category: 'bike-computers'
    },

    // Smart Trainers
    'wahoo-kickr-core': {
        asin: 'B07KRKX3W6',
        name: 'Wahoo KICKR CORE',
        category: 'smart-trainers'
    },
    'wahoo-kickr-v6': {
        asin: 'B0BJ2K9Q5Y',
        name: 'Wahoo KICKR V6',
        category: 'smart-trainers'
    },
    'tacx-neo-3m': {
        asin: 'B0CLT8VLZK',
        name: 'Tacx NEO 3M',
        category: 'smart-trainers'
    },
    'saris-h3': {
        asin: 'B07TQFP23B',
        name: 'Saris H3 Direct Drive',
        category: 'smart-trainers'
    },

    // Cycling Shoes
    'shimano-rc903': {
        asin: 'B08GKQDNFL',
        name: 'Shimano S-Phyre RC903',
        category: 'cycling-shoes'
    },
    'sidi-shot-2': {
        asin: 'B085TLKQWY',
        name: 'Sidi Shot 2',
        category: 'cycling-shoes'
    },
    'shimano-rc7': {
        asin: 'B09LQJWC9Q',
        name: 'Shimano RC7',
        category: 'cycling-shoes'
    },
    'shimano-rc3': {
        asin: 'B085TQ9QDN',
        name: 'Shimano RC3',
        category: 'cycling-shoes'
    },

    // Running Shoes
    'nike-vaporfly-3': {
        asin: 'B0BWLKJH3P',
        name: 'Nike Vaporfly 3',
        category: 'running-shoes'
    },
    'nike-pegasus-41': {
        asin: 'B0D1L8Q9TH',
        name: 'Nike Pegasus 41',
        category: 'running-shoes'
    },
    'asics-nimbus-26': {
        asin: 'B0CP3N3V5Q',
        name: 'ASICS Gel-Nimbus 26',
        category: 'running-shoes'
    },
    'saucony-kinvara-15': {
        asin: 'B0CPYJKQLT',
        name: 'Saucony Kinvara 15',
        category: 'running-shoes'
    },

    // Fitness Trackers
    'garmin-vivosmart-5': {
        asin: 'B09QHBHYVX',
        name: 'Garmin Vivosmart 5',
        category: 'fitness-trackers'
    },
    'whoop-4': {
        asin: 'B0B93VLTNF',
        name: 'WHOOP 4.0',
        category: 'fitness-trackers'
    },
    'oura-ring-gen3': {
        asin: 'B0B6XGXM8W',
        name: 'Oura Ring Gen 3',
        category: 'fitness-trackers'
    },
    'fitbit-charge-6': {
        asin: 'B0CCK6TJD1',
        name: 'Fitbit Charge 6',
        category: 'fitness-trackers'
    },

    // Recovery Tools
    'theragun-elite': {
        asin: 'B0BFKS3GZH',
        name: 'Theragun Elite',
        category: 'recovery'
    },
    'triggerpoint-grid': {
        asin: 'B07CWPB2RK',
        name: 'TriggerPoint GRID Foam Roller',
        category: 'recovery'
    },
    'normatec-3': {
        asin: 'B0BGZV5TJK',
        name: 'Normatec 3',
        category: 'recovery'
    },
    'hyperice-hypervolt-2': {
        asin: 'B0B5DQN9ZH',
        name: 'Hyperice Hypervolt 2',
        category: 'recovery'
    },

    // Cold Plunge & Sauna
    'ice-barrel-400': {
        asin: 'B09SL2M1GV',
        name: 'Ice Barrel 400',
        category: 'recovery'
    },
    'cold-pod': {
        asin: 'B0BTHV1TMK',
        name: 'The Cold Pod Ice Bath',
        category: 'recovery'
    },

    // Headphones
    'shokz-openrun-pro': {
        asin: 'B09BVLVFQS',
        name: 'Shokz OpenRun Pro',
        category: 'running-headphones'
    },
    'jabra-elite-8': {
        asin: 'B0CGBXYH3L',
        name: 'Jabra Elite 8 Active',
        category: 'running-headphones'
    },
    'beats-fit-pro': {
        asin: 'B09JL5PC2L',
        name: 'Beats Fit Pro',
        category: 'running-headphones'
    },

    // Nutrition
    'gu-energy-gels': {
        asin: 'B01MY5CW7S',
        name: 'GU Energy Gel Variety Pack',
        category: 'nutrition'
    },
    'maurten-gel-100': {
        asin: 'B0B1MHPWHF',
        name: 'Maurten Gel 100',
        category: 'nutrition'
    },
    'tailwind-nutrition': {
        asin: 'B00EIOXAXM',
        name: 'Tailwind Nutrition Endurance Fuel',
        category: 'nutrition'
    },

    // Yoga & Flexibility
    'manduka-pro-mat': {
        asin: 'B0002TSTSO',
        name: 'Manduka PRO Yoga Mat',
        category: 'yoga'
    },
    'liforme-yoga-mat': {
        asin: 'B01N30OFG9',
        name: 'Liforme Yoga Mat',
        category: 'yoga'
    },
    'gaiam-dry-grip': {
        asin: 'B074DYSL6G',
        name: 'Gaiam Dry-Grip Yoga Mat',
        category: 'yoga'
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
