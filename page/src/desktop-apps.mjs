import {Clock} from '@battlemoon/clock/vue';
import {defaultClockConfig, validateClockConfig} from '@battlemoon/clock';
import {defineComponent, defineAsyncComponent, h} from 'vue';
import {createDesktopId} from './desktop-controller.mjs';
import LxcStatus from './desktop-lxc.mjs';
import {webAdapter} from './desktop-web-content.mjs';
import {textAdapter} from './desktop-text-content.mjs';
import {streamAdapter} from './desktop-stream-content.mjs';
import {installedAdapter} from './desktop-installed-content.mjs';
const InstalledContent=defineAsyncComponent(()=>import('./InstalledContent.vue'));
const ConnectorManager=defineAsyncComponent(()=>import('./ConnectorManager.vue'));
const PersonalWeb=defineAsyncComponent(()=>import('./PersonalWeb.vue'));
const PersonalHome=defineAsyncComponent(()=>import('./PersonalHome.vue'));
const PersonalTerminal=defineAsyncComponent(()=>import('./PersonalTerminal.vue'));
const PersonalEditor=defineAsyncComponent(()=>import('./PersonalEditor.vue'));
const PersonalStream=defineAsyncComponent(()=>import('./PersonalStream.vue'));
const ApplicationLibrary=defineAsyncComponent(()=>import('./ApplicationLibrary.vue'));

const capabilities = Object.freeze({movable: true, resizable: true, closable: true, minimizable: true, maximizable: true});
export const registrations = Object.freeze([
  {definition:{id:'connectors',display_name:'Connector Manager',multiple_instances:false,preferred_size:{width:700,height:500},minimum_size:{width:360,height:260},capabilities},component:ConnectorManager,defaults:{},validate:()=>({code:'success',value:{}})},
  {definition:{id:'installed-host',display_name:'Installed Connector Host',multiple_instances:true,preferred_size:{width:500,height:400},minimum_size:{width:280,height:180},capabilities},component:InstalledContent,defaults:{},validate:value=>value&&/^[A-Za-z0-9_.-]{1,80}$/.test(value.connectorId)&&/^[a-f0-9]{64}$/.test(value.artifactIdentity)&&Object.keys(value).length===2?{code:'success',value}:{code:'invalid',message:'Invalid connector reference'},adapter:installedAdapter,target:'module',internal:true},
  {definition:{id:'browser',display_name:'Web Browser',multiple_instances:true,preferred_size:{width:900,height:600},minimum_size:{width:360,height:260},capabilities},component:PersonalWeb,defaults:{initialUrl:'',navigationPolicy:'approved-browser'},validate:value=>webAdapter.validate(value,'browser')?{code:'success',value}:{code:'invalid',message:'Invalid browser configuration'},adapter:webAdapter,target:'browser'},
  {definition:{id:'text',display_name:'Text Canary',multiple_instances:true,preferred_size:{width:400,height:300},minimum_size:{width:280,height:180},capabilities},component:textAdapter.component,defaults:{text:''},validate:value=>textAdapter.validate(value,'plain')?{code:'success',value}:{code:'invalid',message:'Invalid text configuration'},adapter:textAdapter,target:'plain'},
  {definition:{id:'library',display_name:'Application Library',multiple_instances:false,
    preferred_size:{width:640,height:500},minimum_size:{width:360,height:260},capabilities},
    component:ApplicationLibrary,defaults:{},validate:()=>({code:'success',value:{}})},
  {definition:{id:'stream',display_name:'Personal Stream',multiple_instances:true,
    preferred_size:{width:1000,height:700},minimum_size:{width:400,height:300},capabilities},
    shell:true,component:PersonalStream,defaults:{resource:'personal'},validate:value=>value&&Object.keys(value).length===0?{code:'success',value:{resource:'personal'}}:streamAdapter.validate(value,'personal')?{code:'success',value}:{code:'invalid',message:'Invalid stream resource'},adapter:streamAdapter,target:'personal'},
  {definition:{id:'editor',display_name:'Personal Editor',multiple_instances:true,
    preferred_size:{width:760,height:520},minimum_size:{width:360,height:260},capabilities},
    shell:true,component:PersonalEditor,defaults:{},validate:()=>({code:'success',value:{}})},
  {definition:{id:'home',display_name:'Personal Home',multiple_instances:false,
    preferred_size:{width:560,height:440},minimum_size:{width:320,height:240},capabilities},
    shell:true,component:PersonalHome,defaults:{},validate:()=>({code:'success',value:{}})},
  {definition:{id:'terminal',display_name:'Personal Terminal',multiple_instances:true,
    preferred_size:{width:760,height:520},minimum_size:{width:360,height:260},capabilities},
    shell:true,component:PersonalTerminal,defaults:{sessionId:'',generation:''},validate:value=>{
      const sessionId=value?.sessionId??'',generation=value?.generation??'';
      return typeof sessionId==='string'&&typeof generation==='string'&&/^[A-Za-z0-9_-]{0,128}$/.test(sessionId)&&/^[A-Za-z0-9_-]{0,128}$/.test(generation)
        ?{code:'success',value:{sessionId,generation}}:{code:'invalid',message:'Invalid terminal reference'};
    }},
  {definition: {id: 'mos-lxc', display_name: 'MOS LXC Status', multiple_instances: false,
    preferred_size: {width: 520, height: 340}, minimum_size: {width: 320, height: 220}, capabilities},
    shell:true,component: LxcStatus, defaults: {}, validate: () => ({code: 'success', value: {}})},
  {definition: {id: 'clock', display_name: 'Clock', multiple_instances: true,
    preferred_size: {width: 340, height: 220}, minimum_size: {width: 280, height: 180}, capabilities},
    shell:true,component: Clock, defaults: defaultClockConfig, validate: validateClockConfig},
  {definition: {id: 'about', display_name: 'About Desktop', multiple_instances: false,
    preferred_size: {width: 380, height: 260}, minimum_size: {width: 280, height: 180}, capabilities},
    shell:true,component: defineComponent({setup: () => () => h('p', 'MOS Desktop uses the Battlemoon WASM runtime. Closing a view does not stop remote applications. Confirmed container controls are limited to the mos-desktop backend. Personal Home, Terminal and Stream require the separately installed authenticated services. Streaming attaches to the scoped personal graphical session; clipboard, uploads and audio are disabled.')}),
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
export async function launchApp(controller, definitionId, bounds, {focus = true, registration = registrations.find(r => r.definition.id === definitionId)} = {}) {
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
