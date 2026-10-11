// MOS owns authorization. This adapter exposes one fixed read, never arbitrary URLs or commands.
/** @typedef {{name:string,state:string,unprivileged:boolean|null}} LxcObservation */
export function createMosReadHost({storage, fetcher = globalThis.fetch} = {}) {
  const credential = () => {try {return storage?.getItem('authToken') || '';} catch {return '';}};
  let pending = false;
  return Object.freeze({
    // Bounded M2 canary: no arbitrary container, operation, URL or shell input.
    async controlTestContainer(action) {
      if (!['start', 'stop'].includes(action)) return {code: 'denied', message: 'Unsupported operation.'};
      if (pending) return {code: 'busy', message: 'A container operation is already pending.'};
      const token = credential();
      if (!token) return {code: 'denied', message: 'Sign in through MOS first.'};
      pending = true;
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 45000);
      try {
        const response = await fetcher(`/api/v1/lxc/containers/testit/${action}`, {method: 'POST',
          credentials: 'same-origin', redirect: 'error', cache: 'no-store', signal: abort.signal,
          headers: {Authorization: `Bearer ${token}`}});
        if (token !== credential()) return {code: 'unknown', message: 'Session changed. Check MOS status before another operation.'};
        if (response.status === 401 || response.status === 403) return {code: 'denied', message: 'MOS administrator authorization is required.'};
        if (!response.ok) return {code: 'unknown', message: 'MOS did not confirm the operation. Refresh status before retrying.'};
        return {code: 'accepted', message: 'MOS request completed. Refresh status to verify the container state.'};
      } catch {
        return {code: 'unknown', message: 'Operation outcome unknown. Check MOS status; do not automatically retry.'};
      } finally {clearTimeout(timeout); pending = false;}
    },
    /** @returns {Promise<{code:string,message?:string,value?:{items:LxcObservation[],observedAt:number}}>} */
    async listLxcContainers(signal) {
      if (signal?.aborted) return {code: 'cancelled', message: 'Read cancelled.'};
      const token = credential();
      if (!token) return {code: 'denied', message: 'Sign in through MOS to view containers.'};
      const abort = new AbortController();
      const cancel = () => abort.abort(); signal?.addEventListener('abort', cancel, {once: true});
      const timeout = setTimeout(cancel, 10000);
      try {
        const response = await fetcher('/api/v1/lxc/containers?performance=false', {method: 'GET',
          credentials: 'same-origin', redirect: 'error', cache: 'no-store', signal: abort.signal,
          headers: {Authorization: `Bearer ${token}`}});
        if (token !== credential()) return {code: 'denied', message: 'MOS session changed; reopen this window.'};
        if (response.status === 401) return {code: 'denied', message: 'MOS session expired; sign in through MOS.'};
        if (response.status === 403) return {code: 'denied', message: 'MOS administrator permission is required.'};
        if (!response.ok) return {code: 'unavailable', message: 'MOS container status is unavailable.'};
        const data = await response.json();
        if (abort.signal.aborted) return {code: 'cancelled', message: 'Read cancelled or timed out.'};
        if (token !== credential()) return {code: 'denied', message: 'MOS session changed; reopen this window.'};
        if (!Array.isArray(data) || data.length > 256) throw Error('Invalid response');
        const names = new Set();
        const items = data.map(item => {
          if (!item || typeof item.name !== 'string' || !/^[A-Za-z0-9_][A-Za-z0-9_-]{0,63}$/.test(item.name)
            || names.has(item.name) || (item.invalid_config !== true && (!['running','stopped','frozen'].includes(item.state)
            || typeof item.unprivileged !== 'boolean'))) throw Error('Invalid response');
          names.add(item.name);
          return {name: item.name, state: item.invalid_config === true ? 'invalid configuration' : item.state,
            unprivileged: item.invalid_config === true ? null : item.unprivileged};
        });
        return {code: 'success', value: {items, observedAt: Date.now()}};
      } catch {
        return {code: signal?.aborted ? 'cancelled' : 'unavailable', message: 'MOS container read failed or timed out.'};
      } finally {clearTimeout(timeout); signal?.removeEventListener('abort', cancel);}
    },
  });
}
