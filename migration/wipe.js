const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function wipeDatabase() {
  console.log('Starting database wipe...');

  const tables = [
    'stock_movements',
    'journal_lines',
    'journal_entries',
    'sale_items',
    'sales',
    'expense_items',
    'expenses',
    'catering_costs',
    'catering_events',
    'raw_material_purchases',
    'raw_materials',
    'fixed_assets',
    'payroll_entries',
    'paye_brackets',
    'payroll_settings',
    'employees',
    'customers',
    'products',
    'chart_of_accounts',
    'user_roles',
    'profiles',
    'businesses',
    'malawi_holidays',
  ];

  for (const table of tables) {
    try {
      const result = await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
      console.log(`  Deleted from ${table}: ${result} rows`);
    } catch (e) {
      console.log(`  Skip ${table}: ${e.message.substring(0, 80)}`);
    }
  }

  // Also delete auth users
  try {
    const authUsers = await prisma.$queryRawUnsafe(`SELECT id FROM auth.users`);
    for (const user of authUsers) {
      await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE id = $1`, user.id);
    }
    console.log(`  Deleted ${authUsers.length} auth users`);
  } catch (e) {
    console.log(`  Auth users: ${e.message.substring(0, 80)}`);
  }

  console.log('Database wipe complete!');
  await prisma.$disconnect();
}

wipeDatabase().catch(console.error);
