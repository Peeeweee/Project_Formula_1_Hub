import { Component, Fragment, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ACESFilmicToneMapping, Vector3 } from 'three';
import { dictionaryFrame } from '../../utils/dictionaryTimeline';
import { CAR_URL, FormulaCar, SafetyCoupe, Lighting, Ground, Label } from './DictionaryAssets';
import { TrackWorld } from './DictionaryWorld';
import { EngineeringScene, WingStudy } from './DictionaryMechanisms';
import TireScene from './DictionaryTires';
import DictionaryEvidence from './DictionaryEvidence';
const DEFAULT_CAMERA={position:[11,8,-15],fov:40,near:.1,far:180};
class SceneBoundary extends Component {
 state={failed:false,reason:'',attempt:0};
 static getDerivedStateFromError(error){return {failed:true,reason:error?.message||'The graphics renderer could not start.'};}
 componentDidCatch(error){console.error('Dictionary film failed:',error);}
 retry=()=>{useLoader.clear(GLTFLoader,CAR_URL);this.setState(state=>({failed:false,reason:'',attempt:state.attempt+1}));};
 render(){return this.state.failed?<div className="glossary-scene-fallback" role="alert"><p>The scene could not start.</p><button onClick={this.retry}>Retry animation</button><p>Startup error: {this.state.reason}</p></div>:<Fragment key={this.state.attempt}>{this.props.children}</Fragment>;}
}
function CameraDirector({frame}){
 const {camera,gl,invalidate}=useThree(),latest=useRef(frame),controls=useRef(null),stage=frame.stage,kind=frame.kind,shot=frame.shot||stage;
 useLayoutEffect(()=>{latest.current=frame;},[frame]);
 useEffect(()=>{const f=latest.current,orbit=new OrbitControls(camera,gl.domElement);camera.position.set(...f.camera);orbit.target.set(...f.focus);orbit.enablePan=false;orbit.enableDamping=true;orbit.minDistance=3;orbit.maxDistance=65;orbit.minPolarAngle=.25;orbit.maxPolarAngle=Math.PI*.47;orbit.addEventListener('change',invalidate);orbit.update();controls.current=orbit;invalidate();return()=>{controls.current=null;orbit.removeEventListener('change',invalidate);orbit.dispose();};},[camera,gl,invalidate,stage,kind,shot]);
 useFrame(()=>{const orbit=controls.current;if(!orbit)return;const target=new Vector3(...latest.current.focus),delta=target.clone().sub(orbit.target);camera.position.add(delta);orbit.target.copy(target);orbit.update();});
 return null;
}
function Ready({onReady}){useEffect(()=>{onReady();},[onReady]);return null;}
function FilmStage({frame,onReady}){
 const road=frame.stage==='straight'||frame.stage==='circuit';
 return <><color attach="background" args={['#1b2635']}/><fog attach="fog" args={['#1b2635',45,100]}/><Lighting/><Ground/>
 {road?<><TrackWorld frame={frame}/>{frame.actors.map(actor=>actor.road?<SafetyCoupe key={actor.id} actor={actor} time={frame.time}/>:<FormulaCar key={actor.id} actor={{...actor,y:actor.service?Math.sin(actor.service*Math.PI)*.13:0}}/>)}</>:frame.stage==='tire'?<TireScene frame={frame}/>:frame.kind==='drs'?<WingStudy frame={frame} drs/>:<EngineeringScene frame={frame}/>}
 {road&&frame.kind==='drs'&&<Label text="DRS ZONE / HISTORICAL" position={[4.9,1.8,frame.focus[2]-2]} scale={1.8}/>}
 <CameraDirector frame={frame}/><Ready onReady={onReady}/></>;
}
export default function GlossaryScene({term,time,onReady}){
 const frame=dictionaryFrame(term,time);
 return <div className="dictionary-stage"><div className="dictionary-renderer"><span className="film-scene-label">{frame.kind.toUpperCase()} / {frame.stage==='circuit'?'MULTI-LAP VIEW':frame.stage==='engineering'?'SCHEMATIC CUTAWAY':'ILLUSTRATIVE RECONSTRUCTION'}</span><SceneBoundary><Suspense fallback={<div className="glossary-scene-fallback" role="status">Loading the scene assets...</div>}><Canvas shadows frameloop="demand" camera={DEFAULT_CAMERA} dpr={[1,1.25]} gl={{antialias:true,alpha:false,toneMapping:ACESFilmicToneMapping}}><FilmStage frame={frame} onReady={onReady}/></Canvas></Suspense></SceneBoundary><span className="film-inspect-label">DRAG TO INSPECT / SCRUB TO REPLAY</span></div><DictionaryEvidence frame={frame}/></div>;
}
