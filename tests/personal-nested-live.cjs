// Owner-only installed UI canary; retains its unique restored data in Home.
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { authFile, baseURL } = require('./e2e/environment.cjs');
if (process.env.MOS_TEST_ACCOUNT !== 'matt') throw Error('Select dedicated matt account');
(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({storageState: authFile});
    const page = await context.newPage();
    page.on('dialog', dialog => dialog.accept());
    await page.goto(baseURL+'/plugins/desktop');
    await page.getByText('Runtime ready', {exact:true}).waitFor();
    await page.getByRole('button',{name:'New Personal Home',exact:true}).click();
    const home = page.getByRole('article',{name:'Personal Home',exact:true}).last();
    const folder = 'mos-nested-ui-'+Date.now();
    const create = async path => {
      await home.getByLabel('New top-level filename').fill(path);
      await home.getByRole('button',{name:'Create top-level folder',exact:true}).click();
      await home.getByText('Folder created',{exact:true}).waitFor();
    };
    await create(folder);
    await create(folder+'/child');
    await home.getByLabel('New top-level filename').fill(folder+'/child/proof.txt');
    await home.getByLabel('Plain-text preview / new document').fill('nested live proof');
    await home.getByRole('button',{name:'Save new copy',exact:true}).click();
    await home.getByText('Copy saved; original unchanged',{exact:true}).waitFor();
    await home.getByRole('button',{name:folder+' (directory)',exact:true}).click();
    await home.getByRole('button',{name:'Select child',exact:true}).click();
    await home.getByLabel('Move or rename destination').fill(folder+'/renamed');
    await home.getByRole('button',{name:'Move or rename selected',exact:true}).click();
    await home.getByText('Operation completed',{exact:true}).waitFor();
    await home.getByRole('button',{name:'renamed (directory)',exact:true}).click();
    await home.getByRole('button',{name:'proof.txt (file)',exact:true}).click();
    await home.getByText('Document opened',{exact:true}).waitFor();
    assert.equal(await home.getByLabel('Plain-text preview / new document').inputValue(),'nested live proof');
    await home.getByRole('button',{name:'Home root',exact:true}).click();
    await home.getByRole('button',{name:'Select '+folder,exact:true}).click();
    await home.getByRole('button',{name:'Trash selected',exact:true}).click();
    await home.getByText('Operation completed',{exact:true}).waitFor();
    await home.getByRole('button',{name:'Restore '+folder,exact:true}).click();
    await home.getByRole('button',{name:folder+' (directory)',exact:true}).waitFor();
    await page.reload();
    await page.getByText('Runtime ready',{exact:true}).waitFor();
    await page.getByRole('button',{name:'New Personal Home',exact:true}).click();
    const recovered=page.getByRole('article',{name:'Personal Home',exact:true}).last();
    await recovered.getByRole('button',{name:'Refresh Home',exact:true}).click();
    await recovered.getByRole('button',{name:folder+' (directory)',exact:true}).click();
    await recovered.getByRole('button',{name:'renamed (directory)',exact:true}).click();
    await recovered.getByRole('button',{name:'proof.txt (file)',exact:true}).click();
    await recovered.getByText('Document opened',{exact:true}).waitFor();
    assert.equal(await recovered.getByLabel('Plain-text preview / new document').inputValue(),'nested live proof');
    console.log('Installed nested create/write/move/trash/restore/refresh passed');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
