#!/usr/bin/env node
/**
 * Product Card Renderer — generates HTML snippets for Backcountry products.
 *
 * Three card variants:
 *   1. renderProductCard(product, opts) — full long-form card (matches best-trail-running-shoes-2026.html:261-287)
 *   2. renderProductGridCard(product, opts) — compact hero-grid card (lines 230-236 pattern)
 *   3. renderItemListJsonLd(products, pageUrl) — schema.org ItemList for SEO
 *
 * All cards use:
 *   - Hotlinked Backcountry CDN images
 *   - Dual CTAs: "Shop at Backcountry" (yellow, primary) + "Check on Amazon" (gray, fallback)
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
    rose:   { bg: 'from-rose-50 to-white',   border: 'border-rose-200',   badgeBg: 'bg-rose-600',    priceText: 'text-rose-600',    gridBorder: 'border-rose-500',    heroBg: 'from-rose-500 to-pink-600' }
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
 * Full product card — image left, details right, dual CTAs.
 */
function renderProductCard(product, opts = {}) {
    const {
        color = 'green',
        badge,
        description,
        bullets,
        rating,
        reviewCount,
        title   // override the auto-generated display name (e.g., "Nuun Sport" instead of "Sport - 8-Pack")
    } = opts;

    const theme = COLOR_THEMES[color] || COLOR_THEMES.green;
    const imageUrl = buildBackcountryImageUrl(product);
    if (!imageUrl) return ''; // skip cards without images

    const bcUrl = product.url || buildBackcountryLink(product.sku, product.parentSku ? product.parentSku.toLowerCase() : '');
    const name = title || displayName(product);
    const amzUrl = buildAmazonSearchLink(name);
    const price = formatPrice(product.price);

    const bulletList = Array.isArray(bullets) && bullets.length
        ? bullets.map(b => `                            <li>✓ ${escapeHtml(b)}</li>`).join('\n')
        : (product.bullets && product.bullets.length
            ? product.bullets.slice(0, 4).map(b => `                            <li>✓ ${escapeHtml(b)}</li>`).join('\n')
            : '');

    const ratingBlock = rating
        ? `                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-yellow-500">★★★★★</span>
                            <span class="text-gray-600 text-sm">${escapeHtml(rating)}${reviewCount ? ` (${escapeHtml(reviewCount)} reviews)` : ''}</span>
                        </div>`
        : '';

    return `            <div class="bg-gradient-to-r ${theme.bg} border-2 ${theme.border} rounded-xl p-6 my-8">
                <div class="flex flex-col lg:flex-row gap-6">
                    <a href="${escapeHtml(bcUrl)}" target="_blank" rel="noopener sponsored" class="flex-shrink-0 mx-auto lg:mx-0">
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
                            <a href="${escapeHtml(bcUrl)}" target="_blank" rel="noopener sponsored" class="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition shadow-sm">Shop at Backcountry (15% off first order)</a>
                            <a href="${escapeHtml(amzUrl)}" target="_blank" rel="noopener sponsored" class="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-5 rounded-lg border border-gray-300 transition">Check on Amazon</a>
                        </div>
                    </div>
                </div>
            </div>`;
}

/**
 * Compact grid card for hero "Our Top Picks" sections.
 */
function renderProductGridCard(product, opts = {}) {
    const { color = 'green', badge } = opts;
    const theme = COLOR_THEMES[color] || COLOR_THEMES.green;
    const imageUrl = buildBackcountryImageUrl(product);
    if (!imageUrl) return '';

    const bcUrl = product.url || buildBackcountryLink(product.sku, '');
    const name = displayName(product);
    const price = formatPrice(product.price);

    return `                    <a href="${escapeHtml(bcUrl)}" target="_blank" rel="noopener sponsored" class="bg-white rounded-xl p-4 text-center hover:shadow-xl transition group">
                        <img loading="lazy" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" class="w-28 h-28 mx-auto object-contain mb-2 group-hover:scale-105 transition">
${badge ? `                        <span class="inline-block ${theme.badgeBg} text-white text-xs font-bold px-2 py-1 rounded mb-1">${escapeHtml(badge)}</span>` : ''}
                        <p class="text-gray-900 font-bold text-sm">${escapeHtml(name)}</p>
${price ? `                        <p class="${theme.priceText} font-bold">${price}</p>` : ''}
                    </a>`;
}

/**
 * Wrap a set of grid cards in the hero container.
 */
function renderHeroGrid(products, opts = {}) {
    const { title = 'Our Top Picks', color = 'emerald', badges = [], cardColors = [] } = opts;
    const theme = COLOR_THEMES[color] || COLOR_THEMES.emerald;
    const cards = products.slice(0, 3).map((p, i) =>
        renderProductGridCard(p, { badge: badges[i], color: cardColors[i] || color })
    ).filter(Boolean).join('\n');

    return `            <!-- Top Picks Hero Grid -->
            <div class="bg-gradient-to-br ${theme.heroBg} rounded-2xl p-6 mb-8 text-white">
                <h2 class="text-2xl font-bold mb-4 text-center">${escapeHtml(title)}</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
${cards}
                </div>
            </div>`;
}

/**
 * Schema.org ItemList JSON-LD for SEO.
 */
function renderItemListJsonLd(products, pageUrl) {
    const items = products.map((p, i) => {
        const name = displayName(p);
        const bcUrl = p.url || buildBackcountryLink(p.sku, '');
        const imageUrl = buildBackcountryImageUrl(p);
        return {
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'Product',
                name,
                ...(imageUrl ? { image: imageUrl } : {}),
                url: bcUrl,
                ...(p.manufacturer ? { brand: { '@type': 'Brand', name: p.manufacturer } } : {}),
                ...(p.price ? {
                    offers: {
                        '@type': 'Offer',
                        price: String(parseFloat(p.price) || p.price),
                        priceCurrency: 'USD',
                        availability: 'https://schema.org/InStock',
                        url: bcUrl
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
    console.log('');
    console.log('=== Grid card ===');
    console.log(renderProductGridCard(product, { color: 'blue', badge: 'TOP PICK' }));
    console.log('');
    console.log('=== JSON-LD ===');
    console.log(renderItemListJsonLd([product], 'https://runbikecalc.com/blog/test-page'));
}

if (require.main === module) cli();

module.exports = {
    renderProductCard,
    renderProductGridCard,
    renderHeroGrid,
    renderItemListJsonLd,
    COLOR_THEMES
};
