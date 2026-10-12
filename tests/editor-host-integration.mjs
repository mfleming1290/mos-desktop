// Explicit independent SDK validation; not part of the installed-MOS proof.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {createDocumentCommands} from '../page/src/desktop-personal.mjs';
const require=createRequire(new URL('../page/package.json',import.meta.url));
const {JSDOM}=require('jsdom');
assert(process.env.BATTLEMOON_EDITOR_MODULE,'Set BATTLEMOON_EDITOR_MODULE to the reviewed editor DOM entry');
const dom=new JSDOM('<main></main>',{pretendToBeVisual:true});
for(const key of ['window','document','HTMLElement','Element','Node','SVGElement','Event','MouseEvent','MutationObserver','DOMRect','Window'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);
globalThis.getComputedStyle=dom.window.getComputedStyle.bind(dom.window);
dom.window.Range.prototype.getClientRects=()=>[];
dom.window.Range.prototype.getBoundingClientRect=()=>new dom.window.DOMRect();
const {mountEditor}=await import(pathToFileURL(process.env.BATTLEMOON_EDITOR_MODULE).href);
const editor=mountEditor(document.querySelector('main'),{instanceId:'host-open-save'});
const files=new Map([['original',{data:btoa('opened text'),version:'one'}]]);
const host={operation:async(op,args)=>{
  if(op==='read')return files.get(args.path);
  if(args.expected!==null)throw new Error('saveCopyRequired');
  if(files.has(args.path))throw new Error('conflict');
  const record={data:args.data,version:'new-version'};files.set(args.path,record);return record;
}};
const commands=createDocumentCommands({host,editor});
try {
  await commands.open('original');assert.equal(editor.snapshot().text,'opened text');
  editor.replaceText('user edit');
  await assert.rejects(commands.save(),/saveCopyRequired/);
  await commands.save({path:'copy'});assert.equal(atob(files.get('copy').data),'user edit');
  editor.setActive(false);
  await assert.rejects(commands.open('original'),/editorInactive/);
  assert.equal(editor.snapshot().text,'user edit');
  editor.setActive(true);
  await commands.open('original');assert.equal(editor.snapshot().text,'opened text');
  console.log('PASS real CodeMirror editor with host-injected Open/Save As, overwrite denial and suspension');
} finally {commands.dispose();editor.dispose();dom.window.close();}
