const { chromium } = require('playwright');

async function test2020InnovationFields() {
  console.log('Starting 2020 Innovation Field Count Test...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 1. Navigate to homepage
    console.log('Navigating to https://www.2020innovation.com/ ...');
    await page.goto('https://www.2020innovation.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Handle cookies if present
    try {
        const cookieButton = await page.getByRole('button', { name: /accept/i }).first();
        if (await cookieButton.isVisible()) {
            console.log('Accepting cookies...');
            await cookieButton.click();
            await page.waitForTimeout(1000);
        }
    } catch (e) {
        // Ignore cookie errors
    }

    // 2. Identify contact form
    console.log(`Page Title: ${await page.title()}`);
    
    // Try to find a form on the homepage first
    let form = page.locator('form').first();
    let formCount = await page.locator('form').count();
    
    if (formCount > 0) {
       console.log('Form found on homepage.');
    } else {
        console.log('No form on homepage. Looking for contact links...');
        
        // multiple strategies to find contact link
        const links = await page.locator('a').all();
        let contactUrl = '';
        
        for (const link of links) {
            const text = (await link.textContent() || '').toLowerCase().trim();
            const href = (await link.getAttribute('href') || '').trim();
            
            if (text.includes('contact') || href.toLowerCase().includes('contact')) {
                console.log(`Found candidate link: "${text}" -> ${href}`);
                contactUrl = href;
                if (contactUrl) break; // Take the first one
            }
        }
        
        if (contactUrl) {
            console.log(`Navigating to contact page: ${contactUrl}`);
            await page.goto(contactUrl.startsWith('http') ? contactUrl : `https://www.2020innovation.com${contactUrl}`, { waitUntil: 'networkidle' });
            console.log(`Contact Page Title: ${await page.title()}`);
            form = page.locator('form').first();
            formCount = await page.locator('form').count();
            
            // Wait a bit for dynamic forms (HubSpot, Marketo, etc.)
            if (formCount === 0) {
                console.log('Waiting for potential dynamic forms...');
                await page.waitForTimeout(5000); 
                formCount = await page.locator('form').count();
            }
            
             // Check for iframes if still 0
            if (formCount === 0) {
                 console.log('Checking iframes...');
                 const frames = page.frames();
                 for (const frame of frames) {
                     const frameFormCount = await frame.locator('form').count();
                     if (frameFormCount > 0) {
                         console.log(`Found ${frameFormCount} form(s) inside iframe: ${frame.url()}`);
                         form = frame.locator('form').first();
                         formCount = frameFormCount;
                         break;
                     }
                 }
            }
        } else {
            console.log('Could not find a valid Contact link.');
        }
    }
    
    console.log(`Found ${formCount} forms.`);

    const fs = require('fs');

    if (formCount > 0) {
        const inputs = await form.locator('input:not([type="hidden"]):not([type="submit"])').all();
        const selects = await form.locator('select').all();
        const textareas = await form.locator('textarea').all();
        
        const totalFields = inputs.length + selects.length + textareas.length;
        
        let output = `Total Form Fields Detected: ${totalFields}\n`;
        output += '----------------------------------------\n';
        
        output += 'Inputs:\n';
        for (const input of inputs) {
            const name = await input.getAttribute('name') || await input.getAttribute('id') || 'unnamed';
            const type = await input.getAttribute('type') || 'text';
            const placeholder = await input.getAttribute('placeholder') || '';
            output += ` - [Input] Type: ${type}, Name: ${name}, Placeholder: ${placeholder}\n`;
        }
        
        output += 'Selects:\n';
        for (const select of selects) {
            const name = await select.getAttribute('name') || await select.getAttribute('id') || 'unnamed';
            output += ` - [Select] Name: ${name}\n`;
            
            // Dump options for this select to see if it's the country selector
            const options = await select.locator('option').all();
            output += `   Options count: ${options.length}\n`;
            for (const option of options.slice(0, 5)) { // Show first 5 options
                 const text = await option.textContent();
                 const value = await option.getAttribute('value');
                 output += `     - "${text}" (val: ${value})\n`;
            }
        }
        
        output += 'Textareas:\n';
        for (const textarea of textareas) {
            const name = await textarea.getAttribute('name') || await textarea.getAttribute('id') || 'unnamed';
            const placeholder = await textarea.getAttribute('placeholder') || '';
            output += ` - [Textarea] Name: ${name}, Placeholder: ${placeholder}\n`;
        }
        
        // Look for custom dropdowns/comboboxes which might be <div> based
        output += '----------------------------------------\n';
        output += 'Potential Custom Dropdowns (role=combobox or button):\n';
        const comboboxes = await form.getByRole('combobox').all();
        for (const box of comboboxes) {
             const name = await box.getAttribute('name') || await box.getAttribute('id') || await box.getAttribute('aria-label') || 'unnamed';
             output += ` - [Combobox] Name: ${name}\n`;
        }
        
        output += '----------------------------------------\n';
        
        console.log(output);
        fs.writeFileSync('fields_list.txt', output);
        fs.writeFileSync('form_dump.html', await form.innerHTML()); // Save HTML to analyze structure
        console.log('Fields list saved to fields_list.txt');
        console.log('Form HTML saved to form_dump.html');

    } else {
        console.log('No forms found to analyze.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

test2020InnovationFields();
