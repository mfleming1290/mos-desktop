import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import config from '../page/plugin.config.js';
const root = new URL('../',import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('page/package.json',root)));
assert.notEqual(pkg.mosDesktopReleaseReady, false, 'M1 development is not approved for release; do not replace immutable 0.1.0');
const lock = JSON.parse(readFileSync(new URL('page/package-lock.json',root)));
assert.match(config.version,/^\d+\.\d+\.\d+$/);
assert.equal(pkg.version,config.version);assert.equal(lock.version,config.version);assert.equal(lock.packages[''].version,config.version);
if(process.env.RELEASE_TAG) assert.equal(process.env.RELEASE_TAG,config.version);
const files = execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n');
const allowed = /^(\.github\/workflows\/build-plugin\.yml|\.gitattributes|\.gitignore|README\.md|package(?:-lock)?\.json|playwright\.config\.cjs|backend\/(README\.md|requirements\.txt|mos-desktop-agent\.service|(home|terminal|service|preflight|test_backend)\.py)|runtime\/((runtime|layout|editor)\.(mjs|wasm)|identity\.json|(layout|editor)-identity\.json|(THIRD-PARTY|LAYOUT|XTERM|EDITOR)-NOTICES\.txt)|page\/(package(?:-lock)?\.json|plugin\.config\.js|vite\.config\.js|(test-host|standalone)\.html|src\/(standalone\.mjs|Plugin\.vue|DesktopShell\.vue|Personal(Home|Terminal|Editor)\.vue|runtime-canary\.mjs|desktop-(apps|arrangement|controller|geometry|layout|profile|mos|lxc|personal|sdk-layout)\.mjs))|scripts\/(stage-runtime|prepare-components|check-built|package-local|check-release|make-local-dropin)\.mjs|scripts\/(make-source\.py|probe-playwright\.cjs)|tests\/((public-runtime|desktop-(apps|arrangement|controller|geometry|layout|profile|mos|lxc|personal|sdk-layout))\.test\.mjs|editor-host-integration\.mjs|personal-(ui|live)\.cjs|e2e\/(README\.md|(auth\.setup|environment|isolation\.spec|layout\.spec)\.cjs)))$/;
for(const file of files) {
  assert(allowed.test(file),`Unreviewed public file: ${file}`);
  assert(!/[HC]:[\\/]\s*(?:code|Users)|\/home\/matt\/|gh[pousr]_[A-Za-z0-9]{20}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(readFileSync(new URL(file,root)).toString('latin1')),file);
}
if(process.argv.includes('--artifacts')) {
  const directory = new URL('artifacts/',root);
  const filename = `desktop_${config.version}-1+mos-plugin_all.deb`;
  for(const algorithm of ['md5','sha256']) {
    const actual=createHash(algorithm).update(readFileSync(new URL(filename,directory))).digest('hex');
    assert.equal(readFileSync(new URL(filename+'.'+algorithm,directory),'utf8').trim(),`${actual}  ${filename}`);
  }
  assert(readdirSync(directory).includes(`mos-desktop-${config.version}-source.zip`));
}
console.log(JSON.stringify({status:'PASS',version:config.version,publicFiles:files.length}));
