import fs from 'node:fs/promises';
import { summariseDriverResults } from '../src/utils/driverStats.js';
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function get(route) {
 for(let attempt=0;attempt<4;attempt++) {
  await sleep(500 + attempt*2000);
  const response=await fetch(`https://api.jolpi.ca/ergast/f1${route}`,{signal:AbortSignal.timeout(20000)});
  if(response.ok) return (await response.json()).MRData;
  if(response.status!==429&&response.status<500) throw new Error(`${route}: ${response.status}`);
 }
 throw new Error(`Rate limited: ${route}`);
}
const all=[];
for(let offset=0,total=Infinity;offset<total;offset+=100) {
 const data=await get(`/drivers.json?limit=100&offset=${offset}`);total=Number(data.total);all.push(...data.DriverTable.Drivers);
}
await fs.writeFile('src/data/driversSnapshot.json',JSON.stringify({retrievedAt:new Date().toISOString(),drivers:all}));
const champions=JSON.parse(await fs.readFile('src/data/champions.json','utf8'));
const ids=[...new Set(champions.map(row=>row.DriverStandings[0].Driver.driverId))].reverse();
const current=await get('/current/drivers.json?limit=100');
for(const d of current.DriverTable.Drivers) if(!ids.includes(d.driverId)) ids.push(d.driverId);
const archive={retrievedAt:new Date().toISOString(),drivers:{}};
for(const id of ids) {
 try {
  const races=[];
  for(let offset=0,total=Infinity;offset<total;offset+=100) {
   const data=await get(`/drivers/${id}/results.json?limit=100&offset=${offset}`);total=Number(data.total);races.push(...data.RaceTable.Races);
  }
  archive.drivers[id]=summariseDriverResults(races,champions.filter(row=>row.DriverStandings[0].Driver.driverId===id));
  await fs.writeFile('src/data/careerSnapshot.json',JSON.stringify(archive));
  console.log(id,archive.drivers[id].races);
 }catch(e){console.log('Missing',id,e.message);}
}
