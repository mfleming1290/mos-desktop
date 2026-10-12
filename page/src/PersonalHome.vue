<script setup>
import {ref,onBeforeUnmount} from 'vue';
const props=defineProps({host:Object,active:Boolean});
const path=ref(''),entries=ref([]),status=ref('Choose Refresh to connect'),text=ref(''),filename=ref(''),next=ref(null);
let live=true,epoch=0;
const call=(operation,args={})=>props.host.personal.operation(operation,args);
async function list(cursor=0){const generation=++epoch,directory=path.value;try{const result=await call('list',{path:directory,cursor});if(!live||generation!==epoch||path.value!==directory)return;entries.value=result.entries;next.value=result.next;status.value='Home directory loaded';}catch(e){if(live&&generation===epoch)status.value=e.message;}}
async function open(entry){if(entry.kind==='directory'){path.value=[path.value,entry.name].filter(Boolean).join('/');return list();}if(entry.kind!=='file')return;
  const generation=++epoch,before=text.value;try{const value=await call('read',{path:[path.value,entry.name].filter(Boolean).join('/')});if(!live||generation!==epoch)return;
    if(text.value!==before)throw new Error('unsavedChanges');
    text.value=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.data),c=>c.charCodeAt(0)));status.value='Plain-text preview — use a new top-level name to save a copy';
  }catch(e){if(live)status.value=e.message;}}
async function save(){try{const bytes=new TextEncoder().encode(text.value);if(bytes.length>1048576)throw new Error('capacityExceeded');let data='';for(const byte of bytes)data+=String.fromCharCode(byte);
  await call('write',{path:filename.value,data:btoa(data),expected:null});if(live){status.value='Copy saved; original unchanged';path.value='';await list();}
}catch(e){if(live)status.value=e.message;}}
async function folder(){try{await call('mkdir',{path:filename.value});if(live){path.value='';await list();status.value='Folder created';}}catch(e){if(live)status.value=e.message;}}
onBeforeUnmount(()=>{live=false;++epoch;});
</script>
<template><section><p role="status">{{status}}</p><p>Personal LXC Home. Saves create new top-level files; existing files are never overwritten.</p>
  <label>Relative directory <input v-model="path"></label><button @click="list()">Refresh Home</button><button @click="path='';list()">Home root</button>
  <ul><li v-for="entry in entries" :key="entry.name"><button :disabled="entry.kind==='unsupported'" @click="open(entry)">{{entry.name}} ({{entry.kind}})</button></li></ul>
  <button v-if="next!==null" @click="list(next)">Next page</button>
  <label>Plain-text preview / new document <textarea v-model="text" rows="8" maxlength="1048576"></textarea></label>
  <label>New top-level filename <input v-model="filename" maxlength="255"></label><button @click="save">Save new copy</button><button @click="folder">Create top-level folder</button>
</section></template>
<style scoped>textarea,input{box-sizing:border-box;width:100%}textarea{font-family:monospace}</style>
