import fs from 'node:fs/promises';
const teams=JSON.parse(await fs.readFile('src/data/constructors.json','utf8'));
const logos=JSON.parse(await fs.readFile('src/data/teamLogos.json','utf8'));
for(const team of teams) {
 const id=({redbull:'red_bull',astonmartin:'aston_martin'})[team.id]||team.id;
 if(logos[id])continue;
 try{
  const title=({renault:'Renault',alfa:'Alfa_Romeo',maserati:'Maserati'})[team.id] || team.wikiSearchTerm.replaceAll(' ','_');
  const response=await fetch(`https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,{signal:AbortSignal.timeout(12000)});
  const html=await response.text();
  const table=html.match(/<table\b[^>]*class="[^"]*infobox[\s\S]*?<\/table>/)?.[0]||'';
  const images=[...table.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/g)].map(match=>match[1]).filter(src=>!/Flag_of|flag_of|Icon|icon|commons-logo|F1_/.test(src));
  console.log(team.id,response.status,images.slice(0,3));
  if(images[0]) {
   const source=`https:${images[0].split('?')[0]}`;
   const asset=await fetch(source,{signal:AbortSignal.timeout(12000)});
   if(asset.ok&&asset.headers.get('content-type')?.startsWith('image/')){
    const file=`${id}-archive.${source.split('.').pop()}`;
    await fs.writeFile(`public/assets/logos/${file}`,Buffer.from(await asset.arrayBuffer()));
    logos[id]={path:`assets/logos/${file}`,source,page:`https://en.wikipedia.org/wiki/${title}`,historical:true,credit:'Archived constructor badge via Wikipedia'};
   }
  }
 }catch(e){console.log(team.id,e.message);}
 await new Promise(resolve=>setTimeout(resolve,800));
}
await fs.writeFile('src/data/teamLogos.json',JSON.stringify(logos,null,2));
