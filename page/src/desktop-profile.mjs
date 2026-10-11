// MOS owns authentication. Use its existing credential only for this same-origin GET;
// never decode it, expose it as a prop, or derive identity from browser-stored userid.
export function createMosProfileScope({storage, fetcher = globalThis.fetch} = {}) {
  let verifiedCredential, verifiedScope = '';
  const credential = () => {try {return storage?.getItem('authToken') || '';} catch {return '';}};
  return {
    async resolve(signal) {
      verifiedCredential = undefined; verifiedScope = '';
      const current = credential();
      if (!current) return '';
      try {
        const response = await fetcher('/api/v1/auth/profile', {method: 'GET', signal,
          credentials: 'same-origin', redirect: 'error', headers: {Authorization: `Bearer ${current}`}});
        if (!response.ok || signal?.aborted) return '';
        const profile = await response.json();
        if (signal?.aborted || current !== credential() || !profile || Array.isArray(profile)
          || typeof profile.id !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(profile.id)) return '';
        verifiedCredential = current; verifiedScope = `mos:user:${profile.id}`;
        return verifiedScope;
      } catch {return '';}
    },
    isCurrent() {return !!verifiedScope && verifiedCredential === credential();},
    invalidate() {verifiedCredential = undefined; verifiedScope = '';},
  };
}
