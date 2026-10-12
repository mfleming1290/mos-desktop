// Fixed same-origin personal-service adapter. MOS remains credential authority.
export function createPersonalHost({storage, fetcher = globalThis.fetch} = {}) {
  let disposed = false;
  const pending = new Set();
  const credential = () => {try {return storage?.getItem('authToken') || '';} catch {return '';}};
  async function operation(operation, args = {}, signal) {
    const token = credential();
    if (disposed || signal?.aborted) throw new Error('cancelled');
    if (!token) throw new Error('unauthenticated');
    const controller = new AbortController(); pending.add(controller);
    const cancel = () => controller.abort(); signal?.addEventListener('abort', cancel, {once:true});
    const timeout = setTimeout(cancel, 10000);
    try {
      const response = await fetcher('/desktop-api/v1/operation', {method:'POST',
        credentials:'omit', redirect:'error', signal:controller.signal,
        headers:{Authorization:`Bearer ${token}`, 'Content-Type':'application/json'},
        body:JSON.stringify({operation,args})});
      if (disposed || controller.signal.aborted || token !== credential()) throw new Error('cancelled');
      const value = await response.json();
      if (disposed || controller.signal.aborted || token !== credential()) throw new Error('cancelled');
      if (!response.ok) {
        const safe = new Set(['conflict','forbidden','unauthenticated','notFound','backendUnavailable',
          'writeUnavailable','saveCopyRequired','topLevelOnly','capacityExceeded','controlRequired','storageUnavailable']);
        throw new Error(safe.has(value?.error) ? value.error : 'operationFailed');
      }
      return value;
    } finally {
      clearTimeout(timeout); signal?.removeEventListener('abort', cancel); pending.delete(controller);
    }
  }
  return Object.freeze({operation, dispose() {disposed=true; for(const c of pending)c.abort();pending.clear();}});
}

const decode = value => {
  if (typeof value !== 'string' || value.length > 1400000) throw new Error('capacityExceeded');
  return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value),c=>c.charCodeAt(0)));
};
const encode = value => {
  const bytes=new TextEncoder().encode(value);
  if(bytes.length>1048576)throw new Error('capacityExceeded');
  let binary=''; for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary);
};

// Host-injected Open/Save around the existing independent editor handle.
// No SDK filesystem, network, authentication or desktop semantics are added.
export function createDocumentCommands({host, editor}) {
  let current, live=true, revision=0, pending=false;
  const guard=()=>{if(!live)throw new Error('cancelled');if(pending)throw new Error('busy');};
  return Object.freeze({
    async open(path, {discard=false, signal}={}) {
      guard();
      const before=editor.snapshot().text;
      if(before!==(current?.saved??'') && !discard)throw new Error('unsavedChanges');
      pending=true;const generation=++revision;
      try {
        const file=await host.operation('read',{path},signal);
        if(!live || revision!==generation)throw new Error('cancelled');
        const text=decode(file.data);
        if(typeof file.version!=='string')throw new Error('invalidResponse');
        if(editor.snapshot().text!==before)throw new Error('unsavedChanges');
        if(editor.replaceText(text)===false)throw new Error('editorInactive');
        current={path,version:file.version,saved:text};
        return {path};
      } finally {pending=false;}
    },
    async save({path=current?.path, signal}={}) {
      guard();if(!path)throw new Error('pathRequired');
      pending=true;const generation=++revision,text=editor.snapshot().text;
      try {
        const file=await host.operation('write',{path,data:encode(text),
          expected:current?.path===path ? current.version : null},signal);
        if(!live || revision!==generation)throw new Error('cancelled');
        if(typeof file.version!=='string')throw new Error('invalidResponse');
        current={path,version:file.version,saved:text};return {path};
      } finally {pending=false;}
    },
    dispose(){live=false;++revision;},
  });
}
