<script setup>
import {ref,onBeforeUnmount} from 'vue';
const props=defineProps({host:Object,active:Boolean});
const path=ref(''),entries=ref([]),status=ref('Choose Refresh to connect'),text=ref(''),filename=ref(''),next=ref(null);
let live=true,epoch=0,current=null;
const saving=ref(false),opened=ref('');
const call=(operation,args={})=>props.host.personal.operation(operation,args);
async function list(cursor=0){const generation=++epoch,directory=path.value;try{const result=await call('list',{path:directory,cursor});if(!live||generation!==epoch||path.value!==directory)return;entries.value=result.entries;next.value=result.next;status.value='Home directory loaded';}catch(e){if(live&&generation===epoch)status.value=e.message;}}
async function open(entry){if(saving.value)return;if(entry.kind==='directory'){path.value=[path.value,entry.name].filter(Boolean).join('/');return list();}if(entry.kind!=='file')return;
  const generation=++epoch,before=text.value;try{const value=await call('read',{path:[path.value,entry.name].filter(Boolean).join('/')});if(!live||generation!==epoch)return;
    if(text.value!==before)throw new Error('unsavedChanges');
    text.value=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.data),c=>c.charCodeAt(0)));current={path:[path.value,entry.name].filter(Boolean).join('/'),version:value.version};opened.value=current.path;status.value='Document opened';
  }catch(e){if(live)status.value=e.message;}}
async function save(existing=false){if(saving.value)return;saving.value=true;++epoch;try{const bytes=new TextEncoder().encode(text.value);if(bytes.length>1048576)throw new Error('capacityExceeded');let data='';for(const byte of bytes)data+=String.fromCharCode(byte);
  const target=existing?current?.path:filename.value;if(!target)throw new Error('pathRequired');
  const result=await call('write',{path:target,data:btoa(data),expected:existing?current.version:null});if(live){current={path:target,version:result.version};opened.value=target;path.value='';await list();status.value=existing?'Document saved':'Copy saved; original unchanged';}
}catch(e){if(live)status.value=e.message;}finally{saving.value=false;}}
async function folder(){try{await call('mkdir',{path:filename.value});if(live){path.value='';await list();status.value='Folder created';}}catch(e){if(live)status.value=e.message;}}
onBeforeUnmount(()=>{live=false;++epoch;});
</script>
<template><section><p role="status">{{status}}</p><p>Personal LXC Home. Top-level Save checks the opened version; Save As never overwrites. Concurrent terminal writes can still race with Save.</p>
  <label>Relative directory <input v-model="path"></label><button @click="list()">Refresh Home</button><button @click="path='';list()">Home root</button>
  <ul><li v-for="entry in entries" :key="entry.name"><button :disabled="entry.kind==='unsupported'" @click="open(entry)">{{entry.name}} ({{entry.kind}})</button></li></ul>
  <button v-if="next!==null" @click="list(next)">Next page</button>
  <label>Plain-text preview / new document <textarea v-model="text" rows="8" maxlength="1048576"></textarea></label>
  <p v-if="opened">Opened: {{opened}}</p><button :disabled="saving||!opened||opened.includes('/')" @click="save(true)">Save opened file</button>
  <label>New top-level filename <input v-model="filename" maxlength="255"></label><button :disabled="saving" @click="save(false)">Save new copy</button><button @click="folder">Create top-level folder</button>
</section></template>
<style scoped>textarea,input{box-sizing:border-box;width:100%}textarea{font-family:monospace}</style>
