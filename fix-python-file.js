const fs = require('fs');

function fixPythonFile() {
  const filePath = 'trevnoctilla-backend/services/live_scraper.py';
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add email extraction method
  const emailMethod = `
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
`;

  // Insert after the submit_form_sync method
  content = content.replace(
    /(            await self\.send_log\('failed', 'Submit Error', 'Unable to submit the form'\)\s*return False\s*\n\s*def scrape_and_submit_sync)/,
    '$1' + emailMethod
  );

  // 2. Fix navigation timeouts
  content = content.replace(
    /self\.page\.goto\(website_url, wait_until='networkidle', timeout=30000\)/g,
    "self.page.goto(website_url, wait_until='domcontentloaded', timeout=45000)"
  );

  content = content.replace(
    /self\.page\.goto\(contact_url, wait_until='networkidle', timeout=30000\)/g,
    "self.page.goto(contact_url, wait_until='domcontentloaded', timeout=45000)"
  );

  // 3. Add email extraction fallback
  content = content.replace(
    /(\s+else:\s+print\("❌ \[RAPID SCRAPER\] FAILED: No contact form found on the website"\)\s+result = \{\'success': False, \'error': \'No contact form found\. This website may not have a contact page or the form structure has changed\.\'\}\s+)/,
    `$1                    print("❌ [RAPID SCRAPER] No contact form found, extracting email addresses as fallback...")
                    # Extract email addresses from the page
                    emails = self.extract_emails_sync()
                    if emails and len(emails) > 0:
                        print(f"✅ [RAPID SCRAPER] Found {len(emails)} email address(es): {\', \'.join(emails[:3])}")
                        result = {
                            \'success\': False,
                            \'error\': \'No contact form found, but email addresses were found on the page.\',
                            \'emails_found\': emails
                        }
                    else:
                        print("❌ [RAPID SCRAPER] FAILED: No contact form or email addresses found on the website")
                        result = {\'success\': False, \'error\': \'No contact form found. This website may not have a contact page or the form structure has changed.\'}
`
  );

  fs.writeFileSync(filePath, content);
  console.log('✅ Python file fixed successfully!');
}

fixPythonFile();