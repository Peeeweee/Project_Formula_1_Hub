import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import F1CarSVG from './F1CarSVG';

const BackgroundCar = ({ color, opacity, scale, top, delay, isMobile }) => {
  const duration = useMemo(() => Math.random() * 10 + 18, []); // 18s to 28s
  const repeatDelay = useMemo(() => Math.random() * 12 + 8, []); // 8s to 20s

  return (
    <motion.div
      className="absolute"
      style={{
        top: `${top}%`,
        zIndex: 0,
        pointerEvents: 'none',
        filter: `blur(${isMobile ? 2 : 1}px)`
      }}
      initial={{ x: -220 }}
      animate={{ x: 'calc(100vw + 220px)' }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay,
        ease: 'linear'
      }}
    >
      <F1CarSVG color={color} scale={scale} opacity={opacity} />
    </motion.div>
  );
};

const AnimatedBackground = ({ isStartHere }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Streak opacity based on the current page
  const streakOpacity = isStartHere ? 0.2 : 0.08;

  const streaks = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const top = Math.random() * 100; // 0% to 100% top
      const duration = Math.random() * 6 + 8; // 8s to 14s
      const delay = Math.random() * 5; // 0s to 5s stagger

      return {
        id: i,
        top: `${top}vh`,
        duration: `${duration}s`,
        delay: `${delay}s`,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <style>
        {`
          @keyframes driftStreak {
            0% {
              transform: translateX(-150px) translateY(-50px) rotate(15deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateX(110vw) translateY(50px) rotate(15deg);
              opacity: 0;
            }
          }
        `}
      </style>

      {/* Layer A: Speed Grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1a1a24 1px, transparent 1px),
            linear-gradient(to bottom, #1a1a24 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.8
        }}
      />

      {/* Layer B: Drifting Streaks */}
      <div className="absolute inset-0">
        {streaks.map((streak) => (
          <div
            key={streak.id}
            className="absolute"
            style={{
              top: streak.top,
              left: 0,
              width: '120px',
              height: '1px',
              background: `linear-gradient(to right, transparent, rgba(225, 6, 0, ${streakOpacity}), transparent)`,
              animation: `driftStreak ${streak.duration} linear infinite`,
              animationDelay: streak.delay,
              transformOrigin: 'left center',
              transition: 'background 0.5s ease-in-out' // Smooth transition between pages
            }}
          />
        ))}
      </div>

      {/* Layer C: Background Cars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundCar color="#e10600" opacity={0.06} scale={1.4} top={22} delay={0} isMobile={isMobile} />
        
        {!isMobile && (
          <BackgroundCar color="#ffffff" opacity={0.04} scale={1.0} top={45} delay={6} isMobile={isMobile} />
        )}

        <BackgroundCar color="#3671c6" opacity={0.05} scale={1.2} top={65} delay={12} isMobile={isMobile} />

        {!isMobile && (
          <BackgroundCar color="#e10600" opacity={0.03} scale={0.8} top={80} delay={18} isMobile={isMobile} />
        )}
      </div>
    </div>
  );
};

export default AnimatedBackground;
