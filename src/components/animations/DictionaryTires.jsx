import { useEffect, useMemo } from 'react';
import { LatheGeometry, Vector2 } from 'three';
import { Label } from './DictionaryAssets';
import { mix, ramp, smooth } from '../../utils/dictionaryTimeline';
function tireGeometry(flat=0,section=false){
 const profile=[[.7,-.38],[1,-.4],[1.14,-.32],[1.2,-.18],[1.21,.18],[1.14,.32],[1,.4],[.7,.38]];
 const geometry=new LatheGeometry(profile.map(p=>new Vector2(...p)),64,0,section?Math.PI*1.55:Math.PI*2);geometry.rotateX(Math.PI/2);
 if(flat>0){const positions=geometry.getAttribute('position');for(let i=0;i<positions.count;i++){if(positions.getY(i)<-1.21+flat*.2)positions.setY(i,-1.21+flat*.2);}positions.needsUpdate=true;geometry.computeVertexNormals();}
 return geometry;
}
function TireBody({flat=0,section=false}){const flatStep=Math.round(flat*20)/20;const geometry=useMemo(()=>tireGeometry(flatStep,section),[flatStep,section]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <><mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color="#192027" roughness={.9}/></mesh><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.64,.64,.53,32]}/><meshStandardMaterial color="#8293a4" metalness={.85} roughness={.3}/></mesh>{Array.from({length:8},(_,i)=><mesh key={i} rotation={[0,0,i*Math.PI/4]} position={[0,0,.31]}><boxGeometry args={[1.04,.055,.055]}/><meshStandardMaterial color="#c1cbd4" metalness={.8} roughness={.3}/></mesh>)}<mesh position={[0,0,.4]}><torusGeometry args={[1,.018,8,64]}/><meshStandardMaterial color="#dfba61"/></mesh><mesh position={[.6,.75,.42]}><boxGeometry args={[.13,.08,.02]}/><meshBasicMaterial color="#f2cc6e"/></mesh></>;}
export default function TireScene({frame}){
 const kind=frame.kind,damage=frame.damage||0,travel=mix(-2,2,frame.u),flat=kind==='flat';
 const angle=flat?(frame.time<3?(3-frame.time)/3/1.21:frame.time<8?0:-(travel-mix(-2,2,8/12))/1.21):-travel/1.21;
 const vibration=flat&&frame.time>8?Math.abs(Math.sin(angle))*damage*.07:0;
 return <><group position={[travel,1.24+vibration,0]}><group rotation={[0,0,angle]}><TireBody flat={flat?damage:0}/>{kind==='graining'&&Array.from({length:24},(_,i)=>{const theta=i/24*Math.PI*2;return <mesh key={i} position={[Math.cos(theta)*1.215,Math.sin(theta)*1.215,0]} rotation={[Math.PI/2,0,theta]} scale={[damage,1,1]}><cylinderGeometry args={[.025,.025,.55,6]}/><meshStandardMaterial color="#56534e" roughness={1}/></mesh>;})}{kind==='blistering'&&Array.from({length:12},(_,i)=>{const theta=i/12*Math.PI*2;return <mesh key={i} position={[Math.cos(theta)*1.2,Math.sin(theta)*1.2,(i%3-1)*.16]} rotation={[0,0,theta]} scale={[damage*.12,damage*.055,.15]}><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color="#0b1118" roughness={1}/></mesh>;})}{kind==='marbles'&&Array.from({length:20},(_,i)=>{const theta=i*.91;return <mesh key={i} position={[Math.cos(theta)*1.22,Math.sin(theta)*1.22,(i%4-1.5)*.14]} scale={damage}><sphereGeometry args={[.045,7,6]}/><meshStandardMaterial color="#5f605a" roughness={1}/></mesh>;})}</group></group>
 {kind==='marbles'&&Array.from({length:65},(_,i)=><mesh key={i} position={[.3+(i%13)*.13,.045,(Math.floor(i/13)-2)*.18]} rotation={[i*.31,i*.2,0]}><sphereGeometry args={[.035+(i%3)*.012,6,5]}/><meshStandardMaterial color="#171e27" roughness={1}/></mesh>)}
 {flat&&frame.time>=3&&frame.time<8&&Array.from({length:8},(_,i)=>{const age=(frame.time*.7+i/8)%1;return <mesh key={i} position={[travel-age*.6,.1+age*.7,.15]} scale={.08+age*.18}><sphereGeometry args={[1,8,8]}/><meshBasicMaterial color="#aab2b9" transparent opacity={(1-age)*.12} depthWrite={false}/></mesh>;})}
 <Label text={flat?(frame.time<3?'ROLLING':frame.time<8?'ROTATION LOCKED':'FLAT PATCH / ROLLING'):kind==='marbles'?'OFF-LINE RUBBER':kind==='graining'?'SURFACE RIDGES':'INTERNAL HEAT DAMAGE'} position={[0,2.9,0]} scale={1.4}/>
 {kind==='blistering'&&<group position={[3.3,1.2,-.2]} scale={.48}><TireBody section/><mesh><torusGeometry args={[.94,.13,12,48,Math.PI*1.5]}/><meshStandardMaterial color="#d3914f" emissive="#d26325" emissiveIntensity={smooth(ramp(frame.time,0,7))}/></mesh><Label text="CUTAWAY" position={[0,1.8,0]} scale={1.5}/></group>}
 <mesh position={[0,.015,.9]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[9,.07]}/><meshBasicMaterial color="#bdc6d0"/></mesh>
 </>;
}
