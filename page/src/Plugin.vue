<script setup>
import DesktopShell from './DesktopShell.vue';
import {ref, onMounted, onUnmounted} from 'vue';
import {createMosProfileScope} from './desktop-profile.mjs';
const props = defineProps({verifiedStorageScope: {type: String, default: ''}});
const scope = ref(''), initialized = ref(false);
let storage; try {storage = globalThis.localStorage;} catch {}
const profile = createMosProfileScope({storage});
let abort, timeout, live = true, generation = 0;
const canPersist = () => !!props.verifiedStorageScope || profile.isCurrent();
async function verify() {
  if (props.verifiedStorageScope) {initialized.value = true; return;}
  const current = ++generation;
  abort?.abort(); clearTimeout(timeout); abort = new AbortController();
  profile.invalidate(); scope.value = ''; initialized.value = false;
  timeout = setTimeout(() => abort.abort(), 10000);
  const result = await profile.resolve(abort.signal);
  if (current === generation) clearTimeout(timeout);
  if (live && current === generation) {scope.value = result; initialized.value = true;}
}
function identityChanged(event) {
  if (!props.verifiedStorageScope && (!event || event.key === null || event.key === 'authToken')) verify();
}
function visibility() {if (!document.hidden && !props.verifiedStorageScope && !profile.isCurrent()) verify();}
onMounted(() => {window.addEventListener('storage', identityChanged); document.addEventListener('visibilitychange', visibility); verify();});
onUnmounted(() => {live = false; generation++; abort?.abort(); clearTimeout(timeout); profile.invalidate(); window.removeEventListener('storage', identityChanged); document.removeEventListener('visibilitychange', visibility);});
</script>

<template>
  <DesktopShell v-if="initialized" :key="verifiedStorageScope || scope" :verified-storage-scope="verifiedStorageScope || scope" :can-persist="canPersist" />
  <p v-else role="status">Checking MOS profile…</p>
</template>
