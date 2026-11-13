// Explicit reviewed SDK design assets only, no private SDK implementation.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const root=pathToFileURL((process.argv[2]??'H:/code/battlemoon-desktop').replaceAll('\\','/')+'/');
const design=new URL('design/',root),output=new URL('../runtime/design/',import.meta.url);
const source=JSON.parse(readFileSync(new URL('universal/identity.json',design)));
const assets={'mos.css':readFileSync(new URL('universal/themes/mos.css',design)),'universal.css':readFileSync(new URL('universal/adapters/universal.css',design)),'mos-desktop.css':readFileSync(new URL('mos-desktop.css',design))};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(digest(assets['mos.css']),source.files['themes/mos.css']);assert.equal(digest(assets['universal.css']),source.files['adapters/universal.css']);
// Namespace the optional adapter before distribution, without editing upstream bytes.
assets['mos.css']=Buffer.from(assets['mos.css'].toString().replaceAll('[data-theme="mos"]','.desktop-root[data-theme="mos"]'));
assets['universal.css']=Buffer.from(assets['universal.css'].toString().replace(/\.ud-root/g,'.desktop-root.ud-root').replace(/\.ud-(?!root)[a-z-]+/g,match=>'.desktop-root '+match).replaceAll('[data-theme="mos"]','.desktop-root[data-theme="mos"]'));
mkdirSync(output,{recursive:true});for(const [name,bytes]of Object.entries(assets))writeFileSync(new URL(name,output),bytes);
writeFileSync(new URL('identity.json',output),JSON.stringify({designVersion:source.version,source:'Battlemoon optional design resources; authored MOS presentation specimen',transform:'namespace-upstream-selectors-to-desktop-root-v1',assets:Object.fromEntries(Object.entries(assets).map(([name,bytes])=>[name,digest(bytes)]))},null,2)+'\n');
console.log('PASS: optional presentation assets staged; no SDK/runtime API changed');
