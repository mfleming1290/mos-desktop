import test from 'node:test';
import assert from 'node:assert/strict';
import {createMosProfileScope} from '../page/src/desktop-profile.mjs';

test('MOS profile scope uses only the authenticated server id and fences credential changes', async () => {
  let token = 'test-credential', requested;
  const profile = createMosProfileScope({storage: {getItem: key => key === 'authToken' ? token : 'untrusted-user'},
    fetcher: async (url, options) => {requested = {url, options}; return {ok: true, json: async () => ({id: 'user-123', username: 'not-the-scope'})};}});
  assert.equal(await profile.resolve(), 'mos:user:user-123');
  assert.equal(requested.url, '/api/v1/auth/profile'); assert.equal(requested.options.method, 'GET');
  assert.equal(requested.options.redirect, 'error'); assert.equal(profile.isCurrent(), true);
  token = 'different-test-credential'; assert.equal(profile.isCurrent(), false);
  profile.invalidate(); assert.equal(profile.isCurrent(), false);
});

test('denied, malformed, cancelled and stale profiles fail closed without inferred identity', async () => {
  for (const response of [{ok: false}, {ok: true, json: async () => ({username: 'admin'})},
    {ok: true, json: async () => ({id: '../other'})}, {ok: true, json: async () => ({id: 123})}]) {
    const profile = createMosProfileScope({storage: {getItem: () => 'test-only'}, fetcher: async () => response});
    assert.equal(await profile.resolve(), ''); assert.equal(profile.isCurrent(), false);
  }
  let token = 'before';
  const abort = new AbortController();
  const profile = createMosProfileScope({storage: {getItem: () => token}, fetcher: async () => {
    token = 'after'; return {ok: true, json: async () => ({id: 'user'})};
  }});
  assert.equal(await profile.resolve(), '');
  abort.abort(); assert.equal(await profile.resolve(abort.signal), '');
  assert.equal(await createMosProfileScope({storage: {getItem: () => {throw Error('denied');}}}).resolve(), '');
});
