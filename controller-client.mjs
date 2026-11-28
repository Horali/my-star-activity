// Check-in helper for Node projects (PLAN.md section 7).
// Copy this file into a project. It has no dependencies (Node 18+).
//
//   const light = createControllerClient({
//     id: 'mystar', name: 'My Star',
//     getState: () => ({ ownSwitch: 'on', online: true, idle: false, showing: cardIsOn, preview: {...} }),
//     onLight: (light, sw) => { ... },   // light: 'green' | 'red' | 'none'
//   });
//   light.start();
//
// 'none' means: no controller answers. The project then works alone (PLAN.md 4.4).

export function createControllerClient({
  id,
  name,
  url = 'http://127.0.0.1:47400',
  intervalMs = 2000,
  timeoutMs = 1500,
  getState,
  onLight,
}) {
  let timer = null;
  let busy = false;
  let again = false;
  let last = null;

  function report(light, sw) {
    const key = `${light}/${sw}`;
    if (key === last) return;
    last = key;
    try {
      onLight(light, sw);
    } catch {}
  }

  async function checkin() {
    if (busy) {
      again = true;
      return;
    }
    busy = true;
    try {
      const res = await fetch(`${url}/v1/checkin`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, name, ...getState() }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ans = await res.json();
      report(ans.light === 'green' ? 'green' : 'red', ans.switch === 'off' ? 'off' : 'on');
    } catch {
      report('none', undefined);
    } finally {
      busy = false;
      if (again) {
        again = false;
        checkin();
      }
    }
  }

  return {
    start() {
      if (timer) return;
      checkin();
      timer = setInterval(checkin, intervalMs);
    },
    stop() {
      clearInterval(timer);
      timer = null;
    },
    /** Check in at once, for example right after the card changed. */
    poke: checkin,
  };
}
