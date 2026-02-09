#!/usr/bin/env python3

import re

def apply_fixes():
    # Read the file
    with open('trevnoctilla-backend/services/live_scraper.py', 'r') as f:
        content = f.read()

    # 1. Add email extraction method
    email_method = '''
    def extract_emails_sync(self):
        """Extract email addresses from the current page"""
        try:
            emails = self.page.evaluate("""
                () => {
                    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;
                    const pageText = document.body?.textContent || '';
                    const matches = pageText.match(emailPattern) || [];
                    return [...new Set(matches)].slice(0, 10);
                }
            """)
            return emails if emails else []
        except Exception as e:
            print(f"⚠️ [Email Extraction] Error: {str(e)}")
            return []
'''
    # Insert after the submit_form_sync method
    content = re.sub(
        r'(            await self\.send_log\('failed', 'Submit Error', 'Unable to submit the form'\)\s*return False\s*\n\s*def scrape_and_submit_sync)',
        r'\1' + email_method,
        content
    )

    # 2. Fix navigation timeouts - replace networkidle with domcontentloaded
    # For homepage navigation
    content = re.sub(
        r'(\s+try:\s+self\.page\.goto\(website_url, )wait_until='networkidle', timeout=30000(\)\s+print\(f"✅ \[RAPID SCRAPER\] Website loaded successfully: \{self\.page\.url\}")\s+)',
        r'\1wait_until='domcontentloaded', timeout=45000\2                    # Wait for network to be idle (with timeout - don\'t fail if slow)\n                    try:\n                        self.page.wait_for_load_state(\'networkidle\', timeout=15000)\n                    except:\n                        print("⚠️ [RAPID SCRAPER] Network idle timeout, continuing anyway...")\n',
        content
    )

    # For contact page navigation
    content = re.sub(
        r'(\s+try:\s+self\.page\.goto\(contact_url, )wait_until='networkidle', timeout=30000(\)\s+print\(f"✅ \[RAPID SCRAPER\] Contact page loaded: \{self\.page\.url\}")\s+self\.page\.wait_for_timeout\(2000\))',
        r'\1wait_until='domcontentloaded', timeout=45000\2                        # Wait for network to be idle (with timeout - don\'t fail if slow)\n                        try:\n                            self.page.wait_for_load_state(\'networkidle\', timeout=15000)\n                        except:\n                            print("⚠️ [RAPID SCRAPER] Network idle timeout on contact page, continuing anyway...")\n                        self.page.wait_for_timeout(500)\n                        # Handle cookie consent on contact page\n                        self.handle_cookie_consent_sync()',
        content
    )

    # 3. Add email extraction fallback
    content = re.sub(
        r'(\s+else:\s+print\("❌ \[RAPID SCRAPER\] FAILED: No contact form found on the website"\)\s+result = \{\'success': False, \'error': \'No contact form found\. This website may not have a contact page or the form structure has changed\.\'\}\s+)',
        r'\1                    print("❌ [RAPID SCRAPER] No contact form found, extracting email addresses as fallback...")\n                    # Extract email addresses from the page\n                    emails = self.extract_emails_sync()\n                    if emails and len(emails) > 0:\n                        print(f"✅ [RAPID SCRAPER] Found {len(emails)} email address(es): {\', \'.join(emails[:3])}")\n                        result = {\n                            \'success\': False, \n                            \'error\': \'No contact form found, but email addresses were found on the page.\',\n                            \'emails_found\': emails\n                        }\n                    else:\n                        print("❌ [RAPID SCRAPER] FAILED: No contact form or email addresses found on the website")\n                        result = {\'success\': False, \'error\': \'No contact form found. This website may not have a contact page or the form structure has changed.\'}\n',
        content
    )

    # Write back
    with open('trevnoctilla-backend/services/live_scraper.py', 'w') as f:
        f.write(content)

    print("✅ Fixes applied successfully!")

if __name__ == "__main__":
    apply_fixes()