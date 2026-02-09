import sys
import os
import json
import re

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'trevnoctilla-backend'))

from services.fast_campaign_processor import FastCampaignProcessor
from playwright.sync_api import sync_playwright

def run_test():
    print("=== Standalone Processor Verification (2020 Innovation) ===")
    
    company_data = {
        "website_url": "https://2020innovation.com",
        "company_name": "2020 Innovation",
        "contact_person": "Visual Tester",
        "contact_email": "test@example.com",
        "phone": "0123456789"
    }
    
    message = "This is a standalone test message for form heuristics."
    subject = "Automated Test Inquiry"
    
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        processor = FastCampaignProcessor(
            page=page,
            company_data=company_data,
            message_template=message,
            campaign_id="test-campaign",
            company_id="test-company",
            subject=subject
        )
        
        # Take full page screenshot if needed inside processor or here
        print("Processing company (SIMULATION MODE)...")
        result = processor.process_company()
        
        # Take a final full page screenshot for manual verification
        page.screenshot(path="static/screenshots/final_verify_full.png", full_page=True)
        print("Final verification screenshot saved to static/screenshots/final_verify_full.png")
        
        print("\n=== RESULT ===")
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            print("\n✅ SUCCESS: Processor correctly handled the form.")
            if 'screenshot_url' in result:
                print(f"📸 Screenshot saved at: {result['screenshot_url']}")
        else:
            print("\n❌ FAILED: " + result.get('error', 'Unknown Error'))
            
        browser.close()

if __name__ == "__main__":
    run_test()
