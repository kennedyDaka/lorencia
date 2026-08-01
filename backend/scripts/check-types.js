const { Client } = require('pg');

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  
  // Check actual column types for user_roles.business_id
  const res = await c.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_roles'
    ORDER BY ordinal_position
  `);
  console.log('user_roles columns:', res.rows);
  
  const bizRes = await c.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'businesses'
    ORDER BY ordinal_position
  `);
  console.log('businesses columns:', bizRes.rows);

  // Check if there's a mismatch - alter if needed
  await c.end();
  console.log('Done!');
}

main().catch(e => { console.error(e.message); process.exit(1); });
