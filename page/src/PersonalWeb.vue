<script setup>
import {ref} from 'vue';
import {validateWebUrl,webAdapter,webCapabilities} from './desktop-web-content.mjs';
const props=defineProps({config:Object,active:Boolean});
const address=ref(props.config.initialUrl||''),url=ref(''),epoch=ref(0),message=ref('Frame content unverified. A site may refuse embedding; loading does not prove success.');
function navigate(){try{webAdapter.invoke('address');url.value=validateWebUrl(address.value);address.value=url.value;epoch.value++;message.value='Frame content unverified; browser headers and navigation restrictions apply.';}catch(e){message.value=e.message;}}
function reload(){try{webAdapter.invoke('reload');if(url.value)epoch.value++;}catch(e){message.value=e.message;}}
if(address.value)navigate();
</script>
<template><section aria-label="Browser content">
 <form @submit.prevent="navigate"><label>Address <input v-model="address" maxlength="4096" type="url"></label><button>Go</button><button type="button" @click="reload">Reload</button></form>
 <p role="status">{{message}}</p><p>{{webAdapter.availability().message}}</p>
 <button disabled title="Cross-origin history unavailable">Back</button><button disabled title="Cross-origin history unavailable">Forward</button>
 <iframe v-if="url" :key="epoch" :src="url" title="Web content" sandbox="allow-scripts allow-forms" referrerpolicy="no-referrer" />
 </section></template>
<style scoped>iframe{width:100%;height:350px;border:0}form{display:flex;gap:6px}input{width:100%}</style>
