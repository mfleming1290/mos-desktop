<script setup>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue';
import {Terminal} from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import {createDesktopId} from './desktop-controller.mjs';
const props=defineProps({host:Object,active:Boolean});
const target=ref(),sessions=ref([]),selected=ref(''),status=ref('Disconnected'),columns=ref(80),rows=ref(24);
const view=createDesktopId(),controller=ref(false);
let terminal,live=true,timer,sequence=0,input='',sending=false,inputTimer,epoch=0;
const call=(operation,args={})=>props.host.personal.operation(operation,args);
const error=e=>{if(live){status.value=e.message;controller.value=false;if(terminal)terminal.options.disableStdin=true;}};
async function inventory(){if(!props.active)return;try{const value=await call('terminal.list');if(live&&props.active)sessions.value=value.sessions;}catch(e){error(e);}}
async function connect(takeover=false){
  if(!selected.value || !props.active)return;
  const generation=++epoch,id=selected.value;
  try{
    const value=await call('terminal.attach',{id,view,takeover});
    if(!live || generation!==epoch)return;
    controller.value=value.controller;terminal.options.disableStdin=!value.controller;
    status.value=value.exited?'Exited':value.controller?'Connected — input enabled':'Connected — read only';
    if(value.controller)await call('terminal.resize',{id,view,columns:+columns.value,rows:+rows.value});
    clearTimeout(timer);await poll(generation,id);
  }catch(e){error(e);}
}
async function poll(generation,id){
  if(!live || !props.active || generation!==epoch)return;
  try{
    const value=await call('terminal.output',{id,after:sequence});
    if(!live || !props.active || generation!==epoch)return;
    if(value.gap)terminal.writeln('\r\n[Earlier output unavailable]');
    terminal.write(Uint8Array.from(atob(value.data),c=>c.charCodeAt(0)));sequence=value.sequence;
    if(value.exited){status.value='Exited';terminal.options.disableStdin=true;controller.value=false;return;}
    const lease=await call('terminal.attach',{id,view});
    if(!live || generation!==epoch)return;
    controller.value=lease.controller;terminal.options.disableStdin=!lease.controller;
    timer=setTimeout(()=>poll(generation,id),1000);
  }catch(e){error(e);}
}
async function detach(){
  ++epoch;clearTimeout(timer);clearTimeout(inputTimer);input='';controller.value=false;
  if(terminal)terminal.options.disableStdin=true;
  if(selected.value)try{await call('terminal.detach',{id:selected.value,view});}catch{}
}
async function choose(event){await detach();selected.value=event.target.value;sequence=0;terminal.reset();await connect();}
async function create(){try{await detach();const value=await call('terminal.create');if(!live)return;selected.value=value.id;sequence=0;terminal.reset();await inventory();await connect();}catch(e){error(e);}}
async function send(){
  if(sending || !input || !controller.value || !props.active)return;
  const value=input;input='';sending=true;
  const bytes=new TextEncoder().encode(value);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  try{const result=await call('terminal.input',{id:selected.value,view,data:btoa(binary)});
    if(result.acceptedBytes!==bytes.length)throw new Error('Input incomplete; not replayed');
  }catch(e){input='';error(e);}finally{sending=false;if(input && controller.value)inputTimer=setTimeout(send,50);}
}
async function end(){
  if(!selected.value || !confirm('End this terminal session? Running jobs may stop.'))return;
  try{const result=await call('terminal.end',{id:selected.value});if(!result.exited)throw new Error('Session did not exit; no force stop performed');await detach();selected.value='';await inventory();status.value='Session ended';}catch(e){error(e);}
}
async function applySize(){
  const cols=+columns.value,height=+rows.value;
  if(!Number.isInteger(cols)||!Number.isInteger(height)||cols<2||cols>500||height<2||height>300){status.value='invalidSize';return;}
  try{await call('terminal.resize',{id:selected.value,view,columns:cols,rows:height});if(live)terminal.resize(cols,height);}catch(e){error(e);}
}
onMounted(()=>{
  terminal=new Terminal({cols:80,rows:24,disableStdin:true,scrollback:2000,
    linkHandler:{activate(){}},allowProposedApi:false});terminal.open(target.value);
  terminal.onData(data=>{
    if(!controller.value || !props.active)return;
    if(data.length>1 && (/[\r\n]/.test(data)||data.length>1024) && !confirm('Send this paste to the connected personal terminal?'))return;
    if(new TextEncoder().encode(input+data).length>4096){input='';error(new Error('Input capacity exceeded; not sent'));return;}
    input+=data;clearTimeout(inputTimer);inputTimer=setTimeout(send,50);
  });inventory();
});
watch(()=>props.active,value=>{if(value){inventory();connect();}else detach();});
onBeforeUnmount(()=>{live=false;detach();terminal?.dispose();});
</script>
<template>
  <section><p role="status">{{status}}</p><p>Personal LXC terminal. Closing this view leaves jobs running.</p>
    <button @click="inventory">Refresh sessions</button><button @click="create">New terminal session</button>
    <select aria-label="Terminal session" :value="selected" @change="choose"><option value="">Select a session</option><option v-for="s in sessions" :key="s.id" :value="s.id">{{s.id}}{{s.exited?' (exited)':''}}</option></select>
    <button :disabled="!selected" @click="connect(true)">Take input control</button><button :disabled="!selected" @click="end">End terminal session</button>
    <label>Columns <input v-model="columns" type="number" min="2" max="500"></label><label>Rows <input v-model="rows" type="number" min="2" max="300"></label>
    <button :disabled="!controller" @click="applySize">Apply terminal size</button>
    <div ref="target" class="personal-terminal" aria-label="Personal terminal output"></div>
  </section>
</template>
<style scoped>.personal-terminal{min-height:220px;background:#000}select{max-width:100%}label{display:inline-block;margin:6px}input{width:70px}</style>
