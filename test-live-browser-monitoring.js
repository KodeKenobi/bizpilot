const WebSocket = require('ws');
const fetch = require('node-fetch');

const BACKEND_URL = 'https://web-production-737b.up.railway.app';
const FRONTEND_URL = 'https://www.trevnoctilla.com';

async function testLiveBrowserMonitoring() {
    console.log('\x1b[36m\n=== Testing LIVE Browser Monitoring ===\x1b[0m');
    console.log('\x1b[33mThis will open a website and show you the automation in real-time!\x1b[0m\n');

    try {
        // Step 1: Get or create a campaign with companies
        console.log('\x1b[36m[Step 1] Getting latest campaign...\x1b[0m');
        const campaignsResponse = await fetch(`${BACKEND_URL}/api/campaigns`);
        const campaignsData = await campaignsResponse.json();
        
        let campaign = null;
        if (campaignsData.campaigns && campaignsData.campaigns.length > 0) {
            campaign = campaignsData.campaigns[0]; // Get most recent
            console.log(`\x1b[32m✓ Using existing campaign: ${campaign.name} (ID: ${campaign.id})\x1b[0m\n`);
        } else {
            throw new Error('No campaigns found. Run test-production-direct.js first to create one.');
        }

        // Step 2: Get companies for this campaign
        console.log('\x1b[36m[Step 2] Getting companies from campaign...\x1b[0m');
        const companiesResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaign.id}/companies`);
        const companiesData = await companiesResponse.json();
        
        if (!companiesData.companies || companiesData.companies.length === 0) {
            throw new Error('No companies found in campaign.');
        }

        const company = companiesData.companies[0];
        console.log(`\x1b[32m✓ Selected: ${company.company_name} (${company.website_url})\x1b[0m`);
        console.log(`\x1b[33mCompany ID: ${company.id}\x1b[0m\n`);

        // Step 3: Connect to WebSocket for live monitoring
        console.log('\x1b[36m[Step 3] Connecting to live browser stream...\x1b[0m');
        const wsUrl = `wss://web-production-737b.up.railway.app/ws/campaign/${campaign.id}/monitor/${company.id}`;
        console.log(`\x1b[33mWebSocket URL: ${wsUrl}\x1b[0m\n`);

        const ws = new WebSocket(wsUrl);

        ws.on('open', () => {
            console.log('\x1b[32m✓ Connected to live browser stream!\x1b[0m');
            console.log('\x1b[36m\n=== LIVE BROWSER AUTOMATION ===\x1b[0m');
            console.log('\x1b[33mYou should see the browser opening and navigating...\x1b[0m\n');
        });

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                
                if (message.type === 'status') {
                    console.log(`\x1b[35m[STATUS]\x1b[0m ${message.data}`);
                } else if (message.type === 'log') {
                    const log = message.data;
                    const color = log.status === 'success' ? '\x1b[32m' :
                                 log.status === 'failed' ? '\x1b[31m' :
                                 log.status === 'warning' ? '\x1b[33m' : '\x1b[36m';
                    console.log(`${color}[${log.action}]\x1b[0m ${log.message}`);
                } else if (message.type === 'logs_batch') {
                    message.data.forEach(log => {
                        const color = log.status === 'success' ? '\x1b[32m' :
                                     log.status === 'failed' ? '\x1b[31m' :
                                     log.status === 'warning' ? '\x1b[33m' : '\x1b[36m';
                        console.log(`${color}[${log.action}]\x1b[0m ${log.message}`);
                    });
                } else if (message.type === 'screenshot') {
                    const currentUrl = message.current_url || 'unknown';
                    console.log(`\x1b[35m[SCREENSHOT]\x1b[0m Browser is at: ${currentUrl}`);
                    console.log(`\x1b[90m  Screenshot size: ${(message.data.length / 1024).toFixed(2)} KB\x1b[0m`);
                    
                    // If there are logs with the screenshot, display them
                    if (message.logs && message.logs.length > 0) {
                        message.logs.forEach(log => {
                            const color = log.status === 'success' ? '\x1b[32m' :
                                         log.status === 'failed' ? '\x1b[31m' :
                                         log.status === 'warning' ? '\x1b[33m' : '\x1b[36m';
                            console.log(`${color}[${log.action}]\x1b[0m ${log.message}`);
                        });
                    }
                } else if (message.type === 'error') {
                    console.error(`\x1b[31m[ERROR]\x1b[0m ${message.message}`);
                }
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        });

        ws.on('error', (error) => {
            console.error('\x1b[31m[WebSocket Error]\x1b[0m', error.message);
        });

        ws.on('close', () => {
            console.log('\n\x1b[33m[WebSocket Closed]\x1b[0m Live monitoring session ended.');
            console.log('\n\x1b[32m=== Test Complete! ===\x1b[0m');
            console.log(`\x1b[35mView results in browser: ${FRONTEND_URL}/campaigns/${campaign.id}/monitor\x1b[0m\n`);
            process.exit(0);
        });

        // Keep the script running
        console.log('\x1b[90m(Press Ctrl+C to stop monitoring)\x1b[0m\n');

    } catch (error) {
        console.error('\n\x1b[31m✗ Test Failed!\x1b[0m');
        console.error('\x1b[31mError:\x1b[0m', error.message);
        process.exit(1);
    }
}

// Run the test
testLiveBrowserMonitoring();
