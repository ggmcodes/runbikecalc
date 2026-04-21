#!/usr/bin/env node
/**
 * Product Card Renderer — generates HTML snippets for Backcountry products.
 *
 * Three card variants:
 *   1. renderProductCard(product, opts) — full long-form card
 *   2. renderProductGridCard(product, opts) — compact hero-grid card
 *   3. renderItemListJsonLd(products, pageUrl) — schema.org ItemList for SEO
 *
 * All cards use:
 *   - Hotlinked Backcountry CDN images (or manufacturer images via opts.imageUrl override)
 *   - Dual CTAs by default: "Shop at Backcountry" (yellow) + "Check on Amazon" (gray)
 *   - opts.amazonOnly=true renders only Amazon CTA (no Backcountry button) for products not in BC catalog
 *   - rel="noopener sponsored" on affiliate links
 *   - Lazy-loaded images
 *
 * CLI preview: node scripts/product-card.js --sku=HOKZ08L-GAGRHOBL-S130
 */

const {
    buildBackcountryLink,
    buildAmazonSearchLink,
    buildBackcountryImageUrl,
    loadCatalog
} = require('./backcountry-lib');

const COLOR_THEMES = {
    green:  { bg: 'from-green-50 to-white',  border: 'border-green-200',  badgeBg: 'bg-green-600',   priceText: 'text-green-600',   gridBorder: 'border-green-500',   heroBg: 'from-green-600 to-green-700' },
    emerald:{ bg: 'from-emerald-50 to-white',border: 'border-emerald-200',badgeBg: 'bg-emerald-600', priceText: 'text-emerald-600', gridBorder: 'border-emerald-500', heroBg: 'from-emerald-600 to-green-700' },
    blue:   { bg: 'from-blue-50 to-white',   border: 'border-blue-200',   badgeBg: 'bg-blue-600',    priceText: 'text-blue-600',    gridBorder: 'border-blue-500',    heroBg: 'from-blue-600 to-indigo-700' },
    purple: { bg: 'from-purple-50 to-white', border: 'border-purple-200', badgeBg: 'bg-purple-600',  priceText: 'text-purple-600',  gridBorder: 'border-purple-500',  heroBg: 'from-purple-600 to-pink-700' },
    orange: { bg: 'from-orange-50 to-white', border: 'border-orange-200', badgeBg: 'bg-orange-600',  priceText: 'text-orange-600',  gridBorder: 'border-orange-500',  heroBg: 'from-orange-500 to-red-600' },
    amber:  { bg: 'from-amber-50 to-white',  border: 'border-amber-200',  badgeBg: 'bg-amber-600',   priceText: 'text-amber-600',   gridBorder: 'border-amber-500',   heroBg: 'from-amber-500 to-orange-600' },
    sky:    { bg: 'from-sky-50 to-white',    border: 'border-sky-200',    badgeBg: 'bg-sky-600',     priceText: 'text-sky-600',     gridBorder: 'border-sky-500',     heroBg: 'from-sky-500 to-blue-600' },
    rose:   { bg: 'from-rose-50 to-white',   border: 'border-rose-200',   badgeBg: 'bg-rose-600',    priceText: 'text-rose-600',    gridBorder: 'border-rose-500',    heroBg: 'from-rose-500 to-pink-600' },
    gray:   { bg: 'from-gray-50 to-white',   border: 'border-gray-200',   badgeBg: 'bg-gray-600',    priceText: 'text-gray-700',    gridBorder: 'border-gray-400',    heroBg: 'from-gray-600 to-gray-800' }
};

function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function displayName(product) {
    const base = product.parentName || product.name || '';
    return base.replace(/\s*-\s*(Men's|Women's|Unisex)$/i, '').trim();
}

function formatPrice(price) {
    if (!price) return '';
    const n = parseFloat(price);
    if (isNaN(n)) return `$${price}`;
    return `$${Math.round(n)}`;
}

/**
 * Full product card — image left, details right, dual CTAs (or Amazon-only).
 *
 * @param {object|null} product - Catalog record. May be null for fully-synthetic Amazon-only cards.
 * @param {object} opts
 *   - color: theme key
 *   - badge: badge label
 *   - title: override product display name (e.g., 'Nuun Sport' instead of 'Sport - 8-Pack')
 *   - description: paragraph below title
 *   - bullets: array of bullet strings
 *   - rating: e.g. '4.7/5'
 *   - reviewCount: e.g. '2,100+'
 *   - imageUrl: override catalog image URL (for manufacturer-hotlinked non-BC products)
 *   - amazonOnly: true → only "Check on Amazon" CTA (no Backcountry button)
 *   - price: override (e.g. '$45') — useful for Amazon-only products without catalog record
 *   - amazonSearchTerm: override the Amazon search term if different from title
 *   - guideLink: { href, label } → optional tertiary "Read Full Guide →" CTA
 */
function renderProductCard(product, opts = {}) {
    const {
        color = 'green',
        badge,
        description,
        bullets,
        rating,
        reviewCount,
        title,
        imageUrl: imageUrlOverride,
        amazonOnly = false,
        price: priceOverride,
        amazonSearchTerm,
        guideLink
    } = opts;

    const theme = COLOR_THEMES[color] || COLOR_THEMES.green;
    const imageUrl = imageUrlOverride || (product ? buildBackcountryImageUrl(product) : null);
    if (!imageUrl) return ''; // skip cards without images

    const name = title || (product ? displayName(product) : '');
    if (!name) return '';

    const bcUrl = amazonOnly
        ? null
        : (product ? (product.url || buildBackcountryLink(product.sku, product.parentSku ? product.parentSku.toLowerCase() : '')) : null);
    const amzUrl = buildAmazonSearchLink(amazonSearchTerm || name);
    const price = priceOverride || (product ? formatPrice(product.price) : '');

    // Primary link wrapping the image — Backcountry if available, else Amazon
    const primaryUrl = bcUrl || amzUrl;

    const bulletList = Array.isArray(bullets) && bullets.length
        ? bullets.map(b => `                            <li>✓ ${escapeHtml(b)}</li>`).join('\n')
        : (product && product.bullets && product.bullets.length
            ? product.bullets.slice(0, 4).map(b => `                            <li>✓ ${escapeHtml(b)}</li>`).join('\n')
            : '');

    const ratingBlock = rating
        ? `                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-yellow-500">★★★★★</span>
                            <span class="text-gray-600 text-sm">${escapeHtml(rating)}${reviewCount ? ` (${escapeHtml(reviewCount)} reviews)` : ''}</span>
                        </div>`
        : '';

    const bcButton = bcUrl
        ? `                            <a href="${escapeHtml(bcUrl)}" target="_blank" rel="noopener sponsored" class="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition shadow-sm">Shop at Backcountry (15% off first order)</a>`
        : '';
    const amazonButtonClass = amazonOnly
        ? 'bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-lg transition shadow-sm'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-5 rounded-lg border border-gray-300 transition';
    const amazonButton = `                            <a href="${escapeHtml(amzUrl)}" target="_blank" rel="noopener sponsored" class="inline-block ${amazonButtonClass}">${amazonOnly ? 'Check Price on Amazon' : 'Check on Amazon'}</a>`;
    const guideLinkBlock = guideLink && guideLink.href
        ? `\n                        <div class="mt-3"><a href="${escapeHtml(guideLink.href)}" class="text-sm text-blue-600 hover:text-blue-800 underline font-medium">${escapeHtml(guideLink.label || 'Read Full Guide →')}</a></div>`
        : '';

    return `            <div class="bg-gradient-to-r ${theme.bg} border-2 ${theme.border} rounded-xl p-6 my-8">
                <div class="flex flex-col lg:flex-row gap-6">
                    <a href="${escapeHtml(primaryUrl)}" target="_blank" rel="noopener sponsored" class="flex-shrink-0 mx-auto lg:mx-0">
                        <img loading="lazy" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" class="w-48 h-48 object-contain bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition">
                    </a>
                    <div class="flex-1">
${badge ? `                        <span class="inline-block ${theme.badgeBg} text-white text-xs font-bold px-3 py-1 rounded-full mb-2">${escapeHtml(badge)}</span>` : ''}
                        <h3 class="text-2xl font-bold text-gray-900 mb-2">${escapeHtml(name)}</h3>
${ratingBlock}
${description ? `                        <p class="text-gray-600 mb-4">${escapeHtml(description)}</p>` : ''}
${bulletList ? `                        <ul class="text-sm text-gray-600 mb-4 space-y-1">\n${bulletList}\n                        </ul>` : ''}
                        <div class="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
${price ? `                            <span class="text-3xl font-bold ${theme.priceText}">${price}</span>` : ''}
${bcButton}
${amazonButton}
                        </div>${guideLinkBlock}
                    </div>
                </div>
            </div>`;
}

/**
 * Compact grid card for hero "Our Top Picks" sections.
 *
 * @param {object|null} product
 * @param {object} opts
 *   - color, badge, title, imageUrl, amazonOnly, price, amazonSearchTerm, guideLink
 */
function renderProductGridCard(product, opts = {}) {
    const {
        color = 'green',
        badge,
        title,
        imageUrl: imageUrlOverride,
        amazonOnly = false,
        price: priceOverride,
        amazonSearchTerm,
        guideLink
    } = opts;
    const theme = COLOR_THEMES[color] || COLOR_THEMES.green;
    const imageUrl = imageUrlOverride || (product ? buildBackcountryImageUrl(product) : null);
    if (!imageUrl) return '';

    const name = title || (product ? displayName(product) : '');
    if (!name) return '';

    const bcUrl = amazonOnly
        ? null
        : (product ? (product.url || buildBackcountryLink(product.sku, '')) : null);
    const amzUrl = buildAmazonSearchLink(amazonSearchTerm || name);
    const url = bcUrl || amzUrl;
    const price = priceOverride || (product ? formatPrice(product.price) : '');

    const guideLinkBlock = guideLink && guideLink.href
        ? `\n                        <p class="mt-2 text-xs"><a href="${escapeHtml(guideLink.href)}" class="text-blue-600 hover:text-blue-800 underline">${escapeHtml(guideLink.label || 'Read Full Guide →')}</a></p>`
        : '';

    return `                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener sponsored" class="bg-white rounded-xl p-4 text-center hover:shadow-xl transition group">
                        <img loading="lazy" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" class="w-28 h-28 mx-auto object-contain mb-2 group-hover:scale-105 transition">
${badge ? `                        <span class="inline-block ${theme.badgeBg} text-white text-xs font-bold px-2 py-1 rounded mb-1">${escapeHtml(badge)}</span>` : ''}
                        <p class="text-gray-900 font-bold text-sm">${escapeHtml(name)}</p>
${price ? `                        <p class="${theme.priceText} font-bold">${price}</p>` : ''}${guideLinkBlock}
                    </a>`;
}

/**
 * Wrap a set of grid cards in the hero container.
 */
function renderHeroGrid(cards, opts = {}) {
    const { title = 'Our Top Picks', color = 'emerald', badges = [], cardColors = [] } = opts;
    const theme = COLOR_THEMES[color] || COLOR_THEMES.emerald;
    // Accept either product objects (old signature) or per-card option objects (new signature).
    const rendered = cards.slice(0, 5).map((c, i) => {
        if (c && c.product !== undefined) {
            // Each item is { product, opts }
            return renderProductGridCard(c.product, { ...(c.opts || {}), badge: (c.opts && c.opts.badge) || badges[i], color: (c.opts && c.opts.color) || cardColors[i] || color });
        }
        // Back-compat: item is a product object
        return renderProductGridCard(c, { badge: badges[i], color: cardColors[i] || color });
    }).filter(Boolean).join('\n');

    const count = cards.length >= 5 ? 5 : (cards.length >= 4 ? 4 : 3);
    const gridClass = count === 5 ? 'grid-cols-2 md:grid-cols-5' : count === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';

    return `            <!-- Top Picks Hero Grid -->
            <div class="bg-gradient-to-br ${theme.heroBg} rounded-2xl p-6 mb-8 text-white">
                <h2 class="text-2xl font-bold mb-4 text-center">${escapeHtml(title)}</h2>
                <div class="grid ${gridClass} gap-4">
${rendered}
                </div>
            </div>`;
}

/**
 * Schema.org ItemList JSON-LD for SEO.
 * Accepts catalog products OR card configs with synthetic fields.
 */
function renderItemListJsonLd(products, pageUrl) {
    const items = products.map((p, i) => {
        // If this is a card config with override fields, use those
        const name = p.title || displayName(p);
        const bcUrl = p.url || (p.sku ? buildBackcountryLink(p.sku, '') : null);
        const amzUrl = buildAmazonSearchLink(p.amazonSearchTerm || name);
        const url = p.amazonOnly ? amzUrl : (bcUrl || amzUrl);
        const imageUrl = p.imageUrl || (p.sku ? buildBackcountryImageUrl(p) : null);
        const brand = p.brand || p.manufacturer;
        const priceStr = p.price ? String(parseFloat(p.price) || p.price).replace(/^\$/, '') : null;
        return {
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'Product',
                name,
                ...(imageUrl ? { image: imageUrl } : {}),
                url,
                ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
                ...(priceStr ? {
                    offers: {
                        '@type': 'Offer',
                        price: priceStr,
                        priceCurrency: 'USD',
                        availability: 'https://schema.org/InStock',
                        url
                    }
                } : {})
            }
        };
    });

    const ld = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        ...(pageUrl ? { url: pageUrl } : {}),
        itemListElement: items
    };

    return `    <script type="application/ld+json">\n${JSON.stringify(ld, null, 4).split('\n').map(l => '    ' + l).join('\n')}\n    </script>`;
}

// ---------------------------------------------------------------------------
// CLI preview

function cli() {
    const args = process.argv.slice(2);
    const skuIdx = args.indexOf('--sku');
    if (skuIdx < 0) {
        console.error('Usage: node scripts/product-card.js --sku <SKU>');
        process.exit(1);
    }
    const targetSku = args[skuIdx + 1];
    const catalog = loadCatalog({});
    const product = catalog.products.find(p => p.sku === targetSku || p.parentSku === targetSku);
    if (!product) {
        console.error(`No product found with sku/parentSku = ${targetSku}`);
        process.exit(1);
    }
    console.log('=== Product card ===');
    console.log(renderProductCard(product, {
        color: 'green',
        badge: 'TOP PICK',
        description: (product.parentName || product.name) + ' — preview from catalog.',
        rating: '4.5/5'
    }));
    console.log('\n=== Amazon-only card (no BC) ===');
    console.log(renderProductCard(null, {
        color: 'amber',
        badge: 'TOP PICK',
        title: 'LMNT Electrolyte Drink Mix',
        imageUrl: 'https://drinklmnt.com/cdn/shop/files/LMNT-Drink-Mix-Citrus.png',
        amazonOnly: true,
        price: '$45',
        description: 'Industry gold standard — 1000mg sodium per serving.',
        bullets: ['1000mg sodium', '200mg potassium', 'Zero sugar', 'Four flavor lineup'],
        rating: '4.8/5',
        reviewCount: '12,000+'
    }));
    console.log('\n=== JSON-LD ===');
    console.log(renderItemListJsonLd([product], 'https://runbikecalc.com/blog/test-page'));
}

if (require.main === module) cli();

module.exports = {
    renderProductCard,
    renderProductGridCard,
    renderHeroGrid,
    renderItemListJsonLd,
    COLOR_THEMES,
    escapeHtml,
    displayName,
    formatPrice
};
