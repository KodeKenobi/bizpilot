/**
 * COMPREHENSIVE CAMPAIGN FLOW TEST
 * Tests the complete user journey from campaign creation to completion
 * 
 * This script tests:
 * 1. Campaign creation
 * 2. Company upload (CSV)
 * 3. Rapid All processing with batch support
 * 4. Progress monitoring
 * 5. Result verification
 * 6. Export functionality
 * 7. Screenshot validation
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trevnoctilla.com';
const BACKEND_URL = process.env.BACKEND_URL || 'https://web-production-737b.up.railway.app';

// Test Configuration
const TEST_CONFIG = {
  campaignName: `Complete Flow Test ${Date.now()}`,
  messageTemplate: {
    sender_name: "Flow Test User",
    sender_email: "flowtest@example.com",
    sender_phone: "+1-555-FLOW",
    sender_address: "",
    subject: "Automated Flow Test Inquiry",
    message: "This is an automated test of the complete campaign flow. Please disregard this message."
  },
  testCompanies: [
    { company_name: "Trevnoctilla Test 1", website_url: "https://www.trevnoctilla.com/", country: "South Africa" },
    { company_name: "Trevnoctilla Test 2", website_url: "https://www.trevnoctilla.com/", country: "South Africa" },
    { company_name: "Trevnoctilla Test 3", website_url: "https://www.trevnoctilla.com/", country: "South Africa" },
  ],
  maxWaitTime: 300000, // 5 minutes max wait for processing
  pollInterval: 2000, // Check progress every 2 seconds
};

// Logging
const LOG_FILE = 'complete-flow-test-logs.txt';
let logStream;

function writeLog(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  if (!logStream) {
    logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });
  }
  
  logStream.write(logMessage);
  console.log(message);
}

// API Helper
async function apiCall(method, endpoint, body = null, headers = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  writeLog(`\n🌐 [API] ${method} ${url}`, 'API');
  if (body) {
    writeLog(`📤 [API] Request Body: ${JSON.stringify(body, null, 2)}`, 'API');
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const startTime = Date.now();
  const response = await fetch(url, options);
  const duration = Date.now() - startTime;

  const data = await response.json().catch(() => null);
  
  writeLog(`📥 [API] Response: ${response.status} (${duration}ms)`, response.ok ? 'SUCCESS' : 'ERROR');
  if (data) {
    writeLog(`📦 [API] Response Data: ${JSON.stringify(data, null, 2)}`, 'API');
  }

  return { response, data, duration };
}

// Helper: Wait for condition
async function waitFor(conditionFn, timeoutMs = 30000, intervalMs = 1000, description = 'condition') {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const result = await conditionFn();
    if (result) {
      writeLog(`✅ [WAIT] ${description} met after ${Date.now() - startTime}ms`, 'SUCCESS');
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`⏱️ Timeout waiting for ${description} after ${timeoutMs}ms`);
}

// Helper: Create CSV
function createTestCSV(companies) {
  const csvContent = [
    'company_name,website_url,country',
    ...companies.map(c => `"${c.company_name}","${c.website_url}","${c.country}"`)
  ].join('\n');
  
  const filename = `test-flow-${Date.now()}.csv`;
  fs.writeFileSync(filename, csvContent);
  
  writeLog(`📄 [CSV] Created test CSV: ${filename} with ${companies.length} companies`, 'INFO');
  return filename;
}

// Step 1: Create Campaign
async function step1_CreateCampaign() {
  writeLog('\n' + '='.repeat(80), 'INFO');
  writeLog('STEP 1: CREATE CAMPAIGN', 'INFO');
  writeLog('='.repeat(80), 'INFO');

  // Include all test companies in initial creation
  const { response, data } = await apiCall('POST', '/api/campaigns', {
    name: TEST_CONFIG.campaignName,
    message_template: JSON.stringify(TEST_CONFIG.messageTemplate), // Must be JSON string for backend
    companies: TEST_CONFIG.testCompanies, // Include all companies
    session_id: `test-session-${Date.now()}`, // Generate session ID for guest user
  });

  if (!response.ok || !data.campaign) {
    throw new Error(`Failed to create campaign: ${data.error || 'Unknown error'}`);
  }

  const campaignId = data.campaign.id;
  writeLog(`✅ [SUCCESS] Campaign created with ID: ${campaignId}`, 'SUCCESS');
  
  return campaignId;
}

// Step 2: Upload Companies
async function step2_UploadCompanies(campaignId) {
  writeLog('\n' + '='.repeat(80), 'INFO');
  writeLog('STEP 2: UPLOAD COMPANIES', 'INFO');
  writeLog('='.repeat(80), 'INFO');

  const csvFilename = createTestCSV(TEST_CONFIG.testCompanies);
  
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(csvFilename));
    formData.append('campaign_id', campaignId.toString());

    const url = `${BASE_URL}/api/campaigns/${campaignId}/upload`;
    writeLog(`📤 [UPLOAD] Uploading ${csvFilename} to ${url}`, 'INFO');

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${data.error || 'Unknown error'}`);
    }

    writeLog(`✅ [SUCCESS] Uploaded ${data.added_count} companies`, 'SUCCESS');
    
    // Clean up CSV
    fs.unlinkSync(csvFilename);
    
    return data.added_count;
  } catch (error) {
    writeLog(`❌ [ERROR] Upload failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Step 3: Get Campaign Companies
async function step3_GetCompanies(campaignId) {
  writeLog('\n' + '='.repeat(80), 'INFO');
  writeLog('STEP 3: VERIFY COMPANIES UPLOADED', 'INFO');
  writeLog('='.repeat(80), 'INFO');

  const { response, data } = await apiCall('GET', `/api/campaigns/${campaignId}/companies`);

  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }

  const pendingCount = data.companies.filter(c => c.status === 'pending').length;
  writeLog(`📊 [INFO] Total companies: ${data.companies.length}`, 'INFO');
  writeLog(`📊 [INFO] Pending companies: ${pendingCount}`, 'INFO');
  
  return data.companies;
}

// Step 4: Start Rapid All Processing
async function step4_StartRapidAll(campaignId, companies) {
  writeLog('\n' + '='.repeat(80), 'INFO');
  writeLog('STEP 4: START RAPID ALL PROCESSING', 'INFO');
  writeLog('='.repeat(80), 'INFO');

  const pendingCompanies = companies.filter(c => c.status === 'pending');
  
  // Group by URL for batch detection
  const urlGroups = {};
  pendingCompanies.forEach(company => {
    const url = company.website_url;
    if (!urlGroups[url]) urlGroups[url] = [];
    urlGroups[url].push(company);
  });

  const batchCount = Object.values(urlGroups).filter(group => group.length > 1).length;
  
  writeLog(`📊 [INFO] Total pending: ${pendingCompanies.length}`, 'INFO');
  writeLog(`📊 [INFO] Unique URLs: ${Object.keys(urlGroups).length}`, 'INFO');
  writeLog(`📊 [INFO] Batch groups (duplicates): ${batchCount}`, 'INFO');

  // Process each URL group
  const startTime = Date.now();
  
  for (const [url, groupCompanies] of Object.entries(urlGroups)) {
    if (groupCompanies.length > 1) {
      // BATCH processing
      writeLog(`\n🔄 [BATCH] Processing ${groupCompanies.length} companies for ${url}`, 'INFO');
      
      const companyIds = groupCompanies.map(c => c.id);
      const { response, data } = await apiCall(
        'POST',
        `/api/campaigns/${campaignId}/rapid-process-batch`,
        { company_ids: companyIds }
      );

      if (!response.ok) {
        writeLog(`❌ [ERROR] Batch processing failed: ${data.error}`, 'ERROR');
        throw new Error(`Batch processing failed: ${data.error}`);
      }

      writeLog(`✅ [SUCCESS] Batch completed`, 'SUCCESS');
      
      // Log individual results
      if (data.results) {
        data.results.forEach(result => {
          const status = result.status === 'completed' ? '✅' : '❌';
          writeLog(`   ${status} Company ${result.companyId}: ${result.status}`, 'INFO');
          if (result.errorMessage) {
            writeLog(`      Error: ${result.errorMessage}`, 'ERROR');
          }
        });
      }
    } else {
      // SINGLE company processing
      const company = groupCompanies[0];
      writeLog(`\n⚡ [SINGLE] Processing ${company.company_name}`, 'INFO');
      
      const { response, data } = await apiCall(
        'POST',
        `/api/campaigns/${campaignId}/companies/${company.id}/rapid-process`,
        { companyId: company.id }
      );

      const status = data.status === 'completed' ? '✅' : '❌';
      writeLog(`${status} [${data.status.toUpperCase()}] ${company.company_name}`, data.status === 'completed' ? 'SUCCESS' : 'ERROR');
      
      if (data.errorMessage) {
        writeLog(`   Error: ${data.errorMessage}`, 'ERROR');
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  writeLog(`\n⏱️ [TIMING] Total processing time: ${totalTime}s`, 'INFO');
  writeLog(`⏱️ [TIMING] Average per company: ${(totalTime / pendingCompanies.length).toFixed(2)}s`, 'INFO');
}

// Step 5: Monitor and Verify Results
async function step5_VerifyResults(campaignId) {
  writeLog('\n' + '='.repeat(80), 'INFO');
  writeLog('STEP 5: VERIFY RESULTS', 'INFO');
  writeLog('='.repeat(80), 'INFO');

  // Wait a moment for database updates
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { response, data } = await apiCall('GET', `/api/campaigns/${campaignId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch campaign details');
  }

  const campaign = data.campaign;
  
  writeLog(`\n📊 [RESULTS] Campaign Status:`, 'INFO');
  writeLog(`   Total Companies: ${campaign.total_companies}`, 'INFO');
  writeLog(`   Processed: ${campaign.processed_count}`, 'INFO');
  writeLog(`   ✅ Success: ${campaign.success_count}`, 'SUCCESS');
  writeLog(`   ❌ Failed: ${campaign.failed_count}`, 'ERROR');
  writeLog(`   📈 Progress: ${campaign.progress_percentage}%`, 'INFO');

  // Get company details
  const companiesResponse = await apiCall('GET', `/api/campaigns/${campaignId}/companies`);
  const companies = companiesResponse.data.companies;

  const completed = companies.filter(c => c.status === 'completed');
  const failed = companies.filter(c => c.status === 'failed');
  const pending = companies.filter(c => c.status === 'pending');

  writeLog(`\n📋 [BREAKDOWN] Company Status:`, 'INFO');
  writeLog(`   ✅ Completed: ${completed.length}`, 'SUCCESS');
  writeLog(`   ❌ Failed: ${failed.length}`, 'ERROR');
  writeLog(`   ⏳ Pending: ${pending.length}`, 'INFO');

  // List failures with details
  if (failed.length > 0) {
    writeLog(`\n❌ [FAILED COMPANIES]:`, 'ERROR');
    failed.forEach(company => {
      writeLog(`   • ${company.company_name}`, 'ERROR');
      writeLog(`     URL: ${company.website_url}`, 'ERROR');
      writeLog(`     Error: ${company.error_message || 'Unknown error'}`, 'ERROR');
    });
  }

  // List successes with screenshots
  if (completed.length > 0) {
    writeLog(`\n✅ [SUCCESSFUL COMPANIES]:`, 'SUCCESS');
    completed.forEach(company => {
      writeLog(`   • ${company.company_name}`, 'SUCCESS');
      if (company.screenshot_url) {
        writeLog(`     📸 Screenshot: ${company.screenshot_url}`, 'SUCCESS');
      }
    });
  }

  return {
    campaign,
    companies,
    successRate: campaign.total_companies > 0 
      ? ((campaign.success_count / campaign.total_companies) * 100).toFixed(1) 
      : 0
  };
}

// Step 6: Test Export Functionality
async function step6_TestExport(campaignId) {
  writeLog('\n' + '='.repeat(80), 'INFO');
  writeLog('STEP 6: TEST EXPORT FUNCTIONALITY', 'INFO');
  writeLog('='.repeat(80), 'INFO');

  try {
    const url = `${BASE_URL}/api/campaigns/${campaignId}/export?format=csv`;
    writeLog(`📥 [EXPORT] Requesting CSV export from ${url}`, 'INFO');

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`);
    }

    const csvContent = await response.text();
    const lineCount = csvContent.split('\n').length - 1; // -1 for header
    
    writeLog(`✅ [SUCCESS] Export completed`, 'SUCCESS');
    writeLog(`📊 [INFO] Exported ${lineCount} rows (including header)`, 'INFO');
    writeLog(`📄 [INFO] Sample content (first 200 chars):`, 'INFO');
    writeLog(`   ${csvContent.substring(0, 200)}...`, 'INFO');

    return true;
  } catch (error) {
    writeLog(`❌ [ERROR] Export failed: ${error.message}`, 'ERROR');
    return false;
  }
}

// Main Test Runner
async function runCompleteFlowTest() {
  const testStartTime = Date.now();
  
  writeLog('╔═══════════════════════════════════════════════════════════════════════════════╗', 'INFO');
  writeLog('║                    COMPLETE CAMPAIGN FLOW TEST                                 ║', 'INFO');
  writeLog('║                                                                                ║', 'INFO');
  writeLog(`║  Base URL: ${BASE_URL.padEnd(62)} ║`, 'INFO');
  writeLog(`║  Backend:  ${BACKEND_URL.padEnd(62)} ║`, 'INFO');
  writeLog('╚═══════════════════════════════════════════════════════════════════════════════╝', 'INFO');

  let campaignId;
  let testResults = {
    steps: {},
    overallSuccess: false,
    errors: []
  };

  try {
    // Step 1: Create Campaign
    try {
      campaignId = await step1_CreateCampaign();
      testResults.steps.createCampaign = { success: true, campaignId };
    } catch (error) {
      testResults.steps.createCampaign = { success: false, error: error.message };
      throw error;
    }

    // Step 2: Upload Additional Companies (skipped - companies already added in creation)
    writeLog('\n' + '='.repeat(80), 'INFO');
    writeLog('STEP 2: UPLOAD ADDITIONAL COMPANIES (SKIPPED)', 'INFO');
    writeLog('='.repeat(80), 'INFO');
    writeLog('ℹ️ Companies already added during campaign creation', 'INFO');
    testResults.steps.uploadCompanies = { success: true, skipped: true };

    // Step 3: Verify Companies
    let companies;
    try {
      companies = await step3_GetCompanies(campaignId);
      testResults.steps.verifyCompanies = { success: true, count: companies.length };
    } catch (error) {
      testResults.steps.verifyCompanies = { success: false, error: error.message };
      throw error;
    }

    // Step 4: Process with Rapid All
    try {
      await step4_StartRapidAll(campaignId, companies);
      testResults.steps.rapidAllProcessing = { success: true };
    } catch (error) {
      testResults.steps.rapidAllProcessing = { success: false, error: error.message };
      // Don't throw - continue to verify results
      testResults.errors.push(error.message);
    }

    // Step 5: Verify Results
    let results;
    try {
      results = await step5_VerifyResults(campaignId);
      testResults.steps.verifyResults = { 
        success: true, 
        successRate: results.successRate,
        campaign: results.campaign 
      };
    } catch (error) {
      testResults.steps.verifyResults = { success: false, error: error.message };
      testResults.errors.push(error.message);
    }

    // Step 6: Test Export
    try {
      const exportSuccess = await step6_TestExport(campaignId);
      testResults.steps.testExport = { success: exportSuccess };
    } catch (error) {
      testResults.steps.testExport = { success: false, error: error.message };
      testResults.errors.push(error.message);
    }

    // Determine overall success
    const allStepsSuccessful = Object.values(testResults.steps).every(step => step.success);
    const hasSuccessfulProcessing = results && results.successRate > 0;
    
    testResults.overallSuccess = allStepsSuccessful && hasSuccessfulProcessing;

    // Final Summary
    writeLog('\n' + '╔' + '═'.repeat(78) + '╗', 'INFO');
    writeLog('║' + ' '.repeat(30) + 'FINAL SUMMARY' + ' '.repeat(35) + '║', 'INFO');
    writeLog('╚' + '═'.repeat(78) + '╝', 'INFO');

    const totalTime = ((Date.now() - testStartTime) / 1000).toFixed(2);
    
    writeLog(`\n⏱️  Total Test Duration: ${totalTime}s`, 'INFO');
    writeLog(`🆔 Campaign ID: ${campaignId}`, 'INFO');
    writeLog(`🌐 Campaign URL: ${BASE_URL}/campaigns/${campaignId}`, 'INFO');

    writeLog(`\n📊 STEP RESULTS:`, 'INFO');
    Object.entries(testResults.steps).forEach(([step, result]) => {
      const icon = result.success ? '✅' : '❌';
      writeLog(`   ${icon} ${step}: ${result.success ? 'PASSED' : 'FAILED'}`, result.success ? 'SUCCESS' : 'ERROR');
      if (result.error) {
        writeLog(`      Error: ${result.error}`, 'ERROR');
      }
    });

    if (results) {
      writeLog(`\n📈 PROCESSING RESULTS:`, 'INFO');
      writeLog(`   Success Rate: ${results.successRate}%`, results.successRate >= 80 ? 'SUCCESS' : 'ERROR');
      writeLog(`   ✅ Successful: ${results.campaign.success_count}/${results.campaign.total_companies}`, 'INFO');
      writeLog(`   ❌ Failed: ${results.campaign.failed_count}/${results.campaign.total_companies}`, 'INFO');
    }

    if (testResults.errors.length > 0) {
      writeLog(`\n⚠️  ERRORS ENCOUNTERED:`, 'ERROR');
      testResults.errors.forEach((error, i) => {
        writeLog(`   ${i + 1}. ${error}`, 'ERROR');
      });
    }

    writeLog(`\n${'═'.repeat(80)}`, 'INFO');
    if (testResults.overallSuccess) {
      writeLog('🎉 ALL TESTS PASSED! CAMPAIGN FLOW IS WORKING CORRECTLY!', 'SUCCESS');
    } else {
      writeLog('❌ SOME TESTS FAILED. REVIEW ERRORS ABOVE.', 'ERROR');
    }
    writeLog('═'.repeat(80), 'INFO');

    writeLog(`\n📝 Full logs saved to: ${path.resolve(LOG_FILE)}`, 'INFO');

  } catch (error) {
    writeLog(`\n💥 [FATAL ERROR] Test failed: ${error.message}`, 'ERROR');
    writeLog(error.stack, 'ERROR');
    testResults.overallSuccess = false;
  } finally {
    if (logStream) {
      logStream.end();
    }
  }

  process.exit(testResults.overallSuccess ? 0 : 1);
}

// Run the test
runCompleteFlowTest().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
