
from bs4 import BeautifulSoup
import sys

def count_fields(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    forms = soup.find_all('form')
    
    print(f"Found {len(forms)} forms on the page.")
    
    best_form = None
    max_fields = 0
    best_form_fields = []
    
    for i, form in enumerate(forms):
        # Logic from campaignProcessor.ts:
        # inputs = await form.$$('input:not([type="hidden"]), textarea, select');
        # if (['submit', 'button'].includes(type)) continue;
        
        fields = []
        
        # Inputs
        inputs = form.find_all('input')
        for inp in inputs:
            type_attr = inp.get('type', 'text').lower()
            if type_attr == 'hidden':
                continue
            if type_attr in ['submit', 'button', 'image', 'reset']:
                continue
            fields.append(f"input[{type_attr}] name={inp.get('name', '')} id={inp.get('id', '')}")
            
        # Textareas
        textareas = form.find_all('textarea')
        for ta in textareas:
             fields.append(f"textarea name={ta.get('name', '')} id={ta.get('id', '')}")
             
        # Selects
        selects = form.find_all('select')
        for sel in selects:
            fields.append(f"select name={sel.get('name', '')} id={sel.get('id', '')}")
            
        print(f"Form {i+1}: {len(fields)} fields")
        if len(fields) > max_fields:
            max_fields = len(fields)
            best_form = form
            best_form_fields = fields

    if best_form:
        print(f"\nBest form (most fields) has {max_fields} fields:")
        for field in best_form_fields:
            print(f"- {field}")
            
        # Also check for contact links if 0 fields or specific request
        contact_links = []
        for a in soup.find_all('a', href=True):
            href = a['href'].lower()
            text = a.get_text().lower()
            if 'contact' in href or 'contact' in text or 'get in touch' in text:
                if href.startswith('http') or href.startswith('/'):
                    contact_links.append(a['href'])
        
        print(f"\nPotential contact links found: {len(set(contact_links))}")
        for link in list(set(contact_links))[:5]:
             print(f"- {link}")
    else:
        print("No valid forms found.")
        contact_links = []
        for a in soup.find_all('a', href=True):
            href = a['href'].lower()
            text = a.get_text().lower()
            if 'contact' in href or 'contact' in text or 'get in touch' in text:
                 if href.startswith('http') or href.startswith('/'):
                    contact_links.append(a['href'])
        print(f"\nPotential contact links found: {len(set(contact_links))}")
        for link in list(set(contact_links))[:5]:
             print(f"- {link}")

if __name__ == "__main__":
    count_fields('homepage.html')
