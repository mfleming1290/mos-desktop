import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const revision = 'a06361b0d40f26bf3a66da1ebe24ea2264efbb23';
const artifacts = {
  'battlemoon-clock-0.1.1.tgz': 'fc21c9289ab21af48277b002f1c1dd5965f1dff6fd750eb28f573aa9966fe889',
  'battlemoon-component-contracts-0.1.1.tgz': 'f258196f0a2571db195c32057ef2a60f487a9d247a2eb3f8960869d81d5b8a7d',
};
const directory = new URL('../.cache/components/', import.meta.url);
await mkdir(directory, {recursive: true});
for (const [name, expected] of Object.entries(artifacts)) {
  const path = new URL(name, directory);
  let bytes;
  try {bytes = await readFile(path);} catch (error) {if (error.code !== 'ENOENT') throw error;}
  if (!bytes) {
    const response = await fetch(`https://raw.githubusercontent.com/mfleming1290/mos-battlemoon-clock/${revision}/vendor/${name}`);
    if (!response.ok) throw new Error(`Component download failed: ${response.status}`);
    bytes = new Uint8Array(await response.arrayBuffer());
  }
  if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error(`Component identity mismatch: ${name}`);
  await writeFile(path, bytes, {flag: 'w'});
  console.log(`${name} SHA256 ${expected}`);
}
