// Host-only bounded data discovery; personal.operation supplies auth, pacing and scope.
export function createApplicationDiscovery({personal,catalog,builtins,onStatus=()=>{}}) {
 let epoch=0,abort,disposed=false,busy=false;
 async function refresh() {
  if(disposed||busy)return;busy=true;const current=++epoch;abort=new AbortController();
  const diagnostics=[],candidates=[],conflicts=new Set(),seen=new Set();
  try {
   let cursor=0,count=0,pages=0;
   do {
    if(++pages>2)throw Error('Discovery page count exceeded');
    const page=await personal.operation('list',{path:'Applications/manifests',cursor},abort.signal);
    if(!Array.isArray(page.entries)||page.entries.length>200)throw Error('Invalid discovery page');
    for(const file of page.entries){if(++count>256)throw Error('Manifest count exceeded');
     if(file.kind!=='file'||!file.name?.endsWith('.json'))continue;
     if(!/^[A-Za-z0-9_.-]{1,128}\.json$/.test(file.name)||!Number.isInteger(file.size)||file.size<0||file.size>16384){diagnostics.push('Rejected '+file.name);continue;}
     try {const raw=await personal.operation('read',{path:'Applications/manifests/'+file.name,maxBytes:16384},abort.signal);
      if(typeof raw.data!=='string'||raw.data.length>21848)throw Error('Manifest bytes exceeded');
      const data=Uint8Array.from(atob(raw.data),c=>c.charCodeAt(0));if(data.length>16384)throw Error('Manifest bytes exceeded');
      const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data));
      if(seen.has(value.id)||builtins().some(d=>d.id===value.id))conflicts.add(value.id);seen.add(value.id);candidates.push(value);
     }catch(e){diagnostics.push(file.name+': '+e.message);}
    }
    if(page.next!==null&&(!Number.isInteger(page.next)||page.next<=cursor||page.next>256))throw Error('Invalid discovery cursor');cursor=page.next;
   }while(cursor!==null);
   if(disposed||current!==epoch||abort.signal.aborted)return;
   // Validate candidates independently; whole publication is still atomic. Invalid upgrades
   // are absent from the new discovery snapshot; active hosts retain pinned registrations.
   const valid=[];
   for(const d of candidates){if(conflicts.has(d.id)){diagnostics.push('Conflicting id: '+d.id);continue;}
    // A dry validation API avoids intermediate catalog notifications.
    const result=catalog.validate(d);if(result.code==='success')valid.push(d);else diagnostics.push(d.id+': '+result.message);
   }
   const result=catalog.replace([...builtins(),...valid]);if(result.code!=='success')throw Error(result.message);
   onStatus(diagnostics.length?diagnostics.join('; '):'Application manifests refreshed');
  }catch(e){if(!disposed&&current===epoch)onStatus('Discovery unchanged: '+e.message);}
  finally{busy=false;}
 }
 return {refresh,cancel(){epoch++;abort?.abort();},dispose(){disposed=true;epoch++;abort?.abort();}};
}
