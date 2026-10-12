<script setup>
import {ref,watch,onBeforeUnmount} from 'vue';
import {createDesktopId} from './desktop-controller.mjs';
const props=defineProps({host:Object,active:Boolean});
const view=createDesktopId(),source=ref(''),inputEnabled=ref(false),status=ref('Choose Connect to attach to the personal graphical session');
let live=true,timer,revision=0,pending=false;
async function connect(takeover=false){
  if(!live||pending||!props.active)return;
  pending=true;const current=revision;
  try{
    const value=await props.host.personal.operation('stream.attach',{view,takeover});
    if(!live||current!==revision)return;
    if(!/^\/desktop-stream\/[a-f0-9]{64}\/$/.test(value.path))throw new Error('invalidResponse');
    source.value=value.path;inputEnabled.value=value.controller;status.value=value.controller?'Connected — input enabled':'Connected — view only';
    clearTimeout(timer);timer=setTimeout(()=>connect(),8000);
  }catch(error){if(live&&current===revision){source.value='';status.value=error.message;}}
  finally{pending=false;}
}
function detach(){++revision;clearTimeout(timer);source.value='';props.host.personal.operation('stream.detach',{view}).catch(()=>{});}
watch(()=>props.active,active=>{if(!active)detach();});
onBeforeUnmount(()=>{live=false;detach();});
</script>
<template><section class="stream"><p role="status">{{status}}</p>
  <p>Personal graphical session. Closing or disconnecting this view leaves the application running. Clipboard, uploads, microphone, camera and remote commands are disabled.</p>
  <div><button @click="connect()">Connect stream</button><button @click="connect(true)">Take stream input control</button><button @click="detach();status='Disconnected; application remains running'">Disconnect stream</button></div>
  <iframe v-if="source" :key="inputEnabled" :src="source" title="Personal graphical session" sandbox="allow-scripts allow-pointer-lock" referrerpolicy="no-referrer" allow="autoplay; fullscreen"></iframe>
</section></template>
<style scoped>.stream{height:100%;display:flex;flex-direction:column;min-height:0}.stream p{margin:.25rem 0}.stream iframe{flex:1;min-height:160px;width:100%;border:0}</style>
