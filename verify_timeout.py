import time
import os
import sys
import threading
from datetime import datetime
import unittest
from unittest.mock import MagicMock

# Mock dependencies before imports
sys.modules['database'] = MagicMock()
sys.modules['models'] = MagicMock()
sys.modules['utils.screenshot_utils'] = MagicMock()
sys.modules['services.websocket_manager'] = MagicMock()

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'trevnoctilla-backend'))

from services.fast_campaign_processor import FastCampaignProcessor
from playwright.sync_api import sync_playwright

def test_timeout():
    print("Testing timeout enforcement in FastCampaignProcessor...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Small deadline: 5 seconds
        deadline_sec = 5
        
        company_data = {
            'id': 123,
            'website_url': 'https://www.google.com',
            'company_name': 'Test Company'
        }
        
        processor = FastCampaignProcessor(
            page=page,
            company_data=company_data,
            message_template="Hello {company_name}",
            campaign_id=1,
            company_id=123,
            logger=lambda l, a, m: print(f"  [{l}] {a}: {m}"),
            deadline_sec=deadline_sec
        )
        
        start_time = time.time()
        print(f"Starting process with {deadline_sec}s deadline...")
        
        result = processor.process_company()
        
        elapsed = time.time() - start_time
        print(f"\nFinal result: {result.get('method')} (error: {result.get('error')})")
        print(f"Elapsed time: {elapsed:.1f}s")
        
        if result.get('method') == 'timeout' and elapsed < deadline_sec + 5:
            print("✅ SUCCESS: Processor correctly timed out within budget.")
        elif result.get('success'):
             print("✅ NOTE: Site processed faster than deadline (Success).")
        else:
            print("❌ FAILURE: Processor did not time out as expected or took too long.")
            
        browser.close()

if __name__ == "__main__":
    test_timeout()
