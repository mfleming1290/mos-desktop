const {test,expect}=require('@playwright/test');
const {execFileSync}=require('node:child_process');
const {sshHost}=require('./environment.cjs');

test('opaque stream settings match the server and reject parent messages',async({context})=>{
 test.skip(process.env.MOS_TEST_ACCOUNT!=='matt'||process.env.MOS_STREAM_TEST!=='1','Explicit owner stream integration run only');
 test.setTimeout(45000);
 const gpu=['nvidia','amd'].includes(process.env.MOS_STREAM_EXPECT);
 const codec=process.env.MOS_STREAM_EXPECT==='amd'?'VAAPI':'NVENC';
 const page=await context.newPage();
 const since='@'+execFileSync('ssh',[sshHost,'date','+%s'],{encoding:'utf8'}).trim();
 let settingsReceived=0;
 page.on('console',message=>{if(message.text().includes('Dashboard received server settings'))settingsReceived++;});
 await page.goto('/_plugins/desktop/standalone/standalone.html');
 await page.getByText('Runtime ready',{exact:true}).waitFor();
 await page.getByRole('button',{name:'New Personal Stream',exact:true}).click();
 const article=page.getByRole('article',{name:'Personal Stream',exact:true}).last();
 try{
  await article.getByRole('button',{name:'Take stream input control',exact:true}).click();
  await expect.poll(()=>settingsReceived).toBeGreaterThan(0);
  const frame=page.frames().find(f=>f.url().includes('/desktop-stream/'));
  await frame.getByRole('button',{name:'Video Settings',exact:true}).press('Enter');
  await expect(frame.locator('#framerateSlider')).toHaveValue('60');
  if(gpu){
   await expect(frame.getByText('Video CRF (25):',{exact:true})).toBeVisible();
   await expect(frame.locator('#jpegQualitySlider')).toHaveCount(0);
   await article.getByRole('button',{name:'Maximize',exact:true}).click();
   await expect.poll(async()=>{
    const box=await frame.locator('#overlayInput').boundingBox();
    return Math.abs(box.width/box.height-1280/720);
   }).toBeLessThan(.01);
  }else{
   await expect(frame.locator('#jpegQualitySlider')).toHaveValue('40');
   await expect(frame.locator('#paintOverJpegQualitySlider')).toHaveValue('90');
   await expect(frame.getByText('Video CRF (25):',{exact:true})).toHaveCount(0);
  }
  expect(await frame.evaluate(()=>{try{void parent.localStorage;return false;}catch{return true;}})).toBe(true);
  const before=settingsReceived;
  // Negative boundary probe: a parent cannot impersonate Selkies self-messages.
  await article.locator('iframe').evaluate(iframe=>iframe.contentWindow.postMessage({type:'serverSettings',payload:{encoder:{allowed:['h264enc'],value:'h264enc'}}},'*'));
  await page.waitForTimeout(200);
  expect(settingsReceived).toBe(before);
  const logs=()=>execFileSync('ssh',[sshHost,'lxc-attach','-n','mos-desktop','--','journalctl','-u','mos-desktop-stream','--since='+since,'--no-pager'],{encoding:'utf8'});
  // Verify the backend applied the connection defaults, not only their UI values.
  await expect.poll(()=>gpu?
   new RegExp('Zero-copy capture:.*rendered on.*encoded in place on '+codec).test(logs())&&new RegExp('FPS: 60.0.*H264 \\('+codec+'\\)').test(logs()):
   /settings applied.*jpeg.*60 fps.*software encoding/.test(logs())).toBe(true);
  await frame.getByRole('button',{name:'Screen Settings',exact:true}).press('Enter');
  await expect(frame.getByTitle('Use canvas cursor rendering (Paint to canvas)',{exact:true})).toBeVisible();
 }finally{
  await article.getByRole('button',{name:'Disconnect stream',exact:true}).click({timeout:2000}).catch(()=>{});
  await page.close();
 }
});

test('scoped stream input ownership, native save and view recovery',async({context})=>{
 test.skip(process.env.MOS_TEST_ACCOUNT!=='matt'||process.env.MOS_STREAM_TEST!=='1','Explicit owner stream integration run only');
 test.setTimeout(90000);
 const views=[];
 const nativeRead=path=>{try{return execFileSync('ssh',[sshHost,'lxc-attach','-n','mos-desktop','--','runuser','-u','matt','--','cat',path],{encoding:'utf8',stdio:['ignore','pipe','pipe']});}catch(error){if(error.status===1&&String(error.stderr).includes('No such file or directory'))return '';throw error;}};
 const applicationPid=()=>execFileSync('ssh',[sshHost,'lxc-attach','-n','mos-desktop','--','pgrep','-u','matt','-x','xedit'],{encoding:'utf8'}).trim();
 const originalPid=applicationPid();
 async function nativeClick(view,x,y){
  const input=view.frame.locator('#overlayInput');
  if(['nvidia','amd'].includes(process.env.MOS_STREAM_EXPECT)){
   // Read geometry only; real mouse events still cross the streamed UI boundary.
   const box=await input.boundingBox();
   const scale=Math.min(box.width/1280,box.height/720);
   await input.click({position:{x:(box.width-1280*scale)/2+x*scale,y:(box.height-720*scale)/2+y*scale}});
  }else await input.click({position:{x,y}});
  await view.page.waitForTimeout(150);
 }
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
  await nativeClick(viewer,160,220);
  await viewer.page.keyboard.type('FORBIDDEN_VIEWER_INPUT',{delay:20});
  await nativeClick(controller,160,220);
  await controller.page.keyboard.press('Control+e');
  await controller.page.waitForTimeout(150);
  const marker='stream-role-'+Date.now(),path=['','home','matt',marker+'.txt'].join('/');
  await controller.page.keyboard.type(marker,{delay:20});
  await nativeClick(controller,210,52);
  await controller.page.keyboard.press('Control+a');await controller.page.keyboard.press('Control+k');
  await controller.page.waitForTimeout(150);
  await controller.page.keyboard.type(path,{delay:20});
  await controller.page.waitForTimeout(150);
  await nativeClick(controller,80,52);
  await expect.poll(()=>nativeRead(path)).toContain(marker);
  expect(nativeRead(path)).not.toContain('FORBIDDEN_VIEWER_INPUT');
  await viewer.article.getByRole('button',{name:'Take stream input control',exact:true}).click();
  await viewer.page.waitForTimeout(2500);
  viewer.frame=viewer.page.frames().find(f=>f.url().includes('/desktop-stream/'));
  await expect(controller.article.locator('[role=status]')).toContainText('view only',{timeout:12000});
  await controller.page.waitForTimeout(1500);
  controller.frame=controller.page.frames().find(f=>f.url().includes('/desktop-stream/'));
  await nativeClick(controller,160,220);
  await controller.page.keyboard.type('FORBIDDEN_OLD_CONTROLLER',{delay:20});
  await nativeClick(viewer,160,220);
  await viewer.page.keyboard.type('TAKEOVER_ACCEPTED',{delay:20});
  await viewer.page.waitForTimeout(150);
  await nativeClick(viewer,80,52);
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
