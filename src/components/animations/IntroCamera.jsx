import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function IntroCamera({ phase }) {
  const { camera } = useThree();

  const targetPos  = useRef(new THREE.Vector3(-3.4, 1.8, -3.8));
  const targetLook = useRef(new THREE.Vector3(0, 0.45, -0.2));
  const currentLook = useRef(new THREE.Vector3(0, 0.45, -0.2));

  // ── Initial placement ─────────────────────────────────────────────────────
  useEffect(() => {
    camera.position.set(-4.2, 2.2, -4.6);
    camera.lookAt(0, 0.45, -0.2);
    currentLook.current.set(0, 0.45, -0.2);
  }, [camera]);

  // ── Target per phase ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'reveal') {
      targetPos.current.set(-3.4, 1.8, -3.8);
      targetLook.current.set(0, 0.45, -0.2);
    } else if (phase === 'revving') {
      targetPos.current.set(-2.6, 1.05, -2.9);
      targetLook.current.set(-0.1, 0.4, -0.5);
    } else if (phase === 'launch' || phase === 'done') {
      // Pull back to watch the car blast away
      targetPos.current.set(-3.8, 1.6, -5.5);
      targetLook.current.set(0, 0.4, -2.5);
    }
  }, [phase]);

  // ── Smooth camera movement ────────────────────────────────────────────────
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Translate toward target
    camera.position.lerp(targetPos.current, dt * 1.8);

    // Smooth look-at
    currentLook.current.lerp(targetLook.current, dt * 2.8);
    camera.lookAt(currentLook.current);

    // Very subtle engine-shake during revving — reduced from previous 60Hz
    if (phase === 'revving') {
      const t = state.clock.elapsedTime;
      camera.position.y += Math.sin(t * 30) * 0.0015;
      camera.position.x += Math.cos(t * 22) * 0.001;
    }
  });

  return null;
}
