import {createReducer, Command, Snapshot} from './generated/runtime.mjs';
import wasmUrl from './generated/runtime.wasm?url';

// Per-route acquisition; no process/session authority and no persistent fallback.
export async function runCanary({signal, fetchAsset = fetch, instantiate = createReducer} = {}) {
  const response = await fetchAsset(wasmUrl, {signal, credentials: 'same-origin'});
  if (signal?.aborted) return null;
  if (!response.ok) throw new Error('Runtime asset unavailable');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (signal?.aborted) return null;
  const reduce = await instantiate(bytes);
  if (signal?.aborted) return null;
  const initial = Snapshot.serializer.fromJsonCode(JSON.stringify({
    revision: 0, definitions: [], apps: [], windows: [], workspaces: [],
  }));
  const command = Command.serializer.fromJsonCode(JSON.stringify({
    id: 'mos-m0-create-workspace', aggregate_id: 'mos-m0', expected_revision: 0,
    payload: {kind: 'create_workspace', value: {
      id: 'mos-m0-workspace', app_instance_ids: [], window_ids: [],
      focused_window_id: null, revision: 0,
    }},
  }));
  const result = reduce('mos-m0', initial, command);
  if (result.kind !== 'accepted') throw new Error('Runtime canary command rejected');
  const snapshot = result.value.snapshot;
  return {revision: String(snapshot.revision), workspaces: snapshot.workspaces.length,
    apps: snapshot.apps.length, windows: snapshot.windows.length};
}
