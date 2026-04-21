/**
 * Backcountry Library — shared helpers for link building, catalog loading, and image URLs.
 * Used by: swap-backcountry-links.js, product-card.js, generate-summer-guides.js
 *
 * Campaign IDs (Impact network, publisher 6910798):
 *   LEGACY_STOREFRONT   1107350  (deprecated generic storefront — the "bleed")
 *   DEEP_PRODUCT        1942899  (product-level deep links — use whenever possible)
 *   CURRENT_STOREFRONT   358742  (current default storefront — for unmatched survivors)
 */

const fs = require('fs');
const path = require('path');

const PUBLISHER_ID = '6910798';
const ZONE_ID = '5311';
const CAMPAIGN = {
    LEGACY_STOREFRONT: '1107350',     // deprecated — the "bleed" (no query string)
    DEEP_PRODUCT: '1942899',          // product-level deep links with ?prodsku=XXX&u=[url]
    CURRENT_STOREFRONT: '358742',     // general storefront (non-promotional)
    PROMO_15_OFF: '3496483'           // 15% off order — preferred for promotional CTAs
};
const DEFAULT_INTSRC = 'CATF_15689';

const DEFAULT_FEED_PATH = path.join(__dirname, '../data/backcountry-products.txt');

/**
 * Build a deep product affiliate link.
 * @param {string} sku - Backcountry SKU (col 0)
 * @param {string} productSlugOrUrl - Either a path like "hoka-speedgoat-6-trail-running-shoe-mens"
 *                                     or a full URL like "https://www.backcountry.com/hoka-..."
 * @param {string} [intsrc] - Impact source parameter
 */
function buildBackcountryLink(sku, productSlugOrUrl, intsrc = DEFAULT_INTSRC) {
    let productUrl;
    if (productSlugOrUrl.startsWith('http')) {
        productUrl = productSlugOrUrl;
    } else {
        const slug = productSlugOrUrl.replace(/^\//, '');
        productUrl = `https://www.backcountry.com/${slug}`;
    }
    return `https://backcountry.tnu8.net/c/${PUBLISHER_ID}/${CAMPAIGN.DEEP_PRODUCT}/${ZONE_ID}?prodsku=${encodeURIComponent(sku)}&u=${encodeURIComponent(productUrl)}&intsrc=${encodeURIComponent(intsrc)}`;
}

/**
 * General storefront link. Defaults to the 15% off promo since the user's
 * existing footer banner already advertises "15% off first order" — keeps
 * messaging and link aligned.
 */
function buildStorefrontLink({ promo = true } = {}) {
    const campaign = promo ? CAMPAIGN.PROMO_15_OFF : CAMPAIGN.CURRENT_STOREFRONT;
    return `https://backcountry.tnu8.net/c/${PUBLISHER_ID}/${campaign}/${ZONE_ID}`;
}

/**
 * Given a catalog product record, return the best available image URL.
 * Falls back through col 3 → cols 36-40.
 */
function buildBackcountryImageUrl(product) {
    if (product.imageUrl && product.imageUrl.startsWith('http')) return product.imageUrl;
    for (const alt of (product.altImages || [])) {
        if (alt && alt.startsWith('http')) return alt;
    }
    return null;
}

/**
 * Build an Amazon search link with the runbikecalc affiliate tag.
 */
function buildAmazonSearchLink(productName, tag = 'runbikecalc-20') {
    const query = encodeURIComponent(productName.replace(/\s+/g, ' ').trim());
    return `https://www.amazon.com/s?k=${query}&tag=${tag}`;
}

/**
 * Load the Backcountry TSV catalog.
 *
 * @param {object} opts
 * @param {string[]} [opts.brands] - Only include products matching these manufacturers (case-insensitive)
 * @param {string[]} [opts.nameIncludes] - Only include products whose name contains any of these substrings
 * @param {string[]} [opts.nameExcludes] - Exclude products whose name contains any of these substrings
 * @param {boolean} [opts.inStockOnly=true] - Skip out-of-stock items
 * @param {number} [opts.limit] - Cap on total products returned
 * @param {string} [opts.feedPath] - Override default feed path
 * @returns {{ products: Product[], productsByBrand: Map, productsByName: Map }}
 */
function loadCatalog(opts = {}) {
    const {
        brands,
        nameIncludes,
        nameExcludes,
        inStockOnly = true,
        limit,
        feedPath = DEFAULT_FEED_PATH
    } = opts;

    const brandsLower = brands ? brands.map(b => b.toLowerCase()) : null;
    const nameIncludesLower = nameIncludes ? nameIncludes.map(s => s.toLowerCase()) : null;
    const nameExcludesLower = nameExcludes ? nameExcludes.map(s => s.toLowerCase()) : null;

    const content = fs.readFileSync(feedPath, 'utf8');
    const lines = content.split('\n');

    const products = [];
    const productsByBrand = new Map();
    const productsByName = new Map();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const cols = line.split('\t');
        if (cols.length < 22) continue;

        const inStock = cols[5] === 'Y';
        if (inStockOnly && !inStock) continue;

        const manufacturer = (cols[15] || '').trim();
        if (brandsLower && !brandsLower.includes(manufacturer.toLowerCase())) continue;

        const name = cols[1] || '';
        const parentName = cols[21] || '';
        // Filter against parent name primarily (product category), falling back to full name.
        // This prevents color/variant strings like "Silicone Band" from excluding a PACE 3 watch.
        const filterTarget = (parentName || name).toLowerCase();
        if (nameIncludesLower && !nameIncludesLower.some(s => filterTarget.includes(s))) continue;
        if (nameExcludesLower && nameExcludesLower.some(s => filterTarget.includes(s))) continue;

        const product = {
            sku: cols[0],
            name,
            url: cols[2],
            imageUrl: cols[3],
            price: cols[4],
            inStock,
            manufacturer,
            productType: cols[17] || '',
            category: cols[18] || '',
            parentSku: cols[20] || '',
            parentName,
            bullets: [cols[34], cols[35], cols[36], cols[37], cols[38]].filter(b => b && b.trim()),
            altImages: [cols[39], cols[40], cols[41], cols[42], cols[43]].filter(img => img && img.startsWith('http'))
        };

        products.push(product);

        const brandKey = manufacturer.toLowerCase();
        if (!productsByBrand.has(brandKey)) productsByBrand.set(brandKey, []);
        productsByBrand.get(brandKey).push(product);

        if (product.parentName) {
            const nameKey = normalizeProductName(product.parentName);
            if (!productsByName.has(nameKey)) productsByName.set(nameKey, product);
        }
        const prodNameKey = normalizeProductName(getBaseProductName(product.name));
        if (!productsByName.has(prodNameKey)) productsByName.set(prodNameKey, product);

        if (limit && products.length >= limit) break;
    }

    return { products, productsByBrand, productsByName };
}

function normalizeProductName(name) {
    return (name || '')
        .toLowerCase()
        .replace(/['']/g, "'")
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s'-]/g, '')
        .trim();
}

function getBaseProductName(fullName) {
    return (fullName || '')
        .replace(/,?\s*(men's|women's|unisex)/gi, '')
        .replace(/,?\s*\d+(\.\d+)?\s*(mm|cm|m|"|inch|size)?$/gi, '')
        .replace(/,?\s*(black|white|grey|gray|blue|red|green|navy|charcoal|orange|yellow|silver|gold|purple|pink|brown|tan|beige)[\s,]*$/gi, '')
        .replace(/,?\s*[SML]$/gi, '')
        .replace(/,?\s*(small|medium|large|x-?large|xx-?large)$/gi, '')
        .trim();
}

/**
 * Pick one representative product per parent SKU (collapses color/size variants).
 * Useful when building gear guides where you want unique products, not every variant.
 */
function dedupeByParent(products) {
    const seen = new Set();
    const out = [];
    for (const p of products) {
        const key = p.parentSku || p.parentName || p.sku;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(p);
    }
    return out;
}

module.exports = {
    PUBLISHER_ID,
    ZONE_ID,
    CAMPAIGN,
    DEFAULT_INTSRC,
    DEFAULT_FEED_PATH,
    buildBackcountryLink,
    buildStorefrontLink,
    buildBackcountryImageUrl,
    buildAmazonSearchLink,
    loadCatalog,
    normalizeProductName,
    getBaseProductName,
    dedupeByParent
};
