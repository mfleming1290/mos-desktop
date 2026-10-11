import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createReducer} from '../page/src/generated/runtime.mjs';
import {createDesktopController} from '../page/src/desktop-controller.mjs';
import {initializeDesktop, launchApp, closeWindow} from '../page/src/desktop-apps.mjs';
test('two Clock identities, static second app, and close-last-view preserve siblings', async () => {
  const c = createDesktopController(await createReducer(await readFile(new URL('../runtime/runtime.wasm', import.meta.url))));
  await initializeDesktop(c);
  const a = await launchApp(c, 'clock'), b = await launchApp(c, 'clock'), about = await launchApp(c, 'about');
  assert.notEqual(a.appId, b.appId);
  assert.equal((await launchApp(c, 'about')).appId, about.appId);
  assert.equal(c.snapshot.windows.length, 3);
  await closeWindow(c, a.windowId);
  assert.equal(c.snapshot.apps.length, 2);
  assert(c.snapshot.windows.some(w => w.id === b.windowId));
  await assert.rejects(launchApp(c, 'unknown'), /Unknown/);
  c.dispose();
});
test('restore attachment does not invent focus before saved focus is applied', async () => {
  const c = createDesktopController(await createReducer(await readFile(new URL('../runtime/runtime.wasm', import.meta.url))));
  await initializeDesktop(c);await launchApp(c,'clock',undefined,{focus:false});
  assert.equal(c.snapshot.workspaces[0].focusedWindowId,null);c.dispose();
});
