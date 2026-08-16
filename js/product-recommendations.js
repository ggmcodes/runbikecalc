/**
 * Product Recommendations for RunBikeCalc
 * Shows contextual product recommendations after calculator results
 * All links are direct /dp/ASIN product links (verified ASINs only).
 */

const AFFILIATE_TAG = 'runbikecalc-20';

// Product database organized by category
const productDatabase = {
    // Heart Rate Monitors - for HR zone calculators
    heartRateMonitors: {
        premium: {
            name: 'Polar H10 Heart Rate Monitor',
            asin: 'B07PM54P4N',
            image: 'https://m.media-amazon.com/images/I/31ej46yR6aL._SL500_.jpg',
            price: '~$104',
            description: 'Chest strap with dual Bluetooth and ANT+ connectivity. Widely used as the accuracy reference for zone training.'
        },
        midRange: {
            name: 'Garmin HRM 600',
            asin: 'B0F7ZGDDCX',
            image: 'https://m.media-amazon.com/images/I/31DLbvOQoNL._SL500_.jpg',
            price: '~$158',
            description: 'Garmin flagship chest strap. Captures running dynamics including ground contact time and vertical oscillation.'
        },
        budget: {
            name: 'Wahoo TRACKR Heart Rate Monitor',
            asin: 'B0D52P8XS1',
            image: 'https://m.media-amazon.com/images/I/31Co6Uv-awL._SL500_.jpg',
            price: '~$99',
            description: 'Rechargeable Bluetooth and ANT+ chest strap. Pairs with all major training apps.'
        },
        optical: {
            name: 'Polar Verity Sense',
            asin: 'B08TRGNGF6',
            image: 'https://m.media-amazon.com/images/I/41QlylPwR0L._SL500_.jpg',
            price: '~$104',
            description: 'Optical armband sensor. An option for swimming and activities where chest straps are uncomfortable.'
        }
    },

    // Running Watches - for pace/VO2 max calculators
    runningWatches: {
        premium: {
            name: 'Garmin Forerunner 965',
            asin: 'B0BS1TN8QL',
            image: 'https://m.media-amazon.com/images/I/41-mKcvYRwL._SL500_.jpg',
            price: '~$599',
            description: 'Full-featured GPS watch with AMOLED display, maps, and advanced training metrics.'
        },
        midRange: {
            name: 'Garmin Forerunner 265',
            asin: 'B0DVMWYCHD',
            image: 'https://m.media-amazon.com/images/I/51qrOvMYPOL._SL500_.jpg',
            price: '~$379',
            description: 'AMOLED display with training readiness, HRV status, and VO2 max estimation.'
        },
        budget: {
            name: 'COROS PACE 4',
            asin: 'B0FYGTCX83',
            image: 'https://m.media-amazon.com/images/I/31oMzJX467L._SL500_.jpg',
            price: '~$249',
            description: 'Lightweight GPS watch with long battery life and structured training features.'
        },
        beginner: {
            name: 'Garmin Forerunner 55',
            asin: 'B092RCLKHN',
            image: 'https://m.media-amazon.com/images/I/31Ra93nqGTS._SL500_.jpg',
            price: '~$129',
            description: 'Entry-level GPS watch with daily suggested workouts and a recovery time advisor.'
        }
    },

    // Cycling Power & Computers - for FTP/power calculators
    cyclingPower: {
        powerMeter: {
            name: 'Favero Assioma Duo Power Meter Pedals',
            asin: 'B071JRXDKT',
            image: 'https://m.media-amazon.com/images/I/31jTk6g3iHL._SL500_.jpg',
            price: '~$628',
            description: 'Dual-sided power measurement pedals. Move between bikes with standard tools.'
        },
        bikeComputer: {
            name: 'Garmin Edge 540',
            asin: 'B0BT36VBGM',
            image: 'https://m.media-amazon.com/images/I/41NtDVjOE3L._SL500_.jpg',
            price: '~$313',
            description: 'Cycling computer with power-based training metrics and turn-by-turn maps.'
        },
        smartTrainer: {
            name: 'Wahoo KICKR Core 2',
            asin: 'B0FLQDCR7X',
            image: 'https://m.media-amazon.com/images/I/310nAfwgifL._SL500_.jpg',
            price: '~$549',
            description: 'Direct-drive smart trainer with Zwift Cog. Built for structured FTP training indoors.'
        },
        budgetComputer: {
            name: 'Wahoo ELEMNT Bolt 3',
            asin: 'B0F4KR66TB',
            image: 'https://m.media-amazon.com/images/I/11YfAG5Zi0L._SL500_.jpg',
            price: '~$321',
            description: 'Compact cycling computer with color display and automatic syncing to training platforms.'
        }
    },

    // Fitness Trackers - for general fitness calculators
    fitnessTrackers: {
        whoop: {
            name: 'WHOOP 5.0 (12-Month Peak Membership)',
            asin: 'B0DY2SWV16',
            image: 'https://m.media-amazon.com/images/I/31wN2FZpfZL._SL500_.jpg',
            price: '~$239',
            description: 'Screenless band with 12 months of Peak membership included. Tracks recovery, strain, and sleep around the clock.'
        },
        garmin: {
            name: 'Garmin Venu 3',
            asin: 'B0H4RLFDC3',
            image: 'https://m.media-amazon.com/images/I/41yoK0GiYXL._SL500_.jpg',
            price: '~$289',
            description: 'AMOLED smartwatch with comprehensive health and fitness tracking.'
        },
        oura: {
            name: 'Oura Ring 5',
            asin: 'B0GRJVBPH3',
            image: 'https://m.media-amazon.com/images/I/3186ZZyOykL._SL500_.jpg',
            price: '~$399',
            description: 'Ring form factor for sleep and recovery tracking. Sized product, so pick your size on the Amazon page.'
        },
        budget: {
            name: 'Fitbit Charge 6',
            asin: 'B0FM9BKKPP',
            image: 'https://m.media-amazon.com/images/I/41J7zLD+2aL._SL500_.jpg',
            price: '~$149',
            description: 'Tracker with HR zones, stress management, and workout tracking.'
        }
    },

    // Running Shoes - for pace/training calculators
    runningShoes: {
        daily: {
            name: 'Nike Pegasus 41',
            asin: 'B0DM6YG8C7',
            image: 'https://m.media-amazon.com/images/I/41vUF0LOVLL._SL500_.jpg',
            price: '~$119',
            description: 'Versatile daily trainer for easy runs and tempo workouts.'
        },
        racing: {
            name: 'Nike Vaporfly 3',
            asin: 'B0DJGBQT45',
            image: 'https://m.media-amazon.com/images/I/31LeuoQnEXL._SL500_.jpg',
            price: '~$155',
            description: 'Carbon-plated racing shoe built for 5K to marathon distances.'
        },
        cushioned: {
            name: 'ASICS Gel-Nimbus 27',
            asin: 'B0D42DBK41',
            image: 'https://m.media-amazon.com/images/I/31RZzto5wxL._SL500_.jpg',
            price: '~$104',
            description: 'Max-cushion trainer for high-mileage runners and recovery runs.'
        },
        lightweight: {
            name: 'Saucony Kinvara 15',
            asin: 'B0D31YYYFJ',
            image: 'https://m.media-amazon.com/images/I/31PDHIspbKL._SL500_.jpg',
            price: '~$74',
            description: 'Light, responsive trainer suited to tempo runs and faster training.'
        }
    },

    // Recovery Tools - for recovery calculators
    recoveryTools: {
        massageGun: {
            name: 'Theragun Prime (6th Gen)',
            asin: 'B0H78D8R9Q',
            image: 'https://m.media-amazon.com/images/I/31ij9FmvFiL._SL500_.jpg',
            price: '~$329',
            description: 'Percussion massage gun with quiet operation and app-guided routines.'
        },
        foamRoller: {
            name: 'TriggerPoint GRID Foam Roller',
            asin: 'B0040EKZDY',
            image: 'https://m.media-amazon.com/images/I/41hOuseNM1L._SL500_.jpg',
            price: '~$28',
            description: 'Multi-density foam roller for myofascial release.'
        },
        compressionBoots: {
            name: 'Hyperice Normatec 3 Compression Boots',
            asin: 'B0B72QBWHC',
            image: 'https://m.media-amazon.com/images/I/31twvW0rxML._SL500_.jpg',
            price: '~$899',
            description: 'Dynamic air compression boots with adjustable pressure levels for between-session recovery.'
        }
    },

    // Training Accessories
    accessories: {
        hydration: {
            name: 'Nathan Hydration Vest (2L)',
            asin: 'B01NALJI53',
            image: 'https://m.media-amazon.com/images/I/41RrOBRPGLL._SL500_.jpg',
            price: '~$74',
            description: 'Hydration vest with 2L capacity. Carries water, nutrition, and a phone on long runs.'
        },
        headphones: {
            name: 'Shokz OpenRun Pro 2',
            asin: 'B0D2HKCMBP',
            image: 'https://m.media-amazon.com/images/I/219Zog3I5TL._SL500_.jpg',
            price: '~$179',
            description: 'Open-ear headphones that leave your surroundings audible while running.'
        },
        nutrition: {
            name: 'GU Energy Gel 24-Pack',
            asin: 'B00CQ7QDQA',
            image: 'https://m.media-amazon.com/images/I/41HBmkFLheL._SL500_.jpg',
            price: '~$49',
            description: '24-pack of energy gels. Easy-to-digest carbs for runs over 60 minutes.'
        }
    },

    // Nutrition Tracking
    nutritionTracking: {
        scale: {
            name: 'Greater Goods Nutrition Scale',
            asin: 'B00O5U4NDQ',
            image: 'https://m.media-amazon.com/images/I/51HQWmRaeLL._SL500_.jpg',
            price: '~$35',
            description: 'Precision food scale with a built-in nutrition database for calorie and macro tracking.'
        },
        premiumScale: {
            name: 'Etekcity Kitchen Scale',
            asin: 'B0113UZJE2',
            image: 'https://m.media-amazon.com/images/I/419W-HulagL._SL500_.jpg',
            price: '~$13',
            description: 'Digital kitchen scale with gram-level precision for portion weighing.'
        },
        mealPrep: {
            name: 'Rubbermaid Brilliance Containers',
            asin: 'B079M8FPTW',
            image: 'https://m.media-amazon.com/images/I/41cjuw9BjDL._SL500_.jpg',
            price: '~$24',
            description: 'Leak-resistant containers for portion-controlled meal prep.'
        }
    }
};

// Calculator to product category mapping
const calculatorProductMap = {
    // Heart Rate Calculators
    'max-heart-rate': ['heartRateMonitors'],
    'heart-rate-zone': ['heartRateMonitors'],
    'target-heart-rate': ['heartRateMonitors'],
    'zone-2': ['heartRateMonitors', 'runningWatches'],
    'lthr-zone': ['heartRateMonitors'],
    'karvonen': ['heartRateMonitors'],
    'aerobic-anaerobic': ['heartRateMonitors'],
    'advanced-hr-zones': ['heartRateMonitors'],

    // Running Calculators
    'running-pace': ['runningWatches', 'runningShoes'],
    'race-pace': ['runningWatches', 'runningShoes'],
    'vo2-max': ['runningWatches', 'heartRateMonitors'],
    'cooper-test': ['runningWatches'],
    'age-graded': ['runningWatches', 'runningShoes'],
    'treadmill-pace': ['runningShoes', 'accessories'],
    'run-walk': ['runningWatches', 'runningShoes'],
    'pace-converter': ['runningWatches'],
    'calories-running': ['fitnessTrackers'],
    'lactate-threshold': ['heartRateMonitors', 'runningWatches'],

    // Cycling Calculators
    'ftp': ['cyclingPower'],
    'ftp-improvement': ['cyclingPower'],
    'power-to-weight': ['cyclingPower'],
    'cadence-speed': ['cyclingPower'],
    'bike-gearing': ['cyclingPower'],
    'watts-to-calories': ['cyclingPower'],
    'ymca-cycle': ['cyclingPower', 'fitnessTrackers'],

    // Fitness Calculators
    'bmi': ['fitnessTrackers'],
    'body-composition': ['fitnessTrackers'],
    'recovery': ['recoveryTools', 'fitnessTrackers'],
    'training-load': ['runningWatches', 'heartRateMonitors'],
    'sweat-test': ['accessories'],

    // Nutrition Calculators
    'rmr': ['nutritionTracking', 'fitnessTrackers']
};

/**
 * Get product recommendations for a calculator type
 * @param {string} calculatorType - Type of calculator (e.g., 'ftp', 'heart-rate-zone')
 * @param {object} calculatorResults - Optional results to customize recommendations
 * @returns {array} Array of product recommendations
 */
function getProductRecommendations(calculatorType, calculatorResults = {}) {
    const categories = calculatorProductMap[calculatorType] || ['fitnessTrackers'];
    const recommendations = [];

    categories.forEach(category => {
        const products = productDatabase[category];
        if (!products) return;

        // Select 1-2 products from each category based on context
        const productKeys = Object.keys(products);

        // Get primary recommendation (premium or best-fit)
        const primaryKey = productKeys[0];
        if (products[primaryKey]) {
            recommendations.push({
                ...products[primaryKey],
                category: category
            });
        }

        // Get secondary recommendation (budget or alternative)
        if (productKeys.length > 2) {
            const budgetKey = productKeys.find(k => k.includes('budget')) || productKeys[2];
            if (products[budgetKey] && recommendations.length < 3) {
                recommendations.push({
                    ...products[budgetKey],
                    category: category
                });
            }
        }
    });

    // Limit to 3 recommendations max
    return recommendations.slice(0, 3);
}

/**
 * Build a direct Amazon product URL from an ASIN
 * @param {string} asin - Amazon ASIN (verified product)
 * @returns {string} Direct /dp/ product URL with affiliate tag
 */
function buildAmazonUrl(asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

// Alias with a clearer name; same behavior
const buildDpUrl = buildAmazonUrl;

/**
 * Render product recommendations to a container
 * @param {string} containerId - ID of the container element
 * @param {string} calculatorType - Type of calculator
 * @param {object} results - Optional calculator results for context
 */
function renderProductRecommendations(containerId, calculatorType, results = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const products = getProductRecommendations(calculatorType, results);
    if (products.length === 0) return;

    // Clear existing content
    container.replaceChildren();

    // Create title
    const title = document.createElement('h3');
    title.className = 'recommendations-title';
    title.textContent = 'Gear to Level Up Your Training';
    container.appendChild(title);

    // Create disclosure
    const disclosure = document.createElement('p');
    disclosure.className = 'affiliate-disclosure';
    disclosure.textContent = 'Product links may earn us a commission at no additional cost to you.';
    container.appendChild(disclosure);

    // Create product grid
    const grid = document.createElement('div');
    grid.className = 'product-cards-grid';

    products.forEach(product => {
        const url = buildAmazonUrl(product.asin);

        const card = document.createElement('div');
        card.className = 'product-card';

        // Product image, wrapped in the same /dp link
        const imageLink = document.createElement('a');
        imageLink.href = url;
        imageLink.target = '_blank';
        imageLink.rel = 'nofollow sponsored noopener';

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        img.loading = 'lazy';
        img.style.cssText = 'height: 140px; width: 100%; object-fit: contain; display: block; margin: 0 auto 0.75rem;';
        imageLink.appendChild(img);
        card.appendChild(imageLink);

        // Title as a link to the same /dp URL
        const cardTitle = document.createElement('h4');
        const titleLink = document.createElement('a');
        titleLink.href = url;
        titleLink.target = '_blank';
        titleLink.rel = 'nofollow sponsored noopener';
        titleLink.textContent = product.name;
        titleLink.style.cssText = 'color: inherit; text-decoration: none;';
        cardTitle.appendChild(titleLink);
        card.appendChild(cardTitle);

        const cardDesc = document.createElement('p');
        cardDesc.textContent = product.description;
        card.appendChild(cardDesc);

        // Approximate price line
        if (product.price) {
            const cardPrice = document.createElement('p');
            cardPrice.className = 'product-price';
            cardPrice.textContent = product.price;
            cardPrice.style.cssText = 'font-weight: 600; margin: 0 0 0.5rem;';
            card.appendChild(cardPrice);
        }

        const cardLink = document.createElement('a');
        cardLink.href = url;
        cardLink.target = '_blank';
        cardLink.rel = 'nofollow sponsored noopener';
        cardLink.className = 'btn-amazon';
        cardLink.textContent = 'Check Price';
        card.appendChild(cardLink);

        grid.appendChild(card);
    });

    container.appendChild(grid);
}

/**
 * Convenience function to show recommendations after calculation
 * Call this from your calculator's calculate function
 * @param {string} calculatorType - Type identifier for the calculator
 */
function showRecommendationsAfterCalculation(calculatorType) {
    // Look for common recommendation container IDs
    const containerIds = ['recommendations', 'productRecommendations', 'product-recommendations'];

    for (const id of containerIds) {
        const container = document.getElementById(id);
        if (container) {
            renderProductRecommendations(id, calculatorType);
            return;
        }
    }
}

// Export for use in calculator scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getProductRecommendations,
        renderProductRecommendations,
        showRecommendationsAfterCalculation,
        buildAmazonUrl,
        buildDpUrl,
        productDatabase,
        AFFILIATE_TAG
    };
}
