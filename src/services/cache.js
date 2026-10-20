const pending = new Map();
const memory = new Map();
const PREFIX = 'fdc1_api_v2_';

export function getCacheInfo(key) {
  let entry = memory.get(key);
  if (!entry) {
    try { entry = JSON.parse(localStorage.getItem(`${PREFIX}${key}`)); } catch { /* Storage may be disabled. */ }
  }
  return entry || null;
}

export async function cachedFetch(key, fetchFn, ttlMinutes, { force = false } = {}) {
  const cached = getCacheInfo(key);
  if (!force && cached && Date.now() - cached.timestamp < ttlMinutes * 60000) return cached.data;
  if (pending.has(key)) return pending.get(key);
  const request = Promise.resolve().then(fetchFn).then(data => {
    const entry = { data, timestamp: Date.now() };
    memory.set(key, entry);
    try { localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry)); } catch { /* Memory cache remains available. */ }
    return data;
  }).finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}

export function clearAllCache() {
  memory.clear();
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach(key => localStorage.removeItem(key));
  } catch { /* Network fetching still works. */ }
}
