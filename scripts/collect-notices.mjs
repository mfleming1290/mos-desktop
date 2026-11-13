// Local build input inspection only; no registry, service or publication workflow.
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const sdk = path.join(root, '.cache/sdk');
function command(name, args) {
  const result = spawnSync(name, args, {cwd: sdk, encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
const metadata = JSON.parse(command('cargo', ['metadata', '--locked', '--offline', '--format-version', '1', '--manifest-path', 'rust/wasm/Cargo.toml']));
const sections = [];
function include(label, filename) {
  sections.push(`===== ${label} =====\n${readFileSync(filename, 'utf8')}\n`);
}
const allowed = new Set(['MIT OR Apache-2.0', 'Unlicense OR MIT', '(MIT OR Apache-2.0) AND Unicode-3.0', 'MIT']);
for (const pkg of metadata.packages.sort((a,b) => a.name.localeCompare(b.name))) {
  if (['desktop-runtime-core','desktop-runtime-wasm'].includes(pkg.name)) continue;
  assert(allowed.has(pkg.license), `Review changed licensing: ${pkg.name}: ${pkg.license}`);
  const directory = path.dirname(pkg.manifest_path);
  const files = readdirSync(directory).filter(file => /^LICENSE(?:$|[-.])|^NOTICE(?:$|[-.])/.test(file)).sort();
  assert(files.length, `Missing notices: ${pkg.name}`);
  for (const file of files) include(`${pkg.name} ${pkg.version} (${pkg.license}) / ${file}`, path.join(directory,file));
}
for (const [label, filename] of [
  ['skir-client 1.0.19 / MIT', '.cache/sdk/node_modules/skir-client/LICENSE'],
  ['federation 1.3.5 / MulanPSL-2.0', 'page/node_modules/@originjs/vite-plugin-federation/LICENSE'],
  ['Vite 7.3.7 and bundled helper notices', 'page/node_modules/vite/LICENSE.md'],
]) include(label, path.join(root,filename));
for (const [directory, version] of [
  ['.cache/sdk/node_modules/skir-client','1.0.19'],
  ['page/node_modules/@originjs/vite-plugin-federation','1.3.5'],
  ['page/node_modules/vite','7.3.7'],
]) assert.equal(JSON.parse(readFileSync(path.join(root,directory,'package.json'))).version, version);
assert(command('rustc', ['--version']).startsWith('rustc 1.97.1 '));
const rustDocs = path.join(command('rustc', ['--print','sysroot']), 'share/doc/rust');
include('Rust 1.97.1 standard library copyright inventory', path.join(rustDocs,'COPYRIGHT-library.html'));
for (const file of readdirSync(path.join(rustDocs,'licenses')).sort()) {
  if (file.endsWith('.txt')) include(`Rust supplied license text / ${file}`, path.join(rustDocs,'licenses',file));
}
writeFileSync(path.join(root,'page/src/generated/THIRD-PARTY-NOTICES.txt'),
  'Dependency notices retained conservatively, including build-time crates. Presence is not a claim that every listed dependency is linked. Vue is supplied by MOS, not bundled. Battle-owned compiled runtime distribution is user-approved for this plugin; no new public SDK source license is granted here.\n\n' + sections.join('\n'));
console.log(JSON.stringify({status:'PASS', thirdPartyCrates:metadata.packages.length-2, notices:sections.length}));
