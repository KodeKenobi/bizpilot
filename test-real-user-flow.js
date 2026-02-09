const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

const FRONTEND_URL = 'https://www.trevnoctilla.com';
const BACKEND_URL = 'https://web-production-737b.up.railway.app';

async function testRealUserFlow() {
    console.log('\x1b[36m\n=== Testing REAL User Campaign Flow ===\x1b[0m');
    console.log(`\x1b[33mFrontend: ${FRONTEND_URL}\x1b[0m`);
    console.log(`\x1b[33mBackend: ${BACKEND_URL}\x1b[0m\n`);

    let browser;
    let campaignId;

    try {
        // Step 1: Create a campaign via API (like uploading CSV)
        console.log('\x1b[36m[Step 1] Creating campaign with CSV data...\x1b[0m');
        const companies = [
            {
                company_name: "Test Company",
                website_url: "https://example.com",
                contact_email: "test@example.com"
            }
        ];

        const createResponse = await fetch(`${BACKEND_URL}/api/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `User Flow Test - ${new Date().toISOString()}`,
                message_template: 'Hello {company_name}! This is a test message.',
                companies: companies
            })
        });

        const createData = await createResponse.json();
        campaignId = createData.campaign.id;
        console.log(`\x1b[32m✓ Campaign created: ID ${campaignId}\x1b[0m`);

        // Step 2: Launch browser and navigate to campaigns page
        console.log('\n\x1b[36m[Step 2] Opening browser and navigating to campaigns page...\x1b[0m');
        browser = await puppeteer.launch({
            headless: false, // Show browser so we can see
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        
        // Listen for console logs from the page
        page.on('console', msg => {
            if (msg.text().includes('WebSocket')) {
                console.log(`\x1b[35m[Browser Console]\x1b[0m ${msg.text()}`);
            }
        });

        // Navigate to campaigns page
        console.log(`\x1b[33mNavigating to: ${FRONTEND_URL}/campaigns\x1b[0m`);
        await page.goto(`${FRONTEND_URL}/campaigns`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000);
        console.log(`\x1b[32m✓ Campaigns page loaded\x1b[0m`);

        // Step 3: Navigate to the specific campaign detail page
        console.log('\n\x1b[36m[Step 3] Opening campaign detail page...\x1b[0m');
        console.log(`\x1b[33mNavigating to: ${FRONTEND_URL}/campaigns/${campaignId}\x1b[0m`);
        await page.goto(`${FRONTEND_URL}/campaigns/${campaignId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000);
        console.log(`\x1b[32m✓ Campaign detail page loaded\x1b[0m`);

        // Step 4: Click "Monitor Live" button
        console.log('\n\x1b[36m[Step 4] Looking for "Monitor Live" button...\x1b[0m');
        
        // Wait for page to fully load
        await page.waitForTimeout(2000);
        
        // Find and click the Monitor Live button
        const monitorButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => btn.textContent.includes('Monitor Live'));
        });
        
        if (!monitorButton) {
            throw new Error('Monitor Live button not found');
        }
        
        console.log(`\x1b[32m✓ Found "Monitor Live" button\x1b[0m`);
        
        // Click the button
        console.log(`\x1b[33mClicking "Monitor Live" button...\x1b[0m`);
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
            monitorButton.click()
        ]);
        await page.waitForTimeout(3000);
        console.log(`\x1b[32m✓ Navigated to monitor page\x1b[0m`);

        // Step 5: Wait for monitor page to load and check for company selector
        console.log('\n\x1b[36m[Step 5] Monitoring page loaded, checking elements...\x1b[0m');
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        console.log(`\x1b[33mCurrent URL: ${currentUrl}\x1b[0m`);

        // Check if we can find the start monitoring button
        const hasStartButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.some(btn => btn.textContent.includes('Start') || btn.textContent.includes('Monitor'));
        });

        if (hasStartButton) {
            console.log(`\x1b[32m✓ Found monitoring controls\x1b[0m`);
        } else {
            console.log(`\x1b[33m⚠ No monitoring controls found yet\x1b[0m`);
        }

        // Step 6: Capture WebSocket connection attempts
        console.log('\n\x1b[36m[Step 6] Monitoring for WebSocket connections...\x1b[0m');
        
        let wsConnected = false;
        let wsMessages = [];

        // Intercept WebSocket traffic
        await page.evaluateOnNewDocument(() => {
            const originalWebSocket = window.WebSocket;
            window.WebSocket = function(url, protocols) {
                console.log('[WebSocket] Attempting connection:', url);
                const ws = new originalWebSocket(url, protocols);
                
                ws.addEventListener('open', () => {
                    console.log('[WebSocket] Connection opened successfully');
                    window.__wsConnected = true;
                });
                
                ws.addEventListener('message', (event) => {
                    console.log('[WebSocket] Message received:', event.data.substring(0, 200));
                    if (!window.__wsMessages) window.__wsMessages = [];
                    window.__wsMessages.push(event.data);
                });
                
                ws.addEventListener('error', (error) => {
                    console.log('[WebSocket] Error occurred');
                    window.__wsError = true;
                });
                
                ws.addEventListener('close', (event) => {
                    console.log('[WebSocket] Connection closed:', event.code, event.reason);
                });
                
                return ws;
            };
        });

        // Click "Load Website" button
        console.log(`\x1b[33mLooking for "Load Website" button...\x1b[0m`);
        
        try {
            await page.waitForTimeout(3000); // Give page time to load
            
            const clicked = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const loadBtn = buttons.find(btn => 
                    btn.textContent.includes('Load Website') || 
                    btn.textContent.includes('Start')
                );
                if (loadBtn && !loadBtn.disabled) {
                    loadBtn.click();
                    return true;
                }
                return false;
            });
            
            if (clicked) {
                console.log(`\x1b[32m✓ Clicked "Load Website" button\x1b[0m`);
                await page.waitForTimeout(5000); // Wait for WebSocket and scraping
            } else {
                console.log(`\x1b[33m⚠ Load Website button not found or disabled\x1b[0m`);
            }
        } catch (e) {
            console.log(`\x1b[33m⚠ Error clicking button: ${e.message}\x1b[0m`);
        }

        // Check WebSocket status
        await page.waitForTimeout(5000); // Give it time to connect

        wsConnected = await page.evaluate(() => window.__wsConnected || false);
        wsMessages = await page.evaluate(() => window.__wsMessages || []);

        console.log('\n\x1b[36m[Step 7] Checking results...\x1b[0m');
        
        if (wsConnected) {
            console.log(`\x1b[32m✅ WebSocket connected successfully!\x1b[0m`);
            console.log(`\x1b[32m✓ Received ${wsMessages.length} message(s)\x1b[0m`);
            
            wsMessages.forEach((msg, i) => {
                try {
                    const parsed = JSON.parse(msg);
                    console.log(`\x1b[35m  Message ${i + 1}:\x1b[0m ${parsed.type}`);
                } catch (e) {
                    console.log(`\x1b[35m  Message ${i + 1}:\x1b[0m ${msg.substring(0, 100)}`);
                }
            });
        } else {
            console.log(`\x1b[31m❌ WebSocket did NOT connect\x1b[0m`);
            
            // Take a screenshot for debugging
            await page.screenshot({ path: 'monitor-page-error.png', fullPage: true });
            console.log(`\x1b[33m📸 Screenshot saved: monitor-page-error.png\x1b[0m`);
            
            // Get any error messages from the page
            const errorMessages = await page.evaluate(() => {
                const logs = Array.from(document.querySelectorAll('[class*="log"], [class*="error"], [class*="activity"]'));
                return logs.map(el => el.textContent).join('\n');
            });
            
            if (errorMessages) {
                console.log(`\x1b[33mPage errors:\x1b[0m\n${errorMessages}`);
            }
        }

        // Step 8: Summary
        console.log('\n\x1b[36m=== Test Summary ===\x1b[0m');
        console.log(`Campaign Created: ${campaignId}`);
        console.log(`Monitor Page URL: ${currentUrl}`);
        console.log(`WebSocket Connected: ${wsConnected ? '✅ YES' : '❌ NO'}`);
        console.log(`Messages Received: ${wsMessages.length}`);
        
        if (wsConnected && wsMessages.length > 0) {
            console.log('\n\x1b[32m🎉 TEST PASSED! User flow works end-to-end!\x1b[0m\n');
        } else {
            console.log('\n\x1b[31m❌ TEST FAILED! WebSocket connection issue detected.\x1b[0m\n');
        }

        // Keep browser open for 5 seconds so you can see
        console.log('\x1b[90mKeeping browser open for 5 seconds...\x1b[0m');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('\n\x1b[31m✗ Test Failed!\x1b[0m');
        console.error('\x1b[31mError:\x1b[0m', error.message);
        console.error(error.stack);
    } finally {
        if (browser) {
            await browser.close();
            console.log('\x1b[90mBrowser closed.\x1b[0m\n');
        }
    }
}

// Run the test
testRealUserFlow();
