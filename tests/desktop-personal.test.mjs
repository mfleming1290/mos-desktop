import test from 'node:test';
import assert from 'node:assert/strict';
import {createPersonalHost,createDocumentCommands} from '../page/src/desktop-personal.mjs';

test('personal requests use fixed target, fence identity changes and redact errors', async()=>{
  let token='one', finish, seen;
  const host=createPersonalHost({storage:{getItem:()=>token}, fetcher:async(...args)=>{
    seen=args;return new Promise(resolve=>finish=()=>resolve({ok:true,json:async()=>({value:'private'})}));
  }});
  const pending=host.operation('read',{path:'document'});
  assert.equal(seen[0],'/desktop-api/v1/operation');assert.equal(seen[1].credentials,'omit');
  assert.equal(seen[1].redirect,'error');assert(!seen[1].body.includes(token));
  token='two';finish();await assert.rejects(pending,/cancelled/);host.dispose();
  await assert.rejects(host.operation('read'),/cancelled/);
  const denied=createPersonalHost({storage:{getItem:()=>token},fetcher:async()=>({ok:false,json:async()=>({error:'secret internal failure'})})});
  await assert.rejects(denied.operation('read'),/^Error: operationFailed$/);denied.dispose();
});

test('shared request pacing cancels queued input before transmission',async()=>{
  const requests=[];
  const host=createPersonalHost({storage:{getItem:()=> 'fixture'},fetcher:async(url,options)=>{
    requests.push(JSON.parse(options.body).operation);return {ok:true,json:async()=>({})};
  }});
  await host.operation('health');
  const abort=new AbortController();
  const queued=host.operation('terminal.input',{data:'fixture'},abort.signal);
  abort.abort();
  await assert.rejects(queued,/cancelled/);
  assert.deepEqual(requests,['health']);host.dispose();
});

test('host-connected editor open, save, conflict, dirty guard and disposal', async()=>{
  let text='', stored='document', version='1', delayed;
  const editor={snapshot:()=>({text}),replaceText:value=>{text=value;}};
  const host={operation:async(op,args)=>{
    if(op==='read')return {data:btoa(stored),version};
    if(args.expected!==version)throw new Error('conflict');
    stored=atob(args.data);version=String(+version+1);return {version};
  }};
  const commands=createDocumentCommands({host,editor});
  await commands.open('document');assert.equal(text,'document');
  text='edited';await assert.rejects(commands.open('other'),/unsavedChanges/);
  await commands.save();assert.equal(stored,'edited');
  stored='native edit';version='3';text='stale editor';
  await assert.rejects(commands.save(),/conflict/);assert.equal(stored,'native edit');
  await commands.open('document',{discard:true});assert.equal(text,'native edit');
  const late=createDocumentCommands({editor,host:{operation:()=>new Promise(resolve=>delayed=resolve)}});
  const opening=late.open('late',{discard:true});late.dispose();delayed({data:btoa('late private'),version:'1'});
  await assert.rejects(opening,/cancelled/);assert.equal(text,'native edit');commands.dispose();
});

test('save blocked by backend never reports success or discards editor text', async()=>{
  const editor={snapshot:()=>({text:'unsaved'}),replaceText:()=>assert.fail('unexpected replace')};
  const commands=createDocumentCommands({editor,host:{operation:async()=>{throw new Error('writeUnavailable');}}});
  await assert.rejects(commands.save({path:'new'}),/writeUnavailable/);
  assert.equal(editor.snapshot().text,'unsaved');commands.dispose();
});
