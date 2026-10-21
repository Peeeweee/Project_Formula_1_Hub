import { dictionaryFilm, filmChapter } from '../data/dictionaryFilms.js';
export const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
export const mix=(a,b,p)=>a+(b-a)*clamp(p);
export const smooth=p=>{const t=clamp(p);return t*t*(3-2*t);};
export const ramp=(time,a,b)=>clamp((time-a)/(b-a));
export function keyed(time,keys){if(time<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){if(time<=keys[i][0])return mix(keys[i-1][1],keys[i][1],(time-keys[i-1][0])/(keys[i][0]-keys[i-1][0]));}return keys.at(-1)[1];}
const trackLength=56+6*Math.PI;
export function circuitPoint(progress){
 let distance=((progress%1)+1)%1*trackLength;
 const segments=[
  [18,t=>[8,mix(9,-9,t)]],
  [1.5*Math.PI,t=>[5+3*Math.cos(-Math.PI/2*t),-9+3*Math.sin(-Math.PI/2*t)]],
  [10,t=>[mix(5,-5,t),-12]],
  [1.5*Math.PI,t=>[-5+3*Math.cos(-Math.PI/2-Math.PI/2*t),-9+3*Math.sin(-Math.PI/2-Math.PI/2*t)]],
  [18,t=>[-8,mix(-9,9,t)]],
  [1.5*Math.PI,t=>[-5+3*Math.cos(Math.PI-Math.PI/2*t),9+3*Math.sin(Math.PI-Math.PI/2*t)]],
  [10,t=>[mix(-5,5,t),12]],
  [1.5*Math.PI,t=>[5+3*Math.cos(Math.PI/2-Math.PI/2*t),9+3*Math.sin(Math.PI/2-Math.PI/2*t)]]
 ];
 for(const [length,fn] of segments){if(distance<=length)return fn(distance/length);distance-=length;}return [8,9];
}
export function trackPose(progress){const [x,z]=circuitPoint(progress),[nx,nz]=circuitPoint(progress+.0001);return {x,z,heading:Math.atan2(-(nx-x),-(nz-z)),travel:progress*trackLength};}
const car=(id,x,z,extra={})=>({id,x,z,heading:0,travel:-z,...extra});
function passPose(p){
 if(p<.25)return {x:mix(0,2.8,smooth(p/.25)),z:6};
 if(p<.8)return {x:2.8,z:mix(6,-6,smooth((p-.25)/.55))};
 return {x:mix(2.8,0,smooth((p-.8)/.2)),z:-6};
}
function pitPose(time,start,end){
 const p=ramp(time,start,end),entry=circuitPoint(.035),exit=circuitPoint(.21);
 if(p<.28)return {x:mix(entry[0],12,smooth(p/.28)),z:mix(entry[1],0,p/.28),heading:-.48,travel:p*12,service:0};
 if(p<.72)return {x:12,z:0,heading:0,travel:3.4,service:ramp(p,.28,.72)};
 return {x:mix(12,exit[0],smooth((p-.72)/.28)),z:mix(0,exit[1],(p-.72)/.28),heading:.48,travel:3.4+(p-.72)*40,service:0};
}
export function dictionaryFrame(term,inputTime){
 const film=dictionaryFilm(term),time=clamp(inputTime,0,film.duration),u=time/film.duration,chapter=filmChapter(film,time);
 const frame={term,kind:film.kind,time,u,chapter,caption:film.chapters[chapter].text,actors:[],metrics:[],stage:'straight',focus:[0,.7,0],camera:[8,5,-10],panels:[],marker:0};
 const phase=ramp(time,film.duration*.25,film.duration*.8);
 switch(film.kind){
 case 'passing':case 'drs':{
  const p=smooth(ramp(time,2.5,10.5)),pose=passPose(p),advance=time*.45;
  frame.actors=[car('A',pose.x,pose.z-advance,{travel:time*5,drs:film.kind==='drs'?smooth(ramp(time,2.5,4))*(1-smooth(ramp(time,10,11.5))):0}),car('B',0,-advance,{travel:time*4})];
  frame.focus=[0,.7,-advance];if(film.kind==='drs'&&time>=3&&time<5.5){frame.stage='engineering';frame.focus=[0,1,0];frame.camera=[4,2.5,-5];}frame.metrics=[['POSITION',p>.8?'A / B':'B / A'],['ASSIST',time<2.5?'ELIGIBILITY CHECK':time>10.5?'PASS COMPLETE':film.kind==='drs'?'FLAP OPEN':'EXTRA DEPLOYMENT'],['CONTEXT','Successful example; not guaranteed']];break;
 }
 case 'safety':{
  const deploy=smooth(ramp(time,3,7)),release=smooth(ramp(time,12,15));
  frame.actors=[car('SC',mix(5,0,deploy)+release*6,-7-time*.45,{road:true,lights:time>=3&&time<12,travel:time*2}),car('A',0,mix(4,-1,deploy)-time*.45-release*4,{travel:time*3}),car('B',0,mix(16,5,deploy)-time*.45-release*3,{travel:time*3}),car('C',0,mix(28,11,deploy)-time*.45-release*2,{travel:time*3})];
  frame.focus=[0,.7,deploy<.5?8:1-time*.45];frame.camera=[14,12,-24];frame.hazard=true;frame.marshal=true;frame.marker=-12;frame.metrics=[['RACE CONTROL',time<3?'SC DEPLOYED':time<12?'FOLLOW SAFETY CAR':time<15?'SC IN THIS LAP':'RESTART LINE'],['PACE',time<12?'Controlled pace / no racing passes':'Leader controls restart'],['VEHICLE','Road-going safety coupe']];break;
 }
 case 'vsc':{
  const distance=time<3?time*2:time<9?6+(time-3)*.6:9.6+(time-9)*2;
  frame.actors=[car('A',0,6-distance,{travel:distance}),car('B',0,18-distance,{travel:distance})];frame.focus=[0,.7,12-distance];frame.camera=[13,11,-23];frame.flag=time<9?'VSC':'GREEN';frame.hazard=true;frame.metrics=[['CONTROL',time<3?'VSC DEPLOYED':time<9?'MINIMUM TIME ACTIVE':'VSC ENDING / GREEN'],['A / REQUIRED DELTA',time<9?'+0.12 s / compliant':'Racing'],['B / REQUIRED DELTA',time<9?'+0.18 s / compliant':'Racing'],['PHYSICAL SAFETY CAR','None']];break;
 }
 case 'undercut':case 'overcut':case 'box':case 'window':{
  frame.stage='circuit';frame.focus=[2,.5,0];frame.camera=[25,29,-30];frame.pit=true;
  const early=film.kind==='overcut'?'B':'A',late=early==='A'?'B':'A';
  const earlyU=keyed(time,[[0,film.kind==='overcut'?0:-.055],[2,.035],[7,.21],[8,.45],[12,1.16],[13,1.3],[16,1.75]]),lateU=keyed(time,[[0,film.kind==='overcut'?-.055:0],[2,film.kind==='overcut'?-.02:.12],...(film.kind==='overcut'?[[3,.015],[3.5,.12]]:[]),[7,.85],[8,1.035],[13,1.21],[16,1.68]]);
  const earlyPose=time>=2&&time<=7?pitPose(time,2,7):trackPose(earlyU),latePose=time>=8&&time<=13?pitPose(time,8,13):trackPose(lateU);
  if(film.kind==='overcut'&&time>7){Object.assign(earlyPose,trackPose(keyed(time,[[7,.21],[8,.4],[12,1.02],[13,1.13],[16,1.6]])));}
  if(film.kind==='overcut'&&time>=13)Object.assign(earlyPose,trackPose(lateU-.08));
  frame.actors=[{id:early,...earlyPose,scale:.48,tire:time<5?'USED':'FRESH'},{id:late,...latePose,scale:.48,tire:time<11?'USED':'FRESH'}];
  if(film.kind==='box'){frame.actors=[{id:'A',...(time<3?trackPose(mix(-.08,.035,time/3)):time<10?pitPose(time,3,10):trackPose(mix(.21,.65,(time-10)/2))),scale:.48}];}
  if(film.kind==='window'){const lap=Math.min(24,18+Math.floor(u*7));frame.actors=[{id:'A',...trackPose(u*1.2),scale:.48},{id:'TRAFFIC',...trackPose(u*1.2+.16),scale:.48}];frame.metrics=[['PROJECTED LAP',String(lap)],['TIRE AGE',`${lap} laps / example`],['REJOIN',lap<20?'Behind traffic':lap<=23?'Clear gap':'More tire degradation'],['WINDOW',time<12?'Laps 20-23 / initial forecast':'Conditions changed: 23-24']];}
  else if(film.kind==='box')frame.metrics=[['RADIO',time<3?'BOX, BOX':time<10?'PIT LANE':'SAFE RELEASE'],['SPEED','Limit line before the box'],['SERVICE',time<5?'Approach':time<8?'Wheels / jacks':'Crew clear']];
  else frame.metrics=[['PIT CYCLE',time<8?`${early} stops first`:'Both stops count'],['INITIAL GAP',film.kind==='undercut'?'A behind B / 2.0 s':'A behind B / 1.5 s'],['NET PACE GAIN',time<8?'Comparison building':'A gains 3.0 s / example'],['AFTER BOTH STOPS',time<13?'Provisional order':film.kind==='undercut'?'A leads by 1.0 s':'A leads by 1.5 s']];
  const service=frame.actors.find(actor=>actor.service>0);if(service){frame.focus=[12,.5,0];frame.camera=[9,2.6,-3.5];frame.shot=`pit-service-${service.id}`;}frame.crew=true;frame.map=true;break;
 }
 case 'sector':case 'push':case 'delta':{
  frame.stage='circuit';frame.map=true;frame.focus=[0,.5,0];frame.camera=[24,28,-30];const progress=film.kind==='sector'?keyed(time,[[0,.28],[4,1/3],[10,2/3],[13,1],[16,1.08]]):u;
  frame.actors=[{id:'A',...trackPose(progress),scale:.8}];frame.focus=[frame.actors[0].x,.7,frame.actors[0].z];frame.camera=[frame.actors[0].x+7,5,frame.actors[0].z-8];frame.sector=film.kind==='sector'&&time>=10;frame.marker=film.kind==='sector'?2:0;
  if(film.kind==='sector')frame.metrics=[['S2 REFERENCE / B','28.450 s'],['S2 / A',time<4?'Entering sector':time<10?`${(28.31*ramp(time,4,10)).toFixed(3)} s`:'28.310 s / PURPLE'],['SECTOR IMPROVEMENT',time<10?'Await timing line':'0.140 s'],['FULL LAP / RESULT',time<13?'Lap still in progress':'A 1:31.720 / B 1:31.500']];
  else if(film.kind==='delta'){const delta=keyed(time,[[0,0],[4,-.32],[8,-.2],[12,-.2]]);frame.actors.push({id:'REF',...trackPose(progress+delta*.02),scale:.55,ghost:true});frame.metrics=[['REFERENCE','A previous best / same timing point'],['CURRENT - REFERENCE',`${delta<0?'-':'+'}${Math.abs(delta).toFixed(3)} s`],['AT COMPARISON LINE',time<8?'Approaching':'28.300 - 28.500 = -0.200 s']];}
  else frame.metrics=[['LAP',time<3?'Preparation ends':'Timed push lap'],['S1 / S2 / S3',time<4?'S1 running':time<8?'31.400 / S2 running':'31.400 / 28.310 / S3'],['LAP TIME',time<11?`${(91.72*u).toFixed(3)} s`:'1:31.720 / valid attempt']];break;
 }
 case 'blue':case 'lapped':case 'backmarker':{
  const passing=film.kind!=='backmarker'||time>=6,p=smooth(ramp(time,film.kind==='backmarker'?7:3,film.duration-1)),pos=passPose(p),advance=time*.45;
  frame.actors=[car('A',pos.x,pos.z-advance,{travel:time*5}),car('B',0,-advance,{travel:time*4})];if(film.kind==='backmarker'&&time<6)frame.actors=[car('B',0,-advance,{travel:time*3}),car('C',2.6,2-advance,{travel:time*3})];
  frame.flag=passing&&time>3?'BLUE':null;frame.marshal=Boolean(frame.flag);frame.focus=[0,.5,-advance];frame.map=film.kind==='lapped';frame.metrics=[['RACE CONTEXT',film.kind==='backmarker'&&time<6?'B / P21 vs C / P20':'A / leader catches B'],['LAP COUNTERS',film.kind==='backmarker'&&time<6?'B lap 39 / C lap 39':'A lap 40 / B lap 39'],['OBLIGATION',!passing?'Normal race for position':'Predictable safe yielding'],['DISTINCTION',film.kind==='backmarker'?'Rear position is not a lap deficit':'Passing car has covered extra distance']];break;
 }
 case 'start':{
  const legal=ramp(time,6,10),early=ramp(time,3,6);frame.actors=[car('A',-1.6,6-early*1.2-legal*8,{travel:early*1.2+legal*8}),car('B',1.6,6-legal*8,{travel:legal*8})];frame.lights=time<6;frame.marker=5;frame.metrics=[['START LIGHTS',time<6?'RED / hold position':'LIGHTS OUT'],['A FIRST MOVEMENT','3.0 s / before lights out'],['B FIRST MOVEMENT','6.0 s / after lights out'],['REVIEW',time<9?'Aligned video + timing evidence':'Stewards apply relevant regulations']];break;
 }
 case 'dnf':{
  const pull=smooth(ramp(time,3,7)),distance=keyed(time,[[0,5],[3,0],[7,-3],[12,-3]]);frame.actors=[car('A',pull*5,distance,{travel:-distance,retired:time>=7}),car('B',-2.4,7-time*1.7,{travel:time*1.7})];frame.marshal=time>6;frame.metrics=[['A STATUS',time<3?'Mechanical warning':time<7?'Slowing / safe area':'RETIRED / DNF'],['B STATUS','Continues racing'],['RESULT NOTE','Retired may still be classified']];break;
 }
 default: {
  frame.stage=['flat','marbles','graining','blistering'].includes(film.kind)?'tire':['inspection','quali'].includes(film.kind)?'garage':'engineering';
  frame.camera=frame.stage==='tire'?[4.5,3,5.5]:frame.kind==='halo'?[4,3,-5]:frame.stage==='garage'?[5,3,-6]:[7,4,-9];frame.focus=[0,1,0];frame.mechanism=phase;
  const modes={ers:['RECOVER','STORE','DEPLOY'],mguk:['GENERATOR','STORE','MOTOR'],mguh:['EXHAUST TURBINE','GENERATE','ASSIST TURBO'],aero:['CORNER','STRAIGHT','CORNER'],inspection:['MONITORED','SETUP CHANGE REVIEW','PERMITTED WORK'],quali:['HISTORICAL ERA','PREPARATION','TIMED ATTEMPT'],halo:['COCKPIT','CONTACT / LOAD PATH','PROTECTION LIMITS'],flat:['ROLLING','LOCKED / SLIDING','FLAT PATCH / VIBRATION'],marbles:['CLEAN LINE','RUBBER PICKUP','GRIP AFFECTED'],graining:['SLIDING','SURFACE SHEAR','GRAINS / RIDGES'],blistering:['INTERNAL HEAT','LAYER SEPARATION','SURFACE DAMAGE']};
  const state=time<film.duration*.25?0:time<film.duration*(['ers','mguk','mguh'].includes(film.kind)?.5:.65)?1:2;
  frame.metrics=[['MECHANISM',modes[film.kind]?.[state]||'TECHNICAL STUDY'],['VIEW',frame.stage==='tire'?'Magnified tire / schematic':'Component cutaway / schematic'],['DATA','Illustrative / no live telemetry']];
  frame.flow=state===1?'recover':state===2?'deploy':'idle';frame.store=state===0?.2:state===1?mix(.2,.9,ramp(time,3,6)):mix(.9,.35,ramp(time,6,12));
  if(['ers','mguk','mguh'].includes(film.kind)){frame.camera=[0,4,-10];frame.focus=[0,1.3,0];}
  frame.flap=film.kind==='aero'?smooth(ramp(time,3,5))*(1-smooth(ramp(time,9,11))):0;
  frame.wheelAngle=film.kind==='flat'?(time<3?-time*3:time<8?-9:-9-(time-8)*3):-time*1.8;
  frame.damage=film.kind==='flat'?smooth(ramp(time,4,8)):film.kind==='marbles'?smooth(ramp(time,3,7)):smooth(ramp(time,3,9));
  if(frame.stage==='garage')frame.actors=[car('A',0,0)];if(film.kind==='quali'&&time>=6){frame.stage='circuit';frame.camera=[24,28,-30];frame.focus=[0,.5,0];frame.actors=[{id:'A',...trackPose((time-6)/6),scale:.55}];frame.metrics.push(['TIMED ATTEMPT',`${((time-6)/6*91.72).toFixed(3)} s / example`]);}
 }
 }
 return frame;
}
