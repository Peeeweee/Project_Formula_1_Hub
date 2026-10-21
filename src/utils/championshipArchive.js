export function championshipArchive(rows, throughYear, kind='driver') {
 const firstYear=kind==='driver'?1950:1958, unique=new Map();
 for(const row of rows) { const season=Number(row.season), standing=row[kind==='driver'?'DriverStandings':'ConstructorStandings']?.find(item=>String(item.position)==='1');
  const entity=standing?.[kind==='driver'?'Driver':'Constructor'];
  if(Number.isInteger(season)&&season>=firstYear&&season<=throughYear&&entity) unique.set(season,{season,standing,entity});
 }
 const seasons=[...unique.values()].sort((a,b)=>b.season-a.season), groups=new Map();
 for(const item of seasons){const id=item.entity[kind==='driver'?'driverId':'constructorId'];if(!id)continue;const existing=groups.get(id)||{id,entity:item.entity,years:[],seasons:[]};existing.years.push(item.season);existing.seasons.push(item);groups.set(id,existing);}
 const champions=[...groups.values()].sort((a,b)=>b.years.length-a.years.length||a.years.at(-1)-b.years.at(-1)).map((item,_,all)=>({...item,count:item.years.length,rank:1+all.filter(other=>other.years.length>item.years.length).length}));
 const missing=Array.from({length:Math.max(0,throughYear-firstYear+1)},(_,i)=>firstYear+i).filter(year=>!unique.has(year));
 return {champions,seasons,missing,firstYear,throughYear};
}
