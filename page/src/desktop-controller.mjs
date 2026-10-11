import {Command, Snapshot} from './generated/runtime.mjs';

// One route owns one snapshot. The SDK remains the only semantic state engine.
export function createDesktopController(reduce, {aggregateId = crypto.randomUUID(), onChange = () => {}} = {}) {
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
