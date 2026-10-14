export function createConnectorControls({personal,catalog,artifacts,managed,approvalState}) {
 let epoch=0,live=true,state;
 function reconcile(next){state=next;if(approvalState)approvalState.value=next;const records=next.records??{};
  const copy=new Map(artifacts.value);
  for(const [identity,artifact] of copy){if(records[artifact.manifest.id]?.decision==='revoked')copy.delete(identity);}
  artifacts.value=copy;
  return next;
 }
 async function refresh(){const generation=epoch;const next=await personal.operation('connector.list');if(!live||generation!==epoch)throw Error('Connector request cancelled');return reconcile(next);}
 async function decide(item,decision,revision){epoch++;const generation=epoch;const next=await personal.operation('connector.decide',{id:item.manifest.id,identity:item.identity,decision,revision});if(!live||generation!==epoch)throw Error('Connector request cancelled');return reconcile(next);}
 async function acquire(id,identity,revision){const generation=epoch;const value=await personal.operation('connector.activate',{id,identity,revision});if(!live||generation!==epoch)throw Error('Connector activation cancelled');
  // Recheck current durable authority after asynchronous acquisition before publishing.
  const next=await refresh();if(!next.writable||next.records?.[id]?.identity!==identity||next.records?.[id]?.decision!=='approved')throw Error('Connector approval changed');
  if(!live||generation!==epoch)throw Error('Connector activation cancelled');artifacts.value=new Map(artifacts.value).set(identity,value);return value;
 }
 async function activate(item,revision){const value=await acquire(item.manifest.id,item.identity,revision);
  const descriptor={version:1,id:'connector-'+item.manifest.id,label:item.manifest.id,category:'Installed connectors',tags:[],connector:{id:'installed',target:item.manifest.id},instancePolicy:'multiple',preferredSize:{width:500,height:400},configuration:{}};
  const previous=catalog.list().filter(d=>d.id!==descriptor.id);const result=catalog.replace([...previous,descriptor]);if(result.code!=='success')throw Error(result.message);managed.set(descriptor.id,descriptor);return value;
 }
 return {refresh,decide,activate,support(id){const value=approvalState?.value??state,record=value?.records?.[id],item=value?.connectors?.find(i=>i.manifest.id===id);return value?.writable&&record?.decision==='approved'&&item?.identity===record.identity&&artifacts.value.has(record.identity)?{code:'available',message:'Exact approved isolated module; point-of-use revalidation required'}:{code:'unavailable',message:'Activate exact approval in Connector Manager; pending/disabled/revoked modules cannot launch'};},async admit(entry){const next=await refresh();const record=next.records?.[entry.connector.target];if(!next.writable||record?.decision!=='approved'||!artifacts.value.has(record.identity))throw Error('Explicit connector activation required');await acquire(entry.connector.target,record.identity,next.revision);return {connectorId:entry.connector.target,artifactIdentity:record.identity};},dispose(){live=false;epoch++;}};
}
