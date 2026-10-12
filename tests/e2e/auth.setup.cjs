const { test: setup, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { authFile } = require('./environment.cjs');
setup('MOS authentication in a dedicated isolated context', async ({ page, context }) => {
  // Never trace/screenshot login or print Playwright's credential-bearing call log.
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error();
    await page.locator('input[type="text"]').first().fill(process.env.MOS_TEST_USERNAME);
    await page.locator('input[type="password"]').fill(process.env.MOS_TEST_PASSWORD);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeHidden({ timeout: 15000 });
    await page.goto('/plugins/desktop');
    await page.getByRole('heading', { name: 'MOS Desktop', exact: true }).waitFor();
    await page.getByText('Runtime ready', { exact: true }).waitFor();
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    await context.storageState({ path: authFile });
    fs.chmodSync(authFile, 0o600);
  } catch {
    throw new Error('MOS login/setup failed; credentials and private network details withheld. Check reachability, test account and installed plugin.');
  }
});
