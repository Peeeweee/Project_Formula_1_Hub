import React, { Suspense, useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// ── Livery presets ─────────────────────────────────────────────────────────
const LIVERY_PRESETS = [
  { id: 'mercedes', label: 'Mercedes', color: '#00d2be', accent: '#00a19c' },
  { id: 'ferrari',  label: 'Ferrari',  color: '#e10600', accent: '#9b0000' },
  { id: 'redbull',  label: 'Red Bull', color: '#1e3a8a', accent: '#3b82f6' },
  { id: 'mclaren',  label: 'McLaren',  color: '#ff8700', accent: '#cc6b00' },
  { id: 'alpine',   label: 'Alpine',   color: '#ff87bc', accent: '#e05ca0' },
];

// ── Environment lighting presets ──────────────────────────────────────────
const ENV_PRESETS = {
  garage: {
    label: 'Garage',
    icon: '🔧',
    ambient: { color: '#ffffff', intensity: 0.9 },
    key:    { color: '#ffffff', intensity: 4.5 },
    fill:   { color: '#ffffff', intensity: 2.8 },
    rim:    { color: '#00e5c0', intensity: 3.0 },
    bounce: { color: '#e10600', intensity: 2.0 },
  },
  pitlane: {
    label: 'Pit Lane',
    icon: '🏎',
    ambient: { color: '#fffef5', intensity: 1.4 },
    key:    { color: '#fff8e8', intensity: 6.0 },
    fill:   { color: '#fffef5', intensity: 4.0 },
    rim:    { color: '#ffffff',  intensity: 1.5 },
    bounce: { color: '#ffd080', intensity: 1.0 },
  },
  night: {
    label: 'Night Race',
    icon: '🌙',
    ambient: { color: '#0a1a40', intensity: 0.4 },
    key:    { color: '#7090ff', intensity: 3.5 },
    fill:   { color: '#2040a0', intensity: 1.5 },
    rim:    { color: '#ff4400', intensity: 4.0 },
    bounce: { color: '#e10600', intensity: 3.5 },
  },
};

const MODEL_URL = `${import.meta.env.BASE_URL}f1_mercedes_w13_concept.glb`;

// ── Camera preset positions ────────────────────────────────────────────────
const PRESETS = [
  { id: 'hero',   label: 'Hero',   icon: '✦', pos: [-3.8, 1.8, -4.2],  target: [0, 0.5, 0] },
  { id: 'front',  label: 'Front',  icon: '⬆', pos: [0, 0.8, -5.5],     target: [0, 0.4, 0] },
  { id: 'side',   label: 'Side',   icon: '➡', pos: [6.5, 1.0, 0],      target: [0, 0.4, 0] },
  { id: 'rear',   label: 'Rear',   icon: '⬇', pos: [0, 0.8, 5.5],      target: [0, 0.4, 0] },
  { id: 'top',    label: 'Top',    icon: '🔭', pos: [0, 7.0, 0.1],      target: [0, 0, 0]   },
  { id: 'cockpit',label: 'Cockpit',icon: '🏎', pos: [-0.3, 1.5, -1.2],  target: [0, 0.8, 0] },
];

// ── Scene setup inside Canvas ──────────────────────────────────────────────
function GarageScene({ autoRotate, targetPreset, onPresetDone, env, brightness }) {
  const { gl } = useThree();
  const orbitRef = useRef();
  const transitioning = useRef(false);
  const targetPos = useRef(null);
  const targetLook = useRef(null);

  // Renderer config
  useEffect(() => {
    gl.physicallyCorrectLights = true;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);

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
      {/* Studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0b0c14" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Red F1 grid */}
      <gridHelper args={[40, 40, '#e10600', '#1a1d2e']} position={[0, 0.003, 0]} />

      {/* ── Dynamic Lighting ── */}
      <ambientLight intensity={env.ambient.intensity * b} color={env.ambient.color} />
      {/* Key light */}
      <directionalLight position={[-7, 12, -7]} intensity={env.key.intensity * b} color={env.key.color} castShadow shadow-mapSize={[2048, 2048]} />
      {/* Fill */}
      <directionalLight position={[7, 9, 7]} intensity={env.fill.intensity * b} color={env.fill.color} />
      {/* Overhead */}
      <directionalLight position={[0, 15, 0]} intensity={3.0 * b} color="#f0f4ff" />
      {/* Rim */}
      <pointLight position={[-4, 2, -3]} intensity={env.rim.intensity * b} color={env.rim.color} distance={12} />
      {/* Bounce */}
      <pointLight position={[4, 0.5, 3]} intensity={env.bounce.intensity * b} color={env.bounce.color} distance={10} />
      {/* Under-car glow */}
      <pointLight position={[0, -0.1, 0]} intensity={1.0 * b} color={env.rim.color} distance={5} />

      {/* The car */}
      <Suspense fallback={null}>
        <GarageCarModel liveryColor={env._liveryColor} />
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
function GarageCarModel({ liveryColor }) {
  const { scene } = useGLTF(MODEL_URL);
  const clonedRef = useRef(null);

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat) return;
        if (mat.metalness > 0.5) mat.metalness = 0.44;
        if (mat.roughness < 0.2) mat.roughness = 0.25;
        if (mat.transmission > 0) mat.transparent = true;
        mat.needsUpdate = true;
      });
    });
    clonedRef.current = clone;
    return clone;
  }, [scene]);

  // Apply livery color tint to opaque body panels
  useEffect(() => {
    if (!clonedRef.current || !liveryColor) return;
    const tint = new THREE.Color(liveryColor);
    clonedRef.current.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat || mat.transparent || mat.transmission > 0) return;
        // Only tint large body panels (skip tiny mechanical parts)
        if (mat.roughness <= 0.45 && mat.metalness <= 0.5) {
          mat.color.lerp(tint, 0.55);
          mat.needsUpdate = true;
        }
      });
    });
  }, [liveryColor, cloned]);

  return <primitive object={cloned} scale={0.0085} position={[0, 0, 0]} />;
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

// ── Car spec panel ────────────────────────────────────────────────────────
const CAR_SPECS = [
  { label: 'Chassis',    value: 'Mercedes W13' },
  { label: 'Season',     value: '2022 F1 World Championship' },
  { label: 'Engine',     value: 'Mercedes-AMG F1 M13 E Performance' },
  { label: 'Power Unit', value: '~1,000 bhp (hybrid)' },
  { label: 'Weight',     value: '798 kg (min)' },
  { label: 'Drivers',    value: 'Hamilton #44 · Russell #63' },
  { label: 'Team',       value: 'Mercedes-AMG Petronas F1' },
];

// ── Main Page ─────────────────────────────────────────────────────
const Garage3D = () => {
  const [autoRotate, setAutoRotate] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [showSpecs, setShowSpecs] = useState(true);
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
    setActivePreset(preset);
  }, []);

  // Detect when GLB is cached/ready
  const { progress, active } = useProgress();
  useEffect(() => {
    if (!active && progress >= 100) setModelLoaded(true);
    // If already cached, progress won't fire — treat 0,false as cached
    if (!active && progress === 0) setModelLoaded(true);
  }, [active, progress]);

  return (
    <div className="absolute inset-0 w-full flex flex-col overflow-hidden" style={{ background: '#07070b' }}>

      {/* ── Header strip ── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase tracking-[3px] font-rajdhani">
              3D Garage — Interactive Viewer
            </span>
            <span className="text-sm font-bold text-white tracking-widest font-rajdhani leading-tight">
              MERCEDES-AMG W13 · 2022
            </span>
          </div>
          {/* Live badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#e10600]/10 border border-[#e10600]/30 px-2.5 py-1 rounded text-[10px] text-[#e10600] font-rajdhani tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
            GLB Model
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Specs toggle */}
          <button
            onClick={() => setShowSpecs(s => !s)}
            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border transition-all font-rajdhani ${
              showSpecs
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-transparent border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            Specs
          </button>
          {/* Turntable */}
          <button
            onClick={() => setAutoRotate(r => !r)}
            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border transition-all font-rajdhani ${
              autoRotate
                ? 'bg-[#e10600] border-[#e10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.5)]'
                : 'bg-transparent border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            ↻ Turntable
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="relative flex-1 flex overflow-hidden">

        {/* ── 3D Canvas ── */}
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [-3.8, 1.8, -4.2], fov: 42 }}
            gl={{
              antialias: true,
              toneMapping: 4,
              toneMappingExposure: 1.1,
              physicallyCorrectLights: true,
            }}
            shadows={{ type: 'PCFShadowMap' }}
            onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; }}
          >
            <GarageScene
              autoRotate={autoRotate}
              targetPreset={activePreset}
              onPresetDone={() => setActivePreset(null)}
              env={activeEnv}
              brightness={brightness}
            />
          </Canvas>
        </div>

        {/* Loading overlay */}
        {!modelLoaded && <LoadingOverlay />}

        {/* ── Camera presets ── */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePreset(p)}
              title={p.label}
              className={`w-10 h-10 rounded-lg border text-sm transition-all duration-200 font-rajdhani flex items-center justify-center ${
                activePreset?.id === p.id
                  ? 'bg-[#e10600] border-[#e10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.6)]'
                  : 'bg-black/60 border-white/10 text-white/50 hover:text-white hover:border-white/30 backdrop-blur-sm'
              }`}
            >
              <span className="text-base leading-none">{p.icon}</span>
            </button>
          ))}
          <div className="mt-1 text-[9px] text-white/20 text-center tracking-widest font-rajdhani uppercase">View</div>
        </div>

        {/* ── Livery + Lighting Controls panel ── */}
        <div
          className="absolute bottom-16 left-4 z-10 w-56 rounded-xl border border-white/8 overflow-hidden"
          style={{ background: 'rgba(7,7,11,0.88)', backdropFilter: 'blur(16px)' }}
        >
          {/* Livery */}
          <div className="px-3 pt-3 pb-2">
            <div className="text-[9px] text-white/30 uppercase tracking-[2px] font-rajdhani mb-2">Livery Color</div>
            <div className="flex gap-1.5 flex-wrap">
              {LIVERY_PRESETS.map((lp, i) => (
                <button
                  key={lp.id}
                  title={lp.label}
                  onClick={() => setLiveryIdx(i)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    liveryIdx === i ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:border-white/40'
                  }`}
                  style={{ background: lp.color, boxShadow: liveryIdx === i ? `0 0 10px ${lp.color}88` : undefined }}
                />
              ))}
            </div>
            <div className="text-[9px] text-white/40 font-rajdhani mt-1">{LIVERY_PRESETS[liveryIdx].label}</div>
          </div>

          <div className="border-t border-white/6" />

          {/* Brightness */}
          <div className="px-3 py-2">
            <div className="text-[9px] text-white/30 uppercase tracking-[2px] font-rajdhani mb-2">Brightness</div>
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.05"
              value={brightness}
              onChange={e => setBrightness(parseFloat(e.target.value))}
              className="w-full h-1 accent-[#e10600] cursor-pointer"
            />
            <div className="text-[9px] text-white/30 font-rajdhani mt-1">{Math.round(brightness * 100)}%</div>
          </div>

          <div className="border-t border-white/6" />

          {/* Environment */}
          <div className="px-3 py-2">
            <div className="text-[9px] text-white/30 uppercase tracking-[2px] font-rajdhani mb-2">Environment</div>
            <div className="flex flex-col gap-1">
              {Object.entries(ENV_PRESETS).map(([key, ep]) => (
                <button
                  key={key}
                  onClick={() => setEnvKey(key)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all text-[11px] font-rajdhani ${
                    envKey === key
                      ? 'bg-f1-red/20 text-white border border-f1-red/40'
                      : 'text-white/40 hover:text-white/70 border border-transparent hover:bg-white/5'
                  }`}
                >
                  <span>{ep.icon}</span>
                  <span>{ep.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Controls hint ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6 bg-black/50 backdrop-blur-sm border border-white/8 px-5 py-2 rounded-full pointer-events-none">
          {[
            { icon: '🖱', label: 'Drag to Rotate' },
            { icon: '⚙', label: 'Scroll to Zoom' },
            { icon: '⇧', label: 'Right-drag to Pan' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-xs opacity-60">{icon}</span>
              <span className="text-[9px] text-white/30 tracking-widest uppercase font-rajdhani">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Specs panel ── */}
        {showSpecs && (
          <div
            className="absolute top-4 right-4 z-10 w-64 rounded-xl border border-white/8 overflow-hidden"
            style={{ background: 'rgba(7,7,11,0.82)', backdropFilter: 'blur(16px)' }}
          >
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-sm bg-[#e10600]" />
              <span className="text-xs font-bold text-white tracking-widest uppercase font-rajdhani">
                Car Specifications
              </span>
            </div>

            {/* Petronas stripe accent */}
            <div className="h-[2px] bg-gradient-to-r from-[#00d2be] via-[#00d2be] to-transparent" />

            {/* Spec rows */}
            <div className="px-4 py-3 flex flex-col gap-2.5">
              {CAR_SPECS.map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[9px] text-white/30 uppercase tracking-[2px] font-rajdhani mb-0.5">
                    {label}
                  </div>
                  <div className="text-xs text-white/85 font-rajdhani font-semibold leading-snug">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom badge */}
            <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#00d2be]/20 border border-[#00d2be]/30 flex items-center justify-center text-[8px] text-[#00d2be] font-bold">
                  AMG
                </div>
                <span className="text-[9px] text-white/25 font-rajdhani tracking-widest">
                  PETRONAS F1 TEAM
                </span>
              </div>
              <span className="text-[9px] text-white/20 font-rajdhani">2022</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Preload for instant load when navigating to this page
useGLTF.preload(MODEL_URL);

export default Garage3D;
