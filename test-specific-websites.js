const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testWebsite(url, company) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${company}`);
  console.log(`URL: ${url}`);
  console.log(`${'='.repeat(80)}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  try {
    // Navigate
    console.log('1. Navigating to homepage...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('   ✅ Homepage loaded');

    // Handle cookie modal
    console.log('2. Checking for cookie modal...');
    const cookieSelectors = [
      'button:has-text("Accept")',
      'button:has-text("Accept All")',
      '#accept-cookies',
      '.cookie-accept'
    ];
    for (const selector of cookieSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 500 })) {
          await element.click();
          await page.waitForTimeout(200);
          console.log('   ✅ Cookie modal dismissed');
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(300);

    // Check for forms on homepage
    console.log('3. Checking for forms on homepage...');
    const homepageForms = await page.locator('form').count();
    console.log(`   Found ${homepageForms} form(s) on homepage`);
    
    if (homepageForms > 0) {
      console.log('   ✅ FORM FOUND ON HOMEPAGE!');
      const form = await page.locator('form').first();
      const formAction = await form.getAttribute('action').catch(() => '');
      const formId = await form.getAttribute('id').catch(() => '');
      const formClass = await form.getAttribute('class').catch(() => '');
      console.log(`   Form details: action="${formAction}", id="${formId}", class="${formClass}"`);
      
      // Check for email inputs
      const emailInputs = await form.locator('input[type="email"]').count();
      const textareas = await form.locator('textarea').count();
      const submitButtons = await form.locator('button[type="submit"], input[type="submit"]').count();
      console.log(`   Email inputs: ${emailInputs}, Textareas: ${textareas}, Submit buttons: ${submitButtons}`);
      
      await browser.close();
      return { found: true, location: 'homepage', formCount: homepageForms };
    }

    // Find contact link
    console.log('4. Searching for contact link...');
    const contactLinks = await page.evaluate((base) => {
      const links = Array.from(document.querySelectorAll('a'));
      const found = [];
      
      for (const link of links) {
        const href = (link.getAttribute('href') || '').toLowerCase();
        const text = (link.textContent || '').toLowerCase();
        
        if ((href.includes('contact') || text.includes('contact') || 
             text.includes('get in touch') || text.includes('reach out')) &&
            link.offsetParent !== null) {
          
          let fullUrl = link.getAttribute('href');
          if (fullUrl && !fullUrl.startsWith('http')) {
            try {
              fullUrl = new URL(fullUrl, base).href;
            } catch {
              continue;
            }
          }
          if (fullUrl && fullUrl.startsWith('http')) {
            found.push(fullUrl);
          }
        }
      }
      
      return [...new Set(found)].slice(0, 3); // Return first 3 unique URLs
    }, url);

    if (contactLinks && contactLinks.length > 0) {
      console.log(`   ✅ Found ${contactLinks.length} contact link(s):`);
      contactLinks.forEach((link, i) => console.log(`      ${i + 1}. ${link}`));
      
      // Navigate to first contact link
      const contactUrl = contactLinks[0];
      console.log(`\n5. Navigating to contact page: ${contactUrl}`);
      await page.goto(contactUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(500);
      
      // Handle cookie modal again
      for (const selector of cookieSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 500 })) {
            await element.click();
            await page.waitForTimeout(200);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Actively wait for form elements
      try {
        await page.waitForSelector('form, input[type="email"], textarea, button[type="submit"]', { timeout: 10000 });
        console.log('   ✅ Form elements detected');
      } catch {
        console.log('   ⚠️ Form selector timeout, continuing anyway...');
      }
      
      // Scroll to trigger lazy loading
      console.log('6. Scrolling to trigger lazy loading...');
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForTimeout(2000);
      await page.evaluate("window.scrollTo(0, 0)");
      await page.waitForTimeout(2000);
      
      // Check for forms on contact page
      const contactPageForms = await page.locator('form').count();
      console.log(`   Found ${contactPageForms} form(s) on contact page`);
      
      if (contactPageForms > 0) {
        console.log('   ✅ FORM FOUND ON CONTACT PAGE!');
        const form = await page.locator('form').first();
        const formAction = await form.getAttribute('action').catch(() => '');
        const formId = await form.getAttribute('id').catch(() => '');
        const formClass = await form.getAttribute('class').catch(() => '');
        console.log(`   Form details: action="${formAction}", id="${formId}", class="${formClass}"`);
        
        const emailInputs = await form.locator('input[type="email"]').count();
        const textareas = await form.locator('textarea').count();
        const submitButtons = await form.locator('button[type="submit"], input[type="submit"]').count();
        console.log(`   Email inputs: ${emailInputs}, Textareas: ${textareas}, Submit buttons: ${submitButtons}`);
        
        await browser.close();
        return { found: true, location: 'contact page', formCount: contactPageForms, contactUrl };
      } else {
        console.log('   ❌ No form found on contact page');
        
        // Check for emails
        console.log('7. Extracting email addresses...');
        const emails = await page.evaluate(() => {
          const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const pageText = document.body?.textContent || '';
          return [...new Set((pageText.match(emailPattern) || []).slice(0, 5))];
        });
        
        if (emails && emails.length > 0) {
          console.log(`   ✅ Found ${emails.length} email address(es):`);
          emails.forEach(email => console.log(`      - ${email}`));
          await browser.close();
          return { found: false, location: 'contact page', emails, contactUrl };
        }
        
        await browser.close();
        return { found: false, location: 'contact page', contactUrl };
      }
    } else {
      console.log('   ❌ No contact link found');
      
      // Check iframes
      console.log('5. Checking iframes...');
      const iframes = await page.locator('iframe').all();
      console.log(`   Found ${iframes.length} iframe(s)`);
      
      for (const iframe of iframes.slice(0, 2)) {
        try {
          const frame = await iframe.contentFrame();
          if (frame) {
            const iframeForms = await frame.locator('form').count();
            if (iframeForms > 0) {
              console.log(`   ✅ FORM FOUND IN IFRAME!`);
              await browser.close();
              return { found: true, location: 'iframe', formCount: iframeForms };
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      await browser.close();
      return { found: false, location: 'homepage' };
    }

  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    await browser.close();
    return { found: false, error: error.message };
  }
}

async function main() {
  const websites = [
    { company: '2020 Innovation', url: 'https://2020innovation.com' },
    { company: '3 Line Electrical', url: 'https://3lineelectrical.co.uk' }
  ];

  console.log('🧪 Testing websites for contact forms/pages\n');

  for (const site of websites) {
    const result = await testWebsite(site.url, site.company);
    
    console.log(`\n📊 RESULT for ${site.company}:`);
    if (result.found) {
      console.log(`   ✅ FORM FOUND on ${result.location}`);
      console.log(`   Form count: ${result.formCount}`);
    } else if (result.emails) {
      console.log(`   ⚠️ No form, but found emails on ${result.location}`);
      console.log(`   Emails: ${result.emails.join(', ')}`);
    } else if (result.error) {
      console.log(`   ❌ ERROR: ${result.error}`);
    } else {
      console.log(`   ❌ No form or contact page found`);
    }
    console.log('');
  }
}

main().catch(console.error);
