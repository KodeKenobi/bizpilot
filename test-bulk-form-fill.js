const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Bulk Form Filling and Screenshot Script (Enhanced)
 * 
 * This script visits a list of websites, finds their contact forms,
 * fills them with test data (without submitting), and takes a screenshot.
 * 
 * Usage: 
 *   node test-bulk-form-fill.js "https://example1.com" "https://example2.com"
 *   OR Edit the DEFAULT_URLS array below.
 */

// --- CONFIGURATION ---
const DEFAULT_URLS = [
    'https://2020innovation.com',
    'https://www.trevnoctilla.com'
];

const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots', 'bulk');
const TEST_DATA = {
    firstName: 'Automated',
    lastName: 'Tester',
    fullName: 'Automated Tester',
    email: 'test@example.com',
    phone: '07123456789',
    company: 'AutoTest Corp',
    message: 'This is an automated test message for form discovery and filling. No submission was intended.'
};

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBulkTest(urls) {
    console.log(`\n🚀 Starting Bulk Form Fill Test for ${urls.length} sites...\n`);
    
    const browser = await chromium.launch({ 
        headless: false, // Set to true if you want it to run in background
        slowMo: 300      // Slightly faster but still watchable
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const results = [];

    for (const baseUrl of urls) {
        console.log(`\n-----------------------------------------`);
        console.log(`🌐 Testing: ${baseUrl}`);
        
        const page = await context.newPage();
        const siteResult = { url: baseUrl, status: 'FAILED', message: '' };

        try {
            // 1. Visit Homepage
            console.log(`[1/5] Navigating to homepage...`);
            await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            // 1.1 Dismiss common cookie banners
            await dismissCookies(page);

            // 2. Discover Contact Page
            console.log(`[2/5] Searching for contact page...`);
            let contactUrl = await findContactPage(page, baseUrl);
            
            if (contactUrl && contactUrl !== page.url()) {
                console.log(`      Found contact page: ${contactUrl}`);
                await page.goto(contactUrl, { waitUntil: 'networkidle', timeout: 30000 });
            } else {
                // Try a common path if nothing found
                const commonPaths = ['/contact', '/contact-us', '/get-in-touch'];
                for (const p of commonPaths) {
                    try {
                        const testUrl = new URL(p, baseUrl).href;
                        const resp = await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
                        if (resp && resp.status() < 400) {
                            console.log(`      Found contact page at common path: ${testUrl}`);
                            break;
                        }
                    } catch (e) {}
                }
            }

            // 3. Find and Fill Form
            console.log(`[3/5] Identifying and filling form...`);
            const fillCount = await fillFormHeuristically(page);

            if (fillCount > 0) {
                siteResult.status = 'SUCCESS';
                console.log(`      ✓ Filled ${fillCount} fields!`);
            } else {
                siteResult.status = 'PARTIAL';
                siteResult.message = 'No form detected or filled';
                console.log(`      ⚠ No form detected or filled.`);
            }

            // 4. Take Screenshot
            console.log(`[4/5] Capturing screenshot...`);
            const safeName = baseUrl.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '_');
            const screenshotPath = path.join(SCREENSHOT_DIR, `${safeName}_${Date.now()}.png`);
            
            // Wait a moment for any dynamic content/animations to settle
            await page.waitForTimeout(2000);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`      📸 Saved: ${path.basename(screenshotPath)}`);
            siteResult.screenshot = screenshotPath;

        } catch (err) {
            console.error(`      ❌ Error: ${err.message}`);
            siteResult.message = err.message;
        } finally {
            await page.close();
            results.push(siteResult);
        }
    }

    await browser.close();

    console.log(`\n=========================================`);
    console.log(`🏁 BULK TEST COMPLETE`);
    console.log(`Summary:`);
    results.forEach(res => {
        console.log(` - ${res.url}: ${res.status} ${res.message ? `(${res.message})` : ''}`);
    });
    console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log(`=========================================\n`);
}

/**
 * Heuristically dismisses cookie banners
 */
async function dismissCookies(page) {
    const selectors = [
        'button:has-text("Accept")', 
        'button:has-text("Agree")', 
        'button:has-text("Allow All")',
        'button:has-text("I Accept")',
        '#cookie-accept',
        '.cookie-banner button',
        '.cm-btn-success' // Cookiebot
    ];
    for (const s of selectors) {
        try {
            const btn = page.locator(s).first();
            if (await btn.isVisible({ timeout: 1000 })) {
                await btn.click();
                console.log(`      Dismissed cookie banner (${s})`);
                await page.waitForTimeout(500);
            }
        } catch (e) {}
    }
}

/**
 * Finds the contact page URL via links on the current page
 */
async function findContactPage(page, baseUrl) {
    const keywords = ['contact', 'get in touch', 'enquiry', 'reach us'];
    
    // Try keywords in text
    for (const kw of keywords) {
        try {
            const link = page.locator(`a:has-text("${kw}")`).first();
            if (await link.isVisible({ timeout: 1000 })) {
                return await link.getAttribute('href').then(h => new URL(h, baseUrl).href);
            }
        } catch (e) {}
    }

    // Try href pattern
    try {
        const link = page.locator('a[href*="contact" i]').first();
        if (await link.count() > 0) {
            return await link.getAttribute('href').then(h => new URL(h, baseUrl).href);
        }
    } catch (e) {}

    return null;
}

/**
 * Fills the form using common field selectors
 */
async function fillFormHeuristically(page) {
    let formElement = null;
    let targetFrame = page;

    // Give dynamic forms (HubSpot, etc.) time to load
    await page.waitForTimeout(3000);

    // Check main page for forms
    const forms = page.locator('form:visible');
    const formCount = await forms.count();
    
    if (formCount > 0) {
        // Find form that looks like a contact form (has email or textarea)
        for (let i = 0; i < formCount; i++) {
            const f = forms.nth(i);
            const hasEmail = await f.locator('input[type="email"], input[name*="email" i]').count() > 0;
            const hasTextarea = await f.locator('textarea').count() > 0;
            if (hasEmail || hasTextarea) {
                formElement = f;
                console.log(`      Found form on main page.`);
                break;
            }
        }
    }

    // If not found, check iframes
    if (!formElement) {
        console.log(`      Checking iframes for forms...`);
        for (const frame of page.frames()) {
            try {
                const frameForms = frame.locator('form:visible');
                const fCount = await frameForms.count();
                if (fCount > 0) {
                    for(let i=0; i<fCount; i++){
                        const f = frameForms.nth(i);
                        const hasEmail = await f.locator('input[type="email"], input[name*="email" i]').count() > 0;
                        if (hasEmail) {
                            formElement = f;
                            targetFrame = frame;
                            console.log(`      Found form in iframe: ${frame.url().split('?')[0]}`);
                            break;
                        }
                    }
                }
            } catch (e) {}
            if (formElement) break;
        }
    }

    if (!formElement) {
        // Fallback: If no form found, just use the first visible form
        const visibleForm = page.locator('form:visible').first();
        if (await visibleForm.count() > 0) {
            formElement = visibleForm;
            console.log(`      No specific contact form identified, using first visible form.`);
        } else {
            return 0;
        }
    }

    // Field filling logic
    let fieldsFilled = 0;

    const fillIfFound = async (selectors, value, label) => {
        for (const sel of selectors) {
            try {
                const el = formElement.locator(sel).first();
                if (await el.isVisible({ timeout: 500 })) {
                    await el.fill(value);
                    console.log(`      ✓ Filled ${label} (${sel})`);
                    fieldsFilled++;
                    return true;
                }
            } catch (e) {}
        }
        return false;
    };

    const selectIfFound = async (selectors, label) => {
        for (const sel of selectors) {
            try {
                const el = formElement.locator(sel).first();
                if (await el.isVisible({ timeout: 500 })) {
                    // Try to select the first non-empty option
                    const options = await el.locator('option').all();
                    for(const opt of options) {
                        const val = await opt.getAttribute('value');
                        if (val && val.length > 0) {
                            await el.selectOption(val);
                            console.log(`      ✓ Selected ${label} option: ${val}`);
                            fieldsFilled++;
                            return true;
                        }
                    }
                }
            } catch (e) {}
        }
        return false;
    };

    const checkIfFound = async (selectors, label) => {
        for (const sel of selectors) {
            try {
                const el = formElement.locator(sel).first();
                if (await el.isVisible({ timeout: 500 })) {
                    await el.check();
                    console.log(`      ✓ Checked ${label} (${sel})`);
                    fieldsFilled++;
                    return true;
                }
            } catch (e) {}
        }
        return false;
    };

    // 1. Email (Critical)
    await fillIfFound(['input[type="email"]', 'input[name="email" i]', 'input[id*="email" i]'], TEST_DATA.email, 'Email');

    // 2. Name
    const firstNameFilled = await fillIfFound(['input[name="firstname" i]', 'input[id*="firstname" i]', 'input[placeholder*="First Name" i]'], TEST_DATA.firstName, 'First Name');
    const lastNameFilled = await fillIfFound(['input[name="lastname" i]', 'input[id*="lastname" i]', 'input[placeholder*="Last Name" i]'], TEST_DATA.lastName, 'Last Name');
    
    if (!firstNameFilled) {
        await fillIfFound(['input[name="name" i]', 'input[id*="name" i]', 'input[placeholder*="Name" i]'], TEST_DATA.fullName, 'Full Name');
    }

    // 3. Phone
    await fillIfFound(['input[type="tel"]', 'input[name*="phone" i]', 'input[id*="phone" i]'], TEST_DATA.phone, 'Phone');

    // 4. Company
    await fillIfFound(['input[name*="company" i]', 'input[id*="company" i]', 'input[placeholder*="Company" i]'], TEST_DATA.company, 'Company');

    // 5. Selects (Country, etc)
    await selectIfFound(['select[name*="country" i]', 'select[id*="country" i]', 'select[name*="ext" i]', 'select[id*="ext" i]'], 'Select Field');

    // 6. Checkboxes (Enquiry Type, GDPR)
    await checkIfFound(['input[type="checkbox"][name*="enquiry" i]', 'input[type="checkbox"]'], 'Checkbox');

    // 7. Message (Critical)
    await fillIfFound(['textarea', 'input[name*="message" i]', 'textarea[name*="message" i]'], TEST_DATA.message, 'Message');

    return fieldsFilled;
}

// Start the process
const args = process.argv.slice(2);
const urlsToTest = args.length > 0 ? args : DEFAULT_URLS;

runBulkTest(urlsToTest);

