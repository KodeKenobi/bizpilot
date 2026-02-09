/**
 * Create a test campaign and monitor it
 */

const BACKEND_URL = 'https://web-production-737b.up.railway.app';

async function createAndMonitorCampaign() {
  try {
    console.log('🚀 Creating test campaign...\n');

    // Create campaign with your website
    const campaignData = {
      name: 'Test Campaign',
      message_template: 'Hi, I am testing the automated contact form submission system. Please ignore this message.',
      companies: [
        {
          company_name: 'Trevnoctilla',
          website_url: 'https://www.trevnoctilla.com',
          contact_email: 'info@trevnoctilla.com',
          phone: '+27630291420'
        }
      ]
    };

    const response = await fetch(`${BACKEND_URL}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create campaign: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Campaign created successfully!\n');
    
    const campaign = result.campaign || result;
    console.log(`📊 Campaign ID: ${campaign.id}`);
    console.log(`📝 Campaign Name: ${campaign.name}`);
    console.log(`👥 Total Companies: ${campaign.total_companies}`);

    // Fetch companies separately
    const companiesResponse = await fetch(`${BACKEND_URL}/api/campaigns/${campaign.id}/companies`);
    if (companiesResponse.ok) {
      const companiesData = await companiesResponse.json();
      const companies = companiesData.companies || [];
      
      if (companies.length > 0) {
        const company = companies[0];
        console.log(`\n🏢 Company ID: ${company.id}`);
        console.log(`🏢 Company Name: ${company.company_name}`);
        console.log(`🌐 Website: ${company.website_url}`);
        
        console.log(`\n✨ OPEN THIS URL TO MONITOR:`);
        console.log(`https://www.trevnoctilla.com/campaigns/${campaign.id}/monitor?companyId=${company.id}`);
        
        console.log(`\n📝 Or navigate to campaign detail page:`);
        console.log(`https://www.trevnoctilla.com/campaigns/${campaign.id}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAndMonitorCampaign();
