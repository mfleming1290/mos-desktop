import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {JSDOM} from '../page/node_modules/jsdom/lib/api.js';
const dom=new JSDOM('<div id="app"></div>',{url:'https://mos-test.invalid/plugins/desktop/',pretendToBeVisual:true});
for(const key of ['window','document','Element','HTMLElement','SVGElement','Node'])globalThis[key]=dom.window[key];
globalThis.ResizeObserver=class {observe(){} disconnect(){}};
const Vue=await import('../page/node_modules/vue/index.mjs');
globalThis.__federation_shared__={default:{vue:{[Vue.version]:{get:()=>()=>Vue,loaded:true},'3':{get:()=>()=>Vue,loaded:true}}}};
const remote=await import('../page/dist/desktop/remoteEntry.js');
const factory=await remote.get('./Plugin');
const module=factory(),Page=module.default??module;
const wasm=readFileSync(new URL('../runtime/runtime.wasm',import.meta.url));
const flush=async()=>{for(let i=0;i<10;i++){await new Promise(resolve=>setTimeout(resolve,10));await Vue.nextTick();}};
test('built LXC panel reads once, pauses hidden work, rejects late data and closes without mutations', async () => {
  const before = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = dom.window.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: storage}); storage.setItem('authToken', 'fixture-admin');
  let requests = [], late;
  globalThis.fetch = async (url, options) => {
    if (String(url) === '/api/v1/auth/profile') return {ok: true, json: async () => ({id: 'admin'})};
    if (String(url).includes('/lxc/')) {
      requests.push(options); assert.equal(options.method, 'GET');
      if (requests.length > 1) return new Promise(resolve => {late = resolve;});
      return {ok: true, json: async () => [{name: 'test-lxc', state: 'running', unprivileged: true}]};
    }
    return {ok: true, arrayBuffer: async () => wasm};
  };
  const app = Vue.createApp(Page);
  try {
    app.mount('#app'); await flush();
    [...document.querySelectorAll('nav button')].find(b => b.textContent === 'New MOS LXC Status').click(); await flush();
    assert.match(document.body.textContent, /test-lxc — running/); assert.equal(requests.length, 1);
    const frame = document.querySelector('article');
    frame.querySelector('[aria-label="Minimize"]').click(); await flush();
    assert.match(frame.textContent, /Paused while hidden/); assert.doesNotMatch(frame.textContent, /test-lxc/);
    [...document.querySelectorAll('nav button')].find(b => b.textContent.includes('(minimized)')).click(); await flush();
    assert.equal(requests.length, 2);
    frame.querySelector('[aria-label="Close"]').click(); await flush(); assert.equal(requests[1].signal.aborted, true);
    late({ok: true, json: async () => [{name: 'late-lxc', state: 'running', unprivileged: true}]}); await flush();
    assert.equal(document.querySelectorAll('article').length, 0); assert.doesNotMatch(document.body.textContent, /late-lxc/);
  } finally {app.unmount(); storage.removeItem('authToken'); if (before) Object.defineProperty(globalThis, 'localStorage', before); else delete globalThis.localStorage;}
});
test('built backend controls require confirmation and exclude old and unrelated container names', async () => {
  const before = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = dom.window.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: storage});
  storage.setItem('authToken', 'fixture-admin');
  const mutations = [];
  globalThis.fetch = async (url, options) => {
    if (String(url) === '/api/v1/auth/profile') return {ok: true, json: async () => ({id: 'admin'})};
    if (options.method === 'POST') {mutations.push(String(url)); return {ok: true};}
    if (String(url).includes('/lxc/')) return {ok: true, json: async () => ['mos-desktop', 'testit', 'code'].map(name => ({name, state: 'running', unprivileged: true}))};
    return {ok: true, arrayBuffer: async () => wasm};
  };
  const app = Vue.createApp(Page);
  const button = label => [...document.querySelectorAll('button')].find(b => b.textContent === label);
  try {
    app.mount('#app'); await flush(); button('New MOS LXC Status').click(); await flush();
    assert(!button('Stop testit…')); assert(!button('Stop code…'));
    button('Stop mos-desktop…').click(); await flush(); assert.equal(mutations.length, 0);
    assert.match(document.body.textContent, /Stopping ends its running applications/);
    button('Cancel').click(); await flush(); assert.equal(mutations.length, 0);
    button('Stop mos-desktop…').click(); await flush(); button('Confirm mos-desktop operation').click(); await flush();
    assert.deepEqual(mutations, ['/api/v1/lxc/containers/mos-desktop/stop']);
    document.querySelector('[aria-label="Close"]').click(); await flush(); assert.equal(mutations.length, 1);
  } finally {
    app.unmount(); storage.removeItem('authToken');
    if (before) Object.defineProperty(globalThis, 'localStorage', before); else delete globalThis.localStorage;
  }
});
test('HTTP-compatible crypto supports startup and distinct app identities without randomUUID', async () => {
  const before = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const secure = globalThis.crypto;
  Object.defineProperty(globalThis, 'crypto', {configurable: true, value: {getRandomValues: secure.getRandomValues.bind(secure)}});
  globalThis.fetch = async () => ({ok: true, arrayBuffer: async () => wasm});
  const app = Vue.createApp(Page);
  try {
    app.mount('#app'); await flush(); assert.match(document.body.textContent, /Runtime ready/);
    for (let i = 0; i < 2; i++) {[...document.querySelectorAll('nav button')].find(b => b.textContent === 'New Clock').click(); await flush();}
    const ids = [...document.querySelectorAll('article')].map(el => el.dataset.windowId);
    assert.equal(ids.length, 2); assert.equal(new Set(ids).size, 2);
  } finally {app.unmount(); Object.defineProperty(globalThis, 'crypto', before);}
});
test('wide workspace restores corners and autosaves completed drags without a save button', async () => {
  const proto = dom.window.HTMLElement.prototype;
  const width = Object.getOwnPropertyDescriptor(proto, 'clientWidth'), height = Object.getOwnPropertyDescriptor(proto, 'clientHeight');
  const nav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(proto, 'clientWidth', {configurable: true, get: () => 2000});
  Object.defineProperty(proto, 'clientHeight', {configurable: true, get: () => 1000});
  Object.defineProperty(globalThis, 'navigator', {configurable: true, value: {locks: {request: (_key, _options, cb) => cb({})}}});
  const key = 'mos-desktop:layout:1:corner-test';
  dom.window.localStorage.setItem(key, JSON.stringify({schemaVersion: 1, scope: 'corner-test', focused: 'old', windows: [
    {key: 'old', definitionId: 'clock', bounds: {x: 1550, y: 580, width: 340, height: 220}, presentation: 'normal', visible: true, config: {locale: 'en-GB', timeZone: 'UTC', seconds: true, hour12: false}},
  ]}));
  globalThis.fetch = async () => ({ok: true, arrayBuffer: async () => wasm});
  const app = Vue.createApp(Page, {verifiedStorageScope: 'corner-test'});
  try {
    app.mount('#app'); await flush();
    assert.equal(document.querySelector('article').style.left, '1550px');
    assert.equal(document.querySelector('article').style.top, '580px');
    assert(![...document.querySelectorAll('button')].some(b => b.textContent === 'Save layout'));
    const header = document.querySelector('article header'); let captured = false;
    header.setPointerCapture = () => {captured = true;}; header.hasPointerCapture = () => captured;
    header.releasePointerCapture = () => {captured = false;};
    const pointer = (type, x) => {const event = new dom.window.MouseEvent(type, {button: 0, clientX: x, clientY: 10, bubbles: true, cancelable: true}); Object.defineProperty(event, 'pointerId', {value: 1}); header.dispatchEvent(event);};
    pointer('pointerdown', 10); await flush(); pointer('pointermove', 50); await Vue.nextTick();
    assert.equal(JSON.parse(dom.window.localStorage.getItem(key)).windows[0].bounds.x, 1550);
    pointer('pointerup', 50); await flush();
    assert.match(document.body.textContent, /Layout saved \(#/);
    assert.equal(JSON.parse(dom.window.localStorage.getItem(key)).windows[0].bounds.x, 1590);
    pointer('pointerdown', 10); pointer('pointermove', 30); await Vue.nextTick();
    header.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key: 'Escape', bubbles: true})); await flush();
    assert.equal(JSON.parse(dom.window.localStorage.getItem(key)).windows[0].bounds.x, 1590);
    const handle = document.querySelector('.resize-handle');
    handle.setPointerCapture = header.setPointerCapture; handle.hasPointerCapture = header.hasPointerCapture; handle.releasePointerCapture = header.releasePointerCapture;
    for (const [type, x] of [['pointerdown', 10], ['pointermove', 50], ['pointerup', 50]]) {
      const event = new dom.window.MouseEvent(type, {button: 0, clientX: x, clientY: 10, bubbles: true, cancelable: true});
      Object.defineProperty(event, 'pointerId', {value: 2}); handle.dispatchEvent(event);
    }
    await flush(); assert.equal(JSON.parse(dom.window.localStorage.getItem(key)).windows[0].bounds.width, 380);
  } finally {
    app.unmount(); dom.window.localStorage.removeItem(key);
    if (width) Object.defineProperty(proto, 'clientWidth', width); else delete proto.clientWidth;
    if (height) Object.defineProperty(proto, 'clientHeight', height); else delete proto.clientHeight;
    if (nav) Object.defineProperty(globalThis, 'navigator', nav); else delete globalThis.navigator;
  }
});
test('failed autosave preserves the record and exposes a working retry only after failure', async () => {
  const nav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {configurable: true, value: {locks: {request: (_key, _options, cb) => cb({})}}});
  const proto = dom.window.Storage.prototype, original = proto.setItem;
  const key = 'mos-desktop:layout:1:retry-test'; let denied = true;
  proto.setItem = function(k, v) {if (k === key && denied) throw Error('quota'); return original.call(this, k, v);};
  globalThis.fetch = async () => ({ok: true, arrayBuffer: async () => wasm});
  const app = Vue.createApp(Page, {verifiedStorageScope: 'retry-test'});
  try {
    app.mount('#app'); await flush();
    assert(![...document.querySelectorAll('button')].some(b => b.textContent === 'Retry autosave'));
    [...document.querySelectorAll('nav button')].find(b => b.textContent === 'New Clock').click();
    await new Promise(resolve => setTimeout(resolve, 300)); await Vue.nextTick();
    assert.equal(dom.window.localStorage.getItem(key), null);
    const retry = [...document.querySelectorAll('button')].find(b => b.textContent === 'Retry autosave'); assert(retry);
    denied = false; retry.click(); await flush();
    assert.equal(JSON.parse(dom.window.localStorage.getItem(key)).windows.length, 1);
    assert.match(document.body.textContent, /Layout saved \(#1\)/);
    assert(![...document.querySelectorAll('button')].some(b => b.textContent === 'Retry autosave'));
  } finally {
    app.unmount(); proto.setItem = original; dom.window.localStorage.removeItem(key);
    if (nav) Object.defineProperty(globalThis, 'navigator', nav); else delete globalThis.navigator;
  }
});
test('real WASM command and host-only Vue',async()=>{
  let requested;
  globalThis.fetch=async(url,options)=>{requested={url,options};return{ok:true,arrayBuffer:async()=>wasm.buffer.slice(wasm.byteOffset,wasm.byteOffset+wasm.byteLength)};};
  const app=Vue.createApp(Page);app.mount('#app');await flush();
  assert.match(document.body.textContent,/Runtime ready/);
  assert.match(String(requested.url),/runtime-.*\.wasm$/);assert.equal(requested.options.credentials,'same-origin');
  app.unmount();assert.equal(requested.options.signal.aborted,true);
});
test('unmount aborts and ignores late asset delivery',async()=>{
  let resolve,signal,consumed=false;
  globalThis.fetch=(_url,options)=>{signal=options.signal;return new Promise(done=>{resolve=done;});};
  const app=Vue.createApp(Page);app.mount('#app');for(let i=0;i<4&&!signal;i++)await Vue.nextTick();app.unmount();assert.equal(signal.aborted,true);
  resolve({ok:true,arrayBuffer:async()=>{consumed=true;return wasm;}});
  await flush();assert.equal(document.querySelector('#app').textContent,'');assert.equal(consumed,false);
});
test('missing or malformed WASM reports unavailable',async()=>{
  for(const response of [{ok:false},{ok:true,arrayBuffer:async()=>new Uint8Array([0]).buffer}]){
    globalThis.fetch=async()=>response;const app=Vue.createApp(Page);app.mount('#app');await flush();
    assert.match(document.body.textContent,/Runtime unavailable/);assert.doesNotMatch(document.body.textContent,/Runtime ready/);app.unmount();
  }
});
test('built desktop keeps Clock sessions stable, suspends minimized content and cleans route timers',async()=>{
  globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>wasm});
  const originalSet=globalThis.setInterval,originalClear=globalThis.clearInterval;
  const timers=new Set();let acquired=0;
  globalThis.setInterval=(callback,delay)=>{const timer=originalSet(callback,delay);timers.add(timer);acquired++;return timer;};
  globalThis.clearInterval=timer=>{timers.delete(timer);originalClear(timer);};
  const app=Vue.createApp(Page);
  try {
    app.mount('#app');await flush();
    const launch=label=>[...document.querySelectorAll('nav button')].find(b=>b.textContent===label).click();
    launch('New Clock');await flush();launch('New Clock');await flush();launch('New About Desktop');await flush();
    assert.equal(document.querySelectorAll('article').length,3);
    assert.equal(document.querySelectorAll('output[data-clock-status="success"]').length,2,document.body.innerHTML);
    assert.equal(timers.size,2);const count=acquired;
    const first=document.querySelector('article'), clock=first.querySelector('output');
    const second=document.querySelectorAll('article')[1], sibling=second.querySelector('output');
    const form=first.querySelector('form');form.elements.timeZone.value='America/New_York';
    form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await flush();
    assert.equal(second.querySelector('output'),sibling);assert.equal(timers.size,2);
    assert.equal(second.querySelector('[name=timeZone]').value,'UTC');
    const afterConfig=acquired;
    const title=first.querySelector('[data-title]');title.focus();
    title.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));await flush();
    assert.equal(first.style.left,'34px');assert.equal(acquired,afterConfig);
    const header=first.querySelector('header');let captured=false;
    header.setPointerCapture=()=>{captured=true;};header.hasPointerCapture=()=>captured;header.releasePointerCapture=()=>{captured=false;};
    const pointer=(type,x,y)=>{const event=new dom.window.MouseEvent(type,{button:0,clientX:x,clientY:y,bubbles:true,cancelable:true});Object.defineProperty(event,'pointerId',{value:1});header.dispatchEvent(event);};
    pointer('pointerdown',10,10);pointer('pointermove',50,30);await Vue.nextTick();assert.equal(first.style.left,'74px');
    title.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await flush();assert.equal(first.style.left,'34px');
    pointer('pointerdown',10,10);pointer('pointermove',50,30);pointer('pointerup',50,30);pointer('lostpointercapture',50,30);await flush();
    assert.equal(first.style.left,'74px');assert.equal(acquired,afterConfig);
    first.querySelector('[aria-label="Maximize"]').click();await flush();
    assert.equal(first.querySelector('output'),clock);assert.equal(acquired,afterConfig);
    first.querySelector('[aria-label="Minimize"]').click();await flush();
    assert.equal(first.hidden,true);assert(first.hasAttribute('inert'));assert.equal(timers.size,1);
    [...document.querySelectorAll('nav button')].find(b=>b.textContent.includes('(minimized)')).click();await flush();
    assert.equal(first.hidden,false);assert.equal(timers.size,2);
    first.querySelector('[aria-label="Close"]').click();await flush();assert.equal(timers.size,1);
    app.unmount();await flush();assert.equal(timers.size,0);
  } finally {if(app._instance)app.unmount();for(const timer of timers)originalClear(timer);globalThis.setInterval=originalSet;globalThis.clearInterval=originalClear;}
});
test('missing host Vue rejects without a bundled fallback',()=>{
  const entry=new URL('../page/dist/desktop/remoteEntry.js',import.meta.url);
  const result=spawnSync(process.execPath,['--input-type=module','--eval',`import assert from 'node:assert/strict';const remote=await import(${JSON.stringify(entry.href)});await assert.rejects(async()=>{const factory=await remote.get('./Plugin');factory();});`],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
});
test('built MOS entry verifies profile, isolates accounts and fences pending writes on account change', async () => {
  const navigatorBefore = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const storageBefore = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = dom.window.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: storage});
  Object.defineProperty(globalThis, 'navigator', {configurable: true, value: {locks: {request: (_key, _options, callback) => callback({})}}});
  let app;
  globalThis.fetch = async (url, options) => String(url) === '/api/v1/auth/profile'
    ? {ok: true, json: async () => ({id: options.headers.Authorization === 'Bearer fixture-a' ? 'account-a' : 'account-b'})}
    : {ok: true, arrayBuffer: async () => wasm};
  try {
    storage.setItem('authToken', 'fixture-a');
    app = Vue.createApp(Page); app.mount('#app'); await flush();
    [...document.querySelectorAll('nav button')].find(b => b.textContent === 'New Clock').click(); await flush();
    // Change the credential while the debounced save is still pending.
    storage.setItem('authToken', 'fixture-b');
    dom.window.dispatchEvent(new dom.window.StorageEvent('storage', {key: 'authToken'})); await flush();
    assert.equal(storage.getItem('mos-desktop:layout:1:mos:user:account-a'), null);
    assert.equal(document.querySelectorAll('article').length, 0);
    [...document.querySelectorAll('nav button')].find(b => b.textContent === 'New About Desktop').click(); await flush();
    app.unmount(); await flush();
    assert.equal(JSON.parse(storage.getItem('mos-desktop:layout:1:mos:user:account-b')).windows[0].definitionId, 'about');
  } finally {
    if (app?._instance) app.unmount();
    storage.removeItem('authToken'); storage.removeItem('mos-desktop:layout:1:mos:user:account-a'); storage.removeItem('mos-desktop:layout:1:mos:user:account-b');
    if (navigatorBefore) Object.defineProperty(globalThis, 'navigator', navigatorBefore); else delete globalThis.navigator;
    if (storageBefore) Object.defineProperty(globalThis, 'localStorage', storageBefore); else delete globalThis.localStorage;
  }
});
test('verified host scope restores intentions without remote work and releases storage ownership',async()=>{
  globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>wasm});
  let held=false;
  const navigatorBefore=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(_key,_options,callback)=>{
    if(held)return callback(null);held=true;try{return await callback({});}finally{held=false;}
  }}}});
  let app;
  try {
    app=Vue.createApp(Page,{verifiedStorageScope:'test-user'});app.mount('#app');await flush();
    [...document.querySelectorAll('nav button')].find(b=>b.textContent==='New Clock').click();await flush();
    app.unmount();await flush();assert.equal(held,false);
    const saved=JSON.parse(dom.window.localStorage.getItem('mos-desktop:layout:1:test-user'));
    assert.equal(saved.windows.length,1);assert.equal(saved.schemaVersion,1);
    assert.equal(saved.windows[0].definitionId,'clock');assert(!('revision' in saved));
    app=Vue.createApp(Page,{verifiedStorageScope:'test-user'});app.mount('#app');await flush();
    assert.equal(document.querySelectorAll('article').length,1);assert.match(document.body.textContent,/Layout restored/);
    app.unmount();await flush();assert.equal(held,false);
  } finally {if(app?._instance)app.unmount();if(navigatorBefore)Object.defineProperty(globalThis,'navigator',navigatorBefore);else delete globalThis.navigator;}
});
