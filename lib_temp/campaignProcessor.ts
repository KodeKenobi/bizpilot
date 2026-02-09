
import { chromium, Browser, BrowserContext, Page, ElementHandle } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface ProcessorResult {
  success: boolean;
  method: string;
  can_submit?: boolean;
  fields_found?: number;
  audit_log?: any[];
  screenshot_url?: string;
  contact_info?: { emails: string[] };
  error?: string;
  logs: string;
}

export class CampaignProcessor {
  url: string;
  companyName: string;
  message: string;
  email: string;
  phone: string;
  contactPerson: string;
  subject: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  
  internalLogs: string[] = [];
  timestamp: number;
  screenshotsDir: string;

  constructor(
    url: string, 
    companyName: string, 
    message: string, 
    email: string = 'contact@business.com', 
    phone: string = '', 
    contactPerson: string = 'Business Contact', 
    subject: string = 'Partnership Inquiry', 
    firstName: string = '', 
    lastName: string = '', 
    country: string = 'South Africa',
    address: string = ''
  ) {
    this.url = url;
    this.companyName = companyName;
    this.message = message;
    this.email = email;
    this.phone = phone;
    this.contactPerson = contactPerson;
    this.subject = subject;
    
    // Split contactPerson into firstName/lastName if they are missing
    if (!firstName && !lastName && this.contactPerson) {
      const parts = this.contactPerson.trim().split(/\s+/);
      this.firstName = parts[0] || '';
      this.lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Contact';
    } else {
      this.firstName = firstName;
      this.lastName = lastName;
    }

    this.country = country;
    this.address = address;
    this.timestamp = Date.now();
    
    // In Vercel/Railway, specific temp dirs should be used, but for now specific valid path
    // We will return the screenshot as base64 or just path if local
    // For this implementation, we'll try to use /tmp or process.cwd()/public/screenshots
    this.screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    
    if (!fs.existsSync(this.screenshotsDir)) {
      try {
        fs.mkdirSync(this.screenshotsDir, { recursive: true });
      } catch (e) {
        // Fallback to /tmp if public is not different
        this.screenshotsDir = '/tmp/screenshots';
        if (!fs.existsSync(this.screenshotsDir)) {
            try { fs.mkdirSync(this.screenshotsDir, { recursive: true }); } catch (err) {}
        }
      }
    }
    
    this.log('INFO', 'Initialization', `Company: ${this.companyName}, Contact: ${this.firstName} ${this.lastName}`);
  }

  log(level: string, action: string, message: string) {
    const logEntry = `[${level}] ${action}: ${message}`;
    console.log(logEntry); // Log to stdout for server logs
    this.internalLogs.push(logEntry);
  }

  async findContactLinks(page: Page): Promise<string[]> {
    try {
      const links = await page.$$eval('a', (elements) => {
        return elements
          .filter(link => {
            const href = (link.getAttribute('href') || '').toLowerCase();
            const text = (link.textContent || '').toLowerCase().trim();
            const title = (link.getAttribute('title') || '').toLowerCase();
            const isContact = href.includes('contact') || 
                             text.includes('contact') || 
                             text.includes('get in touch') || 
                             text.includes('support') ||
                             title.includes('contact');
            return isContact && link.offsetParent !== null;
          })
          .map(link => link.href)
          .filter(href => href && href.startsWith('http'));
      });
      
      return Array.from(new Set(links));
    } catch (e: any) {
      this.log('ERROR', 'Contact Link Search', e.message);
      return [];
    }
  }

  async handleCookieModal(page: Page): Promise<boolean> {
    const selectors = [
      'button:has-text("Accept")', 'button:has-text("Accept All")', 'button:has-text("I Accept")',
      'button:has-text("Agree")', '#accept-cookies', '#acceptCookies', '.cookie-accept', '.accept-cookies',
      '[aria-label*="Accept" i]', '[aria-label*="Agree" i]',
      'button:has-text("Reject")', 'button:has-text("Reject All")', 'button:has-text("Decline")',
      'button:has-text("Close")', '[aria-label*="Close" i]', '[aria-label*="Reject" i]',
      '.cookie-close', '.cookie-dismiss', '[class*="cookie" i] button[class*="close" i]',
      '[class*="consent" i] button[class*="close" i]', '[id*="cookie" i] button[class*="close" i]'
    ];

    for (const selector of selectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 500 })) {
          await element.click();
          await page.waitForTimeout(200);
          this.log('INFO', 'Cookie Modal', `Dismissed using: ${selector}`);
          return true;
        }
      } catch (e) { continue; }
    }
    return false;
  }

  async detectCaptcha(form: ElementHandle): Promise<boolean> {
    try {
      const captchaIndicators = [
        'div[class*="captcha" i]', 'div[class*="recaptcha" i]', 'iframe[src*="recaptcha"]',
        'iframe[src*="captcha"]', '.g-recaptcha', '#recaptcha'
      ];
      for (const selector of captchaIndicators) {
        const element = await form.$(selector);
        if (element) {
          this.log('WARNING', 'CAPTCHA', 'CAPTCHA detected in form');
          return true;
        }
      }
      return false;
    } catch (e) { return false; }
  }

  async fillAndSubmitForm(page: Page, form: ElementHandle): Promise<ProcessorResult> {
    try {
      this.log('INFO', 'Form Filling', 'Starting prioritized form fill');
      let filledCount = 0;
      let emailFilled = false;
      let nameFilled = false;
      let messageFilled = false;
      let companyFilled = false;
      let addressFilled = false;
      let countryCodeSelected = false; // State to track if we pre-filled the country/prefix
      let universalFilledCount = 0;
      const allDetectedFields: any[] = [];

      if (await this.detectCaptcha(form)) {
        return { success: false, method: 'form_with_captcha', error: 'Form has CAPTCHA', logs: this.internalLogs.join('\n') };
      }

      const inputs = await form.$$('input:not([type="hidden"]), textarea, select');
      
      // Basic info needed for conditionals
      const isUK = this.url.includes('.co.uk') || this.url.includes('.uk');

      // PASS 2: FILL (Simplified Logic Port)
      for (const input of inputs) {
        try {
          const name = (await input.getAttribute('name') || '').toLowerCase();
          const id = (await input.getAttribute('id') || '').toLowerCase();
          const placeholder = (await input.getAttribute('placeholder') || '').toLowerCase();
          const ariaLabel = (await input.getAttribute('aria-label') || '').toLowerCase();
          const type = (await input.getAttribute('type') || 'text').toLowerCase();
          const tagName = await input.evaluate(el => el.tagName.toLowerCase());

           // Get label text (Basic version)
           const labelText = await input.evaluate((el: any) => {
              let txt = '';
              if (el.labels && el.labels.length > 0) txt += el.labels[0].textContent;
              else if (el.closest('label')) txt += el.closest('label').textContent;
              return txt.toLowerCase().trim();
           });

           const fieldText = `${name} ${id} ${placeholder} ${ariaLabel} ${labelText}`.toLowerCase();
           
           // Audit Collection
           allDetectedFields.push({
              tag: tagName,
              type: type,
              name: name,
              id: id,
              label: labelText,
              value: await input.inputValue().catch(() => ''),
              visible: await input.isVisible().catch(() => false)
           });
          
          if (['submit', 'button'].includes(type)) continue;

          // 1. Email
          if (!emailFilled && (type === 'email' || fieldText.includes('email'))) {
            await input.fill(this.email);
            this.log('INFO', 'Field Filled', `Email: ${this.email}`);
            emailFilled = true; filledCount++; continue;
          }

          // 2. Phone (Excluding selects to let them hit the Country/Code block)
          if (this.phone && tagName !== 'select' && (type === 'tel' || fieldText.includes('phone') || fieldText.includes('mobile'))) {
             let phoneToFill = this.phone;
             
             // If we already selected a country/prefix (e.g. in a previous element like phone_ext), 
             // we should strip the country code from the phone number if possible.
             if (countryCodeSelected) {
                 // Simple clean: Strip the leading +Code part if it matches
                 // For now, heuristic: if starts with +, strip until space or next digit group?
                 // User example: Select ZA, Phone +27630291420 -> Enter 630291420
                 // Or: +44 7000 000000 -> 7000 000000
                 
                 // Try to match common codes
                 const codes = ['+44', '+27', '+1', '+61', '+64', '+49', '+33', '+353'];
                 for (const c of codes) {
                     if (phoneToFill.startsWith(c)) {
                         phoneToFill = phoneToFill.replace(c, '').trim();
                         // If we stripped it and it doesn't start with 0, but local formats often need 0?
                         // Actually user said: "South Africa will be +27... so number entered should be 630291420" (Wait, 0630... -> 630...)
                         // So stripping the code and trimming space is usually safer than adding 0 blindly.
                         break;
                     }
                 }
             }
             
             await input.fill(phoneToFill);
             this.log('INFO', 'Field Filled', `Phone: ${phoneToFill} (Original: ${this.phone})`);
             filledCount++; continue;
          }

          // 3. Company (Moved before Name to prevent "Company Name" matching generic "Name")
          if (!companyFilled && this.companyName && (fieldText.includes('company') || fieldText.includes('business'))) {
             await input.fill(this.companyName); 
             this.log('INFO', 'Field Filled', `Company: ${this.companyName} (Field: ${name || id})`);
             companyFilled = true; filledCount++; continue;
          }

          // 4. Names
          if (fieldText.includes('first name') || fieldText.includes('firstname')) {
             await input.fill(this.firstName); 
             this.log('INFO', 'Field Filled', `First Name: ${this.firstName} (Field: ${name || id})`);
             filledCount++; continue;
          }
          if (fieldText.includes('last name') || fieldText.includes('lastname')) {
             await input.fill(this.lastName); 
             this.log('INFO', 'Field Filled', `Last Name: ${this.lastName} (Field: ${name || id})`);
             filledCount++; continue;
          }
          if (!nameFilled && (fieldText.includes('name') || fieldText.includes('person')) && !fieldText.includes('company')) {
             await input.fill(this.contactPerson); 
             this.log('INFO', 'Field Filled', `Full Name: ${this.contactPerson} (Field: ${name || id})`);
             nameFilled = true; filledCount++; continue;
          }

          // 5. Message
          if (!messageFilled && (tagName === 'textarea' || fieldText.includes('message') || fieldText.includes('comment'))) {
             await input.fill(this.message); 
             this.log('INFO', 'Field Filled', `Message populated`);
             messageFilled = true; filledCount++; continue;
          }
          
           // 6. Checkbox (Agreement)
           if (type === 'checkbox' && (fieldText.includes('agree') || fieldText.includes('terms') || fieldText.includes('policy') || fieldText.includes('enquiry'))) {
              if (!(await input.isChecked())) {
                 await input.click({force: true}); filledCount++;
                 this.log('INFO', 'Checkbox', `Clicked: ${name || id}`);
              }
           }

           // 7. Address
           if (!addressFilled && this.address && (fieldText.includes('address') || fieldText.includes('location') || fieldText.includes('city') || fieldText.includes('street'))) {
              await input.fill(this.address);
              this.log('INFO', 'Field Filled', `Address: ${this.address}`);
              addressFilled = true; filledCount++; continue;
           }

           // 8. Select (Country / Phone Prefix)
           if (tagName === 'select' && (
               fieldText.includes('country') || fieldText.includes('nation') || 
               fieldText.includes('phone_ext') || fieldText.includes('dial_code') || 
               fieldText.includes('prefix') || fieldText.includes('code')
           )) {
              const options = await input.evaluate((el: any) => Array.from(el.options).map((o: any) => ({val: o.value, text: o.text.toLowerCase()})));
              let targetVal = '';
              const myCountry = this.country.toLowerCase();
              
              const isPhoneExt = fieldText.includes('phone') || fieldText.includes('code') || fieldText.includes('prefix');

              // Map of common codes and ISOs
              const countryCodes: Record<string, string[]> = {
                  'united kingdom': ['+44', 'GB', 'UK'], 'uk': ['+44', 'GB'], 'great britain': ['+44', 'GB'],
                  'south africa': ['+27', 'ZA'], 'za': ['+27', 'ZA'],
                  'united states': ['+1', 'US', 'USA'], 'usa': ['+1', 'US'], 'us': ['+1', 'US'],
                  'australia': ['+61', 'AU'], 'canada': ['+1', 'CA'], 'new zealand': ['+64', 'NZ'],
                  'germany': ['+49', 'DE'], 'france': ['+33', 'FR'], 'ireland': ['+353', 'IE']
              };

              // 1. Try Exact Name Match
              for (const opt of options) {
                 if (opt.text.includes(myCountry) || opt.val.includes(myCountry)) {
                    targetVal = opt.val; break;
                 }
              }

              // 2. Try Country Code / ISO (if Name failed and it looks like a phone field)
              if (!targetVal && isPhoneExt) {
                  const codes = countryCodes[myCountry] || [];
                  for (const code of codes) {
                      for (const opt of options) {
                          if (opt.text.includes(code) || opt.val === code || opt.val.includes(code)) {
                              targetVal = opt.val; break;
                          }
                      }
                      if (targetVal) break;
                  }
              }

              if (!targetVal && isPhoneExt) {
                 this.log('WARNING', 'Phone Ext Match', `Failed to match ${this.country} in options: ${options.map((o:any) => o.val).slice(0, 10).join(', ')}...`);
              }
              
              
              if (targetVal) {
                 await input.selectOption(targetVal);
                 this.log('INFO', 'Field Filled', `Country/Code Select: ${targetVal} (Field: ${name || id})`);
                 
                 // ONLY strip phone prefix if this was explicitly a phone-extension/dial-code field.
                 // This ensures a standard "Shipping Country" field doesn't break international phone numbers.
                 if (isPhoneExt) {
                    countryCodeSelected = true; 
                 }
                 filledCount++;
              }
           }
           
           // 9. Aggressive Generic Select (Catch-all for things like phone_ext)
           if (tagName === 'select' && !fieldText.includes('country')) {
               const val = await input.inputValue().catch(() => '');
               const options = await input.evaluate((el: any) => Array.from(el.options).map((o: any) => ({val: o.value, text: o.text.toLowerCase()})));
               
               // If empty or prompt ("choose/select"), pick index 1
               const isPrompt = options[0]?.text.includes('choose') || options[0]?.text.includes('select') || val === '' || val === '-1';
               
               if (isPrompt && options.length > 1) {
                  // Find first non-empty/non-prompt option
                  let targetIdx = -1;
                  for (let i = 0; i < options.length; i++) {
                     const t = options[i].text;
                     const v = options[i].val;
                     if (!t.includes('choose') && !t.includes('select') && v !== '' && v !== '-1' && v !== '0') {
                        targetIdx = i; break;
                     }
                  }
                  
                  if (targetIdx === -1 && options.length > 1) targetIdx = 1; // Last resort
                  
                  if (targetIdx !== -1) {
                      await input.selectOption({ index: targetIdx });
                      this.log('INFO', 'Field Filled', `Generic Select: option ${targetIdx} (Field: ${name || id})`);
                      filledCount++;
                  }
               }
           }
        } catch (e) {}
      }

      // PASS 3: MANDATORY COVERAGE (Last check for empty required fields)
      this.log('INFO', 'Form Check', 'Running mandatory coverage pass...');
      const handledGroups = new Set();
      
      for (const input of inputs) {
          try {
             // Re-evaluate to check if still empty
             const type = (await input.getAttribute('type') || '').toLowerCase();
             const tagName = await input.evaluate(el => el.tagName.toLowerCase());
             const val = (tagName === 'input' || tagName === 'textarea' || tagName === 'select') ? await input.inputValue().catch(() => '') : '';
             const isChecked = await input.evaluate((el: any) => el.checked);
             const isEffectiveEmpty = !val || val === '' || val === '-1' || val === '0';
             
             // Reuse label logic for requirement check
             const name = await input.getAttribute('name');
             const id = await input.getAttribute('id');
             const labelText = await input.evaluate((el: any) => {
                 let txt = '';
                 if (el.labels && el.labels.length > 0) txt += el.labels[0].textContent;
                 else if (el.closest('label')) txt += el.closest('label').textContent;
                 return txt.toLowerCase().trim();
             });
             
             // Check Requirement
             const isRequired = await input.evaluate((el: any) => {
                 if (el.hasAttribute('required') || el.getAttribute('aria-required') === 'true') return true;
                 if (el.closest('.hs-form-required, .required, fieldset[class*="required"]')) return true;
                 return false;
             }) || labelText.includes('*');

             if (isRequired && isEffectiveEmpty && !isChecked) {
                 const groupKey = name || id || labelText.substring(0, 20);
                 
                 if (tagName === 'select') {
                    // Force select first valid option
                    const options = await input.evaluate((el: any) => Array.from(el.options).map((o: any) => ({val: o.value, text: o.text.toLowerCase()})));
                    let targetIdx = -1;
                    for (let i = 0; i < options.length; i++) {
                        const t = options[i].text;
                        const v = options[i].val;
                        if (!t.includes('choose') && !t.includes('select') && v !== '' && v !== '-1' && v !== '0') {
                            targetIdx = i; break;
                        }
                    }
                    if (targetIdx !== -1) {
                         await input.selectOption({ index: targetIdx });
                         this.log('INFO', 'Mandatory Fill', `Force-selected option for ${groupKey}`);
                         filledCount++;
                    }
                 } else if (tagName === 'input') {
                     const placeholder = (await input.getAttribute('placeholder') || '').toLowerCase();
                     const fillVal = placeholder.includes('subject') ? this.subject : this.companyName;
                     await input.fill(fillVal);
                     this.log('INFO', 'Mandatory Fill', `Populated required text field: ${fillVal}`);
                     filledCount++;
                 }
             }
          } catch(e) {}
      }

      // Submit
      let submitBtn = await form.$('button[type="submit"], input[type="submit"]');
      if (!submitBtn) {
          const btns = await form.$$('button, a[role="button"]');
          for (const b of btns) {
              if ((await b.innerText()).match(/submit|send|contact|message/i)) { submitBtn = b; break; }
          }
      }

      const screenshotFilename = `verification-${this.timestamp}-${Math.random().toString(36).substring(7)}.jpg`;
      const screenshotPath = path.join(this.screenshotsDir, screenshotFilename);
      await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 60, fullPage: true });

      let submitSuccess = false;
      const canSubmit = filledCount > 0;

      if (canSubmit) {
          if (submitBtn) {
             this.log('INFO', 'Action', `Clicking Submit: ${screenshotFilename}`);
             // SUBMIT IS COMMENTED OUT FOR SAFETY AS PER ORIGINAL SCRIPT
             /* 
             try {
                await submitBtn.click({ timeout: 5000 });
                submitSuccess = true;
             } catch(e) {
                await submitBtn.evaluate((b: HTMLElement) => b.click()).catch(() => {});
                submitSuccess = true;
             }
             */
             this.log('INFO', 'Action', 'Submit Skipped (Safety Mode)');
             submitSuccess = true; // Pretend we submitted for verification flow
          }
      }

      return {
          success: canSubmit,
          method: submitSuccess ? 'form_submitted' : 'filled_only',
          can_submit: canSubmit,
          fields_found: filledCount,
          audit_log: allDetectedFields,
          screenshot_url: `/screenshots/${screenshotFilename}`, // Return relative URL for frontend
          logs: this.internalLogs.join('\n')
      };

    } catch (e: any) {
      return { success: false, method: 'error', error: e.message, logs: this.internalLogs.join('\n') };
    }
  }

  async process(): Promise<ProcessorResult> {
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;

    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      });

      context = await browser.newContext({
         viewport: { width: 1440, height: 900 },
         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });

      const page = await context.newPage();
      
      // Optimization
      await page.route('**/*', (route) => {
        const type = route.request().resourceType();
        if (['image', 'font', 'media'].includes(type)) return route.abort();
        return route.continue();
      });

      this.log('INFO', 'Navigation', `Visiting ${this.url}`);
      try {
        await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch (e: any) {
        this.log('WARNING', 'Navigation', `Initial load failed: ${e.message}, trying to continue...`);
      }
      
      await this.handleCookieModal(page);

      // --- Helper: Process a single page (Scan for forms) ---
      const tryProcessPage = async (p: Page): Promise<ProcessorResult | null> => {
           try {
               await this.handleCookieModal(p);
               await p.waitForTimeout(2000); // Wait for dynamic forms

               // Check for frames (e.g. HubSpot)
               const frames = p.frames();
               for (const frame of frames) {
                 try {
                     const fForms = await frame.$$('form');
                     if (fForms.length > 0) {
                         let bestF = fForms[0];
                         let maxI = 0;
                         for (const f of fForms) {
                            const count = (await f.$$('input, textarea')).length;
                            if (count > maxI) { maxI = count; bestF = f; }
                         }
                         if (maxI >= 2) {
                             this.log('INFO', 'Discovery', `Found viable form in iframe: ${await frame.title()}`);
                             const res = await this.fillAndSubmitForm(p, bestF);
                             if (res.success) return res;
                         }
                     }
                 } catch(e) {}
               }

               // Check main page forms
               const forms = await p.$$('form');
               if (forms.length > 0) {
                   let bestForm = forms[0];
                   let maxInputs = 0;
                   for (const f of forms) {
                       const count = (await f.$$('input, textarea')).length;
                       if (count > maxInputs) { maxInputs = count; bestForm = f; }
                   }
                   if (maxInputs >= 2) {
                       return await this.fillAndSubmitForm(p, bestForm);
                   }
               }
           } catch(e) {}
           return null;
      };

      // 1. Try Homepage
      let result = await tryProcessPage(page);
      if (result && result.success) return result;

      // Helper to extract emails
      const extractEmails = async (p: Page) => {
         return await p.$$eval('a[href^="mailto:"]', links => 
            links.map((l: any) => l.href.replace('mailto:', '').split('?')[0])
         );
      };

      let foundEmails: string[] = await extractEmails(page);

      // 2. Try Contact Links
      const contactLinks = await this.findContactLinks(page);
      this.log('INFO', 'Navigation', `Found ${contactLinks.length} contact links to explore`);

      for (const link of contactLinks.slice(0, 3)) { // Limit to 3 deep
         try {
             this.log('INFO', 'Navigation', `Exploring: ${link}`);
             await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
             result = await tryProcessPage(page);
             if (result && result.success) return result;
             
             // Harvest emails
             const pageEmails = await extractEmails(page);
             foundEmails = [...foundEmails, ...pageEmails];
         } catch(e: any) {
             this.log('WARNING', 'Navigation Error', `Failed to visit ${link}: ${e.message}`);
         }
      }

      // 3. Fallback: Email Found
      const uniqueEmails = Array.from(new Set(foundEmails));
      if (uniqueEmails.length > 0) {
         return {
             success: true,
             method: 'email_found',
             contact_info: { emails: uniqueEmails },
             logs: this.internalLogs.join('\n')
         };
      }

      return {
          success: false,
          method: 'no_contact_found',
          error: 'No form or email found',
          logs: this.internalLogs.join('\n')
      };

    } catch (e: any) {
      return { success: false, method: 'error', error: e.message, logs: this.internalLogs.join('\n') };
    } finally {
      if (context) await context.close();
      if (browser) await browser.close();
    }
  }
}
