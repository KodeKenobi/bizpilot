const fs = require('fs');
const path = require('path');

async function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    if (columns.length < 2) continue;

    const company = columns[0]?.replace(/^"|"$/g, '').trim();
    let url = columns[1]?.replace(/^"|"$/g, '').trim();
    
    if (!company || !url) continue;

    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    data.push({ company, url });
  }

  return data;
}

const csvPath = path.join(process.cwd(), 'main-leads.csv');
const websites = await parseCSV(csvPath);
console.log('Total websites found:', websites.length);
console.log('\nFirst 10 websites:');
websites.slice(0, 10).forEach((w, i) => {
  console.log(`${i + 1}. ${w.company} -> ${w.url}`);
});

console.log('\nChecking for empty URLs...');
let emptyUrlCount = 0;
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n');
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const columns = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
  if (columns.length >= 2) {
    const url = columns[1]?.replace(/^"|"$/g, '').trim();
    if (!url || url.length === 0) {
      emptyUrlCount++;
      if (emptyUrlCount <= 5) {
        console.log(`Row ${i + 1}: Company="${columns[0]?.replace(/^"|"$/g, '').trim()}", URL is empty`);
      }
    }
  }
}
console.log(`Total rows with empty URLs: ${emptyUrlCount}`);
