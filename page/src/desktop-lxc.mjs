import {defineComponent, h, ref, watch, onUnmounted} from 'vue';
export default defineComponent({
  props: {host: {type: Object, required: true}, active: Boolean},
  setup(props) {
    const items = ref([]), status = ref('Not observed'), observedAt = ref(null);
    const confirmation = ref(null), operating = ref(false), operationStatus = ref('');
    let abort, timer, generation = 0, live = true;
    function stop() {generation++; abort?.abort(); clearTimeout(timer); items.value = []; observedAt.value = null; confirmation.value = null;}
    async function control() {
      const action = confirmation.value;
      if (!action || operating.value || !props.active) return;
      confirmation.value = null; operating.value = true;
      operationStatus.value = `Requesting ${action} for mos-desktop…`;
      try {
        const result = await props.host.controlDesktopContainer(action);
        if (live) operationStatus.value = result.message;
      } catch {if (live) operationStatus.value = 'Operation outcome unknown; check MOS status.';}
      finally {operating.value = false; if (live && props.active) refresh();}
    }
    async function refresh() {
      if (!live || !props.active) return;
      stop(); const current = generation;
      abort = new AbortController(); status.value = 'Loading MOS LXC status…';
      let result;
      try {result = await props.host.listLxcContainers(abort.signal);} catch {result = {code: 'unavailable', message: 'MOS container status unavailable.'};}
      if (!live || current !== generation || !props.active) return;
      if (result.code === 'success') {items.value = result.value.items; observedAt.value = result.value.observedAt; status.value = 'Observed MOS LXC status';}
      else status.value = result.message;
      timer = setTimeout(refresh, 30000);
    }
    watch(() => props.active, active => {if (active) refresh(); else {stop(); status.value = 'Paused while hidden';}}, {immediate: true});
    onUnmounted(() => {live = false; stop();});
    return () => h('section', {'aria-label': 'MOS LXC status'}, [
      h('p', {role: 'status'}, status.value),
      observedAt.value && h('p', `Last observed: ${new Date(observedAt.value).toLocaleTimeString()}. Refreshes every 30 seconds while visible.`),
      h('button', {disabled: !props.active, onClick: refresh}, 'Refresh status'),
      h('a', {href: '/lxc'}, 'Open MOS LXC administration'),
      h('p', 'Closing this window does not stop containers. Controls are restricted to the mos-desktop backend.'),
      operationStatus.value && h('p', {role: 'status'}, operationStatus.value),
      confirmation.value && h('div', [h('p', `${confirmation.value === 'stop' ? 'Stop' : 'Start'} mos-desktop? Stopping ends its running applications and terminal sessions.`),
        h('button', {disabled: operating.value, onClick: control}, 'Confirm mos-desktop operation'),
        h('button', {onClick: () => {confirmation.value = null;}}, 'Cancel')]),
      observedAt.value && !items.value.length && h('p', 'No LXC containers found.'),
      h('ul', items.value.map(item => h('li', {key: item.name}, [
        `${item.name} — ${item.state}; unprivileged: ${item.unprivileged === null ? 'unknown' : item.unprivileged ? 'yes' : 'no'}`,
        item.name === 'mos-desktop' && ['running', 'stopped'].includes(item.state) && typeof props.host.controlDesktopContainer === 'function'
          && h('button', {disabled: operating.value || !props.active,
            onClick: () => {confirmation.value = item.state === 'running' ? 'stop' : 'start';}}, item.state === 'running' ? 'Stop mos-desktop…' : 'Start mos-desktop…'),
      ]))),
    ]);
  },
});
