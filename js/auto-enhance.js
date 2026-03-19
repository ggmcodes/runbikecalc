/**
 * RunBikeCalc Auto-Enhance
 * Automatically adds product recommendations
 * to all calculator pages. Include once — works everywhere.
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
            { name: 'Polar H10 Heart Rate Monitor', search: 'Polar+H10+Heart+Rate+Monitor', desc: 'Gold standard chest strap. Best accuracy for zone-based training.' },
            { name: 'Garmin HRM-Pro Plus', search: 'Garmin+HRM+Pro+Plus', desc: 'Advanced running dynamics with ground contact time.' },
            { name: 'Wahoo TICKR', search: 'Wahoo+TICKR+Heart+Rate+Monitor', desc: 'Reliable, comfortable chest strap. Works with all training apps.' }
        ],
        running: [
            { name: 'Garmin Forerunner 265', search: 'Garmin+Forerunner+265', desc: 'AMOLED GPS watch with training readiness and HRV status.' },
            { name: 'Nike Vaporfly 3', search: 'Nike+Vaporfly+3+running+shoes', desc: 'Carbon-plated race shoe. PR potential from 5K to marathon.' },
            { name: 'COROS PACE 3', search: 'COROS+PACE+3', desc: 'Lightweight GPS watch with impressive battery life.' }
        ],
        cycling: [
            { name: 'Favero Assioma Duo', search: 'Favero+Assioma+Duo+power+meter', desc: 'Accurate dual-sided power pedals. Easy install on any bike.' },
            { name: 'Wahoo KICKR CORE', search: 'Wahoo+KICKR+CORE+smart+trainer', desc: 'Direct-drive smart trainer. Perfect for structured indoor training.' },
            { name: 'Garmin Edge 540', search: 'Garmin+Edge+540', desc: 'Full-featured cycling computer with power metrics and maps.' }
        ],
        fitness: [
            { name: 'Garmin Venu 3', search: 'Garmin+Venu+3', desc: 'AMOLED display with comprehensive health and fitness tracking.' },
            { name: 'WHOOP 4.0', search: 'WHOOP+4.0+fitness+tracker', desc: 'Advanced recovery and strain tracking. 24/7 monitoring.' },
            { name: 'Fitbit Charge 6', search: 'Fitbit+Charge+6', desc: 'Affordable tracker with HR zones and stress management.' }
        ],
        recovery: [
            { name: 'Theragun Elite', search: 'Theragun+Elite+massage+gun', desc: 'Powerful percussion therapy with app-guided routines.' },
            { name: 'TriggerPoint GRID Foam Roller', search: 'TriggerPoint+GRID+foam+roller', desc: 'Multi-density foam roller. Essential for recovery.' },
            { name: 'Normatec 3 Leg Recovery', search: 'Normatec+3+compression+boots', desc: 'Dynamic compression therapy for faster recovery.' }
        ],
        nutrition: [
            { name: 'GU Energy Gel Variety Pack', search: 'GU+Energy+Gel+variety+pack', desc: 'Race-day fuel. Easy-to-digest carbs for endurance events.' },
            { name: 'Precision Hydration Electrolytes', search: 'Precision+Hydration+electrolytes', desc: 'Stronger electrolytes for heavy sweaters and long events.' },
            { name: 'Nathan Running Hydration Vest', search: 'Nathan+running+hydration+vest', desc: 'Carries water, nutrition, and phone for long runs.' }
        ],
        triathlon: [
            { name: 'Garmin Forerunner 965', search: 'Garmin+Forerunner+965', desc: 'Top GPS multisport watch with maps and training metrics.' },
            { name: 'Favero Assioma Duo', search: 'Favero+Assioma+Duo+power+meter', desc: 'Power pedals that move between bikes. Great for tri training.' },
            { name: 'GU Energy Gel Variety Pack', search: 'GU+Energy+Gel+variety+pack', desc: 'Essential race-day fuel for swim-bike-run events.' }
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
        // Page already has products — skip product injection
        return;
    }

    function injectProducts() {
        // Find insertion point — before footer or at end of main
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

            var h4 = document.createElement('h4');
            h4.style.cssText = 'color: #C67B4E; margin: 0 0 0.5rem; font-size: 1rem; font-family: Playfair Display, serif;';
            h4.textContent = p.name;
            card.appendChild(h4);

            var desc = document.createElement('p');
            desc.style.cssText = 'margin: 0 0 1rem; color: #4b5563; font-size: 0.9rem; line-height: 1.5;';
            desc.textContent = p.desc;
            card.appendChild(desc);

            var link = document.createElement('a');
            link.href = 'https://www.amazon.com/s?k=' + p.search + '&tag=' + AFFILIATE_TAG;
            link.target = '_blank';
            link.rel = 'noopener sponsored';
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
