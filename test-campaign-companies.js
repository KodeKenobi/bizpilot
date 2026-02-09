const fetch = require('node-fetch');

const BACKEND_URL = 'https://web-production-737b.up.railway.app';

async function testCampaignCompanies() {
    console.log('\x1b[36m\n=== Testing Campaign Companies ===\x1b[0m\n');

    try {
        // Get all campaigns
        console.log('\x1b[36m[Step 1] Fetching all campaigns...\x1b[0m');
        const campaignsResponse = await fetch(`${BACKEND_URL}/api/campaigns`);
        const campaignsData = await campaignsResponse.json();
        
        if (!campaignsData.campaigns || campaignsData.campaigns.length === 0) {
            console.log('\x1b[33mNo campaigns found.\x1b[0m');
            return;
        }

        console.log(`\x1b[32m✓ Found ${campaignsData.campaigns.length} campaigns\x1b[0m\n`);

        // Test each campaign
        for (const campaign of campaignsData.campaigns.slice(0, 5)) { // Test first 5
            console.log(`\x1b[36m[Campaign ${campaign.id}] ${campaign.name}\x1b[0m`);
            console.log(`  Status: ${campaign.status}`);
            console.log(`  Total Companies: ${campaign.total_companies}`);
            
            // Fetch companies for this campaign
            const companiesResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaign.id}/companies`);
            const companiesData = await companiesResponse.json();
            
            if (companiesResponse.ok) {
                const companies = companiesData.companies || [];
                console.log(`  \x1b[32m✓ Companies API works: ${companies.length} companies returned\x1b[0m`);
                
                if (companies.length > 0) {
                    companies.slice(0, 3).forEach((c, i) => {
                        console.log(`    ${i + 1}. ${c.company_name} - ${c.website_url} (${c.status})`);
                    });
                } else {
                    console.log(`    \x1b[33m⚠ No companies found despite total_companies=${campaign.total_companies}\x1b[0m`);
                }
            } else {
                console.log(`  \x1b[31m✗ Companies API failed: ${companiesData.error || 'Unknown error'}\x1b[0m`);
            }
            console.log('');
        }

        console.log('\x1b[32m=== Test Complete! ===\x1b[0m\n');

    } catch (error) {
        console.error('\n\x1b[31m✗ Test Failed!\x1b[0m');
        console.error('\x1b[31mError:\x1b[0m', error.message);
    }
}

testCampaignCompanies();
