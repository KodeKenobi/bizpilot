import sys
from playwright.sync_api import sync_playwright

def run_test(target_url):
    print(f"--- STARTING TEST: {target_url} ---")
    
    with sync_playwright() as p:
        # Launch browser (headless=False so you can watch)
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # 1. GO TO WEBSITE
            print(f"Navigating to {target_url}...")
            page.goto(target_url, wait_until="networkidle")
            
            # 2. FIND CONTACT FORM (Starting from homepage)
            print("Searching for contact page/link...")
            # Try to find common contact links
            contact_selectors = [
                'a:has-text("Contact")', 
                'a:has-text("Get in Touch")',
                'a[href*="contact"]'
            ]
            
            found_link = False
            for selector in contact_selectors:
                link = page.locator(selector).first
                if link.is_visible():
                    print(f"Found contact link: {link.get_attribute('href')}")
                    link.click()
                    page.wait_for_load_state("networkidle")
                    found_link = True
                    break
            
            if not found_link:
                print("No contact link clicked, checking current page for forms...")

            # 3. FILL IT
            print("Detecting form fields...")
            # Wait a bit for dynamic forms
            page.wait_for_timeout(1000)
            
            # Simple field filling logic
            fields = page.locator("input, textarea, select")
            count = fields.count()
            print(f"Found {count} potential fields.")
            
            for i in range(count):
                field = fields.nth(i)
                if not field.is_visible(): continue
                
                name = (field.get_attribute("name") or "").lower()
                id_attr = (field.get_attribute("id") or "").lower()
                placeholder = (field.get_attribute("placeholder") or "").lower()
                type_attr = (field.get_attribute("type") or "text").lower()
                
                info = f"{name} {id_attr} {placeholder}".lower()
                
                if "email" in info or type_attr == "email":
                    field.fill("test@example.com")
                    print("  [✓] Filled Email")
                elif any(x in info for x in ["name", "firstname", "lastname"]):
                    field.fill("Test User")
                    print("  [✓] Filled Name")
                elif any(x in info for x in ["phone", "tel"]):
                    field.fill("0123456789")
                    print("  [✓] Filled Phone")
                elif any(x in info for x in ["message", "comment", "enquiry"]) or field.evaluate("el => el.tagName === 'TEXTAREA'"):
                    field.fill("This is a clean test message without extra cheese.")
                    print("  [✓] Filled Message")
                elif "subject" in info:
                    field.fill("Test Subject")
                    print("  [✓] Filled Subject")

            print("Form filling complete.")

            # 4. TAKES A SCREENSHOT / DOES NOT TAKE A SCREENSHOT
            # I will leave the code here but commented out to honor the "DOES NOT" part 
            # while acknowledging the "TAKES A SCREENSHOT" part was there.
            # print("Taking screenshot...")
            # page.screenshot(path="debug_result.png")
            
            print("Test finished successfully. Closing in 4 seconds...")
            page.wait_for_timeout(4000)

        except Exception as e:
            print(f"Error during test: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    # Start from homepage if not provided
    url = sys.argv[1] if len(sys.argv) > 1 else "https://www.2020innovation.com"
    run_test(url)
