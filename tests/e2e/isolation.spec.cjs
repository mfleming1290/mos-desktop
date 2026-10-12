const { test, expect } = require('@playwright/test');
const { baseURL } = require('./environment.cjs');

test('a clean browser cannot inherit the dedicated authenticated session', async ({ browser }) => {
  const isolated = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  try {
    const response = await isolated.request.get('/api/v1/auth/profile');
    expect([401, 403]).toContain(response.status());
    const page = await isolated.newPage();
    await page.goto('/plugins/desktop');
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'MOS Desktop', exact: true })).toHaveCount(0);
  } finally {
    await isolated.close();
  }
});

test('standalone uses MOS authentication and refuses a clean browser', async ({browser,page})=>{
  const route='/_plugins/desktop/standalone/standalone.html';
  await page.goto(route);
  await expect(page.getByText('Runtime ready',{exact:true})).toBeVisible();
  const isolated=await browser.newContext({baseURL,storageState:{cookies:[],origins:[]}});
  try{
    const denied=await isolated.newPage();await denied.goto(route);
    await expect(denied.getByRole('link',{name:'Open MOS login',exact:true})).toBeVisible();
    await expect(denied.getByText('Runtime ready',{exact:true})).toHaveCount(0);
    await expect(denied.getByRole('button',{name:'New Personal Terminal',exact:true})).toHaveCount(0);
  }finally{await isolated.close();}
});
