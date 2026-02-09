const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Use backend directly (bypassing frontend API which is still deploying)
const BACKEND_URL = 'https://web-production-737b.up.railway.app';
const FRONTEND_URL = 'https://www.trevnoctilla.com';

console.log('\x1b[36m\n=== Testing PRODUCTION Campaign System (Direct Backend) ===\x1b[0m');
console.log(`\x1b[33mBackend: ${BACKEND_URL}\x1b[0m`);
console.log(`\x1b[33mFrontend (for viewing): ${FRONTEND_URL}\x1b[0m\n`);

// Test CSV data
const TEST_CSV = `name,website,email,phone
Trevnoctilla,https://www.trevnoctilla.com,info@trevnoctilla.com,+27630291420
Example Corp,https://example.com,hello@example.com,+9876543210`;

async function testProductionCampaign() {
    try {
        // Step 1: Create campaign with companies directly
        console.log('\x1b[36m[Step 1] Creating campaign with companies...\x1b[0m');
        
        const companies = [
            {
                company_name: "Trevnoctilla",
                website_url: "https://www.trevnoctilla.com",
                contact_email: "info@trevnoctilla.com",
                phone: "+27630291420"
            },
            {
                company_name: "Example Corp",
                website_url: "https://example.com",
                contact_email: "hello@example.com",
                phone: "+9876543210"
            }
        ];

        const campaignData = {
            name: `Production Test - ${new Date().toISOString()}`,
            message_template: 'Hello {company_name}! This is an automated test message. Visit: {website_url}',
            companies: companies
        };

        const createResponse = await fetch(`${BACKEND_URL}/api/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(campaignData),
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Campaign creation failed (${createResponse.status}): ${errorText}`);
        }

        const createResult = await createResponse.json();
        const campaign = createResult.campaign;
        console.log('\x1b[32m✓ Campaign created!\x1b[0m');
        console.log('\x1b[33mCampaign ID:\x1b[0m', campaign.id);
        console.log('\x1b[33mCampaign Name:\x1b[0m', campaign.name);
        console.log('\x1b[33mTotal Companies:\x1b[0m', campaign.total_companies);
        console.log('');

        // Step 2: Get campaign details
        console.log('\x1b[36m[Step 2] Fetching campaign details...\x1b[0m');
        const detailsResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaign.id}`);
        
        if (!detailsResponse.ok) {
            throw new Error(`Failed to fetch campaign details (${detailsResponse.status})`);
        }

        const detailsResult = await detailsResponse.json();
        const details = detailsResult.campaign;
        console.log('\x1b[32m✓ Campaign details retrieved!\x1b[0m');
        console.log('\x1b[33mStatus:\x1b[0m', details.status);
        console.log('');

        // Step 3: Get companies for this campaign
        console.log('\x1b[36m[Step 3] Fetching companies...\x1b[0m');
        const companiesResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaign.id}/companies`);
        
        if (companiesResponse.ok) {
            const companiesResult = await companiesResponse.json();
            console.log('\x1b[32m✓ Companies retrieved!\x1b[0m');
            console.log(`Found ${companiesResult.companies.length} companies:`);
            companiesResult.companies.forEach((c, i) => {
                console.log(`  ${i + 1}. ${c.company_name} - ${c.website_url} (Status: ${c.status})`);
            });
        }
        console.log('');

        // Step 4: Start the campaign
        console.log('\x1b[36m[Step 4] Starting campaign processing...\x1b[0m');
        const startResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaign.id}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!startResponse.ok) {
            const errorText = await startResponse.text();
            throw new Error(`Failed to start campaign (${startResponse.status}): ${errorText}`);
        }

        const startResult = await startResponse.json();
        console.log('\x1b[32m✓ Campaign started!\x1b[0m');
        console.log('\x1b[33mMessage:\x1b[0m', startResult.message);
        console.log('');

        // Step 5: Monitor campaign progress
        console.log('\x1b[36m[Step 5] Monitoring campaign progress...\x1b[0m');
        console.log('\x1b[33mWatch live automation at:\x1b[0m');
        console.log(`\x1b[35m${FRONTEND_URL}/campaigns/${campaign.id}/monitor\x1b[0m\n`);

        // Poll for updates
        console.log('\x1b[33mPolling for updates (30 seconds)...\x1b[0m');
        for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const statusResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaign.id}`);
            if (statusResponse.ok) {
                const statusResult = await statusResponse.json();
                const status = statusResult.campaign;
                console.log(`\x1b[36m[${i * 5}s]\x1b[0m Status: ${status.status} | Processed: ${status.processed_count || 0}/${status.total_companies || 0} | Success: ${status.success_count || 0} | Failed: ${status.failed_count || 0}`);
            }
        }

        // Step 6: Get final results
        console.log('\n\x1b[36m[Step 6] Fetching final results...\x1b[0m');
        const finalResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaign.id}`);
        
        if (finalResponse.ok) {
            const finalResult = await finalResponse.json();
            const final = finalResult.campaign;
            console.log('\x1b[32m✓ Campaign Results:\x1b[0m');
            console.log(`  Status: ${final.status}`);
            console.log(`  Total Companies: ${final.total_companies}`);
            console.log(`  Processed: ${final.processed_count || 0}`);
            console.log(`  Success: ${final.success_count || 0}`);
            console.log(`  Failed: ${final.failed_count || 0}`);
            console.log(`  Flagged (CAPTCHA/etc): ${final.captcha_count || 0}`);
        }

        console.log('\n\x1b[32m=== Production Test Complete! ===\x1b[0m');
        console.log(`\x1b[35mView full results: ${FRONTEND_URL}/campaigns/${campaign.id}\x1b[0m`);
        console.log(`\x1b[35mWatch live: ${FRONTEND_URL}/campaigns/${campaign.id}/monitor\x1b[0m\n`);

    } catch (error) {
        console.error('\n\x1b[31m✗ Test Failed!\x1b[0m');
        console.error('\x1b[31mError:\x1b[0m', error.message);
        
        if (error.stack) {
            console.error('\n\x1b[90mStack trace:\x1b[0m');
            console.error(error.stack);
        }
        
        process.exit(1);
    }
}

// Run the test
testProductionCampaign();
