import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeLayout, createLayoutStorage} from '../page/src/desktop-layout.mjs';
const registrations=[{definition:{id:'clock',multiple_instances:true},defaults:{},validate:()=>({code:'success',value:{}})}];
const valid={schemaVersion:1,scope:'verified',focused:'w',windows:[{key:'w',definitionId:'clock',bounds:{x:-20,y:0,width:300,height:200},visible:true,presentation:'normal',config:{}}]};
test('bounded layout validates identities, scope, version, geometry and unavailable apps',()=>{
  assert.equal(decodeLayout(JSON.stringify(valid),'verified',registrations).windows.length,1);
  for(const change of [{schemaVersion:2},{scope:'other'},{windows:[{...valid.windows[0],bounds:{x:0,y:0,width:-1,height:200}}]},{windows:[valid.windows[0],valid.windows[0]]}])
    assert.throws(()=>decodeLayout(JSON.stringify({...valid,...change}),'verified',registrations));
  assert.equal(decodeLayout(JSON.stringify(valid),'verified',[]).skipped.length,1);
  assert.throws(()=>decodeLayout('x'.repeat(65537),'verified',registrations));
});
test('single writer, denied storage, disposal and unavailable scope preserve saved data',async()=>{
  let held=false, text='old',fail=false;
  const locks={request:async(_key,_options,callback)=>{if(held)return callback(null);held=true;try{return await callback({});}finally{held=false;}}};
  const storage={getItem:()=>text,setItem:(_key,value)=>{if(fail)throw new Error('quota');text=value;}};
  const a=createLayoutStorage({scope:'verified',storage,locks}), b=createLayoutStorage({scope:'verified',storage,locks});
  assert.equal(await a.acquire(),true);assert.equal(await b.acquire(),false);
  b.save('bad');b.flush();assert.equal(text,'old');
  fail=true;a.save('new');a.flush();assert.equal(text,'old');
  fail=false;a.flush();assert.equal(text,'new');a.dispose();
  a.save('late');a.flush();assert.equal(text,'new');
  assert.equal(await createLayoutStorage({storage,locks}).acquire(),false);
});
test('failed reads block recovery and lost identity prevents pending writes including disposal', async () => {
  let current = true, writes = 0;
  const persistence = createLayoutStorage({scope: 'verified', canPersist: () => current,
    locks: {request: (_key, _options, callback) => callback({})},
    storage: {getItem: () => {throw Error('denied');}, setItem: () => writes++}});
  assert.equal(await persistence.acquire(), true);
  assert.throws(() => persistence.read(), /read failed/);
  persistence.save('pending'); current = false;
  persistence.flush(); persistence.dispose(); assert.equal(writes, 0);
});
