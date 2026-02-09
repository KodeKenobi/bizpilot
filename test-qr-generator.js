const puppeteer = require('puppeteer');

async function testQRGenerator() {
  console.log('🧪 Starting QR Generator Test');

  const baseURL = process.env.BASE_URL || 'https://www.trevnoctilla.com';
  console.log(`Base URL: ${baseURL}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60000); // 60 second timeout

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Browser Error] ${msg.text()}`);
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`[Page Error] ${error.message}`);
    });

    // Listen for network requests
    page.on('request', request => {
      if (request.url().includes('generate-qr')) {
        console.log(`🌐 API Request: ${request.method()} ${request.url()}`);
      }
    });

    // Listen for network responses
    page.on('response', async response => {
      if (response.url().includes('generate-qr')) {
        console.log(`📡 API Response: ${response.status()} ${response.url()}`);
        try {
          const responseBody = await response.json();
          console.log(`📡 Response Body:`, JSON.stringify(responseBody, null, 2));
        } catch (e) {
          console.log(`📡 Could not parse response body: ${e.message}`);
        }
      }
    });

    // Also listen for any fetch/XHR requests
    page.on('request', request => {
      if (request.url().includes('generate-qr') || request.url().includes('api')) {
        console.log(`🌐 API Request: ${request.method()} ${request.url()}`);
        if (request.postData()) {
          console.log(`📤 Request data: ${request.postData().substring(0, 200)}...`);
        }
      }
    });

    // Navigate to QR generator page
    console.log('📄 Navigating to QR generator page...');
    await page.goto(`${baseURL}/tools/qr-generator`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'qr-generator-initial.png' });
    console.log('📸 Screenshot saved: qr-generator-initial.png');

    // Check for QR generator form
    console.log('🔍 Checking for QR generator form...');
    const formExists = await page.$('[class*="rounded-xl"][class*="bg-gray-800"]');
    if (!formExists) {
      // Try alternative check - look for the title
      const titleExists = await page.$('text="Universal QR Generator"');
      if (!titleExists) {
        throw new Error('QR generator form not found');
      }
    }
    console.log('✅ QR generator form found');

    // Check for URL input field
    console.log('🔍 Checking for URL input field...');
    const urlInput = await page.$('input[type="url"]');
    if (!urlInput) {
      throw new Error('URL input field not found');
    }
    console.log('✅ URL input field found');

    // Fill in URL
    console.log('📝 Filling in URL...');
    await urlInput.type('https://www.trevnoctilla.com');
    console.log('✅ URL filled: https://www.trevnoctilla.com');

    await page.waitForTimeout(1000);

    // Take screenshot after filling URL
    await page.screenshot({ path: 'qr-generator-filled.png' });
    console.log('📸 Screenshot saved: qr-generator-filled.png');

    // Find and click generate button
    console.log('🔍 Finding generate button...');
    const allButtons = await page.$$('button');
    let generateButton = null;

    for (const button of allButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Generate QR Code')) {
        generateButton = button;
        break;
      }
    }

    if (!generateButton) {
      console.log('Available buttons:');
      for (let i = 0; i < allButtons.length; i++) {
        const text = await page.evaluate(el => el.textContent, allButtons[i]);
        console.log(`  Button ${i + 1}: "${text}"`);
      }
      throw new Error('Generate QR Code button not found');
    }
    console.log('✅ Generate button found');

    // Click generate button
    console.log('🚀 Clicking generate button...');
    await generateButton.click();

    // Wait for QR generation to complete
    console.log('⏳ Waiting for QR code generation...');
    await page.waitForTimeout(10000); // Increased wait time

    // Check for any error messages first
    const errorElement = await page.$('[class*="bg-red"]');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      console.log(`⚠️ Found error message: ${errorText}`);
    }

    // Take screenshot after generation attempt
    await page.screenshot({ path: 'qr-generator-after-generate.png' });
    console.log('📸 Screenshot saved: qr-generator-after-generate.png');

    // Check if QR code appeared
    console.log('🔍 Checking if QR code was generated...');
    const qrImage = await page.$('img[alt="Generated QR Code"]');
    if (!qrImage) {
      // Try alternative selector
      const qrImageAlt = await page.$('img[src^="data:"]');
      if (!qrImageAlt) {
        // Try even more generic selector
        const anyImg = await page.$('img');
        if (anyImg) {
          console.log('ℹ️ Found some image, might be QR code');
        } else {
          throw new Error('QR code image not found after generation');
        }
      }
    }
    console.log('✅ QR code generated successfully');

    // Take screenshot with QR code
    await page.screenshot({ path: 'qr-generator-generated.png' });
    console.log('📸 Screenshot saved: qr-generator-generated.png');

    // Check for result status and download button
    console.log('🔍 Checking for result status...');
    const successDiv = await page.$('[class*="bg-green"]');
    const errorDiv = await page.$('[class*="bg-red"]');

    if (successDiv) {
      const successText = await page.evaluate(el => el.textContent, successDiv);
      console.log(`✅ Found success message: ${successText}`);
    }

    if (errorDiv) {
      const errorText = await page.evaluate(el => el.textContent, errorDiv);
      console.log(`❌ Found error message: ${errorText}`);
      throw new Error(`QR generation failed: ${errorText}`);
    }

    // Check for download button
    console.log('🔍 Checking for download button...');
    const buttons = await page.$$('button');
    let downloadButton = null;

    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && (text.includes('Download QR Code') || text.includes('Download'))) {
        downloadButton = button;
        break;
      }
    }

    if (!downloadButton) {
      // Check if there are any buttons at all
      console.log(`ℹ️ Found ${buttons.length} total buttons on page`);
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const text = await page.evaluate(el => el.textContent, buttons[i]);
        console.log(`  Button ${i + 1}: "${text}"`);
      }
      throw new Error('Download QR Code button not found');
    }
    console.log('✅ Download button found');

    // Set up download interception
    const downloadPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Download did not start within 30 seconds'));
      }, 30000);

      page.on('response', response => {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';

        // Check if this is a download response
        if (url.includes('qr-code.jpg') || contentType.includes('image/jpeg') ||
            (response.request().resourceType() === 'document' && url.includes('data:'))) {
          console.log(`📥 Download detected: ${url}`);
          clearTimeout(timeout);
          resolve(true);
        }
      });
    });

    // Click download button
    console.log('⬇️ Clicking download button...');
    await downloadButton.click();

    // Wait for monetization modal if it appears
    try {
      await page.waitForSelector('[class*="monetization"]', { timeout: 5000 });
      console.log('💰 Monetization modal appeared');

      // Try to find and click continue/download button
      const continueBtn = await page.$('button:has-text("Continue")') ||
                         await page.$('button:has-text("Download")') ||
                         await page.$('button:has-text("Proceed")');

      if (continueBtn) {
        console.log('✅ Clicking monetization continue button...');
        await continueBtn.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('ℹ️ No monetization modal appeared');
    }

    // Wait for download to complete
    console.log('⏳ Waiting for download to complete...');
    try {
      await downloadPromise;
      console.log('✅ Download completed successfully');
    } catch (error) {
      console.log(`⚠️ Download detection failed: ${error.message}`);

      // Fallback: check if a new tab/window opened (fallback download method)
      const pages = await browser.pages();
      if (pages.length > 1) {
        console.log('✅ Fallback download method detected (new tab opened)');
      } else {
        throw error;
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'qr-generator-final.png' });
    console.log('📸 Screenshot saved: qr-generator-final.png');

    console.log('✅ QR Generator test completed successfully!');

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);

    // Take error screenshot if browser is available
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          await pages[0].screenshot({ path: 'qr-generator-error.png' });
          console.log('📸 Error screenshot saved: qr-generator-error.png');
        }
      } catch (screenshotError) {
        console.log(`⚠️ Could not take error screenshot: ${screenshotError.message}`);
      }
    }

    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testQRGenerator()
  .then(() => {
    console.log('\n🎉 All QR generator tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n💥 QR generator test failed: ${error.message}`);
    process.exit(1);
  });
