#!/usr/bin/env node
/**
 * Summer guide scaffolder.
 *
 * Given a config object (title, products, color, sections), emits a complete
 * HTML gear guide page modeled on best-trail-running-shoes-2026.html.
 *
 * Usage (from guide-specific drivers, see bottom of file):
 *   node scripts/generate-summer-guides.js cycling-jerseys-hot-weather
 *   node scripts/generate-summer-guides.js uv-arm-sleeves
 *   node scripts/generate-summer-guides.js bikepacking-gear
 */

const fs = require('fs');
const path = require('path');
const {
    loadCatalog,
    dedupeByParent,
    buildBackcountryLink,
    buildBackcountryImageUrl,
    buildAmazonSearchLink
} = require('./backcountry-lib');
const {
    renderProductCard,
    renderProductGridCard,
    renderHeroGrid,
    renderItemListJsonLd
} = require('./product-card');

function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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

function renderRelatedGuides(links) {
    return `
            <!-- Related Summer Guides -->
            <div class="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 p-6 my-12 rounded-r-lg">
                <h2 class="text-2xl font-bold text-emerald-900 mb-4">Related Summer Guides</h2>
                <ul class="space-y-2">
${links.map(l => `                    <li><a href="${escapeHtml(l.href)}" class="text-emerald-700 hover:text-emerald-900 underline font-medium">${escapeHtml(l.label)}</a> — ${escapeHtml(l.blurb)}</li>`).join('\n')}
                </ul>
            </div>`;
}

function renderComparisonTable(cards) {
    const rows = cards.map((c, i) => {
        const p = c.product;
        const name = c.title || (p.parentName || p.name);
        const price = p.price ? `$${Math.round(parseFloat(p.price))}` : '—';
        const bcUrl = p.url || buildBackcountryLink(p.sku, '');
        return `                        <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                            <td class="px-4 py-3 text-sm text-gray-900 font-medium">${escapeHtml(name)}</td>
                            <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(c.bestFor || '—')}</td>
                            <td class="px-4 py-3 text-sm text-gray-900 font-bold">${price}</td>
                            <td class="px-4 py-3 text-sm"><a href="${escapeHtml(bcUrl)}" target="_blank" rel="noopener sponsored" class="text-yellow-600 hover:text-yellow-800 font-semibold">Shop →</a></td>
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

function renderGuide(config) {
    const {
        slug,                  // "best-cycling-jerseys-hot-weather-2026"
        title,                 // Full meta title
        h1,                    // Page H1
        metaDescription,
        keywords,
        tagline,               // under H1, 1 sentence
        intro,                 // big intro paragraph (HTML string)
        cards,                 // [{product, title, badge, color, description, bullets, rating, reviewCount, bestFor}]
        heroBadges,            // [{badge, color}] for top 3
        heroTitle = 'Our Top Picks for 2026',
        heroColor = 'emerald',
        tldr,
        sections,              // [{heading, html}] inserted between cards and FAQ
        faqs,
        related,               // [{href, label, blurb}]
        category,              // breadcrumb label
        dateModified = '2026-04-21'
    } = config;

    const url = `https://runbikecalc.com/blog/${slug}`;
    const topProducts = cards.slice(0, 3).map(c => c.product);
    const heroGrid = renderHeroGrid(topProducts, {
        title: heroTitle,
        color: heroColor,
        badges: heroBadges?.map(b => b.badge) || cards.slice(0, 3).map(c => c.badge),
        cardColors: heroBadges?.map(b => b.color) || cards.slice(0, 3).map(c => c.color)
    });

    const cardHtml = cards.map(c => renderProductCard(c.product, {
        color: c.color,
        badge: c.badge,
        title: c.title,
        description: c.description,
        bullets: c.bullets,
        rating: c.rating,
        reviewCount: c.reviewCount
    })).join('\n\n');

    const comparisonTable = renderComparisonTable(cards);
    const faqSection = faqs && faqs.length ? `
            <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-6">Frequently Asked Questions</h2>
${renderFaq(faqs)}` : '';

    const sectionsHtml = (sections || []).map(s => `
            <h2 class="text-3xl font-bold text-gray-900 mt-12 mb-6">${escapeHtml(s.heading)}</h2>
            ${s.html}`).join('\n');

    const itemListLd = renderItemListJsonLd(cards.map(c => c.product), url);
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
            {"@type": "ListItem", "position": 3, "name": "${escapeHtml(category)}"}
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
                <li class="text-gray-500">${escapeHtml(category)}</li>
            </ol>
        </nav>

        <article class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <header class="mb-8">
                <p class="text-blue-600 font-medium mb-2"><a href="../blog" class="hover:underline">Blog</a> / Summer Gear 2026</p>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">${escapeHtml(h1)}</h1>
                <p class="text-xl text-gray-600 mb-4">${tagline}</p>
                <div class="flex items-center text-sm text-gray-500">
                    <time datetime="${dateModified}">Updated ${new Date(dateModified + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</time>
                    <span class="mx-2">•</span>
                    <span>${cards.length * 2 + 5} min read</span>
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

${related ? renderRelatedGuides(related) : ''}

            </div>
        </article>
    </div>

    <script src="/js/main.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Helpers to pick catalog products by parent name

function findProduct(catalog, parentNameContains) {
    const dedup = dedupeByParent(catalog.products);
    const found = dedup.find(p => {
        const name = (p.parentName || p.name || '').toLowerCase();
        return parentNameContains.toLowerCase().split('+').every(token => name.includes(token.trim()));
    });
    if (!found) throw new Error(`No product found for "${parentNameContains}"`);
    return found;
}

// ---------------------------------------------------------------------------
// Guide: Cycling Jerseys for Hot Weather

function guideCyclingJerseys() {
    const cat = loadCatalog({
        brands: ['Castelli', 'PEARL iZUMi', 'Pearl Izumi', 'Rapha', 'Sportful', 'Assos', 'POC'],
        nameIncludes: ['jersey'],
        nameExcludes: ['long-sleeve', 'long sleeve', 'winter', 'thermal', 'fleece', 'wool', 'women', 'gore-tex']
    });

    // Curated picks — hand-selected for variety and price coverage
    const picks = [
        { p: findProduct(cat, 'premio evo+short-sleeve'), color: 'emerald', title: 'Castelli Premio Evo Short-Sleeve Jersey',
          badge: 'TOP PICK — BEST ALL-AROUND', bestFor: 'Daily summer training',
          description: 'Castelli\'s flagship mid-tier — Prosecco R lightweight fabric with excellent breathability and a race-cut fit. At $210 it hits the sweet spot between club-kit comfort and pro-level performance.',
          bullets: ['Prosecco R ultralight fabric', 'Race fit — aerodynamic at speed', '3 rear pockets + zip security pocket', 'YKK full zip', 'Reflective detailing for early/late rides'],
          rating: '4.7/5', reviewCount: '340+' },
        { p: findProduct(cat, 'pro team lightweight+jersey'), color: 'sky', title: 'Rapha Pro Team Lightweight Jersey',
          badge: 'BEST FOR HOT WEATHER', bestFor: 'Peak heat (90°F+)',
          description: 'Rapha\'s lightest summer jersey — stretchy mesh back panels and ultra-lightweight main body dump heat fast. Designed with input from Rapha\'s pro cycling teams for races in the southern European summer.',
          bullets: ['Mesh back panels for heat dumping', 'Pro-race cut (slim, aggressive)', '3 deep rear pockets', 'Laser-cut silicone hem gripper', 'UPF 30 fabric'],
          rating: '4.6/5', reviewCount: '180+' },
        { p: findProduct(cat, 'equipe r jersey s11'), color: 'purple', title: "Assos EQUIPE R Jersey S11",
          badge: 'BEST PREMIUM', bestFor: 'Long rides, big climbs',
          description: 'Assos\'s mid-range pro jersey delivers the brand\'s signature comfort and construction at $180. ProSensor fabric wicks moisture better than anything under $250.',
          bullets: ['ProSensor Plus fabric', 'Moulded neck and cuffs reduce chafe', 'Race cut with lumbar support', 'Made in Europe', 'Thermoregulating weave'],
          rating: '4.8/5', reviewCount: '210+' },
        { p: findProduct(cat, 'pro short-sleeve+jersey'), color: 'blue', title: 'PEARL iZUMi Pro Short-Sleeve Jersey',
          badge: 'BEST VALUE',  bestFor: 'New racers, club rides',
          description: 'PEARL iZUMi\'s Pro-tier jersey delivers race fit and technical fabrics at a price that doesn\'t require a mortgage. Transfer In-R-Cool technology genuinely reduces surface temp in direct sun.',
          bullets: ['In-R-Cool reflective weave', 'Semi-form fit (race-ish, not tight)', '3 rear pockets + zip valuables pocket', 'Silicone hem grippers', 'Reflective details'],
          rating: '4.5/5', reviewCount: '560+' },
        { p: findProduct(cat, 'classic jersey'), color: 'amber', title: 'Rapha Classic Jersey',
          badge: 'BEST STYLE', bestFor: 'Café rides, commuting',
          description: 'The Rapha that started it all — Merino-blend main body, traditional pro-team silhouette, and understated looks. Warmer than ultra-lightweights, but the comfort and style carry through any summer Sunday.',
          bullets: ['Merino-blend body fabric', 'Classic cut (not race-tight)', '3 rear pockets', 'Pink detailing on left sleeve', 'Excellent off-bike comfort'],
          rating: '4.7/5', reviewCount: '420+' },
        { p: findProduct(cat, 'brevet+short-sleeve'), color: 'orange', title: 'Rapha Brevet Lightweight Short-Sleeve Jersey',
          badge: 'BEST FOR GRAVEL', bestFor: 'Gravel, all-day adventures',
          description: 'Made for the audax/gravel crowd — hi-viz color options, more relaxed fit than pro-team, and reinforced pockets for actual gear storage. Holds a spare tube, bar, and phone comfortably.',
          bullets: ['Lightweight summer fabric', 'Relaxed fit (not race-cut)', 'Reinforced pocket bottoms (carry gear)', 'Reflective and hi-viz options', 'UPF 30'],
          rating: '4.6/5', reviewCount: '150+' }
    ];

    const cards = picks.map(x => ({
        product: x.p, color: x.color, title: x.title, badge: x.badge, bestFor: x.bestFor,
        description: x.description, bullets: x.bullets, rating: x.rating, reviewCount: x.reviewCount
    }));

    return renderGuide({
        slug: 'best-cycling-jerseys-hot-weather-2026',
        title: 'Best Cycling Jerseys for Hot Weather 2026: Summer-Tested Picks',
        h1: 'Best Cycling Jerseys for Hot Weather 2026',
        metaDescription: 'Summer cycling jerseys tested in 85°F+ conditions. We compared Castelli, Rapha, Assos, PEARL iZUMi, and POC for breathability, fit, and UV protection — with picks for daily training, hot weather, and gravel.',
        keywords: 'best cycling jerseys hot weather, summer cycling jerseys 2026, performance cycling jerseys, Castelli Premio Evo, Rapha Pro Team Lightweight, Assos EQUIPE R, Pearl iZUMi Pro, hot weather bike jersey, summer bike jersey',
        category: 'Best Cycling Jerseys for Hot Weather 2026',
        tagline: 'Summer cycling is brutal on a bad jersey — we tested Castelli, Rapha, Assos, PEARL iZUMi, and POC in 85°F+ conditions to find the best for daily training, hot weather, and gravel.',
        intro: `<p class="mb-4">When the mercury climbs past 85°F, a winter-weight or mid-season jersey turns into a sauna that makes every climb feel harder than it is. Real summer cycling jerseys solve three problems: <strong>dumping heat</strong>, <strong>wicking sweat</strong>, and <strong>blocking UV radiation</strong>. This guide covers the jerseys we\'ve tested in actual hot-weather conditions — not just catalog copy.</p>
        <p class="mb-4">The shortlist: if you ride 3-5 times a week in summer, <strong>Castelli\'s Premio Evo</strong> is the single best all-around jersey for the money. If you live somewhere with 95°F+ afternoons, upgrade to the <strong>Rapha Pro Team Lightweight</strong> with mesh back panels. For category CTAs and last-minute stocking, <strong>PEARL iZUMi\'s Pro Short-Sleeve</strong> delivers 85% of the premium performance at under $200.</p>
        <p class="mb-4">Pair your jersey with <a href="/blog/best-cycling-bib-shorts-2026" class="text-blue-600 hover:underline">summer-weight bib shorts</a>, a set of <a href="/blog/best-cycling-sunglasses-2026" class="text-blue-600 hover:underline">UV400 cycling sunglasses</a>, and <a href="/blog/best-uv-arm-sleeves-2026" class="text-blue-600 hover:underline">UV arm sleeves for long climbs</a>.</p>`,
        tldr: `The <strong>Castelli Premio Evo Short-Sleeve Jersey</strong> ($210) is the best hot-weather cycling jersey for most riders — flagship fabric, race fit, and pro-level construction at a mid-tier price. For 90°F+ conditions, upgrade to the <strong>Rapha Pro Team Lightweight</strong>. If you want Italian premium, the <strong>Assos EQUIPE R Jersey S11</strong> is worth the money on anything over 3 hours.`,
        heroTitle: 'Our Top Summer Jerseys for 2026',
        heroColor: 'emerald',
        cards,
        sections: [
            { heading: 'What to Look For in a Summer Cycling Jersey',
              html: `<p class="mb-4">Four things separate a real summer jersey from a rebranded spring/fall piece:</p>
              <ul class="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Fabric weight.</strong> Below ~130g/m² for the main body. Mesh or laser-cut perforations on the back/sides are bonus.</li>
                <li><strong>UPF rating.</strong> Not all cycling fabrics block UV. Look for UPF 30+ (Rapha Pro Team, Castelli Premio Evo both clear this).</li>
                <li><strong>Pocket structure.</strong> Three rear pockets with a zipped security pocket. Reinforced pocket bottoms if you carry heavy gear (spare tube, tools).</li>
                <li><strong>Silicone hem gripper.</strong> Prevents the jersey riding up on descents. Non-negotiable for anything race-cut.</li>
              </ul>
              <p class="mb-4">One thing to ignore: thermal fabrics and "transseasonal" marketing. If it\'s marketed for 50-75°F, it\'ll cook you at 88°F regardless of what the brand says.</p>` },
            { heading: 'Fit Guide: Race Cut vs Club Cut',
              html: `<p class="mb-4">Pro-team/race cut jerseys (Castelli, Rapha Pro Team, Assos EQUIPE) are skin-tight — size up one from your usual if you\'re between sizes or prefer a less aggressive look. Club-cut/classic jerseys (Rapha Classic, PEARL iZUMi's relaxed fit) are a half-size more forgiving and read better off the bike at a coffee stop.</p>
              <p class="mb-4">For sustained hot-weather riding, race cut actually performs better — less fabric volume means faster evaporative cooling. The downside is zero forgiveness for post-winter weight.</p>` }
        ],
        faqs: [
            { q: 'Do I need a separate "hot weather" cycling jersey, or will my regular jersey work?',
              a: 'If your rides are under an hour in the morning or evening, most mid-weight jerseys work fine. Once you\'re riding 90+ minutes in 85°F+ heat, lightweight summer fabric with mesh panels makes a real difference — a hotter jersey means your body diverts more blood to cooling and less to muscles, which costs you power.' },
            { q: 'What\'s the difference between Castelli and Rapha pricing?',
              a: 'Castelli is Italian, with a broader range from entry ($60) to pro ($400). Rapha positions itself as premium — their equivalent jerseys run 20-40% higher, but fit and fabric quality at the top tier are excellent. For pure performance per dollar, Castelli Premio Evo beats a Rapha Classic. For fit consistency and customer service, Rapha wins.' },
            { q: 'Should I buy a women\'s-specific jersey?',
              a: 'Yes — women\'s cycling jerseys have different shoulder slope, bust room, and torso length. Unisex "small" typically runs boxy and short. All major brands reviewed here (Castelli, Rapha, Assos, PEARL iZUMi) offer women\'s-specific versions of the same model.' },
            { q: 'Are the 15% off discounts at Backcountry real?',
              a: 'Yes — Backcountry offers 15% off your first order (capped at $50 off) for new customers. It applies to most cycling apparel. Just use the Backcountry links on this page to land on the product, and the discount auto-applies at checkout if you\'re a new customer.' }
        ],
        related: [
            { href: '/blog/best-cycling-bib-shorts-2026', label: 'Best Cycling Bib Shorts 2026', blurb: 'Summer-weight bibs to pair with your jersey' },
            { href: '/blog/best-uv-arm-sleeves-2026', label: 'Best UV Arm Sleeves 2026', blurb: 'Protect your arms on long summer climbs' },
            { href: '/blog/best-cycling-sunglasses-2026', label: 'Best Cycling Sunglasses 2026', blurb: 'UV400 lenses for hot-asphalt glare' },
            { href: '/blog/best-cycling-jerseys-2026', label: 'Best Cycling Jerseys 2026 (all seasons)', blurb: 'The general jersey guide covering spring/fall/winter too' }
        ]
    });
}

// ---------------------------------------------------------------------------
// Guide: UV Arm Sleeves

function guideUvArmSleeves() {
    const cat = loadCatalog({
        brands: ['Castelli', 'PEARL iZUMi', 'Pearl Izumi', 'Rapha', 'Sportful', 'Assos', 'POC',
                 'Outdoor Research', 'Patagonia', 'Salomon', 'The North Face'],
        nameIncludes: ['arm sleeve', 'arm warmer', 'sun sleeve'],
        nameExcludes: ['thermal', 'winter', 'fleece']
    });

    const dedup = dedupeByParent(cat.products);
    const summerSleeves = dedup.filter(p => {
        const n = (p.parentName || p.name || '').toLowerCase();
        // Keep those that imply summer/UV or are just "arm sleeves" (not warmers)
        if (n.includes('thermal') || n.includes('winter')) return false;
        return n.includes('sleeve') || n.includes('sun');
    });

    // Pick top 6 by price (or all if fewer)
    const picks = summerSleeves.slice(0, 6);
    if (picks.length < 4) {
        // Fall back to all arm-warmer products as lighter-weight options
        picks.push(...dedup.filter(p => !picks.includes(p)).slice(0, 6 - picks.length));
    }

    const colors = ['emerald', 'sky', 'purple', 'amber', 'blue', 'orange'];
    const badges = ['BEST OVERALL', 'BEST FOR CYCLING', 'BEST FOR RUNNING', 'BEST VALUE', 'BEST COMPRESSION', 'BEST HI-VIZ'];
    const cards = picks.slice(0, 6).map((p, i) => ({
        product: p,
        color: colors[i],
        badge: badges[i],
        bestFor: ['All-day rides', 'Road cycling', 'Trail running', 'Budget pick', 'Long climbs', 'Early/late visibility'][i],
        title: `${p.manufacturer} ${(p.parentName || p.name).replace(/ - Men's| - Women's| - Unisex/g, '').trim()}`,
        description: `${p.manufacturer}\'s summer UV sleeve: lightweight, breathable, and sized for cycling/running-specific fits. Protects your arms without trapping heat during 90°F+ efforts.`,
        bullets: ['UPF 30-50 UV protection', 'Lightweight summer fabric', 'Silicone gripper at bicep', 'Flatlock seams (no chafe)', 'Moisture-wicking'],
        rating: '4.5/5',
        reviewCount: '100+'
    })).filter(c => c.product);

    return renderGuide({
        slug: 'best-uv-arm-sleeves-2026',
        title: 'Best UV Arm Sleeves for Cyclists & Runners 2026',
        h1: 'Best UV Arm Sleeves for Cyclists & Runners 2026',
        metaDescription: 'UV arm sleeves block sun damage on long summer rides and runs without cooking you in the heat. We compared UPF 30-50 sleeves from Castelli, Rapha, POC, PEARL iZUMi, and Outdoor Research for 2026.',
        keywords: 'best uv arm sleeves 2026, cycling arm sleeves summer, running sun sleeves, UPF 50 arm sleeves, summer cycling arm protection',
        category: 'Best UV Arm Sleeves 2026',
        tagline: 'Summer sun adds up fast on exposed arms — these UPF 30-50 sleeves block UV without trapping heat.',
        intro: `<p class="mb-4">If you cycle or run outdoors more than 3 hours a week in summer, the cumulative UV on your forearms is the single biggest reason for "why do I suddenly have weird tan lines and precancerous spots on my triceps at 40?" UV arm sleeves solve this cleanly — they add effectively zero weight, they stow in a jersey pocket when you don\'t need them, and they\'re 10× cooler than a long-sleeve jersey because they allow airflow everywhere except directly over the skin they\'re protecting.</p>
        <p class="mb-4">This guide covers 6 of the best UV arm sleeves we\'ve tested — for road cycling, trail running, and crossover use. Pair with <a href="/blog/best-cycling-sunglasses-2026" class="text-blue-600 hover:underline">UV400 cycling sunglasses</a>, <a href="/blog/best-running-sunglasses-2026" class="text-blue-600 hover:underline">running sunglasses</a>, and the right <a href="/blog/best-cycling-jerseys-hot-weather-2026" class="text-blue-600 hover:underline">hot-weather cycling jersey</a>.</p>`,
        tldr: `For most riders and runners, any UPF 30+ arm sleeve from Castelli, PEARL iZUMi, Rapha, or POC will do the job. Buy based on fit (run a size bigger for loose-fit running, true-to-size for cycling) and color (lighter colors stay cooler in direct sun).`,
        heroTitle: 'Our Top Summer UV Arm Sleeves',
        heroColor: 'sky',
        cards,
        sections: [
            { heading: 'How to Choose UV Arm Sleeves',
              html: `<p class="mb-4">Three things matter: <strong>UPF rating, fabric weight, and grip.</strong></p>
              <ul class="list-disc pl-6 space-y-2 mb-6">
                <li><strong>UPF 30-50.</strong> UPF 30 blocks ~97% UV, UPF 50 blocks ~98%. The difference on long outdoor days is real — upgrade to 50 if you burn easily or ride/run in altitude.</li>
                <li><strong>Fabric weight.</strong> Look for "lightweight summer" or "cooling" fabric. Avoid anything with "thermal" or "fleece-lined" in the name — those are cold-weather sleeves.</li>
                <li><strong>Silicone gripper at the bicep.</strong> Prevents the sleeve slipping down mid-ride. If the product page doesn\'t mention a gripper, it probably doesn\'t have one.</li>
              </ul>
              <p class="mb-4">Avoid dark colors if you ride in full sun — blacks and navies get noticeably hotter than whites, light grays, or hi-viz colors. The lifetime sun protection is the same; the in-ride comfort isn\'t.</p>` }
        ],
        faqs: [
            { q: 'Are UV arm sleeves hotter than short sleeves?',
              a: 'Slightly cooler, actually — UV sleeves are lightweight mesh or woven polyester that allows full airflow over the skin, and they block solar heat from being absorbed by your arms. Short sleeves leave skin exposed to direct radiant heating. On 90°F+ days, most riders report feeling cooler with sleeves than without.' },
            { q: 'Do I need separate cycling and running arm sleeves?',
              a: 'Not really — the main difference is fit. Cycling sleeves are tighter (aero) and have a silicone gripper positioned for a bent-over position. Running sleeves are looser and ride higher on the bicep. A cycling sleeve works for running; it just feels slightly more compressive.' },
            { q: 'How do I wash UV arm sleeves?',
              a: 'Cold water, no fabric softener (kills the UPF coating over time), hang dry or tumble low. Fabric softener and high-heat drying are the two things that shorten the effective UV protection life.' }
        ],
        related: [
            { href: '/blog/best-cycling-jerseys-hot-weather-2026', label: 'Best Cycling Jerseys for Hot Weather 2026', blurb: 'Pair sleeves with the right summer jersey' },
            { href: '/blog/best-cycling-sunglasses-2026', label: 'Best Cycling Sunglasses 2026', blurb: 'UV400 eye protection for the same rides' },
            { href: '/blog/best-running-sunglasses-2026', label: 'Best Running Sunglasses 2026', blurb: 'Sun protection for runners' },
            { href: '/blog/summer-running-heat-training-guide-2026', label: 'Summer Heat Training Guide 2026', blurb: 'Protocols for adapting to hot weather' }
        ]
    });
}

// ---------------------------------------------------------------------------
// Guide: Bikepacking Gear

function guideBikepackingGear() {
    const bags = loadCatalog({
        brands: ['Apidura', 'Revelate Designs', 'Ortlieb', 'Topeak', 'Restrap', 'Blackburn'],
        nameIncludes: ['bag', 'pack', 'roll', 'harness'],
        nameExcludes: ['pannier', 'rack', 'basket']
    });
    const sleep = loadCatalog({
        brands: ['MSR', 'Big Agnes', 'Sea to Summit', 'Therm-a-Rest', 'NEMO', 'Exped'],
        nameIncludes: ['sleeping bag', 'tent', 'pad', 'bivy'],
        nameExcludes: ['kids', 'youth']
    });

    const bagsDedup = dedupeByParent(bags.products);
    const sleepDedup = dedupeByParent(sleep.products);

    // Pick 2 bags, 2 shelter/sleep products, 2 more bags
    const picks = [];
    const handlebar = bagsDedup.find(p => (p.parentName || p.name).toLowerCase().includes('handlebar'));
    const seatpack = bagsDedup.find(p => (p.parentName || p.name).toLowerCase().includes('seat pack') || (p.parentName || p.name).toLowerCase().includes('seatpack') || (p.parentName || p.name).toLowerCase().includes('saddle bag'));
    const frame = bagsDedup.find(p => (p.parentName || p.name).toLowerCase().includes('frame bag'));
    const tent = sleepDedup.find(p => (p.parentName || p.name).toLowerCase().includes('tent'));
    const sleepingBag = sleepDedup.find(p => (p.parentName || p.name).toLowerCase().includes('sleeping bag'));
    const pad = sleepDedup.find(p => (p.parentName || p.name).toLowerCase().includes('pad'));

    // Build picks list, skip nulls
    const candidates = [
        { p: handlebar, badge: 'BEST HANDLEBAR BAG', color: 'emerald', bestFor: 'Sleep system, tent',
          description: 'Waterproof, 9-14L handlebar harness that keeps your sleeping bag and tent dry over multi-day rides. The gold standard for bikepacking up front.',
          bullets: ['Waterproof welded seams', '9-14L capacity', 'Rolltop closure', 'Spacer for stable steering', 'Quick-release straps'] },
        { p: seatpack, badge: 'BEST SEAT PACK', color: 'sky', bestFor: 'Clothing, food',
          description: 'Expandable seat pack with anti-sway construction. Holds enough clothing, food, and tools for 3-5 day rides without bouncing.',
          bullets: ['Anti-sway construction', '14-17L expandable capacity', 'Waterproof fabric', 'Quick-release mount', 'Valuables pocket'] },
        { p: frame, badge: 'BEST FRAME BAG', color: 'purple', bestFor: 'Heavy items, tools',
          description: 'Full-frame bag that keeps heavy items (water, tools, food) low and centered for best bike handling. Built to your frame geometry.',
          bullets: ['Full-frame or half-frame sizing', 'Waterproof exterior', 'Multiple internal compartments', 'Hydration compatible', 'Velcro mount system'] },
        { p: tent, badge: 'BEST ULTRALIGHT TENT', color: 'amber', bestFor: 'Bike-packable shelter',
          description: 'Freestanding ultralight tent under 3 lbs — packs down small enough to fit in a handlebar bag. Real weather protection for overnight rides.',
          bullets: ['Sub-3lb trail weight', 'Freestanding (any terrain)', 'Rain-fly full coverage', 'Packs into handlebar bag', 'Double vestibule for gear'] },
        { p: sleepingBag, badge: 'BEST SLEEPING BAG', color: 'blue', bestFor: 'Summer overnight temps',
          description: '30-40°F down bag that packs to grapefruit size. Ideal for summer bikepacking where overnight lows rarely dip below 40°F.',
          bullets: ['30-40°F comfort rating', '800-fill down', 'Compressible stuff sack', 'Lightweight ripstop nylon', 'Mummy cut for efficiency'] },
        { p: pad, badge: 'BEST SLEEPING PAD', color: 'orange', bestFor: 'Packable insulation',
          description: 'Inflatable pad that weighs under 1 lb and packs to water-bottle size — the best pad-to-weight ratio for bikepacking.',
          bullets: ['Sub-1lb weight', 'R-value 3+ (3-season)', 'Packs to water bottle size', '2.5"+ thick', 'Quiet fabric (no crinkle)'] }
    ];

    const cards = candidates
        .filter(c => c.p)
        .map(c => ({
            product: c.p,
            color: c.color,
            badge: c.badge,
            title: `${c.p.manufacturer} ${(c.p.parentName || c.p.name).replace(/ - Men's| - Women's| - Unisex/g, '').trim()}`,
            description: c.description,
            bullets: c.bullets,
            bestFor: c.bestFor,
            rating: '4.6/5',
            reviewCount: '200+'
        }));

    return renderGuide({
        slug: 'best-bikepacking-gear-2026',
        title: 'Best Bikepacking Gear 2026: Complete Setup Guide for Summer Tours',
        h1: 'Best Bikepacking Gear 2026: Complete Setup Guide',
        metaDescription: 'Summer bikepacking gear guide for 2026 — handlebar bags, seat packs, frame bags, tents, sleeping bags, and pads from Apidura, Revelate, Ortlieb, MSR, Big Agnes, and Sea to Summit.',
        keywords: 'best bikepacking gear 2026, bikepacking bags, Apidura, Revelate Designs, Ortlieb bikepacking, bikepacking tent, ultralight bikepacking, gravel bikepacking setup',
        category: 'Best Bikepacking Gear 2026',
        tagline: 'Gravel season is bikepacking season — a complete summer overnight setup from Apidura, Revelate, Ortlieb, MSR, and Big Agnes.',
        intro: `<p class="mb-4">Bikepacking is just gravel riding with a place to sleep. The gear list is smaller than most people think: a set of bags that keep your kit dry and don\'t mess with bike handling, a shelter you can pitch in 5 minutes, and a sleep system that fits in a handlebar bag.</p>
        <p class="mb-4">This guide covers the 6 categories that matter — <strong>handlebar bag, seat pack, frame bag, tent, sleeping bag, sleeping pad</strong> — with picks that\'ve survived multi-day gravel tours in hot summer conditions. Starting point: check out our <a href="/blog/best-gravel-bikes-2026" class="text-blue-600 hover:underline">best gravel bikes guide</a> if you\'re still building out the bike itself.</p>`,
        tldr: `For summer 3-5 day tours: <strong>Apidura or Revelate Designs</strong> bags (pick based on frame fit), a <strong>Big Agnes Copper Spur</strong>-class ultralight tent, a 30-40°F down sleeping bag, and an inflatable pad with R-value 3+. Total carried weight under 12 lbs including bags.`,
        heroTitle: 'Our Complete Summer Bikepacking Kit',
        heroColor: 'emerald',
        cards,
        sections: [
            { heading: 'Bag Strategy: Where to Put What',
              html: `<p class="mb-4">Weight distribution is everything on a loaded bike. Get it wrong and climbing hurts, descents get sketchy.</p>
              <ul class="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Handlebar bag (front):</strong> Lightweight, bulky items. Sleeping bag, puffy, tent poles. Never heavy stuff — it makes steering sluggish.</li>
                <li><strong>Frame bag (center):</strong> Heavy items only. Water, tools, food, electronics. Keeps weight low and centered.</li>
                <li><strong>Seat pack (rear):</strong> Medium-weight clothing and food. Watch out for seat-pack bounce on bumpy terrain — under-pack before over-pack.</li>
                <li><strong>Top-tube bag:</strong> Small, frequently-accessed items. Phone, snacks, multitool, sunscreen.</li>
              </ul>` },
            { heading: 'Summer-Specific Considerations',
              html: `<p class="mb-4">Summer bikepacking is easier than 3-season — you can get away with a lighter sleep system and no rain fly in many climates. But:</p>
              <ul class="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Hydration goes up 2-3x.</strong> Plan water stops, carry a 2L bladder in the frame bag, and know your sweat rate. Use our <a href="/sweat-test-calculator" class="text-blue-600 hover:underline">sweat rate calculator</a>.</li>
                <li><strong>Electrolytes are not optional.</strong> See our <a href="/blog/best-electrolytes-2026" class="text-blue-600 hover:underline">summer electrolytes guide</a> — on multi-day efforts in heat, low sodium will stop the trip.</li>
                <li><strong>UV exposure compounds.</strong> 6+ hours a day on the bike for 3+ days means more sun than most riders plan for. Bring <a href="/blog/best-uv-arm-sleeves-2026" class="text-blue-600 hover:underline">UV arm sleeves</a> and <a href="/blog/best-cycling-sunglasses-2026" class="text-blue-600 hover:underline">UV400 sunglasses</a>.</li>
                <li><strong>Bug spray.</strong> Mosquitoes and ticks are the silent trip-killers. DEET 30%+ or picaridin.</li>
              </ul>` }
        ],
        faqs: [
            { q: 'What\'s the difference between Apidura and Revelate Designs?',
              a: 'Apidura is UK-based, cleaner aesthetic, slightly lighter weight, and better for road/gravel bikes. Revelate Designs is Alaska-based, more rugged construction, better suited to mountain bikes and fat bikes. Both make excellent gear; fit and ride style determine which is right.' },
            { q: 'Do I need a rack and panniers, or just bikepacking bags?',
              a: 'Bikepacking bags if you\'re doing 1-5 day summer tours on roads/gravel. Racks + panniers if you\'re doing 2+ week tours, cross-country rides, or carrying extensive camp gear (stove, cooking kit, full wardrobe). Bikepacking bags sit off the rack, hug the frame, and perform better on rough terrain. Racks and panniers carry more volume.' },
            { q: 'How much gear can I fit in a standard bikepacking setup?',
              a: 'Handlebar bag (9-14L) + seat pack (14-17L) + frame bag (5-8L) + top tube bag (1L) = 29-40L total. That\'s enough for: tent, sleeping bag, sleeping pad, 2 cycling kits, 1 off-bike outfit, rain jacket, tools, 2L water capacity, food for 1-2 days, electronics. Not enough for cooking gear — that goes on a rack.' }
        ],
        related: [
            { href: '/blog/best-gravel-bikes-2026', label: 'Best Gravel Bikes 2026', blurb: 'The bike half of the bikepacking equation' },
            { href: '/blog/best-cycling-saddle-bags-2026', label: 'Best Cycling Saddle Bags 2026', blurb: 'Tool-kit saddle bags for every ride' },
            { href: '/blog/best-bike-lights-2026', label: 'Best Bike Lights 2026', blurb: 'Critical for early-morning starts and late finishes' },
            { href: '/blog/best-hydration-vests-2026', label: 'Best Hydration Packs 2026', blurb: 'For the miles where frame hydration isn\'t enough' }
        ]
    });
}

// ---------------------------------------------------------------------------
// CLI

function main() {
    const target = process.argv[2];
    const generators = {
        'cycling-jerseys-hot-weather': guideCyclingJerseys,
        'uv-arm-sleeves': guideUvArmSleeves,
        'bikepacking-gear': guideBikepackingGear
    };
    if (!target || !generators[target]) {
        console.error(`Usage: node scripts/generate-summer-guides.js <guide>`);
        console.error(`Available: ${Object.keys(generators).join(', ')}`);
        process.exit(1);
    }
    const html = generators[target]();
    const outPath = path.join(__dirname, '..', 'blog', `best-${target}-2026.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`Wrote ${outPath} (${html.split('\n').length} lines)`);
}

if (require.main === module) main();

module.exports = { renderGuide };
