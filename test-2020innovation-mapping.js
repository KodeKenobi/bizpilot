/**
 * TEST SCRIPT: Exact mapping of user message template / sender_data onto 2020innovation.com form.
 * Mirrors fast_campaign_processor.py logic so you can SEE how each field is mapped and how
 * unaccounted-for fields are handled.
 *
 * Run: node test-2020innovation-mapping.js
 *
 * ========== HOW THE USER'S MESSAGE TEMPLATE IS MAPPED ==========
 *
 * 1. MESSAGE BODY (textarea "message" / "comment" / "inquiry" / "details" / "body"):
 *    - Only field that receives the user's written message template.
 *    - Before fill: replace_variables(template) runs:
 *      {company_name} → target company name (e.g. "2020 Innovation")
 *      {website_url}  → target company website
 *      {contact_email}, {contact_person}, {phone} → from company/lead data
 *    - That final string is filled into the message textarea.
 *
 * 2. ALL OTHER FIELDS use SENDER_DATA + COMPANY fallbacks (not the message text):
 *    - firstname / first_name / "first name" etc. → sender_first_name || first word of contact_person
 *    - lastname / last_name / "last name" etc.   → sender_last_name  || last word of contact_person
 *    - email / e-mail / type=email               → sender_email || company contact_email
 *    - company / organization / business-name    → sender_company || company_name
 *    - phone / tel / mobile / type=tel           → sender_phone || company phone
 *    - country select (name/id contains country, nation, ext, region, location) → sender_country (e.g. UK → option "United Kingdom" / value GB)
 *    - subject / topic (if present)             → campaign subject (e.g. "Partnership Inquiry")
 *
 * 3. KEYWORD MATCHING:
 *    - For each input/textarea/select we build: field_text = name + placeholder + id + label (all lowercased).
 *    - If field_text contains the keywords for a role (e.g. "firstname", "first name", "fname"), we map that role and fill.
 *    - Order of checks: email → first name → last name → full name → company → phone → subject → country (text) → message (textarea).
 *
 * 4. UNACCOUNTED-FOR FIELDS:
 *    - Any field whose name/id/placeholder/label does NOT match the known keywords is SKIPPED (left empty).
 *    - Example: a custom "Project budget" or "How did you hear about us?" with no matching keyword is not filled.
 *
 * 5. CHECKBOXES:
 *    - Only checked if name/label/parent text contains: enquiry, sales, support, agree, consent, optin, marketing, newsletter.
 *    - Not checked if they contain: terms, conditions (we never auto-accept terms).
 *    - So "enquiry_type" checkboxes (e.g. General Enquiry, Sales) get one or both checked by this rule.
 *
 * 6. SELECTS (dropdowns):
 *    - Country: match sender_country to option text or value (UK → United Kingdom / GB).
 *    - Other selects (branch, enquiry type, etc.): skip placeholder option ("Choose..."), pick first real option; or match sender_branch if present.
 */

const { chromium } = require('playwright');

// === USER'S MESSAGE TEMPLATE & SENDER DATA (what the user configures in the campaign) ===
const MESSAGE_TEMPLATE = `Hi,

I'm reaching out from {company_name}. We noticed your website {website_url} and would like to discuss a partnership.

Best regards`;

const SENDER_DATA = {
  sender_first_name: 'Jane',
  sender_last_name: 'Smith',
  sender_email: 'jane@mycompany.com',
  sender_company: 'My Company Ltd',
  sender_phone: '07700900123',
  sender_country: 'South Africa',
  sender_name: 'Jane Smith',
  subject: 'Partnership Inquiry',
};

const COMPANY = {
  company_name: '2020 Innovation',
  website_url: 'https://www.2020innovation.com',
  contact_person: '2020 Innovation',
  contact_email: 'info@2020innovation.com',
  phone: '',
};

function replaceVariables(template) {
  let message = template;
  const replacements = {
    '{company_name}': COMPANY.company_name || '',
    '{website_url}': COMPANY.website_url || '',
    '{contact_email}': COMPANY.contact_email || '',
    '{contact_person}': COMPANY.contact_person || '',
    '{phone}': COMPANY.phone || '',
  };
  for (const [key, value] of Object.entries(replacements)) {
    if (value) message = message.replace(key, String(value));
  }
  return message;
}

function getLabelForInput(page, el) {
  return el.evaluate((node) => {
    const id = node.id;
    if (id) {
      const label = document.querySelector('label[for="' + id + '"]');
      if (label) return (label.textContent || '').trim().toLowerCase();
    }
    let p = node.closest('label') || node.parentElement;
    if (p && p.tagName === 'LABEL') return (p.textContent || '').trim().toLowerCase();
    for (let n = node.previousElementSibling; n; n = n.previousElementSibling) {
      if (n.tagName === 'LABEL') return (n.textContent || '').trim().toLowerCase();
      const t = (n.textContent || '').trim().toLowerCase();
      if (t.length >= 2 && t.length <= 60 && !/^(choose|select|please select|general enquiry|--)/.test(t)) return t;
    }
    const aria = node.getAttribute('aria-label');
    if (aria) return aria.trim().toLowerCase();
    return '';
  }).catch(() => '');
}

async function run() {
  console.log('\n========== MESSAGE TEMPLATE (user creates) ==========\n');
  console.log(MESSAGE_TEMPLATE);
  console.log('\n========== AFTER replace_variables() (used in message field) ==========\n');
  const messageBody = replaceVariables(MESSAGE_TEMPLATE);
  console.log(messageBody);
  console.log('\n========== SENDER_DATA (campaign config) ==========\n');
  console.log(JSON.stringify(SENDER_DATA, null, 2));

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.2020innovation.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  try {
    const cookieBtn = page.getByRole('button', { name: /accept/i }).first();
    if (await cookieBtn.isVisible().catch(() => false)) {
      await cookieBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch (_) {}

  const contactLink = page.locator('a[href*="contact"]').first();
  const href = await contactLink.getAttribute('href');
  const contactUrl = href.startsWith('http') ? href : new URL(href, page.url()).href;
  await page.goto(contactUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  let form = null;
  let frame = null;
  for (const f of page.frames()) {
    if (f === page.mainFrame()) continue;
    const count = await f.locator('form').count();
    if (count > 0) {
      form = f.locator('form').first();
      frame = f;
      console.log('\n========== FORM FOUND (in iframe) ==========\n');
      break;
    }
  }
  if (!form) {
    console.log('No form in iframe found.');
    await browser.close();
    return;
  }

  const inputs = await form.locator('input:not([type="hidden"]):not([type="submit"])').all();
  const selects = await form.locator('select').all();
  const textareas = await form.locator('textarea').all();

  console.log('\n========== FIELD-BY-FIELD MAPPING (system logic) ==========\n');

  let emailFilled = false;
  let messageFilled = false;

  for (const el of inputs) {
    const tag = await el.evaluate((n) => n.tagName.toLowerCase());
    const type = (await el.getAttribute('type') || 'text').toLowerCase();
    const name = (await el.getAttribute('name') || '').toLowerCase();
    const id = (await el.getAttribute('id') || '').toLowerCase();
    const placeholder = (await el.getAttribute('placeholder') || '').toLowerCase();
    const labelText = await getLabelForInput(page, el);
    const fieldText = `${name} ${placeholder} ${id} ${labelText}`;

    if (type === 'hidden' || type === 'submit' || type === 'button') {
      console.log(`[SKIP] input type="${type}" name="${name}" (hidden/submit/button)\n`);
      continue;
    }

    let mapped = false;
    let value = '';
    let role = '';

    if (type === 'email' || /email|e-mail/.test(fieldText)) {
      value = SENDER_DATA.sender_email || COMPANY.contact_email || 'contact@business.com';
      role = 'email';
      if (!emailFilled) {
        mapped = true;
        emailFilled = true;
      }
    }
    if (!mapped && /first name|first-name|fname|firstname|given-name|first_name/.test(fieldText)) {
      value = SENDER_DATA.sender_first_name || (COMPANY.contact_person || 'Business').split()[0];
      role = 'first_name';
      mapped = true;
    }
    if (!mapped && /last name|last-name|lname|lastname|surname|family-name|last_name/.test(fieldText)) {
      const parts = (COMPANY.contact_person || 'Contact').split();
      value = SENDER_DATA.sender_last_name || (parts.length > 1 ? parts[parts.length - 1] : 'Contact');
      role = 'last_name';
      mapped = true;
    }
    if (!mapped && /company|organization|organisation|business-name|firm/.test(fieldText) && !/email/.test(fieldText)) {
      value = SENDER_DATA.sender_company || COMPANY.company_name || 'Your Company';
      role = 'company';
      mapped = true;
    }
    if (!mapped && (/phone|tel|mobile|cell|telephone/.test(fieldText) || type === 'tel')) {
      value = SENDER_DATA.sender_phone || COMPANY.phone || COMPANY.phone_number || '';
      role = 'phone';
      if (value) mapped = true;
    }
    if (!mapped && type === 'checkbox') {
      const parentText = (await el.evaluate((n) => (n.parentElement && n.parentElement.innerText) || '') || '').toLowerCase();
      const aria = (await el.getAttribute('aria-label') || '').toLowerCase();
      const combined = `${name} ${parentText} ${aria}`;
      if (/enquiry|sales|support|agree|consent|optin|marketing|newsletter/.test(combined) && !/terms|conditions/.test(combined)) {
        value = '(check)';
        role = 'checkbox (enquiry/opt-in type)';
        mapped = true;
      }
    }

    if (mapped) {
      console.log(`[MAPPED] input name="${name}" id="${id}" type="${type}"`);
      console.log(`         → role: ${role}`);
      console.log(`         → value: ${value}`);
      if (value !== '(check)') {
        await el.click();
        await el.fill(value);
        await el.dispatchEvent('input');
        await el.dispatchEvent('change');
      } else {
        await el.check().catch(() => {});
      }
      console.log('');
    } else {
      console.log(`[UNACCOUNTED] input name="${name}" id="${id}" type="${type}"`);
      console.log(`              field_text (name+placeholder+id+label): "${fieldText.slice(0, 80)}..."`);
      console.log(`              → No keyword match in system; field is SKIPPED (left empty).\n`);
    }
  }

  for (const el of textareas) {
    const name = (await el.getAttribute('name') || '').toLowerCase();
    const id = (await el.getAttribute('id') || '').toLowerCase();
    const placeholder = (await el.getAttribute('placeholder') || '').toLowerCase();
    const labelText = await getLabelForInput(page, el);
    const fieldText = `${name} ${placeholder} ${id} ${labelText}`;

    if (!messageFilled && /message|comment|inquiry|details|body/.test(fieldText)) {
      console.log(`[MAPPED] textarea name="${name}"`);
      console.log(`         → role: message`);
      console.log(`         → value: (message template after replace_variables)`);
      await el.fill(messageBody);
      await el.dispatchEvent('input');
      await el.dispatchEvent('change');
      messageFilled = true;
      console.log('');
    } else {
      console.log(`[UNACCOUNTED] textarea name="${name}" → SKIPPED (no message keyword or already filled).\n`);
    }
  }

  const countryKeywords = ['country', 'nation', 'ext', 'region', 'location', 'countrycode', 'country_code', 'dialcode'];
  for (const el of selects) {
    const name = (await el.getAttribute('name') || '').toLowerCase();
    const id = (await el.getAttribute('id') || '').toLowerCase();
    const options = await el.locator('option').all();
    const firstText = (await options[0].innerText()).toLowerCase();
    const isPlaceholder = !(await options[0].getAttribute('value')) || /choose|select|please|^\*$/.test(firstText);

    let mapped = false;
    let value = '';
    let role = '';

    if (countryKeywords.some((k) => name.includes(k) || id.includes(k))) {
      const wanted = (SENDER_DATA.sender_country || 'South Africa').toLowerCase();
      let targetVal = null;
      for (const opt of options) {
        const v = (await opt.getAttribute('value')) || '';
        const t = (await opt.innerText()).trim().toLowerCase();
        if (wanted.includes('south africa') || wanted === 'za') {
          if (t.includes('south africa') || v === 'ZA') {
            targetVal = v || t;
            break;
          }
        } else if (wanted.includes('united kingdom') || wanted === 'uk') {
          if (t.includes('united kingdom') || t.includes('britain') || v === 'GB') {
            targetVal = v || t;
            break;
          }
        } else if (t.includes(wanted) || (v && v.toLowerCase().includes(wanted.slice(0, 2)))) {
          targetVal = v || t;
          break;
        }
      }
      if (!targetVal && options.length > 1) targetVal = await options[1].getAttribute('value') || (await options[1].innerText()).trim();
      if (!targetVal) targetVal = await options[0].getAttribute('value') || (await options[0].innerText()).trim();
      value = targetVal;
      role = 'country (select)';
      mapped = true;
    }
    if (!mapped) {
      const idx = isPlaceholder && options.length > 1 ? 1 : 0;
      const opt = options[idx];
      value = (await opt.getAttribute('value')) || (await opt.innerText()).trim();
      role = 'generic select (first real option)';
      mapped = true;
    }

    if (mapped && value) {
      console.log(`[MAPPED] select name="${name}" id="${id}"`);
      console.log(`         → role: ${role}`);
      console.log(`         → value: ${value}`);
      await el.selectOption(value).catch(() => el.selectOption({ index: isPlaceholder && options.length > 1 ? 1 : 0 }));
      await el.dispatchEvent('change');
      await el.dispatchEvent('input');
      console.log('');
    }
  }

  console.log('========== SUMMARY ==========');
  console.log('Message template is used ONLY for the message/comment/body textarea (after replace_variables).');
  console.log('All other fields use SENDER_DATA + COMPANY fallbacks; keyword match on name/id/placeholder/label.');
  console.log('Unaccounted-for fields: no keyword match → SKIPPED (left empty).');
  console.log('Checkboxes: only checked if label/name contains enquiry|sales|support|consent|optin|marketing (not terms).');
  console.log('Selects: country match by sender_country; else first non-placeholder option.');
  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
