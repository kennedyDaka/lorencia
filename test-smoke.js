const { chromium } = require('playwright');

const BASE = 'https://frontend-vert-mu-96.vercel.app';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text()); });

  async function screenshot(name) {
    await page.screenshot({ path: `C:\\Users\\Dell\\Desktop\\lorencia\\screenshots\\${name}.png`, fullPage: true });
  }

  async function bodyText() {
    return (await page.textContent('body')).replace(/\s+/g, ' ').trim();
  }

  // === 1. CHOOSER PAGE ===
  console.log('=== 1. CHOOSER PAGE ===');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  let txt = await bodyText();
  console.log('Has Lorencia:', txt.includes('Lorencia'));
  console.log('Has Cafe:', txt.includes('Cafe'));
  console.log('Has Gift Shop:', txt.includes('Gift Shop'));
  console.log('Has Admin Sign In:', txt.includes('Admin Sign In'));
  await screenshot('01-chooser');

  // === 2. ADMIN LOGIN ===
  console.log('\n=== 2. ADMIN LOGIN ===');
  const adminLink = await page.$('text=Admin Sign In');
  if (adminLink) {
    await adminLink.click();
    await page.waitForTimeout(2000);
  } else {
    await page.goto(BASE + '/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
  }
  console.log('Login page URL:', page.url());
  await screenshot('02-login-page');
  
  await page.fill('input[type="email"]', 'admin@lorencia.com');
  await page.fill('input[type="password"]', 'Lorencia2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  console.log('After login URL:', page.url());
  await screenshot('03-after-login');

  // === 3. DASHBOARD ===
  console.log('\n=== 3. DASHBOARD ===');
  txt = await bodyText();
  console.log('Has Dashboard:', txt.includes('Dashboard'));
  console.log('Has Revenue:', txt.includes('Revenue') || txt.includes('MK'));
  await screenshot('04-dashboard');

  // === 4. POS - CAFE ===
  console.log('\n=== 4. POS - CAFE ===');
  await page.goto(BASE + '/pos/cafe', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('URL:', page.url());
  console.log('POS loaded:', txt.includes('Cart') || txt.includes('Point of Sale'));
  await screenshot('05-pos-cafe');

  // === 5. ADD PRODUCT TO CART ===
  console.log('\n=== 5. ADD PRODUCT TO CART ===');
  // Click on a product card
  const productElements = await page.$$('[class*="cursor-pointer"]');
  console.log('Clickable product elements:', productElements.length);
  if (productElements.length > 0) {
    await productElements[0].click();
    await page.waitForTimeout(1000);
    txt = await bodyText();
    console.log('Cart updated:', txt.includes('Subtotal') || txt.includes('Total'));
    await screenshot('06-cart-item');
  } else {
    console.log('No product elements found');
  }

  // === 6. COMPLETE SALE ===
  console.log('\n=== 6. COMPLETE SALE ===');
  const completeBtn = await page.$('button:has-text("Complete Sale")');
  if (completeBtn) {
    await completeBtn.click();
    await page.waitForTimeout(3000);
    txt = await bodyText();
    console.log('Sale completed');
    await screenshot('07-sale-completed');
  } else {
    console.log('Complete Sale button not found - checking page');
    await screenshot('07-no-sale-btn');
  }

  // === 7. INVENTORY ===
  console.log('\n=== 7. INVENTORY ===');
  await page.goto(BASE + '/pos/cafe/inventory', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Inventory loaded:', txt.includes('Inventory') || txt.includes('Stock'));
  console.log('Has search:', txt.includes('Search'));
  await screenshot('08-inventory');

  // === 8. EXPENSES ===
  console.log('\n=== 8. EXPENSES ===');
  await page.goto(BASE + '/pos/cafe/expenses', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Expenses loaded:', txt.includes('Expense'));
  await screenshot('09-expenses');

  // === 9. CUSTOMERS ===
  console.log('\n=== 9. CUSTOMERS ===');
  await page.goto(BASE + '/pos/cafe/customers', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Customers loaded:', txt.includes('Customer'));
  await screenshot('10-customers');

  // === 10. CATERING ===
  console.log('\n=== 10. CATERING ===');
  await page.goto(BASE + '/pos/cafe/catering', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Catering loaded:', txt.includes('Catering') || txt.includes('Raw Material'));
  await screenshot('11-catering');

  // === 11. RAW MATERIALS ===
  console.log('\n=== 11. RAW MATERIALS ===');
  await page.goto(BASE + '/pos/cafe/raw-materials', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Raw Materials loaded:', txt.includes('Raw') || txt.includes('Material'));
  await screenshot('12-raw-materials');

  // === 12. ACCOUNTING ===
  console.log('\n=== 12. ACCOUNTING ===');
  await page.goto(BASE + '/pos/cafe/accounting', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Accounting loaded:', txt.includes('Accounting') || txt.includes('Chart') || txt.includes('Journal'));
  await screenshot('13-accounting');

  // === 13. PAYROLL ===
  console.log('\n=== 13. PAYROLL ===');
  await page.goto(BASE + '/pos/cafe/payroll', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Payroll loaded:', txt.includes('Payroll') || txt.includes('Employee'));
  await screenshot('14-payroll');

  // === 14. REPORTS ===
  console.log('\n=== 14. REPORTS ===');
  await page.goto(BASE + '/pos/cafe/reports', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Reports loaded:', txt.includes('Report'));
  console.log('Has Overview:', txt.includes('Overview'));
  console.log('Has Sales Detail:', txt.includes('Sales Detail'));
  console.log('Has Expenses Detail:', txt.includes('Expenses Detail'));
  console.log('Has Export Excel:', txt.includes('Export Excel'));
  await screenshot('15-reports-overview');

  // === 15. SALES DETAIL TAB ===
  console.log('\n=== 15. SALES DETAIL TAB ===');
  const salesTab = await page.$('button:has-text("Sales Detail")');
  if (salesTab) {
    await salesTab.click();
    await page.waitForTimeout(4000);
    txt = await bodyText();
    console.log('Sales Detail loaded:', txt.includes('Total Sales') || txt.includes('Total Revenue'));
    console.log('Has export button:', txt.includes('Export Excel'));
    await screenshot('16-reports-sales-detail');
  } else {
    console.log('Sales Detail tab NOT found');
    await screenshot('16-no-sales-tab');
  }

  // === 16. EXPENSES DETAIL TAB ===
  console.log('\n=== 16. EXPENSES DETAIL TAB ===');
  const expTab = await page.$('button:has-text("Expenses Detail")');
  if (expTab) {
    await expTab.click();
    await page.waitForTimeout(4000);
    txt = await bodyText();
    console.log('Expenses Detail loaded:', txt.includes('Total Expenses'));
    console.log('Has export button:', txt.includes('Export Excel'));
    await screenshot('17-reports-expenses-detail');
  } else {
    console.log('Expenses Detail tab NOT found');
    await screenshot('17-no-exp-tab');
  }

  // === 17. GIFT SHOP POS ===
  console.log('\n=== 17. GIFT SHOP POS ===');
  await page.goto(BASE + '/pos/gift-shop', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Gift Shop POS loaded:', txt.includes('Cart') || txt.includes('Gift'));
  await screenshot('18-gift-shop-pos');

  // === 18. GIFT SHOP REPORTS ===
  console.log('\n=== 18. GIFT SHOP REPORTS ===');
  await page.goto(BASE + '/pos/gift-shop/reports', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  txt = await bodyText();
  console.log('Gift Shop Reports loaded:', txt.includes('Report'));
  await screenshot('19-gift-shop-reports');

  // === ERRORS SUMMARY ===
  console.log('\n=== ERRORS SUMMARY ===');
  const criticalErrors = errors.filter(e => !e.includes('ResizeObserver'));
  if (criticalErrors.length > 0) {
    console.log('FOUND ERRORS:');
    criticalErrors.forEach(e => console.log(' ', e));
  } else {
    console.log('NO CRITICAL ERRORS FOUND');
  }

  await browser.close();
  console.log('\n=== DONE ===');
})().catch(e => console.error('FATAL:', e.message));
