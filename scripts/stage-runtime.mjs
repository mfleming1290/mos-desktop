// Approved compiled interface only; no private repository or credentials needed.
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync, copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const input = new URL('../runtime/',import.meta.url);
const output = new URL('../page/src/generated/',import.meta.url);
const hashes = {
  'runtime.mjs':'278d413f2497da7f0ea86ce7a4b00d76a95c479df2242541e4fe79f63a4af6d1',
  'runtime.wasm':'77da16b7690b39141a742abab8dcc4e66769bf93fb8501aab21a63810a72121a',
  'THIRD-PARTY-NOTICES.txt':'be836af26d93df01a4440b24723843e0ed07dec56f3c3b4e0e0df787c0f14b44',
};
const identity = JSON.parse(readFileSync(new URL('identity.json',input)));
assert.equal(identity.sourceRevision,'704ae0508eb2e26314e8066c9e293b32f9c39339');
assert.equal(identity.sdkArchiveSha256,'61a2a89a751a7fee7b7734b8077ac2bd4042ef1307871251214feb68d5a6229b');
assert.equal(identity.buildTransform,'exclude-test-only-FixtureEnvelope-v1');
assert.equal(identity.assets['runtime.mjs'],hashes['runtime.mjs']);
assert.equal(identity.assets['runtime.wasm'],hashes['runtime.wasm']);
for (const [file,hash] of Object.entries(hashes)) {
  assert.equal(createHash('sha256').update(readFileSync(new URL(file,input))).digest('hex'),hash,file);
}
mkdirSync(output,{recursive:true});
for (const file of [...Object.keys(hashes),'identity.json']) copyFileSync(new URL(file,input),new URL(file,output));
console.log('PASS: pinned compiled runtime staged; private SDK not required');
