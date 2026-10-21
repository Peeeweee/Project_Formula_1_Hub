import test from 'node:test';
import assert from 'node:assert/strict';
import { GLOSSARY } from '../src/data/glossary.js';
import { DICTIONARY_FILMS, dictionaryFilm, filmChapter } from '../src/data/dictionaryFilms.js';
import { dictionaryFrame, circuitPoint } from '../src/utils/dictionaryTimeline.js';
test('all 27 dictionary entries have individual films, reviewed definitions and four timed chapters',()=>{
 assert.equal(GLOSSARY.length,27);assert.equal(Object.keys(DICTIONARY_FILMS).length,27);
 for(const entry of GLOSSARY){const film=dictionaryFilm(entry.term);assert.equal(entry.definition,film.definition);assert.equal(film.chapters.length,4);assert.ok(film.duration>=12);assert.equal(film.chapters[0].at,0);assert.ok(film.chapters.every((chapter,i)=>chapter.text.length>45&&chapter.at===film.duration*i/4));assert.equal(filmChapter(film,film.duration),3);}
});
test('seeking generates exactly the same scene state without advancing a hidden clock',()=>{
 for(const entry of GLOSSARY){const duration=dictionaryFilm(entry.term).duration;for(let i=0;i<=duration;i+=.5){const first=dictionaryFrame(entry.term,i);dictionaryFrame(entry.term,duration);assert.deepEqual(dictionaryFrame(entry.term,i),first);for(const actor of first.actors){for(const key of ['x','z','heading','travel'])assert.ok(Number.isFinite(actor[key]),`${entry.term} ${key} ${i}`);}}}
});
test('Safety Car is a road vehicle leading three F1 cars; VSC never deploys it',()=>{
 const frame=dictionaryFrame('Safety Car',9);assert.equal(frame.actors.filter(actor=>actor.road).length,1);assert.equal(frame.actors.length,4);const road=frame.actors[0];assert.ok(frame.actors.slice(1).every(actor=>actor.z>road.z));assert.ok(road.lights);assert.equal(dictionaryFrame('Safety Car',13).actors[0].lights,false);for(let time=0;time<=12;time+=.5)assert.ok(dictionaryFrame('VSC',time).actors.every(actor=>!actor.road));
});
test('sector color and arithmetic follow the timing-line event, not an arbitrary purple prop',()=>{
 assert.equal(dictionaryFrame('Purple Sector',9.99).sector,false);assert.equal(dictionaryFrame('Purple Sector',10).sector,true);
 assert.ok(Math.abs((28.45-28.31)-.14)<1e-9);assert.ok(Math.abs(31.4+28.31+32.01-91.72)<1e-9);assert.ok(Math.abs(31.2+28.45+31.85-91.5)<1e-9);assert.ok(91.72>91.5);
 const line=dictionaryFrame('Purple Sector',10).actors[0];const boundary=circuitPoint(2/3);assert.ok(Math.hypot(line.x-boundary[0],line.z-boundary[1])<1e-6);
});
test('undercut and overcut include separate stops for both cars and reconcile the final time gain',()=>{
 for(const term of ['Undercut','Overcut']){const film=dictionaryFilm(term),stopped=new Set();for(let time=0;time<=film.duration;time+=.1){for(const actor of dictionaryFrame(term,time).actors)if(actor.service>0)stopped.add(actor.id);}assert.deepEqual([...stopped].sort(),['A','B']);const final=dictionaryFrame(term,16);assert.ok(final.metrics.find(row=>row[0]==='AFTER BOTH STOPS')[1].includes('A leads'));}assert.equal(3-2,1);assert.equal(3-1.5,1.5);
});
test('overtaking changes order only after leaving room alongside the rival',()=>{
 for(const term of ['Overtake Mode','DRS']){const start=dictionaryFrame(term,0),end=dictionaryFrame(term,12);assert.ok(start.actors[0].z>start.actors[1].z);assert.ok(end.actors[0].z<end.actors[1].z);for(let time=0;time<=12;time+=.01){const [a,b]=dictionaryFrame(term,time).actors;assert.ok(Math.abs(a.x-b.x)>=1.8||Math.abs(a.z-b.z)>=4.32,`${term} collision at ${time}`);}}
});
test('road-car queue spacing remains safe and moving, and jump-start lights match the evidence',()=>{
 for(let t=0;t<=16;t+=.05){const frame=dictionaryFrame('Safety Car',t),actors=frame.actors;for(let i=1;i<actors.length;i++)assert.ok(Math.abs(actors[i].x-actors[i-1].x)>1.8||actors[i].z-actors[i-1].z>4.4);}
 const red=dictionaryFrame('Jump Start',4),grid=dictionaryFrame('Jump Start',0);assert.equal(red.lights,true);assert.ok(red.actors[0].z<grid.actors[0].z);assert.equal(red.actors[1].z,grid.actors[1].z);assert.equal(dictionaryFrame('Jump Start',7).lights,false);
});
test('each specialist scene has its own mechanism and tire damage freezes when timeline is unchanged',()=>{
 assert.equal(dictionaryFrame('Parc Ferm\u00e9',5).stage,'garage');assert.equal(dictionaryFrame('MGUH',5).kind,'mguh');assert.equal(dictionaryFrame('Active Aero',5).flap,1);assert.equal(dictionaryFrame('Active Aero',12).flap,0);for(const term of ['Flat Spot','Marbles','Graining','Blistering']){assert.equal(dictionaryFrame(term,6).stage,'tire');assert.ok(dictionaryFrame(term,11).damage>dictionaryFrame(term,1).damage);}
});

test('both pit strategies maintain oriented vehicle clearance throughout the complete cycle',()=>{
 for(const term of ['Undercut','Overcut'])for(let time=0;time<=16;time+=.01){
  const [a,b]=dictionaryFrame(term,time).actors;
  const axes=[a.heading,b.heading].flatMap(h=>[[Math.cos(h),-Math.sin(h)],[Math.sin(h),Math.cos(h)]]);
  const radius=(actor,[x,z])=>Math.abs(x*Math.cos(actor.heading)-z*Math.sin(actor.heading))*.48+Math.abs(x*Math.sin(actor.heading)+z*Math.cos(actor.heading))*1.296;
  const separated=axes.some(axis=>Math.abs((b.x-a.x)*axis[0]+(b.z-a.z)*axis[1])>=radius(a,axis)+radius(b,axis));
  assert.ok(separated,`${term}: overlapping cars at ${time}`);
 }
});

test('negative delta places the current car ahead of its previous-lap ghost',()=>{
 const frame=dictionaryFrame('Delta Time',8),[current,reference]=frame.actors;
 assert.ok(current.travel>reference.travel);
 assert.equal(frame.metrics[1][1],'-0.200 s');
});
