<script setup>
import {inject,ref,shallowRef,onUnmounted,computed,watch} from 'vue';
const props=defineProps({active:Boolean});
const service=inject('applicationCatalog');
const query=ref(''),category=ref(''),message=ref('');
const generation=shallowRef(service.catalog.snapshot());
const stop=service.catalog.subscribe(s=>generation.value=s);onUnmounted(stop);
let timer;
watch(()=>props.active,active=>{clearInterval(timer);service.discovery.cancel();if(active)timer=setInterval(()=>service.discovery.refresh(),5000);},{immediate:true});
onUnmounted(()=>{clearInterval(timer);service.discovery.cancel();});
const entries=computed(()=>{generation.value;return service.catalog.search({text:query.value,category:category.value||undefined});});
const categories=computed(()=>[...new Set(generation.value.definitions.map(d=>d.category).filter(Boolean))]);
async function launch(id){try{await service.launch(id);message.value='Opened application';}catch(e){message.value=e.message;}}
</script>
<template>
 <section aria-label="Application library" class="application-library">
  <h2>Application Library</h2>
  <button @click="service.discovery.refresh()">Refresh application manifests</button><p role="status">{{service.discoveryStatus.value}}</p>
  <label>Search applications <input v-model="query" type="search"></label>
  <label>Category <select v-model="category"><option value="">All</option><option v-for="c in categories" :key="c">{{c}}</option></select></label>
  <p role="status">{{message}}</p>
  <ul class="application-list"><li class="application-card" v-for="entry in entries" :key="entry.id"><strong>{{entry.label}}</strong> <span>{{entry.description}}</span>
   <p>{{service.availability(entry).message}}</p>
   <details><summary>Details for {{entry.label}}</summary><p>{{entry.id}} — {{entry.connector.id}} / {{entry.connector.target}} — {{entry.instancePolicy}}</p><p>Preferred size: {{entry.preferredSize.width}} × {{entry.preferredSize.height}}. Tags: {{entry.tags?.join(', ')||'none'}}</p></details>
   <button :disabled="service.availability(entry).code!=='available'" @click="launch(entry.id)">Open {{entry.label}}</button>
  </li></ul><p v-if="!entries.length">No matching applications</p>
 </section>
</template>
