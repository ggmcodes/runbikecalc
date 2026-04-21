#!/usr/bin/env node
/**
 * Swap generic Backcountry storefront links to deep-product links.
 *
 * Problem: ~400 links on the site point to the legacy generic storefront
 *   https://backcountry.tnu8.net/c/6910798/1107350/5311
 * which bleeds conversions (users land on a category, not a product).
 *
 * This script:
 *   1. Finds every <a> tag whose href is EXACTLY the legacy storefront URL
 *      (no query string). Excludes the footer banner by class signature.
 *   2. Extracts product context from the <a> inner text plus nearby headings/images.
 *   3. Matches against the Backcountry catalog.
 *   4. If matched: rewrites href to a deep product link (campaign 1942899 + prodsku).
 *   5. If not matched: rewrites href to the current storefront (campaign 358742).
 *
 * Modes:
 *   --report-only   Emit CSV of candidates + match results. No writes.
 *   --dry-run       Print proposed swaps. No writes.
 *   --preview       Write scripts/.swap-preview.log. No permanent writes.
 *   (no flag)       Apply swaps in-place.
 */

const fs = require('fs');
const path = require('path');
const {
    loadCatalog,
    buildBackcountryLink,
    buildStorefrontLink,
    normalizeProductName,
    CAMPAIGN
} = require('./backcountry-lib');

const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');

const LEGACY_STOREFRONT_URL = `https://backcountry.tnu8.net/c/6910798/1107350/5311`;

// Banner signature — these <a> tags are the 15%-off footer banner, leave them alone.
const BANNER_CLASS_SIGNATURE = 'inline-block hover:opacity-95';
const BANNER_INNER_HTML_MIN_LENGTH = 500;

const TARGET_BRANDS = [
    'Garmin', 'COROS', 'Suunto', 'Wahoo', 'Polar',
    'Nike', 'Brooks', 'HOKA', 'Altra', 'Saucony', 'Salomon', 'Asics', 'New Balance',
    'Merrell', 'La Sportiva', 'Scarpa', 'ON', 'On Running',
    'Shimano', 'Sidi', 'Giro', 'Lake', 'Specialized', 'SRAM', 'Fizik',
    'Castelli', 'PEARL iZUMi', 'Pearl Izumi', 'Rapha', 'Sportful', 'Assos', 'POC', 'Gore', 'Gore Wear',
    'Oakley', 'Smith', 'Tifosi', 'Goodr', 'Julbo', '100%',
    'Osprey', 'CamelBak', 'Nathan', 'Ultimate Direction', 'Black Diamond',
    'Patagonia', 'The North Face', 'Outdoor Research', 'Arcteryx', "Arc'teryx", 'Columbia',
    'Kask', 'Bell', 'Bontrager', 'POC', 'Lazer', 'Smith Optics',
    'Continental', 'Vittoria', 'Pirelli', 'Panaracer', 'Schwalbe', 'Michelin', 'WTB',
    'Apidura', 'Revelate Designs', 'Ortlieb', 'Topeak', 'Restrap', 'Blackburn',
    'MSR', 'Big Agnes', 'Sea to Summit', 'Therm-a-Rest', 'NEMO', 'Exped',
    'Skratch Labs', 'Nuun', 'Gu', 'Maurten', 'Tailwind', 'Honey Stinger', 'Clif',
    'Hydro Flask', 'Yeti', 'Nalgene',
    'Lezyne', 'NiteRider', 'Knog', 'Light & Motion',    // bike lights
    'Kryptonite', 'Abus', 'OnGuard',                     // bike locks
    'Look', 'Crankbrothers', 'Speedplay', 'Time',        // pedals
    'WTB', 'SQlab', 'Selle Italia', 'Selle San Marco', 'Brooks England'  // saddles
];

const EXCLUDE_PATTERNS = [
    'case', 'mount', 'strap', 'band', 'holder', 'adapter', 'adaptor',
    'charger', 'cable', 'tool kit', 'cleat', 'replacement', 'spare parts'
];

const MANUAL_MAPPINGS = {
    'garmin rally xc200': 'Rally XC Dual-Sided Power Meter Pedals',
    'garmin rally xc100': 'Rally XC Single-Sided Power Meter Pedals',
    'garmin rally rs200': 'Rally RS Dual-Sided Power Meter Pedals',
    'garmin rally rs100': 'Rally RS Single-Sided Power Meter Pedals',
    'garmin rally rk200': 'Rally RK Dual-Sided Power Meter Pedals',
    'garmin rally rk100': 'Rally RK Single-Sided Power Meter Pedals',
    'shimano s-phyre rc9': 'RC903 S-PHYRE Cycling Shoe',
    'shimano rc903': 'RC903 S-PHYRE Cycling Shoe',
    'shimano rc702': 'RC702 Cycling Shoe',
    'shimano rc502': 'RC502 Cycling Shoe',
    'shimano xc502': 'XC502 Mountain Bike Shoe',
    'shimano xc702': 'XC702 Mountain Bike Shoe',
    'garmin edge 1040': 'Edge 1040 Solar GPS Bike Computer',
    'garmin edge 1040 solar': 'Edge 1040 Solar GPS Bike Computer',
    'garmin edge explore 2': 'Edge Explore 2 GPS',
    'hoka speedgoat 6': 'Speedgoat 6 Trail Running Shoe',
    'altra timp 5': 'Timp 5 Trail Running Shoe'
};

// Threshold for keyword-based matching. Since candidates are already filtered to
// the correct brand bucket (productsByBrand), scoring 2 means "brand + ≥1 product-specific keyword"
// which is a safe bar given the -20 penalty for model-number mismatch.
const MIN_MATCH_SCORE = 2;

// ---------------------------------------------------------------------------
// Catalog loading + matching

function loadIndexedCatalog() {
    console.log(`Loading Backcountry catalog (brands: ${TARGET_BRANDS.length})...`);
    const catalog = loadCatalog({ brands: TARGET_BRANDS });
    console.log(`Loaded ${catalog.products.length} products from ${catalog.productsByBrand.size} target brands.`);
    return catalog;
}

function findBackcountryMatch(productName, brand, catalog) {
    const { productsByBrand, productsByName } = catalog;

    const searchName = normalizeProductName(productName);
    const searchBrand = brand ? brand.toLowerCase() : '';
    const searchModel = searchName.match(/\b(\d{3,4})\b/)?.[1] || '';

    if (MANUAL_MAPPINGS[searchName]) {
        const targetName = normalizeProductName(MANUAL_MAPPINGS[searchName]);
        for (const product of productsByName.values()) {
            const parentNorm = normalizeProductName(product.parentName || '');
            if (parentNorm.includes(targetName) || targetName.includes(parentNorm)) {
                return { product, score: 100, reason: 'manual' };
            }
        }
    }

    if (productsByName.has(searchName)) {
        const match = productsByName.get(searchName);
        const nameLower = (match.parentName || match.name).toLowerCase();
        if (!EXCLUDE_PATTERNS.some(p => nameLower.includes(p))) {
            return { product: match, score: 50, reason: 'exact-name' };
        }
    }

    if (searchBrand && productsByBrand.has(searchBrand)) {
        const brandProducts = productsByBrand.get(searchBrand);
        const brandWords = searchBrand.toLowerCase().split(/\s+/);
        const GENERIC_STOPWORDS = new Set([
            'the', 'and', 'for', 'with', 'mens', 'womens', 'unisex',
            'shop', 'buy', 'browse', 'all', 'best', 'top', 'pick', 'new',
            'running', 'cycling', 'bike', 'road', 'trail', 'gravel',
            'gear', 'watch', 'watches', 'shoe', 'shoes', 'pack', 'packs',
            'tool', 'tools', 'light', 'lights', 'lock', 'locks', 'pump', 'pumps',
            'saddle', 'saddles', 'tire', 'tires', 'helmet', 'helmets',
            'glove', 'gloves', 'jersey', 'jerseys', 'short', 'shorts',
            'bottle', 'bottles', 'vest', 'vests', 'computer', 'computers',
            'pedal', 'pedals', 'trainer', 'trainers', 'sunglasses', 'sunglass',
            'clothing', 'apparel', 'accessory', 'accessories'
        ]);
        const keywords = searchName.split(/\s+/).filter(w =>
            w.length > 2 &&
            !GENERIC_STOPWORDS.has(w) &&
            !brandWords.includes(w)
        );
        // Require at least one meaningful keyword; otherwise no reliable deep match.
        if (keywords.length === 0) return null;

        let best = null;
        let bestScore = 0;
        for (const product of brandProducts) {
            const norm = normalizeProductName(product.parentName || product.name);
            const lower = (product.parentName || product.name).toLowerCase();
            if (EXCLUDE_PATTERNS.some(p => lower.includes(p))) continue;

            let score = 0;
            for (const kw of keywords) {
                if (norm.includes(kw)) score += 2;
            }
            const productModel = norm.match(/\b(\d{3,4})\b/)?.[1] || '';
            if (searchModel && productModel) {
                if (searchModel === productModel) score += 10;
                else score -= 20;
            }
            if (score > bestScore) {
                bestScore = score;
                best = product;
            }
        }
        if (best && bestScore >= MIN_MATCH_SCORE) {
            return { product: best, score: bestScore, reason: 'keyword' };
        }
    }

    return null;
}

// ---------------------------------------------------------------------------
// HTML parsing — find generic storefront <a> tags

function findGenericLinks(html) {
    const escaped = LEGACY_STOREFRONT_URL.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    const pattern = new RegExp(
        `<a\\b[^>]*href="${escaped}"[^>]*>([\\s\\S]*?)</a>`,
        'g'
    );

    const results = [];
    let m;
    while ((m = pattern.exec(html)) !== null) {
        const fullMatch = m[0];
        const innerHtml = m[1];
        const openTag = fullMatch.slice(0, fullMatch.indexOf('>') + 1);

        if (openTag.includes(BANNER_CLASS_SIGNATURE)) continue;
        if (innerHtml.length >= BANNER_INNER_HTML_MIN_LENGTH) continue;

        const innerText = innerHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

        results.push({
            fullMatch,
            openTag,
            innerHtml,
            innerText,
            index: m.index,
            before: html.slice(Math.max(0, m.index - 400), m.index),
            after: html.slice(m.index + fullMatch.length, m.index + fullMatch.length + 600)
        });
    }
    return results;
}

// Generic-CTA signals — if the link's inner text is just a category-level shop CTA,
// don't try to force a product match. Let it fall through to storefront-upgrade.
const CATEGORY_CTA_PATTERNS = [
    /\bbrowse\b/i,
    /\bshop all\b/i,
    /\ball\s+(tools|lights|locks|pumps|saddles|shoes|bikes|helmets|gloves|jerseys|tires|shorts|watches|trainers|computers|sunglasses|bottles|vests|packs)/i,
    /\bbike (tools|lights|locks|pumps|saddles|shoes)\b/i
];

function isCategoryCTA(innerText) {
    return CATEGORY_CTA_PATTERNS.some(p => p.test(innerText));
}

// Amazon URLs near the link = strong product-card signal.
// Farther away = probably an old card from earlier in the page — don't trust.
const CLOSE_CONTEXT_CHARS = 250;

function identifyProduct(match) {
    // If the link itself is a category-level CTA, don't attempt a product match.
    if (isCategoryCTA(match.innerText)) return null;

    const candidates = [];

    // 1. Sibling Amazon search URL WITHIN 250 CHARS — high-confidence product-card signal.
    const closeBefore = match.before.slice(-CLOSE_CONTEXT_CHARS);
    const closeAfter = match.after.slice(0, CLOSE_CONTEXT_CHARS);
    const amazonSearchPattern = /amazon\.com\/s\?k=([^"&]+)[^"]*/gi;

    const beforeAmazon = [...closeBefore.matchAll(amazonSearchPattern)];
    if (beforeAmazon.length > 0) {
        const decoded = decodeURIComponent(beforeAmazon[beforeAmazon.length - 1][1].replace(/\+/g, ' '));
        // Skip generic search terms like "road+bike+tires" that are 3+ words of category keywords
        if (!isCategoryCTA(decoded)) candidates.push(decoded);
    }
    const afterAmazon = [...closeAfter.matchAll(amazonSearchPattern)];
    if (afterAmazon.length > 0) {
        const decoded = decodeURIComponent(afterAmazon[0][1].replace(/\+/g, ' '));
        if (!isCategoryCTA(decoded)) candidates.push(decoded);
    }

    // 2. Amazon /dp/ASIN links nearby — at minimum signal a product-card context.
    // (Text candidates below carry the product name.)

    // 3. Nearest preceding <p> with product-name-like class, close to the link.
    const productParaPattern = /<p[^>]*class="[^"]*(?:font-bold|product-name|text-gray-900)[^"]*"[^>]*>([^<]{3,100})<\/p>/gi;
    const paraMatches = [...closeBefore.matchAll(productParaPattern)];
    if (paraMatches.length > 0) {
        candidates.push(paraMatches[paraMatches.length - 1][1].trim());
    }

    // 4. Nearest heading close to the link
    const headingMatches = [...closeBefore.matchAll(/<(h[1-6]|strong)[^>]*>([^<]{3,100})<\/\1>/gi)];
    if (headingMatches.length > 0) {
        candidates.push(headingMatches[headingMatches.length - 1][2].trim());
    }

    // 5. Image alt text close to the link
    const altPattern = /<img[^>]+alt="([^"]{3,120})"/gi;
    const beforeAlt = [...closeBefore.matchAll(altPattern)];
    if (beforeAlt.length > 0) candidates.push(beforeAlt[beforeAlt.length - 1][1].trim());
    const afterAlt = [...closeAfter.matchAll(altPattern)];
    if (afterAlt.length > 0) candidates.push(afterAlt[0][1].trim());

    for (const text of candidates) {
        const lower = text.toLowerCase();
        for (const brand of TARGET_BRANDS) {
            if (lower.includes(brand.toLowerCase())) {
                return { productName: text, brand };
            }
        }
    }
    return null;
}

function extractSlugFromProduct(product) {
    try {
        const url = new URL(product.url);
        const raw = url.searchParams.get('u');
        if (raw) {
            const decoded = decodeURIComponent(raw);
            return decoded.replace(/^https?:\/\/(?:www\.)?backcountry\.com\//, '').replace(/\?.*$/, '');
        }
    } catch (e) { /* fall through */ }
    const parent = product.parentName || product.name;
    return parent.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

// ---------------------------------------------------------------------------
// Per-file processing

function processFile(filePath, catalog) {
    const html = fs.readFileSync(filePath, 'utf8');
    const matches = findGenericLinks(html);
    if (matches.length === 0) return { filePath, swaps: [] };

    const swaps = matches.map(m => {
        const identified = identifyProduct(m);
        let match = null;
        if (identified && identified.brand) {
            match = findBackcountryMatch(identified.productName, identified.brand, catalog);
        }

        let newHref;
        let action;
        if (match) {
            const slug = extractSlugFromProduct(match.product);
            newHref = buildBackcountryLink(match.product.sku, slug);
            action = 'deep-product';
        } else {
            newHref = buildStorefrontLink();
            action = 'storefront-upgrade';
        }

        return {
            fullMatch: m.fullMatch,
            innerText: m.innerText,
            identified,
            match,
            newHref,
            action
        };
    });

    return { filePath, swaps };
}

function applySwapsToHtml(html, swaps) {
    let out = html;
    for (const swap of swaps) {
        const oldHref = `href="${LEGACY_STOREFRONT_URL}"`;
        const newHref = `href="${swap.newHref}"`;
        const newFullMatch = swap.fullMatch.replace(oldHref, newHref);
        out = out.replace(swap.fullMatch, newFullMatch);
    }
    return out;
}

function listCandidateFiles() {
    const files = [];
    const addIfHasLink = (full) => {
        try {
            if (fs.readFileSync(full, 'utf8').includes(LEGACY_STOREFRONT_URL)) {
                files.push(full);
            }
        } catch (e) { /* skip */ }
    };
    for (const f of fs.readdirSync(ROOT)) {
        if (f.endsWith('.html')) addIfHasLink(path.join(ROOT, f));
    }
    for (const f of fs.readdirSync(BLOG_DIR)) {
        if (f.endsWith('.html')) addIfHasLink(path.join(BLOG_DIR, f));
    }
    return files.sort();
}

function csvField(value) {
    const s = String(value ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

// ---------------------------------------------------------------------------
// Main

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const reportOnly = args.includes('--report-only');
    const preview = args.includes('--preview');
    const fileArg = args.indexOf('--file') >= 0 ? args[args.indexOf('--file') + 1] : null;

    const catalog = loadIndexedCatalog();
    const files = fileArg ? [path.resolve(fileArg)] : listCandidateFiles();

    if (reportOnly) {
        process.stdout.write('file,innerText,brand,matchedSku,matchedName,score,action\n');
    }

    let totalLinks = 0;
    let totalDeepProduct = 0;
    let totalStorefrontUpgrade = 0;
    const perFileSummary = [];
    const previewLines = [];

    for (const file of files) {
        const { swaps } = processFile(file, catalog);
        if (swaps.length === 0) continue;
        totalLinks += swaps.length;

        for (const swap of swaps) {
            if (swap.action === 'deep-product') totalDeepProduct++;
            else totalStorefrontUpgrade++;

            if (reportOnly) {
                const row = [
                    path.relative(ROOT, file),
                    swap.innerText || '',
                    swap.identified?.brand || '',
                    swap.match?.product.sku || '',
                    swap.match?.product.parentName || swap.match?.product.name || '',
                    swap.match?.score || 0,
                    swap.action
                ].map(csvField).join(',');
                process.stdout.write(row + '\n');
            }
        }

        perFileSummary.push({
            file: path.relative(ROOT, file),
            swaps: swaps.length,
            deep: swaps.filter(s => s.action === 'deep-product').length,
            storefront: swaps.filter(s => s.action === 'storefront-upgrade').length
        });

        if (preview) {
            previewLines.push('');
            previewLines.push('='.repeat(80));
            previewLines.push(`FILE: ${path.relative(ROOT, file)}  (${swaps.length} swaps)`);
            previewLines.push('='.repeat(80));
            for (const s of swaps) {
                previewLines.push('');
                previewLines.push(`[${s.action}]  inner="${s.innerText}"  brand=${s.identified?.brand || '?'}`);
                if (s.match) {
                    previewLines.push(`  matched: ${s.match.product.parentName || s.match.product.name} (sku=${s.match.product.sku}, score=${s.match.score})`);
                }
                previewLines.push(`  OLD: ${LEGACY_STOREFRONT_URL}`);
                previewLines.push(`  NEW: ${s.newHref}`);
            }
        } else if (!reportOnly && !dryRun) {
            const html = fs.readFileSync(file, 'utf8');
            const updated = applySwapsToHtml(html, swaps);
            fs.writeFileSync(file, updated, 'utf8');
        } else if (dryRun) {
            console.log(`\n${path.relative(ROOT, file)} (${swaps.length} swaps)`);
            for (const s of swaps) {
                const tag = s.action === 'deep-product' ? '→DEEP' : '→STOREFRONT';
                console.log(`  ${tag} "${s.innerText}" [${s.identified?.brand || '?'}] ${s.match ? `-> ${s.match.product.parentName} (score=${s.match.score})` : '-> (no match)'}`);
            }
        }
    }

    if (preview) {
        const previewPath = path.join(__dirname, '.swap-preview.log');
        fs.writeFileSync(previewPath, previewLines.join('\n'), 'utf8');
        console.log(`\nPreview written to ${path.relative(ROOT, previewPath)} (${previewLines.length} lines)`);
    }

    if (reportOnly) return;

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files with generic storefront links: ${perFileSummary.length}`);
    console.log(`Total links to swap: ${totalLinks}`);
    console.log(`  -> Deep product (campaign ${CAMPAIGN.DEEP_PRODUCT}): ${totalDeepProduct}`);
    console.log(`  -> Storefront upgrade (campaign ${CAMPAIGN.PROMO_15_OFF} — 15% off promo): ${totalStorefrontUpgrade}`);
    if (dryRun) console.log('\n*** DRY RUN — no files modified ***');
    else if (preview) console.log(`\n*** PREVIEW — no files modified ***`);
    else console.log(`\n${totalLinks} links swapped across ${perFileSummary.length} files.`);
}

if (require.main === module) main();
