#!/usr/bin/env node
/**
 * Test CustomerReviews eligibility
 */

require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');

const HOST = 'webservices.amazon.com';
const REGION = 'us-east-1';
const SERVICE = 'ProductAdvertisingAPI';

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

async function testReviews() {
    const accessKey = process.env.AMAZON_ACCESS_KEY;
    const secretKey = process.env.AMAZON_SECRET_KEY;
    const partnerTag = process.env.AMAZON_PARTNER_TAG;

    // Test with a popular product that definitely has reviews
    const payload = JSON.stringify({
        ItemIds: ['B0BS1T9J4Y'],  // Garmin Forerunner 265
        PartnerTag: partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
        Resources: [
            'CustomerReviews.Count',
            'CustomerReviews.StarRating',
            'ItemInfo.Title'
        ]
    });

    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const headers = createSignedHeaders(accessKey, secretKey, payload, timestamp);

    console.log('Testing CustomerReviews eligibility...\n');
    console.log('Request payload:', payload);
    console.log('\n');

    const response = await fetch(`https://${HOST}/paapi5/getitems`, {
        method: 'POST',
        headers,
        body: payload
    });

    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('\nFull response:');
    console.log(JSON.stringify(JSON.parse(text), null, 2));
}

testReviews().catch(console.error);
