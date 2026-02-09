const xlsx = require('xlsx');

function extractUrls(data) {
    return data
      .map(row => {
        // Strategy 1: Look for common header keywords
        const urlEntry = Object.entries(row).find(([key]) => {
          const k = key.toLowerCase();
          return k.includes('url') || k.includes('website') || k.includes('site') || k.includes('domain') || k.includes('link');
        });

        let url = urlEntry ? String(urlEntry[1]) : null;

        // Strategy 2: If no header match, look for anything that looks like a URL in any column
        if (!url) {
          const possibleUrl = Object.values(row).find(val => {
            if (typeof val !== 'string') return false;
            const str = val.toLowerCase().trim();
            const isUrl = str.startsWith('http') || str.startsWith('www.') || 
                   (/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(str));
            // console.log(`  Checking value "${str}": ${isUrl}`);
            return isUrl;
          });
          if (possibleUrl) url = String(possibleUrl);
        }

        if (!url) return null;

        let finalUrl = url.trim();
        if (!finalUrl.startsWith('http')) {
          finalUrl = `https://${finalUrl}`;
        }
        return finalUrl;
      })
      .filter((url) => !!url);
}

// Test cases
const testData = [
  { "Company": "Google", "Website": "https://google.com" }, // Keyword match
  { "Company": "Facebook", "Site": "www.facebook.com" },     // Keyword match (site)
  { "Name": "Apple", "Domain": "apple.com" },               // Keyword match (domain)
  { "A": "Microsoft", "B": "microsoft.com" },               // Value match (fallback)
  { "A": "No URL here", "B": "just text" }                  // No match
];

console.log('Testing URL extraction...');
const results = extractUrls(testData);
console.log('Results:', results);

if (results.length === 4) {
    console.log('✅ Success: Extracted 4 URLs from 5 rows');
} else {
    console.log(`❌ Failure: Extracted ${results.length} URLs, expected 4`);
}
