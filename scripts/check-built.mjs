import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import config from '../page/plugin.config.js';
const directory = new URL('../page/dist/desktop/', import.meta.url);
const files = readdirSync(directory);
const manifest = JSON.parse(readFileSync(new URL('manifest.json',directory)));
assert.deepEqual(manifest, config);
assert(files.includes('remoteEntry.js'));
assert(files.every(file => /^(manifest\.json|remoteEntry\.js|runtime-[\w-]+\.wasm|__federation_(expose_Plugin|fn_import)-[\w-]+\.js)$/.test(file)), 'Unexpected distribution asset');
assert.equal(files.filter(file => file.endsWith('.wasm')).length, 1);
assert(!files.some(file => /__federation_shared_vue/.test(file)), 'Host Vue must not be bundled');
const identity = JSON.parse(readFileSync(new URL('../page/src/generated/identity.json',import.meta.url)));
assert.deepEqual(Object.keys(identity.assets).sort(), ['runtime.mjs','runtime.wasm']);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [file, expected] of Object.entries(identity.assets)) {
  assert.equal(hash(readFileSync(new URL(`../page/src/generated/${file}`,import.meta.url))), expected);
}
const wasmFile = files.find(file => file.endsWith('.wasm'));
assert.equal(hash(readFileSync(new URL(wasmFile,directory))), identity.assets['runtime.wasm']);
const forbidden = /[HC]:\\(?:code|Users)|\/home\/matt\/|@tauri-apps|node:fs|gh[pousr]_[A-Za-z0-9]{20}/;
for (const file of files) assert(!forbidden.test(readFileSync(new URL(file,directory)).toString('latin1')), `Private path or secret pattern in ${file}`);
const scripts = files.filter(file => file.endsWith('.js')).map(file => readFileSync(new URL(file,directory),'utf8')).join('\n');
assert(!/FixtureEnvelope|lifecycle\.json|sourceMappingURL/.test(scripts), 'Fixtures/source maps must not be distributed');
assert(!/H:\\code|C:\\Users|@tauri-apps|node:fs|gh[pousr]_[A-Za-z0-9]{20}/.test(scripts));
assert(scripts.includes('import.meta.url'), 'WASM URL must be module-relative');
console.log(JSON.stringify({status: 'PASS', plugin: config.name, version: config.version, files,
  sourceRevision: identity.sourceRevision, wasmSha256: identity.assets['runtime.wasm'], actualMOS: 'NOT RUN'}));
