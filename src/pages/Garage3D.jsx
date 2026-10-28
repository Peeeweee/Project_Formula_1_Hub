import { Suspense, useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, useProgress } from '@react-three/drei';
import F1CarSVG from '../components/F1CarSVG';
import ErrorBoundary from '../components/ErrorBoundary';
import { PARTS } from '../data/garageParts';
import * as THREE from 'three';

// ── Livery presets ─────────────────────────────────────────────────────────
const LIVERY_PRESETS = [
  { id: 'original', label: 'Original', color: 'linear-gradient(135deg, #777 50%, #444 50%)', isOriginal: true },
  { id: 'white', label: 'White', color: '#ffffff', accent: '#aaaaaa' },
  { id: 'ferrari',  label: 'Ferrari',  color: '#e10600', accent: '#9b0000' },
  { id: 'black', label: 'Black', color: '#181818', accent: '#444444' },
];

// ── Environment lighting presets ──────────────────────────────────────────
const ENV_PRESETS = {
  garage: {
    label: 'Garage',
    icon: '🔧',
    ambient: { color: '#ffffff', intensity: 0.9 },
    key:    { color: '#ffffff', intensity: 4.5 },
    fill:   { color: '#ffffff', intensity: 2.8 },
    rim:    { color: '#ffffff', intensity: 3.0 },
    bounce: { color: '#e10600', intensity: 2.0 },
  },
  pitlane: {
    label: 'Pit Lane',
    icon: '🏎',
    ambient: { color: '#ffffff', intensity: 1.4 },
    key:    { color: '#ffffff', intensity: 6.0 },
    fill:   { color: '#ffffff', intensity: 4.0 },
    rim:    { color: '#ffffff',  intensity: 1.5 },
    bounce: { color: '#e10600', intensity: 1.0 },
  },
  night: {
    label: 'Night Race',
    icon: '🌙',
    ambient: { color: '#111111', intensity: 0.4 },
    key:    { color: '#ffffff', intensity: 3.5 },
    fill:   { color: '#777777', intensity: 1.5 },
    rim:    { color: '#e10600', intensity: 4.0 },
    bounce: { color: '#e10600', intensity: 3.5 },
  },
};

import { carModels } from '../data/carModels';

// Models load on selection to avoid downloading the whole garage.

// ── Camera preset positions ────────────────────────────────────────────────
const PRESETS = [
  { id: 'hero',   label: 'Hero',   icon: '✦', pos: [-4.6, 2.2, -5.2],  target: [0, 0.5, 0] },
  { id: 'front',  label: 'Front',  icon: '⬆', pos: [0, 0.8, -5.5],     target: [0, 0.4, 0] },
  { id: 'side',   label: 'Side',   icon: '➡', pos: [6.5, 1.0, 0],      target: [0, 0.4, 0] },
  { id: 'rear',   label: 'Rear',   icon: '⬇', pos: [0, 0.8, 5.5],      target: [0, 0.4, 0] },
  { id: 'top',    label: 'Top',    icon: '🔭', pos: [0, 7.0, 0.1],      target: [0, 0, 0]   },
  { id: 'cockpit',label: 'Cockpit',icon: '🏎', pos: [-0.3, 1.5, -1.2],  target: [0, 0.8, 0] },
];

// ── Scene setup inside Canvas ──────────────────────────────────────────────
function GarageScene({ autoRotate, targetPreset, onPresetDone, env, brightness, activeCar, onModelReady }) {
  const { size } = useThree();
  const orbitRef = useRef();
  const transitioning = useRef(false);
  const targetPos = useRef(null);
  const targetLook = useRef(null);

  // Renderer config


  // Animate to preset
  useEffect(() => {
    if (!targetPreset) return;
    targetPos.current = new THREE.Vector3(...targetPreset.pos);
    targetLook.current = new THREE.Vector3(...targetPreset.target);
    transitioning.current = true;
  }, [targetPreset]);

  useFrame((state, delta) => {
    if (!orbitRef.current || !transitioning.current) return;
    const dt = Math.min(delta, 0.05);
    const cam = state.camera;
    const ctrl = orbitRef.current;

    cam.position.lerp(targetPos.current, dt * 3.5);
    ctrl.target.lerp(targetLook.current, dt * 3.5);
    ctrl.update();

    if (cam.position.distanceTo(targetPos.current) < 0.05) {
      cam.position.copy(targetPos.current);
      ctrl.target.copy(targetLook.current);
      ctrl.update();
      transitioning.current = false;
      onPresetDone?.();
    }
  });

  const b = brightness ?? 1;

  return (
    <>
      <PerspectiveCamera makeDefault fov={size.width < 600 ? 60 : 42} position={[-4.6, 2.2, -5.2]} />
      {/* Studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Red F1 grid */}
      <gridHelper args={[40, 40, '#e10600', '#292929']} position={[0, 0.003, 0]} />

      {/* ── Dynamic Lighting ── */}
      <ambientLight intensity={env.ambient.intensity * b} color={env.ambient.color} />
      {/* Key light */}
      <directionalLight position={[-7, 12, -7]} intensity={env.key.intensity * b} color={env.key.color} castShadow shadow-mapSize={[2048, 2048]} />
      {/* Fill */}
      <directionalLight position={[7, 9, 7]} intensity={env.fill.intensity * b} color={env.fill.color} />
      {/* Overhead */}
      <directionalLight position={[0, 15, 0]} intensity={3.0 * b} color="#ffffff" />
      {/* Rim */}
      <pointLight position={[-4, 2, -3]} intensity={env.rim.intensity * b} color={env.rim.color} distance={12} />
      {/* Bounce */}
      <pointLight position={[4, 0.5, 3]} intensity={env.bounce.intensity * b} color={env.bounce.color} distance={10} />
      {/* Under-car glow */}
      <pointLight position={[0, -0.1, 0]} intensity={1.0 * b} color={env.rim.color} distance={5} />

      {/* The car */}
      <Suspense fallback={null}>
        <GarageCarModel onReady={onModelReady} liveryColor={env._liveryColor} modelUrl={activeCar.modelUrl} />
      </Suspense>

      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={1.2}
        maxDistance={14}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
        target={[0, 0.4, 0]}
      />
    </>
  );
}

// ── The car mesh ──────────────────────────────────────────────────────────
function GarageCarModel({ liveryColor, modelUrl, onReady }) {
  const { scene } = useGLTF(modelUrl);

  const { cloned, scale, position } = useMemo(() => {
    const clone = scene.clone(true);

    // Auto-scale and auto-center to handle different model sizes
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // F1 cars are ~5.5 meters long. Scale the longest dimension to 5.5.
    const maxDim = Math.max(size.x, size.y, size.z);
    const computedScale = 5.5 / maxDim;

    // Center on X and Z, place bottom at Y=0
    const computedPosition = [
      -center.x * computedScale,
      -box.min.y * computedScale,
      -center.z * computedScale
    ];

    clone.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      child.material = Array.isArray(child.material) ? child.material.map(mat => mat.clone()) : child.material.clone();
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat) return;

        // Save original color for resetting later
        if (!mat.userData.originalColor) {
          mat.userData.originalColor = mat.color.clone();
        }

        if (mat.metalness > 0.5) mat.metalness = 0.44;
        if (mat.roughness < 0.2) mat.roughness = 0.25;
        if (mat.transmission > 0) mat.transparent = true;
        mat.needsUpdate = true;
      });
    });
    return { cloned: clone, scale: computedScale, position: computedPosition };
  }, [scene]);

  useEffect(() => { onReady(); }, [onReady, cloned]);

  // Apply livery color tint to opaque body panels
  useEffect(() => {
    if (!cloned) return;

    // Find the livery preset based on color to check if it's the original
    const preset = LIVERY_PRESETS.find(p => p.color === liveryColor);
    const isOriginal = !preset || preset.isOriginal;
    const tint = isOriginal ? null : new THREE.Color(liveryColor);

    cloned.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat || mat.transparent || mat.transmission > 0) return;
        // Only tint large body panels (skip tiny mechanical parts)
        if (mat.roughness <= 0.45 && mat.metalness <= 0.5) {
          if (mat.userData.originalColor) {
            mat.color.copy(mat.userData.originalColor);
          }
          if (tint) {
            mat.color.lerp(tint, 0.55);
          }
          mat.needsUpdate = true;
        }
      });
    });
  }, [liveryColor, cloned]);

  return <primitive object={cloned} scale={scale} position={position} />;
}

// ── Loading screen ────────────────────────────────────────────────────────
function LoadingOverlay() {
  const { progress } = useProgress();
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#07070b] pointer-events-none">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-f1-red animate-ping" />
        <span className="text-white/50 text-xs tracking-[4px] uppercase font-rajdhani">
          Loading Model
        </span>
      </div>
      <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#e10600] to-[#ff5500] rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(225,6,0,0.8)' }}
        />
      </div>
      <div className="mt-3 text-white/30 text-[10px] tracking-widest font-rajdhani">
        {Math.round(progress)}%
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
const Garage3D = () => {
  const [graphicsError, setGraphicsError] = useState(false);
  const [activeCarIdx, setActiveCarIdx] = useState(0);
  const activeCar = carModels[activeCarIdx];
  const [autoRotate, setAutoRotate] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [showSpecs, setShowSpecs] = useState(false);
  const [cameraId, setCameraId] = useState('hero');
  const [selectedPart, setSelectedPart] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [liveryIdx, setLiveryIdx] = useState(0);
  const [brightness, setBrightness] = useState(1);
  const [envKey, setEnvKey] = useState('garage');

  // Build the active environment config (inject livery color for car tinting)
  const activeEnv = useMemo(() => ({
    ...ENV_PRESETS[envKey],
    _liveryColor: LIVERY_PRESETS[liveryIdx].color,
  }), [envKey, liveryIdx]);

  const handlePreset = useCallback((preset) => {
    setAutoRotate(false);
    setCameraId(preset.id);
    setActivePreset(preset);
  }, []);

  const handleModelReady = useCallback(() => setModelLoaded(true), []);

  return <div className="garage-workspace">
    <header className="garage-heading"><div><p className="experience-kicker">THE PADDOCK / DESIGN LAB</p><h1>Your own pit garage.</h1></div><p>Choose a car. Find your angle. Explore the engineering up close with six guided views and a hands-on component tour.</p></header>
    <div className="garage-shell"><section className="garage-stage" aria-label="Interactive 3D car viewer">
      <div className="garage-model-tag"><p>{activeCar.year} / MODEL COLLECTION</p><h2>{activeCar.name}</h2></div>
      {graphicsError ? <div className="absolute inset-0 grid place-items-center p-12 text-center"><div><F1CarSVG color="#e10600" scale={0.8}/><h2>3D is unavailable on this device</h2><p>Explore the specifications and component guide alongside.</p><button className="garage-action" onClick={()=>setGraphicsError(false)}>Retry 3D</button></div></div> : <ErrorBoundary key={activeCar.id}><Canvas dpr={[1,1.5]} fallback={<p>3D is unavailable. The component guide and specifications remain available.</p>} camera={{position:[-4.6,2.2,-5.2],fov:42}} gl={{antialias:true,toneMapping:4,toneMappingExposure:1.1}} shadows onCreated={({gl})=>{gl.outputColorSpace=THREE.SRGBColorSpace;gl.debug.onShaderError=()=>queueMicrotask(()=>setGraphicsError(true));}}><GarageScene autoRotate={autoRotate} targetPreset={activePreset} onPresetDone={()=>setActivePreset(null)} env={activeEnv} brightness={brightness} activeCar={activeCar} onModelReady={handleModelReady}/></Canvas></ErrorBoundary>}
      {!graphicsError&&!modelLoaded&&<LoadingOverlay/>}
      {selectedPart!==null&&<div className="garage-part-panel" aria-live="polite"><button aria-label="Close component explanation" onClick={()=>setSelectedPart(null)}>×</button><p className="experience-kicker">COMPONENT TOUR / {selectedPart+1} OF {PARTS.length}</p><h3>{PARTS[selectedPart].name}</h3><p>{PARTS[selectedPart].text}</p><p><strong>Watch for: </strong>{PARTS[selectedPart].watch}</p></div>}
      <p className="garage-interaction-hint">Drag to orbit · Scroll or pinch to zoom · Right-drag to pan</p>
    </section><aside className="garage-sidebar" aria-label="Garage controls">
      <section><h3><label htmlFor="garage-car">01 / CHOOSE YOUR CAR</label></h3><select id="garage-car" value={activeCarIdx} onChange={event=>{setModelLoaded(false);setSelectedPart(null);setActiveCarIdx(Number(event.target.value));handlePreset(PRESETS[0]);}}>{carModels.map((car,index)=><option key={car.id} value={index}>{car.year} · {car.name}</option>)}</select><button className="garage-action" aria-expanded={showSpecs} onClick={()=>setShowSpecs(value=>!value)}>{showSpecs?'Hide':'View'} specifications</button></section>
      <section><h3>02 / FIND YOUR ANGLE</h3><div className="garage-button-grid">{PRESETS.map(preset=><button key={preset.id} aria-pressed={cameraId===preset.id} onClick={()=>handlePreset(preset)}>{preset.label}</button>)}</div><button className="garage-action" aria-pressed={autoRotate} onClick={()=>setAutoRotate(value=>!value)}>{autoRotate?'Ⅱ Pause rotation':'↻ Rotate car'}</button><button className="garage-action" onClick={()=>{setBrightness(1);setLiveryIdx(0);setEnvKey('garage');setSelectedPart(null);handlePreset(PRESETS[0]);}}>Reset view & lighting</button></section>
      <section><h3>03 / EXPLORE THE PARTS</h3><div className="garage-button-grid">{PARTS.map((part,index)=><button key={part.name} aria-pressed={selectedPart===index} onClick={()=>{setSelectedPart(index);handlePreset(PRESETS.find(preset=>preset.id===part.camera));}}>{part.name}</button>)}</div>{selectedPart!==null&&<div className="garage-part-details-mobile" aria-live="polite"><h4>{PARTS[selectedPart].name}</h4><p>{PARTS[selectedPart].text}</p><p>{PARTS[selectedPart].watch}</p></div>}</section>
      <section><h3>04 / SET THE SCENE</h3><div className="garage-button-grid">{Object.entries(ENV_PRESETS).map(([key,preset])=><button key={key} aria-pressed={envKey===key} onClick={()=>setEnvKey(key)}>{preset.label}</button>)}</div><label className="block text-xs text-f1-muted mt-4" htmlFor="garage-brightness">Brightness · {Math.round(brightness*100)}%</label><input id="garage-brightness" type="range" min="0.3" max="2" step="0.05" value={brightness} onChange={event=>setBrightness(Number(event.target.value))}/><label className="block text-xs text-f1-muted mt-3 mb-2" htmlFor="garage-livery">Body finish</label><select id="garage-livery" value={liveryIdx} onChange={event=>setLiveryIdx(Number(event.target.value))}>{LIVERY_PRESETS.map((livery,index)=><option key={livery.id} value={index}>{livery.label}</option>)}</select></section>
      {showSpecs&&<section className="garage-specs"><h3>REFERENCE SPECIFICATIONS</h3><dl>{activeCar.specs.map(spec=><div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl></section>}
    </aside></div><div className="garage-tutorial"><p><strong>Start exploring</strong>Use a camera button or select a component to move closer.</p><p><strong>About the models</strong>Illustrative historical references. Internal parts and airflow are not simulated. Downloads begin when you select a car.</p></div>
  </div>;
};
export default Garage3D;
