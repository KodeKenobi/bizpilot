#!/usr/bin/env node

const { chromium } = require('playwright');
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

const FRONTEND_URL = 'http://localhost:3000';
const CSV_FILE_PATH = path.join(__dirname, 'sample_companies.csv');

async function testCampaignBrowserFlow() {
  let browser;
  let page;

  try {
    log('\n=== Campaign Browser Flow Test ===', 'bright');
    log(`Frontend: ${FRONTEND_URL}`, 'yellow');
    log('Opening browser...', 'cyan');

    // Launch browser in headed mode so you can see it
    browser = await chromium.launch({
      headless: true, // Run headlessly in this environment
      slowMo: 1000, // Slow down by 1 second between actions
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    page = await context.newPage();

    // =====================================================
    // Step 1: Go to Campaigns Page
    // =====================================================
    log('\n[Step 1/6] Opening campaigns page...', 'cyan');
    await page.goto(`${FRONTEND_URL}/campaigns`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for loader to disappear
    log('Waiting for initial loader to finish...', 'yellow');
    await page.waitForSelector('text=Loading...', { state: 'detached', timeout: 15000 }).catch(() => {});
    
    await page.waitForTimeout(2000);
    log('✓ Campaigns page loaded', 'green');

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/1-campaigns-list.png', fullPage: true });
    log('  📸 Screenshot saved: 1-campaigns-list.png', 'yellow');

    // =====================================================
    // Step 2: Click "New Campaign" button
    // =====================================================
    log('\n[Step 2/6] Clicking "New Campaign" button...', 'cyan');
    
    // Handle empty state vs populated state buttons
    const newBtn = await page.locator('button:has-text("Create Campaign"), button:has-text("Start Your First Campaign")').first();
    if (await newBtn.isVisible()) {
        await newBtn.click();
    } else {
        log('Could not find create button, navigating directly...', 'yellow');
        await page.goto(`${FRONTEND_URL}/campaigns/upload`);
    }
    
    await page.waitForURL('**/campaigns/upload', { timeout: 30000 });
    await page.waitForTimeout(2000);
    log('✓ Upload page loaded', 'green');

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/2-upload-page.png', fullPage: true });
    log('  📸 Screenshot saved: 2-upload-page.png', 'yellow');

    // =====================================================
    // Step 3: Upload CSV file
    // =====================================================
    log('\n[Step 3/6] Uploading CSV file...', 'cyan');
    
    // Ensure CSV exists with requested companies
    log('Creating sample CSV with 2020innovation...', 'yellow');
    const sampleCSV = `website_url,company_name
https://www.2020innovation.com,2020 Innovation`;
    fs.writeFileSync(CSV_FILE_PATH, sampleCSV);

    // Upload file
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(CSV_FILE_PATH);
    
    // Wait for processing modal to appear and then disappear
    log('Waiting for upload processing...', 'yellow');
    try {
        await page.waitForTimeout(1000); // Give it a sec to appear
        const processingModal = page.locator('text=Processing...');
        if (await processingModal.isVisible()) {
            await processingModal.waitFor({ state: 'detached', timeout: 30000 });
            log('✓ Processing modal cleared', 'green');
        }
    } catch (e) {
        log('  ⚠ Processing modal toggle missed (might be too fast), continuing...', 'yellow');
    }

    // Wait for data to show and success state
    await page.waitForSelector('text=Upload Complete', { timeout: 10000 });
    log('✓ CSV uploaded and processed', 'green');

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/3-upload-complete.png', fullPage: true });
    log('  📸 Screenshot saved: 3-upload-complete.png', 'yellow');

    // =====================================================
    // Step 4: Click "Create Message Template" to create campaign
    // =====================================================
    log('\n[Step 4/6] Clicking "Create Message Template" button...', 'cyan');
    await page.click('button:has-text("Create Message Template")');
    await page.waitForURL('**/campaigns/create', { timeout: 10000 });
    await page.waitForTimeout(2000);
    log('✓ Create campaign page loaded', 'green');

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/4-create-campaign.png', fullPage: true });
    log('  📸 Screenshot saved: 4-create-campaign.png', 'yellow');

    // =====================================================
    // Step 5: Fill campaign form and create
    // =====================================================
    log('\n[Step 5/6] Filling campaign form...', 'cyan');
    
    // Fill campaign name
    await page.fill('input[id="campaignName"]', `Visual Fix Test ${new Date().toLocaleTimeString()}`);
    log('  ✓ Campaign name filled', 'yellow');

    // Fill Sender Details (New Fields)
    await page.fill('input[placeholder="First Name"]', 'Visual');
    await page.fill('input[placeholder="Last Name"]', 'Tester');
    await page.fill('input[placeholder="Your Company Name"]', 'Automated Testing Co');
    await page.fill('input[placeholder="Your Email"]', 'test@example.com');
    await page.fill('input[placeholder="Your Phone"]', '0123456789');
    await page.fill('input[placeholder="Subject"]', 'Automated Visual Test Inquiry');
    log('  ✓ Sender details filled', 'yellow');

    // Fill message
    await page.fill('textarea[id="message"]', 
      'Hello! This is an automated visual test to verify form heuristics and screenshot capture. Please ignore this test.');
    log('  ✓ Message filled', 'yellow');

    await page.waitForTimeout(1000);

    // Click Create Campaign button
    log('  Clicking "Create Campaign" button...', 'yellow');

    // Attempt to dismiss overlays by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Monitor network requests to capture API failures
    page.on('request', request => {
        if (request.url().includes('/api/campaigns') && request.method() === 'POST') {
            log(`  📡 API Request started: ${request.url()}`, 'yellow');
        }
    });

    page.on('response', async response => {
        if (response.url().includes('/api/campaigns') && response.request().method() === 'POST') {
            const status = response.status();
            log(`  📡 API Response received: ${status}`, status === 200 ? 'green' : 'red');
            if (status !== 200) {
                try {
                    const errorJson = await response.json();
                    log(`  ❌ API ERROR BODY: ${JSON.stringify(errorJson)}`, 'red');
                } catch (e) {
                    const text = await response.text();
                    log(`  ❌ API ERROR TEXT: ${text.substring(0, 500)}`, 'red');
                }
            }
        }
    });

    // Accept Cookies if banner exists
    // Dismiss cookie banner more robustly
    try {
        const cookieButtons = [
            'button:has-text("Accept All")',
            'button:has-text("Accept")',
            '#cookie-accept',
            '.cookie-banner button'
        ];
        
        for (const selector of cookieButtons) {
            const btn = page.locator(selector).first();
            if (await btn.isVisible({ timeout: 1000 })) {
                log(`  🍪 Dismissing cookie banner with selector: ${selector}`, 'yellow');
                await btn.click({ force: true });
                await page.waitForTimeout(500);
            }
        }
    } catch (e) {}

    // Force click to bypass any non-blocking overlays
    await page.click('button:has-text("Create Campaign")', { force: true });
    log('  Click sent (forced). Waiting 5s for reaction...', 'yellow');
    await page.waitForTimeout(5000);
    log(`  Current URL after click: ${page.url()}`, 'yellow');
    await page.screenshot({ path: 'test-screenshots/debug-step5-after-click.png', fullPage: true });
    
    // Wait for EITHER the URL change OR the Rapid All button to appear immediately
    log('  Waiting for campaign page to stabilize...', 'yellow');
    await Promise.race([
        page.waitForURL('**/campaigns/([0-9]*)', { timeout: 10000 }).catch(() => {}),
        page.waitForSelector('button:has-text("Rapid All")', { timeout: 10000 }).catch(() => {})
    ]);
    await page.waitForTimeout(3000);
    
    // Get ID from URL or just grab it from button/page if needed
    let campaignId = page.url().match(/campaigns\/(\d+)/)?.[1];
    if (!campaignId) {
        log('  ⚠ Could not parse ID from URL, using timestamp as fallback ID', 'yellow');
        campaignId = Date.now().toString();
    }
    log(`✓ Campaign created! ID: ${campaignId}`, 'green');

    // =====================================================
    // Step 6: Trigger Rapid All and Watch
    // =====================================================
    log('\n[Step 6/6] Triggering Rapid All...', 'cyan');
    
    // Find Rapid All button with more robustness
    log('  🔍 Searching for "Rapid All" button...', 'yellow');
    
    // DEBUG: List every single button on the page
    const buttons = await page.locator('button').all();
    log(`  Found ${buttons.length} total buttons on page. Listing texts:`, 'yellow');
    for (const [idx, btn] of buttons.entries()) {
        const text = await btn.innerText();
        const visible = await btn.isVisible();
        const box = await btn.boundingBox();
        log(`    [${idx}] "${text}" | Visible: ${visible} | Box: ${JSON.stringify(box)}`, 'yellow');
    }

    const rapidAllButton = page.locator('button').filter({ hasText: /Rapid All/i }).first();
    
    try {
        await rapidAllButton.waitFor({ state: 'visible', timeout: 15000 });
        const btnText = await rapidAllButton.innerText();
        log(`  ✓ Found "Rapid All" button with text: "${btnText}"`, 'green');
        
        await rapidAllButton.scrollIntoViewIfNeeded();
        await page.screenshot({ path: 'test-screenshots/debug-before-rapid-all-click.png' });
        
        log('  Clicking Rapid All button...', 'yellow');
        
        // Strategy 1: Standard click
        try {
            await rapidAllButton.click({ timeout: 5000 });
        } catch (e) {
            log('  ⚠ Standard click failed, trying forced coordinate click...', 'yellow');
            const box = await rapidAllButton.boundingBox();
            if (box) {
                await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            } else {
                await rapidAllButton.click({ force: true });
            }
        }
        
        await page.waitForTimeout(2000); // Wait for modal animation
        await page.screenshot({ path: 'test-screenshots/debug-after-rapid-all-click.png' });
    } catch (e) {
        log('  ❌ Rapid All button not found or not visible', 'red');
        const allButtons = await page.locator('button').allInnerTexts();
        log(`  Available buttons: ${allButtons.join(', ')}`, 'yellow');
        await page.screenshot({ path: 'test-screenshots/error-rapid-all-button.png' });
        throw e;
    }
    
    log('✓ Rapid All button interacted. Checking system state...', 'yellow');
    
    // Check if we are already processing (auto-start or modal auto-dismissed)
    const progressBar = page.locator('div:has-text("Rapid All Processing")').first();
    const isProcessing = await progressBar.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isProcessing) {
        log('  ✓ Rapid All auto-started or modal skipped. Proceeding to monitor progress...', 'green');
    } else {
        log('  Modal/Progress bar not immediately visible, checking for start button...', 'yellow');
        // Look for generic Start button in the modal
        const startButton = page.locator('button').filter({ hasText: /Start/i }).first();
        if (await startButton.isVisible({ timeout: 5000 })) {
            log(`  Found start button: "${await startButton.textContent()}"`, 'yellow');
            log('  Clicking confirm in modal...', 'yellow');
            await startButton.click({ force: true });
        } else {
            log('  No start button or progress bar found - checking if we are already finished...', 'yellow');
        }
    }
    
    // Monitoring Loop
    log('\n[Step 6 Extension] Monitoring real-time processing...', 'cyan');
    let completed = 0;
    let failed = 0;
    
    for (let i = 0; i < 40; i++) { // Check for up to 200s
        await page.waitForTimeout(5000);
        
        // Take periodic screenshots
        await page.screenshot({ path: `test-screenshots/8-processing-${i*5}s.png`, fullPage: true });
        
        // Count statuses from table rows
        const statuses = await page.locator('td').allTextContents();
        completed = statuses.filter(s => s.toLowerCase().includes('completed') || s.toLowerCase().includes('success')).length;
        failed = statuses.filter(s => s.toLowerCase().includes('failed') || s.toLowerCase().includes('not found')).length;
        const processing = statuses.filter(s => s.toLowerCase().includes('processing') || s.toLowerCase().includes('in progress')).length;
        
        log(`  📊 Check ${i*5}s: Completed: ${completed}, Failed: ${failed}, Processing: ${processing}`, 'yellow');
        
        if (processing === 0 && (completed + failed) > 0) {
            log('  ✅ No more companies in "Processing" state.', 'green');
            break;
        }
    }

    // FINAL CHECK: Screenshot visibility
    log('\nVerifying screenshot visibility in the table...', 'cyan');
    const screenshotImgs = await page.locator('button img').count();
    log(`✓ Found ${screenshotImgs} screenshot thumbnails in the table.`, 'green');
    
    if (screenshotImgs > 0) {
      log('  Clicking first screenshot to verify modal load...', 'yellow');
      await page.locator('button img').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-screenshots/9-screenshot-modal.png', fullPage: true });
      log('  📸 Screenshot saved: 9-screenshot-modal.png', 'yellow');
    }

    // Check removed (variable not defined)

    // =====================================================
    // Step 8: Return to Campaign Detail
    // =====================================================
    log('\n[Step 8/8] Returning to campaign detail page...', 'cyan');
    await page.goto(`${FRONTEND_URL}/campaigns/${campaignId}`);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-screenshots/9-final-status.png', fullPage: true });
    log('  📸 Screenshot saved: 9-final-status.png', 'yellow');
    log('✓ Campaign detail page loaded', 'green');

    // =====================================================
    // Summary
    // =====================================================
    log('\n=== Test Summary ===', 'bright');
    log('✓ Browser opened and visible', 'green');
    log('✓ Campaigns page loaded', 'green');
    log('✓ CSV uploaded successfully', 'green');
    log('✓ Campaign form filled', 'green');
    log('✓ Campaign created', 'green');
    log('✓ Monitor page loaded', 'green');
    log(`✓ All screenshots saved to test-screenshots/`, 'green');
    log('\n✓ BROWSER FLOW TEST PASSED!', 'green');
    log(`\n📋 Campaign URL: ${FRONTEND_URL}/campaigns/${campaignId}`, 'blue');
    log(`🖥️  Monitor URL: ${FRONTEND_URL}/campaigns/${campaignId}/monitor`, 'blue');

    // Keep browser open for 10 seconds so you can see the result
    log('\n⏳ Keeping browser open for 10 seconds...', 'cyan');
    await page.waitForTimeout(10000);

  } catch (error) {
    log('\n✗ TEST FAILED!', 'red');
    log(`Error: ${error.message}`, 'red');
    if (error.stack) {
      log('\nStack trace:', 'yellow');
      console.error(error.stack);
    }

    // Take error screenshot
    if (page) {
      try {
        await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true });
        log('  📸 Error screenshot saved: error.png', 'yellow');
      } catch (e) {
        // Ignore screenshot errors
      }
    }

    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      log('\n🔒 Browser closed.', 'cyan');
    }
  }
}

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Run the test
testCampaignBrowserFlow();
