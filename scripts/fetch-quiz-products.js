#!/usr/bin/env node
/**
 * Fetch Amazon Product Data for Quiz Product Finders
 *
 * Reads all 4 quiz JSON files, collects ASINs, calls PA-API,
 * and updates each JSON file with direct product URLs and image URLs.
 *
 * Usage:
 *   node scripts/fetch-quiz-products.js
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { fetchProductImages, loadConfig } = require('../lib/amazon-paapi');

const DATA_DIR = path.join(__dirname, '../data');

const QUIZ_FILES = [
    'spin-bikes.json',
    'treadmills.json',
    'rowers.json',
    'racks.json'
];

async function main() {
    console.log('='.repeat(60));
    console.log('Quiz Product Fetcher - Amazon PA-API');
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

    // Step 1: Read all quiz JSON files and collect ASINs
    const quizData = {};
    const asinMap = {}; // asin -> [{ file, type, index }]

    for (const file of QUIZ_FILES) {
        const filePath = path.join(DATA_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        quizData[file] = data;

        // Collect ASINs from products
        (data.products || []).forEach((product, idx) => {
            if (product.asin) {
                if (!asinMap[product.asin]) asinMap[product.asin] = [];
                asinMap[product.asin].push({ file, type: 'products', index: idx });
            }
        });

        // Collect ASINs from accessories
        (data.accessories || []).forEach((accessory, idx) => {
            if (accessory.asin) {
                if (!asinMap[accessory.asin]) asinMap[accessory.asin] = [];
                asinMap[accessory.asin].push({ file, type: 'accessories', index: idx });
            }
        });
    }

    const allAsins = Object.keys(asinMap);
    console.log(`\nFound ${allAsins.length} unique ASINs across ${QUIZ_FILES.length} quiz files.\n`);

    if (allAsins.length === 0) {
        console.log('No ASINs found. Add "asin" fields to quiz JSON files first.');
        process.exit(0);
    }

    // Step 2: Fetch product data from PA-API
    let imageData;
    try {
        imageData = await fetchProductImages(allAsins, config);
    } catch (error) {
        console.error('Error fetching from PA-API:', error.message);
        process.exit(1);
    }

    // Step 3: Update each quiz JSON file with fetched data
    let totalUpdated = 0;
    let totalImages = 0;
    let totalMissing = 0;

    for (const [asin, locations] of Object.entries(asinMap)) {
        const amazonData = imageData[asin];

        for (const loc of locations) {
            const item = quizData[loc.file][loc.type][loc.index];

            if (amazonData) {
                // Update with direct product URL
                item.amazonUrl = amazonData.url || `https://www.amazon.com/dp/${asin}?tag=${config.partnerTag}`;

                // Update image URLs
                if (amazonData.image) {
                    item.imageUrl = amazonData.image;
                    totalImages++;
                }
                if (amazonData.imageMedium) {
                    item.imageMedium = amazonData.imageMedium;
                }

                totalUpdated++;
            } else {
                // Ensure direct product URL even without API data
                item.amazonUrl = `https://www.amazon.com/dp/${asin}?tag=${config.partnerTag}`;
                totalMissing++;
                console.warn(`  Missing PA-API data for: ${item.name} (${asin})`);
            }
        }
    }

    // Step 4: Write updated JSON files back to disk
    for (const file of QUIZ_FILES) {
        const filePath = path.join(DATA_DIR, file);
        fs.writeFileSync(filePath, JSON.stringify(quizData[file], null, 2) + '\n');
        console.log(`  Updated: ${file}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log(`  Total ASINs: ${allAsins.length}`);
    console.log(`  Products updated: ${totalUpdated}`);
    console.log(`  Images found: ${totalImages}`);
    console.log(`  Missing from API: ${totalMissing}`);
    console.log('='.repeat(60));
}

main();
