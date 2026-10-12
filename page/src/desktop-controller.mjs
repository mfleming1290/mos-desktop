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
  function dispatchBatch(commands, expectedRevision, publication) {
    // Capture the caller's proposal before it waits behind another operation.
    const proposal = structuredClone(commands);
    const context = publication === undefined ? undefined : structuredClone(publication);
    const operation = tail.then(() => {
      if (disposed) throw new Error('Desktop route disposed');
      if (fault) throw new Error('Desktop runtime unavailable', {cause: fault});
      try {
        // Generated codecs accept decimal strings without rounding signed int64.
        let candidate = snapshot;
        let finalResult;
        const events = [];
        // A batch is validated privately using the existing semantic authority.
        // Nothing is published if any command rejects. Host persistence remains separate.
        if (!Array.isArray(proposal) || proposal.length === 0 || proposal.length > 1024)
          throw new Error('Invalid desktop command batch');
        for (let index = 0; index < proposal.length; index++) {
          const {kind, value} = proposal[index];
          const command = Command.serializer.fromJsonCode(JSON.stringify({
          id: `${aggregateId}:${++sequence}`, aggregate_id: aggregateId,
          expected_revision: String(index === 0 ? expectedRevision ?? candidate.revision : candidate.revision),
          payload: {kind, value},
          }));
          finalResult = reduce(aggregateId, candidate, command);
          if (finalResult.kind !== 'accepted') return finalResult;
          candidate = finalResult.value.snapshot;
          events.push(...finalResult.value.events);
        }
        snapshot = candidate;
        onChange(snapshot, context);
        // Single dispatch retains its generated result type; the host-only batch
        // receipt accumulates all events without extending the frozen wire API.
        return proposal.length === 1 ? finalResult : Object.freeze({kind:'accepted',
          value:Object.freeze({snapshot:candidate,events:Object.freeze(events)})});
      } catch (error) {
        fault = error;
        throw error;
      }
    });
    tail = operation.catch(() => {});
    return operation;
  }
  const dispatch = (kind, value, expectedRevision) => dispatchBatch([{kind, value}], expectedRevision);
  return {dispatch, dispatchBatch, get snapshot() {return snapshot;},
    get fault() {return fault;}, dispose() {disposed = true;}};
}
