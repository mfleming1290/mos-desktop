import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {JSDOM} from '../page/node_modules/jsdom/lib/api.js';
const dom=new JSDOM('<div id="app"></div>',{url:'https://mos-test.invalid/plugins/desktop/'});
for(const key of ['window','document','Element','HTMLElement','SVGElement','Node'])globalThis[key]=dom.window[key];
const Vue=await import('../page/node_modules/vue/index.mjs');
globalThis.__federation_shared__={default:{vue:{[Vue.version]:{get:()=>()=>Vue,loaded:true},'3':{get:()=>()=>Vue,loaded:true}}}};
const remote=await import('../page/dist/desktop/remoteEntry.js');
const factory=await remote.get('./Plugin');
const module=factory(),Page=module.default??module;
const wasm=readFileSync(new URL('../runtime/runtime.wasm',import.meta.url));
const flush=async()=>{for(let i=0;i<10;i++){await new Promise(resolve=>setTimeout(resolve,10));await Vue.nextTick();}};
test('real WASM command and host-only Vue',async()=>{
  let requested;
  globalThis.fetch=async(url,options)=>{requested={url,options};return{ok:true,arrayBuffer:async()=>wasm.buffer.slice(wasm.byteOffset,wasm.byteOffset+wasm.byteLength)};};
  const app=Vue.createApp(Page);app.mount('#app');await flush();
  assert.match(document.body.textContent,/Runtime PASS — revision 1; workspaces 1; apps 0; windows 0/);
  assert.match(String(requested.url),/runtime-.*\.wasm$/);assert.equal(requested.options.credentials,'same-origin');
  app.unmount();assert.equal(requested.options.signal.aborted,true);
});
test('unmount aborts and ignores late asset delivery',async()=>{
  let resolve,signal,consumed=false;
  globalThis.fetch=(_url,options)=>{signal=options.signal;return new Promise(done=>{resolve=done;});};
  const app=Vue.createApp(Page);app.mount('#app');await Vue.nextTick();app.unmount();assert.equal(signal.aborted,true);
  resolve({ok:true,arrayBuffer:async()=>{consumed=true;return wasm;}});
  await flush();assert.equal(document.querySelector('#app').textContent,'');assert.equal(consumed,false);
});
test('missing or malformed WASM reports unavailable',async()=>{
  for(const response of [{ok:false},{ok:true,arrayBuffer:async()=>new Uint8Array([0]).buffer}]){
    globalThis.fetch=async()=>response;const app=Vue.createApp(Page);app.mount('#app');await flush();
    assert.match(document.body.textContent,/Runtime unavailable/);assert.doesNotMatch(document.body.textContent,/Runtime PASS/);app.unmount();
  }
});
test('missing host Vue rejects without a bundled fallback',()=>{
  const entry=new URL('../page/dist/desktop/remoteEntry.js',import.meta.url);
  const result=spawnSync(process.execPath,['--input-type=module','--eval',`import assert from 'node:assert/strict';const remote=await import(${JSON.stringify(entry.href)});await assert.rejects(async()=>{const factory=await remote.get('./Plugin');factory();});`],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
});
