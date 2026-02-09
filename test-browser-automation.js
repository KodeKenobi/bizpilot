/**
 * Test Script: Browser Automation with Playwright
 * This will open a REAL browser window and visit websites
 * 
 * Usage: node test-browser-automation.js
 */

const { chromium } = require('playwright');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testBrowserAutomation() {
  log('\n=== Browser Automation Test ===\n', 'cyan');
  
  const testUrl = process.argv[2] || 'https://www.trevnoctilla.com';
  
  log(`Testing with: ${testUrl}`, 'yellow');
  log('Opening browser window... (you will see it open!)\n', 'yellow');
  
  // Launch browser with GUI (headless: false)
  const browser = await chromium.launch({
    headless: false,  // SHOW THE BROWSER!
    slowMo: 1000      // Slow down actions so you can see them
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Visit homepage
    log('Step 1: Visiting homepage...', 'cyan');
    await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 30000 });
    log('✓ Homepage loaded!', 'green');
    await page.waitForTimeout(2000);
    
    // Step 2: Look for cookie consent
    log('\nStep 2: Checking for cookie consent...', 'cyan');
    const cookieSelectors = [
      'button:has-text("Accept")',
      'button:has-text("I Accept")',
      'button:has-text("OK")',
      '#accept-cookies'
    ];
    
    let cookieFound = false;
    for (const selector of cookieSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click();
          log('✓ Clicked cookie consent button!', 'green');
          cookieFound = true;
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    if (!cookieFound) {
      log('- No cookie consent found (that\'s okay)', 'yellow');
    }
    
    // Step 3: Find contact page
    log('\nStep 3: Looking for contact page...', 'cyan');
    const contactSelectors = [
      'a[href*="contact"]',
      'a:has-text("Contact")',
      'a:has-text("Contact Us")',
      'a:has-text("Get in Touch")'
    ];
    
    let contactUrl = null;
    for (const selector of contactSelectors) {
      try {
        const link = await page.locator(selector).first();
        if (await link.isVisible({ timeout: 1000 })) {
          contactUrl = await link.getAttribute('href');
          log(`✓ Found contact link: ${contactUrl}`, 'green');
          
          log('\nStep 4: Clicking contact link...', 'cyan');
          await link.click();
          await page.waitForLoadState('networkidle');
          log('✓ Contact page loaded!', 'green');
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!contactUrl) {
      log('- No contact link found on homepage', 'yellow');
      log('  Trying direct URL: /contact', 'yellow');
      try {
        await page.goto(`${testUrl}/contact`, { waitUntil: 'networkidle' });
        log('✓ Loaded /contact page!', 'green');
        await page.waitForTimeout(2000);
      } catch (e) {
        log('✗ Could not find contact page', 'red');
      }
    }
    
    // Step 5: Find contact form
    log('\nStep 5: Looking for contact form...', 'cyan');
    const formFields = {
      name: await page.locator('input[name*="name"], input[id*="name"]').first().isVisible().catch(() => false),
      email: await page.locator('input[type="email"], input[name*="email"]').first().isVisible().catch(() => false),
      message: await page.locator('textarea[name*="message"], textarea[id*="message"]').first().isVisible().catch(() => false)
    };
    
    if (formFields.name || formFields.email || formFields.message) {
      log('✓ Contact form found!', 'green');
      log(`  - Name field: ${formFields.name ? '✓' : '✗'}`, formFields.name ? 'green' : 'yellow');
      log(`  - Email field: ${formFields.email ? '✓' : '✗'}`, formFields.email ? 'green' : 'yellow');
      log(`  - Message field: ${formFields.message ? '✓' : '✗'}`, formFields.message ? 'green' : 'yellow');
      
      // Fill the form (if you want to test this)
      log('\nStep 6: Filling form fields...', 'cyan');
      
      if (formFields.name) {
        await page.locator('input[name*="name"], input[id*="name"]').first().fill('Test User');
        log('✓ Filled name field', 'green');
      }
      
      if (formFields.email) {
        await page.locator('input[type="email"], input[name*="email"]').first().fill('test@example.com');
        log('✓ Filled email field', 'green');
      }
      
      if (formFields.message) {
        await page.locator('textarea[name*="message"], textarea[id*="message"]').first().fill('This is a test message from the automation script.');
        log('✓ Filled message field', 'green');
      }
      
      await page.waitForTimeout(3000);
      log('\n✓ Form filled! (Not submitting to avoid spam)', 'green');
    } else {
      log('✗ No contact form found', 'red');
    }
    
    log('\n\n=== Test Complete! ===', 'cyan');
    log('The browser will stay open for 10 seconds so you can see the result...', 'yellow');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
  } finally {
    await browser.close();
    log('\nBrowser closed.', 'cyan');
  }
}

// Check if playwright is installed
try {
  require('playwright');
} catch (e) {
  console.error('\n❌ Playwright is not installed!');
  console.error('Install it with: npm install playwright');
  console.error('Then run: npx playwright install chromium\n');
  process.exit(1);
}

// Run the test
log('\nStarting browser automation test...', 'cyan');
log('You should see a Chrome browser window open!\n', 'yellow');

testBrowserAutomation()
  .then(() => {
    log('\n✓ Test completed successfully!', 'green');
    process.exit(0);
  })
  .catch(error => {
    log(`\n✗ Test failed: ${error.message}`, 'red');
    process.exit(1);
  });
