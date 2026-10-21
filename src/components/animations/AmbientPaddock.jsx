import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
const modes={'/':'wheel','/watch':'lights','/news':'signal','/racers':'helmet','/cars':'wing','/circuits':'circuit','/strategy':'strategy','/live-season':'signal','/all-time':'trophy','/pit-wall-ai':'strategy','/garage':'wing'};
function Element({kind}) {
 if(kind==='wheel')return <group rotation={[.25,.4,.3]}><mesh><torusGeometry args={[1.4,.43,12,48]}/><meshStandardMaterial color="#111722" roughness={.75}/></mesh><mesh><torusGeometry args={[1.4,.45,8,48]}/><meshStandardMaterial color="#a92438" wireframe/></mesh></group>;
 if(kind==='wing')return <group>{[-.3,0,.3].map(y=><mesh key={y} position={[0,y,0]} rotation={[.12,0,.1]}><boxGeometry args={[3.6,.07,.7]}/><meshStandardMaterial color="#667b95" metalness={.65} roughness={.4}/></mesh>)}</group>;
 if(kind==='lights')return <group>{[-1.4,-.7,0,.7,1.4].map(x=><mesh key={x} position={[x,0,0]}><sphereGeometry args={[.23,12,12]}/><meshStandardMaterial color="#c22b40" emissive="#630c1f"/></mesh>)}</group>;
 if(kind==='trophy')return <group><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1,.16,8,40,Math.PI*1.7]}/><meshStandardMaterial color="#bda36d" metalness={.75} roughness={.4}/></mesh><mesh position={[0,-1.3,0]}><cylinderGeometry args={[.18,.45,1,16]}/><meshStandardMaterial color="#8c8064"/></mesh></group>;
 if(kind==='helmet')return <group><mesh><sphereGeometry args={[1.1,24,16,0,Math.PI*2,0,Math.PI*.72]}/><meshStandardMaterial color="#5c718c" metalness={.5} roughness={.45}/></mesh><mesh position={[0,0,.8]} scale={[1,.25,.3]}><sphereGeometry args={[1,16,8]}/><meshStandardMaterial color="#171d28"/></mesh></group>;
 return <group>{[0,1,2].map(i=><mesh key={i} rotation={[Math.PI/2+i*.13,0,i*.12]} scale={kind==='circuit'?[1.5,.8,1]:[1+i*.2,1,1]}><torusGeometry args={[1.15+i*.3,.025,5,64]}/><meshStandardMaterial color={i===1?'#b93049':'#4e708d'} /></mesh>)}</group>;
}
function Paddock({path,paused}) {
 const reveal=useRef(0);useEffect(()=>{reveal.current=0;},[path]);
 const group=useRef(null), pointer=useRef([0,0]);const {invalidate}=useThree();
 useEffect(()=>{const move=e=>{pointer.current=[e.clientX/innerWidth-.5,e.clientY/innerHeight-.5];};window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move);},[]);
 useEffect(()=>{if(paused)return;const timer=setInterval(()=>{if(!document.hidden)invalidate();},40);return()=>clearInterval(timer);},[invalidate,paused]);
 useFrame((_,delta)=>{if(!group.current||paused)return;const dt=Math.min(delta,.06);group.current.rotation.y=MathUtils.damp(group.current.rotation.y,pointer.current[0]*.55,3,dt);group.current.rotation.x=MathUtils.damp(group.current.rotation.x,pointer.current[1]*.3,3,dt);group.current.rotation.z+=dt*.025;reveal.current=MathUtils.damp(reveal.current,1,3,dt);group.current.scale.setScalar(reveal.current);});
 return <><ambientLight intensity={1.5}/><directionalLight position={[3,4,5]} intensity={3}/><group ref={group} position={[3.6,.5,-1]}><Element key={path} kind={modes[path]||'wheel'}/></group></>;
}
export default function AmbientPaddock({path,paused}) {return <Canvas frameloop="demand" camera={{position:[0,0,11],fov:36}} dpr={1} gl={{alpha:true,antialias:false,powerPreference:'low-power'}}><Paddock path={path} paused={paused}/></Canvas>;}
