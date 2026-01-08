/**
 * Product Recommendations for RunBikeCalc
 * Shows contextual Amazon affiliate products after calculator results
 */

const AFFILIATE_TAG = 'runbikecalc-20';

// Product database organized by category
const productDatabase = {
    // Heart Rate Monitors - for HR zone calculators
    heartRateMonitors: {
        premium: {
            name: 'Polar H10 Heart Rate Monitor',
            search: 'Polar+H10+Heart+Rate+Monitor',
            description: 'Gold standard chest strap with dual connectivity. Best accuracy for serious training.'
        },
        midRange: {
            name: 'Garmin HRM-Pro Plus',
            search: 'Garmin+HRM+Pro+Plus',
            description: 'Advanced running dynamics with ground contact time and vertical oscillation.'
        },
        budget: {
            name: 'Wahoo TICKR Heart Rate Monitor',
            search: 'Wahoo+TICKR+Heart+Rate+Monitor',
            description: 'Reliable, comfortable chest strap. Works with all major training apps.'
        },
        optical: {
            name: 'Polar Verity Sense',
            search: 'Polar+Verity+Sense',
            description: 'Armband optical sensor. Great for swimming and activities where chest straps are uncomfortable.'
        }
    },

    // Running Watches - for pace/VO2 max calculators
    runningWatches: {
        premium: {
            name: 'Garmin Forerunner 965',
            search: 'Garmin+Forerunner+965',
            description: 'Full-featured GPS watch with AMOLED display, maps, and advanced training metrics.'
        },
        midRange: {
            name: 'Garmin Forerunner 265',
            search: 'Garmin+Forerunner+265',
            description: 'Excellent value with AMOLED display, training readiness, and HRV status.'
        },
        budget: {
            name: 'COROS PACE 3',
            search: 'COROS+PACE+3',
            description: 'Lightweight GPS watch with impressive battery life and training features.'
        },
        beginner: {
            name: 'Garmin Forerunner 55',
            search: 'Garmin+Forerunner+55',
            description: 'Perfect first GPS watch. Daily suggested workouts and recovery time advisor.'
        }
    },

    // Cycling Power & Computers - for FTP/power calculators
    cyclingPower: {
        powerMeter: {
            name: 'Favero Assioma Duo Power Pedals',
            search: 'Favero+Assioma+Duo+power+meter',
            description: 'Accurate dual-sided power measurement. Easy installation on any bike.'
        },
        bikeComputer: {
            name: 'Garmin Edge 540',
            search: 'Garmin+Edge+540',
            description: 'Full-featured cycling computer with power-based training metrics and maps.'
        },
        smartTrainer: {
            name: 'Wahoo KICKR CORE',
            search: 'Wahoo+KICKR+CORE+smart+trainer',
            description: 'Accurate direct-drive trainer. Perfect for structured FTP training indoors.'
        },
        budgetComputer: {
            name: 'Wahoo ELEMNT BOLT V2',
            search: 'Wahoo+ELEMNT+BOLT+V2',
            description: 'Clean interface, easy setup. Automatic syncing with training platforms.'
        }
    },

    // Fitness Trackers - for general fitness calculators
    fitnessTrackers: {
        whoop: {
            name: 'WHOOP 4.0 Fitness Band',
            search: 'WHOOP+4.0+fitness+tracker',
            description: 'Advanced recovery and strain tracking. 24/7 monitoring with no screen distractions.'
        },
        garmin: {
            name: 'Garmin Venu 3',
            search: 'Garmin+Venu+3',
            description: 'Beautiful AMOLED display with comprehensive health and fitness tracking.'
        },
        oura: {
            name: 'Oura Ring Gen 3',
            search: 'Oura+Ring+Gen+3',
            description: 'Discrete ring form factor. Best-in-class sleep and recovery tracking.'
        },
        budget: {
            name: 'Fitbit Charge 6',
            search: 'Fitbit+Charge+6',
            description: 'Affordable tracker with HR zones, stress management, and workout tracking.'
        }
    },

    // Running Shoes - for pace/training calculators
    runningShoes: {
        daily: {
            name: 'Nike Pegasus 41',
            search: 'Nike+Pegasus+41+running+shoes',
            description: 'Versatile daily trainer. Comfortable for easy runs and tempo workouts.'
        },
        racing: {
            name: 'Nike Vaporfly 3',
            search: 'Nike+Vaporfly+3+running+shoes',
            description: 'Carbon-plated race day shoe. PR potential for 5K to marathon distances.'
        },
        cushioned: {
            name: 'ASICS Gel-Nimbus 26',
            search: 'ASICS+Gel+Nimbus+26',
            description: 'Maximum cushioning for high-mileage runners. Great for recovery runs.'
        },
        lightweight: {
            name: 'Saucony Kinvara 15',
            search: 'Saucony+Kinvara+15',
            description: 'Light and responsive. Perfect for tempo runs and faster training.'
        }
    },

    // Recovery Tools - for recovery calculators
    recoveryTools: {
        massageGun: {
            name: 'Theragun Elite',
            search: 'Theragun+Elite+massage+gun',
            description: 'Powerful percussion therapy. Quiet operation with app-guided routines.'
        },
        foamRoller: {
            name: 'TriggerPoint GRID Foam Roller',
            search: 'TriggerPoint+GRID+foam+roller',
            description: 'Durable foam roller with multi-density surface. Essential for myofascial release.'
        },
        compressionBoots: {
            name: 'Normatec 3 Leg Recovery System',
            search: 'Normatec+3+compression+boots',
            description: 'Dynamic compression therapy. Accelerates recovery between hard sessions.'
        }
    },

    // Training Accessories
    accessories: {
        hydration: {
            name: 'Nathan Running Vest',
            search: 'Nathan+running+hydration+vest',
            description: 'Comfortable hydration for long runs. Carries water, nutrition, and phone.'
        },
        headphones: {
            name: 'Shokz OpenRun Pro',
            search: 'Shokz+OpenRun+Pro+bone+conduction',
            description: 'Bone conduction headphones. Hear music AND your surroundings for safe running.'
        },
        nutrition: {
            name: 'GU Energy Gel Variety Pack',
            search: 'GU+Energy+Gel+variety+pack',
            description: 'Race-day fuel. Easy-to-digest carbs for runs over 60 minutes.'
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
    'sweat-test': ['accessories']
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
 * Build Amazon search URL
 * @param {string} searchTerms - URL-encoded search terms
 * @returns {string} Full Amazon search URL with affiliate tag
 */
function buildAmazonUrl(searchTerms) {
    return `https://www.amazon.com/s?k=${searchTerms}&tag=${AFFILIATE_TAG}`;
}

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
    disclosure.textContent = 'As an Amazon Associate, we earn from qualifying purchases.';
    container.appendChild(disclosure);

    // Create product grid
    const grid = document.createElement('div');
    grid.className = 'product-cards-grid';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const cardTitle = document.createElement('h4');
        cardTitle.textContent = product.name;
        card.appendChild(cardTitle);

        const cardDesc = document.createElement('p');
        cardDesc.textContent = product.description;
        card.appendChild(cardDesc);

        const cardLink = document.createElement('a');
        cardLink.href = buildAmazonUrl(product.search);
        cardLink.target = '_blank';
        cardLink.rel = 'noopener sponsored';
        cardLink.className = 'btn-amazon';
        cardLink.textContent = 'View on Amazon';
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
        productDatabase,
        AFFILIATE_TAG
    };
}
