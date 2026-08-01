const { Client } = require('pg');

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  
  const tables = ['profiles', 'user_roles', 'sales', 'expenses', 'catering_costs', 'raw_material_purchases', 'journal_entries', 'stock_movements', 'payroll_entries'];
  
  for (const table of tables) {
    const res = await c.query(`
      SELECT conname FROM pg_constraint
      WHERE conrelid = '${table}'::regclass
        AND confrelid IN (SELECT oid FROM pg_class WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth'))
    `);
    for (const row of res.rows) {
      await c.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${row.conname}`);
      console.log(`Dropped ${row.conname} from ${table}`);
    }
  }
  
  await c.end();
  console.log('Done!');
}

main().catch(e => { console.error(e.message); process.exit(1); });
