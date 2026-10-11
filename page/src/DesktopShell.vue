<script setup>
import {shallowRef, ref, computed, onMounted, onUnmounted, nextTick, onErrorCaptured} from 'vue';
import {createReducer} from './generated/runtime.mjs';
import wasmUrl from './generated/runtime.wasm?url';
import {createDesktopController} from './desktop-controller.mjs';
import {registrations, initializeDesktop, launchApp, revealWindow, closeWindow, accepted} from './desktop-apps.mjs';
import {previewBounds, recoverBounds} from './desktop-geometry.mjs';
import {encodeLayout, decodeLayout, createLayoutStorage} from './desktop-layout.mjs';

// Only the trusted host may supply this; never infer it from browser UI or a display name.
const props = defineProps({verifiedStorageScope: {type: String, default: ''}, canPersist: {type: Function, default: () => true}});
const surface = ref(), snapshot = shallowRef(), status = ref('Loading runtime…');
const ready = ref(false), layoutStatus = ref('Temporary layout'), canRetrySave = ref(false);
const area = shallowRef({width: 800, height: 520}), preview = shallowRef(null);
const configs = shallowRef(new Map()), activePage = ref(true), failures = shallowRef(new Map());
const abort = new AbortController();
let controller, observer, gesture, persistence, live = true, saving = false, measured = false, actions = Promise.resolve();
const frames = new Map(), descendants = new Map();
const host = Object.freeze({readTime: async (_id, cancellation) => cancellation.aborted
  ? {code: 'cancelled', message: 'Cancelled'} : {code: 'success', value: Date.now()},
  schedule: (callback, interval) => {const timer = setInterval(callback, interval); return () => clearInterval(timer);}});
const windows = computed(() => {
  const s = snapshot.value;
  return s?.workspaces[0] ? s.workspaces[0].windowIds.map(id => s.windows.find(w => w.id === id)) : [];
});
const focused = computed(() => snapshot.value?.workspaces[0]?.focusedWindowId);
const registration = window => registrations.find(r => r.definition.id === snapshot.value.apps.find(a => a.id === window.appInstanceId)?.definitionId);
const shown = window => window.visible && window.presentation.kind !== 'MINIMIZED';
const config = window => configs.value.get(window.appInstanceId) ?? registration(window).defaults;
const frameStyle = window => {
  const bounds = preview.value?.id === window.id ? preview.value.bounds : window.presentation.kind === 'MAXIMIZED'
    ? {x: 0, y: 0, ...area.value} : window.bounds;
  return {left: `${bounds.x}px`, top: `${bounds.y}px`, width: `${bounds.width}px`, height: `${bounds.height}px`};
};
function report(error) {if (live) status.value = error.message ?? 'Desktop action failed';}
function saveLayout() {if (saving && live && persistence?.writable) persistence.save(encodeLayout(controller.snapshot, configs.value, props.verifiedStorageScope));}
function measureArea() {
  const width = surface.value?.clientWidth, height = surface.value?.clientHeight;
  if (!(width > 0 && height > 0)) return false;
  area.value = {width, height}; measured = true; return true;
}
async function recoverWindows() {
  if (!measured) return; // A hidden/unmeasured mount must not rewrite saved geometry.
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
    try {await fn(); await recoverWindows(); if (persist) saveLayout(); if (live && focus) await reconcileFocus();} catch (error) {report(error);}
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
const focusWindow = id => action(() => accepted(controller.dispatch('focus_window', id)));
const presentation = (id, value) => action(() => accepted(controller.dispatch('set_presentation', {window_id: id, presentation: value})));
function remember(id, event) {descendants.set(id, event.target);if (focused.value !== id && ready.value) focusWindow(id);}
function updateConfig(window, event) {
  const form = event.currentTarget;
  const next = {locale: form.elements.locale.value, timeZone: form.elements.timeZone.value,
    seconds: form.elements.seconds.checked, hour12: form.elements.hour12.checked};
  const result = registration(window).validate(next);
  if (result.code !== 'success') {report(new Error(result.message)); return;}
  configs.value = new Map(configs.value).set(window.appInstanceId, result.value);
  saveLayout();
}
async function close(id) {
  const window = controller.snapshot.windows.find(w => w.id === id);
  await closeWindow(controller, id);
  descendants.delete(id);
  if (window) {const next = new Map(configs.value);next.delete(window.appInstanceId);configs.value = next;}
}
function startGesture(window, mode, event) {
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
  if (commit && bounds && live) action(() => accepted(controller.dispatch('set_bounds', {window_id: current.id, bounds})), false);
}
function keydown(event) {
  if (event.key === 'Escape') {endGesture(); return;}
  if (!event.altKey && !event.ctrlKey && !event.metaKey && event.target.matches('[data-title], .resize-handle') && event.key.startsWith('Arrow')) {
    const window = windows.value.find(w => frames.get(w.id)?.contains(event.target));
    if (window?.presentation.kind === 'NORMAL') {
      event.preventDefault();
      const mode = event.target.matches('.resize-handle') ? 'resize' : 'move';
      const bounds = previewBounds(window.bounds, event.key === 'ArrowRight' ? 10 : event.key === 'ArrowLeft' ? -10 : 0,
        event.key === 'ArrowDown' ? 10 : event.key === 'ArrowUp' ? -10 : 0, mode, registration(window).definition.minimum_size, area.value);
      action(() => accepted(controller.dispatch('set_bounds', {window_id: window.id, bounds})), false);
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
    controller = createDesktopController(reduce, {onChange: value => {if (live) snapshot.value = value;}});
    await initializeDesktop(controller); if (!live) return;
    status.value = 'Runtime ready';
    let storage;
    try {if (props.verifiedStorageScope) storage = window.localStorage;} catch {}
    persistence = createLayoutStorage({scope: props.verifiedStorageScope, storage, locks: globalThis.navigator?.locks, canPersist: props.canPersist,
      onStatus: text => {if (live) layoutStatus.value = text;}});
    const owns = await persistence.acquire(); if (!live) {persistence.dispose();return;}
    if (owns) {
      try {
        await nextTick(); if (!live) return; measureArea();
        const text = persistence.read();
        if (text !== null) {
          const layout = decodeLayout(text, props.verifiedStorageScope, registrations), mapping = new Map();
          for (const saved of layout.windows) {
            if (!live) return;
            const definition = registrations.find(r => r.definition.id === saved.definitionId).definition;
            const bounds = measured ? recoverBounds(saved.bounds, definition.minimum_size, area.value) : saved.bounds;
            const created = await launchApp(controller, saved.definitionId, bounds, {focus: false});
            configs.value = new Map(configs.value).set(created.appId, saved.config); mapping.set(saved.key, created.windowId);
            await accepted(controller.dispatch('set_presentation', {window_id: created.windowId, presentation: saved.presentation}));
            await accepted(controller.dispatch('set_visibility', {window_id: created.windowId, visible: saved.visible}));
          }
          const id = mapping.get(layout.focused), target = controller.snapshot.windows.find(w => w.id === id);
          if (target && shown(target)) await accepted(controller.dispatch('focus_window', id));
          layoutStatus.value = layout.skipped.length ? `Layout recovered: ${layout.skipped.join('; ')}` : 'Layout restored.';
        } else layoutStatus.value = 'Layout persistence ready.';
        saving = true;canRetrySave.value = true;
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
  live = false; abort.abort(); endGesture(); observer?.disconnect(); controller?.dispose();
  persistence?.dispose();
  document.removeEventListener('visibilitychange', visibility); frames.clear(); descendants.clear();
});
</script>

<template>
  <section class="desktop-root" aria-label="MOS Desktop" @keydown="keydown">
    <h1>MOS Desktop</h1>
    <p role="status">{{ status }}</p>
    <p role="status">{{ layoutStatus }} <button v-if="canRetrySave" @click="action(() => { saveLayout(); persistence.flush(); }, false, false)">Save layout</button></p>
    <p class="help">Keyboard: Alt+Shift+Left/Right switches windows; Alt+Shift+M minimizes; Alt+Shift+X closes. Escape cancels a drag.</p>
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
          <form v-if="registration(window).definition.id === 'clock'" @submit.prevent="updateConfig(window, $event)">
            <label>Locale <input name="locale" :value="config(window).locale" maxlength="80"></label>
            <label>Time zone <input name="timeZone" :value="config(window).timeZone" maxlength="80"></label>
            <label><input name="seconds" type="checkbox" :checked="config(window).seconds"> Seconds</label>
            <label><input name="hour12" type="checkbox" :checked="config(window).hour12"> 12-hour</label>
            <button>Apply Clock settings</button>
          </form>
        </div>
        <button v-if="window.capabilities.resizable && window.presentation.kind === 'NORMAL'" class="resize-handle" aria-label="Resize window"
          @pointerdown.stop="startGesture(window, 'resize', $event)" @pointermove="moveGesture" @pointerup="endGesture($event, true)"
          @pointercancel="endGesture($event)" @lostpointercapture="endGesture($event)">↘</button>
      </article>
    </div>
    <nav class="desktop-taskbar" aria-label="Applications">
      <button v-for="app in registrations" :key="app.definition.id" :disabled="!ready"
        @click="action(() => launchApp(controller, app.definition.id))">New {{ app.definition.display_name }}</button>
      <span aria-hidden="true">|</span>
      <button v-for="window in windows" :key="window.id" :aria-pressed="focused === window.id"
        @click="action(() => revealWindow(controller, window.id))">{{ window.title }}{{ shown(window) ? '' : ' (minimized)' }}</button>
    </nav>
  </section>
</template>

<style scoped>
.desktop-root{color:#eee;background:#17212d;padding:12px;font-family:system-ui,sans-serif}
h1{font-size:1.3rem;margin:0}.help{font-size:.8rem;color:#c6d2e2}
.desktop-surface{position:relative;height:clamp(360px,65vh,900px);overflow:hidden;background:#101820;border:1px solid #6b819a}
.desktop-window{position:absolute;box-sizing:border-box;background:#202c3c;border:1px solid #73849a;box-shadow:0 4px 16px #0008;display:flex;flex-direction:column}
.desktop-window[hidden]{display:none}.desktop-window.focused{border-color:#a5ceff}
header{display:flex;min-height:34px;background:#35465c;touch-action:none;flex-shrink:0;cursor:move}
button,input{font:inherit}button{background:#2c3d52;color:#fff;border:1px solid #899cb4;padding:5px 8px;cursor:pointer}
button:focus-visible,input:focus-visible{outline:2px solid #f8d675;outline-offset:-2px}
.window-title{flex:1;min-width:0;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:0;background:transparent;cursor:move;padding:5px}
.window-content{padding:12px;overflow:auto;flex:1;min-height:0}output{display:block;font-size:1.5rem}
form{display:grid;gap:6px;margin-top:12px}label{display:block;font-size:.85rem}input:not([type=checkbox]){box-sizing:border-box;width:100%}
.resize-handle{position:absolute;right:0;bottom:0;touch-action:none;cursor:nwse-resize;padding:0 4px}
.desktop-taskbar{display:flex;gap:6px;align-items:center;flex-wrap:wrap;min-height:44px;padding-top:8px}
</style>
