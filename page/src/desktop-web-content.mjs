// Browser-owned iframe subset. These flags are support, never grants.
export const webCapabilities=Object.freeze({address:true,reload:true,history:false,navigationInterception:false,popups:false,isolatedProfiles:false});
export function validateWebUrl(value, privilegedOrigin=globalThis.location?.origin) {
 if(typeof value!=='string'||value.length>4096)throw Error('Invalid address');
 const url=new URL(value);
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.origin===privilegedOrigin||['tauri.localhost','localhost.tauri','ipc.localhost'].includes(url.hostname))throw Error('Address denied');
 return url.href;
}
export const webAdapter=Object.freeze({id:'web',validate(c,t){try{return t==='browser'&&c&&Object.keys(c).every(k=>['initialUrl','navigationPolicy'].includes(k))&&typeof c.initialUrl==='string'&&(!c.initialUrl||!!validateWebUrl(c.initialUrl))&&c.navigationPolicy==='approved-browser';}catch{return false;}},
 availability:()=>({code:'available',message:'Opaque iframe: address/reload only. Cross-origin history, redirect interception, popups and isolated profiles unsupported. Frame loading remains unverified.'}),
 invoke(control){if(!webCapabilities[control])throw Error('Unsupported browser control: '+control);}});
