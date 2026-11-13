import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {build} from '../page/node_modules/esbuild/lib/main.js';
import {pruneFixture} from '../scripts/prune-fixture.mjs';
import {JSDOM} from '../page/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<div id="app"></div>', {url: 'https://mos-fixture.invalid/plugins/desktop/', pretendToBeVisual: true});
globalThis.ResizeObserver = class {observe(){} disconnect(){}};
for (const key of ['window','document','Element','HTMLElement','SVGElement','Node']) globalThis[key] = dom.window[key];
const Vue = await import('../page/node_modules/vue/index.mjs');
globalThis.__federation_shared__ = {default: {vue: {[Vue.version]: {get: () => () => Vue, loaded: true}, '3': {get: () => () => Vue, loaded: true}}}};
const remote = await import('../page/dist/desktop/remoteEntry.js');
const factory = await remote.get('./Plugin');
const module = factory();
const Page = module.default ?? module;
const wasm = readFileSync(new URL('../page/src/generated/runtime.wasm', import.meta.url));
const flush = async () => { for (let i=0;i<10;i++) {await new Promise(resolve => setTimeout(resolve, 10)); await Vue.nextTick();} };

test('built federation uses real paired WASM and host Vue from a nested route', async () => {
  let requested;
  globalThis.fetch = async (url, options) => {
    requested = {url, options};
    return {ok: true, arrayBuffer: async () => wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength)};
  };
  const app = Vue.createApp(Page); app.mount('#app'); await flush();
  assert.match(document.body.textContent, /Runtime ready/);
  assert.match(String(requested.url), /runtime-.*\.wasm$/);
  assert.equal(requested.options.credentials, 'same-origin');
  app.unmount(); assert.equal(requested.options.signal.aborted, true);
});

test('late acquisition after route exit cannot resurrect the old view', async () => {
  let resolve, signal;
  globalThis.fetch = (_url, options) => {signal = options.signal; return new Promise(done => {resolve = done;});};
  const app = Vue.createApp(Page); app.mount('#app'); for (let i = 0; i < 4 && !signal; i++) await Vue.nextTick(); app.unmount();
  assert.equal(signal.aborted, true);
  let consumed = false;
  resolve({ok: true, arrayBuffer: async () => {consumed = true; return wasm;}});
  await flush(); assert.equal(document.querySelector('#app').textContent, '');
  assert.equal(consumed, false);
});

test('bad asset and malformed WASM show bounded errors, not empty success', async () => {
  for (const response of [{ok: false}, {ok: true, arrayBuffer: async () => new Uint8Array([0]).buffer}]) {
    globalThis.fetch = async () => response;
    const app = Vue.createApp(Page); app.mount('#app'); await flush();
    assert.match(document.body.textContent, /Runtime unavailable/);
    assert.doesNotMatch(document.body.textContent, /Runtime PASS/);
    app.unmount();
  }
});

test('missing host Vue rejects instead of loading a second runtime', () => {
  const entry = new URL('../page/dist/desktop/remoteEntry.js', import.meta.url);
  const result = spawnSync(process.execPath, ['--input-type=module','--eval', `import assert from 'node:assert/strict'; const remote = await import(${JSON.stringify(entry.href)}); await assert.rejects(async () => {const factory = await remote.get('./Plugin'); factory();});`], {encoding:'utf8'});
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('pruned bindings preserve all frozen lifecycle command results against original SDK', async () => {
  const sdk = new URL('../.cache/sdk/',import.meta.url);
  const originalSource = readFileSync(new URL('generated/typescript/skirout/runtime_protocol.js',sdk),'utf8');
  assert(!pruneFixture(originalSource).includes('FixtureEnvelope'));
  assert.throws(() => pruneFixture('changed generator layout'));
  const baseline = await build({stdin:{contents:'export {createReducer} from "./typescript/wasm.ts"; export {FixtureEnvelope, Result} from "./generated/typescript/skirout/runtime_protocol.js";',resolveDir:new URL(sdk).pathname.replace(/^\/([A-Za-z]:)/,'$1'),loader:'js'},bundle:true,format:'esm',platform:'browser',write:false});
  const original = await import('data:text/javascript;base64,' + Buffer.from(baseline.outputFiles[0].contents).toString('base64'));
  const pruned = await import('../page/src/generated/runtime.mjs');
  const fixture = original.FixtureEnvelope.serializer.fromJsonCode(readFileSync(new URL('conformance/fixtures/lifecycle.json',sdk),'utf8'));
  const before = await original.createReducer(wasm), after = await pruned.createReducer(wasm);
  let left = fixture.initial, right = fixture.initial;
  for (const command of fixture.commands) {
    const a = before('aggregate',left,command), b = after('aggregate',right,command);
    assert.equal(original.Result.serializer.toJsonCode(b,'readable'),original.Result.serializer.toJsonCode(a,'readable'));
    if (a.kind === 'accepted') {left=a.value.snapshot;right=b.value.snapshot;}
  }
  assert(fixture.commands.length > 4);
});
