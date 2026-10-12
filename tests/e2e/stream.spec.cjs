const {test,expect}=require('@playwright/test');
const {execFileSync}=require('node:child_process');

test('scoped stream input ownership, native save and view recovery',async({context})=>{
 test.skip(process.env.MOS_TEST_ACCOUNT!=='matt'||process.env.MOS_STREAM_TEST!=='1','Explicit owner stream integration run only');
 test.setTimeout(90000);
 const views=[];
 const nativeRead=path=>execFileSync('ssh',['root@mos','lxc-attach','-n','mos-desktop','--','runuser','-u','matt','--','cat',path],{encoding:'utf8'});
 const applicationPid=()=>execFileSync('ssh',['root@mos','lxc-attach','-n','mos-desktop','--','pgrep','-u','matt','-x','xedit'],{encoding:'utf8'}).trim();
 const originalPid=applicationPid();
 async function attach(takeover){
  const page=await context.newPage();await page.goto('/_plugins/desktop/standalone/standalone.html');
  await page.getByText('Runtime ready',{exact:true}).waitFor();
  await page.getByRole('button',{name:'New Personal Stream',exact:true}).click();
  const article=page.getByRole('article',{name:'Personal Stream',exact:true}).last();
  await article.getByRole('button',{name:takeover?'Take stream input control':'Connect stream',exact:true}).click();
  await page.waitForTimeout(2500);
  const value={page,article,frame:page.frames().find(f=>f.url().includes('/desktop-stream/'))};
  expect(value.frame).toBeTruthy();await value.frame.locator('#overlayInput').waitFor({state:'visible'});
  views.push(value);return value;
 }
 try{
  const controller=await attach(true),viewer=await attach(false);
  expect(await controller.frame.evaluate(()=>{try{void parent.localStorage;return false;}catch{return true;}})).toBe(true);
  const capability=controller.frame.url();
  expect((await context.request.get(capability+'api/commands')).status()).toBe(403);
  expect((await context.request.get(capability+'api/status',{headers:{Origin:'https://unrelated.invalid'}})).status()).toBe(403);
  await expect(viewer.article.locator('[role=status]')).toContainText('view only');
  await viewer.frame.locator('#overlayInput').click({position:{x:160,y:220}});
  await viewer.page.keyboard.type('FORBIDDEN_VIEWER_INPUT');
  await controller.frame.locator('#overlayInput').click({position:{x:160,y:220}});
  await controller.page.keyboard.press('Control+e');
  const marker='stream-role-'+Date.now(),path=['','home','matt',marker+'.txt'].join('/');
  await controller.page.keyboard.type(marker);
  await controller.frame.locator('#overlayInput').click({position:{x:210,y:52}});
  await controller.page.keyboard.press('Control+a');await controller.page.keyboard.press('Control+k');
  await controller.page.keyboard.type(path);
  await controller.frame.locator('#overlayInput').click({position:{x:80,y:52}});
  await expect.poll(()=>nativeRead(path)).toContain(marker);
  expect(nativeRead(path)).not.toContain('FORBIDDEN_VIEWER_INPUT');
  await viewer.article.getByRole('button',{name:'Take stream input control',exact:true}).click();
  await viewer.page.waitForTimeout(2500);
  viewer.frame=viewer.page.frames().find(f=>f.url().includes('/desktop-stream/'));
  await expect(controller.article.locator('[role=status]')).toContainText('view only',{timeout:12000});
  await controller.page.waitForTimeout(1500);
  controller.frame=controller.page.frames().find(f=>f.url().includes('/desktop-stream/'));
  await controller.frame.locator('#overlayInput').click({position:{x:160,y:220}});
  await controller.page.keyboard.type('FORBIDDEN_OLD_CONTROLLER');
  await viewer.frame.locator('#overlayInput').click({position:{x:160,y:220}});
  await viewer.page.keyboard.type('TAKEOVER_ACCEPTED');
  await viewer.frame.locator('#overlayInput').click({position:{x:80,y:52}});
  await expect.poll(()=>nativeRead(path)).toContain('TAKEOVER_ACCEPTED');
  expect(nativeRead(path)).not.toContain('FORBIDDEN_OLD_CONTROLLER');
  await viewer.article.getByRole('button',{name:'Disconnect stream',exact:true}).click();
  // Detach traverses the same authenticated request pacing as other operations.
  await expect.poll(async()=>(await context.request.get(viewer.frame.url())).status()).toBe(403);
  expect(applicationPid()).toBe(originalPid);
  await viewer.article.getByRole('button',{name:'Take stream input control',exact:true}).click();
  await viewer.page.waitForTimeout(2000);
  expect(applicationPid()).toBe(originalPid);
  await context.setOffline(true);await viewer.page.waitForTimeout(9000);
  await context.setOffline(false);
  await viewer.article.getByRole('button',{name:'Take stream input control',exact:true}).click();
  await viewer.page.waitForTimeout(2000);
  expect(applicationPid()).toBe(originalPid);
  await viewer.page.reload();await viewer.page.getByText('Runtime ready',{exact:true}).waitFor();
  // The second browser tab is intentionally not the layout writer. Recovery
  // reopens a view through the launcher if its temporary layout was discarded.
  if(!await viewer.page.getByRole('article',{name:'Personal Stream',exact:true}).count()){
   await viewer.page.getByRole('button',{name:'New Personal Stream',exact:true}).click();
  }
  viewer.article=viewer.page.getByRole('article',{name:'Personal Stream',exact:true}).last();
  await viewer.article.getByRole('button',{name:'Take stream input control',exact:true}).click();
  await viewer.page.waitForTimeout(2000);
  await expect(viewer.article.locator('iframe')).toBeVisible();
  expect(applicationPid()).toBe(originalPid);
 }finally{
  for(const view of views){await view.article.getByRole('button',{name:'Disconnect stream',exact:true}).click({timeout:2000}).catch(()=>{});await view.page.close();}
 }
});
