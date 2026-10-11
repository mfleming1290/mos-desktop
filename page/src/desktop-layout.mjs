// Host-owned intentions, never raw snapshots or process-state claims.
export function encodeLayout(snapshot, configs, scope) {
  return JSON.stringify({schemaVersion: 1, scope, windows: snapshot.workspaces[0].windowIds.map(id => {
    const window = snapshot.windows.find(w => w.id === id);
    const app = snapshot.apps.find(a => a.id === window.appInstanceId);
    return {key: window.id, definitionId: app.definitionId, bounds: window.restoredBounds ?? window.bounds,
      presentation: window.presentation.kind.toLowerCase(), visible: window.visible, config: configs.get(app.id) ?? {}};
  }), focused: snapshot.workspaces[0].focusedWindowId});
}
export function decodeLayout(text, scope, registrations) {
  if (typeof text !== 'string' || text.length > 65536) throw new Error('Layout exceeds supported size');
  const record = JSON.parse(text);
  if (record.schemaVersion !== 1 || record.scope !== scope || !Array.isArray(record.windows) || record.windows.length > 32)
    throw new Error('Unsupported layout version or storage scope');
  const keys = new Set(), skipped = [], windows = [];
  for (const window of record.windows) {
    if (!window || typeof window.key !== 'string' || !window.key || window.key.length > 100 || keys.has(window.key)) throw new Error('Invalid layout identity');
    keys.add(window.key);
    const registration = registrations.find(r => r.definition.id === window.definitionId);
    if (!registration) {skipped.push('Unavailable application'); continue;}
    if (!registration.definition.multiple_instances && windows.some(w => w.definitionId === window.definitionId)) {skipped.push('Duplicate single-instance application'); continue;}
    if (!window.bounds || !['x','y','width','height'].every(k => typeof window.bounds[k] === 'number' && Number.isFinite(window.bounds[k]) && Math.abs(window.bounds[k]) <= 100000)
      || window.bounds.width <= 0 || window.bounds.height <= 0 || typeof window.visible !== 'boolean'
      || !['normal','maximized','minimized'].includes(window.presentation)) throw new Error('Invalid layout geometry or presentation');
    const checked = registration.validate(window.config);
    if (checked.code !== 'success') skipped.push('Invalid app configuration replaced with defaults');
    windows.push({...window, config: checked.code === 'success' ? checked.value : registration.defaults});
  }
  if (record.focused !== null && (typeof record.focused !== 'string' || !keys.has(record.focused))) throw new Error('Invalid layout focus');
  return {windows, focused: record.focused, skipped};
}

// A verified host scope is mandatory. Missing Web Locks means memory-only, not a fake lock.
export function createLayoutStorage({scope, storage, locks, canPersist = () => true, onStatus = () => {}}) {
  let writer = false, disposed = false, release, pending, timer, saved = 0;
  const key = `mos-desktop:layout:1:${scope}`;
  const available = typeof scope === 'string' && scope.length > 0 && scope.length <= 200 && storage && locks;
  return {
    async acquire() {
      if (!available) {onStatus('Temporary layout: verified host scope and Web Locks are required.'); return false;}
      return new Promise(resolve => {
        locks.request(key, {mode: 'exclusive', ifAvailable: true}, async lock => {
          if (!lock || disposed) {onStatus('Temporary layout: another tab owns persistence.'); resolve(false); return;}
          writer = true; resolve(true);
          await new Promise(done => {release = done;}); writer = false;
        }).catch(() => {onStatus('Temporary layout: storage ownership unavailable.'); resolve(false);});
      });
    },
    read() {
      if (!writer || disposed || !canPersist()) throw new Error('Layout identity unavailable');
      try {return storage.getItem(key);} catch {throw new Error('Layout read failed; source record preserved.');}
    },
    save(text) {
      if (!writer || disposed || !canPersist()) return;
      pending = text; clearTimeout(timer);
      onStatus('Saving layout…');
      timer = setTimeout(() => this.flush(), 200);
    },
    flush() {
      clearTimeout(timer);
      if (!writer || disposed || pending === undefined || !canPersist()) return;
      try {storage.setItem(key, pending); pending = undefined; onStatus(`Layout saved (#${++saved}).`);}
      catch {onStatus('Layout changes are not saved; previous record preserved. Retry is available.');}
    },
    dispose() {this.flush(); disposed = true; writer = false; clearTimeout(timer); release?.();},
    get writable() {return writer && !disposed;},
  };
}
