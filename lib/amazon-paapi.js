/**
 * Amazon Product Advertising API Client
 * Fetches product data including images from Amazon PA-API 5.0
 *
 * Usage:
 *   const { fetchProductImages } = require('./lib/amazon-paapi');
 *   const products = await fetchProductImages(['B09GM8JZM9', 'B08FF4GV5C']);
 */

const crypto = require('crypto');

const HOST = 'webservices.amazon.com';
const REGION = 'us-east-1';
const SERVICE = 'ProductAdvertisingAPI';

/**
 * Create AWS4 signed headers for PA-API request
 */
function createSignedHeaders(accessKey, secretKey, payload, timestamp) {
    const date = timestamp.substring(0, 8);

    const headers = {
        'content-encoding': 'amz-1.0',
        'content-type': 'application/json; charset=utf-8',
        'host': HOST,
        'x-amz-date': timestamp,
        'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
    };

    const signedHeadersList = Object.keys(headers).sort().join(';');
    const canonicalHeaders = Object.keys(headers).sort()
        .map(key => `${key}:${headers[key]}`)
        .join('\n') + '\n';

    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

    const canonicalRequest = [
        'POST',
        '/paapi5/getitems',
        '',
        canonicalHeaders,
        signedHeadersList,
        payloadHash
    ].join('\n');

    const credentialScope = `${date}/${REGION}/${SERVICE}/aws4_request`;

    const stringToSign = [
        'AWS4-HMAC-SHA256',
        timestamp,
        credentialScope,
        crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    // Create signing key
    const kDate = crypto.createHmac('sha256', 'AWS4' + secretKey).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(REGION).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(SERVICE).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();

    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    return {
        ...headers,
        'authorization': `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeadersList}, Signature=${signature}`
    };
}

/**
 * Fetch product data from Amazon PA-API
 * @param {string[]} asins - Array of ASINs (max 10 per request)
 * @param {Object} config - API credentials { accessKey, secretKey, partnerTag }
 * @returns {Promise<Object>} Product data keyed by ASIN
 */
async function fetchProductData(asins, config) {
    const { accessKey, secretKey, partnerTag } = config;

    if (!accessKey || !secretKey || !partnerTag) {
        throw new Error('Missing Amazon PA-API credentials');
    }

    if (asins.length > 10) {
        throw new Error('Maximum 10 ASINs per request');
    }

    const payload = JSON.stringify({
        ItemIds: asins,
        PartnerTag: partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
        Resources: [
            'ItemInfo.Title',
            'Images.Primary.Large',
            'Images.Primary.Medium',
            'Offers.Listings.Price',
            'CustomerReviews.StarRating',
            'CustomerReviews.Count'
        ]
    });

    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const headers = createSignedHeaders(accessKey, secretKey, payload, timestamp);

    const response = await fetch(`https://${HOST}/paapi5/getitems`, {
        method: 'POST',
        headers,
        body: payload
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`PA-API error ${response.status}: ${text}`);
    }

    return response.json();
}

/**
 * Fetch product images for multiple ASINs
 * @param {string[]} asins - Array of ASINs
 * @param {Object} config - API credentials
 * @returns {Promise<Object>} Products with image URLs, keyed by ASIN
 */
async function fetchProductImages(asins, config) {
    const results = {};

    // Process in batches of 10
    for (let i = 0; i < asins.length; i += 10) {
        const batch = asins.slice(i, i + 10);

        try {
            const data = await fetchProductData(batch, config);

            if (data.ItemsResult?.Items) {
                for (const item of data.ItemsResult.Items) {
                    results[item.ASIN] = {
                        asin: item.ASIN,
                        title: item.ItemInfo?.Title?.DisplayValue || null,
                        image: item.Images?.Primary?.Large?.URL || null,
                        imageMedium: item.Images?.Primary?.Medium?.URL || null,
                        price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || null,
                        starRating: item.CustomerReviews?.StarRating?.Value || null,
                        reviewCount: item.CustomerReviews?.Count || null,
                        url: `https://www.amazon.com/dp/${item.ASIN}?tag=${config.partnerTag}`
                    };
                }
            }

            // Log errors for items not found
            if (data.Errors) {
                for (const error of data.Errors) {
                    console.warn(`  Warning: ${error.Code} - ${error.Message}`);
                }
            }

            // Rate limit: wait 2 seconds between batches to avoid throttling
            if (i + 10 < asins.length) {
                await new Promise(resolve => setTimeout(resolve, 2500));
            }
        } catch (error) {
            console.error(`Error fetching batch starting at index ${i}:`, error.message);
        }
    }

    return results;
}

/**
 * Load config from environment variables
 */
function loadConfig() {
    return {
        accessKey: process.env.AMAZON_ACCESS_KEY,
        secretKey: process.env.AMAZON_SECRET_KEY,
        partnerTag: process.env.AMAZON_PARTNER_TAG || 'runbikecalc-20'
    };
}

module.exports = {
    fetchProductData,
    fetchProductImages,
    createSignedHeaders,
    loadConfig,
    HOST,
    REGION,
    SERVICE
};
