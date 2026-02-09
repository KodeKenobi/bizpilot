
import asyncio
from playwright.sync_api import sync_playwright
import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'trevnoctilla-backend'))

from services.fast_campaign_processor import FastCampaignProcessor

def test_urls():
    urls = [
        "https://www.2020innovation.com",
        "https://3lineelectrical.co.uk"
    ]
    
    print(f"Starting local test for {len(urls)} companies...\n")
    
    with sync_playwright() as p:
        # Launch with similar args to production
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
        
        for url in urls:
            print(f"--- Processing: {url} ---")
            page = browser.new_page()
            
            # Mock company data
            company_data = {
                'website_url': url,
                'company_name': 'Test Co',
                'contact_person': 'Test Person',
                'contact_email': 'test@example.com'
            }
            
            # Initialize with fixed class
            try:
                processor = FastCampaignProcessor(
                    page=page,
                    company_data=company_data,
                    message_template="Hello, this is a test inquiry.",
                    campaign_id=999,
                    company_id=123,
                    subject="Test Inquiry"
                )
                
                # Mock the logger to print ONLY critical info (suppress HTML snippets)
                def clean_logger(level, action, msg):
                    if "Snippet" in msg:
                        return # Skip printing HTML snippets
                    print(f"  [{level.upper()}] {action}: {msg}")
                
                processor.log = clean_logger
                
                result = processor.process_company()
                
                print(f"\n  >>> RESULT for {url}:")
                print(f"  Success: {result.get('success')}")
                print(f"  Method: {result.get('method')}")
                # print(f"  Contact Info: {json.dumps(result.get('contact_info', {}), indent=2)}") # simplified
                if result.get('contact_info'):
                     print(f"  Contact Info Found: Yes")
                print(f"  Error: {result.get('error')}")
                
            except Exception as e:
                print(f"  MACRO CRASH: {e}")
                import traceback
                traceback.print_exc()
            
            page.close()
            print("\n" + "="*50 + "\n")
            
        browser.close()

if __name__ == "__main__":
    test_urls()
