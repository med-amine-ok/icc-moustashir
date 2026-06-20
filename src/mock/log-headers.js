const fs = require('fs');
const path = require('path');

const mockDir = path.join(__dirname);
const files = fs.readdirSync(mockDir).filter(f => f.endsWith('.csv'));

files.forEach(file => {
  const filePath = path.join(mockDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const firstLine = content.split('\n')[0];
  console.log(`${file}: ${firstLine.trim()}`);
});
