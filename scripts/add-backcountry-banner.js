#!/usr/bin/env node
/**
 * Add Backcountry Banner to Blog Footers
 *
 * Adds the 15% off promotional banner to the footer of blog pages
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');

// Backcountry banner HTML
const backcountryBanner = `
            <!-- Backcountry Partner Banner -->
            <div class="mt-8 mb-4 text-center">
                <a rel="sponsored" href="https://backcountry.tnu8.net/c/6910798/1107350/5311" target="_blank" id="1107350" class="inline-block hover:opacity-90 transition-opacity">
                    <img src="//a.impactradius-go.com/display-ad/5311-1107350" border="0" alt="15% Off Your First Order at Backcountry" width="728" height="90" class="max-w-full h-auto"/>
                </a>
                <img height="0" width="0" src="https://backcountry.tnu8.net/i/6910798/1107350/5311" style="position:absolute;visibility:hidden;" border="0" />
            </div>`;

// Target blog files (gear guides that benefit from Backcountry)
const targetFiles = [
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
];

function addBannerToFile(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');

    // Check if banner already exists
    if (html.includes('backcountry.tnu8.net/c/6910798/1107350/5311')) {
        console.log(`  Banner already exists in ${path.basename(filePath)}`);
        return false;
    }

    // Find the footer and add banner before it
    const footerMatch = html.match(/(<footer[^>]*>[\s\S]*?<div[^>]*>)/);
    if (footerMatch) {
        const insertPoint = footerMatch.index + footerMatch[0].length;
        html = html.slice(0, insertPoint) + backcountryBanner + html.slice(insertPoint);
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`  Added banner to ${path.basename(filePath)}`);
        return true;
    }

    console.log(`  Could not find footer in ${path.basename(filePath)}`);
    return false;
}

console.log('Adding Backcountry banner to blog pages...\n');

let addedCount = 0;
for (const file of targetFiles) {
    const filePath = path.join(blogDir, file);
    if (fs.existsSync(filePath)) {
        if (addBannerToFile(filePath)) {
            addedCount++;
        }
    } else {
        console.log(`  File not found: ${file}`);
    }
}

console.log(`\nDone. Added banner to ${addedCount} files.`);
