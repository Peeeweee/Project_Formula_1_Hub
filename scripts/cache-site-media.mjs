import fs from 'node:fs/promises';
import path from 'node:path';
const read = async name => JSON.parse(await fs.readFile(`src/data/${name}.json`, 'utf8'));
const manifest = JSON.parse(await fs.readFile('src/data/mediaManifest.json', 'utf8').catch(() => '{}'));
await fs.mkdir('public/assets/media', { recursive: true });
const jobs = new Map();
const add = (title, alias = title) => { if (title) { title = title.replaceAll('_', ' '); jobs.set(title, [...(jobs.get(title) || []), alias]); } };
for (const row of await read('champions')) { const d = row.DriverStandings[0].Driver; add(decodeURIComponent(d.url.split('/wiki/')[1]).replaceAll('_',' '), `${d.givenName} ${d.familyName}`); }
for (const era of await read('eras')) add(era.wikiSearchTerm);
for (const era of await read('carVault')) for (const car of era.cars) add(car.wikiSearchTerm);
for (const team of await read('constructors')) add(team.wikiSearchTerm);
add('Red Bull RB16B', 'Red Bull Racing RB16B');
const drivers = (await read('driversSnapshot')).drivers;
for (const id of Object.keys((await read('careerSnapshot')).drivers || {})) {
 const driver = drivers.find(item => item.driverId === id);
 if (driver?.url) add(decodeURIComponent(driver.url.split('/wiki/')[1]), `${driver.givenName} ${driver.familyName}`);
}
const entries = [...jobs].filter(([title]) => !process.argv[2] || title === process.argv[2]);
let cursor = 0;
async function worker() {
 while (cursor < entries.length) {
  const [title, aliases] = entries[cursor++];
  if (manifest[title]?.path) { for (const alias of aliases) manifest[alias] = manifest[title]; continue; }
  await new Promise(resolve => setTimeout(resolve, 1600));
  try {
   const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(' ','_'))}`, { signal: AbortSignal.timeout(15000) });
   if (!response.ok) throw new Error(`summary ${response.status}`);
   const summary = await response.json();
   for (const key of [title, ...aliases, summary.title]) manifest[key] = { ...manifest[key], page: summary.content_urls?.desktop?.page, description: summary.description, summary: summary.extract };
   const source = summary.thumbnail?.source;
   if (!source) throw new Error('no image');
   const image = await fetch(source, { signal: AbortSignal.timeout(15000) });
   if (!image.ok || !image.headers.get('content-type')?.startsWith('image/')) throw new Error(`image ${image.status}`);
   const filename = `${title.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase()}.${new URL(source).pathname.split('.').pop()}`;
   await fs.writeFile(path.join('public/assets/media', filename), Buffer.from(await image.arrayBuffer()));
   const entry = { path: `assets/media/${filename}`, source, page: summary.content_urls?.desktop?.page, description: summary.description, summary: summary.extract };
   for (const key of [title, ...aliases, summary.title]) manifest[key] = entry;
   console.log('Saved', title);
  } catch (error) { console.log('Missing', title, error.message); }
 }
}
await worker();
await fs.writeFile('src/data/mediaManifest.json', JSON.stringify(manifest, null, 2));
console.log('Manifest:', Object.keys(manifest).length);
