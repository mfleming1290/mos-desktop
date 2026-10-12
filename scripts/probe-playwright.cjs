// No credentials, response bodies, cookies or auth headers are printed.
const { chromium } = require('@playwright/test');
const { baseURL } = require('../tests/e2e/environment.cjs');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    console.log('MOS reachable:', response?.status());
    await page.locator('input').first().waitFor({ timeout: 15000 });
    console.log('Login controls:', await page.locator('input').evaluateAll(nodes => nodes.map(n => ({type:n.type, name:n.name, placeholder:n.placeholder, id:n.id}))));
    console.log('Buttons:', await page.getByRole('button').allTextContents());
    await page.locator('input[type="text"]').first().fill(process.env.MOS_TEST_USERNAME);
    await page.locator('input[type="password"]').fill(process.env.MOS_TEST_PASSWORD);
    page.on('response', r => { if (new URL(r.url()).pathname.includes('/auth/')) console.log('Auth HTTP status:', r.status()); });
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForTimeout(3000);
    console.log('Login still visible:', await page.getByRole('button', { name: 'Login', exact: true }).isVisible());
    await page.goto(new URL('/plugins/desktop', baseURL).href);
    await page.waitForTimeout(4000);
    console.log('Desktop heading count:', await page.getByRole('heading', { name: 'MOS Desktop', exact: true }).count());
    console.log('Runtime ready count:', await page.getByText('Runtime ready', { exact: true }).count());
    console.log('Plugin error count:', await page.getByText('Plugin Error', { exact: true }).count());
  } finally { await browser.close(); }
})().catch(() => { console.error('Reachability/login-form probe failed (details withheld to protect private URL).'); process.exitCode = 1; });
