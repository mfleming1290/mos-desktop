<script setup>
import {inject,ref,onMounted} from 'vue';
const service=inject('applicationCatalog'),state=ref(null),message=ref('No connector code loaded');
async function refresh(){try{state.value=await service.connectors.refresh();message.value=state.value.recovery||state.value.diagnostics.join('; ');}catch(e){message.value=e.message;}}
async function decide(item,decision){try{state.value=await service.connectors.decide(item,decision,state.value.revision);message.value='Decision saved';}catch(e){message.value=e.message;await refresh();}}
async function activate(item){try{await service.connectors.activate(item,state.value.revision);message.value='Activated exact approved artifact; open it from the library';}catch(e){message.value=e.message;}}
onMounted(refresh);
</script>
<template><section aria-label="Connector manager"><p>Discovery is inert. Approval trusts these exact bytes in an opaque frame, without host grants. Publisher identity is unverified. Installation requires separate authority.</p>
 <button @click="refresh">Refresh installed connectors</button><p role="status">{{message}}</p>
 <ul v-if="state"><li v-for="item in state.connectors" :key="item.identity"><strong>{{item.manifest.id}} {{item.manifest.version}}</strong><p>{{item.identity}} — {{item.decision}} — {{item.manifest.context}} — requested capabilities: none</p>
 <button v-for="decision in ['approved','rejected','disabled','revoked']" :key="decision" :disabled="!state.writable" @click="decide(item,decision)">{{decision}} {{item.manifest.id}}</button>
 <button :disabled="item.decision!=='approved'||!state.writable" @click="activate(item)">Activate {{item.manifest.id}}</button></li></ul></section></template>
