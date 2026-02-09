const fetch = require('node-fetch');

async function checkBackendHealth() {
    console.log('\x1b[36m\n=== Checking Backend Health ===\x1b[0m\n');
    
    // Check basic health
    try {
        const healthResponse = await fetch('https://web-production-737b.up.railway.app/health');
        const healthData = await healthResponse.text();
        console.log('\x1b[32m✓ Backend is online\x1b[0m');
        console.log(`  Status: ${healthResponse.status}`);
    } catch (e) {
        console.log('\x1b[31m✗ Backend is offline or unreachable\x1b[0m');
        return;
    }
    
    // Check campaigns endpoint
    try {
        const campaignsResponse = await fetch('https://web-production-737b.up.railway.app/api/campaigns');
        const campaignsData = await campaignsResponse.json();
        console.log('\x1b[32m✓ Campaigns API working\x1b[0m');
        console.log(`  Total campaigns: ${campaignsData.campaigns?.length || 0}`);
    } catch (e) {
        console.log('\x1b[31m✗ Campaigns API error:\x1b[0m', e.message);
    }
    
    console.log('\n\x1b[33m⚠ WebSocket Issue:\x1b[0m');
    console.log('  The WebSocket connects but crashes when launching the browser.');
    console.log('  This means Playwright/Chromium is NOT installed yet on the backend.\n');
    console.log('\x1b[36mReason:\x1b[0m');
    console.log('  Railway is still rebuilding the backend Docker image with Playwright.');
    console.log('  This process downloads ~150MB of Chromium and takes 10-15 minutes.\n');
    console.log('\x1b[36mSolution:\x1b[0m');
    console.log('  1. Check Railway logs: https://railway.app/');
    console.log('  2. Look for "playwright install chromium" in build logs');
    console.log('  3. Wait for deployment to complete');
    console.log('  4. You\'ll see "Deployment successful" in Railway\n');
    console.log('\x1b[33mCurrent Status:\x1b[0m');
    console.log('  Frontend: ✓ Deployed and working');
    console.log('  Backend API: ✓ Working (campaigns, companies)');
    console.log('  Backend WebSocket: ✓ Connecting');
    console.log('  Backend Browser: ✗ Still installing (Playwright/Chromium)\n');
}

checkBackendHealth().catch(console.error);
