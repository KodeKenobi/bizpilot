/**
 * Test script for Campaign Export functionality
 * Tests the /api/campaigns/[id]/export endpoint
 *
 * Usage: node test-campaign-export.js
 * Requires: Node.js 18+ (for native fetch API)
 */

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const CAMPAIGN_ID = process.env.CAMPAIGN_ID || '1'; // Use a test campaign ID

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

async function testCampaignExport() {
  logSection('Campaign Export API Test');

  try {
    // Test export with default options
    log('Testing export with default options...', 'cyan');
    const exportUrl = `${BASE_URL}/api/campaigns/${CAMPAIGN_ID}/export`;

    log(`Export URL: ${exportUrl}`, 'blue');

    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    log(`Response status: ${response.status}`, response.ok ? 'green' : 'red');

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      log(`Error: ${errorData.error}`, 'red');
      return;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    log(`Content-Type: ${contentType}`, 'blue');

    if (contentType && contentType.includes('spreadsheetml')) {
      log('✓ Excel file content type detected', 'green');

      // Get content length
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        log(`File size: ${contentLength} bytes`, 'blue');
      }

      // Test with custom options
      log('\nTesting export with custom options...', 'cyan');
      const customParams = new URLSearchParams({
        completedColor: '#10B981', // Green
        failedColor: '#EF4444',   // Red
        includeComments: 'true',
        commentStyle: 'detailed'
      });

      const customExportUrl = `${BASE_URL}/api/campaigns/${CAMPAIGN_ID}/export?${customParams}`;
      log(`Custom export URL: ${customExportUrl}`, 'blue');

      const customResponse = await fetch(customExportUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      log(`Custom response status: ${customResponse.status}`, customResponse.ok ? 'green' : 'red');

      if (customResponse.ok) {
        const customContentType = customResponse.headers.get('content-type');
        log(`Custom Content-Type: ${customContentType}`, 'blue');

        if (customContentType && customContentType.includes('spreadsheetml')) {
          log('✓ Custom Excel file generated successfully', 'green');
        } else {
          log('⚠ Unexpected content type for custom export', 'yellow');
        }
      } else {
        const errorData = await customResponse.json().catch(() => ({ error: 'Unknown error' }));
        log(`Custom export error: ${errorData.error}`, 'red');
      }

      log('\n✓ Campaign export functionality is working!', 'green');

    } else {
      log('⚠ Unexpected content type - may not be an Excel file', 'yellow');
      const text = await response.text();
      log(`Response text: ${text.substring(0, 200)}...`, 'yellow');
    }

  } catch (error) {
    log(`Test failed with error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run the test
testCampaignExport().catch(console.error);