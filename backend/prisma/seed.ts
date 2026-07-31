import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BUSINESSES = [
  { slug: "cafe", name: "Lorencia Cafe", tagline: "Coffee, meals & vibes" },
  { slug: "gift-shop", name: "Lorencia Gift Shop", tagline: "Unique gifts & more" },
];

const CHART_OF_ACCOUNTS = [
  { code: "1100", name: "Cash", type: "asset" },
  { code: "1150", name: "Accounts Receivable", type: "asset" },
  { code: "1200", name: "Stock & Materials", type: "asset" },
  { code: "1300", name: "Equipment & Assets", type: "asset" },
  { code: "2100", name: "PAYE Tax Payable", type: "liability" },
  { code: "2200", name: "Pension Payable", type: "liability" },
  { code: "3100", name: "Owner Investment", type: "equity" },
  { code: "3200", name: "Profits Kept", type: "equity" },
  { code: "4100", name: "Sales Income", type: "income" },
  { code: "4200", name: "Catering Income", type: "income" },
  { code: "5100", name: "Staff Salaries", type: "expense" },
  { code: "5200", name: "Raw Materials", type: "expense" },
  { code: "5300", name: "Operating Expenses", type: "expense" },
  { code: "5400", name: "Depreciation", type: "expense" },
  { code: "5500", name: "Catering Costs", type: "expense" },
];

const MALAWI_HOLIDAYS = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-01-15", name: "John Chilembwe Day" },
  { date: "2026-03-03", name: "Martyrs' Day" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-06", name: "Easter Monday" },
  { date: "2026-05-01", name: "Labour Day" },
  { date: "2026-05-14", name: "Kamuzu Day" },
  { date: "2026-07-06", name: "Independence Day" },
  { date: "2026-07-15", name: "Republic Day" },
  { date: "2026-10-15", name: "Mother's Day" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-26", name: "Boxing Day" },
];

// Cafe menu seed
const CAFE_PRODUCTS = [
  { name: "Espresso", price: 800, category: "Coffee" },
  { name: "Double Espresso", price: 1200, category: "Coffee" },
  { name: "Americano", price: 1000, category: "Coffee" },
  { name: "Cappuccino", price: 1500, category: "Coffee" },
  { name: "Latte", price: 1500, category: "Coffee" },
  { name: "Mocha", price: 1800, category: "Coffee" },
  { name: "Flat White", price: 1500, category: "Coffee" },
  { name: "Macchiato", price: 1300, category: "Coffee" },
  { name: "Chai Latte", price: 1500, category: "Tea" },
  { name: "Green Tea", price: 1000, category: "Tea" },
  { name: "Black Tea", price: 800, category: "Tea" },
  { name: "Herbal Tea", price: 1200, category: "Tea" },
  { name: "Fresh Orange Juice", price: 2000, category: "Juices" },
  { name: "Mango Juice", price: 2000, category: "Juices" },
  { name: "Passion Juice", price: 2000, category: "Juices" },
  { name: "Lemonade", price: 1500, category: "Drinks" },
  { name: "Soda (Coke/Fanta/Sprite)", price: 1000, category: "Drinks" },
  { name: "Water (500ml)", price: 500, category: "Drinks" },
  { name: "Sandwich (Veggie)", price: 3500, category: "Food" },
  { name: "Sandwich (Chicken)", price: 4000, category: "Food" },
  { name: "Club Sandwich", price: 5000, category: "Food" },
  { name: "French Fries", price: 2500, category: "Food" },
  { name: "Chips & Chicken", price: 5500, category: "Food" },
  { name: "Pasta (Veggie)", price: 4500, category: "Food" },
  { name: "Pasta (Chicken)", price: 5000, category: "Food" },
  { name: "Caesar Salad", price: 4000, category: "Food" },
  { name: "Chocolate Cake", price: 3000, category: "Desserts" },
  { name: "Cheesecake", price: 3500, category: "Desserts" },
  { name: "Muffin", price: 1500, category: "Desserts" },
  { name: "Croissant", price: 2000, category: "Desserts" },
];

const GIFT_SHOP_PRODUCTS = [
  { name: "Greeting Card (Birthday)", price: 1500, category: "Cards" },
  { name: "Greeting Card (Thank You)", price: 1500, category: "Cards" },
  { name: "Greeting Card (Congratulations)", price: 1500, category: "Cards" },
  { name: "Greeting Card (Sympathy)", price: 1500, category: "Cards" },
  { name: "Gift Bag (Small)", price: 800, category: "Packaging" },
  { name: "Gift Bag (Medium)", price: 1200, category: "Packaging" },
  { name: "Gift Bag (Large)", price: 1800, category: "Packaging" },
  { name: "Wrapping Paper (Roll)", price: 2000, category: "Packaging" },
  { name: "Gift Box (Small)", price: 2500, category: "Packaging" },
  { name: "Gift Box (Large)", price: 4000, category: "Packaging" },
  { name: "Scented Candle", price: 5000, category: "Home" },
  { name: "Photo Frame (Small)", price: 3500, category: "Home" },
  { name: "Photo Frame (Large)", price: 6000, category: "Home" },
  { name: "Mug (Ceramic)", price: 4000, category: "Home" },
  { name: "Teddy Bear (Small)", price: 5000, category: "Toys" },
  { name: "Teddy Bear (Large)", price: 10000, category: "Toys" },
  { name: "Keychain", price: 1500, category: "Accessories" },
  { name: "Bracelet", price: 3000, category: "Accessories" },
  { name: "Necklace", price: 5000, category: "Accessories" },
  { name: "Earrings", price: 3500, category: "Accessories" },
  { name: "Notebook (Hardcover)", price: 3000, category: "Stationery" },
  { name: "Pen Set", price: 2500, category: "Stationery" },
  { name: "Journal", price: 4000, category: "Stationery" },
  { name: "Sticker Pack", price: 1000, category: "Stationery" },
  { name: "Chocolate Box", price: 8000, category: "Food" },
  { name: "Wine Glasses (Set of 2)", price: 12000, category: "Home" },
  { name: "Decorative Vase", price: 7000, category: "Home" },
  { name: "Soap Set", price: 4500, category: "Self Care" },
  { name: "Bath Bomb Set", price: 5500, category: "Self Care" },
  { name: "Perfume (Small)", price: 15000, category: "Self Care" },
];

async function main() {
  console.log("Seeding database...");

  // Create businesses
  for (const biz of BUSINESSES) {
    const existing = await prisma.business.findUnique({ where: { slug: biz.slug } });
    if (!existing) {
      await prisma.business.create({
        data: { slug: biz.slug, name: biz.name, tagline: biz.tagline },
      });
      console.log(`Created business: ${biz.name}`);
    }
  }

  // Create chart of accounts for each business
  const businesses = await prisma.business.findMany();
  for (const biz of businesses) {
    const existing = await prisma.chartOfAccount.count({ where: { businessId: biz.id } });
    if (existing === 0) {
      await prisma.chartOfAccount.createMany({
        data: CHART_OF_ACCOUNTS.map((a) => ({
          businessId: biz.id,
          code: a.code,
          name: a.name,
          type: a.type,
          isSystem: true,
        })),
      });
      console.log(`Created chart of accounts for ${biz.name}`);
    }
  }

  // Seed cafe products
  const cafe = await prisma.business.findUnique({ where: { slug: "cafe" } });
  if (cafe) {
    const existing = await prisma.product.count({ where: { businessId: cafe.id } });
    if (existing === 0) {
      await prisma.product.createMany({
        data: CAFE_PRODUCTS.map((p) => ({
          businessId: cafe.id,
          name: p.name,
          price: p.price,
          category: p.category,
          stockQty: 100,
          lowStockThreshold: 10,
        })),
      });
      console.log(`Seeded ${CAFE_PRODUCTS.length} cafe products`);
    }
  }

  // Seed gift shop products
  const giftShop = await prisma.business.findUnique({ where: { slug: "gift-shop" } });
  if (giftShop) {
    const existing = await prisma.product.count({ where: { businessId: giftShop.id } });
    if (existing === 0) {
      await prisma.product.createMany({
        data: GIFT_SHOP_PRODUCTS.map((p) => ({
          businessId: giftShop.id,
          name: p.name,
          price: p.price,
          category: p.category,
          stockQty: 50,
          lowStockThreshold: 5,
        })),
      });
      console.log(`Seeded ${GIFT_SHOP_PRODUCTS.length} gift shop products`);
    }
  }

  // Seed Malawi holidays
  const existingHolidays = await prisma.malawiHoliday.count();
  if (existingHolidays === 0) {
    await prisma.malawiHoliday.createMany({
      data: MALAWI_HOLIDAYS.map((h) => ({
        holidayDate: new Date(h.date),
        name: h.name,
      })),
    });
    console.log(`Seeded ${MALAWI_HOLIDAYS.length} Malawi holidays`);
  }

  // Create payroll settings for each business
  for (const biz of businesses) {
    const existing = await prisma.payrollSettings.findUnique({ where: { businessId: biz.id } });
    if (!existing) {
      await prisma.payrollSettings.create({
        data: {
          businessId: biz.id,
          defaultPensionPercentage: 5,
          defaultOvertimeRate: 2,
          standardHoursPerPeriod: 176,
        },
      });
    }
  }

  // Create PAYE brackets (Malawi 2026)
  for (const biz of businesses) {
    const existing = await prisma.payeBracket.count({ where: { businessId: biz.id } });
    if (existing === 0) {
      await prisma.payeBracket.createMany({
        data: [
          { businessId: biz.id, minIncome: 0, maxIncome: 100000, ratePercent: 0 },
          { businessId: biz.id, minIncome: 100001, maxIncome: 540000, ratePercent: 15 },
          { businessId: biz.id, minIncome: 540001, maxIncome: 1200000, ratePercent: 25 },
          { businessId: biz.id, minIncome: 1200001, maxIncome: null, ratePercent: 30 },
        ],
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
