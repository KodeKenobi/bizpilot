/**
 * Test the Rapid All functionality with real companies from main-leads.csv
 */

const axios = require('axios');

const BASE_URL = 'https://www.trevnoctilla.com';
const BACKEND_URL = 'https://web-production-737b.up.railway.app';

async function testRealCompanies() {
  console.log('🧪 Testing Rapid All with real companies from CSV\n');

  try {
    // Create a campaign with the two companies we tested
    const campaignResponse = await axios.post(`${BASE_URL}/api/campaigns`, {
      name: "Real Companies Test",
      message_template: JSON.stringify({
        sender_name: "Test User",
        sender_email: "test@example.com",
        sender_phone: "+1-555-TEST",
        sender_address: "",
        subject: "Business Inquiry",
        message: "Hello, this is a test message. Please disregard."
      }),
      companies: [
        {
          company_name: "2020 Innovation",
          website_url: "https://2020innovation.com",
          country: "United Kingdom"
        },
        {
          company_name: "3 Line Electrical Wholesale Ltd.",
          website_url: "https://3lineelectrical.co.uk",
          country: "United Kingdom"
        }
      ],
      session_id: `test-session-${Date.now()}`
    });

    const campaignId = campaignResponse.data.campaign.id;
    console.log(`✅ Created campaign with ID: ${campaignId}`);

    // Get company IDs
    const companiesResponse = await axios.get(`${BASE_URL}/api/campaigns/${campaignId}/companies`);
    const companies = companiesResponse.data.companies;
    const companyIds = companies.map(c => c.id);

    console.log(`📊 Found ${companies.length} companies: ${companyIds.join(', ')}`);

    // Start Rapid All processing (individual since different URLs)
    console.log('\n🚀 Starting Rapid All processing...');

    for (const company of companies) {
      console.log(`\n📝 Processing ${company.company_name}...`);

      try {
        const response = await axios.post(`${BASE_URL}/api/campaigns/${campaignId}/companies/${company.id}/rapid-process`);
        console.log(`   ✅ ${company.company_name}: ${response.data.success ? 'SUCCESS' : 'FAILED'}`);
        if (response.data.error) {
          console.log(`   ❌ Error: ${response.data.error}`);
        }
        if (response.data.result && response.data.result.emails_found) {
          console.log(`   📧 Emails found: ${response.data.result.emails_found.join(', ')}`);
        }
      } catch (error) {
        console.log(`   ❌ ${company.company_name}: ${error.response?.data?.error || error.message}`);
      }

      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Wait a bit and check results
    console.log('\n⏳ Waiting 5 seconds for processing...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check final results
    const finalResponse = await axios.get(`${BASE_URL}/api/campaigns/${campaignId}/companies`);
    const finalCompanies = finalResponse.data.companies;

    console.log('\n📊 FINAL RESULTS:');
    finalCompanies.forEach(company => {
      console.log(`\n🏢 ${company.company_name}`);
      console.log(`   Status: ${company.status}`);
      console.log(`   Error: ${company.error_message || 'None'}`);
      console.log(`   Form found: ${company.form_found}`);
      console.log(`   Contact page found: ${company.contact_page_found}`);

      // Check if emails were found
      if (company.additional_data && company.additional_data.emails_found) {
        console.log(`   ✅ Emails found: ${company.additional_data.emails_found.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRealCompanies();