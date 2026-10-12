<script setup>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue';
import {mountEditor} from '../../runtime/editor.mjs';
import {createDocumentCommands} from './desktop-personal.mjs';
const props=defineProps({host:Object,active:Boolean,instanceId:String});
const target=ref(),path=ref(''),opened=ref(''),status=ref('New document'),pending=ref(false),text=ref(''),saved=ref('');
let editor,commands,live=true;
onMounted(()=>{
  editor=mountEditor(target.value,{instanceId:props.instanceId,active:props.active,onChange:value=>{text.value=value.text;}});
  commands=createDocumentCommands({host:props.host.personal,editor});
});
watch(()=>props.active,value=>editor?.setActive(value));
async function run(kind){
  if(!editor||pending.value||!props.active)return;
  pending.value=true;
  const saving=text.value;
  try{
    if(kind==='open'){
      const discard=text.value!==saved.value&&confirm('Discard unsaved edits and open this file?');
      const result=await commands.open(path.value,{discard});
      if(!live)return;opened.value=result.path;saved.value=editor.snapshot().text;
    }else{
      const result=await commands.save(kind==='copy'?{path:path.value}:{});
      if(!live)return;opened.value=result.path;path.value=result.path;saved.value=saving;
    }
    status.value=kind==='open'?'Document opened':'Document saved';
  }catch(error){if(live)status.value=error.message;}
  finally{if(live)pending.value=false;}
}
onBeforeUnmount(()=>{live=false;commands?.dispose();editor?.dispose();});
</script>
<template>
  <section>
    <p role="status">{{status}}</p>
    <p>{{opened||'Untitled'}}{{text!==saved?' — unsaved edits':''}}. Save before closing; drafts are not persisted.</p>
    <label>Personal file path <input v-model="path" :disabled="pending||!active"></label>
    <button :disabled="pending||!active||!path" @click="run('open')">Open file</button>
    <button :disabled="pending||!active||!opened" @click="run('save')">Save document</button>
    <button :disabled="pending||!active||!path" @click="run('copy')">Save document as</button>
    <p>Scoped personal Home only. New copies and replacement saves are currently top-level only.</p>
    <div ref="target" class="editor-host"></div>
  </section>
</template>
<style scoped>
.editor-host{min-height:220px;background:#fff;color:#111}
.editor-host :deep(.cm-editor){min-height:220px}
.editor-host :deep(.cm-scroller){overflow:auto}
input{max-width:100%;margin:6px}
</style>
