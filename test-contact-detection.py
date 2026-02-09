"""
Test script to verify sync Playwright can find contact page using EXACT async logic
"""
from playwright.sync_api import sync_playwright

def find_contact_async_logic_sync_api(page):
    """
    Uses EXACT logic from async find_contact_page() but with sync API
    This is what the batch scraper SHOULD be doing
    """
    try:
        # Store base URL for converting relative paths
        base_url = page.url.rstrip('/')
        
        print(f"[TEST] Starting contact detection on: {base_url}")
        
        # Strategy 1: URL pattern matching (copying async logic exactly)
        url_patterns = ['contact', 'contact-us', 'contactus', 'contact_us']
        
        for pattern in url_patterns[:10]:  # Test with first 10
            try:
                selector = f'a[href*="{pattern}"]'  # NO 'i' flag like async
                print(f"[TEST] Trying selector: {selector}")
                
                # Use locator like sync version but check visibility like async
                links = page.locator(selector).all()
                print(f"[TEST] Found {len(links)} links matching pattern '{pattern}'")
                
                for link in links:
                    try:
                        visible = link.is_visible()
                        print(f"[TEST]   Link visible: {visible}")
                        
                        if visible:
                            href = link.get_attribute('href')
                            print(f"[TEST]   Found href: {href}")
                            
                            if href:
                                # Convert to absolute URL (exact async logic)
                                if href.startswith('http://') or href.startswith('https://'):
                                    print(f"[TEST] ✅ SUCCESS: Found contact page (absolute): {href}")
                                    return href
                                elif href.startswith('/'):
                                    absolute_url = base_url + href
                                    print(f"[TEST] ✅ SUCCESS: Found contact page: {absolute_url}")
                                    return absolute_url
                                elif not href.startswith('#'):
                                    absolute_url = base_url + '/' + href
                                    print(f"[TEST] ✅ SUCCESS: Found contact page: {absolute_url}")
                                    return absolute_url
                    except Exception as e:
                        print(f"[TEST]   Error checking link: {str(e)}")
                        continue
            except Exception as e:
                print(f"[TEST] Error with pattern '{pattern}': {str(e)}")
                continue
        
        # Strategy 2: Common link text patterns (exact async logic)
        common_texts = [
            "Contact", "Contact Us", "Get in Touch", "Reach Out",
        ]
        
        print("[TEST] Trying link text patterns...")
        for text in common_texts:
            try:
                selector = f'a:has-text("{text}")'
                print(f"[TEST] Trying text: {text}")
                
                links = page.locator(selector).all()
                print(f"[TEST] Found {len(links)} links with text '{text}'")
                
                for link in links:
                    try:
                        visible = link.is_visible()
                        print(f"[TEST]   Visible: {visible}")
                        
                        if visible:
                            href = link.get_attribute('href')
                            if href:
                                if href.startswith('http://') or href.startswith('https://'):
                                    return href
                                elif href.startswith('/'):
                                    return base_url + href
                                elif not href.startswith('#'):
                                    return base_url + '/' + href
                    except Exception as e:
                        print(f"[TEST]   Error: {str(e)}")
                        continue
            except Exception as e:
                print(f"[TEST] Error with text '{text}': {str(e)}")
                continue
        
        # Strategy 3: Check common page locations (exact async logic)
        location_selectors = [
            'nav a[href*="contact"]',
            'footer a[href*="contact"]',
            'header a[href*="contact"]',
            '.footer a[href*="contact"]',
            '.menu a[href*="contact"]',
        ]
        
        print("[TEST] Checking common locations...")
        for selector in location_selectors:
            try:
                print(f"[TEST] Trying location: {selector}")
                links = page.locator(selector).all()
                print(f"[TEST] Found {len(links)} links")
                
                for link in links:
                    try:
                        visible = link.is_visible()
                        print(f"[TEST]   Visible: {visible}")
                        
                        if visible:
                            href = link.get_attribute('href')
                            if href:
                                if href.startswith('http://') or href.startswith('https://'):
                                    return href
                                elif href.startswith('/'):
                                    return base_url + href
                                elif not href.startswith('#'):
                                    return base_url + '/' + href
                    except Exception as e:
                        print(f"[TEST]   Error: {str(e)}")
                        continue
            except Exception as e:
                print(f"[TEST] Error with selector: {str(e)}")
                continue
        
        print("[TEST] ❌ FAILED: No contact page found")
        return None
        
    except Exception as e:
        print(f"[TEST] ❌ CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

# Run the test
print("=" * 80)
print("TESTING: Async Logic with Sync API")
print("=" * 80)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    print("\n[TEST] Navigating to https://www.trevnoctilla.com...")
    page.goto('https://www.trevnoctilla.com', wait_until='networkidle')
    print(f"[TEST] Page loaded: {page.url}\n")
    
    contact_url = find_contact_async_logic_sync_api(page)
    
    print("\n" + "=" * 80)
    if contact_url:
        print(f"✅ TEST PASSED: Found contact page at {contact_url}")
    else:
        print("❌ TEST FAILED: Could not find contact page")
    print("=" * 80)
    
    browser.close()
