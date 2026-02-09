const { chromium } = require('playwright');

/**
 * Standalone Test Script - Form Fill Without Submission
 * Usage: node test-fill-no-submit.js [url]
 */
async function testFill(url = 'https://2020innovation.com') {
  console.log(`🚀 Starting discovery test for: ${url}`);
  
  const browser = await chromium.launch({ headless: false }); // Headed so you can see it work
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Visit homepage
    console.log('Step 1: Navigating to homepage...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Handle cookie modals
    console.log('Step 1.1: Checking for cookie modals...');
    const cookieSelectors = ['button:has-text("Accept")', 'button:has-text("Agree")', '#cookie-accept'];
    for (const s of cookieSelectors) {
      try {
        const btn = page.locator(s).first();
        if (await btn.isVisible({ timeout: 1000 })) {
           await btn.click();
           console.log(`   Dismissed cookie modal via: ${s}`);
        }
      } catch (e) {}
    }

    await page.waitForTimeout(1000);

    // 2. Discover Contact Page
    console.log('Step 2: Searching for Contact page link...');
    
    // Scroll to bottom to trigger lazy loading and reveal footer
    console.log('   Scrolling to bottom...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    console.log('   Scrolling back to top...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    const contactKeywords = ['contact', 'get in touch', 'reach us', 'enquiry'];
    let contactLink = null;

    // Try finding by text
    for (const kw of contactKeywords) {
      const link = page.locator(`a:has-text("${kw}")`).first();
      try {
        if (await link.isVisible({ timeout: 1000 })) {
          const text = await link.innerText();
          const href = await link.getAttribute('href');
          console.log(`   Found link by text: "${text.trim()}" -> ${href}`);
          contactLink = link;
          break;
        }
      } catch (e) {}
    }

    // Try finding by href if text failed
    if (!contactLink) {
      console.log('   No visible contact link found via keywords. Trying URL patterns in DOM...');
      const hrefLink = page.locator('a[href*="contact" i]').first();
      try {
        if (await hrefLink.count() > 0) {
          const text = await hrefLink.innerText();
          const href = await hrefLink.getAttribute('href');
          console.log(`   Found link by href: "${text.trim()}" -> ${href}`);
          contactLink = hrefLink;
        }
      } catch (e) {}
    }

    if (contactLink) {
      console.log('   Found Contact Link. Navigating...');
      const href = await contactLink.getAttribute('href');
      const targetUrl = new URL(href, page.url()).href;
      console.log(`   Navigating to: ${targetUrl}`);
      
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000); 
      console.log('   ✓ Current URL: ' + page.url());
    } else {
      console.log('   No link found. Trying exact fallback...');
      await page.goto('https://www.2020innovation.com/contact-us', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }

    await page.waitForTimeout(2000);

    // 3. Find contact form (more robust, including iframes)
    console.log('Step 3: Finding Form...');
    let form = null;
    let targetFrame = page;
    
    // Check main page first
    const mainForms = await page.locator('form');
    const mainFormCount = await mainForms.count();
    for (let i = 0; i < mainFormCount; i++) {
        if (await mainForms.nth(i).isVisible()) {
            form = mainForms.nth(i);
            console.log(`   Found visible form on main page (index ${i})`);
            break;
        }
    }

    // If no form on main page, check iframes
    if (!form) {
        console.log('   No visible form on main page, checking iframes...');
        const frames = page.frames();
        console.log(`   Scanning ${frames.length} frames...`);
        
        for (const frame of frames) {
            if (frame === page.mainFrame()) continue;
            try {
                const frameForms = await frame.locator('form');
                const frameFormCount = await frameForms.count();
                for (let i = 0; i < frameFormCount; i++) {
                    if (await frameForms.nth(i).isVisible()) {
                        form = frameForms.nth(i);
                        targetFrame = frame;
                        console.log(`   Found visible form in iframe: ${frame.url().substring(0, 50)}...`);
                        break;
                    }
                }
                if (form) break;
            } catch (e) {}
        }
    }

    if (!form) {
        console.log('   ❌ No visible form found anywhere (main page or iframes).');
    }

    // 4. Fill it (Heuristic filling)
    console.log('Step 4: Filling...');
    
    if (form) {
        const fillField = async (selector, value, label) => {
            const field = targetFrame.locator(selector).first();
            try {
                if (await field.isVisible({ timeout: 2000 })) {
                    await field.fill(value);
                    console.log(`   ✓ Filled ${label}`);
                    return true;
                }
            } catch (e) {}
            return false;
        };

        await fillField('input[name*="name" i], input[placeholder*="Name" i]', 'Automated Tester', 'Name');
        await fillField('input[type="email"], input[name*="email" i], input[placeholder*="Email" i]', 'test@example.com', 'Email');
        await fillField('textarea, input[name*="message" i]', 'This is a standalone test of discovery and form filling. NO SUBMISSION.', 'Message');
    } else {
        console.log('   Skipping fill because no form was found.');
    }

    console.log('✅ Form filling attempt complete.');

    // 5. Screenshot Logic
    const SHOULD_TAKE_SCREENSHOT = true;
    
    if (SHOULD_TAKE_SCREENSHOT) {
      console.log('Step 5: Taking Screenshot...');
      await page.screenshot({ path: 'test_discovery_result.png', fullPage: true });
      console.log('📸 Screenshot saved: test_discovery_result.png');
    }

    console.log('\n--- SUCCESS: Discovery and Fill complete (NOT SUBMITTED) ---');
    console.log('Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (err) {
    console.error('❌ Error during test execution:', err.message);
  } finally {
    await browser.close();
  }
}

const targetUrl = process.argv[2] || 'https://2020innovation.com/contact-us';
testFill(targetUrl);
