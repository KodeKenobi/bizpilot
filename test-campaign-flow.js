#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.trevnoctilla.com';
const BACKEND_URL = process.env.BACKEND_URL || 'https://web-production-737b.up.railway.app';
const CSV_FILE_PATH = path.join(__dirname, 'sample_companies.csv');

log('\n=== Complete Campaign Flow Test ===', 'bright');
log(`Frontend: ${FRONTEND_URL}`, 'yellow');
log(`Backend: ${BACKEND_URL}`, 'yellow');
log('', 'reset');

async function testCampaignFlow() {
  try {
    // =====================================================
    // Step 1: Upload CSV
    // =====================================================
    log('[Step 1/6] Uploading CSV file...', 'cyan');
    
    if (!fs.existsSync(CSV_FILE_PATH)) {
      log(`ERROR: CSV file not found at ${CSV_FILE_PATH}`, 'red');
      log('Creating sample CSV file...', 'yellow');
      const sampleCSV = `website_url,company_name,contact_email,phone
https://www.trevnoctilla.com,Trevnoctilla,info@trevnoctilla.com,+27630291420
https://www.google.com,Google,contact@google.com,+1234567890`;
      fs.writeFileSync(CSV_FILE_PATH, sampleCSV);
      log('Sample CSV created', 'green');
    }

    const csvBuffer = fs.readFileSync(CSV_FILE_PATH);
    const blob = new Blob([csvBuffer], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', blob, 'test_companies.csv');

    const uploadResponse = await fetch(`${FRONTEND_URL}/api/campaigns/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed (${uploadResponse.status}): ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    log('✓ CSV uploaded successfully', 'green');
    log(`  - Valid rows: ${uploadData.data.validRows}`, 'yellow');
    log(`  - Total rows: ${uploadData.data.totalRows}`, 'yellow');

    // =====================================================
    // Step 2: Create Campaign
    // =====================================================
    log('\n[Step 2/6] Creating campaign...', 'cyan');

    const campaignData = {
      name: `Test Campaign ${new Date().toISOString()}`,
      message_template: 'Hello! This is a test message for automated contact form submission. Please ignore this test.',
      companies: uploadData.data.rows,
      email: 'demo@example.com',
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

    const createData = await createResponse.json();
    const campaignId = createData.campaign.id;
    log('✓ Campaign created successfully', 'green');
    log(`  - Campaign ID: ${campaignId}`, 'yellow');
    log(`  - Campaign Name: ${createData.campaign.name}`, 'yellow');
    log(`  - Total Companies: ${createData.campaign.total_companies}`, 'yellow');

    // =====================================================
    // Step 3: Fetch Campaign Details
    // =====================================================
    log('\n[Step 3/6] Fetching campaign details...', 'cyan');

    const detailResponse = await fetch(`${FRONTEND_URL}/api/campaigns/${campaignId}`);
    
    if (!detailResponse.ok) {
      const errorText = await detailResponse.text();
      throw new Error(`Failed to fetch campaign (${detailResponse.status}): ${errorText}`);
    }

    const detailData = await detailResponse.json();
    log('✓ Campaign details retrieved', 'green');
    log(`  - Status: ${detailData.campaign.status}`, 'yellow');
    log(`  - Progress: ${detailData.campaign.progress_percentage}%`, 'yellow');

    // =====================================================
    // Step 4: Fetch Campaign Companies
    // =====================================================
    log('\n[Step 4/6] Fetching campaign companies...', 'cyan');

    const companiesResponse = await fetch(`${FRONTEND_URL}/api/campaigns/${campaignId}/companies`);
    
    if (!companiesResponse.ok) {
      const errorText = await companiesResponse.text();
      throw new Error(`Failed to fetch companies (${companiesResponse.status}): ${errorText}`);
    }

    const companiesData = await companiesResponse.json();
    log('✓ Companies retrieved', 'green');
    log(`  - Total companies: ${companiesData.companies.length}`, 'yellow');
    companiesData.companies.forEach((company, idx) => {
      log(`  ${idx + 1}. ${company.company_name} (${company.website_url}) - Status: ${company.status}`, 'yellow');
    });

    // =====================================================
    // Step 5: Fetch All Campaigns
    // =====================================================
    log('\n[Step 5/6] Fetching all campaigns...', 'cyan');

    const listResponse = await fetch(`${FRONTEND_URL}/api/campaigns`);
    
    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      throw new Error(`Failed to fetch campaigns list (${listResponse.status}): ${errorText}`);
    }

    const listData = await listResponse.json();
    log('✓ Campaigns list retrieved', 'green');
    log(`  - Total campaigns: ${listData.campaigns?.length || 0}`, 'yellow');
    if (listData.campaigns && listData.campaigns.length > 0) {
      listData.campaigns.slice(0, 5).forEach((campaign, idx) => {
        log(`  ${idx + 1}. ${campaign.name} (ID: ${campaign.id}) - ${campaign.status}`, 'yellow');
      });
    }

    // =====================================================
    // Step 6: Test Frontend Pages (URLs)
    // =====================================================
    log('\n[Step 6/6] Frontend URLs to test:', 'cyan');
    log(`  ✓ Campaigns List: ${FRONTEND_URL}/campaigns`, 'green');
    log(`  ✓ Upload Page: ${FRONTEND_URL}/campaigns/upload`, 'green');
    log(`  ✓ Create Page: ${FRONTEND_URL}/campaigns/create`, 'green');
    log(`  ✓ Campaign Detail: ${FRONTEND_URL}/campaigns/${campaignId}`, 'green');
    log(`  ✓ Monitor Page: ${FRONTEND_URL}/campaigns/${campaignId}/monitor`, 'green');

    // =====================================================
    // Summary
    // =====================================================
    log('\n=== Test Summary ===', 'bright');
    log('✓ All API endpoints working', 'green');
    log('✓ CSV upload working', 'green');
    log('✓ Campaign creation working', 'green');
    log('✓ Campaign retrieval working', 'green');
    log('✓ Companies retrieval working', 'green');
    log('✓ No JSON parsing errors', 'green');
    log('\n✓ CAMPAIGN FLOW TEST PASSED!', 'green');
    log(`\n📋 Visit: ${FRONTEND_URL}/campaigns/${campaignId}`, 'blue');
    log(`🖥️  Monitor: ${FRONTEND_URL}/campaigns/${campaignId}/monitor`, 'blue');

  } catch (error) {
    log('\n✗ TEST FAILED!', 'red');
    log(`Error: ${error.message}`, 'red');
    if (error.stack) {
      log('\nStack trace:', 'yellow');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testCampaignFlow();
