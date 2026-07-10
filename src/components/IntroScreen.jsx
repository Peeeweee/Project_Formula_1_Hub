import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import f1LogoSrc from '../assets/f1_logo.svg';

const IntroScreen = ({ onComplete }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Speed streaks flying across on load
  const streaks = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const isRed = i % 3 === 0;
      const isWhite = i % 3 === 1;
      const height = Math.random() * 1.5 + 0.5;
      const width = Math.random() * 280 + 60;
      const top = Math.random() * 100;
      const duration = Math.random() * 0.25 + 0.2;
      const delay = Math.random() * 0.5 + 0.05;
      return {
        id: i,
        color: isRed ? '#e10600' : isWhite ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.15)',
        height,
        width,
        top: `${top}vh`,
        duration,
        delay,
      };
    });
  }, []);

  const logoFontSize = isMobile ? '34px' : '60px';
  const lightSize = isMobile ? '18px' : '26px';
  const f1LogoHeight = isMobile ? '64px' : '110px';

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ y: '-100vh', opacity: 0 }}
      transition={{ delay: 4.6, duration: 0.5, ease: 'easeIn' }}
      onAnimationComplete={() => {
        sessionStorage.setItem('fdc1_intro_seen', 'true');
        onComplete();
      }}
    >
      {/* ── Background grid ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(225,6,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(225,6,0,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Speed streaks ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        {streaks.map((s) => (
          <motion.div
            key={s.id}
            className="absolute"
            style={{
              top: s.top,
              width: s.width,
              height: s.height,
              backgroundColor: s.color,
            }}
            initial={{ x: -320, opacity: 1 }}
            animate={{ x: '110vw', opacity: [1, 1, 0] }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              ease: 'linear',
              opacity: { delay: s.delay + s.duration * 0.75, duration: s.duration * 0.25 },
            }}
          />
        ))}
      </div>

      {/* ── Flash shockwave when F1 logo hits ── */}
      <motion.div
        className="absolute inset-0 z-[2] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.55, 0] }}
        transition={{ duration: 0.35, delay: 0.55, times: [0, 0.01, 0.35, 1] }}
        style={{ background: 'radial-gradient(ellipse at center, rgba(225,6,0,0.45) 0%, transparent 70%)' }}
      />

      {/* ── Red scan line sweeping down ── */}
      <motion.div
        className="absolute left-0 right-0 z-[2] pointer-events-none"
        style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, #e10600 40%, #ff4444 50%, #e10600 60%, transparent 100%)' }}
        initial={{ top: '-4px', opacity: 0 }}
        animate={{ top: '100vh', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.7, delay: 0.3, ease: 'easeIn', opacity: { times: [0, 0.05, 0.9, 1] } }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* ═══ OFFICIAL F1 LOGO ═══ */}
        <div className="relative flex items-center justify-center">
          {/* Glow ring behind logo */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: isMobile ? 180 : 310, height: isMobile ? 80 : 130, background: 'radial-gradient(ellipse, rgba(225,6,0,0.35) 0%, transparent 70%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.8, 1], opacity: [0, 1, 0.6] }}
            transition={{ delay: 0.45, duration: 0.6, ease: 'easeOut' }}
          />

          {/* The F1 logo slamming in */}
          <motion.img
            src={f1LogoSrc}
            alt="Formula 1"
            style={{ height: f1LogoHeight, width: 'auto', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 24px rgba(225,6,0,0.9)) drop-shadow(0 0 48px rgba(225,6,0,0.5))' }}
            initial={{ x: -220, opacity: 0, scale: 1.3 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.38, ease: [0.2, 0, 0.1, 1] }}
          />

          {/* Impact particle burst */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * 360;
            const rad = (angle * Math.PI) / 180;
            const dist = isMobile ? 55 : 90;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: i % 2 === 0 ? 3 : 2,
                  height: i % 2 === 0 ? 3 : 2,
                  backgroundColor: i % 3 === 0 ? '#e10600' : 'white',
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: Math.cos(rad) * dist,
                  y: Math.sin(rad) * dist,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{ delay: 0.55, duration: 0.55, ease: 'easeOut' }}
              />
            );
          })}
        </div>

        {/* ═══ FORMULA DC-1 WORDMARK ═══ */}
        <div>
          <div className="flex items-center justify-center" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {/* FORMULA letter by letter */}
            <div className="flex" style={{ fontWeight: 700, fontSize: logoFontSize, color: 'white', letterSpacing: '8px' }}>
              {'FORMULA'.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -35, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 + i * 0.055, duration: 0.3, ease: 'easeOut' }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* DC-1 sliding in */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.55, duration: 0.4, ease: 'easeOut' }}
              style={{ fontWeight: 700, fontSize: logoFontSize, color: '#e10600', letterSpacing: '8px', marginLeft: '16px', filter: 'drop-shadow(0 0 10px rgba(225,6,0,0.6))' }}
            >
              DC-1
            </motion.div>
          </div>

          {/* Red underline sweep */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.75, duration: 0.5, ease: 'easeOut' }}
            style={{ height: '2px', background: 'linear-gradient(90deg, #e10600, #ff6644)', width: '100%', transformOrigin: 'left', boxShadow: '0 0 8px #e10600' }}
          />

          {/* Tagline fading in */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.45 }}
            style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: isMobile ? '10px' : '12px', letterSpacing: '3px', marginTop: '8px', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}
          >
            The Fastest Sport on Earth
          </motion.p>
        </div>

        {/* ═══ START LIGHTS ═══ */}
        <div className="flex justify-center" style={{ gap: '12px', marginTop: '8px' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              style={{
                width: lightSize,
                height: lightSize,
                borderRadius: '50%',
                border: '1.5px solid #3a0000',
              }}
              initial={{ backgroundColor: '#1a0000', boxShadow: 'none' }}
              animate={{
                backgroundColor: ['#1a0000', '#e10600', '#e10600', '#000000'],
                boxShadow: [
                  'none',
                  '0 0 12px #e10600, 0 0 28px #e10600',
                  '0 0 12px #e10600, 0 0 28px #e10600',
                  'none',
                ],
              }}
              transition={{
                delay: 2.4 + i * 0.28,
                duration: 0.5,
                backgroundColor: { times: [0, 0.1, 0.9, 1] },
                boxShadow: { times: [0, 0.1, 0.9, 1] },
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Final flash on lights out ── */}
      <motion.div
        className="absolute inset-0 z-[15] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.7, 0] }}
        transition={{ duration: 0.4, delay: 4.2, times: [0, 0.01, 0.3, 1] }}
        style={{ background: 'white' }}
      />
    </motion.div>
  );
};

export default IntroScreen;
