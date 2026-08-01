const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'export');

fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => {
  const fp = path.join(dir, f);
  let raw = fs.readFileSync(fp);
  // Strip UTF-8 BOM if present
  if (raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF) {
    raw = raw.slice(3);
    fs.writeFileSync(fp, raw);
    console.log('Fixed BOM: ' + f);
  } else {
    console.log('OK: ' + f);
  }
  // Verify
  const verify = fs.readFileSync(fp);
  console.log('  First byte: ' + verify[0] + ' (expect 91 for [)');
});
