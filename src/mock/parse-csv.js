const fs = require('fs');
const path = require('path');

const mockDir = path.join(__dirname);
const publicDataDir = path.join(__dirname, '../../public/data');

if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  return lines;
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return '';
  // Convert float-like string to clean representation
  let clean = phone.trim();
  if (clean.endsWith('.0')) {
    clean = clean.slice(0, -2);
  }
  if (clean.length <= 4) return '05**';
  return `0${clean.slice(0, 2)}*****${clean.slice(-2)}`;
}

const csvFiles = fs.readdirSync(mockDir).filter(f => f.endsWith('.csv'));

csvFiles.forEach(file => {
  const filePath = path.join(mockDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);
  if (rows.length === 0) return;

  const headers = rows[0].map(h => h.trim());
  const jsonData = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip empty lines
    if (row.length === 1 && row[0] === '') continue;
    
    const obj = {};
    headers.forEach((header, idx) => {
      let val = row[idx] ? row[idx].trim() : '';
      
      // Perform PII masking for customer tables
      if (file === 'dim_customer.csv' || file === 'reporting_customer_360.csv') {
        if (header === 'email') {
          val = maskEmail(val);
        } else if (header === 'phone') {
          val = maskPhone(val);
        }
      }
      
      // Convert numbers and booleans
      if (val === 'True' || val === 'true') {
        obj[header] = true;
      } else if (val === 'False' || val === 'false') {
        obj[header] = false;
      } else if (val === '') {
        obj[header] = null;
      } else if (!isNaN(val) && val.trim() !== '') {
        obj[header] = Number(val);
      } else {
        obj[header] = val;
      }
    });
    jsonData.push(obj);
  }

  const jsonName = file.replace('.csv', '.json');
  fs.writeFileSync(path.join(mockDir, jsonName), JSON.stringify(jsonData, null, 2));
  fs.writeFileSync(path.join(publicDataDir, jsonName), JSON.stringify(jsonData, null, 2));
  console.log(`Processed ${file} -> ${jsonData.length} rows`);
});
