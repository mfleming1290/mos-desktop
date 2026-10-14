<script setup>
import {shallowRef, ref, computed, onMounted, onUnmounted, nextTick, onErrorCaptured,provide,watch} from 'vue';
import {createDesktopCatalog,resolveRegistration,catalogPolicyAvailability} from './desktop-catalog.mjs';
import {createApplicationDiscovery} from './desktop-application-discovery.mjs';
import {createConnectorControls} from './desktop-connector-controls.mjs';
import {createReducer} from './generated/runtime.mjs';
import wasmUrl from './generated/runtime.wasm?url';
import {createDesktopController} from './desktop-controller.mjs';
import {registrations, initializeDesktop, launchApp, revealWindow, closeWindow, accepted} from './desktop-apps.mjs';
import {createLayout} from '../../runtime/layout.mjs';
import layoutWasmUrl from '../../runtime/layout.wasm?url';
import {createGeometry} from './desktop-sdk-layout.mjs';
import {createArrangement} from './desktop-arrangement.mjs';
import {encodeLayout, decodeLayout, createLayoutStorage} from './desktop-layout.mjs';
import {createMosReadHost} from './desktop-mos.mjs';
import {createPersonalHost} from './desktop-personal.mjs';
import ShellLayout from './ShellLayout.vue';
import '../../runtime/design/mos.css';
import '../../runtime/design/universal.css';
import '../../runtime/design/mos-desktop.css';

// Only the trusted host may supply this; never infer it from browser UI or a display name.
const props = defineProps({verifiedStorageScope: {type: String, default: ''}, canPersist: {type: Function, default: () => true}});
const surface = ref(), snapshot = shallowRef(), status = ref('Loading runtime…');
const ready = ref(false), layoutStatus = ref('Temporary layout'), canRetrySave = ref(false);
const area = shallowRef({width: 800, height: 520}), preview = shallowRef(null);
const configs = shallowRef(new Map()), activePage = ref(true), failures = shallowRef(new Map());
const drafts = shallowRef(new Map());
const abort = new AbortController();
let controller, observer, gesture, persistence, live = true, saving = false, measured = false, actions = Promise.resolve();
let geometry, arrangements,connectorPoll;
const arrangement = shallowRef(null), layoutProjection = shallowRef(null);
const dockPreview = shallowRef(null);
const recoverBounds=(...args)=>geometry.recover(...args);
const previewBounds=(...args)=>geometry.preview(...args);
const frames = new Map(), descendants = new Map();
let mosStorage; try {mosStorage = globalThis.localStorage;} catch {}
const personal=createPersonalHost({storage:mosStorage});
const catalog=createDesktopCatalog(registrations);
const catalogSnapshot=shallowRef(catalog.snapshot());
onUnmounted(catalog.subscribe(value=>catalogSnapshot.value=value));
const pinned=new Map(),admitted=new Map(registrations.map(r=>[r.definition.id,r]));
const artifacts=shallowRef(new Map()),managed=new Map(catalog.list().map(d=>[d.id,d]));
const approvalState=shallowRef(null);
const connectors=createConnectorControls({personal,catalog,artifacts,managed,approvalState});
watch(()=>artifacts.value.size,size=>{clearInterval(connectorPoll);connectorPoll=undefined;if(size)connectorPoll=setInterval(()=>{if(activePage.value)connectors.refresh().catch(()=>{artifacts.value=new Map();});},5000);});
onUnmounted(()=>connectors.dispose());
const discoveryStatus=ref('Manifest discovery not refreshed');
const discovery=createApplicationDiscovery({personal,catalog,builtins:()=>[...managed.values()],onStatus:value=>discoveryStatus.value=value});
onUnmounted(()=>discovery.dispose());
const catalogService={catalog,discovery,discoveryStatus,artifacts,connectors,availability(entry){const deferred=catalogPolicyAvailability(entry,admitted,snapshot.value?.apps??[]);if(deferred)return deferred;const r=resolveRegistration(entry,registrations);return r?.adapter?r.adapter.availability(catalogService,entry):{code:r?'available':'unavailable',message:entry.id==='stream'?'Existing authenticated personal session; connection checked at attachment':'Trusted installed component'};},
 async launch(id){const result=await action(async()=>{if(props.verifiedStorageScope&&!props.canPersist())throw Error('Application admission denied');const entry=catalog.resolve(id);if(!entry||catalogService.availability(entry).code!=='available')throw Error('Application unavailable');const r=resolveRegistration(entry,registrations),existing=controller.snapshot.apps.find(a=>a.definitionId===entry.id&&(entry.instancePolicy!=='single-resource'||pinned.get(a.id)?.resourceKey===r.resourceKey));if(existing&&entry.instancePolicy!=='multiple'){const w=controller.snapshot.windows.find(w=>w.appInstanceId===existing.id);await revealArrangedWindow(w.id);}else {
 if(r.adapter?.admit)r.defaults=await r.adapter.admit(catalogService,entry);
 if((props.verifiedStorageScope&&!props.canPersist())||catalog.resolve(id)!==entry)throw Error('Application admission changed');
 if(admitted.has(id)&&!controller.snapshot.apps.some(a=>a.definitionId===id)&&JSON.stringify(admitted.get(id).definition)!==JSON.stringify(r.definition)){await accepted(controller.dispatch('unregister_definition',id));admitted.delete(id);}
 if(!admitted.has(id)){await accepted(controller.dispatch('register_definition',r.definition));admitted.set(id,r);}
 const created=await launchApp(controller,id,undefined,{registration:r});pinned.set(created.appId,r);configs.value=new Map(configs.value).set(created.appId,r.defaults);
 }return true;});if(result!==true)throw result?.error??Error('Application unavailable');}};
provide('applicationCatalog',catalogService);
onUnmounted(()=>personal.dispose());
const host = Object.freeze({personal,rememberTerminal(instanceId,reference){
  if(!live || !controller?.snapshot.apps.some(a=>a.id===instanceId&&a.definitionId==='terminal'))return;
  const validated=registrations.find(r=>r.definition.id==='terminal').validate(reference);
  if(validated.code!=='success')return;
  configs.value=new Map(configs.value).set(instanceId,validated.value);saveLayout();persistence?.flush();
},...createMosReadHost({storage: mosStorage}), readTime: async (_id, cancellation) => cancellation.aborted
  ? {code: 'cancelled', message: 'Cancelled'} : {code: 'success', value: Date.now()},
  schedule: (callback, interval) => {const timer = setInterval(callback, interval); return () => clearInterval(timer);}});
const windows = computed(() => {
  const s = snapshot.value;
  return s?.workspaces[0] ? s.workspaces[0].windowIds.map(id => s.windows.find(w => w.id === id)) : [];
});
const focused = computed(() => snapshot.value?.workspaces[0]?.focusedWindowId);
const registration = window => pinned.get(window.appInstanceId)??admitted.get(snapshot.value.apps.find(a => a.id === window.appInstanceId)?.definitionId);
const shown = window => window.visible && window.presentation.kind !== 'MINIMIZED'
  && (layoutProjection.value?.views.find(v=>v.view===window.id)?.active ?? true);
const config = window => configs.value.get(window.appInstanceId) ?? registration(window).defaults;
const fields = window => drafts.value.get(window.appInstanceId) ?? config(window);
function rememberDraft(window,event) {
  const form=event.currentTarget;
  drafts.value=new Map(drafts.value).set(window.appInstanceId,{locale:form.elements.locale.value,
    timeZone:form.elements.timeZone.value,seconds:form.elements.seconds.checked,hour12:form.elements.hour12.checked});
}
const frameStyle = window => {
  const bounds = preview.value?.id === window.id ? preview.value.bounds : window.presentation.kind === 'MAXIMIZED'
    ? geometry.workArea(area.value) : window.bounds;
  return {left: `${bounds.x}px`, top: `${bounds.y}px`, width: `${bounds.width}px`, height: `${bounds.height}px`};
};
function report(error) {if (live) status.value = error.message ?? 'Desktop action failed';}
function saveLayout() {if (saving && live && persistence?.writable) persistence.save(encodeLayout(controller.snapshot, configs.value, props.verifiedStorageScope, arrangement.value),arrangement.value?2:1);}
async function applyArrangement(candidate) {
  const current = controller.snapshot.workspaces[0].windowIds.map(id=>controller.snapshot.windows.find(w=>w.id===id));
  const next = arrangements.sync(candidate,current);
  const projection = arrangements.project(next,current,area.value,w=>registration(w).definition.minimum_size);
  if(projection.code==='deferred')return;
  const commands = projection.views.map(v=>({kind:'set_bounds',value:{window_id:v.view,bounds:v.bounds}}));
  const eligible = projection.views.filter(v=>v.active && current.some(w=>w.id===v.view && w.visible && w.presentation.kind!=='MINIMIZED'));
  const currentFocus = controller.snapshot.workspaces[0].focusedWindowId;
  if(eligible.length && !eligible.some(v=>v.view===currentFocus))commands.push({kind:'focus_window',value:eligible[0].view});
  if(commands.length)await accepted(controller.dispatchBatch(commands,controller.snapshot.revision,{arrangement:next,projection}));
  else {arrangement.value=next;layoutProjection.value=projection;}
}
const arrange = mode => action(()=>applyArrangement(arrangements.preset(arrangement.value,windows.value,mode)),true,'immediate');
const undock = () => action(()=>applyArrangement(arrangements.apply(arrangement.value,{kind:'undock',view:focused.value})),true,'immediate');
function previewDock(side) {
  try {
    const target=windows.value.find(w=>w.id!==focused.value && shown(w));
    if(!target)throw new Error('Open and select two visible windows before docking');
    const candidate=arrangements.dock(arrangement.value,windows.value,focused.value,target.id,side);
    const projection=arrangements.project(candidate,windows.value,area.value,w=>registration(w).definition.minimum_size);
    if(projection.code!=='ready')throw new Error('Workspace is hidden; docking deferred');
    dockPreview.value={candidate,revision:controller.snapshot.revision,bounds:projection.views.find(v=>v.view===focused.value).bounds};
  } catch(error){report(error);}
}
function commitDock() {
  const proposed=dockPreview.value;dockPreview.value=null;
  if(!proposed)return;
  return action(async()=>{
    if(controller.snapshot.revision!==proposed.revision)throw new Error('Dock preview is stale; preview again');
    await applyArrangement(proposed.candidate);
  },true,'immediate');
}
const commitBounds = (id,bounds) => arrangement.value
  ? applyArrangement(arrangements.apply(arrangement.value,{kind:'floating',view:id,bounds}))
  : accepted(controller.dispatch('set_bounds',{window_id:id,bounds}));
// Called inside the existing action queue; never enqueue recursively.
async function revealArrangedWindow(id) {
  const view=layoutProjection.value?.views.find(v=>v.view===id);
  if(view && !view.active && arrangement.value?.mode==='tiled')
    await applyArrangement(arrangements.apply(arrangement.value,{kind:'tree',operation:{kind:'select',node:view.group,view:id}}));
  await revealWindow(controller,id);
}
function activateWindow(id) {return action(()=>revealArrangedWindow(id));}
function measureArea() {
  const width = surface.value?.clientWidth, height = surface.value?.clientHeight;
  if (!(width > 0 && height > 0)) return false;
  area.value = {width, height}; measured = true; return true;
}
async function recoverWindows() {
  if (!measured) return; // A hidden/unmeasured mount must not rewrite saved geometry.
  if(arrangement.value){await applyArrangement(arrangement.value);return;}
  for (const window of windows.value) {
    if (!live || window.presentation.kind !== 'NORMAL') continue;
    const bounds = recoverBounds(window.bounds, registration(window).definition.minimum_size, area.value);
    if (Object.keys(bounds).some(key => bounds[key] !== window.bounds[key]))
      await accepted(controller.dispatch('set_bounds', {window_id: window.id, bounds}));
  }
}
function action(fn, focus = true, persist = true) {
  const next = actions.then(async () => {
    if (!live || !ready.value) return;
    try {const result=await fn(); await recoverWindows(); if (persist) {saveLayout(); if (persist === 'immediate') persistence?.flush();} if (live && focus) await reconcileFocus();return result;} catch (error) {report(error);return {error};}
  });
  actions = next.catch(report); return next;
}
async function reconcileFocus() {
  await nextTick(); if (!live) return;
  const frame = frames.get(focused.value);
  const target = descendants.get(focused.value);
  if (frame && !frame.contains(document.activeElement)) (target?.isConnected && frame.contains(target) ? target : frame.querySelector('[data-title]')).focus();
  else if (!frame) surface.value?.focus();
}
// Refocusing the active window during pointer-down can scroll its remembered
// descendant before pointer-up, retargeting the user's click.
const focusWindow = id => focused.value === id ? Promise.resolve()
  : action(() => accepted(controller.dispatch('focus_window', id)));
const presentation = (id, value) => action(() => accepted(controller.dispatch('set_presentation', {window_id: id, presentation: value})));
function remember(id, event) {descendants.set(id, event.target);if (focused.value !== id && ready.value) focusWindow(id);}
function updateConfig(window, event) {
  const form = event.currentTarget;
  const next = {locale: form.elements.locale.value, timeZone: form.elements.timeZone.value,
    seconds: form.elements.seconds.checked, hour12: form.elements.hour12.checked};
  const result = registration(window).validate(next);
  if (result.code !== 'success') {report(new Error(result.message)); return;}
  configs.value = new Map(configs.value).set(window.appInstanceId, result.value);
  const nextDrafts=new Map(drafts.value);nextDrafts.delete(window.appInstanceId);drafts.value=nextDrafts;
  saveLayout();
}
async function close(id) {
  const window = controller.snapshot.windows.find(w => w.id === id);
  const definitionId=window&&controller.snapshot.apps.find(a=>a.id===window.appInstanceId)?.definitionId;
  await closeWindow(controller, id);
  if(window)pinned.delete(window.appInstanceId);
  if(definitionId&&!catalog.resolve(definitionId)&&!controller.snapshot.apps.some(a=>a.definitionId===definitionId)){await accepted(controller.dispatch('unregister_definition',definitionId));admitted.delete(definitionId);}
  descendants.delete(id);
  if (window) {const next = new Map(configs.value);next.delete(window.appInstanceId);configs.value = next;}
  if(window){const next=new Map(drafts.value);next.delete(window.appInstanceId);drafts.value=next;}
}
function startGesture(window, mode, event) {
  if(arrangement.value?.mode==='tiled' && layoutProjection.value?.views.some(v=>v.view===window.id && v.group!==window.id))return;
  if (event.button !== 0 || gesture || window.presentation.kind !== 'NORMAL') return;
  if (mode === 'move' && event.target.closest('button, input, select')) return;
  if (!window.capabilities[mode === 'move' ? 'movable' : 'resizable']) return;
  event.preventDefault(); focusWindow(window.id);
  gesture = {id: window.id, mode, pointer: event.pointerId, target: event.currentTarget,
    start: {...window.bounds}, x: event.clientX, y: event.clientY, minimum: registration(window).definition.minimum_size};
  event.currentTarget.setPointerCapture(event.pointerId);
}
function moveGesture(event) {
  if (!gesture || event.pointerId !== gesture.pointer) return;
  preview.value = {id: gesture.id, bounds: previewBounds(gesture.start, event.clientX - gesture.x,
    event.clientY - gesture.y, gesture.mode, gesture.minimum, area.value)};
}
function endGesture(event, commit = false) {
  if (!gesture || (event?.pointerId != null && event.pointerId !== gesture.pointer)) return;
  const current = gesture, bounds = preview.value?.bounds;
  gesture = null; preview.value = null;
  if (current.target.hasPointerCapture?.(current.pointer)) current.target.releasePointerCapture(current.pointer);
  if (commit && bounds && live) action(() => commitBounds(current.id,bounds), false, 'immediate');
}
function keydown(event) {
  if (event.key === 'Escape') {dockPreview.value=null;endGesture(); return;}
  if (!event.altKey && !event.ctrlKey && !event.metaKey && event.target.matches('[data-title], .resize-handle') && event.key.startsWith('Arrow')) {
    const window = windows.value.find(w => frames.get(w.id)?.contains(event.target));
    if (window?.presentation.kind === 'NORMAL') {
      event.preventDefault();
      const mode = event.target.matches('.resize-handle') ? 'resize' : 'move';
      const bounds = previewBounds(window.bounds, event.key === 'ArrowRight' ? 10 : event.key === 'ArrowLeft' ? -10 : 0,
        event.key === 'ArrowDown' ? 10 : event.key === 'ArrowUp' ? -10 : 0, mode, registration(window).definition.minimum_size, area.value);
      action(() => commitBounds(window.id,bounds), false);
    }
    return;
  }
  if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable]')) return;
  const id = focused.value;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); const eligible = windows.value.filter(shown);
    const index = eligible.findIndex(w => w.id === id), delta = event.key === 'ArrowRight' ? 1 : -1;
    if (eligible.length) focusWindow(eligible[(index + delta + eligible.length) % eligible.length].id);
  } else if (id && event.key.toLowerCase() === 'm') {event.preventDefault(); presentation(id, 'minimized');}
  else if (id && event.key.toLowerCase() === 'x') {event.preventDefault(); action(() => close(id));}
}
function visibility() {activePage.value = !document.hidden; if (document.hidden) endGesture();}
async function shellLaunch(id,initial,signal){
 const result=await action(async()=>{
  if(!props.verifiedStorageScope||!props.canPersist()||signal.aborted||!registrations.some(r=>r.definition.id===id))throw Error('Application admission denied');
  const existing=controller.snapshot.apps.find(a=>a.definitionId===id);
  if(existing){const window=controller.snapshot.windows.find(w=>w.appInstanceId===existing.id);await revealArrangedWindow(window.id);return true;}
  const r=registrations.find(r=>r.definition.id===id),bounds=initial?geometry.recover({...initial,width:Math.max(initial.width,r.definition.minimum_size.width),height:Math.max(initial.height,r.definition.minimum_size.height)},r.definition.minimum_size,area.value):undefined;
  await launchApp(controller,id,bounds);return true;
 });if(result!==true)throw result?.error??Error('Application unavailable');
}
onErrorCaptured((error, instance) => {
  const id = instance?.$props?.instanceId;
  if (id) failures.value = new Map(failures.value).set(id, 'Application unavailable');
  report(error); return false;
});
onMounted(async () => {
  document.addEventListener('visibilitychange', visibility); visibility();
  measureArea();
  try {
    const response = await fetch(wasmUrl, {signal: abort.signal, credentials: 'same-origin'});
    if (!live) return;
    if (!response.ok) throw new Error('Runtime asset unavailable');
    const bytes = new Uint8Array(await response.arrayBuffer()); if (!live) return;
    const reduce = await createReducer(bytes); if (!live) return;
    const layoutResponse = await fetch(layoutWasmUrl, {signal: abort.signal, credentials: 'same-origin'});
    if (!layoutResponse.ok) throw new Error('Layout candidate asset unavailable');
    const layout = await createLayout(new Uint8Array(await layoutResponse.arrayBuffer()));
    geometry = createGeometry(layout);arrangements = createArrangement(layout);
    if (!live) return;
    controller = createDesktopController(reduce, {onChange: (value,context) => {if (live) {
      if(context?.arrangement){arrangement.value=context.arrangement;layoutProjection.value=context.projection;}
      snapshot.value = value;
    }}});
    await initializeDesktop(controller); if (!live) return;
    status.value = 'Runtime ready';
    let storage;
    try {if (props.verifiedStorageScope) storage = window.localStorage;} catch {}
    persistence = createLayoutStorage({scope: props.verifiedStorageScope, storage, locks: globalThis.navigator?.locks, canPersist: props.canPersist,
      onStatus: text => {if (live) {layoutStatus.value = text; canRetrySave.value = text.includes('Retry is available');}}});
    const owns = await persistence.acquire(); if (!live) {persistence.dispose();return;}
    if (owns) {
      try {
        await nextTick(); if (!live) return; measureArea();
        const text = persistence.read();
        if (text !== null) {
          const raw=text.length<=65536?JSON.parse(text):null;
          if(raw?.windows?.some(w=>!admitted.has(w.definitionId)))await discovery.refresh();
          const available=catalog.list().map(d=>resolveRegistration(d,registrations)).filter(Boolean);
          const layout = decodeLayout(text, props.verifiedStorageScope, available), mapping = new Map();
          for (const saved of layout.windows) {
            if (!live) return;
            const r=available.find(r=>r.definition.id===saved.definitionId),definition=r.definition;
            if(!admitted.has(saved.definitionId)){await accepted(controller.dispatch('register_definition',definition));admitted.set(saved.definitionId,r);}
            const bounds = measured ? recoverBounds(saved.bounds, definition.minimum_size, area.value) : saved.bounds;
            const created = await launchApp(controller, saved.definitionId, bounds, {focus: false,registration:r});pinned.set(created.appId,r);
            configs.value = new Map(configs.value).set(created.appId, saved.config); mapping.set(saved.key, created.windowId);
            await accepted(controller.dispatch('set_presentation', {window_id: created.windowId, presentation: saved.presentation}));
            await accepted(controller.dispatch('set_visibility', {window_id: created.windowId, visible: saved.visible}));
          }
          if(layout.arrangement)await applyArrangement(arrangements.restore(layout.arrangement,mapping));
          const id = mapping.get(layout.focused), target = controller.snapshot.windows.find(w => w.id === id);
          if (target && shown(target)) await accepted(controller.dispatch('focus_window', id));
          if(layout.skipped.length)throw Error('Unavailable application recovery; original retained');
          layoutStatus.value = 'Layout restored.';
        } else layoutStatus.value = 'Layout persistence ready.';
        saving = true;
      } catch {layoutStatus.value = 'Layout recovery failed. Original record preserved; this session will not overwrite it.';}
    }
    if (!live) return; ready.value = true;
    observer = new ResizeObserver(() => {
      if (!live) return; endGesture();
      if (measureArea()) action(() => recoverWindows(), false);
    });
    observer.observe(surface.value);
  } catch (error) {if (live) status.value = `Runtime unavailable: ${error.message}`;}
});
onUnmounted(() => {
  live = false; abort.abort(); clearInterval(connectorPoll);endGesture(); observer?.disconnect(); controller?.dispose();
  persistence?.dispose();
  document.removeEventListener('visibilitychange', visibility); frames.clear(); descendants.clear();
});
</script>

<template>
  <section class="desktop-root ud-root" data-theme="mos" aria-label="MOS Desktop" @keydown="keydown">
    <h1>MOS Desktop</h1>
    <p class="help">Local shell integration candidate — existing windows and sessions remain host-owned.</p>
    <nav aria-label="Layout arrangement">
      <button :disabled="!ready" @click="arrange('freeform')">Freeform</button>
      <button :disabled="!ready" @click="arrange('tiles')">Tile windows</button>
      <button :disabled="!ready" @click="arrange('tabs')">Tab windows</button>
      <button :disabled="!ready || !arrangement || arrangement.mode !== 'tiled' || !focused" @click="undock">Undock focused window</button>
      <button :disabled="!ready || !focused" @click="previewDock('right')">Preview dock right</button>
      <button :disabled="!ready || !focused" @click="previewDock('tab')">Preview dock tab</button>
      <template v-if="dockPreview"><button @click="commitDock">Apply dock</button><button @click="dockPreview=null">Cancel dock</button></template>
    </nav>
    <p role="status">{{ status }}</p>
    <p role="status">{{ layoutStatus }} <button v-if="canRetrySave" @click="action(() => { saveLayout(); persistence.flush(); }, false, false)">Retry autosave</button></p>
    <p class="help">Keyboard: Alt+Shift+Left/Right switches windows; Alt+Shift+M minimizes; Alt+Shift+X closes. Escape cancels a drag.</p>
    <ShellLayout v-if="ready" :mount="surface" :applications="registrations.filter(r=>r.shell).map(r=>r.definition)" :catalog="catalogService" :scope="verifiedStorageScope" :can-persist="canPersist" :launch="shellLaunch" />
    <div ref="surface" class="desktop-surface" tabindex="-1" aria-label="Desktop workspace">
      <article v-for="(window, index) in windows" :key="window.id" :ref="el => el ? frames.set(window.id, el) : frames.delete(window.id)"
        :data-window-id="window.id" :hidden="!shown(window)" :inert="shown(window) ? undefined : ''"
        class="desktop-window" :class="{focused: focused === window.id}" :style="{...frameStyle(window), zIndex: index + 1}"
        :aria-label="window.title" @pointerdown="focusWindow(window.id)" @focusin="remember(window.id, $event)">
        <header :style="{maxWidth: `${Math.max(96, area.width - (window.presentation.kind === 'MAXIMIZED' ? 0 : window.bounds.x))}px`}"
          @pointerdown.stop="startGesture(window, 'move', $event)" @pointermove="moveGesture"
          @pointerup="endGesture($event, true)" @pointercancel="endGesture($event)" @lostpointercapture="endGesture($event)">
          <span data-title class="window-title" tabindex="0" @keydown.enter="focusWindow(window.id)">{{ window.title }}</span>
          <button v-if="window.capabilities.minimizable" aria-label="Minimize" @click="presentation(window.id, 'minimized')">−</button>
          <button v-if="window.capabilities.maximizable" :aria-label="window.presentation.kind === 'MAXIMIZED' ? 'Restore' : 'Maximize'"
            @click="presentation(window.id, window.presentation.kind === 'MAXIMIZED' ? 'normal' : 'maximized')">□</button>
          <button v-if="window.capabilities.closable" aria-label="Close" @click="endGesture(); action(() => close(window.id))">×</button>
        </header>
        <div class="window-content">
          <p v-if="failures.has(window.appInstanceId)" role="alert">{{ failures.get(window.appInstanceId) }}</p>
          <component v-else :is="registration(window).component" :instance-id="window.appInstanceId" :host="host"
            :config="config(window)" :active="activePage && shown(window)" />
          <form v-if="registration(window).definition.id === 'clock'" @input="rememberDraft(window,$event)" @submit.prevent="updateConfig(window, $event)">
            <label>Locale <input name="locale" :value="fields(window).locale" maxlength="80"></label>
            <label>Time zone <input name="timeZone" :value="fields(window).timeZone" maxlength="80"></label>
            <label><input name="seconds" type="checkbox" :checked="fields(window).seconds"> Seconds</label>
            <label><input name="hour12" type="checkbox" :checked="fields(window).hour12"> 12-hour</label>
            <button>Apply Clock settings</button>
          </form>
        </div>
        <button v-if="window.capabilities.resizable && window.presentation.kind === 'NORMAL'" class="resize-handle" aria-label="Resize window"
          @pointerdown.stop="startGesture(window, 'resize', $event)" @pointermove="moveGesture" @pointerup="endGesture($event, true)"
          @pointercancel="endGesture($event)" @lostpointercapture="endGesture($event)">↘</button>
      </article>
      <div class="reserved-strip" aria-label="Reserved shell strip"></div>
      <div v-if="dockPreview" class="dock-preview" role="status" :style="{left:`${dockPreview.bounds.x}px`,top:`${dockPreview.bounds.y}px`,width:`${dockPreview.bounds.width}px`,height:`${dockPreview.bounds.height}px`}">Dock preview — Apply or Escape to cancel</div>
    </div>
    <nav class="desktop-taskbar" aria-label="Applications">
      <button v-for="app in catalogSnapshot.definitions" :key="app.id" :disabled="!ready || catalogService.availability(app).code!=='available'"
        @click="catalogService.launch(app.id).catch(report)">New {{ app.label }}</button>
      <span aria-hidden="true">|</span>
      <button v-for="window in windows" :key="window.id" :aria-pressed="focused === window.id"
        @click="activateWindow(window.id)">{{ window.title }}{{ window.presentation.kind === 'MINIMIZED' ? ' (minimized)' : '' }}</button>
    </nav>
  </section>
</template>

<style scoped>
/* Presentation lives in the opt-in, boundary-scoped design specimen. */
</style>
