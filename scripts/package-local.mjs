import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, copyFileSync, readdirSync, writeFileSync, readFileSync, existsSync, chmodSync, utimesSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import config from '../page/plugin.config.js';

const pkg = JSON.parse(readFileSync(new URL('../page/package.json',import.meta.url)));
assert.notEqual(pkg.mosDesktopReleaseReady, false, 'Candidate is not approved for immutable packaging');
assert.equal(process.platform, 'linux', 'Package on the authorized Linux build host');
const root = fileURLToPath(new URL('../', import.meta.url));
for (const script of ['stage-runtime.mjs','check-built.mjs']) {
  const checked = spawnSync(process.execPath, [path.join(root,'scripts',script)], {encoding:'utf8'});
  assert.equal(checked.status, 0, checked.stdout + checked.stderr);
}
const output = path.resolve(root, process.argv[2] ?? 'artifacts');
mkdirSync(output, {recursive: true});
const filename = `desktop_${config.version}-1+mos-plugin_all.deb`;
assert(!existsSync(path.join(output, filename)), 'Refusing to overwrite a candidate artifact');
const staging = mkdtempSync(path.join(output, '.package-'));
chmodSync(staging, 0o755);
const web = path.join(staging, 'var/www/mos-plugins/desktop');
mkdirSync(web, {recursive: true, mode: 0o755});
mkdirSync(path.join(staging,'DEBIAN'), {mode: 0o755});
const docs = path.join(staging,'usr/share/doc/mos-desktop-plugin');
mkdirSync(docs, {recursive:true,mode:0o755});
copyFileSync(path.join(root,'page/src/generated/THIRD-PARTY-NOTICES.txt'),path.join(docs,'THIRD-PARTY-NOTICES.txt'));
copyFileSync(path.join(root,'page/src/generated/identity.json'),path.join(docs,'runtime-provenance.json'));
copyFileSync(path.join(root,'runtime/LAYOUT-NOTICES.txt'),path.join(docs,'LAYOUT-NOTICES.txt'));
copyFileSync(path.join(root,'runtime/layout-identity.json'),path.join(docs,'layout-provenance.json'));
copyFileSync(path.join(root,'runtime/XTERM-NOTICES.txt'),path.join(docs,'XTERM-NOTICES.txt'));
for (const file of readdirSync(path.join(root, 'page/dist/desktop'))) {
  copyFileSync(path.join(root, 'page/dist/desktop', file), path.join(web, file));
}
writeFileSync(path.join(staging, 'DEBIAN/control'), `Package: mos-desktop-plugin\nVersion: ${config.version}-1+mos-plugin\nArchitecture: all\nMaintainer: mfleming1290\nDescription: MOS Desktop with shared Clock and bounded LXC controls\n`);
function normalize(directory) {
  for (const entry of readdirSync(directory,{withFileTypes:true})) {
    const file = path.join(directory,entry.name);
    if (entry.isDirectory()) normalize(file);
    else {chmodSync(file,0o644);utimesSync(file,0,0);}
  }
  chmodSync(directory,0o755);utimesSync(directory,0,0);
}
normalize(staging);
const result = spawnSync('dpkg-deb', ['--root-owner-group','--build',staging,path.join(output,filename)], {encoding:'utf8',env:{...process.env,SOURCE_DATE_EPOCH:'0'}});
assert.equal(result.status, 0, result.stdout + result.stderr);
const sha256 = createHash('sha256').update(readFileSync(path.join(output,filename))).digest('hex');
writeFileSync(path.join(output, filename + '.sha256'), `${sha256}  ${filename}\n`);
const md5 = createHash('md5').update(readFileSync(path.join(output,filename))).digest('hex');
writeFileSync(path.join(output, filename + '.md5'), `${md5}  ${filename}\n`);
console.log(JSON.stringify({status:'PASS', filename, sha256, architecture:'all', published:false,
  boundary:'Compiled-only package with notices/provenance; installed M2 acceptance open'}));
