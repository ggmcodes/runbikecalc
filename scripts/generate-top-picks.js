#!/usr/bin/env node
/**
 * Generate 2026-top-picks.html as a product showcase.
 *
 * Each category in the page now shows the flagship product with a real photo,
 * a "Shop at Backcountry" link, and a "Read Full Guide →" link.
 *
 * Skips 9 no-BC categories (treadmills, rowers, saunas, cold plunge, etc.)
 * and the Interactive Quizzes section (tools, not products).
 */

const fs = require('fs');
const path = require('path');
const { loadCatalog, dedupeByParent, buildBackcountryLink, buildBackcountryImageUrl, buildAmazonSearchLink } = require('./backcountry-lib');
const { renderProductGridCard, escapeHtml } = require('./product-card');

const OUT_PATH = path.join(__dirname, '..', '2026-top-picks.html');

// Category structure. Each entry specifies a flagship product to find in catalog + the guide URL.
const SECTIONS = [
    {
        heading: 'Summer Essentials 2026',
        badge: 'NEW',
        color: 'orange',
        iconClass: 'bg-orange-100',
        iconColor: 'text-orange-600',
        iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>',
        picks: [
            { keyword: 'premio evo+short-sleeve', badge: 'HOT-WEATHER JERSEYS', color: 'orange', title: 'Castelli Premio Evo Jersey', guide: '/blog/best-cycling-jerseys-hot-weather-2026', guideLabel: 'Read: Best Cycling Jerseys for Hot Weather →' },
            { keyword: 'hydration sport drink mix+60', badge: 'ELECTROLYTES', color: 'amber', title: 'Skratch Labs Hydration Mix', guide: '/blog/best-electrolytes-2026', guideLabel: 'Read: Best Electrolytes 2026 →' },
            { keyword: 'active skin+12l', badge: 'HYDRATION VESTS', color: 'sky', title: 'Salomon Active Skin 12L', guide: '/blog/best-hydration-vests-2026', guideLabel: 'Read: Best Hydration Vests 2026 →' },
            { keyword: 'podium chill+21oz', badge: 'WATER BOTTLES', color: 'blue', title: 'CamelBak Podium Chill', guide: '/blog/best-water-bottles-running-cycling-2026', guideLabel: 'Read: Best Water Bottles 2026 →' },
            { keyword: 'sutro', badge: 'CYCLING SUNGLASSES', color: 'purple', title: 'Oakley Sutro', guide: '/blog/best-cycling-sunglasses-2026', guideLabel: 'Read: Best Cycling Sunglasses 2026 →' },
            { keyword: 'speedgoat 6', badge: 'TRAIL RUNNING SHOES', color: 'emerald', title: 'HOKA Speedgoat 6', guide: '/blog/best-trail-running-shoes-2026', guideLabel: 'Read: Best Trail Running Shoes 2026 →' }
        ]
    },
    {
        heading: 'Running Gear',
        color: 'blue',
        iconClass: 'bg-blue-100',
        iconColor: 'text-blue-600',
        iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
        picks: [
            { keyword: 'forerunner 265', badge: 'RUNNING WATCHES', color: 'emerald', title: 'Garmin Forerunner 265', guide: '/blog/best-running-watches-2026', guideLabel: 'Read: Best Running Watches 2026 →' },
            { keyword: 'rincon 4+running', badge: 'RUNNING SHOES', color: 'blue', title: 'HOKA Rincon 4', guide: '/blog/best-running-shoes-2026', guideLabel: 'Read: Best Running Shoes 2026 →' },
            { keyword: 'speedgoat 6', badge: 'TRAIL RUNNING', color: 'amber', title: 'HOKA Speedgoat 6', guide: '/blog/best-trail-running-shoes-2026', guideLabel: 'Read: Best Trail Running Shoes 2026 →' },
            { keyword: 'strider pro+7in', badge: 'RUNNING SHORTS', color: 'orange', title: 'Patagonia Strider Pro', guide: '/blog/best-running-shorts-2026', guideLabel: 'Read: Best Running Shorts 2026 →' },
            { keyword: 'peak mission+27in', badge: 'RUNNING TIGHTS', color: 'purple', title: 'Patagonia Peak Mission', guide: '/blog/best-running-tights-leggings-2026', guideLabel: 'Read: Best Running Tights 2026 →' },
            { keyword: 'houdini+jacket', badge: 'RUNNING JACKETS', color: 'sky', title: 'Patagonia Houdini', guide: '/blog/best-running-jackets-2026', guideLabel: 'Read: Best Running Jackets 2026 →' },
            { keyword: 'sutro', badge: 'RUNNING SUNGLASSES', color: 'rose', title: 'Oakley Sutro', guide: '/blog/best-running-sunglasses-2026', guideLabel: 'Read: Best Running Sunglasses 2026 →' },
            { keyword: 'active skin+12l', badge: 'RUNNING HYDRATION', color: 'emerald', title: 'Salomon Active Skin 12L', guide: '/blog/best-running-hydration-vests-2026', guideLabel: 'Read: Best Running Hydration Vests 2026 →' }
        ]
    },
    {
        heading: 'Cycling Gear',
        color: 'emerald',
        iconClass: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
        picks: [
            { keyword: 'edge 1040 solar', badge: 'BIKE COMPUTERS', color: 'emerald', title: 'Garmin Edge 1040 Solar', guide: '/blog/best-bike-computers-2026', guideLabel: 'Read: Best Bike Computers 2026 →' },
            { keyword: 'rc903+s-phyre', badge: 'CYCLING SHOES', color: 'blue', title: 'Shimano RC903 S-PHYRE', guide: '/blog/best-cycling-shoes-2026', guideLabel: 'Read: Best Cycling Shoes 2026 →' },
            { keyword: 'premio evo+short-sleeve', badge: 'CYCLING JERSEYS', color: 'amber', title: 'Castelli Premio Evo Jersey', guide: '/blog/best-cycling-jerseys-2026', guideLabel: 'Read: Best Cycling Jerseys 2026 →' },
            { keyword: 'endurance+bib', badge: 'CYCLING BIB SHORTS', color: 'purple', title: 'Castelli Endurance 3 Bib', guide: '/blog/best-cycling-bib-shorts-2026', guideLabel: 'Read: Best Cycling Bib Shorts 2026 →' },
            { keyword: 'ventral+helmet', badge: 'CYCLING HELMETS', color: 'sky', title: 'POC Ventral Air', guide: '/blog/best-cycling-helmets-2026', guideLabel: 'Read: Best Cycling Helmets 2026 →' },
            { keyword: 'sutro', badge: 'CYCLING SUNGLASSES', color: 'orange', title: 'Oakley Sutro', guide: '/blog/best-cycling-sunglasses-2026', guideLabel: 'Read: Best Cycling Sunglasses 2026 →' },
            { keyword: 'power arc+expert', badge: 'CYCLING SADDLES', color: 'rose', title: 'Specialized Power Arc', guide: '/blog/best-cycling-saddles-2026', guideLabel: 'Read: Best Cycling Saddles 2026 →' },
            { keyword: 'dura-ace pd-r9100', badge: 'CYCLING PEDALS', color: 'emerald', title: 'Shimano Dura-Ace Pedals', guide: '/blog/best-cycling-pedals-2026', guideLabel: 'Read: Best Cycling Pedals 2026 →' },
            { keyword: 'varia', badge: 'BIKE LIGHTS', color: 'purple', title: 'Garmin Varia Radar', guide: '/blog/best-bike-lights-2026', guideLabel: 'Read: Best Bike Lights 2026 →' },
            { keyword: 'corsa pro control g2', badge: 'CYCLING TIRES', color: 'blue', title: 'Vittoria Corsa Pro Control', guide: '/blog/best-cycling-tires-2026', guideLabel: 'Read: Best Cycling Tires 2026 →' },
            { keyword: 'joeblow+sport', badge: 'BIKE PUMPS', color: 'amber', title: 'Topeak JoeBlow Sport III', guide: '/blog/best-bike-pumps-2026', guideLabel: 'Read: Best Bike Pumps 2026 →' },
            { keyword: 'alien ii', badge: 'BIKE MULTI-TOOLS', color: 'sky', title: 'Topeak Alien II', guide: '/blog/best-bike-multi-tools-2026', guideLabel: 'Read: Best Bike Multi-Tools 2026 →' }
        ]
    },
    {
        heading: 'Nutrition & Hydration',
        color: 'amber',
        iconClass: 'bg-amber-100',
        iconColor: 'text-amber-600',
        iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
        picks: [
            { keyword: 'hydration sport drink mix+60', badge: 'ELECTROLYTES', color: 'blue', title: 'Skratch Labs Hydration Mix', guide: '/blog/best-electrolytes-2026', guideLabel: 'Read: Best Electrolytes 2026 →' },
            { keyword: 'podium chill+21oz', badge: 'WATER BOTTLES', color: 'sky', title: 'CamelBak Podium Chill', guide: '/blog/best-water-bottles-running-cycling-2026', guideLabel: 'Read: Best Water Bottles 2026 →' },
            { keyword: 'roctane+gel', badge: 'ENERGY GELS', color: 'emerald', title: 'GU Roctane Energy Gel', guide: '/blog/best-energy-gels-chews-2026', guideLabel: 'Read: Best Energy Gels 2026 →' },
            { keyword: 'super high-carb', badge: 'ENDURANCE CARBS', color: 'orange', title: 'Skratch Super High-Carb', guide: '/blog/best-carbs-endurance-athletes-2026', guideLabel: 'Read: Best Carbs for Endurance →' },
            { keyword: 'recovery+24-serving', badge: 'PROTEIN POWDER', color: 'purple', title: 'Skratch Labs Recovery Mix', guide: '/blog/best-protein-powder-endurance-athletes-2026', guideLabel: 'Read: Best Protein Powder →' }
        ]
    },
    {
        heading: 'Wearables',
        color: 'purple',
        iconClass: 'bg-purple-100',
        iconColor: 'text-purple-600',
        iconPath: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        picks: [
            { keyword: 'forerunner 265', badge: 'RUNNING WATCHES', color: 'emerald', title: 'Garmin Forerunner 265', guide: '/blog/best-running-watches-2026', guideLabel: 'Read: Best Running Watches 2026 →' },
            { keyword: 'forerunner 965', badge: 'TRIATHLON WATCHES', color: 'blue', title: 'Garmin Forerunner 965', guide: '/blog/best-triathlon-watches-2026', guideLabel: 'Read: Best Triathlon Watches 2026 →' },
            { keyword: 'pace 3', badge: 'BUDGET GPS WATCHES', color: 'amber', title: 'COROS PACE 3', guide: '/blog/best-gps-watches-under-200-2026', guideLabel: 'Read: Best GPS Watches Under $200 →' },
            { keyword: 'venu 3', badge: 'FITNESS TRACKERS', color: 'rose', title: 'Garmin Venu 3', guide: '/blog/best-fitness-trackers-2026', guideLabel: 'Read: Best Fitness Trackers 2026 →' },
            { amazonOnly: true, brand: 'Polar', title: 'Polar H10 Heart Rate Monitor', imageUrl: 'https://www.polar.com/sites/default/files/polar-h10.png', price: '$100', badge: 'HEART RATE MONITORS', color: 'purple', guide: '/blog/best-heart-rate-monitors-2026', guideLabel: 'Read: Best Heart Rate Monitors 2026 →' },
            { amazonOnly: true, brand: 'Shokz', title: 'Shokz OpenRun Pro 2', imageUrl: 'https://shokz.com/cdn/shop/products/OpenRunPro2.png', price: '$180', badge: 'RUNNING HEADPHONES', color: 'sky', guide: '/blog/best-running-headphones-2026', guideLabel: 'Read: Best Running Headphones 2026 →' }
        ]
    }
];

function findProduct(catalog, keyword) {
    if (!keyword) return null;
    const dedup = dedupeByParent(catalog.products);
    const tokens = keyword.toLowerCase().split('+').map(t => t.trim()).filter(Boolean);
    return dedup.find(p => {
        const name = (p.parentName || p.name || '').toLowerCase();
        return tokens.every(t => name.includes(t));
    }) || null;
}

function renderSection(section, catalog) {
    const cards = section.picks.map(pick => {
        let product = null;
        if (!pick.amazonOnly) {
            product = findProduct(catalog, pick.keyword);
        }
        const cardHtml = renderProductGridCard(product, {
            color: pick.color,
            badge: pick.badge,
            title: pick.title,
            imageUrl: pick.imageUrl,
            amazonOnly: pick.amazonOnly,
            price: pick.price,
            amazonSearchTerm: pick.amazonSearchTerm || pick.title,
            guideLink: { href: pick.guide, label: pick.guideLabel }
        });
        return cardHtml;
    }).filter(Boolean).join('\n');

    return `        <!-- ${section.heading} Section -->
        <section class="mb-12">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 ${section.iconClass} rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 ${section.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${section.iconPath}
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">${escapeHtml(section.heading)}</h2>
${section.badge ? `                <span class="text-xs text-${section.color}-600 font-semibold bg-${section.color}-100 px-2 py-1 rounded">${escapeHtml(section.badge)}</span>` : ''}
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
${cards}
            </div>
        </section>`;
}

function render() {
    console.log('Loading catalog...');
    const catalog = loadCatalog({});
    console.log(`Loaded ${catalog.products.length} products.`);

    const sectionsHtml = SECTIONS.map(s => renderSection(s, catalog)).join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-78BHZZG6CN"></script>
    <script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-78BHZZG6CN');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3180649272238451" crossorigin="anonymous"></script>
    <title>2026 Top Picks: Best Running &amp; Cycling Gear | RunBikeCalc</title>
    <link rel="canonical" href="https://runbikecalc.com/2026-top-picks">
    <meta name="description" content="Our expert-tested gear picks for 2026. Real Backcountry product photos, dual Backcountry+Amazon links, and full gear guides for runners and cyclists.">
    <meta property="og:title" content="2026 Top Picks: Best Running &amp; Cycling Gear">
    <meta property="og:description" content="Expert-tested gear picks for runners and cyclists with real product photos and full gear guides.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://runbikecalc.com/2026-top-picks">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="2026 Top Picks: Best Running &amp; Cycling Gear">
    <meta name="twitter:description" content="Expert-tested gear picks for runners and cyclists.">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="icon" type="image/svg+xml" href="images/favicon.svg">
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
                <a href="/2026-top-picks" class="nav-link nav-link-red nav-link-active">2026 Picks</a>
                <a href="/blog" class="nav-link">Journal</a>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <a href="/premium-training-plans" class="nav-cta">Start Training</a>
                <button class="mobile-menu-btn" onclick="document.getElementById('mobile-nav').classList.toggle('active')">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>
            </div>
        </div>
        <div id="mobile-nav" class="mobile-menu">
            <a href="/premium-training-plans">Training Plans</a>
            <a href="/running-tools">Running Tools</a>
            <a href="/cycling-tools">Cycling Tools</a>
            <a href="/2026-top-picks">2026 Top Picks</a>
            <a href="/blog">Journal</a>
        </div>
    </nav>

    <main class="container mx-auto px-4 py-8 max-w-6xl" style="padding-top: 6rem;">
        <!-- Hero Section -->
        <header class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">2026 Top Picks</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">Expert-tested gear for runners and cyclists. Real product photos. Backcountry + Amazon links. Full gear guides for every category.</p>
        </header>

        <!-- Gear Finder Quizzes - Featured -->
        <section class="mb-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <div class="text-center mb-6">
                <span class="inline-block bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">Interactive Quizzes</span>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Gear</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Answer a few quick questions and get personalized equipment recommendations matched to your goals and budget.</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a href="/spin-bike-finder" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-5 border border-indigo-100 hover:border-indigo-300 group">
                    <div class="text-3xl mb-3">🚴</div>
                    <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition">Spin Bike Finder</h3>
                    <p class="text-gray-500 text-sm mb-3">Peloton, Schwinn, or Concept2? Find your match.</p>
                    <span class="text-indigo-600 font-semibold text-sm">Take Quiz →</span>
                </a>
                <a href="/treadmill-finder" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-5 border border-indigo-100 hover:border-indigo-300 group">
                    <div class="text-3xl mb-3">🏃</div>
                    <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition">Treadmill Finder</h3>
                    <p class="text-gray-500 text-sm mb-3">NordicTrack, Peloton, or Sole? Get your pick.</p>
                    <span class="text-indigo-600 font-semibold text-sm">Take Quiz →</span>
                </a>
                <a href="/rower-finder" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-5 border border-indigo-100 hover:border-indigo-300 group">
                    <div class="text-3xl mb-3">🚣</div>
                    <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition">Rower Finder</h3>
                    <p class="text-gray-500 text-sm mb-3">Concept2, Hydrow, or WaterRower? Decide fast.</p>
                    <span class="text-indigo-600 font-semibold text-sm">Take Quiz →</span>
                </a>
                <a href="/home-gym-finder" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-5 border border-indigo-100 hover:border-indigo-300 group">
                    <div class="text-3xl mb-3">🏋️</div>
                    <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition">Home Gym Finder</h3>
                    <p class="text-gray-500 text-sm mb-3">Racks, weights, and more. Build your setup.</p>
                    <span class="text-indigo-600 font-semibold text-sm">Take Quiz →</span>
                </a>
            </div>
        </section>

${sectionsHtml}

        <!-- Summer Quick Access -->
        <section class="mb-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Other Summer Gear Guides</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/blog/best-uv-arm-sleeves-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best UV Arm Sleeves →</h3></a>
                <a href="/blog/best-bikepacking-gear-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best Bikepacking Gear →</h3></a>
                <a href="/blog/summer-running-heat-training-guide-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Summer Heat Training Guide →</h3></a>
                <a href="/blog/best-compression-socks-running-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best Compression Socks →</h3></a>
                <a href="/blog/best-cycling-gloves-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best Cycling Gloves →</h3></a>
                <a href="/blog/best-sports-bras-running-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best Sports Bras →</h3></a>
                <a href="/blog/best-cycling-saddle-bags-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best Cycling Saddle Bags →</h3></a>
                <a href="/blog/best-bike-locks-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best Bike Locks →</h3></a>
                <a href="/blog/best-bike-phone-mounts-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best Bike Phone Mounts →</h3></a>
                <a href="/blog/best-ebikes-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best E-Bikes →</h3></a>
                <a href="/blog/best-bike-racks-for-cars-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best Bike Racks for Cars →</h3></a>
                <a href="/blog/best-supplements-runners-cyclists-2026" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-orange-100"><h3 class="font-bold text-gray-900">Best Supplements →</h3></a>
            </div>
        </section>

    </main>

    <footer class="bg-gray-900 text-white py-12 mt-16">
        <div class="container mx-auto px-4 max-w-6xl">
            <div class="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                    <h3 class="text-xl font-bold mb-4">RunBikeCalc</h3>
                    <p class="text-gray-400">Expert-tested running and cycling gear. Calculators for training. Real reviews of real products.</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Tools</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/running-tools" class="hover:text-white">Running Calculators</a></li>
                        <li><a href="/cycling-tools" class="hover:text-white">Cycling Calculators</a></li>
                        <li><a href="/heart-rate-tools" class="hover:text-white">Heart Rate Tools</a></li>
                        <li><a href="/premium-training-plans" class="hover:text-white">Training Plans</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Resources</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/2026-top-picks" class="hover:text-white">2026 Gear Picks</a></li>
                        <li><a href="/blog" class="hover:text-white">Journal</a></li>
                        <li><a href="/about" class="hover:text-white">About</a></li>
                        <li><a href="/contact" class="hover:text-white">Contact</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                <p>&copy; 2026 RunBikeCalc. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="/js/main.js"></script>
</body>
</html>
`;
}

function main() {
    const html = render();
    fs.writeFileSync(OUT_PATH, html, 'utf8');
    console.log(`Wrote ${OUT_PATH} (${html.split('\n').length} lines)`);
}

if (require.main === module) main();
