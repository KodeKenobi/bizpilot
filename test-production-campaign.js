const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Production URLs
const FRONTEND_URL = 'https://www.trevnoctilla.com';
const BACKEND_URL = 'https://web-production-737b.up.railway.app';

console.log('\x1b[36m\n=== Testing PRODUCTION Campaign System ===\x1b[0m');
console.log(`\x1b[33mFrontend: ${FRONTEND_URL}\x1b[0m`);
console.log(`\x1b[33mBackend: ${BACKEND_URL}\x1b[0m\n`);

// Test CSV data
const TEST_CSV = `name,website,email,phone
Trevnoctilla,https://www.trevnoctilla.com,info@trevnoctilla.com,+27630291420
Google,https://www.google.com,contact@google.com,+1234567890
Example Corp,https://example.com,hello@example.com,+9876543210`;

async function testProductionCampaign() {
    try {
        // Step 1: Create test CSV file
        console.log('\x1b[36m[Step 1] Creating test CSV file...\x1b[0m');
        const csvPath = path.join(__dirname, 'test_campaign.csv');
        fs.writeFileSync(csvPath, TEST_CSV);
        console.log('\x1b[32m✓ CSV file created with 3 companies\x1b[0m\n');

        // Step 2: Upload CSV to create campaign
        console.log('\x1b[36m[Step 2] Uploading CSV to production API...\x1b[0m');
        const form = new FormData();
        form.append('file', fs.createReadStream(csvPath), {
            filename: 'test_campaign.csv',
            contentType: 'text/csv',
        });

        const uploadResponse = await fetch(`${FRONTEND_URL}/api/campaigns/upload`, {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed (${uploadResponse.status}): ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        console.log('\x1b[32m✓ CSV uploaded successfully!\x1b[0m');
        console.log('\x1b[33mUpload response:\x1b[0m', JSON.stringify(uploadData, null, 2));
        console.log('');

        // Step 3: Create campaign with message template
        console.log('\x1b[36m[Step 3] Creating campaign...\x1b[0m');
        const campaignData = {
            name: `Production Test Campaign - ${new Date().toISOString()}`,
            message_template: 'Hello {company_name}! This is a test message from our automated system. Visit us at {website_url}.',
            companies: uploadData.data.rows, // Use the parsed rows from upload
            email: 'test@example.com'
        };

        const createResponse = await fetch(`${FRONTEND_URL}/api/campaigns`, {
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
        const campaign = createResult.campaign || createResult; // Handle both response formats
        console.log('\x1b[32m✓ Campaign created!\x1b[0m');
        console.log('\x1b[33mCampaign ID:\x1b[0m', campaign.id);
        console.log('\x1b[33mCampaign Name:\x1b[0m', campaign.name);
        console.log('\x1b[33mTotal Companies:\x1b[0m', campaign.total_companies);
        console.log('');

        // Step 4: Get campaign details
        console.log('\x1b[36m[Step 4] Fetching campaign details...\x1b[0m');
        const detailsResponse = await fetch(`${FRONTEND_URL}/api/campaigns/${campaign.id}`);
        
        if (!detailsResponse.ok) {
            throw new Error(`Failed to fetch campaign details (${detailsResponse.status})`);
        }

        const detailsResult = await detailsResponse.json();
        const details = detailsResult.campaign || detailsResult; // Handle both response formats
        console.log('\x1b[32m✓ Campaign details retrieved!\x1b[0m');
        console.log('\x1b[33mStatus:\x1b[0m', details.status);
        console.log('');

        // Step 5: Start the campaign
        console.log('\x1b[36m[Step 5] Starting campaign processing...\x1b[0m');
        const startResponse = await fetch(`${FRONTEND_URL}/api/campaigns/${campaign.id}/start`, {
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

        // Step 6: Monitor campaign progress
        console.log('\x1b[36m[Step 6] Monitoring campaign progress...\x1b[0m');
        console.log('\x1b[33mYou can watch live automation at:\x1b[0m');
        console.log(`\x1b[35m${FRONTEND_URL}/campaigns/${campaign.id}/monitor\x1b[0m\n`);

        // Poll for updates
        console.log('\x1b[33mPolling for updates (30 seconds)...\x1b[0m');
        for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const statusResponse = await fetch(`${FRONTEND_URL}/api/campaigns/${campaign.id}`);
            if (statusResponse.ok) {
                const statusResult = await statusResponse.json();
                const status = statusResult.campaign || statusResult;
                console.log(`\x1b[36m[${i * 5}s]\x1b[0m Status: ${status.status} | Processed: ${status.processed_count || 0}/${status.total_companies || 0}`);
            }
        }

        // Step 7: Get final results
        console.log('\n\x1b[36m[Step 7] Fetching final results...\x1b[0m');
        const finalResponse = await fetch(`${FRONTEND_URL}/api/campaigns/${campaign.id}`);
        
        if (finalResponse.ok) {
            const finalResult = await finalResponse.json();
            const final = finalResult.campaign || finalResult;
            console.log('\x1b[32m✓ Campaign Results:\x1b[0m');
            console.log(`  Status: ${final.status}`);
            console.log(`  Total Companies: ${final.total_companies}`);
            console.log(`  Processed: ${final.processed_count || 0}`);
            console.log(`  Success: ${final.success_count || 0}`);
            console.log(`  Failed: ${final.failed_count || 0}`);
            console.log(`  Flagged (CAPTCHA/etc): ${final.flagged_count || 0}`);
        }

        console.log('\n\x1b[32m=== Production Test Complete! ===\x1b[0m');
        console.log(`\x1b[35mView full results: ${FRONTEND_URL}/campaigns/${campaign.id}\x1b[0m`);
        console.log(`\x1b[35mWatch live: ${FRONTEND_URL}/campaigns/${campaign.id}/monitor\x1b[0m\n`);

        // Clean up test file
        fs.unlinkSync(csvPath);

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
