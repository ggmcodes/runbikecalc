/**
 * Guide page renderer.
 *
 * Given a config object (title, cards, sections, faqs, related...), emits a
 * complete HTML gear guide page modeled on best-trail-running-shoes-2026.html
 * and best-cycling-jerseys-hot-weather-2026.html.
 *
 * Supports mixed Backcountry + Amazon-only cards:
 *   - Cards with `product` (catalog record) render BC deep links + BC CDN images + dual CTAs
 *   - Cards with `amazonOnly: true` + `imageUrl` render manufacturer-hotlinked images + Amazon-only CTA
 *
 * The caller shape:
 *   {
 *     slug, title, h1, metaDescription, keywords, tagline, intro, tldr,
 *     heroTitle, heroColor, category, dateModified,
 *     cards: [
 *       { product, color, badge, title, description, bullets, rating, reviewCount, bestFor },  // BC card
 *       { amazonOnly: true, brand, title, imageUrl, price, color, badge, description,
 *         bullets, rating, reviewCount, bestFor, amazonSearchTerm }                            // Amazon-only card
 *     ],
 *     sections: [{ heading, html }],
 *     faqs: [{ q, a }],
 *     related: [{ href, label, blurb }]
 *   }
 */

const {
    buildBackcountryLink,
    buildBackcountryImageUrl,
    buildAmazonSearchLink
} = require('./backcountry-lib');
const {
    renderProductCard,
    renderProductGridCard,
    renderItemListJsonLd,
    escapeHtml
} = require('./product-card');

function renderFaq(faqs) {
    return faqs.map(f => `
                <div class="bg-white rounded-lg shadow p-6 mb-4">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">${escapeHtml(f.q)}</h3>
                    <p class="text-gray-700">${f.a}</p>
                </div>`).join('');
}

function renderFaqJsonLd(faqs) {
    const items = faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') }
    }));
    return `    <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items }, null, 4).split('\n').map(l => '    ' + l).join('\n')}\n    </script>`;
}

function renderRelatedGuides(links, { title = 'Related Guides' } = {}) {
    return `
            <!-- Related Guides -->
            <div class="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 p-6 my-12 rounded-r-lg">
                <h2 class="text-2xl font-bold text-emerald-900 mb-4">${escapeHtml(title)}</h2>
                <ul class="space-y-2">
${links.map(l => `                    <li><a href="${escapeHtml(l.href)}" class="text-emerald-700 hover:text-emerald-900 underline font-medium">${escapeHtml(l.label)}</a> — ${escapeHtml(l.blurb)}</li>`).join('\n')}
                </ul>
            </div>`;
}

// Comparison table that handles both BC products and Amazon-only cards
function renderComparisonTable(cards) {
    const rows = cards.map((c, i) => {
        const p = c.product;
        const name = c.title || (p ? (p.parentName || p.name) : c.brand || 'Unknown');
        let price;
        if (c.price) price = c.price.startsWith('$') ? c.price : `$${c.price}`;
        else if (p && p.price) price = `$${Math.round(parseFloat(p.price))}`;
        else price = '—';

        let shopUrl;
        if (c.amazonOnly) {
            shopUrl = buildAmazonSearchLink(c.amazonSearchTerm || name);
        } else if (p) {
            shopUrl = p.url || buildBackcountryLink(p.sku, '');
        } else {
            shopUrl = buildAmazonSearchLink(name);
        }

        const shopLabel = c.amazonOnly ? 'Amazon →' : 'Shop →';
        const shopClass = c.amazonOnly
            ? 'text-orange-600 hover:text-orange-800 font-semibold'
            : 'text-yellow-600 hover:text-yellow-800 font-semibold';

        return `                        <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                            <td class="px-4 py-3 text-sm text-gray-900 font-medium">${escapeHtml(name)}</td>
                            <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(c.bestFor || '—')}</td>
                            <td class="px-4 py-3 text-sm text-gray-900 font-bold">${price}</td>
                            <td class="px-4 py-3 text-sm"><a href="${escapeHtml(shopUrl)}" target="_blank" rel="noopener sponsored" class="${shopClass}">${shopLabel}</a></td>
                        </tr>`;
    }).join('\n');

    return `
            <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-6">Quick Comparison Table</h2>
            <div class="overflow-x-auto mb-8">
                <table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Best For</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Buy</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
${rows}
                    </tbody>
                </table>
            </div>`;
}

// Render hero grid from a set of cards (BC or Amazon-only)
function renderHeroGridFromCards(cards, { title = 'Our Top Picks for 2026', color = 'emerald' } = {}) {
    const heroCards = cards.slice(0, 5);
    const rendered = heroCards.map(c => {
        return renderProductGridCard(c.product || null, {
            color: c.color,
            badge: c.badge,
            title: c.title,
            imageUrl: c.imageUrl,
            amazonOnly: c.amazonOnly,
            price: c.price,
            amazonSearchTerm: c.amazonSearchTerm
        });
    }).filter(Boolean).join('\n');

    const gridClass = heroCards.length >= 5 ? 'grid-cols-2 md:grid-cols-5' : heroCards.length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';
    const heroThemes = {
        emerald: 'from-emerald-600 to-green-700',
        blue: 'from-blue-600 to-indigo-700',
        purple: 'from-purple-600 to-pink-700',
        orange: 'from-orange-500 to-red-600',
        amber: 'from-amber-500 to-orange-600',
        sky: 'from-sky-500 to-blue-600',
        green: 'from-green-600 to-green-700',
        rose: 'from-rose-500 to-pink-600'
    };
    const heroBg = heroThemes[color] || heroThemes.emerald;

    return `            <!-- Top Picks Hero Grid -->
            <div class="bg-gradient-to-br ${heroBg} rounded-2xl p-6 mb-8 text-white">
                <h2 class="text-2xl font-bold mb-4 text-center">${escapeHtml(title)}</h2>
                <div class="grid ${gridClass} gap-4">
${rendered}
                </div>
            </div>`;
}

// ItemList JSON-LD that handles both BC products and Amazon-only cards
function renderItemListJsonLdFromCards(cards, pageUrl) {
    const items = cards.map((c, i) => {
        const p = c.product;
        const name = c.title || (p ? (p.parentName || p.name) : c.brand);
        const imageUrl = c.imageUrl || (p ? buildBackcountryImageUrl(p) : null);
        const brand = c.brand || (p ? p.manufacturer : null);
        let url, priceStr;
        if (c.amazonOnly) {
            url = buildAmazonSearchLink(c.amazonSearchTerm || name);
            priceStr = c.price ? String(c.price).replace(/^\$/, '') : null;
        } else if (p) {
            url = p.url || buildBackcountryLink(p.sku, '');
            priceStr = p.price ? String(parseFloat(p.price) || p.price) : null;
        } else {
            url = buildAmazonSearchLink(name);
            priceStr = c.price ? String(c.price).replace(/^\$/, '') : null;
        }
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

/**
 * Render a complete gear guide HTML page from a config.
 * @returns {string} Full HTML document
 */
function renderGuide(config) {
    const {
        slug,
        title,
        h1,
        metaDescription,
        keywords,
        tagline,
        intro,
        cards = [],
        heroTitle = 'Our Top Picks for 2026',
        heroColor = 'emerald',
        tldr,
        sections,
        faqs,
        related,
        relatedTitle = 'Related Guides',
        category,
        breadcrumbLabel, // used in breadcrumb + header; defaults to category
        categoryEyebrow = 'Gear Guide',
        dateModified = '2026-04-21',
        readMinutes
    } = config;

    const url = `https://runbikecalc.com/blog/${slug}`;
    const breadcrumb = breadcrumbLabel || category;
    const readTime = readMinutes || (cards.length * 2 + 5);

    const heroGrid = renderHeroGridFromCards(cards, { title: heroTitle, color: heroColor });

    const cardHtml = cards.map(c => renderProductCard(c.product || null, {
        color: c.color,
        badge: c.badge,
        title: c.title,
        description: c.description,
        bullets: c.bullets,
        rating: c.rating,
        reviewCount: c.reviewCount,
        imageUrl: c.imageUrl,
        amazonOnly: c.amazonOnly,
        price: c.price,
        amazonSearchTerm: c.amazonSearchTerm
    })).filter(Boolean).join('\n\n');

    const comparisonTable = cards.length >= 2 ? renderComparisonTable(cards) : '';
    const faqSection = faqs && faqs.length ? `
            <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-6">Frequently Asked Questions</h2>
${renderFaq(faqs)}` : '';

    const sectionsHtml = (sections || []).map(s => `
            <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-6">${escapeHtml(s.heading)}</h2>
            ${s.html}`).join('\n');

    const itemListLd = renderItemListJsonLdFromCards(cards, url);
    const faqLd = faqs && faqs.length ? renderFaqJsonLd(faqs) : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-78BHZZG6CN"></script>
    <script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-78BHZZG6CN');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${url}">
    <meta name="description" content="${escapeHtml(metaDescription)}">
    <meta name="keywords" content="${escapeHtml(keywords)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(metaDescription)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="icon" type="image/svg+xml" href="../images/favicon.svg">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${escapeHtml(h1)}",
        "description": "${escapeHtml(metaDescription)}",
        "author": {"@type": "Person", "name": "Glen", "description": "Endurance athlete and gear enthusiast"},
        "publisher": {"@type": "Organization", "name": "RunBikeCalc"},
        "datePublished": "${dateModified}",
        "dateModified": "${dateModified}"
    }
    </script>
${itemListLd}
${faqLd}
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://runbikecalc.com/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://runbikecalc.com/blog"},
            {"@type": "ListItem", "position": 3, "name": "${escapeHtml(breadcrumb)}"}
        ]
    }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/fonts.css">
    <link rel="stylesheet" href="/css/conversion-popup.css">
    <link rel="stylesheet" href="/css/sticky-banner.css">
    <link rel="stylesheet" href="/css/inline-cta.css">
</head>
<body class="bg-gray-50">
    <nav class="site-nav">
        <div class="nav-container">
            <a href="/" class="site-logo">RunBikeCalc</a>
            <div class="nav-links">
                <a href="/premium-training-plans" class="nav-link">Plans<span class="new-badge">NEW</span></a>
                <a href="/running-tools" class="nav-link">Running</a>
                <a href="/cycling-tools" class="nav-link">Cycling</a>
                <a href="/heart-rate-tools" class="nav-link">Heart Rate</a>
                <a href="/2026-top-picks" class="nav-link nav-link-red">2026 Picks</a>
                <a href="/blog" class="nav-link">Journal</a>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <a href="/premium-training-plans" class="nav-cta">Start Training</a>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
        <nav class="text-sm mb-6">
            <ol class="list-none p-0 inline-flex">
                <li class="flex items-center"><a href="../index" class="text-blue-600 hover:text-blue-800">Home</a></li>
                <li class="flex items-center mx-2"><svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg></li>
                <li class="flex items-center"><a href="../blog" class="text-blue-600 hover:text-blue-800">Blog</a></li>
                <li class="flex items-center mx-2"><svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg></li>
                <li class="text-gray-500">${escapeHtml(breadcrumb)}</li>
            </ol>
        </nav>

        <article class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <header class="mb-8">
                <p class="text-blue-600 font-medium mb-2"><a href="../blog" class="hover:underline">Blog</a> / ${escapeHtml(categoryEyebrow)}</p>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">${escapeHtml(h1)}</h1>
                <p class="text-xl text-gray-600 mb-4">${tagline}</p>
                <div class="flex items-center text-sm text-gray-500">
                    <time datetime="${dateModified}">Updated ${new Date(dateModified + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</time>
                    <span class="mx-2">•</span>
                    <span>${readTime} min read</span>
                    <span class="mx-2">•</span>
                    <span>By Glen</span>
                </div>
            </header>

            <div class="prose prose-lg max-w-none">

${heroGrid}

                ${tldr ? `<div class="bg-green-50 border-l-4 border-green-500 p-6 mb-8 rounded-r-lg">
                    <h2 class="text-xl font-bold text-green-800 mb-3">TL;DR: Our Verdict</h2>
                    <p class="text-gray-700">${tldr}</p>
                </div>` : ''}

                <div class="text-lg text-gray-700 mb-8 leading-relaxed">${intro}</div>

${cardHtml}

${comparisonTable}

${sectionsHtml}

${faqSection}

${related ? renderRelatedGuides(related, { title: relatedTitle }) : ''}

            </div>
        </article>
    </div>

    <script src="/js/main.js"></script>
</body>
</html>
`;
}

module.exports = {
    renderGuide,
    renderFaq,
    renderFaqJsonLd,
    renderRelatedGuides,
    renderComparisonTable,
    renderHeroGridFromCards,
    renderItemListJsonLdFromCards
};
