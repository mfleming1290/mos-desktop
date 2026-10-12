// Explicit opt-in: creates a uniquely named canary file and its own terminal.
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { authFile, baseURL } = require('./e2e/environment.cjs');
if (process.env.MOS_TEST_ACCOUNT !== 'matt') throw new Error('Select the dedicated matt test account');
let stage = 'launch';
(async () => {
  const browser = await chromium.launch();
  let context, terminal, page, sessionCreated = false;
  try {
    context = await browser.newContext({ storageState: authFile });
    page = await context.newPage();
    await page.goto(baseURL + '/plugins/desktop');
    await page.getByText('Runtime ready', { exact: true }).waitFor();
    stage = 'Home';
    await page.getByRole('button', { name: 'New Personal Home', exact: true }).click();
    const home = page.getByRole('article', { name: 'Personal Home', exact: true });
    await home.getByRole('button', { name: 'Refresh Home', exact: true }).click();
    await home.getByText('Home directory loaded', { exact: true }).waitFor();
    const filename = 'mos-desktop-ui-' + Date.now() + '.txt';
    const text = 'Installed MOS Desktop service canary';
    await home.getByLabel('Plain-text preview / new document').fill(text);
    await home.getByLabel('New top-level filename').fill(filename);
    await home.getByRole('button', { name: 'Save new copy', exact: true }).click();
    const file = home.getByRole('button', { name: filename + ' (file)', exact: true });
    await file.waitFor();
    await home.getByLabel('Plain-text preview / new document').fill('');
    await file.click();
    await page.waitForTimeout(250);
    assert.equal(await home.getByLabel('Plain-text preview / new document').inputValue(), text);
    stage = 'terminal';
    await page.getByRole('button', { name: 'New Personal Terminal', exact: true }).click();
    terminal = page.getByRole('article', { name: 'Personal Terminal', exact: true }).last();
    await terminal.getByRole('button', { name: 'New terminal session', exact: true }).click();
    await terminal.getByText('Connected — input enabled', { exact: true }).waitFor();
    sessionCreated = true;
    const id = await terminal.getByLabel('Terminal session').inputValue();
    await terminal.locator('.xterm-screen').click();
    await page.keyboard.type('echo live-browser-terminal');
    await page.keyboard.press('Enter');
    await page.getByText(/Layout saved/).first().waitFor();
    stage = 'refresh';
    await page.reload();
    terminal = page.getByRole('article', { name: 'Personal Terminal', exact: true }).last();
    await terminal.getByText(/Connected/).first().waitFor();
    assert.equal(await terminal.getByLabel('Terminal session').inputValue(), id);
    page.on('dialog', dialog => dialog.accept());
    await terminal.getByRole('button', { name: 'End terminal session', exact: true }).click();
    await terminal.getByText('Session ended', { exact: true }).waitFor();
    sessionCreated = false;
    console.log('PASS installed Home Save As/reopen and xterm keyboard/refresh/confirmed End; unique canary retained in Home');
  } finally {
    // Close only our view; never implicitly End an uncertain/user session.
    if (sessionCreated) console.error('Canary terminal may remain detached; no automatic destructive cleanup');
    await context?.close();
    await browser.close();
  }
})().catch(() => {
  console.error('Installed personal verification failed at ' + stage + '; sensitive details withheld');
  process.exitCode = 1;
});
