/**
 * Test script for Campaign CSV Upload
 * Tests the /api/campaigns/upload endpoint with sample_companies.csv
 * 
 * Usage: node test-campaign-upload.js
 * Requires: Node.js 18+ (for native fetch API)
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'https://www.trevnoctilla.com';
const CSV_FILE_PATH = path.join(__dirname, 'sample_companies.csv');

// You can override the URL by setting TEST_URL environment variable:
// TEST_URL=https://your-domain.com node test-campaign-upload.js

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

async function testCampaignUpload() {
  logSection('Campaign CSV Upload Test');

  try {
    // Step 1: Check if CSV file exists
    log('Step 1: Checking CSV file...', 'cyan');
    if (!fs.existsSync(CSV_FILE_PATH)) {
      log(`ERROR: CSV file not found at ${CSV_FILE_PATH}`, 'red');
      process.exit(1);
    }
    
    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    log(`Found CSV file (${csvContent.length} bytes)`, 'green');
    log('CSV Content:', 'yellow');
    console.log(csvContent);
    console.log('');

    // Step 2: Create FormData and append file
    log('Step 2: Creating form data...', 'cyan');
    const csvBuffer = fs.readFileSync(CSV_FILE_PATH);
    const blob = new Blob([csvBuffer], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', blob, 'sample_companies.csv');
    log('Form data created', 'green');

    // Step 3: Send request to upload endpoint
    log('Step 3: Sending upload request...', 'cyan');
    log(`POST ${BASE_URL}/api/campaigns/upload`, 'blue');
    
    const response = await fetch(`${BASE_URL}/api/campaigns/upload`, {
      method: 'POST',
      body: formData,
    });

    log(`Response Status: ${response.status} ${response.statusText}`, 
        response.ok ? 'green' : 'red');

    // Step 4: Parse response
    log('Step 4: Parsing response...', 'cyan');
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      log('Response Data:', 'yellow');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      log('Response Text:', 'yellow');
      console.log(text);
      data = { error: 'Non-JSON response', text };
    }

    // Step 5: Validate results
    logSection('Test Results');
    
    if (response.ok && data.success) {
      log('TEST PASSED!', 'green');
      log(`Total Rows: ${data.data.totalRows}`, 'green');
      log(`Valid Rows: ${data.data.validRows}`, 'green');
      log(`Invalid Rows: ${data.data.invalidRows}`, 'yellow');
      
      if (data.data.rows && data.data.rows.length > 0) {
        log('\nParsed Rows:', 'cyan');
        data.data.rows.forEach((row, idx) => {
          console.log(`\nRow ${idx + 1}:`);
          console.log(`  Company: ${row.company_name}`);
          console.log(`  Website: ${row.website_url}`);
          console.log(`  Email: ${row.contact_email || 'N/A'}`);
          console.log(`  Phone: ${row.phone || 'N/A'}`);
        });
      }
      
      process.exit(0);
    } else {
      log('TEST FAILED!', 'red');
      log(`Error: ${data.error || 'Unknown error'}`, 'red');
      
      if (data.headers) {
        log('\nDetected Headers:', 'yellow');
        console.log(data.headers);
      }
      
      process.exit(1);
    }

  } catch (error) {
    logSection('Test Error');
    log('EXCEPTION OCCURRED!', 'red');
    log(`Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
log('Starting Campaign Upload Test...', 'bright');
log(`Target: ${BASE_URL}`, 'blue');
log(`CSV File: ${CSV_FILE_PATH}`, 'blue');
console.log('');

testCampaignUpload();
