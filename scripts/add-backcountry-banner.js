#!/usr/bin/env node
/**
 * Add Backcountry Banner to Blog Footers
 *
 * Adds the 15% off promotional banner to the footer of blog pages
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');

// Backcountry banner HTML (custom HTML/CSS - no external ad server images)
const backcountryBanner = `
            <!-- Backcountry Partner Banner -->
            <div class="mb-8">
                <a rel="sponsored" href="https://backcountry.tnu8.net/c/6910798/1107350/5311" target="_blank" class="inline-block hover:opacity-95 transition-opacity">
                    <div class="flex items-center justify-between max-w-[728px] mx-auto h-[90px] rounded-lg overflow-hidden shadow-lg" style="background: linear-gradient(90deg, #f5f5f5 0%, #f5f5f5 25%, rgba(245,245,245,0.9) 40%, rgba(200,210,220,0.85) 100%), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 728 90%22><defs><linearGradient id=%22sky%22 x1=%220%25%22 y1=%220%25%22 x2=%220%25%22 y2=%22100%25%22><stop offset=%220%25%22 style=%22stop-color:%23d1d5db%22/><stop offset=%22100%25%22 style=%22stop-color:%23e5e7eb%22/></linearGradient></defs><rect fill=%22url(%23sky)%22 width=%22728%22 height=%2290%22/><path d=%22M400,90 L450,40 L500,65 L550,30 L600,55 L650,25 L700,50 L728,35 L728,90 Z%22 fill=%22%234b5563%22 opacity=%220.3%22/><path d=%22M500,90 L550,50 L600,70 L650,45 L700,60 L728,50 L728,90 Z%22 fill=%22%23374151%22 opacity=%220.4%22/></svg>'); background-size: cover;">
                        <!-- Logo Section -->
                        <div class="flex items-center px-6 h-full bg-gray-100" style="min-width: 180px;">
                            <svg class="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="#1a1a1a">
                                <path d="M12 2C10.5 2 9.2 3.1 9 4.5L7 8H5C3.9 8 3 8.9 3 10V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V10C21 8.9 20.1 8 19 8H17L15 4.5C14.8 3.1 13.5 2 12 2ZM12 4C12.8 4 13.5 4.6 13.6 5.4L15 8H9L10.4 5.4C10.5 4.6 11.2 4 12 4ZM12 11C14.2 11 16 12.8 16 15C16 17.2 14.2 19 12 19C9.8 19 8 17.2 8 15C8 12.8 9.8 11 12 11Z"/>
                            </svg>
                            <span class="text-xl font-semibold text-gray-900 tracking-tight">Backcountry</span>
                        </div>
                        <!-- Offer Text -->
                        <div class="flex-1 px-4 text-left">
                            <div class="text-xl font-bold text-gray-900">15% Off Your Entire First Order</div>
                            <div class="text-sm text-gray-600">New Customer Offer</div>
                        </div>
                        <!-- CTA Button -->
                        <div class="px-6">
                            <span class="inline-block px-6 py-2 bg-white text-gray-900 font-semibold text-sm rounded border border-gray-300 hover:bg-gray-50 transition-colors">Shop Now</span>
                        </div>
                    </div>
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
