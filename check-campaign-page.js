const puppeteer = require('puppeteer');

async function checkCampaignPage() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    
    console.log('Navigating to campaign detail page...');
    await page.goto('https://www.trevnoctilla.com/campaigns/2', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'campaign-page.png', fullPage: true });
    console.log('Screenshot saved: campaign-page.png');
    
    // Get all button text
    const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(btn => ({
            text: btn.textContent.trim(),
            classes: btn.className
        }));
    });
    
    console.log('\nButtons found on page:');
    buttons.forEach((btn, i) => {
        console.log(`  ${i + 1}. "${btn.text}"`);
    });
    
    // Get page content
    const content = await page.evaluate(() => document.body.innerText);
    console.log('\n=== Page Content (first 500 chars) ===');
    console.log(content.substring(0, 500));
    
    // Check for companies table
    const hasCompanies = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('Total Companies') || text.includes('company') || text.includes('Monitor');
    });
    
    console.log(`\nHas companies content: ${hasCompanies}`);
    
    console.log('\nKeeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    
    await browser.close();
}

checkCampaignPage().catch(console.error);
