// Isolated local browser proof with an explicit service fixture; not live MOS admission.
const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const path=require('node:path');
const server=spawn(process.execPath,[path.join(__dirname,'../page/node_modules/vite/bin/vite.js'),
  '--host','127.0.0.1','--port','18046','--strictPort'],{cwd:path.join(__dirname,'../page'),stdio:'ignore'});
(async()=>{
  let ready=false;
  for(let attempt=0;attempt<100;attempt++){
    if(server.exitCode!==null)throw new Error('Owned test server failed; no unrelated server reused');
    try{ready=(await fetch('http://127.0.0.1:18046/test-host.html')).ok;}catch{}
    if(ready)break;await new Promise(resolve=>setTimeout(resolve,100));
  }
  if(!ready)throw new Error('Owned local test server did not start');
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext();
  const page=await context.newPage();
  page.on('pageerror',error=>console.error('Local fixture page error:',error.message));
  const calls=[],files=new Map(),sessions=[];
  let ended=0;
  await page.addInitScript(()=>localStorage.setItem('authToken','isolated-fixture-not-a-MOS-credential'));
  await page.route('**/desktop-api/v1/operation',async route=>{
    const {operation,args}=route.request().postDataJSON();calls.push({operation,args});
    let value={},status=200;
    if(operation==='list')value={entries:[...files].map(([name,data])=>({name,kind:'file',size:data.length})),next:null};
    else if(operation==='write'){
      if(args.expected===null ? files.has(args.path) : args.expected!=='fixture-version' || !files.has(args.path)){status=409;value={error:'conflict'};}
      else {files.set(args.path,args.data);value={version:'fixture-version'};}
    }else if(operation==='read')value={data:files.get(args.path),version:'fixture-version'};
    else if(operation==='terminal.list')value={sessions:sessions.map(id=>({id,generation:'fixture-generation',exited:false}))};
    else if(operation==='terminal.create'){sessions.push('fixture-session');value={id:'fixture-session',generation:'fixture-generation'};}
    else if(operation==='terminal.attach')value={controller:true,exited:false};
    else if(operation==='terminal.output')value={sequence:1,gap:false,exited:false,data:args.after===0?Buffer.from('TERMINAL_READY\r\n').toString('base64'):''};
    else if(operation==='terminal.input')value={acceptedBytes:Buffer.from(args.data,'base64').length};
    else if(operation==='terminal.end'){ended++;value={exited:true};}
    await route.fulfill({status,json:value});
  });
  try{
    await page.goto('http://127.0.0.1:18046/test-host.html');
    await page.getByText('Runtime ready',{exact:true}).waitFor();
    await page.getByRole('button',{name:'New Personal Home',exact:true}).click();
    const home=page.getByRole('article',{name:'Personal Home',exact:true});
    await home.getByLabel('Plain-text preview / new document').fill('saved through actual browser');
    await home.getByLabel('New top-level filename').fill('browser-proof.txt');
    await home.getByRole('button',{name:'Save new copy',exact:true}).click();
    await home.getByRole('button',{name:'browser-proof.txt (file)',exact:true}).waitFor();
    assert.equal(Buffer.from(files.get('browser-proof.txt'),'base64').toString(),'saved through actual browser');
    await home.getByLabel('Plain-text preview / new document').fill('must not overwrite');
    await home.getByRole('button',{name:'Save new copy',exact:true}).click();
    await home.getByText('conflict',{exact:true}).waitFor();
    assert.equal(Buffer.from(files.get('browser-proof.txt'),'base64').toString(),'saved through actual browser');
    await home.getByRole('button',{name:'Save opened file',exact:true}).click();
    await home.getByText('Document saved',{exact:true}).waitFor();
    assert.equal(Buffer.from(files.get('browser-proof.txt'),'base64').toString(),'must not overwrite');
    files.delete('browser-proof.txt');
    await home.getByLabel('Plain-text preview / new document').fill('keep this unsaved edit');
    await home.getByRole('button',{name:'Save opened file',exact:true}).click();
    await home.getByText('conflict',{exact:true}).waitFor();
    assert.equal(await home.getByLabel('Plain-text preview / new document').inputValue(),'keep this unsaved edit');
    await home.getByRole('button',{name:'Close',exact:true}).click();
    await page.getByRole('button',{name:'New Personal Terminal',exact:true}).click();
    let terminal=page.getByRole('article',{name:'Personal Terminal',exact:true});
    await terminal.getByRole('button',{name:'New terminal session',exact:true}).click();
    await terminal.getByText('Connected — input enabled',{exact:true}).waitFor();
    await terminal.locator('.xterm-screen').click();
    await page.keyboard.type('echo browser-input');await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    assert(calls.filter(c=>c.operation==='terminal.input').map(c=>Buffer.from(c.args.data,'base64').toString()).join('').includes('echo browser-input'));
    await page.getByText(/Layout saved/).first().waitFor();
    await page.reload();
    terminal=page.getByRole('article',{name:'Personal Terminal',exact:true});
    await terminal.getByText('Connected — input enabled',{exact:true}).waitFor();
    assert.equal(sessions.length,1);assert.equal(await terminal.getByLabel('Terminal session').inputValue(),'fixture-session');
    await terminal.getByRole('button',{name:'Close',exact:true}).click();
    await page.waitForTimeout(100);
    assert.equal(ended,0);assert(calls.some(c=>c.operation==='terminal.detach'));
    await page.getByRole('button',{name:'New Personal Terminal',exact:true}).click();
    terminal=page.getByRole('article',{name:'Personal Terminal',exact:true});
    await terminal.getByLabel('Terminal session').selectOption('fixture-session');
    await terminal.getByText('Connected — input enabled',{exact:true}).waitFor();
    assert.equal(sessions.length,1);
    page.on('dialog',dialog=>dialog.accept());
    await terminal.getByRole('button',{name:'End terminal session',exact:true}).click();
    await terminal.getByText('Session ended',{exact:true}).waitFor();assert.equal(ended,1);
    console.log('PASS local real-browser Home Save As/conflict and xterm keyboard/detach/reattach/explicit end; fixture service only');
  }catch(error){console.error(await page.locator('body').innerText());throw error;
  }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>server.kill());
