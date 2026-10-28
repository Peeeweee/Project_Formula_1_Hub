import fs from 'node:fs/promises';
const response = await fetch('https://www.formula1.com/en/teams');
if (!response.ok) throw new Error(`Official directory unavailable: ${response.status}`);
const html = await response.text();
const urls = [...new Set(html.match(/https[^" ]+common\/f1\/\d{4}\/[a-z0-9]+\/\d{4}[a-z0-9]+logowhite\.webp/g))];
const manifest = JSON.parse(await fs.readFile('src/data/teamLogos.json','utf8').catch(()=>'{}'));
await fs.mkdir('public/assets/logos',{recursive:true});
const ids = { redbullracing:'red_bull',racingbulls:'rb',haasf1team:'haas',astonmartin:'aston_martin' };
for (const raw of urls) {
 const team = raw.match(/common\/f1\/(\d{4})\/([a-z0-9]+)\//)[2], id = ids[team] || team;
 const source=raw.replace('w_48','w_240');
 const response = await fetch(source);
 if(!response.ok) { console.log('Missing',id,response.status);continue; }
 await fs.writeFile(`public/assets/logos/${id}.webp`,Buffer.from(await response.arrayBuffer()));
 manifest[id]={path:`assets/logos/${id}.webp`,source,season:Number(raw.match(/common\/f1\/(\d{4})/)[1]),credit:'Formula 1 official team directory'};
 console.log('Logo',id);
}
await fs.writeFile('src/data/teamLogos.json',JSON.stringify(manifest,null,2));
