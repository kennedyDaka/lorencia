const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function importRemaining() {
  console.log('=== IMPORTING REMAINING DATA ===\n');

  const businesses = await prisma.business.findMany();
  console.log('Businesses found: ' + businesses.length);

  // Re-seed Malawi holidays
  console.log('\n1. Seeding holidays...');
  const holidays = [
    { holidayDate: new Date('2026-01-01'), name: "New Year's Day" },
    { holidayDate: new Date('2026-01-15'), name: 'John Chilembwe Day' },
    { holidayDate: new Date('2026-03-03'), name: "Martyrs' Day" },
    { holidayDate: new Date('2026-04-03'), name: 'Good Friday' },
    { holidayDate: new Date('2026-04-06'), name: 'Easter Monday' },
    { holidayDate: new Date('2026-05-01'), name: 'Labour Day' },
    { holidayDate: new Date('2026-05-14'), name: 'Kamuzu Day' },
    { holidayDate: new Date('2026-07-06'), name: 'Independence Day' },
    { holidayDate: new Date('2026-07-07'), name: 'Republic Day' },
    { holidayDate: new Date('2026-08-10'), name: "Mother's Day" },
    { holidayDate: new Date('2026-12-25'), name: 'Christmas Day' },
    { holidayDate: new Date('2026-12-26'), name: 'Boxing Day' },
  ];
  const existingHolidays = await prisma.malawiHoliday.count();
  if (existingHolidays === 0) {
    await prisma.malawiHoliday.createMany({ data: holidays });
    console.log('  Created ' + holidays.length + ' holidays');
  } else {
    console.log('  Holidays already exist (' + existingHolidays + '), skipping');
  }

  // Payroll settings and PAYE brackets for each business
  console.log('\n2. Seeding payroll config...');
  const brackets = [
    { minIncome: 0, maxIncome: 100000, ratePercent: 0 },
    { minIncome: 100001, maxIncome: 540000, ratePercent: 15 },
    { minIncome: 540001, maxIncome: 1200000, ratePercent: 25 },
    { minIncome: 1200001, maxIncome: null, ratePercent: 30 },
  ];

  for (const b of businesses) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO payroll_settings (id, business_id, default_pension_percentage, default_overtime_rate, standard_hours_per_period, created_at, updated_at)
      VALUES (gen_random_uuid(), $1::uuid, 5, 2, 176, NOW(), NOW())
      ON CONFLICT (business_id) DO NOTHING
    `, b.id);

    for (const br of brackets) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO paye_brackets (id, business_id, min_income, max_income, rate_percent, created_at)
        VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, NOW())
      `, b.id, br.minIncome, br.maxIncome, br.ratePercent);
    }
    console.log('  Config for: ' + b.name);
  }

  // Create auth users
  console.log('\n3. Creating auth users...');

  // Check if users already exist
  const existingUsers = await prisma.$queryRawUnsafe('SELECT email FROM auth.users');
  const existingEmails = existingUsers.map(u => u.email);
  console.log('  Existing emails: ' + JSON.stringify(existingEmails));

  let adminId, cashierId;

  if (!existingEmails.includes('admin@lorencia.com')) {
    const adminResult = await prisma.$queryRawUnsafe(`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated', 'authenticated',
        'admin@lorencia.com',
        crypt('Lorencia2026!', gen_salt('bf')),
        now(), now(), now()
      ) RETURNING id
    `);
    adminId = adminResult[0].id;
    console.log('  Created admin: ' + adminId);
  } else {
    const u = await prisma.$queryRawUnsafe("SELECT id FROM auth.users WHERE email = 'admin@lorencia.com'");
    adminId = u[0].id;
    console.log('  Admin exists: ' + adminId);
  }

  if (!existingEmails.includes('cashier@lorencia.com')) {
    const cashierResult = await prisma.$queryRawUnsafe(`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated', 'authenticated',
        'cashier@lorencia.com',
        crypt('Lorencia2026!', gen_salt('bf')),
        now(), now(), now()
      ) RETURNING id
    `);
    cashierId = cashierResult[0].id;
    console.log('  Created cashier: ' + cashierId);
  } else {
    const u = await prisma.$queryRawUnsafe("SELECT id FROM auth.users WHERE email = 'cashier@lorencia.com'");
    cashierId = u[0].id;
    console.log('  Cashier exists: ' + cashierId);
  }

  // Create profiles
  console.log('\n4. Creating profiles...');
  await prisma.$executeRawUnsafe(`
    INSERT INTO profiles (id, full_name, created_at, updated_at)
    VALUES ($1::uuid, 'Matilda (Admin)', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `, adminId);
  await prisma.$executeRawUnsafe(`
    INSERT INTO profiles (id, full_name, created_at, updated_at)
    VALUES ($1::uuid, 'Cashier', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `, cashierId);

  // Create user_roles
  console.log('\n5. Creating user roles...');
  const cafeId = businesses.find(b => b.slug === 'cafe')?.id;
  const giftId = businesses.find(b => b.slug === 'gift-shop')?.id;

  // Check existing roles
  const existingRoles = await prisma.userRole.findMany();
  console.log('  Existing roles: ' + existingRoles.length);

  if (existingRoles.length === 0) {
    await prisma.userRole.create({ data: { userId: adminId, role: 'owner', businessId: cafeId } });
    await prisma.userRole.create({ data: { userId: adminId, role: 'owner', businessId: giftId } });
    await prisma.userRole.create({ data: { userId: cashierId, role: 'cashier', businessId: cafeId } });
    console.log('  Created 3 user roles');
  } else {
    console.log('  Roles already exist, skipping');
  }

  // Verify
  console.log('\n=== VERIFICATION ===');
  const bizCount = await prisma.business.count();
  const prodCount = await prisma.product.count();
  const coaCount = await prisma.chartOfAccount.count();
  const movCount = await prisma.stockMovement.count();
  const userCount = await prisma.userRole.count();
  console.log('Businesses: ' + bizCount);
  console.log('Products: ' + prodCount);
  console.log('Chart of Accounts: ' + coaCount);
  console.log('Stock Movements: ' + movCount);
  console.log('User Roles: ' + userCount);

  console.log('\n=== IMPORT COMPLETE ===');
  await prisma.$disconnect();
}

importRemaining().catch(e => {
  console.error('Error:', e.message);
  prisma.$disconnect();
});
