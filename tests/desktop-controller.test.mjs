import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createReducer} from '../page/src/generated/runtime.mjs';
import {createDesktopController} from '../page/src/desktop-controller.mjs';

const bytes = await readFile(new URL('../runtime/runtime.wasm', import.meta.url));
const workspace = id => ({id, app_instance_ids: [], window_ids: [], focused_window_id: null, revision: 0});
test('queued commands select the current revision; rejection preserves exact snapshot', async () => {
  const published = [];
  const controller = createDesktopController(await createReducer(bytes), {aggregateId: 'test', onChange: s => published.push(s)});
  const [a, b] = await Promise.all([
    controller.dispatch('create_workspace', workspace('a')),
    controller.dispatch('create_workspace', workspace('b')),
  ]);
  assert.equal(a.kind, 'accepted'); assert.equal(b.kind, 'accepted');
  assert.equal(controller.snapshot.revision, 2n);
  const before = controller.snapshot;
  const stale = await controller.dispatch('create_workspace', workspace('c'), 0n);
  assert.equal(stale.kind, 'rejected');
  assert.equal(controller.snapshot, before);
  assert.equal(published.length, 2);
  const unsupported = await controller.dispatch('set_shell_contribution', {id: 'x', app_instance_id: 'x', kind: 'taskbar', label: 'x'});
  assert.equal(unsupported.kind, 'rejected');
  assert.equal(controller.snapshot, before);
});
test('disposal fences queued operations and a runtime exception blocks later dispatch', async () => {
  const controller = createDesktopController(await createReducer(bytes));
  const pending = controller.dispatch('create_workspace', workspace('a'));
  controller.dispose();
  await assert.rejects(pending, /disposed/);
  assert.equal(controller.snapshot.revision, 0n);
  let calls = 0;
  const broken = createDesktopController(() => {calls++; throw new Error('trap');});
  await assert.rejects(broken.dispatch('create_workspace', workspace('a')), /trap/);
  await assert.rejects(broken.dispatch('create_workspace', workspace('b')), /unavailable/);
  assert.equal(calls, 1);
});
test('batch publishes once; midway rejection and stale batch publish nothing', async () => {
  const published = [];
  const controller = createDesktopController(await createReducer(bytes), {aggregateId:'batch', onChange:s=>published.push(s)});
  const accepted = await controller.dispatchBatch([
    {kind:'create_workspace', value:workspace('a')},
    {kind:'create_workspace', value:workspace('b')},
  ], 0n);
  assert.equal(accepted.kind,'accepted');
  assert.equal(controller.snapshot.revision,2n);
  assert.equal(accepted.value.events.length,2);
  assert.equal(published.length,1);
  const before = controller.snapshot;
  const rejected = await controller.dispatchBatch([
    {kind:'create_workspace', value:workspace('c')},
    {kind:'create_workspace', value:workspace('a')},
  ]);
  assert.equal(rejected.kind,'rejected');
  assert.equal(controller.snapshot,before);
  assert.equal(published.length,1);
  const stale = await controller.dispatchBatch([{kind:'create_workspace',value:workspace('d')}],0n);
  assert.equal(stale.kind,'rejected');assert.equal(controller.snapshot,before);
  const proposal = [{kind:'create_workspace',value:workspace('e')}];
  const pending = controller.dispatchBatch(proposal);
  proposal[0].value.id='mutated';
  assert.equal((await pending).kind,'accepted');
  assert.ok(controller.snapshot.workspaces.some(w=>w.id==='e'));
  assert.ok(!controller.snapshot.workspaces.some(w=>w.id==='mutated'));
  assert.equal(published.length,2);
});
