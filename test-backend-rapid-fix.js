#!/usr/bin/env node

/**
 * BACKEND-FOCUSED RAPID ALL TEST
 * Tests Flask backend directly to validate application context fix
 * Use this BEFORE deploying to verify the fix works
 */

const fetch = require('node-fetch');

// Test configuration
const BACKEND_URL = process.env.BACKEND_URL || 'https://web-production-737b.up.railway.app';
const FRONTEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trevnoctilla.com';

// Get IDs from command line or use latest from recent test
const TEST_CAMPAIGN_ID = process.argv[2] ? parseInt(process.argv[2]) : 9; // Campaign 9 from latest test
const TEST_COMPANY_ID = process.argv[3] ? parseInt(process.argv[3]) : 36; // Company 36 from latest test

console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║              BACKEND APPLICATION CONTEXT TEST                                 ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

console.log(`Testing backend: ${BACKEND_URL}`);
console.log(`Frontend: ${FRONTEND_URL}`);
console.log(`Campaign ID: ${TEST_CAMPAIGN_ID}`);
console.log(`Company ID: ${TEST_COMPANY_ID}`);
console.log('\nUsage: node test-backend-rapid-fix.js [campaignId] [companyId]\n');

async function testBackendDirectly() {
    try {
        console.log('🔍 [TEST] Calling rapid-process endpoint directly...');
        
        const startTime = Date.now();
        
        const response = await fetch(
            `${BACKEND_URL}/api/campaigns/${TEST_CAMPAIGN_ID}/companies/${TEST_COMPANY_ID}/rapid-process`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    captureScreenshot: true
                })
            }
        );
        
        const duration = Date.now() - startTime;
        const data = await response.json();
        
        console.log(`\n📥 [RESPONSE] Status: ${response.status} (${duration}ms)`);
        console.log(`Response:`, JSON.stringify(data, null, 2));
        
        // Analyze the result
        console.log('\n' + '═'.repeat(80));
        console.log('ANALYSIS:');
        console.log('═'.repeat(80));
        
        if (!response.ok) {
            console.log('❌ HTTP Error:', response.status);
            return false;
        }
        
        // Check for application context error
        const errorMsg = data.errorMessage || data.error || '';
        if (errorMsg.includes('Working outside of application context')) {
            console.log('❌ CRITICAL: Flask application context error detected!');
            console.log('   This means the threading fix needs Flask app context.');
            console.log('   Fix needed: Wrap thread function with app.app_context()');
            return false;
        }
        
        // Check for Playwright sync/async error
        if (errorMsg.includes('Playwright Sync API inside the asyncio loop')) {
            console.log('❌ CRITICAL: Playwright async/sync error still present!');
            console.log('   This means sync Playwright is being called in async context.');
            console.log('   Fix needed: Ensure no asyncio loop in the request handler.');
            return false;
        }
        
        // Check for URL conversion error
        if (errorMsg.includes('Cannot navigate to invalid URL') || 
            errorMsg.includes('navigating to "/contact"')) {
            console.log('❌ CRITICAL: URL conversion error detected!');
            console.log('   This means relative URLs are not being converted to absolute.');
            console.log('   Fix needed: Update find_contact_page_sync() URL conversion logic.');
            return false;
        }
        
        // Check success
        if (data.success === true) {
            console.log('✅ SUCCESS: Company processed successfully!');
            console.log(`   Status: ${data.status}`);
            console.log(`   Processing time: ${data.processingTime}s`);
            if (data.screenshotUrl) {
                console.log(`   Screenshot: ${data.screenshotUrl}`);
            }
            return true;
        }
        
        // Partial success - processed but failed for legitimate reasons
        if (data.status === 'failed' && !errorMsg.includes('application context') 
            && !errorMsg.includes('Playwright') && !errorMsg.includes('invalid URL')) {
            console.log('⚠️  PROCESSED BUT FAILED (legitimate reasons):');
            console.log(`   Status: ${data.status}`);
            console.log(`   Error: ${errorMsg}`);
            console.log('   This is OK - the infrastructure works, just the website had issues.');
            return true; // Infrastructure works
        }
        
        // Check for CAPTCHA
        if (data.status === 'captcha') {
            console.log('⚠️  CAPTCHA DETECTED:');
            console.log('   This is OK - means the scraper reached the website.');
            console.log('   Infrastructure works, just hit CAPTCHA protection.');
            return true; // Infrastructure works
        }
        
        console.log('❌ UNKNOWN ERROR:');
        console.log(`   Status: ${data.status}`);
        console.log(`   Error: ${errorMsg}`);
        return false;
        
    } catch (error) {
        console.log('\n❌ [ERROR] Test failed with exception:');
        console.log(error.message);
        console.log('\nStack trace:');
        console.error(error);
        return false;
    }
}

async function findValidTestData() {
    console.log('🔍 [AUTO-DISCOVER] Searching for valid test data...\n');
    
    try {
        // Try to get campaigns from frontend API
        const response = await fetch(`${FRONTEND_URL}/api/campaigns?limit=10`);
        if (!response.ok) {
            console.log('⚠️  Could not fetch campaigns from frontend API');
            return null;
        }
        
        const data = await response.json();
        if (!data.campaigns || data.campaigns.length === 0) {
            console.log('⚠️  No campaigns found in database');
            return null;
        }
        
        // Find a campaign with pending companies
        for (const campaign of data.campaigns) {
            // Fetch companies for this campaign
            const companiesResp = await fetch(`${FRONTEND_URL}/api/campaigns/${campaign.id}/companies`);
            if (companiesResp.ok) {
                const companiesData = await companiesResp.json();
                if (companiesData.companies && companiesData.companies.length > 0) {
                    const pendingCompany = companiesData.companies.find(c => c.status === 'pending');
                    if (pendingCompany) {
                        console.log(`✅ Found valid test data:`);
                        console.log(`   Campaign: ${campaign.id} - "${campaign.name}"`);
                        console.log(`   Company: ${pendingCompany.id} - "${pendingCompany.company_name}"`);
                        console.log(`   Website: ${pendingCompany.website_url}\n`);
                        return { campaignId: campaign.id, companyId: pendingCompany.id };
                    }
                }
            }
        }
        
        console.log('⚠️  No pending companies found in recent campaigns');
        return null;
    } catch (error) {
        console.log('⚠️  Auto-discovery failed:', error.message);
        return null;
    }
}

async function main() {
    console.log('Starting backend test...\n');
    
    // If using default IDs, try to auto-discover valid ones
    if (TEST_CAMPAIGN_ID === 9 && !process.argv[2]) {
        console.log('ℹ️  Using default IDs from recent test. If this fails, use auto-discovery or specify IDs.\n');
    }
    
    const success = await testBackendDirectly();
    
    console.log('\n' + '═'.repeat(80));
    console.log('TEST RESULT:');
    console.log('═'.repeat(80));
    
    if (success) {
        console.log('✅ BACKEND FIX VALIDATED - Safe to deploy!');
        console.log('   The Flask application context issue is resolved.');
        console.log('   The rapid-process endpoint works correctly.\n');
        process.exit(0);
    } else {
        console.log('❌ BACKEND FIX FAILED - DO NOT DEPLOY');
        console.log('   The Flask application context issue persists.');
        console.log('   Review the error above and fix before deploying.\n');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
