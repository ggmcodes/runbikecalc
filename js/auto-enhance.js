/**
 * RunBikeCalc Auto-Enhance
 * Automatically adds product recommendations
 * to all calculator pages. Include once, works everywhere.
 */
(function() {
    'use strict';

    var AFFILIATE_TAG = 'runbikecalc-20';

    // Page slug from URL
    var path = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
    if (!path) return; // skip homepage

    // Skip non-calculator pages
    var skipPages = ['about', 'contact', 'privacy', 'blog', 'index', 'calculators', 'running-tools',
        'cycling-tools', 'heart-rate-tools', 'gear-guides', '2026-top-picks', 'offline',
        'race-card-builder', 'race-card-success', 'success', 'calculator-history',
        'cycling-calculators', 'running-calculators', 'premium-training-plans',
        'marathon-training-hub', 'cycling-power-hub', 'heart-rate-training-hub'];
    if (skipPages.indexOf(path) !== -1) return;
    if (path.indexOf('blog/') === 0) return;
    if (path.indexOf('plasma') !== -1) return;

    // ========== PRODUCT RECOMMENDATIONS ==========

    var products = {
        heartRate: [
            { name: 'Polar H10 Heart Rate Monitor', asin: 'B07PM54P4N', image: 'https://m.media-amazon.com/images/I/31ej46yR6aL._SL500_.jpg', price: '~$104', desc: 'Chest strap with dual Bluetooth and ANT+. The accuracy reference for zone-based training.' },
            { name: 'Garmin HRM 600', asin: 'B0F7ZGDDCX', image: 'https://m.media-amazon.com/images/I/31DLbvOQoNL._SL500_.jpg', price: '~$158', desc: 'Garmin flagship chest strap with running dynamics including ground contact time.' },
            { name: 'Wahoo TRACKR', asin: 'B0D52P8XS1', image: 'https://m.media-amazon.com/images/I/31Co6Uv-awL._SL500_.jpg', price: '~$99', desc: 'Rechargeable chest strap. Works with all major training apps.' }
        ],
        running: [
            { name: 'Garmin Forerunner 265', asin: 'B0DVMWYCHD', image: 'https://m.media-amazon.com/images/I/51qrOvMYPOL._SL500_.jpg', price: '~$379', desc: 'AMOLED GPS watch with training readiness and HRV status.' },
            { name: 'Nike Vaporfly 3', asin: 'B0DJGBQT45', image: 'https://m.media-amazon.com/images/I/31LeuoQnEXL._SL500_.jpg', price: '~$155', desc: 'Carbon-plated racing shoe for 5K to marathon distances.' },
            { name: 'COROS PACE 4', asin: 'B0FYGTCX83', image: 'https://m.media-amazon.com/images/I/31oMzJX467L._SL500_.jpg', price: '~$249', desc: 'Lightweight GPS watch with long battery life.' }
        ],
        cycling: [
            { name: 'Favero Assioma Duo', asin: 'B071JRXDKT', image: 'https://m.media-amazon.com/images/I/31jTk6g3iHL._SL500_.jpg', price: '~$628', desc: 'Dual-sided power meter pedals. Move between bikes with standard tools.' },
            { name: 'Wahoo KICKR Core 2', asin: 'B0FLQDCR7X', image: 'https://m.media-amazon.com/images/I/310nAfwgifL._SL500_.jpg', price: '~$549', desc: 'Direct-drive smart trainer with Zwift Cog for structured indoor training.' },
            { name: 'Garmin Edge 540', asin: 'B0BT36VBGM', image: 'https://m.media-amazon.com/images/I/41NtDVjOE3L._SL500_.jpg', price: '~$313', desc: 'Full-featured cycling computer with power metrics and maps.' }
        ],
        fitness: [
            { name: 'Garmin Venu 3', asin: 'B0H4RLFDC3', image: 'https://m.media-amazon.com/images/I/41yoK0GiYXL._SL500_.jpg', price: '~$289', desc: 'AMOLED smartwatch with comprehensive health and fitness tracking.' },
            { name: 'WHOOP 5.0 (12-Month Peak Membership)', asin: 'B0DY2SWV16', image: 'https://m.media-amazon.com/images/I/31wN2FZpfZL._SL500_.jpg', price: '~$239', desc: 'Screenless band with 12 months of membership. Tracks recovery, strain, and sleep.' },
            { name: 'Fitbit Charge 6', asin: 'B0FM9BKKPP', image: 'https://m.media-amazon.com/images/I/41J7zLD+2aL._SL500_.jpg', price: '~$149', desc: 'Tracker with HR zones and stress management.' }
        ],
        recovery: [
            { name: 'Theragun Prime (6th Gen)', asin: 'B0H78D8R9Q', image: 'https://m.media-amazon.com/images/I/31ij9FmvFiL._SL500_.jpg', price: '~$329', desc: 'Percussion massage gun with app-guided routines.' },
            { name: 'TriggerPoint GRID Foam Roller', asin: 'B0040EKZDY', image: 'https://m.media-amazon.com/images/I/41hOuseNM1L._SL500_.jpg', price: '~$28', desc: 'Multi-density foam roller for myofascial release.' },
            { name: 'Hyperice Normatec 3', asin: 'B0B72QBWHC', image: 'https://m.media-amazon.com/images/I/31twvW0rxML._SL500_.jpg', price: '~$899', desc: 'Dynamic air compression boots with adjustable pressure levels.' }
        ],
        nutrition: [
            { name: 'GU Energy Gel 24-Pack', asin: 'B00CQ7QDQA', image: 'https://m.media-amazon.com/images/I/41HBmkFLheL._SL500_.jpg', price: '~$49', desc: '24-pack of easy-to-digest carbohydrate gels for endurance events.' },
            { name: 'Precision Fuel PF60 Drink Mix', asin: 'B0BSXQ56N6', image: 'https://m.media-amazon.com/images/I/41jxx9toENL._SL500_.jpg', price: '~$31', desc: 'Carb and electrolyte drink mix with 60g of carbohydrate per serving.' },
            { name: 'Nathan Hydration Vest (2L)', asin: 'B01NALJI53', image: 'https://m.media-amazon.com/images/I/41RrOBRPGLL._SL500_.jpg', price: '~$74', desc: 'Carries 2L of water plus nutrition and a phone for long runs.' }
        ],
        triathlon: [
            { name: 'Garmin Forerunner 965', asin: 'B0BS1TN8QL', image: 'https://m.media-amazon.com/images/I/41-mKcvYRwL._SL500_.jpg', price: '~$599', desc: 'Multisport GPS watch with AMOLED display, maps, and training metrics.' },
            { name: 'Favero Assioma Duo', asin: 'B071JRXDKT', image: 'https://m.media-amazon.com/images/I/31jTk6g3iHL._SL500_.jpg', price: '~$628', desc: 'Power meter pedals that move between bikes.' },
            { name: 'GU Energy Gel 24-Pack', asin: 'B00CQ7QDQA', image: 'https://m.media-amazon.com/images/I/41HBmkFLheL._SL500_.jpg', price: '~$49', desc: 'Carbohydrate gels for swim-bike-run fueling.' }
        ]
    };

    // Map page slugs to product categories
    var pageMap = {
        'heart-rate-zone-calculator': 'heartRate',
        'max-heart-rate-calculator': 'heartRate',
        'target-heart-rate-calculator': 'heartRate',
        'hrr-calculator': 'heartRate',
        'mhr-karvonen-calculator': 'heartRate',
        'lthr-zone-calculator': 'heartRate',
        'advanced-heart-rate-zones-calculator': 'heartRate',
        'aerobic-anaerobic-calculator': 'heartRate',
        'zone-2-calculator': 'heartRate',
        'zone-2-training-plan-generator': 'heartRate',

        'running-pace-calculator': 'running',
        'race-pace-calculator': 'running',
        'race-time-predictor': 'running',
        'pace-converter-calculator': 'running',
        'pace-to-speed-converter': 'running',
        'treadmill-pace-calculator': 'running',
        'run-walk-calculator': 'running',
        'running-distance-converter': 'running',
        'km-to-miles-calculator': 'running',
        'track-conversion-calculator': 'running',
        'age-graded-calculator': 'running',
        'cooper-test-calculator': 'running',
        'pace-band-generator': 'running',
        'shoe-replacement-calculator': 'running',
        'running-knee-pain-diagnosis': 'running',

        'ftp-calculator': 'cycling',
        'ftp-improvement-calculator': 'cycling',
        'power-to-weight-ratio-calculator': 'cycling',
        'cadence-speed-calculator': 'cycling',
        'bike-gearing-calculator': 'cycling',
        'watts-to-calories-calculator': 'cycling',
        'ymca-cycle-ergometer-calculator': 'cycling',
        'bike-fit-pain-guide': 'cycling',
        'spin-bike-finder': 'cycling',

        'vo2-max-calculator': 'running',
        'vo2max-estimation-calculator': 'running',
        'vo2-max-race-predictor': 'running',
        'lactate-threshold-calculator': 'running',
        'lactate-threshold-pace-predictor': 'running',

        'calories-burned-running-calculator': 'fitness',
        'bmi-calculator': 'fitness',
        'body-composition-calculator': 'fitness',
        'rmr-calculator': 'fitness',
        'training-load-calculator': 'fitness',
        'training-load-balance-calculator': 'fitness',
        'training-stress-calculator': 'fitness',
        'progress-tracker': 'fitness',
        'interval-timer': 'fitness',
        'tabata-timer': 'fitness',

        'recovery-calculator': 'recovery',
        'windchill-calculator': 'running',

        'race-nutrition-calculator': 'nutrition',
        'sweat-test-calculator': 'nutrition',

        'hyrox-training-plan-generator': 'fitness',
        'cycling-training-plan-generator': 'cycling',
        'home-gym-finder': 'fitness',
        'rower-finder': 'fitness',
        'treadmill-finder': 'running'
    };

    var category = pageMap[path];
    if (!category) return; // not a mapped calculator page

    var recs = products[category];
    if (!recs || !recs.length) return;

    // Don't inject if page already has affiliate product section
    if (document.querySelector('.product-recommendations') ||
        document.querySelector('.product-cards-grid') ||
        document.querySelectorAll('[href*="tag=runbikecalc-20"]').length > 2) {
        // Page already has products; skip product injection
        return;
    }

    function injectProducts() {
        // Find insertion point: before footer or at end of main
        var footer = document.querySelector('footer');
        var main = document.querySelector('main') || document.querySelector('.container');
        if (!footer && !main) return;

        var section = document.createElement('div');
        section.className = 'product-recommendations';
        section.style.cssText = 'max-width: 72rem; margin: 2rem auto; padding: 1.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);';

        var title = document.createElement('h3');
        title.className = 'recommendations-title';
        title.style.cssText = 'font-size: 1.25rem; color: #1a1a1a; margin-bottom: 0.5rem; font-family: Playfair Display, serif;';
        title.textContent = 'Gear to Level Up Your Training';
        section.appendChild(title);

        var disc = document.createElement('p');
        disc.style.cssText = 'font-size: 0.8rem; color: #64748b; padding: 0.5rem; background: #f8fafc; border-radius: 4px; margin-bottom: 1rem;';
        disc.textContent = 'As an Amazon Associate, we earn from qualifying purchases.';
        section.appendChild(disc);

        var grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;';

        recs.forEach(function(p) {
            var card = document.createElement('div');
            card.style.cssText = 'background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e5e7eb; transition: transform 0.2s, box-shadow 0.2s;';
            card.onmouseenter = function() { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; };
            card.onmouseleave = function() { card.style.transform = ''; card.style.boxShadow = ''; };

            var url = 'https://www.amazon.com/dp/' + p.asin + '?tag=' + AFFILIATE_TAG;

            var imgLink = document.createElement('a');
            imgLink.href = url;
            imgLink.target = '_blank';
            imgLink.rel = 'nofollow sponsored noopener';
            var img = document.createElement('img');
            img.src = p.image;
            img.alt = p.name;
            img.loading = 'lazy';
            img.style.cssText = 'height: 140px; width: 100%; object-fit: contain; display: block; margin: 0 auto 0.75rem;';
            imgLink.appendChild(img);
            card.appendChild(imgLink);

            var h4 = document.createElement('h4');
            h4.style.cssText = 'color: #C67B4E; margin: 0 0 0.5rem; font-size: 1rem; font-family: Playfair Display, serif;';
            var titleLink = document.createElement('a');
            titleLink.href = url;
            titleLink.target = '_blank';
            titleLink.rel = 'nofollow sponsored noopener';
            titleLink.style.cssText = 'color: inherit; text-decoration: none;';
            titleLink.textContent = p.name;
            h4.appendChild(titleLink);
            card.appendChild(h4);

            var desc = document.createElement('p');
            desc.style.cssText = 'margin: 0 0 0.5rem; color: #4b5563; font-size: 0.9rem; line-height: 1.5;';
            desc.textContent = p.desc;
            card.appendChild(desc);

            var price = document.createElement('p');
            price.style.cssText = 'margin: 0 0 1rem; color: #1a1a1a; font-size: 0.9rem; font-weight: 600;';
            price.textContent = p.price;
            card.appendChild(price);

            var link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'nofollow sponsored noopener';
            link.style.cssText = 'display: inline-block; background: #C67B4E; color: white; padding: 0.6rem 1.25rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.875rem;';
            link.textContent = 'View on Amazon';
            link.onmouseenter = function() { link.style.background = '#a5623d'; };
            link.onmouseleave = function() { link.style.background = '#C67B4E'; };
            card.appendChild(link);

            grid.appendChild(card);
        });

        section.appendChild(grid);

        if (footer) {
            footer.parentNode.insertBefore(section, footer);
        } else if (main) {
            main.appendChild(section);
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            injectProducts();
        });
    } else {
        injectProducts();
    }
})();
