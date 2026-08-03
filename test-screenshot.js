const { chromium } = require('playwright');

const BASE = 'https://frontend-vert-mu-96.vercel.app';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage();
  
  console.log('Loading page...');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  console.log('URL:', page.url());
  
  // Screenshot
  await page.screenshot({ path: 'C:\\Users\\Dell\\Desktop\\lorencia\\screenshot-1.png', fullPage: true });
  console.log('Screenshot saved to screenshot-1.png');
  
  const txt = await page.textContent('body');
  console.log('Body text (first 2000 chars):', txt.substring(0, 2000));
  
  // Check for any visible inputs
  const inputs = await page.$$('input');
  console.log('Input count:', inputs.length);
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    console.log('Input:', type, placeholder);
  }
  
  // Check for buttons
  const buttons = await page.$$('button');
  console.log('Button count:', buttons.length);
  for (const btn of buttons) {
    const text = await btn.textContent();
    console.log('Button:', text.trim().substring(0, 50));
  }

  await browser.close();
})().catch(e => console.error('FATAL:', e.message));
