const WebSocket = require('ws');
const fetch = require('node-fetch');

const BACKEND_URL = 'https://web-production-737b.up.railway.app';

async function testWebSocketConnection() {
    console.log('\x1b[36m\n=== Testing WebSocket Connection ===\x1b[0m');
    console.log(`\x1b[33mBackend: ${BACKEND_URL}\x1b[0m\n`);

    try {
        // Step 1: Get a campaign with companies
        console.log('\x1b[36m[Step 1] Getting campaign data...\x1b[0m');
        const campaignsResponse = await fetch(`${BACKEND_URL}/api/campaigns`);
        const campaignsData = await campaignsResponse.json();
        
        if (!campaignsData.campaigns || campaignsData.campaigns.length === 0) {
            throw new Error('No campaigns found. Create a campaign first.');
        }

        const campaign = campaignsData.campaigns[0];
        console.log(`\x1b[32m✓ Found campaign: ${campaign.name} (ID: ${campaign.id})\x1b[0m`);

        // Step 2: Get companies for this campaign
        console.log('\n\x1b[36m[Step 2] Getting companies...\x1b[0m');
        const companiesResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaign.id}/companies`);
        const companiesData = await companiesResponse.json();
        
        if (!companiesData.companies || companiesData.companies.length === 0) {
            throw new Error('No companies found in campaign.');
        }

        const company = companiesData.companies[0];
        console.log(`\x1b[32m✓ Found company: ${company.company_name} (ID: ${company.id})\x1b[0m`);
        console.log(`  URL: ${company.website_url}`);

        // Step 3: Test WebSocket connection
        console.log('\n\x1b[36m[Step 3] Testing WebSocket connection...\x1b[0m');
        const wsUrl = `wss://web-production-737b.up.railway.app/ws/campaign/${campaign.id}/monitor/${company.id}`;
        console.log(`\x1b[33mWebSocket URL: ${wsUrl}\x1b[0m\n`);

        const ws = new WebSocket(wsUrl);
        let connectionSuccessful = false;
        let receivedMessages = 0;

        ws.on('open', () => {
            console.log('\x1b[32m✅ WebSocket Connected!\x1b[0m');
            connectionSuccessful = true;
        });

        ws.on('message', (data) => {
            receivedMessages++;
            try {
                const message = JSON.parse(data.toString());
                console.log(`\x1b[35m[Message ${receivedMessages}]\x1b[0m Type: ${message.type}`);
                console.log(JSON.stringify(message, null, 2));
            } catch (e) {
                console.log(`\x1b[35m[Message ${receivedMessages}]\x1b[0m ${data.toString()}`);
            }
        });

        ws.on('error', (error) => {
            console.error('\x1b[31m❌ WebSocket Error:\x1b[0m', error.message);
        });

        ws.on('close', (code, reason) => {
            console.log(`\n\x1b[33m[WebSocket Closed]\x1b[0m Code: ${code}, Reason: ${reason || 'No reason provided'}`);
            
            if (connectionSuccessful && receivedMessages > 0) {
                console.log('\n\x1b[32m=== Test PASSED! ===\x1b[0m');
                console.log(`\x1b[32m✓ WebSocket connection established\x1b[0m`);
                console.log(`\x1b[32m✓ Received ${receivedMessages} message(s)\x1b[0m`);
                console.log(`\x1b[32m✓ Backend is ready for live monitoring!\x1b[0m\n`);
            } else if (connectionSuccessful) {
                console.log('\n\x1b[33m=== Test PARTIAL ===\x1b[0m');
                console.log(`\x1b[33m⚠ Connection established but no messages received\x1b[0m`);
                console.log(`\x1b[33m⚠ The scraper might need to be triggered manually\x1b[0m\n`);
            } else {
                console.log('\n\x1b[31m=== Test FAILED ===\x1b[0m');
                console.log(`\x1b[31m✗ Could not establish WebSocket connection\x1b[0m\n`);
            }
            
            process.exit(connectionSuccessful ? 0 : 1);
        });

        // Keep connection open for 15 seconds to receive messages
        console.log('\x1b[90m(Keeping connection open for 15 seconds to test messages...)\x1b[0m');
        setTimeout(() => {
            console.log('\n\x1b[36m[Closing connection after 15 seconds]\x1b[0m');
            ws.close();
        }, 15000);

    } catch (error) {
        console.error('\n\x1b[31m✗ Test Failed!\x1b[0m');
        console.error('\x1b[31mError:\x1b[0m', error.message);
        process.exit(1);
    }
}

// Run the test
testWebSocketConnection();
