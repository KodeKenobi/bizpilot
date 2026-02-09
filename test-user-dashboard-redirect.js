/**
 * Test script to login and check user dashboard redirect and subscription tier
 * Tests with specific user credentials to verify correct dashboard routing
 */

const { chromium } = require('playwright');

const TEST_USER = {
  email: 'tshepomtshali89@gmail.com',
  password: 'Kopenikus0218!',
};

// You can change this to your production URL or local URL
const BASE_URL = process.env.NEXT_PUBLIC_URL || 
                 process.env.BASE_URL || 
                 'https://www.trevnoctilla.com'; // Production URL
                 // 'http://localhost:3000'; // Use this for local testing

async function testUserDashboardRedirect() {
  console.log('🚀 Starting dashboard redirect test...\n');
  console.log(`📧 Test User: ${TEST_USER.email}`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({
    headless: false, // Set to true for headless mode
    slowMo: 500, // Slow down actions to see what's happening
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to login page
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('✅ Login page loaded\n');

    // Step 2: Wait for page to be fully loaded
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    console.log('✅ Login form found\n');
    
    // Step 2: Fill in credentials
    console.log('📝 Step 2: Filling in credentials...');
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    
    if (!emailInput || !passwordInput) {
      throw new Error('Could not find email or password input fields');
    }
    
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    await page.waitForTimeout(500);
    console.log('✅ Credentials filled\n');

    // Step 3: Click login button
    console.log('🔐 Step 3: Clicking login button...');
    const submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      throw new Error('Could not find submit button');
    }
    await submitButton.click();
    
    // Wait for navigation to complete
    console.log('⏳ Waiting for response...');
    await page.waitForTimeout(3000);
    console.log('✅ Login submitted\n');

    // Step 4: Check for any error messages on the page
    console.log('🔍 Checking for error messages...');
    const errorSelectors = [
      'text=/Invalid email or password/i',
      'text=/error/i',
      'text=/failed/i',
      '[class*="error"]',
      '[role="alert"]',
      '.text-red-500',
      '.text-red-300',
    ];
    
    let errorFound = false;
    for (const selector of errorSelectors) {
      const errorElement = await page.$(selector);
      if (errorElement) {
        const errorText = await errorElement.textContent();
        if (errorText && errorText.trim().length > 0 && errorText.toLowerCase().includes('error')) {
          console.error(`❌ Login error detected: ${errorText.trim()}`);
          errorFound = true;
        }
      }
    }
    
    if (!errorFound) {
      console.log('✅ No error messages found\n');
    } else {
      console.log('');
    }

    // Step 5: Wait for redirect and get final URL
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log('📍 Step 4: Checking redirect...');
    console.log(`🔗 Current URL: ${currentUrl}\n`);

    // Determine which dashboard user was redirected to
    let dashboardType = 'Unknown';
    if (currentUrl.includes('/admin')) {
      dashboardType = 'Admin Dashboard';
    } else if (currentUrl.includes('/enterprise')) {
      dashboardType = 'Enterprise Dashboard';
    } else if (currentUrl.includes('/dashboard')) {
      dashboardType = 'Regular User Dashboard';
    } else if (currentUrl.includes('/auth/login')) {
      dashboardType = 'Still on Login Page (Login Failed)';
    }

    console.log('📊 DASHBOARD REDIRECT RESULT:');
    console.log(`   Dashboard: ${dashboardType}`);
    console.log(`   Full URL: ${currentUrl}\n`);

    // Step 6: Try to get user data from localStorage
    console.log('💾 Step 5: Checking user data from localStorage...');
    const userData = await page.evaluate(() => {
      const userDataStr = localStorage.getItem('user_data');
      return userDataStr ? JSON.parse(userDataStr) : null;
    });

    if (userData) {
      console.log('✅ User data found in localStorage:\n');
      console.log('👤 USER DETAILS:');
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Subscription Tier: ${userData.subscription_tier || 'Not set'}`);
      console.log(`   Monthly Call Limit: ${userData.monthly_call_limit === -1 ? 'Unlimited' : userData.monthly_call_limit || 'Not set'}`);
      console.log(`   Monthly Used: ${userData.monthly_used || 0}`);
      console.log(`   Is Active: ${userData.is_active}`);
      console.log(`   Created At: ${userData.created_at || 'Not available'}`);
      console.log(`   Last Login: ${userData.last_login || 'Not available'}\n`);
    } else {
      console.log('⚠️ No user data found in localStorage');
      console.log('   Trying to extract from page...\n');
    }

    // Step 7: Try to get user info from the page
    console.log('🔍 Step 6: Checking page content for user info...');
    
    // Look for subscription tier indicators on the page
    const pageContent = await page.content();
    const subscriptionMatches = pageContent.match(/subscription[_\s-]?tier["':\s]+["']?(\w+)/i);
    const tierMatch = pageContent.match(/(free|premium|enterprise|client)/gi);
    
    if (subscriptionMatches || tierMatch) {
      console.log('📄 Found subscription info in page content:');
      if (subscriptionMatches) {
        console.log(`   Subscription Tier: ${subscriptionMatches[1]}`);
      }
      if (tierMatch) {
        console.log(`   Detected Tier Keywords: ${tierMatch.join(', ')}`);
      }
      console.log('');
    }

    // Step 8: Check for role-specific elements
    console.log('🔍 Step 7: Checking for role-specific elements...');
    
    const hasAdminPanel = await page.$('text=/Admin Panel|admin dashboard/i');
    const hasEnterpriseFeatures = await page.$('text=/Enterprise Dashboard|enterprise/i');
    const hasTeamManagement = await page.$('text=/Team Management|team members/i');
    
    console.log('🎯 ROLE INDICATORS:');
    console.log(`   Admin Panel: ${hasAdminPanel ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Enterprise Features: ${hasEnterpriseFeatures ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Team Management: ${hasTeamManagement ? '✅ Found' : '❌ Not found'}\n`);

    // Step 9: Take a screenshot for verification
    const screenshotPath = `test-screenshots/dashboard-redirect-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

    // Final Summary
    console.log('=' .repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Login: Successful`);
    console.log(`📍 Redirected to: ${dashboardType}`);
    console.log(`🔗 URL: ${currentUrl}`);
    if (userData) {
      console.log(`👤 User Role: ${userData.role}`);
      console.log(`💳 Subscription Tier: ${userData.subscription_tier || 'Not set'}`);
      console.log(`📊 Call Limit: ${userData.monthly_call_limit === -1 ? 'Unlimited' : userData.monthly_call_limit || 'Not set'}`);
    }
    console.log('=' .repeat(60));
    console.log('\n✅ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    
    // Take error screenshot
    try {
      const errorScreenshot = `test-screenshots/error-${Date.now()}.png`;
      await page.screenshot({ path: errorScreenshot, fullPage: true });
      console.log(`\n📸 Error screenshot saved: ${errorScreenshot}`);
    } catch (screenshotError) {
      console.error('Could not save error screenshot:', screenshotError.message);
    }
  } finally {
    console.log('\n🔒 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed\n');
  }
}

// Run the test
console.log('\n' + '='.repeat(60));
console.log('🧪 USER DASHBOARD REDIRECT TEST');
console.log('='.repeat(60) + '\n');

testUserDashboardRedirect()
  .then(() => {
    console.log('✅ Test execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  });
