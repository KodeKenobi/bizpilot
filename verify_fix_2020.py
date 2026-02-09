import os
import sys
import json
from playwright.sync_api import sync_playwright

# Add backend directory to path
project_root = os.getcwd()
backend_root = os.path.join(project_root, 'trevnoctilla-backend')
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from services.fast_campaign_processor import FastCampaignProcessor

def test_logger(level, action, message):
    print(f"[{level.upper()}] {action}: {message}")

def verify_fix():
    print("Verifying FastCampaignProcessor Fix for 2020 Innovation...")
    
    company_data = {
        'id': 2020,
        'website_url': 'https://www.2020innovation.com',
        'company_name': '2020 Innovation',
        'contact_email': 'test@example.com',
        'phone': '0123456789',
        'contact_person': 'Test User'
    }
    
    # Real JSON structure from frontend (app/campaigns/create/page.tsx)
    form_data = {
        "sender_name": "User Mimic",
        "sender_first_name": "User",
        "sender_last_name": "Mimic",
        "sender_email": "test@trevnoctilla.com",
        "sender_phone": "+1 555 123 4567",
        "sender_company": "Mimicry Labs",
        "sender_country": "United Kingdom",
        "sender_address": "",
        "subject": "Partnership Inquiry for {company_name}",
        "message": "Hello 2020 Innovation team, this is a test of our automated campaign flow. No action is required."
    }
    message_template = json.dumps(form_data)
    
    try:
        with sync_playwright() as p:
            print("  - Launching browser...")
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
            context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            page = context.new_page()
            
            # Mimic the extraction logic in routes.py
            parsed = json.loads(message_template)
            msg_body = parsed.get('message', message_template)
            msg_subject = parsed.get('subject', 'Inquiry')
            sender_info = parsed # The whole thing contains the sender_* fields
            
            processor = FastCampaignProcessor(
                page=page,
                company_data=company_data,
                message_template=msg_body,
                campaign_id=999,
                company_id=2020,
                subject=msg_subject,
                sender_data=sender_info,
                logger=test_logger
            )
            
            print(f"  - Starting processing for {company_data['website_url']}...")
            result = processor.process_company()
            
            print("\n" + "="*50)
            print("FINAL VERIFICATION RESULT:")
            print(f"Success: {result.get('success')}")
            print(f"Method: {result.get('method')}")
            print(f"Error: {result.get('error')}")
            print(f"Fields Filled: {result.get('fields_filled')}")
            print("="*50)
            
            if not result.get('success'):
                html = page.content()
                with open('debug_2020_page.html', 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"  - Saved debug HTML to debug_2020_page.html")
                page.screenshot(path='debug_2020_screenshot.png')
                print(f"  - Saved debug screenshot to debug_2020_screenshot.png")
            
            if result.get('success'):
                print("\nSUCCESS: The processor found and filled the form!")
            else:
                print("\nFAILURE: Still couldn't process the form.")
            
            browser.close()
            
    except Exception as e:
        print(f"ERROR DURING VERIFICATION: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify_fix()
