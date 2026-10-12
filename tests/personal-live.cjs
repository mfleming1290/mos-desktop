// Explicit opt-in: creates a uniquely named canary file and its own terminal.
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { authFile, baseURL } = require('./e2e/environment.cjs');
if (process.env.MOS_TEST_ACCOUNT !== 'matt') throw new Error('Select the dedicated matt test account');
let stage = 'launch';
const presentation=process.env.MOS_TEST_PRESENTATION==='standalone'
  ? '/_plugins/desktop/standalone/standalone.html' : '/plugins/desktop';
(async () => {
  const browser = await chromium.launch();
  let context, terminal, page, sessionCreated = false;
  try {
    context = await browser.newContext({ storageState: authFile });
    page = await context.newPage();
    await page.goto(baseURL + presentation);
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
    stage = 'Save';
    await home.getByLabel('Plain-text preview / new document').fill(text + ' saved');
    await home.getByRole('button', { name: 'Save opened file', exact: true }).click();
    await home.getByText('Document saved', { exact: true }).waitFor();
    await file.click();
    await home.getByText('Document opened', { exact: true }).waitFor();
    assert.equal(await home.getByLabel('Plain-text preview / new document').inputValue(), text + ' saved');
    const secondPage = await context.newPage();
    // The other presentation must observe the same backend file and conflicts.
    await secondPage.goto(baseURL + (presentation==='/plugins/desktop'
      ? '/_plugins/desktop/standalone/standalone.html' : '/plugins/desktop'));
    await secondPage.getByText('Runtime ready', { exact: true }).waitFor();
    await secondPage.getByRole('button', { name: 'New Personal Home', exact: true }).click();
    const other = secondPage.getByRole('article', { name: 'Personal Home', exact: true }).last();
    await other.getByRole('button', { name: 'Refresh Home', exact: true }).click();
    await other.getByRole('button', { name: filename + ' (file)', exact: true }).click();
    await other.getByText('Document opened', { exact: true }).waitFor();
    await other.getByLabel('Plain-text preview / new document').fill('second view update');
    await other.getByRole('button', { name: 'Save opened file', exact: true }).click();
    await other.getByText('Document saved', { exact: true }).waitFor();
    await secondPage.close();
    await home.getByLabel('Plain-text preview / new document').fill('retained stale edit');
    await home.getByRole('button', { name: 'Save opened file', exact: true }).click();
    await home.getByText('conflict', { exact: true }).waitFor();
    assert.equal(await home.getByLabel('Plain-text preview / new document').inputValue(), 'retained stale edit');
    stage = 'shared editor';
    await page.getByRole('button', { name: 'New Personal Editor', exact: true }).click();
    const editor = page.getByRole('article', { name: 'Personal Editor', exact: true }).last();
    stage = 'editor Open';
    await editor.getByLabel('Personal file path').fill(filename);
    await editor.getByRole('button', { name: 'Open file', exact: true }).click();
    await editor.getByText('Document opened', { exact: true }).waitFor();
    stage = 'editor initial content';
    assert((await editor.locator('.cm-content').innerText()).includes('second view update'));
    await editor.locator('.cm-content').fill('saved from installed shared editor');
    stage = 'editor Save';
    await editor.getByRole('button', { name: 'Save document', exact: true }).click();
    await editor.getByText('Document saved', { exact: true }).waitFor();
    stage = 'editor verify in Home';
    await page.getByRole('button', { name: 'Personal Home', exact: true }).click();
    await file.click();
    await home.getByText('Document opened', { exact: true }).waitFor();
    assert.equal(await home.getByLabel('Plain-text preview / new document').inputValue(), 'saved from installed shared editor');
    await home.getByLabel('Plain-text preview / new document').fill('external editor conflict');
    await home.getByRole('button', { name: 'Save opened file', exact: true }).click();
    await home.getByText('Document saved', { exact: true }).waitFor();
    stage = 'editor stale Save';
    await page.getByRole('button', { name: 'Personal Editor', exact: true }).last().click();
    await editor.locator('.cm-content').fill('editor conflict retained');
    await editor.getByRole('button', { name: 'Save document', exact: true }).click();
    await editor.getByText('conflict', { exact: true }).waitFor();
    assert((await editor.locator('.cm-content').innerText()).includes('editor conflict retained'));
    stage = 'editor Save As';
    await editor.getByLabel('Personal file path').fill(filename + '.copy');
    await editor.getByRole('button', { name: 'Save document as', exact: true }).click();
    await editor.getByText('Document saved', { exact: true }).waitFor();
    stage = 'editor reopen copy';
    await editor.getByRole('button', { name: 'Open file', exact: true }).click();
    await editor.getByText('Document opened', { exact: true }).waitFor();
    assert((await editor.locator('.cm-content').innerText()).includes('editor conflict retained'));
    await editor.getByRole('button', { name: 'Close', exact: true }).click();
    stage = 'terminal';
    await page.getByRole('button', { name: 'New Personal Terminal', exact: true }).click();
    terminal = page.getByRole('article', { name: 'Personal Terminal', exact: true }).last();
    await terminal.getByRole('button', { name: 'New terminal session', exact: true }).click();
    await terminal.getByText('Connected — input enabled', { exact: true }).waitFor();
    sessionCreated = true;
    const id = await terminal.getByLabel('Terminal session').inputValue();
    await terminal.locator('.xterm-screen').click();
    stage = 'sustained terminal input';
    for(let index=0;index<480;index++){
      await page.keyboard.press('w');await page.waitForTimeout(15);
    }
    let delivered=0;
    for(let attempt=0;attempt<20;attempt++){
      delivered=((await terminal.locator('.xterm-rows').innerText()).match(/w/g)||[]).length;
      if(delivered>=480)break;await page.waitForTimeout(100);
    }
    assert(delivered>=480,'Sustained input must arrive without losing characters');
    await terminal.getByText('Connected — input enabled',{exact:true}).waitFor();
    await page.keyboard.press('Control+u');
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
    console.log('PASS installed Home and shared editor Open/Save/Save As/reopen/stale conflict, 480-key sustained terminal input/refresh/confirmed End; unique canaries retained in Home');
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
