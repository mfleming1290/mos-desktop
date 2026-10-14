// Real local browser presentation/workflow proof; authentication/service fixtures
// do not establish installed MOS or live backend acceptance.
const {chromium}=require('@playwright/test');
const {spawn}=require('node:child_process');
const {mkdirSync}=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const server=spawn(process.execPath,[path.join(__dirname,'../page/node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port','18051','--strictPort'],{cwd:path.join(__dirname,'../page'),stdio:'ignore'});
(async()=>{let browser;try{
 for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('Task-owned server failed');try{if((await fetch('http://127.0.0.1:18051/shell-test-host.html')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1400,height:1100}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.addInitScript(()=>localStorage.setItem('authToken','design-fixture'));
 await page.route('**/api/v1/auth/profile',r=>r.fulfill({json:{id:'design-fixture'}}));
 await page.route('**/desktop-api/**',r=>r.fulfill({status:403,json:{error:'denied'}}));
 await page.goto('http://127.0.0.1:18051/shell-test-host.html');await page.getByLabel('Shell status').getByText('Shell locked',{exact:true}).waitFor();
 await page.evaluate(()=>{document.body.style.fontFamily='system-ui,sans-serif';const button=document.createElement('button');button.id='outside-design';button.textContent='Outside host';button.className='ud-button';document.body.append(button);});
 const outside=await page.locator('#outside-design').evaluate(el=>({background:getComputedStyle(el).backgroundColor,radius:getComputedStyle(el).borderRadius}));assert.equal(outside.radius,'0px');
 await page.getByRole('button',{name:'New Application Library',exact:true}).click();const library=page.getByRole('article',{name:'Application Library',exact:true});
 await library.getByLabel('Search applications').fill('editor');assert.equal(await library.locator('li').count(),1);
 await library.getByRole('button',{name:'Open Personal Editor',exact:true}).click();const editor=page.getByRole('article',{name:'Personal Editor',exact:true});await editor.locator('.cm-content').fill('design retained draft');
 const id=await editor.getAttribute('data-window-id');
 const dark=await page.locator('.desktop-root').evaluate(el=>({background:getComputedStyle(el).backgroundColor,text:getComputedStyle(el).color}));assert.equal(dark.background,'rgb(34, 34, 34)');assert.equal(dark.text,'rgb(238, 238, 238)');
 const luminance=color=>{const channels=color.match(/[\d.]+/g).slice(0,3).map(v=>{const n=Number(v)/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return channels.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};
 const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 assert(contrast(dark.text,dark.background)>=4.5);
 const boundary=await editor.getByLabel('Personal file path').evaluate(el=>getComputedStyle(el).borderTopColor);assert(contrast(boundary,dark.background)>=3);
 const button=page.getByRole('button',{name:'Tile windows',exact:true});assert.equal(await button.evaluate(el=>getComputedStyle(el).borderRadius),'8px');
 await page.keyboard.press('Tab');await button.focus();assert.equal(await button.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
 await button.click();assert.equal(await editor.locator('.cm-content').innerText(),'design retained draft');assert.equal(await editor.getAttribute('data-window-id'),id);
 await page.getByRole('button',{name:'Freeform',exact:true}).click();
 await page.evaluate(()=>{document.body.style.setProperty('--v-theme-surface','250,250,250');document.body.style.setProperty('--v-theme-on-surface','25,25,25');});
 const light=await page.locator('.desktop-root').evaluate(el=>({background:getComputedStyle(el).backgroundColor,text:getComputedStyle(el).color}));assert.equal(light.background,'rgb(250, 250, 250)');assert.equal(light.text,'rgb(25, 25, 25)');assert.equal(await editor.locator('.cm-content').innerText(),'design retained draft');
 assert(contrast(light.text,light.background)>=4.5);assert(contrast(boundary,light.background)>=3);
 assert.equal(await page.locator('#outside-design').evaluate(el=>getComputedStyle(el).borderRadius),outside.radius);
 mkdirSync(path.join(__dirname,'../output/playwright'),{recursive:true});await page.screenshot({path:path.join(__dirname,'../output/playwright/design-light.png'),fullPage:true});
 await page.evaluate(()=>{document.body.style.removeProperty('--v-theme-surface');document.body.style.removeProperty('--v-theme-on-surface');});
 await page.screenshot({path:path.join(__dirname,'../output/playwright/design-dark.png'),fullPage:true});
 await page.setViewportSize({width:390,height:1000});await page.getByRole('navigation',{name:'Applications',exact:true}).getByRole('button',{name:'Application Library',exact:true}).click();await library.getByLabel('Search applications').fill('no-result-design');await library.getByText('No matching applications',{exact:true}).waitFor();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert(await library.getByLabel('Search applications').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});assert.equal(await button.evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.deepEqual(errors,[]);console.log('PASS: actual browser dark/light host binding, style isolation, focus, catalog search, retained editor identity/draft, narrow/200% text, forced colors/reduced motion');
 }finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
