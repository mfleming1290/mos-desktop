import test from 'node:test';
import assert from 'node:assert/strict';
import {createMosReadHost} from '../page/src/desktop-mos.mjs';
const sample = [{name: 'test-lxc', state: 'running', unprivileged: true, config: '/private', secret: 'never-project'}];
test('control authorization failures and session changes never report success or retry', async () => {
  for (const status of [401, 403, 500]) {
    let calls = 0;
    const host = createMosReadHost({storage: {getItem: () => 'fixture'}, fetcher: async () => {
      calls++; return {ok: false, status};
    }});
    const result = await host.controlDesktopContainer('stop');
    assert.equal(result.code, status === 500 ? 'unknown' : 'denied');
    assert.equal(calls, 1);
  }
  let token = 'before'; let calls = 0;
  const host = createMosReadHost({storage: {getItem: () => token}, fetcher: async () => {
    calls++; token = 'after'; return {ok: true};
  }});
  assert.equal((await host.controlDesktopContainer('start')).code, 'unknown');
  assert.equal(calls, 1);
  assert.equal((await createMosReadHost({fetcher: () => assert.fail('must not fetch')})
    .controlDesktopContainer('stop')).code, 'denied');
});
test('timed-out control remains uncertain and does not automatically retry', async context => {
  context.mock.timers.enable({apis: ['setTimeout']});
  let calls = 0;
  const host = createMosReadHost({storage: {getItem: () => 'fixture'}, fetcher: (_url, {signal}) => {
    calls++;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(Error('private timeout')), {once: true}));
  }});
  const pending = host.controlDesktopContainer('stop');
  context.mock.timers.tick(45000);
  const result = await pending;
  assert.equal(result.code, 'unknown');
  assert.equal(calls, 1);
  assert(!JSON.stringify(result).includes('private timeout'));
});
test('control canary permits only mos-desktop start/stop, serializes requests and never retries', async () => {
  const calls = []; let finish;
  const host = createMosReadHost({storage: {getItem: () => 'fixture'}, fetcher: (url, options) => {
    calls.push({url, options}); return new Promise(resolve => {finish = resolve;});
  }});
  assert.equal((await host.controlDesktopContainer('restart')).code, 'denied');
  const pending = host.controlDesktopContainer('stop');
  assert.equal((await host.controlDesktopContainer('start')).code, 'busy');
  finish({ok: true}); assert.equal((await pending).code, 'accepted');
  assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/v1/lxc/containers/mos-desktop/stop');
  assert.equal(calls[0].options.method, 'POST'); assert.equal(calls[0].options.redirect, 'error');
  const failed = createMosReadHost({storage: {getItem: () => 'fixture'}, fetcher: async () => {throw Error('private error');}});
  const result = await failed.controlDesktopContainer('start');
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
test('MOS underscore-prefixed container names remain readable without widening control targets', async () => {
  const host = createMosReadHost({storage: {getItem: () => 'fixture'}, fetcher: async () => ({ok: true,
    json: async () => [{name: '__registry_list_test__', state: 'stopped', unprivileged: true}]})});
  const result = await host.listLxcContainers();
  assert.equal(result.code, 'success');
  assert.equal(result.value.items[0].name, '__registry_list_test__');
  assert.equal((await host.controlDesktopContainer('__registry_list_test__')).code, 'denied');
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
