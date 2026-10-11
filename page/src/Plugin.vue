<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {runCanary} from './runtime-canary.mjs';

const status = ref('Loading paired runtime…');
const owner = new AbortController();
onMounted(async () => {
  try {
    const result = await runCanary({signal: owner.signal});
    if (!owner.signal.aborted && result) {
      status.value = `Runtime PASS — revision ${result.revision}; workspaces ${result.workspaces}; apps ${result.apps}; windows ${result.windows}`;
    }
  } catch {
    if (!owner.signal.aborted) status.value = 'Runtime unavailable — inspect the paired plugin assets. No state was restored or overwritten.';
  }
});
onUnmounted(() => owner.abort());
</script>

<template>
  <section aria-label="MOS Desktop runtime canary">
    <h1>MOS Desktop — M0</h1>
    <p role="status">{{ status }}</p>
    <p>Local integration canary only. No backend or application launch authority.</p>
  </section>
</template>
