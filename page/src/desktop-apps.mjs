import {Clock} from '@battlemoon/clock/vue';
import {defaultClockConfig, validateClockConfig} from '@battlemoon/clock';
import {defineComponent, h} from 'vue';
import {createDesktopId} from './desktop-controller.mjs';
import LxcStatus from './desktop-lxc.mjs';

const capabilities = Object.freeze({movable: true, resizable: true, closable: true, minimizable: true, maximizable: true});
export const registrations = Object.freeze([
  {definition: {id: 'mos-lxc', display_name: 'MOS LXC Status', multiple_instances: false,
    preferred_size: {width: 520, height: 340}, minimum_size: {width: 320, height: 220}, capabilities},
    component: LxcStatus, defaults: {}, validate: () => ({code: 'success', value: {}})},
  {definition: {id: 'clock', display_name: 'Clock', multiple_instances: true,
    preferred_size: {width: 340, height: 220}, minimum_size: {width: 280, height: 180}, capabilities},
    component: Clock, defaults: defaultClockConfig, validate: validateClockConfig},
  {definition: {id: 'about', display_name: 'About Desktop', multiple_instances: false,
    preferred_size: {width: 380, height: 260}, minimum_size: {width: 280, height: 180}, capabilities},
    component: defineComponent({setup: () => () => h('p', 'MOS Desktop uses the Battlemoon WASM runtime. Closing a view does not stop remote applications. MOS LXC status is read-only; container control and native application launch are not enabled.')}),
    defaults: {}, validate: () => ({code: 'success', value: {}})},
]);

export async function initializeDesktop(controller) {
  for (const registration of registrations) await accepted(controller.dispatch('register_definition', registration.definition));
  await accepted(controller.dispatch('create_workspace', {id: 'desktop', app_instance_ids: [], window_ids: [], focused_window_id: null, revision: 0}));
}
export async function accepted(promise) {
  const result = await promise;
  if (result.kind !== 'accepted') throw new Error(result.value.message);
  return result.value.snapshot;
}
export async function launchApp(controller, definitionId, bounds, {focus = true} = {}) {
  const registration = registrations.find(r => r.definition.id === definitionId);
  if (!registration) throw new Error('Unknown application');
  const existing = controller.snapshot.apps.find(a => a.definitionId === definitionId);
  if (existing && !registration.definition.multiple_instances) {
    const window = controller.snapshot.windows.find(w => w.appInstanceId === existing.id);
    await revealWindow(controller, window.id);
    return {appId: existing.id, windowId: window.id};
  }
  const appId = createDesktopId(), windowId = createDesktopId();
  await accepted(controller.dispatch('create_app', {id: appId, definition_id: definitionId,
    workspace_id: 'desktop', lifecycle: 'running', window_ids: []}));
  try {
    await accepted(controller.dispatch('attach_window', {id: windowId, app_instance_id: appId,
      workspace_id: 'desktop', title: registration.definition.display_name,
      bounds: bounds ?? {x: 24 + controller.snapshot.windows.length * 24, y: 24 + controller.snapshot.windows.length * 24,
        ...registration.definition.preferred_size}, restored_bounds: null, visible: true,
      presentation: 'normal', capabilities: registration.definition.capabilities, revision: 0}));
  } catch (error) {
    await accepted(controller.dispatch('dispose_app', appId));
    throw error;
  }
  if (focus) await accepted(controller.dispatch('focus_window', windowId));
  return {appId, windowId};
}
export async function revealWindow(controller, id) {
  await accepted(controller.dispatch('set_visibility', {window_id: id, visible: true}));
  await accepted(controller.dispatch('set_presentation', {window_id: id, presentation: 'normal'}));
  await accepted(controller.dispatch('focus_window', id));
}
export async function closeWindow(controller, id) {
  const window = controller.snapshot.windows.find(w => w.id === id);
  if (!window) return;
  await accepted(controller.dispatch('detach_window', id));
  const app = controller.snapshot.apps.find(a => a.id === window.appInstanceId);
  if (app && app.windowIds.length === 0) await accepted(controller.dispatch('dispose_app', app.id));
}
