const fetch = require('node-fetch');

const BACKEND_URL = 'https://web-production-737b.up.railway.app';

async function testBackendDirect() {
    console.log('\x1b[36m\n=== Testing Backend Directly ===\x1b[0m');
    console.log(`\x1b[33mBackend: ${BACKEND_URL}\x1b[0m\n`);

    try {
        // Test GET /api/campaigns
        console.log('\x1b[36m[Test 1] GET /api/campaigns\x1b[0m');
        const listResponse = await fetch(`${BACKEND_URL}/api/campaigns`);
        console.log(`Status: ${listResponse.status}`);
        const listData = await listResponse.json();
        console.log('Response:', JSON.stringify(listData, null, 2));
        console.log('');

        // Test GET /api/campaigns/:id
        if (listData.campaigns && listData.campaigns.length > 0) {
            const campaignId = listData.campaigns[0].id;
            console.log(`\x1b[36m[Test 2] GET /api/campaigns/${campaignId}\x1b[0m`);
            const detailResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaignId}`);
            console.log(`Status: ${detailResponse.status}`);
            const detailData = await detailResponse.json();
            console.log('Response:', JSON.stringify(detailData, null, 2));
        }

        console.log('\n\x1b[32m✓ Backend Direct Test Complete!\x1b[0m\n');
    } catch (error) {
        console.error('\n\x1b[31m✗ Test Failed!\x1b[0m');
        console.error('\x1b[31mError:\x1b[0m', error.message);
    }
}

testBackendDirect();
