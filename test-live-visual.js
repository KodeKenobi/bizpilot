/**
 * LIVE VISUAL TEST
 * Shows the browser automation working in REAL-TIME with a GUI.
 * 
 * Usage: node test-live-visual.js [url]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.argv[2] || 'https://www.modelshop.co.uk/';

// Dummy Profile for testing
const testProfile = {
  sender_name: "Visual Test Agent",
  sender_email: "test@trevnoctilla-demo.com",
  sender_phone: "07123456789",
  sender_company: "Trevnoctilla Automation",
  message: "Hello! This is an automated visual test of our form-filling engine. We are verifying field detection and interaction. Please ignore this automated message.",
  subject: "Automation System Test",
  sender_country: "United Kingdom"
};

async function runVisualTest() {
  console.log('\n--- STARTING LIVE VISUAL TEST ---');
  console.log(`Target: ${TARGET_URL}`);
  console.log('Mode: Headful (Visible)');
  console.log('Speed: Slow (1000ms delay between actions)\n');

  const browser = await chromium.launch({
    headless: false, // SEE THE MAGIC
    slowMo: 1000,    // Slow enough to follow
    args: ['--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // 1. Navigation
    console.log('STEP 1: Navigating to website...');
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('✓ Page loaded.');

    // 2. Cookie Dismissal (Visual)
    console.log('STEP 2: Attempting cookie/modal dismissal...');
    const cookieButtons = await page.getByRole('button', { name: /accept|agree|close|dismiss|ok/i }).all();
    for (const btn of cookieButtons) {
      if (await btn.isVisible()) {
        console.log(`Found cookie button: "${await btn.innerText()}" - Clicking...`);
        await btn.click();
        await page.waitForTimeout(1000);
      }
    }

    // 3. Find Contact Page if needed
    let currentUrl = page.url();
    const hasForm = (await page.$$('input:not([type="hidden"]), textarea')).length >= 3;

    if (!hasForm) {
      console.log('No form found on landing page. Searching for "Contact" link...');
      const contactLink = await page.locator('a:has-text("Contact"), a:has-text("Get in touch"), a[href*="contact"]').first();
      if (await contactLink.isVisible()) {
        console.log(`Found contact link: ${await contactLink.getAttribute('href')} - Navigating...`);
        await contactLink.click();
        await page.waitForLoadState('networkidle');
      } else {
        console.log('No obvious contact link. Trying direct /contact path...');
        await page.goto(TARGET_URL.replace(/\/$/, '') + '/contact', { waitUntil: 'domcontentloaded' }).catch(() => {});
      }
    }

    // 4. Form Detection & Filling
    console.log('\nSTEP 3: Detecting Form Fields...');
    await page.waitForTimeout(2000); // Wait for dynamic forms
    
    // Using the same logic as our production script
    const elements = await page.$$('input:not([type="hidden"]), textarea, select');
    console.log(`Discovered ${elements.length} interactive fields.`);

    let filledCount = 0;
    for (const el of elements) {
      const details = await el.evaluate(e => {
        const tag = e.tagName.toLowerCase();
        const type = e.getAttribute('type') || (tag === 'select' ? 'select' : 'text');
        const name = e.getAttribute('name') || e.getAttribute('id') || 'unnamed';
        let labelText = '';
        const l = document.querySelector(`label[for="${e.id}"]`) || e.closest('label');
        if (l) labelText = l.textContent.trim();
        return { tag, type, name, labelText };
      });

      const fieldText = `${details.name} ${details.labelText} ${details.type}`.toLowerCase();
      
      // LOGIC: Same as rapid-process-single.js
      if (fieldText.includes('email')) {
        await el.fill(testProfile.sender_email);
        console.log(`  [FILL] Email detected -> ${testProfile.sender_email}`);
        filledCount++;
      } else if (fieldText.includes('name') && !fieldText.includes('company')) {
        await el.fill(testProfile.sender_name);
        console.log(`  [FILL] Name detected -> ${testProfile.sender_name}`);
        filledCount++;
      } else if (fieldText.includes('phone') || fieldText.includes('tel')) {
        await el.fill(testProfile.sender_phone);
        console.log(`  [FILL] Phone detected -> ${testProfile.sender_phone}`);
        filledCount++;
      } else if (details.tag === 'textarea' || fieldText.includes('message') || fieldText.includes('comment')) {
        await el.fill(testProfile.message);
        console.log(`  [FILL] Message area detected.`);
        filledCount++;
      } else if (details.tag === 'select' && (fieldText.includes('country') || fieldText.includes('subject'))) {
        // Simple select first option for visual demo
        await el.selectOption({ index: 1 });
        console.log(`  [FILL] Select dropdown adjusted.`);
        filledCount++;
      }
    }

    console.log(`\nCOMPLETED: Filled ${filledCount} fields.`);
    console.log('The browser will stay open for 15 seconds for you to inspect...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\nERROR DURING TEST:', error.message);
  } finally {
    await browser.close();
    console.log('\n--- VISUAL TEST FINISHED ---');
  }
}

runVisualTest();
