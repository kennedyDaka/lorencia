const https = require('https');
const fs = require('fs');
const path = require('path');

const OLD_URL = 'https://pqpqjaxlmmrimfqgecxh.supabase.co';
const OLD_KEY = 'sb_publishable_PMmQllBm2bvQbcdPD-5dZw_DIO3xWAx';
const OLD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcHFqYXhsbW1yaW1mcWdlY3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzIxMDgxOSwiZXhwIjoyMDk4Nzg2ODE5fQ.hom4ykhTT1BlkXUEY3CA90asRkn-VYrgtiuo36cYjsM';
const EXPORT_DIR = path.join(__dirname, 'export');

if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

function fetchTable(table, limit = 1000, offset = 0) {
  return new Promise((resolve, reject) => {
    const url = `${OLD_URL}/rest/v1/${table}?select=*&limit=${limit}&offset=${offset}`;
    const options = {
      headers: {
        'apikey': OLD_KEY,
        'Authorization': `Bearer ${OLD_SERVICE_KEY}`,
      },
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error for ${table}: ${data.substring(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

async function exportAll() {
  console.log('Exporting from old Supabase...\n');

  const tables = ['businesses', 'chart_of_accounts', 'profiles', 'user_roles', 'stock_movements'];

  for (const table of tables) {
    const data = await fetchTable(table);
    const fp = path.join(EXPORT_DIR, `${table}.json`);
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
    console.log(`${table}: ${data.length} rows`);
  }

  // Products may need pagination
  let allProducts = [];
  let offset = 0;
  while (true) {
    const batch = await fetchTable('products', 1000, offset);
    allProducts = allProducts.concat(batch);
    console.log(`products: fetched ${batch.length} (total: ${allProducts.length})`);
    if (batch.length < 1000) break;
    offset += 1000;
  }
  fs.writeFileSync(path.join(EXPORT_DIR, 'products.json'), JSON.stringify(allProducts, null, 2));

  console.log('\nExport complete!');
}

exportAll().catch(console.error);
