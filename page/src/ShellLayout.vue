<script setup>
import {ref,shallowRef,onMounted,onUnmounted,nextTick} from 'vue';
import {createLayout,createShellActions,createShellProfile,parseShellDocument} from '../../runtime/shell.mjs';
import wasmUrl from '../../runtime/shell.wasm?url';
import {shellTemplate} from './desktop-shell-template.mjs';
import {createShellStorage} from './desktop-shell-storage.mjs';
const props=defineProps({mount:Object,applications:Array,scope:String,canPersist:Function,launch:Function});
const layer=ref(),editButton=ref(),transfer=ref(),message=ref('Loading shell…'),documentValue=shallowRef(null),projection=shallowRef(null),locked=ref(true),blocked=ref(false),text=ref('');
let profile,storage,layout,actions,observer,live=true,gesture,importBlocked=false,unbind=[];
const nodes=new Map(),abort=new AbortController();
const admit=()=>live&&!!props.scope&&props.canPersist();
function supported(){for(let el=props.mount;el;el=el.parentElement){const s=getComputedStyle(el);if(s.transform!=='none'||!['1','normal',''].includes(s.zoom))return false;}return !globalThis.visualViewport||globalThis.visualViewport.scale===1;}
const style=b=>({left:b.x+'px',top:b.y+'px',width:b.width+'px',height:b.height+'px'});
async function refresh(){
 if(!live||!profile)return;documentValue.value=profile.document;locked.value=profile.locked;blocked.value=!!profile.recovery||profile.needsReload||storage.needsReload||importBlocked||!admit();
 actions?.close(false);
 if(!supported()){projection.value=null;message.value='Shell unavailable in transformed/zoomed host; existing windows remain usable';return;}
 const p=layout({op:'shell_project',document:documentValue.value,viewport:{x:0,y:0,width:props.mount.clientWidth,height:props.mount.clientHeight}});
 if('Err'in p){projection.value=null;message.value=p.Err;return;}projection.value=p.Ok.code==='ready'?p.Ok:null;
 await nextTick();if(!live)return;for(const u of unbind)u();unbind=[];
 for(const trigger of documentValue.value.triggers){const node=nodes.get(trigger.element);if(node)unbind.push(actions.bind(documentValue.value,trigger,node));}
}
async function run(fn){try{if(importBlocked)throw Error('Unsupported import retained; Cancel to resume');await fn();await refresh();message.value=blocked.value?'Record preserved; saves disabled':profile.locked?'Shell locked':'Shell editing';}catch(e){message.value=e.message;await refresh();}}
async function invoke(request,signal){
 if(!supported())return{code:'unavailable',message:'Shell unavailable in transformed/zoomed host'};
 if(!admit()||signal.aborted)return{code:'denied',message:'MOS profile/action admission unavailable'};
 if(request.action.startsWith('open-')){
  const id=request.action.slice(5);if(!props.applications.some(a=>a.id===id))return{code:'denied',message:'Unknown application'};
  await props.launch(id,request.initial,signal);return{code:'ready',content:props.mount};
 }
 const node=window.document.createElement('section');node.className='mos-shell-popup';
 if(request.action==='start'){
  const heading=window.document.createElement('h2');heading.textContent='Applications';node.append(heading);
  for(const app of props.applications){const button=window.document.createElement('button');button.textContent=app.display_name;button.onclick=async()=>{try{if(!admit())throw Error('Action denied');await props.launch(app.id,null,signal);actions.close();}catch(e){message.value=e.message;}};node.append(button);}
 }else if(request.action==='calendar'){
  const heading=window.document.createElement('h2');heading.textContent=new Date().toLocaleDateString();node.append(heading);const input=window.document.createElement('input');input.type='date';input.setAttribute('aria-label','Calendar date');node.append(input);
 }else if(request.action==='context'){
  for(const [label,fn]of [['Open Home',()=>props.launch('home',null,signal)],['Edit shell',()=>run(()=>profile.lock(false))]]){const button=window.document.createElement('button');button.textContent=label;button.setAttribute('role','menuitem');button.onclick=async()=>{try{if(!admit())throw Error('Action denied');await fn();actions.close();}catch(e){message.value=e.message;}};node.append(button);}
  node.onkeydown=e=>{const items=[...node.querySelectorAll('button')],index=items.indexOf(window.document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();items[e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:items.length-1))%items.length].focus();}};
 }else return{code:'denied',message:'Unknown shell action'};
 return{code:'ready',content:node};
}
function context(event){if(!actions||event.target.closest('article,[data-popup]'))return;event.preventDefault();event.stopPropagation();const trigger=documentValue.value.triggers.find(t=>t.action==='context');void actions.activate(documentValue.value,trigger,nodes.get('context'),{x:event.clientX,y:event.clientY});}
function start(e,id){const item=documentValue.value.elements.find(i=>i.id===id);if(locked.value||blocked.value||!item.editable||e.button!==0)return;gesture={id,x:e.clientX,y:e.clientY,position:structuredClone(item.position),target:e.currentTarget,pointer:e.pointerId,resize:e.shiftKey};gesture.target.setPointerCapture(e.pointerId);}
function move(e){if(!gesture)return;const g=gesture,p=g.position,dx=e.clientX-g.x,dy=e.clientY-g.y;try{profile.edit({kind:'bounds',id:g.id,x:p.x+(g.resize?0:dx),y:p.y+(g.resize?0:dy),width:p.width+(g.resize?dx:0),height:p.height+(g.resize?dy:0)});documentValue.value=profile.document;const projected=layout({op:'shell_project',document:profile.document,viewport:{x:0,y:0,width:props.mount.clientWidth,height:props.mount.clientHeight}});if('Ok'in projected)projection.value=projected.Ok;}catch(error){message.value=error.message;}}
function end(e,cancel=false){if(!gesture)return;const g=gesture;gesture=null;if(cancel)profile.cancel();if(g.target.hasPointerCapture(g.pointer))g.target.releasePointerCapture(g.pointer);if(cancel)void refresh();else g.target.addEventListener('click',event=>event.stopImmediatePropagation(),{once:true,capture:true});}
function key(e,id){if(e.key==='Escape'&&gesture){end(e,true);return;}if(!e.key.startsWith('Arrow'))return;const item=profile.document.elements.find(i=>i.id===id);if(!item.editable)return;e.preventDefault();void run(()=>{const p=item.position;profile.edit({kind:'bounds',id,x:p.x+(e.shiftKey?0:e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0),y:p.y+(e.shiftKey?0:e.key==='ArrowDown'?10:e.key==='ArrowUp'?-10:0),width:p.width+(e.shiftKey?(e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0):0),height:p.height+(e.shiftKey?(e.key==='ArrowDown'?10:e.key==='ArrowUp'?-10:0):0)});});}
function importLayout(){void run(()=>{const parsed=parseShellDocument(layout,text.value);if(parsed.code!=='supported'){importBlocked=true;throw Error(parsed.message);}profile.import(parsed.document);});}
function cancel(){importBlocked=false;void run(()=>profile.cancel());}
function exportLayout(){text.value=profile.exportTemplate();transfer.value.open=true;}
onMounted(async()=>{try{
 const response=await fetch(wasmUrl,{signal:abort.signal,credentials:'same-origin'});if(!response.ok)throw Error('Shell geometry unavailable');layout=await createLayout(new Uint8Array(await response.arrayBuffer()));if(!live)return;
 storage=createShellStorage({scope:props.scope,storage:globalThis.localStorage,locks:globalThis.navigator?.locks,canPersist:admit});
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(props.scope));const profileId='p-'+[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
 profile=await createShellProfile(layout,shellTemplate(props.applications),profileId,storage);if(!live){storage.dispose();return;}
 actions=createShellActions(layout,props.mount,layer.value,{available:action=>admit()&&(['start','calendar','context'].includes(action)||props.applications.some(a=>'open-'+a.id===action)),invoke},()=>editButton.value,value=>message.value=value);
 props.mount.addEventListener('contextmenu',context,true);observer=new ResizeObserver(()=>{end(null,true);void refresh();});observer.observe(props.mount);await refresh();if(supported())message.value=blocked.value?'Unsupported record preserved; saves disabled':'Shell locked';
 }catch(e){blocked.value=true;message.value=e.message;}});
onUnmounted(()=>{live=false;abort.abort();observer?.disconnect();props.mount.removeEventListener('contextmenu',context,true);actions?.dispose();storage?.dispose();});
</script>
<template>
 <nav aria-label="Shell authoring">
  <button ref="editButton" :disabled="!profile || blocked" @click="run(()=>profile.lock(false))">Edit shell</button>
  <button :disabled="!profile" @click="run(()=>profile.lock(true))">Lock shell</button>
  <button :disabled="!profile || locked || blocked" @click="run(()=>profile.commit())">Save shell</button>
  <button :disabled="!profile" @click="cancel">Cancel shell</button>
  <button :disabled="!profile || locked || blocked" @click="run(()=>profile.reset())">Reset shell</button>
  <button :disabled="!profile" @click="exportLayout">Export shell</button>
  <button :disabled="!profile || locked || blocked" @click="importLayout">Import shell preview</button>
  <button :disabled="!profile || locked || blocked" @click="run(()=>profile.edit({kind:'reorder',ids:profile.document.elements.filter(e=>e.editable).map(e=>e.id).reverse()}))">Reorder shell icons</button>
  <details ref="transfer"><summary>Shell JSON</summary><textarea v-model="text" aria-label="Shell JSON" spellcheck="false" /></details>
  <output role="status" aria-label="Shell status">{{ message }}</output>
 </nav>
 <Teleport :to="mount">
  <template v-if="projection?.code==='ready'">
   <button v-for="item in projection.elements.filter(e=>documentValue.elements.find(i=>i.id===e.id).kind==='item')" :key="item.id" :ref="el=>el?nodes.set(item.id,el):nodes.delete(item.id)" class="shell-item" :data-shell-item="item.id" :style="style(item.bounds)" @pointerdown="start($event,item.id)" @pointermove="move" @pointerup="end" @pointercancel="end($event,true)" @lostpointercapture="end($event,true)" @keydown="key($event,item.id)">{{ documentValue.elements.find(e=>e.id===item.id).label }}</button>
  </template>
  <div ref="layer" class="shell-popup-layer" />
 </Teleport>
</template>
<style scoped>
nav{display:flex;gap:6px;flex-wrap:wrap;align-items:center}textarea{width:100%;min-width:300px;height:100px}output{font-size:.85rem}.shell-item{position:absolute;box-sizing:border-box;padding:0 4px;z-index:0;touch-action:none}.shell-item[data-shell-item=start],.shell-item[data-shell-item=calendar],.shell-item[data-shell-item=context]{z-index:1000}.shell-popup-layer{position:absolute;inset:0;pointer-events:none;z-index:10000}.shell-popup-layer :deep([data-popup]){pointer-events:auto;box-sizing:border-box;background:#202c3c;color:white;border:1px solid #899cb4;padding:8px;overflow:auto}.shell-popup-layer :deep(button){display:block;margin:4px;padding:5px}.shell-popup-layer :deep(input){font:inherit}
</style>
