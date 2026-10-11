import test from 'node:test';
import assert from 'node:assert/strict';
import {createMosReadHost} from '../page/src/desktop-mos.mjs';
const sample = [{name: 'test-lxc', state: 'running', unprivileged: true, config: '/private', secret: 'never-project'}];
test('control canary permits only testit start/stop, serializes requests and never retries', async () => {
  const calls = []; let finish;
  const host = createMosReadHost({storage: {getItem: () => 'fixture'}, fetcher: (url, options) => {
    calls.push({url, options}); return new Promise(resolve => {finish = resolve;});
  }});
  assert.equal((await host.controlTestContainer('restart')).code, 'denied');
  const pending = host.controlTestContainer('stop');
  assert.equal((await host.controlTestContainer('start')).code, 'busy');
  finish({ok: true}); assert.equal((await pending).code, 'accepted');
  assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/v1/lxc/containers/testit/stop');
  assert.equal(calls[0].options.method, 'POST'); assert.equal(calls[0].options.redirect, 'error');
  const failed = createMosReadHost({storage: {getItem: () => 'fixture'}, fetcher: async () => {throw Error('private error');}});
  const result = await failed.controlTestContainer('start');
  assert.equal(result.code, 'unknown'); assert(!JSON.stringify(result).includes('private error'));
});
test('MOS read adapter uses only fixed authenticated GET and projects bounded observations', async () => {
  let request;
  const host = createMosReadHost({storage: {getItem: () => 'fixture'}, fetcher: async (url, options) => {
    request = {url, options}; return {ok: true, json: async () => sample};
  }});
  const result = await host.listLxcContainers(new AbortController().signal);
  assert.equal(result.code, 'success');
  assert.deepEqual(result.value.items, [{name: 'test-lxc', state: 'running', unprivileged: true}]);
  assert.equal(request.url, '/api/v1/lxc/containers?performance=false'); assert.equal(request.options.method, 'GET');
  assert.equal(request.options.redirect, 'error'); assert.equal(request.options.headers.Authorization, 'Bearer fixture');
  assert(!JSON.stringify(result).includes('private')); assert(!JSON.stringify(result).includes('fixture'));
});
test('denial, malformed data, credential changes and cancellation fail closed with redacted errors', async () => {
  for (const response of [{status: 401}, {status: 403}, {ok: false, status: 500},
    {ok: true, json: async () => ({items: sample})}, {ok: true, json: async () => [...sample, ...sample]},
    {ok: true, json: async () => [{name: '../escape', state: 'running', unprivileged: true}]}]) {
    const result = await createMosReadHost({storage: {getItem: () => 'fixture'}, fetcher: async () => response}).listLxcContainers();
    assert.notEqual(result.code, 'success'); assert(!('value' in result));
  }
  let token = 'before';
  const result = await createMosReadHost({storage: {getItem: () => token}, fetcher: async () => {
    token = 'after'; return {ok: true, json: async () => sample};
  }}).listLxcContainers(); assert.equal(result.code, 'denied');
  const abort = new AbortController(); abort.abort();
  const host = createMosReadHost({fetcher: () => {throw Error('must not fetch');}});
  assert.equal((await host.listLxcContainers(abort.signal)).code, 'cancelled');
  assert.equal((await host.listLxcContainers()).code, 'denied');
});
