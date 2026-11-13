// Private, local-only SDK build staging. Never include this script in public source.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from '../page/node_modules/esbuild/lib/main.js';
const sdk=path.resolve(process.argv[2]??'../battlemoon-desktop');
const output=fileURLToPath(new URL('../runtime/',import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function run(args){const r=spawnSync('cargo',args,{cwd:sdk,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout;}
const metadata=JSON.parse(run(['metadata','--locked','--offline','--format-version','1','--manifest-path','rust/layout/Cargo.toml']));
const notices=[];
for(const pkg of metadata.packages){
  if(pkg.name==='battlemoon-layout')continue;
  assert(['MIT OR Apache-2.0','Unlicense OR MIT','(MIT OR Apache-2.0) AND Unicode-3.0','Apache-2.0 OR BSL-1.0'].includes(pkg.license),`Review license ${pkg.name}: ${pkg.license}`);
  const directory=path.dirname(pkg.manifest_path), files=readdirSync(directory).filter(f=>/^(LICENSE|NOTICE)($|[-.])/.test(f)).sort();
  assert(files.length,`Missing notices ${pkg.name}`);
  for(const f of files)notices.push(`===== ${pkg.name} ${pkg.version} (${pkg.license}) / ${f} =====\n${readFileSync(path.join(directory,f),'utf8')}`);
}
const wasm=readFileSync(path.join(sdk,'rust/layout/target/wasm32-unknown-unknown/release/battlemoon_layout.wasm'));
assert.equal(WebAssembly.Module.imports(new WebAssembly.Module(wasm)).length,0);
const bundle=await build({entryPoints:[path.join(sdk,'typescript/layout.ts')],bundle:true,format:'esm',write:false,minify:true,sourcemap:false});
const wrapper=bundle.outputFiles[0].contents;
writeFileSync(path.join(output,'layout.wasm'),wasm);writeFileSync(path.join(output,'layout.mjs'),wrapper);
writeFileSync(path.join(output,'LAYOUT-NOTICES.txt'),'Battle-owned compiled layout candidate; no raw private SDK source distribution.\n\n'+notices.join('\n\n'));
const inputs=['Cargo.toml','Cargo.lock','src/lib.rs','src/grid.rs','src/tree.rs','src/composition.rs','src/bridge.rs'];
const sourceAssets=Object.fromEntries(inputs.map(f=>[f,hash(readFileSync(path.join(sdk,'rust/layout',f)))]));
sourceAssets['typescript/layout.ts']=hash(readFileSync(path.join(sdk,'typescript/layout.ts')));
writeFileSync(path.join(output,'layout-identity.json'),JSON.stringify({candidate:'L1-test-only',baseline:'b688d2dc8ed994687c7437b71892caa92a115e0e',sourceState:'reviewed-uncommitted-candidate',rust:'1.97.1',features:[],buildTransform:'remap SDK root to /sdk and user root to /build',sourceAssets,assets:{'layout.wasm':hash(wasm),'layout.mjs':hash(wrapper),'LAYOUT-NOTICES.txt':hash(readFileSync(path.join(output,'LAYOUT-NOTICES.txt')))}},null,2)+'\n');
console.log('PASS compiled layout, minimum wrapper, pinned source hashes and reviewed notices staged');
