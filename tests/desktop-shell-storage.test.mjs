import test from 'node:test';
import assert from 'node:assert/strict';
import {createShellStorage} from '../page/src/desktop-shell-storage.mjs';
test('shell host reconciles acknowledgement loss and fences stale/unsupported/identity writes',async()=>{
 const records=new Map();let fail='',allowed=true;
 const storage={getItem:k=>records.get(k)??null,setItem(k,v){if(fail==='before')throw Error('before');records.set(k,v);if(fail==='after')throw Error('after');}};
 let queue=Promise.resolve();const locks={request(_key,fn){const result=queue.then(fn);queue=result.catch(()=>{});return result;}};
 const host=createShellStorage({scope:'one',storage,locks,canPersist:()=>allowed}),other=createShellStorage({scope:'one',storage,locks,canPersist:()=>allowed});
 fail='after';const receipt=await host.compareAndSwap('p','0',{saved:true});assert.deepEqual((await host.read()).value,{saved:true});
 await assert.rejects(other.compareAndSwap('p','0',null),/Stale/);fail='before';await assert.rejects(host.compareAndSwap('p',receipt.revision,null),/previous/);assert.deepEqual((await host.read()).value,{saved:true});
 fail='';allowed=false;await assert.rejects(host.compareAndSwap('p',receipt.revision,null),/admission/);allowed=true;
 const original='{"version":99,"future":true}';records.set(host.key,original);await assert.rejects(host.read(),/Unsupported/);assert.equal(records.get(host.key),original);
});
test('unresolved/divergent write readback latches host recovery without retry',async()=>{
 for(const mode of ['unreadable','divergent']){
  let text=null,readsFail=false,writes=0;const storage={getItem(){if(readsFail)throw Error('unavailable');return text;},setItem(_k,value){writes++;text=mode==='divergent'?'future-data':value;readsFail=mode==='unreadable';throw Error('uncertain');}};
  const host=createShellStorage({scope:'one',storage,locks:{request:async(_key,fn)=>fn()},canPersist:()=>true});
  await assert.rejects(host.compareAndSwap('p','0',{}),/Uncertain/);assert(host.needsReload);await assert.rejects(host.compareAndSwap('p','0',null),/admission/);assert.equal(writes,1);if(mode==='divergent')assert.equal(text,'future-data');
 }
});
