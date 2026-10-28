import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ExtrudeGeometry, MathUtils } from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { motion } from 'framer-motion';
import logoSvg from '../../assets/f1_logo.svg?raw';
import logo from '../../assets/f1_logo.svg';

// Extrude the existing vector mark: no extra model or texture downloads.
function Emblem({ started, reducedMotion, onReady }) {
  const frames = useRef(0);
  const group = useRef(null);
  const light = useRef(null);
  const geometries = useMemo(() => {
    const paths = new SVGLoader().parse(logoSvg).paths;
    return paths.flatMap(path => SVGLoader.createShapes(path).map(shape => {
      const geometry = new ExtrudeGeometry(shape, { depth: 3, bevelEnabled: true, bevelThickness: .55, bevelSize: .38, bevelSegments: 3, steps: 1, curveSegments: 12 });
      geometry.translate(-60, -15, -1.5);
      geometry.scale(.047, .047, .047);
      geometry.rotateX(Math.PI);
      geometry.computeVertexNormals();
      return geometry;
    }));
  }, []);
  useEffect(() => () => geometries.forEach(geometry => geometry.dispose()), [geometries]);
  useFrame(() => {
    if (!group.current) return;
    // Signal after a painted frame, before exposing the finale.
    if (frames.current < 2 && ++frames.current === 2) onReady();
    const elapsed = Math.max(0, performance.now() - started) / 1000;
    const t = Math.min(1, elapsed / 1.85);
    const ease = 1 - Math.pow(1 - t, 3);
    group.current.rotation.set(reducedMotion ? 0 : MathUtils.lerp(.24, 0, ease), reducedMotion ? 0 : MathUtils.lerp(-.65, .04, ease), reducedMotion ? 0 : MathUtils.lerp(-.07, 0, ease));
    group.current.position.y = reducedMotion ? 0 : MathUtils.lerp(-.3, 0, ease);
    group.current.scale.setScalar(reducedMotion ? 1 : MathUtils.lerp(.8, 1, ease));
    if (light.current) light.current.position.x = -5 + Math.min(1, elapsed / 2.4) * 11;
  });
  return <>
    <ambientLight intensity={.7} />
    <directionalLight position={[0, 3, 5]} intensity={2.2} color="#ffffff" />
    <pointLight ref={light} position={[-5, 1, 3]} intensity={12} distance={14} color="#ffffff" />
    <pointLight position={[3, -2, 1]} intensity={3} color="#ffffff" />
    <group ref={group}>{geometries.map((geometry, index) => <mesh key={index} geometry={geometry}>
      <meshStandardMaterial color="#eeeeee" metalness={.35} roughness={.33} />
    </mesh>)}</group>
  </>;
}

export default function IntroLogoReveal({ active, started, reducedMotion }) {
  const [prepared, setPrepared] = useState(false);
  const ready = useCallback(() => setPrepared(true), []);
  const visible = active && prepared;
  return <motion.div className="intro-logo-reveal" initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} aria-hidden={!visible} transition={{ duration: reducedMotion ? .1 : .65, ease: [.22, 1, .36, 1] }}>
    <div className="intro-logo-aura" aria-hidden="true" />
    <motion.div className="intro-logo-lockup" initial={{ opacity: 0, scale: reducedMotion ? 1 : .94 }} animate={{ opacity: visible ? 1 : 0, scale: visible || reducedMotion ? 1 : .94 }} transition={{ duration: reducedMotion ? .1 : 1.2, delay: reducedMotion ? 0 : .2, ease: [.16, 1, .3, 1] }}>
      <div className="intro-logo-stage" aria-hidden="true">
        <Canvas frameloop={active || !prepared ? 'always' : 'demand'} camera={{ position: [0, 0, 9], fov: 30 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} fallback={<img src={logo} alt="" />}>
          <Emblem started={started} reducedMotion={reducedMotion} onReady={ready} />
        </Canvas>
      </div>
      <div className="intro-logo-wordmark">
        <span>FORMULA <strong>DC-1</strong></span>
        <i aria-hidden="true" />
        <p>The racing. The strategy. The engineering.</p>
      </div>
      <span className="intro-logo-welcome">WELCOME TO FORMULA DC-1</span>
    </motion.div>
    <div className="intro-logo-corner" aria-hidden="true"><span>FORMULA DC-1</span><span>THE WORLD OF FORMULA 1</span></div>
  </motion.div>;
}
