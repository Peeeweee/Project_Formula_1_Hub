import media from '../data/mediaManifest.json';
export const mediaKey = value => {
 let title = String(value || '').split('/wiki/').pop().split('#')[0];
 try { title = decodeURIComponent(title); } catch { /* Preserve plain names. */ }
 return title.replaceAll('_', ' ').trim();
};
export const localMedia = value => media[mediaKey(value)] || null;
export const localImage = value => {
 const entry = localMedia(value);
 return entry?.path ? `${import.meta.env?.BASE_URL || '/'}${entry.path}` : null;
};
const pending = new Map(), cache = new Map(), waiting = [];
let active = 0;
async function resolveRemote(title) {
 if (active >= 3) await new Promise(resolve => waiting.push(resolve));
 active++;
 try {
  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(' ', '_'))}`, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) return null;
  const data = await response.json();
  const image = data.thumbnail?.source || null;
  if (image) cache.set(title, image);
  return image;
 } catch { return null; }
 finally { active--; waiting.shift()?.(); }
}
export default function getWikipediaImage(value) {
 const title = mediaKey(value);
 if (!title) return Promise.resolve(null);
 const local = localImage(title);
 if (local) return Promise.resolve(local);
 if (cache.has(title)) return Promise.resolve(cache.get(title));
 if (pending.has(title)) return pending.get(title);
 const request = resolveRemote(title).finally(() => pending.delete(title));
 pending.set(title, request);
 return request;
}
