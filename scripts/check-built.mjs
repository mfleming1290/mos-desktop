import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import config from '../page/plugin.config.js';
const directory = new URL('../page/dist/desktop/', import.meta.url);
const files = readdirSync(directory);
const manifest = JSON.parse(readFileSync(new URL('manifest.json',directory)));
assert.deepEqual(manifest, config);
assert(files.includes('remoteEntry.js'));
assert(files.every(file => /^(manifest\.json|remoteEntry\.js|(runtime|layout)-[\w-]+\.wasm|__federation_(expose_Plugin|fn_import)-[\w-]+\.js|__federation_expose_Plugin-[\w-]+\.css|(PersonalHome|PersonalTerminal)-[\w-]+\.(js|css)|(desktop-controller|_plugin-vue_export-helper)-[\w-]+\.js)$/.test(file)), 'Unexpected distribution asset');
assert.equal(files.filter(file => file.endsWith('.wasm')).length, 2);
const layoutIdentity=JSON.parse(readFileSync(new URL('../runtime/layout-identity.json',import.meta.url)));
for(const [file,digest] of Object.entries(layoutIdentity.assets))assert.equal(createHash('sha256').update(readFileSync(new URL(`../runtime/${file}`,import.meta.url))).digest('hex'),digest);
const layoutFile=files.find(file=>/^layout-.*\.wasm$/.test(file));
assert.equal(createHash('sha256').update(readFileSync(new URL(layoutFile,directory))).digest('hex'),layoutIdentity.assets['layout.wasm']);
assert(!files.some(file => /__federation_shared_vue/.test(file)), 'Host Vue must not be bundled');
const identity = JSON.parse(readFileSync(new URL('../page/src/generated/identity.json',import.meta.url)));
assert.deepEqual(Object.keys(identity.assets).sort(), ['runtime.mjs','runtime.wasm']);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const lock = JSON.parse(readFileSync(new URL('../page/package-lock.json',import.meta.url)));
assert.equal(lock.packages['node_modules/@xterm/xterm'].version,'6.0.0');
assert(readFileSync(new URL('../runtime/XTERM-NOTICES.txt',import.meta.url),'utf8').includes('Permission is hereby granted'));
for (const [name, filename, digest] of [
  ['clock','battlemoon-clock-0.1.1.tgz','fc21c9289ab21af48277b002f1c1dd5965f1dff6fd750eb28f573aa9966fe889'],
  ['component-contracts','battlemoon-component-contracts-0.1.1.tgz','f258196f0a2571db195c32057ef2a60f487a9d247a2eb3f8960869d81d5b8a7d'],
]) {
  const bytes = readFileSync(new URL(`../.cache/components/${filename}`,import.meta.url));
  assert.equal(hash(bytes),digest);
  const entry = lock.packages[`node_modules/@battlemoon/${name}`];
  assert.equal(entry.version,'0.1.1');
  assert.equal(entry.integrity,`sha512-${createHash('sha512').update(bytes).digest('base64')}`);
}
for (const [file, expected] of Object.entries(identity.assets)) {
  assert.equal(hash(readFileSync(new URL(`../page/src/generated/${file}`,import.meta.url))), expected);
}
const wasmFile = files.find(file => /^runtime-.*\.wasm$/.test(file));
assert.equal(hash(readFileSync(new URL(wasmFile,directory))), identity.assets['runtime.wasm']);
const forbidden = /[HC]:\\(?:code|Users)|\/home\/matt\/|@tauri-apps|node:fs|gh[pousr]_[A-Za-z0-9]{20}/;
for (const file of files) assert(!forbidden.test(readFileSync(new URL(file,directory)).toString('latin1')), `Private path or secret pattern in ${file}`);
const scripts = files.filter(file => file.endsWith('.js')).map(file => readFileSync(new URL(file,directory),'utf8')).join('\n');
assert(!/FixtureEnvelope|lifecycle\.json|sourceMappingURL/.test(scripts), 'Fixtures/source maps must not be distributed');
assert(!/H:\\code|C:\\Users|@tauri-apps|node:fs|gh[pousr]_[A-Za-z0-9]{20}/.test(scripts));
assert(scripts.includes('import.meta.url'), 'WASM URL must be module-relative');
console.log(JSON.stringify({status: 'PASS', plugin: config.name, version: config.version, files,
  sourceRevision: identity.sourceRevision, wasmSha256: identity.assets['runtime.wasm'], actualMOS: 'NOT RUN'}));
