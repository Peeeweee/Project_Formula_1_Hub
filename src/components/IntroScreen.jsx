import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { createTimeline } from 'animejs';
import { F1CarModel } from './animations/F1CarModel';
import { IntroCamera } from './animations/IntroCamera';
import f1LogoSrc from '../assets/f1_logo.svg';

// ── Thin red loading bar shown while GLB downloads ───────────────────────────
function LoadingBar({ progress }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '72px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '220px',
        textAlign: 'center',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '9px',
          letterSpacing: '3px',
          fontFamily: 'Rajdhani, sans-serif',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        Loading model… {Math.round(progress)}%
      </div>
      <div
        style={{
          height: '2px',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg,#e10600,#ff5500)',
            borderRadius: '2px',
            transition: 'width 0.25s ease',
            boxShadow: '0 0 8px rgba(225,6,0,0.7)',
          }}
        />
      </div>
    </div>
  );
}

// ── useProgress must be inside React tree; this reads drei's global store ─────
function ProgressHUD() {
  const { progress, active } = useProgress();
  if (!active && progress === 0) return null;
  if (progress >= 100) return null;
  return <LoadingBar progress={progress} />;
}

// ── Main intro component ─────────────────────────────────────────────────────
const IntroScreen = ({ onComplete }) => {
  const containerRef = useRef(null);
  const [phase, setPhase] = useState('reveal');
  // modelReady = true once the GLB is parsed and onReady fires
  const [modelReady, setModelReady] = useState(false);
  const timersRef = useRef([]);

  // ── Finish: mark session done and hand off to main app ─────────────────────
  const handleFinish = useCallback(() => {
    sessionStorage.setItem('fdc1_intro_seen', 'true');
    onComplete();
  }, [onComplete]);

  // ── Skip button / ESC ───────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    setPhase('done');
    // Instant fade to black then redirect
    if (containerRef.current) {
      createTimeline({ onComplete: handleFinish }).add(containerRef.current, {
        opacity: [1, 0],
        duration: 250,
        ease: 'inQuad',
      });
    } else {
      handleFinish();
    }
  }, [handleFinish]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleSkip(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSkip]);

  // ── Sequence — starts only once the real GLB is ready ──────────────────────
  useEffect(() => {
    if (!modelReady) return;
    timersRef.current.forEach(clearTimeout);

    // Phase 1 → revving (1.4s): fade in logo + sequential start lights
    const t1 = setTimeout(() => {
      setPhase('revving');

      const logoEl = containerRef.current?.querySelector('#intro-logo');
      const taglineEl = containerRef.current?.querySelector('#intro-tagline');
      if (logoEl) {
        createTimeline()
          .add(logoEl, { opacity: [0, 1], translateY: [-8, 0], duration: 500, ease: 'outExpo' })
          .add(taglineEl, { opacity: [0, 1], translateY: [8, 0], duration: 400, ease: 'outExpo' }, '-=200');
      }

      const lights = containerRef.current?.querySelectorAll('.start-light') ?? [];
      lights.forEach((light, i) => {
        setTimeout(() => {
          light.style.backgroundColor = '#e10600';
          light.style.boxShadow = '0 0 14px #e10600, 0 0 32px #e10600cc';
        }, i * 340);
      });
    }, 1400);

    // Phase 2 → launch (3.2s): lights out + wordmark slam
    const t2 = setTimeout(() => {
      setPhase('launch');

      const lights = containerRef.current?.querySelectorAll('.start-light') ?? [];
      lights.forEach((light) => {
        light.style.backgroundColor = '#150000';
        light.style.boxShadow = 'none';
        light.style.transition = 'all 0.08s linear';
      });

      const wm = containerRef.current?.querySelector('#intro-wordmark');
      if (wm) {
        createTimeline().add(wm, { opacity: [0, 1], scale: [1.25, 1], duration: 380, ease: 'outBounce' });
      }
    }, 3200);

    // Phase 3 → redirect (4.4s): car has been "launched" — cut to menu NOW
    // Fast fade-out then call onComplete; no lingering scene.
    const t3 = setTimeout(() => {
      setPhase('done');
      if (containerRef.current) {
        createTimeline({ onComplete: handleFinish }).add(containerRef.current, {
          opacity: [1, 0],
          duration: 350,
          ease: 'inQuad',
        });
      } else {
        handleFinish();
      }
    }, 4400);

    timersRef.current = [t1, t2, t3];
    return () => timersRef.current.forEach(clearTimeout);
  }, [modelReady, handleFinish]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#07070b] flex flex-col justify-between p-6 md:p-10 overflow-hidden select-none"
      style={{ opacity: 1 }}
    >
      {/* ── 3D Canvas ── */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [-4.2, 2.2, -4.6], fov: 45 }}
          gl={{
            antialias: true,
            toneMapping: 4, // ACESFilmicToneMapping
            toneMappingExposure: 1.2,
            physicallyCorrectLights: true,
          }}
          shadows={{ type: 'PCFShadowMap' }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <color attach="background" args={['#07070b']} />

          <ambientLight intensity={1.2} color="#ffffff" />

          <directionalLight
            position={[-6, 10, -6]}
            intensity={4.0}
            color="#ffffff"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[6, 8, 6]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[0, 12, 0]} intensity={2.5} color="#ffffff" />

          {/* Petronas turquoise rim light */}
          <pointLight position={[-3, 1.5, -2]} intensity={2.5} color="#00e5c0" />
          {/* F1 red accent */}
          <pointLight position={[0, 0.8, 3]} intensity={3.0} color="#e10600" />

          <IntroCamera phase={phase} />
          <F1CarModel phase={phase} onReady={() => setModelReady(true)} />
        </Canvas>
      </div>

      {/* Loading bar (shown while model is downloading; hidden once ready) */}
      {!modelReady && <ProgressHUD />}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(225,6,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(225,6,0,0.03) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Top bar ── */}
      <div className="relative z-10 w-full flex items-center justify-between pointer-events-none">
        {/* Logo (fades in during revving phase) */}
        <div id="intro-logo" className="flex items-center gap-3 opacity-0">
          <img
            src={f1LogoSrc}
            alt="Formula 1"
            style={{ height: '32px', width: 'auto', filter: 'drop-shadow(0 0 16px rgba(225,6,0,0.8))' }}
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] text-white/40 uppercase tracking-[3px] font-rajdhani">
              Official 3D View
            </span>
            <span className="text-xs font-bold text-white tracking-widest font-rajdhani">
              MERCEDES W13
            </span>
          </div>
        </div>

        {/* Start lights */}
        <div className="flex gap-2.5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="start-light w-4 h-4 md:w-5 md:h-5 rounded-full border-[1.5px] border-[#3a0000] bg-[#150000]"
              style={{ transition: 'background-color 0.1s, box-shadow 0.1s' }}
            />
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="pointer-events-auto text-[11px] font-bold text-white/50 hover:text-white border border-white/15 hover:border-f1-red bg-black/50 hover:bg-f1-red/10 px-3 py-1.5 rounded uppercase tracking-wider transition-all cursor-pointer font-rajdhani"
        >
          Skip <span className="text-[9px] text-white/30 ml-1">[ESC]</span>
        </button>
      </div>

      {/* Middle spacer */}
      <div className="relative z-10 pointer-events-none my-auto" />

      {/* ── Bottom bar ── */}
      <div className="relative z-10 flex flex-col items-center gap-2 pointer-events-none pb-2">
        <p
          id="intro-tagline"
          style={{
            opacity: 0,
            color: 'rgba(255,255,255,0.4)',
            fontSize: '12px',
            letterSpacing: '5px',
            fontFamily: 'Rajdhani, sans-serif',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          The Fastest Sport on Earth
        </p>

        <div
          id="intro-wordmark"
          style={{
            opacity: 0,
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 800,
            fontSize: '44px',
            letterSpacing: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            lineHeight: 1,
          }}
        >
          <span style={{ color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            FORMULA
          </span>
          <span style={{ color: '#e10600', filter: 'drop-shadow(0 0 18px rgba(225,6,0,0.8))' }}>
            DC-1
          </span>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
