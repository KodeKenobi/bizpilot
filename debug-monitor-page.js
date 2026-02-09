const puppeteer = require('puppeteer');

async function debugMonitorPage() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    
    // Capture all console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        const color = type === 'error' ? '\x1b[31m' : type === 'warning' ? '\x1b[33m' : '\x1b[36m';
        console.log(`${color}[Browser ${type.toUpperCase()}]\x1b[0m ${text}`);
    });
    
    // Capture page errors
    page.on('pageerror', error => {
        console.log('\x1b[31m[Page Error]\x1b[0m', error.message);
    });
    
    // Capture failed requests
    page.on('requestfailed', request => {
        console.log('\x1b[33m[Request Failed]\x1b[0m', request.url(), request.failure().errorText);
    });
    
    console.log('Navigating to monitor page...');
    await page.goto('https://www.trevnoctilla.com/campaigns/5/monitor', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
    });
    
    console.log('\n\x1b[36mWaiting 10 seconds to observe behavior...\x1b[0m\n');
    await page.waitForTimeout(10000);
    
    // Check if WebSocket was attempted
    const wsStatus = await page.evaluate(() => {
        return {
            wsConnected: window.__wsConnected || false,
            wsError: window.__wsError || false,
            wsMessages: window.__wsMessages ? window.__wsMessages.length : 0
        };
    });
    
    console.log('\n\x1b[36m=== WebSocket Status ===\x1b[0m');
    console.log('Connected:', wsStatus.wsConnected);
    console.log('Error:', wsStatus.wsError);
    console.log('Messages:', wsStatus.wsMessages);
    
    // Take screenshot
    await page.screenshot({ path: 'monitor-debug.png', fullPage: true });
    console.log('\n\x1b[33m📸 Screenshot saved: monitor-debug.png\x1b[0m');
    
    console.log('\n\x1b[90mKeeping browser open for 30 seconds for manual inspection...\x1b[0m');
    await page.waitForTimeout(30000);
    
    await browser.close();
}

debugMonitorPage().catch(console.error);
