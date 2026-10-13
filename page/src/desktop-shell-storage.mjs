// Existing verified-profile + Web Locks authority; independent from v1/v2 window layouts.
import {createDesktopId} from './desktop-controller.mjs';
export function createShellStorage({scope,storage,locks,canPersist}) {
 const key=`mos-desktop:shell:1:${scope}`;let uncertain=false,disposed=false;
 const admit=()=>{if(disposed||uncertain||typeof scope!=='string'||!scope||scope.length>200||!canPersist()||!storage||typeof locks?.request!=='function')throw Error('Shell storage admission unavailable; reload/sign in');};
 const parse=text=>{
  if(text===null)return{revision:'0',value:null};
  if(new TextEncoder().encode(text).length>135168)throw Error('Shell record exceeds limit; preserved');
  const r=JSON.parse(text);
  if(!r||Object.keys(r).sort().join(',')!=='revision,scope,value,version'||r.version!==1||r.scope!==scope||typeof r.revision!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(r.revision))throw Error('Unsupported shell record; preserved');
  return{revision:r.revision,value:r.value};
 };
 return {
  async read(){admit();return locks.request(key,()=>{admit();return parse(storage.getItem(key));});},
  async compareAndSwap(_profile,expected,value){admit();return locks.request(key,()=>{
   admit();const previous=storage.getItem(key),current=parse(previous);if(current.revision!==expected)throw Error('Stale shell layout; reload before saving');
   const next={version:1,scope,revision:createDesktopId(),value},text=JSON.stringify(next);parse(text);admit();
   try{storage.setItem(key,text);}catch(error){
    // A thrown acknowledgement is not proof that the atomic setItem did not happen.
    let observed;try{observed=storage.getItem(key);}catch{uncertain=true;throw Error('Uncertain shell save; reload required');}
    if(observed!==text){if(observed!==previous)uncertain=true;throw Error(uncertain?'Uncertain shell save; reload required':'Shell save failed; previous record preserved');}
   }
   return{revision:next.revision,value:next.value};
  });},
  get needsReload(){return uncertain;},dispose(){disposed=true;},key,
 };
}
