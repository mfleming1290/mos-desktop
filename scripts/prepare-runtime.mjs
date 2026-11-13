import {readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {homedir} from 'node:os';
import {build} from '../page/node_modules/esbuild/lib/main.js';
import {pruneFixture} from './prune-fixture.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const archive = path.resolve(process.argv[2] ?? '');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const archiveHash = '61a2a89a751a7fee7b7734b8077ac2bd4042ef1307871251214feb68d5a6229b';
if (hash(readFileSync(archive)) !== archiveHash) throw Error('SDK ZIP identity mismatch');
const sdk = path.join(root, '.cache/sdk');
function run(command, args, cwd = sdk) {
  const env = {...process.env};
  if (command === 'cargo') {
    if (env.RUSTFLAGS || env.CARGO_ENCODED_RUSTFLAGS) throw Error('Unset ambient Rust flags for the paired build');
    env.RUSTFLAGS = `--remap-path-prefix=${homedir()}=/build-user --remap-path-prefix=${sdk}=/battlemoon-sdk`;
  }
  // npm 11 exports this CLI option to child scripts but rejects it on nested ci.
  // The install below independently disables all dependency scripts.
  for (const key of Object.keys(env)) if (key.toLowerCase() === 'npm_config_allow_scripts') delete env[key];
  const result = spawnSync(command, args, {cwd, env, stdio: 'inherit', shell: process.platform === 'win32' && command === 'npm'});
  if (result.status !== 0) throw Error(`${command} failed (${result.status})`);
}
if (!existsSync(sdk)) {
  mkdirSync(path.dirname(sdk), {recursive: true});
  run(process.platform === 'win32' ? 'python' : 'python3', ['-m', 'zipfile', '-e', archive, sdk], root);
}
const manifest = JSON.parse(readFileSync(path.join(sdk, 'build-pack-manifest.json')));
if (manifest.source.gitCommit !== '704ae0508eb2e26314e8066c9e293b32f9c39339') throw Error('Unexpected SDK source revision');
for (const [file, expected] of Object.entries(manifest.files)) {
  if (hash(readFileSync(path.join(sdk, file))) !== expected) throw Error(`SDK input mismatch: ${file}`);
}
run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund']);
const compiler = spawnSync('rustc', ['--version'], {encoding: 'utf8'});
if (compiler.status !== 0 || !compiler.stdout.startsWith('rustc 1.97.1 ')) throw Error('Use Rust 1.97.1 for the paired build (RUSTUP_TOOLCHAIN may select it without changing defaults)');
if (process.env.CARGO_TARGET_DIR) throw Error('Unset CARGO_TARGET_DIR: this build uses its isolated SDK target directory');
run('cargo', ['build', '--locked', '--release', '--target', 'wasm32-unknown-unknown', '--manifest-path', 'rust/wasm/Cargo.toml']);
const output = path.join(root, 'page/src/generated');
mkdirSync(output, {recursive: true});
await build({stdin: {contents: 'export {createReducer} from "./typescript/wasm.ts"; export {Command} from "./generated/typescript/skirout/runtime_protocol.js"; export {Snapshot} from "./generated/typescript/skirout/runtime_model.js";', resolveDir: sdk, loader: 'js'},
  bundle: true, format: 'esm', platform: 'browser', outfile: path.join(output, 'runtime.mjs'),
  plugins: [{name: 'exclude-test-only-dto', setup(builder) {
    builder.onLoad({filter: /runtime_protocol\.js$/}, args => ({
      contents: pruneFixture(readFileSync(args.path,'utf8')), loader:'js', resolveDir:path.dirname(args.path),
    }));
  }}]});
copyFileSync(path.join(sdk, 'rust/wasm/target/wasm32-unknown-unknown/release/desktop_runtime_wasm.wasm'), path.join(output, 'runtime.wasm'));
const assets = Object.fromEntries(['runtime.mjs','runtime.wasm'].map(file => [file, hash(readFileSync(path.join(output,file)))]));
writeFileSync(path.join(output, 'identity.json'), JSON.stringify({sdkArchiveSha256: archiveHash, sourceRevision: manifest.source.gitCommit, runtimeVersion: manifest.modules.wasm, compiler: compiler.stdout.trim(), buildTransform: 'exclude-test-only-FixtureEnvelope-v1', assets}, null, 2));
console.log(JSON.stringify({status: 'PASS', pairedRuntime: assets}));
