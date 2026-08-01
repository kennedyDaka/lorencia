const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const exportDir = path.join(__dirname, 'export');

function loadJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(exportDir, filename), 'utf8'));
}

async function importData() {
  console.log('=== PHASE 3: IMPORT DATA ===\n');

  // 1. Import businesses
  console.log('1. Importing businesses...');
  const businesses = loadJson('businesses.json');
  for (const b of businesses) {
    await prisma.business.create({
      data: {
        id: b.id,
        slug: b.slug,
        name: b.name,
        tagline: b.tagline,
        createdAt: new Date(b.created_at),
      },
    });
    console.log(`  Created: ${b.name} (${b.id})`);
  }

  // 2. Import chart_of_accounts
  console.log('\n2. Importing chart of accounts...');
  const coa = loadJson('chart_of_accounts.json');
  for (const a of coa) {
    await prisma.chartOfAccount.create({
      data: {
        id: a.id,
        businessId: a.business_id,
        code: a.code,
        name: a.name,
        type: a.type,
        isSystem: a.is_system,
        isActive: a.is_active,
        createdAt: new Date(a.created_at),
      },
    });
  }
  console.log(`  Created ${coa.length} accounts`);

  // 3. Import products (batch insert for speed)
  console.log('\n3. Importing products...');
  const products = loadJson('products.json');
  const batchSize = 100;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await prisma.product.createMany({
      data: batch.map(p => ({
        id: p.id,
        businessId: p.business_id,
        name: p.name,
        category: p.category,
        price: p.price,
        stockQty: p.stock_qty,
        lowStockThreshold: p.low_stock_threshold,
        isActive: p.is_active,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      })),
    });
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} products`);
  }
  console.log(`  Total: ${products.length} products`);

  // 4. Import profiles
  console.log('\n4. Importing profiles...');
  const profiles = loadJson('profiles.json');
  for (const p of profiles) {
    await prisma.profile.create({
      data: {
        id: p.id,
        fullName: p.full_name,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      },
    });
  }
  console.log(`  Created ${profiles.length} profiles`);

  // 5. Import stock_movements
  console.log('\n5. Importing stock movements...');
  const movements = loadJson('stock_movements.json');
  for (const m of movements) {
    await prisma.stockMovement.create({
      data: {
        id: m.id,
        businessId: m.business_id,
        inventoryType: m.inventory_type,
        productId: m.product_id || null,
        rawMaterialId: m.raw_material_id || null,
        qtyChange: m.qty_change,
        previousQty: m.previous_qty,
        newQty: m.new_qty,
        reason: m.reason,
        note: m.note,
        createdBy: m.created_by,
        createdAt: new Date(m.created_at),
      },
    });
  }
  console.log(`  Created ${movements.length} stock movements`);

  // 6. Re-seed Malawi holidays, payroll settings, PAYE brackets
  console.log('\n6. Re-seeding config data...');
  const holidays = [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-01-15', name: 'John Chilembwe Day' },
    { date: '2026-03-03', name: "Martyrs' Day" },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-04-06', name: 'Easter Monday' },
    { date: '2026-05-01', name: 'Labour Day' },
    { date: '2026-05-14', name: 'Kamuzu Day' },
    { date: '2026-07-06', name: 'Independence Day' },
    { date: '2026-07-07', name: 'Republic Day' },
    { date: '2026-08-10', name: "Mother's Day" },
    { date: '2026-12-25', name: 'Christmas Day' },
    { date: '2026-12-26', name: 'Boxing Day' },
  ];
  await prisma.malawiHoliday.createMany({
    data: holidays.map(h => ({ holidayDate: new Date(h.date), name: h.name })),
  });
  console.log(`  Created ${holidays.length} holidays`);

  for (const b of businesses) {
    await prisma.payrollSetting.create({
      data: {
        businessId: b.id,
        defaultPensionPercentage: 5,
        defaultOvertimeRate: 2,
        standardHoursPerPeriod: 176,
      },
    });

    const brackets = [
      { minIncome: 0, maxIncome: 100000, ratePercent: 0 },
      { minIncome: 100001, maxIncome: 540000, ratePercent: 15 },
      { minIncome: 540001, maxIncome: 1200000, ratePercent: 25 },
      { minIncome: 1200001, maxIncome: null, ratePercent: 30 },
    ];
    for (const br of brackets) {
      await prisma.payeBracket.create({
        data: {
          businessId: b.id,
          minIncome: br.minIncome,
          maxIncome: br.maxIncome,
          ratePercent: br.ratePercent,
        },
      });
    }
    console.log(`  Created payroll config for ${b.name}`);
  }

  // 7. Create auth users
  console.log('\n7. Creating auth users...');

  // admin@lorencia.com
  const adminResult = await prisma.$queryRawUnsafe(`
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, confirmation_token,
      recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@lorencia.com',
      crypt('Lorencia2026!', gen_salt('bf')),
      now(), now(), now(), '', '', '', ''
    ) RETURNING id
  `);
  const adminId = adminResult[0].id;
  console.log(`  Created admin: admin@lorencia.com (id: ${adminId})`);

  // cashier@lorencia.com
  const cashierResult = await prisma.$queryRawUnsafe(`
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, confirmation_token,
      recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'cashier@lorencia.com',
      crypt('Lorencia2026!', gen_salt('bf')),
      now(), now(), now(), '', '', '', ''
    ) RETURNING id
  `);
  const cashierId = cashierResult[0].id;
  console.log(`  Created cashier: cashier@lorencia.com (id: ${cashierId})`);

  // 8. Create profiles for auth users
  console.log('\n8. Creating profiles...');
  await prisma.profile.create({ data: { id: adminId, fullName: 'Matilda (Admin)' } });
  await prisma.profile.create({ data: { id: cashierId, fullName: 'Cashier' } });
  console.log('  Created profiles');

  // 9. Create user_roles
  console.log('\n9. Creating user_roles...');
  const cafeId = businesses[0].id;
  const giftShopId = businesses[1].id;

  await prisma.userRole.create({
    data: { userId: adminId, role: 'owner', businessId: cafeId },
  });
  await prisma.userRole.create({
    data: { userId: adminId, role: 'owner', businessId: giftShopId },
  });
  await prisma.userRole.create({
    data: { userId: cashierId, role: 'cashier', businessId: cafeId },
  });
  console.log('  Created 3 user roles (admin-owner x2, cashier x1)');

  console.log('\n=== IMPORT COMPLETE ===');
  await prisma.$disconnect();
}

importData().catch(e => {
  console.error('Import failed:', e.message);
  prisma.$disconnect();
});
