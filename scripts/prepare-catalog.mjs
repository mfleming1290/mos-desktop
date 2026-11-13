// Private local preparer: only the compiled optional interface crosses the boundary.
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const source=resolve(process.argv[2]??'../battlemoon-desktop');
const require=createRequire(source+'/package.json');
const {build}=require('esbuild');
const input=await readFile(source+'/typescript/application-catalog.ts');
const output=await build({entryPoints:[source+'/typescript/application-catalog.ts'],bundle:true,write:false,minify:true,format:'esm',platform:'neutral'});
const bytes=output.outputFiles[0].contents;
await writeFile('runtime/catalog.mjs',bytes);
const content=await build({entryPoints:[source+'/typescript/layout-content.ts'],bundle:true,write:false,minify:true,format:'esm',platform:'neutral'});
await writeFile('runtime/content.mjs',content.outputFiles[0].contents);
await writeFile('runtime/content-bootstrap.mjs','export default '+JSON.stringify(Buffer.from(content.outputFiles[0].contents).toString('base64'))+';\n');
await writeFile('runtime/catalog-identity.json',JSON.stringify({sourceSha256:createHash('sha256').update(input).digest('hex'),assetSha256:createHash('sha256').update(bytes).digest('hex'),contentSourceSha256:createHash('sha256').update(await readFile(source+'/typescript/layout-content.ts')).digest('hex'),assets:Object.fromEntries(await Promise.all(['catalog.mjs','content.mjs','content-bootstrap.mjs'].map(async file=>[file,createHash('sha256').update(await readFile('runtime/'+file)).digest('hex')]))),kind:'unreleased local source candidate'},null,2)+'\n');
