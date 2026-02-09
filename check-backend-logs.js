const puppeteer = require('puppeteer');

async function checkBackendLogs() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    
    // Capture detailed WebSocket events
    page.on('console', msg => {
        console.log(`\x1b[36m[Browser]\x1b[0m ${msg.text()}`);
    });
    
    // Navigate and monitor
    console.log('\n\x1b[33mNavigating to monitor page...\x1b[0m\n');
    await page.goto('https://www.trevnoctilla.com/campaigns/8/monitor', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
    });
    
    console.log('\n\x1b[33mWaiting 15 seconds to observe WebSocket behavior...\x1b[0m\n');
    await page.waitForTimeout(15000);
    
    console.log('\n\x1b[32mTest complete - check console logs above\x1b[0m\n');
    await browser.close();
}

checkBackendLogs().catch(console.error);
