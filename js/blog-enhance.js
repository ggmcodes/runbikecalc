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

    // Determine blog topic for product recs
    var blogProducts = [];
    if (body.indexOf('power meter') !== -1 || body.indexOf('ftp') !== -1 || body.indexOf('cycling power') !== -1) {
        blogProducts = [
            { name: 'Favero Assioma Duo', search: 'Favero+Assioma+Duo+power+meter', desc: 'Accurate dual-sided power pedals. Easy install on any bike.' },
            { name: 'Garmin Edge 540', search: 'Garmin+Edge+540', desc: 'Cycling computer with power-based training metrics.' },
            { name: 'Wahoo KICKR CORE', search: 'Wahoo+KICKR+CORE+smart+trainer', desc: 'Direct-drive trainer for structured FTP workouts.' }
        ];
    } else if (body.indexOf('heart rate') !== -1 || body.indexOf('hr monitor') !== -1 || body.indexOf('chest strap') !== -1) {
        blogProducts = [
            { name: 'Polar H10', search: 'Polar+H10+Heart+Rate+Monitor', desc: 'Gold standard chest strap for accurate zone training.' },
            { name: 'Garmin HRM-Pro Plus', search: 'Garmin+HRM+Pro+Plus', desc: 'Advanced running dynamics with HR data.' },
            { name: 'Wahoo TICKR', search: 'Wahoo+TICKR+Heart+Rate+Monitor', desc: 'Reliable chest strap for all training apps.' }
        ];
    } else if (body.indexOf('running shoe') !== -1 || body.indexOf('marathon') !== -1 || body.indexOf('running form') !== -1) {
        blogProducts = [
            { name: 'Garmin Forerunner 265', search: 'Garmin+Forerunner+265', desc: 'AMOLED GPS watch with training readiness.' },
            { name: 'Nike Vaporfly 3', search: 'Nike+Vaporfly+3', desc: 'Carbon-plated race shoe for PR potential.' },
            { name: 'Shokz OpenRun Pro', search: 'Shokz+OpenRun+Pro', desc: 'Bone conduction headphones for safe running.' }
        ];
    } else if (body.indexOf('recovery') !== -1 || body.indexOf('massage') !== -1 || body.indexOf('foam roll') !== -1) {
        blogProducts = [
            { name: 'Theragun Elite', search: 'Theragun+Elite+massage+gun', desc: 'Powerful percussion therapy for recovery.' },
            { name: 'TriggerPoint GRID Roller', search: 'TriggerPoint+GRID+foam+roller', desc: 'Multi-density roller for myofascial release.' },
            { name: 'Normatec 3', search: 'Normatec+3+compression+boots', desc: 'Compression therapy for faster recovery.' }
        ];
    } else if (body.indexOf('nutrition') !== -1 || body.indexOf('fueling') !== -1 || body.indexOf('gel') !== -1 || body.indexOf('hydration') !== -1) {
        blogProducts = [
            { name: 'GU Energy Gel Variety Pack', search: 'GU+Energy+Gel+variety+pack', desc: 'Race-day fuel for endurance events.' },
            { name: 'Precision Hydration', search: 'Precision+Hydration+electrolytes', desc: 'Stronger electrolytes for endurance.' },
            { name: 'Nathan Hydration Vest', search: 'Nathan+running+hydration+vest', desc: 'Carries water and nutrition for long runs.' }
        ];
    } else if (body.indexOf('triathlon') !== -1 || body.indexOf('ironman') !== -1) {
        blogProducts = [
            { name: 'Garmin Forerunner 965', search: 'Garmin+Forerunner+965', desc: 'Top multisport GPS watch with maps.' },
            { name: 'Favero Assioma Duo', search: 'Favero+Assioma+Duo+power+meter', desc: 'Power pedals that move between bikes.' },
            { name: 'GU Energy Gel Variety', search: 'GU+Energy+Gel+variety+pack', desc: 'Essential fuel for swim-bike-run.' }
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
            var card = document.createElement('div');
            card.style.cssText = 'background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb;';

            var h4 = document.createElement('h4');
            h4.style.cssText = 'color: #C67B4E; margin: 0 0 0.5rem; font-size: 0.95rem; font-family: Playfair Display, serif;';
            h4.textContent = p.name;
            card.appendChild(h4);

            var desc = document.createElement('p');
            desc.style.cssText = 'margin: 0 0 0.75rem; color: #4b5563; font-size: 0.85rem; line-height: 1.4;';
            desc.textContent = p.desc;
            card.appendChild(desc);

            var link = document.createElement('a');
            link.href = 'https://www.amazon.com/s?k=' + p.search + '&tag=' + AFFILIATE_TAG;
            link.target = '_blank';
            link.rel = 'noopener sponsored';
            link.style.cssText = 'display: inline-block; background: #C67B4E; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.8rem;';
            link.textContent = 'View on Amazon';
            card.appendChild(link);

            grid.appendChild(card);
        });

        section.appendChild(grid);
        footer.parentNode.insertBefore(section, footer);
    }
})();
