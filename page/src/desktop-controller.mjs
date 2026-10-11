import {Command, Snapshot} from './generated/runtime.mjs';

// Browser-owned identities, not credentials. getRandomValues also works on HTTP.
export function createDesktopId() {
  const source = globalThis.crypto;
  if (typeof source?.randomUUID === 'function') return source.randomUUID();
  if (typeof source?.getRandomValues !== 'function') throw new Error('Browser secure random source unavailable');
  const bytes = source.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

// One route owns one snapshot. The SDK remains the only semantic state engine.
export function createDesktopController(reduce, {aggregateId = createDesktopId(), onChange = () => {}} = {}) {
  let snapshot = Snapshot.serializer.fromJsonCode('{"revision":0}');
  let disposed = false;
  let fault = null;
  let tail = Promise.resolve();
  let sequence = 0;
  function dispatch(kind, value, expectedRevision) {
    const operation = tail.then(() => {
      if (disposed) throw new Error('Desktop route disposed');
      if (fault) throw new Error('Desktop runtime unavailable', {cause: fault});
      try {
        // Generated codecs accept decimal strings without rounding signed int64.
        const command = Command.serializer.fromJsonCode(JSON.stringify({
          id: `${aggregateId}:${++sequence}`, aggregate_id: aggregateId,
          expected_revision: String(expectedRevision ?? snapshot.revision),
          payload: {kind, value},
        }));
        const result = reduce(aggregateId, snapshot, command);
        if (result.kind === 'accepted') {
          snapshot = result.value.snapshot;
          onChange(snapshot);
        }
        return result;
      } catch (error) {
        fault = error;
        throw error;
      }
    });
    tail = operation.catch(() => {});
    return operation;
  }
  return {dispatch, get snapshot() {return snapshot;},
    get fault() {return fault;}, dispose() {disposed = true;}};
}
