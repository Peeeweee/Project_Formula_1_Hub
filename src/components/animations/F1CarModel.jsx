import React, { useRef, Suspense, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ── Model path ───────────────────────────────────────────────────────────────
const MODEL_URL = `${import.meta.env.BASE_URL}f1_mercedes_w13_concept.glb`;

// ── Empty Suspense fallback — no placeholder car ──────────────────────────────
function EmptyFallback() { return null; }

// ── Real GLB loader ──────────────────────────────────────────────────────────
function RealF1Car({ phase, onReady }) {
  const { scene } = useGLTF(MODEL_URL);
  const { gl } = useThree();
  const groupRef = useRef();

  // Persistent motion state — never reset between renders
  const motion = useRef({ launchSpeed: 0, zPos: 0 });

  // ── Renderer settings for clearcoat / transmission materials ─────────────
  useEffect(() => {
    gl.physicallyCorrectLights = true;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);

  // ── Clone & calibrate materials ───────────────────────────────────────────
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat) return;
        if (mat.metalness > 0.5) mat.metalness = 0.45;
        if (mat.roughness < 0.2) mat.roughness = 0.28;
        if (mat.transmission > 0) mat.transparent = true;
        mat.needsUpdate = true;
      });
    });
    return clone;
  }, [scene]);

  // ── Signal ready after first frame ───────────────────────────────────────
  useEffect(() => {
    if (!clonedScene || !onReady) return;
    const id = setTimeout(() => onReady(), 80);
    return () => clearTimeout(id);
  }, [clonedScene, onReady]);

  // ── Animation loop ────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const m = motion.current;
    const dt = Math.min(delta, 0.05); // cap delta to avoid physics spikes

    if (phase === 'launch' || phase === 'done') {
      // Keep accelerating — NEVER reset z, so car doesn't snap back during fade-out
      m.launchSpeed += dt * 22;
      m.zPos -= m.launchSpeed * dt;
      groupRef.current.position.z = m.zPos;
      // Subtle forward lean
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, -0.04, dt * 4
      );
    } else if (phase === 'revving') {
      // Smooth, subtle idle rumble — no jitter
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 28) * 0.003;
      groupRef.current.position.z = 0;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, 0, dt * 6
      );
      m.launchSpeed = 0;
      m.zPos = 0;
    } else {
      // 'reveal' — static idle
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y, 0, dt * 8
      );
      groupRef.current.position.z = 0;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, 0, dt * 6
      );
      m.launchSpeed = 0;
      m.zPos = 0;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={clonedScene} scale={0.0085} />
    </group>
  );
}

// ── Error boundary — renders nothing on failure; unblocks intro ───────────────
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) {
    console.error('[F1CarModel] GLB load error:', err);
    if (this.props.onReady) this.props.onReady();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// ── Public export ─────────────────────────────────────────────────────────────
export function F1CarModel({ phase, onReady }) {
  return (
    <>
      {/* Studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0d0e15" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* F1 grid overlay */}
      <gridHelper args={[30, 30, '#e10600', '#1c1f2e']} position={[0, 0.002, 0]} />

      <ModelErrorBoundary onReady={onReady}>
        <Suspense fallback={<EmptyFallback />}>
          <RealF1Car phase={phase} onReady={onReady} />
        </Suspense>
      </ModelErrorBoundary>
    </>
  );
}

useGLTF.preload(MODEL_URL);
