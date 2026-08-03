const { chromium } = require('playwright');
const BASE = 'https://frontend-vert-mu-96.vercel.app';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGE: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });

  async function bodyText() { return (await page.textContent('body')).replace(/\s+/g, ' ').trim(); }
  async function shot(name) { await page.screenshot({ path: `C:\\Users\\Dell\\Desktop\\lorencia\\screenshots\\${name}.png`, fullPage: true }); }

  // 1. CHOOSER
  console.log('=== 1. CHOOSER ===');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  let txt = await bodyText();
  console.log('OK:', txt.includes('Lorencia Cafe') && txt.includes('Gift Shop'));
  await shot('final-01-chooser');

  // 2. ADMIN LOGIN
  console.log('\n=== 2. ADMIN LOGIN ===');
  const adminLink = await page.$('text=Admin Sign In');
  await adminLink.click();
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', 'admin@lorencia.com');
  await page.fill('input[type="password"]', 'Lorencia2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(6000);
  console.log('URL after login:', page.url());
  txt = await bodyText();
  const loggedIn = txt.includes('Dashboard') || txt.includes('Admin') || txt.includes('Cafe') || txt.includes('Lorencia');
  console.log('Logged in:', loggedIn);
  await shot('final-02-after-login');

  // 3. DASHBOARD
  console.log('\n=== 3. DASHBOARD ===');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  txt = await bodyText();
  console.log('Dashboard:', txt.includes('Admin Dashboard') || txt.includes('Dashboard'));
  console.log('Revenue:', txt.includes('MK'));
  await shot('final-03-dashboard');

  // 4. POS CAFE
  console.log('\n=== 4. POS CAFE ===');
  await page.goto(BASE + '/pos/cafe', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  txt = await bodyText();
  console.log('POS loaded:', txt.includes('Cart'));
  await shot('final-04-pos');

  // 5. ADD + COMPLETE SALE
  console.log('\n=== 5. SALE FLOW ===');
  const cards = await page.$$('[class*="cursor-pointer"]');
  if (cards.length > 0) {
    await cards[0].click();
    await page.waitForTimeout(1000);
    const completeBtn = await page.$('button:has-text("Complete Sale")');
    if (completeBtn) {
      await completeBtn.click();
      await page.waitForTimeout(3000);
      txt = await bodyText();
      console.log('Sale done:', !txt.includes('Subtotal') || txt.includes('Receipt'));
    }
  }
  await shot('final-05-sale');

  // 6-13. OTHER PAGES
  const pages = [
    ['INVENTORY', '/pos/cafe/inventory', 'Inventory'],
    ['EXPENSES', '/pos/cafe/expenses', 'Expense'],
    ['CUSTOMERS', '/pos/cafe/customers', 'Customer'],
    ['CATERING', '/pos/cafe/catering', 'Catering'],
    ['RAW MATERIALS', '/pos/cafe/raw-materials', 'Material'],
    ['ACCOUNTING', '/pos/cafe/accounting', 'Accounting'],
    ['PAYROLL', '/pos/cafe/payroll', 'Payroll'],
  ];
  let idx = 6;
  for (const [name, path, keyword] of pages) {
    console.log(`\n=== ${idx}. ${name} ===`);
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    txt = await bodyText();
    console.log(`${name}:`, txt.includes(keyword));
    await shot(`final-${idx}-${name.toLowerCase().replace(/ /g, '-')}`);
    idx++;
  }

  // 14. REPORTS OVERVIEW
  console.log(`\n=== ${idx}. REPORTS ===`);
  await page.goto(BASE + '/pos/cafe/reports', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Reports:', txt.includes('Report'));
  console.log('Has overview data:', txt.includes('MK'));
  await shot(`final-${idx}-reports-overview`);
  idx++;

  // 15. SALES DETAIL
  console.log(`\n=== ${idx}. SALES DETAIL ===`);
  const salesTab = await page.$('button:has-text("Sales Detail")');
  if (salesTab) {
    await salesTab.click();
    await page.waitForTimeout(4000);
    txt = await bodyText();
    console.log('Sales Detail:', txt.includes('Total Sales') || txt.includes('Total Revenue'));
    console.log('Has data:', txt.includes('MK'));
    console.log('Has Export:', txt.includes('Export Excel'));
    await shot(`final-${idx}-sales-detail`);
  }
  idx++;

  // 16. EXPENSES DETAIL
  console.log(`\n=== ${idx}. EXPENSES DETAIL ===`);
  const expTab = await page.$('button:has-text("Expenses Detail")');
  if (expTab) {
    await expTab.click();
    await page.waitForTimeout(4000);
    txt = await bodyText();
    console.log('Expenses Detail:', txt.includes('Total Expenses'));
    console.log('Has Export:', txt.includes('Export Excel'));
    await shot(`final-${idx}-expenses-detail`);
  }
  idx++;

  // 17. GIFT SHOP
  console.log(`\n=== ${idx}. GIFT SHOP ===`);
  await page.goto(BASE + '/pos/gift-shop', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Gift Shop:', txt.includes('Cart') || txt.includes('Gift'));
  await shot(`final-${idx}-gift-shop`);
  idx++;

  // ERRORS
  console.log('\n=== ERRORS ===');
  const critical = errors.filter(e => !e.includes('ResizeObserver'));
  if (critical.length > 0) {
    critical.forEach(e => console.log(e));
  } else {
    console.log('NO CRITICAL ERRORS');
  }

  await browser.close();
  console.log('\nDONE');
})().catch(e => console.error('FATAL:', e.message));
