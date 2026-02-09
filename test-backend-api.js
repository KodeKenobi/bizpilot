const axios = require('axios');

async function testBackendAPI() {
    const BACKEND_URL = 'https://web-production-737b.up.railway.app';
    const companies = [
        { name: '2020 Innovation', url: 'https://2020innovation.com' },
        { name: 'Trevnoctilla', url: 'https://www.trevnoctilla.com' }
    ];

    console.log('--- Backend API Diagnostics ---');
    
    for (const company of companies) {
        console.log(`\nTesting ${company.name} (${company.url})...`);
        try {
            // Trigger rapid process (mocking the frontend call)
            // We need a company ID, but let's try to find one or just log the error
            console.log('Sending process request...');
            // Note: In reality, we'd need a valid campaign/company ID from DB.
            // But if the E2E test ran, it created a campaign.
            // Let's just check the /health or a known endpoint to ensure the new code is there.
            
            // Actually, let's just run the E2E test one more time but focus on the processing loop.
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

testBackendAPI();
