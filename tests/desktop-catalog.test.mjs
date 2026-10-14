import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApplicationCatalog} from '../runtime/catalog.mjs';
import {createApplicationDiscovery} from '../page/src/desktop-application-discovery.mjs';
import {webAdapter,validateWebUrl} from '../page/src/desktop-web-content.mjs';
import {streamAdapter} from '../page/src/desktop-stream-content.mjs';
import {createConnectorControls} from '../page/src/desktop-connector-controls.mjs';
import {catalogPolicyAvailability} from '../page/src/desktop-catalog.mjs';
const d={version:1,id:'preset',label:'Preset',connector:{id:'web',target:'browser'},instancePolicy:'multiple',preferredSize:{width:500,height:400},configuration:{initialUrl:'https://example.org/',navigationPolicy:'approved-browser'}};
test('live instance policy upgrades are explicitly deferred until last close',()=>{
 const admitted=new Map([['preset',{definition:{multiple_instances:false}}]]),apps=[{definitionId:'preset'}];
 assert.equal(catalogPolicyAvailability(d,admitted,apps).code,'unavailable');
 assert.match(catalogPolicyAvailability(d,admitted,apps).message,/Close existing windows/);
 assert.equal(catalogPolicyAvailability(d,admitted,[]),undefined);
 assert.equal(catalogPolicyAvailability({...d,instancePolicy:'single-definition'},admitted,apps),undefined);
 admitted.get('preset').definition.multiple_instances=true;
 assert.equal(catalogPolicyAvailability({...d,instancePolicy:'single-definition'},admitted,apps).code,'unavailable');
 assert.equal(catalogPolicyAvailability(d,admitted,apps),undefined);
});
test('web/stream adapters reject unsafe configs and unsupported controls at invocation',()=>{
 for(const url of ['javascript:alert(1)','https://u:p@example.org/','https://tauri.localhost/','https://mos.example/'])assert.throws(()=>validateWebUrl(url,'https://mos.example'));
 for(const op of ['history','popups','isolatedProfiles','navigationInterception'])assert.throws(()=>webAdapter.invoke(op));
 assert.equal(streamAdapter.validate({resource:'personal'},'personal'),true);assert.equal(streamAdapter.validate({resource:'other'},'personal'),false);
});
test('bounded host discovery atomically refreshes, removes conflicting/invalid upgrades and fences cancellation',async()=>{
 const catalog=createApplicationCatalog(new Map([['web',webAdapter.validate]]));let files=[d],notifications=0,status='';catalog.subscribe(()=>notifications++);
 const personal={async operation(op,args){if(op==='list')return {entries:files.map((v,i)=>({name:i+'.json',kind:'file',size:100})),next:null};assert.equal(args.maxBytes,16384);return {data:btoa(JSON.stringify(files[Number(args.path.split('/').at(-1).split('.')[0])]))};}};
 const discovery=createApplicationDiscovery({personal,catalog,builtins:()=>[],onStatus:s=>status=s});
 await discovery.refresh();assert.equal(catalog.resolve('preset').label,'Preset');assert.equal(notifications,1);const pinned=catalog.resolve('preset');
 files=[{...d,label:'New'}];await discovery.refresh();assert.equal(catalog.resolve('preset').label,'New');assert.equal(pinned.label,'Preset');
 files=[d,d];await discovery.refresh();assert.equal(catalog.list().length,0);assert.match(status,/Conflicting/);
 files=[{...d,version:99}];await discovery.refresh();assert.equal(catalog.list().length,0);
 let release;personal.operation=()=>new Promise(r=>release=r);const pending=discovery.refresh();discovery.cancel();release({entries:[],next:null});await pending;assert.equal(catalog.list().length,0);discovery.dispose();
});
test('client activation completion is fenced after an acknowledged revoke (transport fixture)',async()=>{
 const item={manifest:{id:'canary'},identity:'a'.repeat(64)},artifacts={value:new Map()},approvalState={value:null};
 let release;let state={revision:1,writable:true,records:{canary:{identity:item.identity,decision:'approved'}},connectors:[item]};
 const personal={async operation(op){if(op==='connector.activate')return new Promise(r=>release=r);if(op==='connector.decide'){state={...state,revision:2,records:{canary:{identity:item.identity,decision:'revoked'}}};}return state;}};
 const controls=createConnectorControls({personal,catalog:{},artifacts,approvalState,managed:new Map()});
 const pending=controls.activate(item,1);await controls.decide(item,'revoked',1);release({manifest:item.manifest,identity:item.identity});await assert.rejects(pending,/cancelled/);assert.equal(artifacts.value.size,0);controls.dispose();
});
