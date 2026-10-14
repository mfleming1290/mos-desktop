<script setup>
import {inject,computed,ref,onMounted,onUnmounted,watch} from 'vue';
import {connectorDocument} from './desktop-installed-content.mjs';
const props=defineProps({config:Object,active:Boolean,instanceId:String});
const service=inject('applicationCatalog'),frame=ref(),message=ref('Loading approved isolated connector');
const artifact=computed(()=>service.artifacts.value.get(props.config.artifactIdentity));
const identity={view:props.instanceId,session:props.config.connectorId};
const source=computed(()=>artifact.value&&connectorDocument(artifact.value,identity));
let observer,timer;
function send(kind,value){frame.value?.contentWindow?.postMessage({kind,view:identity.view,...value},'*');}
function resize(){const b=frame.value?.getBoundingClientRect();if(b)send('resize',{bounds:{x:0,y:0,width:b.width,height:b.height}});}
function received(e){if(e.source===frame.value?.contentWindow&&e.origin==='null'&&e.data?.view===identity.view&&e.data.kind==='connector-ready'){clearTimeout(timer);message.value='Approved connector attached';send('active',{value:props.active});resize();}}
watch(()=>props.active,value=>send('active',{value}));
onMounted(()=>{timer=setTimeout(()=>message.value='Connector unavailable: no attachment acknowledgement',5000);addEventListener('message',received);observer=new ResizeObserver(resize);if(frame.value)observer.observe(frame.value);});
onUnmounted(()=>{clearTimeout(timer);send('detach');observer?.disconnect();removeEventListener('message',received);});
</script>
<template><section><p role="status">{{artifact?message:'Connector revoked or unavailable; backend resources retained'}}</p><iframe v-if="source" ref="frame" :srcdoc="source" title="Approved connector" sandbox="allow-scripts" referrerpolicy="no-referrer" /></section></template>
<style scoped>iframe{border:0;width:100%;height:300px}</style>
