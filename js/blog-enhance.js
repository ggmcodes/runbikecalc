/**
 * RunBikeCalc Blog Enhancer
 * Auto-injects relevant calculator CTAs into blog posts
 * and adds product recommendations based on content keywords.
 */
(function() {
    'use strict';

    var path = window.location.pathname;
    if (path.indexOf('/blog/') === -1) return;

    var AFFILIATE_TAG = 'runbikecalc-20';
    var body = document.body.textContent.toLowerCase();

    // ========== CALCULATOR CTA INJECTION ==========

    var calcLinks = [
        { keywords: ['ftp', 'functional threshold', 'threshold power', 'power test'], url: '/ftp-calculator', label: 'FTP Calculator', desc: 'Calculate your Functional Threshold Power' },
        { keywords: ['heart rate zone', 'hr zone', 'training zone', 'zone 2', 'zone training'], url: '/heart-rate-zone-calculator', label: 'Heart Rate Zone Calculator', desc: 'Find your personalized training zones' },
        { keywords: ['vo2 max', 'vo2max', 'aerobic capacity', 'maximal oxygen'], url: '/vo2-max-calculator', label: 'VO2 Max Calculator', desc: 'Estimate your aerobic fitness level' },
        { keywords: ['pace calculator', 'running pace', 'race pace', 'min/mile', 'min/km'], url: '/running-pace-calculator', label: 'Running Pace Calculator', desc: 'Calculate your pace, speed, and finish time' },
        { keywords: ['race time', 'race predictor', 'predict race', 'goal time'], url: '/race-time-predictor', label: 'Race Time Predictor', desc: 'Predict your finish time for any distance' },
        { keywords: ['lactate threshold', 'lt pace', 'threshold pace', 'lthr'], url: '/lactate-threshold-calculator', label: 'Lactate Threshold Calculator', desc: 'Find your lactate threshold pace and heart rate' },
        { keywords: ['training plan', 'training schedule', 'training program', 'week plan'], url: '/premium-training-plans', label: 'Training Plan Generator', desc: 'Build your personalized training plan' },
        { keywords: ['calorie', 'calories burned', 'energy expenditure', 'burn rate'], url: '/calories-burned-running-calculator', label: 'Calories Burned Calculator', desc: 'Calculate calories burned during exercise' },
        { keywords: ['power to weight', 'watts per kg', 'w/kg', 'power-to-weight'], url: '/power-to-weight-ratio-calculator', label: 'Power-to-Weight Calculator', desc: 'Calculate your cycling power-to-weight ratio' },
        { keywords: ['max heart rate', 'maximum heart rate', 'mhr', 'max hr'], url: '/max-heart-rate-calculator', label: 'Max Heart Rate Calculator', desc: 'Estimate your maximum heart rate' },
        { keywords: ['recovery', 'rest day', 'overtraining', 'training load'], url: '/recovery-calculator', label: 'Recovery Calculator', desc: 'Optimize your recovery between sessions' },
        { keywords: ['sweat rate', 'hydration', 'fluid loss', 'sweat test'], url: '/sweat-test-calculator', label: 'Sweat Rate Calculator', desc: 'Calculate your sweat rate for better hydration' },
        { keywords: ['pace band', 'race card', 'race day', 'nutrition plan'], url: '/pace-band-generator', label: 'Pace Band & Race Card', desc: 'Build a printable race card with splits + nutrition' },
        { keywords: ['bike fit', 'saddle height', 'bike position', 'handlebar'], url: '/bike-fit-pain-guide', label: 'Bike Fit Pain Guide', desc: 'Diagnose and fix cycling pain issues' },
        { keywords: ['cadence', 'rpm', 'pedaling', 'gear ratio'], url: '/cadence-speed-calculator', label: 'Cadence & Speed Calculator', desc: 'Calculate speed from cadence and gearing' }
    ];

    // Find matching calculators based on page content
    var matches = [];
    calcLinks.forEach(function(calc) {
        var score = 0;
        calc.keywords.forEach(function(kw) {
            var regex = new RegExp(kw, 'gi');
            var m = body.match(regex);
            if (m) score += m.length;
        });
        if (score > 0) matches.push({ calc: calc, score: score });
    });

    matches.sort(function(a, b) { return b.score - a.score; });
    var topMatches = matches.slice(0, 3);

    if (topMatches.length > 0) {
        // Find article or main content
        var article = document.querySelector('article') || document.querySelector('.content-box') || document.querySelector('main');
        if (!article) return;

        // Create CTA banner
        var cta = document.createElement('div');
        cta.style.cssText = 'background: linear-gradient(135deg, rgba(198,123,78,0.08) 0%, rgba(198,123,78,0.03) 100%); border: 1px solid rgba(198,123,78,0.2); border-radius: 8px; padding: 1.25rem 1.5rem; margin: 2rem 0;';

        var ctaTitle = document.createElement('p');
        ctaTitle.style.cssText = 'font-family: Playfair Display, serif; font-size: 1rem; font-weight: 600; color: #1A1A1A; margin: 0 0 0.75rem;';
        ctaTitle.textContent = 'Try These Calculators';
        cta.appendChild(ctaTitle);

        var ctaGrid = document.createElement('div');
        ctaGrid.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem;';

        topMatches.forEach(function(m) {
            var link = document.createElement('a');
            link.href = m.calc.url;
            link.style.cssText = 'display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: white; border: 1px solid rgba(198,123,78,0.3); border-radius: 6px; text-decoration: none; color: #C67B4E; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;';
            link.textContent = m.calc.label + ' →';
            link.onmouseenter = function() { link.style.background = '#C67B4E'; link.style.color = 'white'; };
            link.onmouseleave = function() { link.style.background = 'white'; link.style.color = '#C67B4E'; };
            ctaGrid.appendChild(link);
        });

        cta.appendChild(ctaGrid);

        // Insert after 3rd paragraph or halfway through
        var paragraphs = article.querySelectorAll('p');
        if (paragraphs.length > 6) {
            var insertAfter = paragraphs[Math.floor(paragraphs.length / 3)];
            insertAfter.parentNode.insertBefore(cta, insertAfter.nextSibling);
        } else if (paragraphs.length > 2) {
            var insertAfter2 = paragraphs[2];
            insertAfter2.parentNode.insertBefore(cta, insertAfter2.nextSibling);
        }
    }

    // ========== PRODUCT RECOMMENDATIONS FOR BLOG ==========

    // Determine blog topic for product recs (verified ASINs, direct /dp links)
    var blogProducts = [];
    if (body.indexOf('power meter') !== -1 || body.indexOf('ftp') !== -1 || body.indexOf('cycling power') !== -1) {
        blogProducts = [
            { name: 'Favero Assioma Duo', asin: 'B071JRXDKT', image: 'https://m.media-amazon.com/images/I/31jTk6g3iHL._SL500_.jpg', price: '~$628', desc: 'Dual-sided power meter pedals. Move between bikes with standard tools.' },
            { name: 'Garmin Edge 540', asin: 'B0BT36VBGM', image: 'https://m.media-amazon.com/images/I/41NtDVjOE3L._SL500_.jpg', price: '~$313', desc: 'Cycling computer with power-based training metrics and maps.' },
            { name: 'Wahoo KICKR Core 2', asin: 'B0FLQDCR7X', image: 'https://m.media-amazon.com/images/I/310nAfwgifL._SL500_.jpg', price: '~$549', desc: 'Direct-drive smart trainer with Zwift Cog for structured FTP workouts.' }
        ];
    } else if (body.indexOf('heart rate') !== -1 || body.indexOf('hr monitor') !== -1 || body.indexOf('chest strap') !== -1) {
        blogProducts = [
            { name: 'Polar H10', asin: 'B07PM54P4N', image: 'https://m.media-amazon.com/images/I/31ej46yR6aL._SL500_.jpg', price: '~$104', desc: 'Chest strap with dual Bluetooth and ANT+ for accurate zone training.' },
            { name: 'Garmin HRM 600', asin: 'B0F7ZGDDCX', image: 'https://m.media-amazon.com/images/I/31DLbvOQoNL._SL500_.jpg', price: '~$158', desc: 'Garmin flagship chest strap with running dynamics data.' },
            { name: 'Wahoo TRACKR', asin: 'B0D52P8XS1', image: 'https://m.media-amazon.com/images/I/31Co6Uv-awL._SL500_.jpg', price: '~$99', desc: 'Rechargeable chest strap that pairs with all major training apps.' }
        ];
    } else if (body.indexOf('running shoe') !== -1 || body.indexOf('marathon') !== -1 || body.indexOf('running form') !== -1) {
        blogProducts = [
            { name: 'Garmin Forerunner 265', asin: 'B0DVMWYCHD', image: 'https://m.media-amazon.com/images/I/51qrOvMYPOL._SL500_.jpg', price: '~$379', desc: 'AMOLED GPS watch with training readiness and HRV status.' },
            { name: 'Nike Vaporfly 3', asin: 'B0DJGBQT45', image: 'https://m.media-amazon.com/images/I/31LeuoQnEXL._SL500_.jpg', price: '~$155', desc: 'Carbon-plated racing shoe for 5K to marathon distances.' },
            { name: 'Shokz OpenRun Pro 2', asin: 'B0D2HKCMBP', image: 'https://m.media-amazon.com/images/I/219Zog3I5TL._SL500_.jpg', price: '~$179', desc: 'Open-ear headphones that leave surroundings audible while running.' }
        ];
    } else if (body.indexOf('recovery') !== -1 || body.indexOf('massage') !== -1 || body.indexOf('foam roll') !== -1) {
        blogProducts = [
            { name: 'Theragun Prime (6th Gen)', asin: 'B0H78D8R9Q', image: 'https://m.media-amazon.com/images/I/31ij9FmvFiL._SL500_.jpg', price: '~$329', desc: 'Percussion massage gun with app-guided routines.' },
            { name: 'TriggerPoint GRID Roller', asin: 'B0040EKZDY', image: 'https://m.media-amazon.com/images/I/41hOuseNM1L._SL500_.jpg', price: '~$28', desc: 'Multi-density roller for myofascial release.' },
            { name: 'Hyperice Normatec 3', asin: 'B0B72QBWHC', image: 'https://m.media-amazon.com/images/I/31twvW0rxML._SL500_.jpg', price: '~$899', desc: 'Dynamic air compression boots with adjustable pressure levels.' }
        ];
    } else if (body.indexOf('nutrition') !== -1 || body.indexOf('fueling') !== -1 || body.indexOf('gel') !== -1 || body.indexOf('hydration') !== -1) {
        blogProducts = [
            { name: 'GU Energy Gel 24-Pack', asin: 'B00CQ7QDQA', image: 'https://m.media-amazon.com/images/I/41HBmkFLheL._SL500_.jpg', price: '~$49', desc: '24-pack of easy-to-digest carbohydrate gels for endurance events.' },
            { name: 'Precision Fuel PF60 Drink Mix', asin: 'B0BSXQ56N6', image: 'https://m.media-amazon.com/images/I/41jxx9toENL._SL500_.jpg', price: '~$31', desc: 'Carb and electrolyte drink mix with 60g of carbohydrate per serving.' },
            { name: 'Nathan Hydration Vest (2L)', asin: 'B01NALJI53', image: 'https://m.media-amazon.com/images/I/41RrOBRPGLL._SL500_.jpg', price: '~$74', desc: 'Carries 2L of water plus nutrition for long runs.' }
        ];
    } else if (body.indexOf('triathlon') !== -1 || body.indexOf('ironman') !== -1) {
        blogProducts = [
            { name: 'Garmin Forerunner 965', asin: 'B0BS1TN8QL', image: 'https://m.media-amazon.com/images/I/41-mKcvYRwL._SL500_.jpg', price: '~$599', desc: 'Multisport GPS watch with AMOLED display and maps.' },
            { name: 'Favero Assioma Duo', asin: 'B071JRXDKT', image: 'https://m.media-amazon.com/images/I/31jTk6g3iHL._SL500_.jpg', price: '~$628', desc: 'Power meter pedals that move between bikes.' },
            { name: 'GU Energy Gel 24-Pack', asin: 'B00CQ7QDQA', image: 'https://m.media-amazon.com/images/I/41HBmkFLheL._SL500_.jpg', price: '~$49', desc: 'Carbohydrate gels for swim-bike-run fueling.' }
        ];
    }

    // Skip if page already has many affiliate links
    if (document.querySelectorAll('[href*="tag=runbikecalc-20"]').length > 3) return;

    if (blogProducts.length > 0) {
        var footer = document.querySelector('footer');
        if (!footer) return;

        var section = document.createElement('div');
        section.style.cssText = 'max-width: 72rem; margin: 2rem auto; padding: 1.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);';

        var title = document.createElement('h3');
        title.style.cssText = 'font-size: 1.25rem; color: #1a1a1a; margin-bottom: 0.5rem; font-family: Playfair Display, serif;';
        title.textContent = 'Recommended Gear';
        section.appendChild(title);

        var disc = document.createElement('p');
        disc.style.cssText = 'font-size: 0.75rem; color: #64748b; margin-bottom: 1rem;';
        disc.textContent = 'As an Amazon Associate, we earn from qualifying purchases.';
        section.appendChild(disc);

        var grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;';

        blogProducts.forEach(function(p) {
            var url = 'https://www.amazon.com/dp/' + p.asin + '?tag=' + AFFILIATE_TAG;

            var card = document.createElement('div');
            card.style.cssText = 'background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb;';

            var imgLink = document.createElement('a');
            imgLink.href = url;
            imgLink.target = '_blank';
            imgLink.rel = 'nofollow sponsored noopener';
            var img = document.createElement('img');
            img.src = p.image;
            img.alt = p.name;
            img.loading = 'lazy';
            img.style.cssText = 'height: 120px; width: 100%; object-fit: contain; display: block; margin: 0 auto 0.75rem;';
            imgLink.appendChild(img);
            card.appendChild(imgLink);

            var h4 = document.createElement('h4');
            h4.style.cssText = 'color: #C67B4E; margin: 0 0 0.5rem; font-size: 0.95rem; font-family: Playfair Display, serif;';
            var titleLink = document.createElement('a');
            titleLink.href = url;
            titleLink.target = '_blank';
            titleLink.rel = 'nofollow sponsored noopener';
            titleLink.style.cssText = 'color: inherit; text-decoration: none;';
            titleLink.textContent = p.name;
            h4.appendChild(titleLink);
            card.appendChild(h4);

            var desc = document.createElement('p');
            desc.style.cssText = 'margin: 0 0 0.5rem; color: #4b5563; font-size: 0.85rem; line-height: 1.4;';
            desc.textContent = p.desc;
            card.appendChild(desc);

            var price = document.createElement('p');
            price.style.cssText = 'margin: 0 0 0.75rem; color: #1a1a1a; font-size: 0.85rem; font-weight: 600;';
            price.textContent = p.price;
            card.appendChild(price);

            var link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'nofollow sponsored noopener';
            link.style.cssText = 'display: inline-block; background: #C67B4E; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.8rem;';
            link.textContent = 'View on Amazon';
            card.appendChild(link);

            grid.appendChild(card);
        });

        section.appendChild(grid);
        footer.parentNode.insertBefore(section, footer);
    }
})();
