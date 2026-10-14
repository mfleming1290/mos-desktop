import {createApplicationCatalog} from '../../runtime/catalog.mjs';
// Reviewed host adapter associations. Listing has no attachment or service effects.
export function createDesktopCatalog(registrations) {
 const validators=new Map([['trusted',(c,t)=>registrations.some(r=>!r.internal&&r.definition.id===t)&&c&&Object.keys(c).length===0]]);
 for(const r of registrations)if(r.adapter)validators.set(r.adapter.id,r.adapter.validate);
 const catalog=createApplicationCatalog(validators);
 const entries=registrations.filter(r=>!r.internal).map(r=>({version:1,id:r.definition.id,label:r.definition.display_name,category:r.adapter?'Content':'Desktop',tags:[],connector:{id:r.adapter?.id??'trusted',target:r.target??r.definition.id},instancePolicy:r.definition.multiple_instances?'multiple':'single-definition',preferredSize:r.definition.preferred_size,configuration:r.adapter?r.defaults:{}}));
 const result=catalog.replace(entries);if(result.code!=='success')throw Error(result.message);
 return catalog;
}

export function resolveRegistration(entry,registrations) {
 const base=registrations.find(r=>r.adapter?r.adapter.id===entry.connector.id&&(r.target===entry.connector.target||r.adapter.supportsTarget?.(entry.connector.target)):entry.connector.id==='trusted'&&r.definition.id===entry.connector.target);
 if(!base)return undefined;
 return {...base,resourceKey:JSON.stringify([entry.connector,entry.configuration]),definition:{...base.definition,id:entry.id,display_name:entry.label,multiple_instances:entry.instancePolicy!=='single-definition',preferred_size:entry.preferredSize},defaults:base.adapter?entry.configuration:base.defaults};
}

// Live views keep their admitted semantic definition until the last one closes.
// Surface a changed instance policy before launch instead of advertising behavior
// that the authoritative reducer cannot yet admit.
export function catalogPolicyAvailability(entry,admitted,apps) {
 const prior=admitted.get(entry.id);
 if(prior&&apps.some(a=>a.definitionId===entry.id)&&prior.definition.multiple_instances!==(entry.instancePolicy!=='single-definition'))
  return {code:'unavailable',message:'Instance policy changed. Close existing windows for this application to apply the update.'};
 return undefined;
}
