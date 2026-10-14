// Built-in isolation bootstrap. Executable bytes never evaluate in the auth parent.
import contentBinding from '../../runtime/content-bootstrap.mjs';
import {createDesktopId} from './desktop-controller.mjs';
export function connectorDocument(artifact,identity,configuration={}) {
 if(artifact.context!=='isolated-frame'||!/^[A-Za-z0-9+/]*={0,2}$/.test(artifact.module))throw Error('Unsupported artifact');
 const nonce=createDesktopId().replaceAll('-','');
 const boot=`import {createContentHost} from 'data:text/javascript;base64,${artifact.module}';
 import {createContentBinding} from 'data:text/javascript;base64,${contentBinding}';
 const identity=${JSON.stringify(identity)},configuration=${JSON.stringify(configuration).replaceAll('<','\\u003c')};
 const binding=createContentBinding(createContentHost({target:document.getElementById('content'),configuration}),identity,status=>{if(status==='attached')parent.postMessage({kind:'connector-ready',view:identity.view},'*');});
 addEventListener('message',e=>{if(e.source!==parent||e.origin!==${JSON.stringify(globalThis.location?.origin??'null')})return;const m=e.data;if(m?.view!==identity.view)return;if(m.kind==='active')binding.active(m.value===true);if(m.kind==='resize')binding.resize(m.bounds);if(m.kind==='detach')binding.dispose();});`;
 const encoded=btoa(unescape(encodeURIComponent(boot)));
 return `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src data: 'nonce-${nonce}'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'; connect-src 'none'"><div id="content"></div><script type="module" nonce="${nonce}" src="data:text/javascript;base64,${encoded}"></script>`;
}
export const installedAdapter=Object.freeze({id:'installed',validate:(c,t)=>/^[A-Za-z0-9_.-]{1,80}$/.test(t)&&c&&Object.keys(c).length===0,
 admit:(service,entry)=>service.connectors.admit(entry),
 supportsTarget:()=>true,availability:(service,entry)=>service.connectors.support(entry.connector.target)});
