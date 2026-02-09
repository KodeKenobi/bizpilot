const WebSocket = require('ws');

console.log('\x1b[36m\n=== Testing if Playwright is Installed on Backend ===\x1b[0m\n');

const ws = new WebSocket('wss://web-production-737b.up.railway.app/ws/campaign/1/monitor/1');

ws.on('open', () => {
    console.log('\x1b[32m✓ WebSocket connected\x1b[0m');
});

ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log(`\x1b[35m[${message.type}]\x1b[0m`, JSON.stringify(message.data, null, 2));
    
    // If we get past "Launching browser" without crashing, Playwright works
    if (message.type === 'log' && message.data.action === 'Navigating') {
        console.log('\n\x1b[32m🎉 SUCCESS! Playwright is working!\x1b[0m\n');
    }
});

ws.on('error', (error) => {
    console.log('\x1b[31m✗ WebSocket error:\x1b[0m', error.message);
});

ws.on('close', (code, reason) => {
    console.log(`\x1b[33m⚠ Connection closed: ${code}\x1b[0m`, reason.toString());
    
    if (code === 1006) {
        console.log('\n\x1b[31m❌ FAILED - Backend crashed (1006)\x1b[0m');
        console.log('\x1b[33mThis means Playwright/Chromium is NOT installed.\x1b[0m');
        console.log('\x1b[36m\nCheck Railway Deployment Logs:\x1b[0m');
        console.log('1. Go to https://railway.app/');
        console.log('2. Click on your backend service');
        console.log('3. Click "Deployments" tab');
        console.log('4. Click the latest deployment');
        console.log('5. Look for "playwright install chromium" in logs');
        console.log('\n\x1b[33mIf you DON\'T see "playwright install", the Dockerfile changes didn\'t deploy.\x1b[0m\n');
    }
    
    process.exit(code === 1006 ? 1 : 0);
});

// Timeout after 30 seconds
setTimeout(() => {
    console.log('\n\x1b[33m⚠ Timeout - closing connection\x1b[0m');
    ws.close();
}, 30000);
