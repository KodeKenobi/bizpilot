/**
 * Local CSV parsing test - no API calls, no authentication needed
 * Tests the CSV parsing logic directly
 */

const fs = require('fs');
const path = require('path');

const CSV_FILE_PATH = path.join(__dirname, 'sample_companies.csv');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Replicate the normalization logic from the API
function normalizeHeader(header) {
  const lower = header.toLowerCase().replace(/\s+/g, '_');
  
  // Map various URL field names to website_url
  if (lower.includes('website') || lower.includes('url') || lower === 'site') {
    return 'website_url';
  }
  // Map various company name fields
  if (lower.includes('company') || lower === 'name' || lower === 'business') {
    return 'company_name';
  }
  // Map email fields
  if (lower.includes('email') || lower.includes('mail')) {
    return 'contact_email';
  }
  // Map phone fields
  if (lower.includes('phone') || lower.includes('mobile') || lower.includes('tel')) {
    return 'phone';
  }
  // Map contact person fields
  if (lower.includes('contact') && (lower.includes('person') || lower.includes('name'))) {
    return 'contact_person';
  }
  
  return lower;
}

function parseCSV() {
  log('\n========================================', 'bright');
  log('Local CSV Parsing Test', 'bright');
  log('========================================\n', 'bright');

  // Read CSV file
  log('Step 1: Reading CSV file...', 'cyan');
  const text = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
  log(`File size: ${text.length} bytes`, 'green');
  log('\nRaw CSV content:', 'yellow');
  console.log(text);
  console.log('');

  // Parse lines
  log('Step 2: Parsing lines...', 'cyan');
  const lines = text.split('\n').filter(line => line.trim());
  log(`Total lines (after filtering empty): ${lines.length}`, 'green');
  lines.forEach((line, idx) => {
    console.log(`  Line ${idx}: "${line}"`);
  });
  console.log('');

  if (lines.length < 1) {
    log('ERROR: No lines found!', 'red');
    return;
  }

  // Check first line
  log('Step 3: Analyzing first line...', 'cyan');
  const firstLine = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
  log('First line columns:', 'yellow');
  firstLine.forEach((col, idx) => {
    console.log(`  Column ${idx}: "${col}"`);
  });
  console.log('');

  // Detect if headers
  const hasUrlInFirstRow = firstLine.some(value => {
    const lower = value.toLowerCase();
    return lower.includes('http') || 
           lower.includes('.com') || 
           lower.includes('.net') || 
           lower.includes('.org') || 
           lower.includes('.io') ||
           lower.includes('.co') ||
           lower.includes('www.');
  });
  
  const hasHeaders = !hasUrlInFirstRow;
  
  log(`Step 4: Header detection...`, 'cyan');
  log(`Has URL in first row? ${hasUrlInFirstRow ? 'YES' : 'NO'}`, hasUrlInFirstRow ? 'yellow' : 'green');
  log(`Treating first row as headers? ${hasHeaders ? 'YES' : 'NO'}`, hasHeaders ? 'green' : 'yellow');
  console.log('');

  let headers;
  let startRow;

  if (hasHeaders) {
    headers = firstLine;
    startRow = 1;
    
    log('Step 5: Normalizing headers...', 'cyan');
    const normalizedHeaders = headers.map(h => normalizeHeader(h));
    log('Original → Normalized:', 'yellow');
    headers.forEach((h, idx) => {
      console.log(`  "${h}" → "${normalizedHeaders[idx]}"`);
    });
    console.log('');

    // Check for website_url
    const hasWebsiteUrl = normalizedHeaders.includes('website_url');
    log(`Has website_url column? ${hasWebsiteUrl ? 'YES' : 'NO'}`, hasWebsiteUrl ? 'green' : 'red');
    
    if (!hasWebsiteUrl) {
      log('\nERROR: No website_url column found!', 'red');
      return;
    }
  } else {
    log('Step 5: Auto-detecting column types...', 'cyan');
    log('(Analyzing data patterns in first 5 rows)', 'yellow');
    startRow = 0;
    // Would analyze patterns here...
    log('Not implemented in local test', 'yellow');
  }

  console.log('');
  log('Step 6: Parsing data rows...', 'cyan');
  const rows = [];

  for (let i = startRow; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
    
    // Skip empty rows
    const hasData = values.some(v => v && v.trim() !== '');
    if (!hasData) {
      log(`  Row ${i}: EMPTY - skipping`, 'yellow');
      continue;
    }
    
    const row = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const normalizedHeader = normalizeHeader(header);
      row[normalizedHeader] = value;
    });

    log(`  Row ${i}: ${JSON.stringify(row)}`, 'green');
    rows.push(row);
  }

  console.log('');
  log('========================================', 'bright');
  log('Results', 'bright');
  log('========================================\n', 'bright');

  log(`Total rows parsed: ${rows.length}`, 'green');
  const validRows = rows.filter(row => row.website_url && row.website_url.trim() !== '');
  log(`Valid rows (with website_url): ${validRows.length}`, 'green');
  log(`Invalid rows: ${rows.length - validRows.length}`, validRows.length === rows.length ? 'green' : 'yellow');

  console.log('');
  log('Parsed data:', 'cyan');
  validRows.forEach((row, idx) => {
    console.log(`\nRow ${idx + 1}:`);
    console.log(`  Company: ${row.company_name || 'N/A'}`);
    console.log(`  Website: ${row.website_url || 'N/A'}`);
    console.log(`  Email: ${row.contact_email || 'N/A'}`);
    console.log(`  Phone: ${row.phone || 'N/A'}`);
  });

  if (validRows.length > 0) {
    log('\n✓ TEST PASSED! CSV parsed successfully', 'green');
  } else {
    log('\n✗ TEST FAILED! No valid rows found', 'red');
  }
}

parseCSV();
