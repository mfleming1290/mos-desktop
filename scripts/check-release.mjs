import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import config from '../page/plugin.config.js';
const root = new URL('../',import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('page/package.json',root)));
const lock = JSON.parse(readFileSync(new URL('page/package-lock.json',root)));
assert.equal(config.version,'0.1.0');
assert.equal(pkg.version,config.version);assert.equal(lock.version,config.version);assert.equal(lock.packages[''].version,config.version);
if(process.env.RELEASE_TAG) assert.equal(process.env.RELEASE_TAG,config.version);
const files = execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n');
const allowed = /^(\.github\/workflows\/build-plugin\.yml|\.gitattributes|\.gitignore|README\.md|runtime\/(runtime\.mjs|runtime\.wasm|identity\.json|THIRD-PARTY-NOTICES\.txt)|page\/(package(?:-lock)?\.json|plugin\.config\.js|vite\.config\.js|src\/(Plugin\.vue|runtime-canary\.mjs))|scripts\/(stage-runtime|check-built|package-local|check-release)\.mjs|scripts\/make-source\.py|tests\/public-runtime\.test\.mjs)$/;
for(const file of files) {
  assert(allowed.test(file),`Unreviewed public file: ${file}`);
  assert(!/[HC]:[\\/]\s*(?:code|Users)|\/home\/matt\/|gh[pousr]_[A-Za-z0-9]{20}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(readFileSync(new URL(file,root)).toString('latin1')),file);
}
if(process.argv.includes('--artifacts')) {
  const directory = new URL('artifacts/',root);
  const filename = 'desktop_0.1.0-1+mos-plugin_all.deb';
  for(const algorithm of ['md5','sha256']) {
    const actual=createHash(algorithm).update(readFileSync(new URL(filename,directory))).digest('hex');
    assert.equal(readFileSync(new URL(filename+'.'+algorithm,directory),'utf8').trim(),`${actual}  ${filename}`);
  }
  assert(readdirSync(directory).includes('mos-desktop-0.1.0-source.zip'));
}
console.log(JSON.stringify({status:'PASS',version:config.version,publicFiles:files.length}));
