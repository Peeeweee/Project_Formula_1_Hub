import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import F1CarSVG from './F1CarSVG';

const IntroScreen = ({ onComplete }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const streaks = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => {
      const isRed = i % 2 === 0;
      const height = Math.random() * 1 + 1; // 1px to 2px
      const width = Math.random() * 220 + 80; // 80px to 300px
      const top = Math.random() * 100; // 0% to 100%
      const duration = Math.random() * 0.3 + 0.3; // 0.3s to 0.6s
      const delay = Math.random() * 0.6 + 0.3; // 0.3s to 0.9s

      return {
        id: i,
        color: isRed ? '#e10600' : 'rgba(255,255,255,0.4)',
        height,
        width,
        top: `${top}vh`,
        duration,
        delay
      };
    });
  }, []);

  const logoFontSize = isMobile ? '36px' : '64px';
  const lightSize = isMobile ? '20px' : '28px';

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: "-100vh", opacity: 0 }}
      transition={{ delay: 3.8, duration: 0.45, ease: "easeIn" }}
      onAnimationComplete={() => {
        sessionStorage.setItem("fdc1_intro_seen", "true");
        onComplete();
      }}
    >
      {/* Step 1: Speed Streaks */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {streaks.map((streak) => (
          <motion.div
            key={streak.id}
            className="absolute"
            style={{
              top: streak.top,
              width: streak.width,
              height: streak.height,
              backgroundColor: streak.color,
            }}
            initial={{ x: -300, opacity: 1 }}
            animate={{ x: '110vw', opacity: [1, 1, 0] }}
            transition={{
              duration: streak.duration,
              delay: streak.delay,
              ease: "linear",
              opacity: { delay: streak.delay + streak.duration * 0.8, duration: streak.duration * 0.2 } // Fade out at the end
            }}
          />
        ))}
      </div>



      <div className="relative z-10 flex flex-col items-center">
        {/* Step 4 & 5: Start Lights */}
        <div className="flex justify-center mb-8" style={{ gap: '12px' }}>
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
                  '0 0 12px #e10600, 0 0 24px #e10600',
                  '0 0 12px #e10600, 0 0 24px #e10600',
                  'none'
                ]
              }}
              transition={{
                duration: (3.3 - (1.8 + i * 0.3)) + 0.1, // Total time from this light's start to lights out + 0.1s out duration
                delay: 1.8 + i * 0.3,
                backgroundColor: {
                  times: [0, 0.05, 0.95, 1], // Turn on fast, stay on, turn off fast
                  duration: (3.3 - (1.8 + i * 0.3)) + 0.1,
                  delay: 1.8 + i * 0.3
                },
                boxShadow: {
                  times: [0, 0.05, 0.95, 1],
                  duration: (3.3 - (1.8 + i * 0.3)) + 0.1,
                  delay: 1.8 + i * 0.3
                }
              }}
            />
          ))}
        </div>

        {/* Logo Container */}
        <div>
          <div className="flex items-center" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {/* Step 2A: FORMULA */}
            <div className="flex" style={{ fontWeight: 700, fontSize: logoFontSize, color: 'white', letterSpacing: '8px' }}>
              {"FORMULA".split("").map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.06, duration: 0.35 }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Step 2B: DC-1 */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
              style={{ fontWeight: 700, fontSize: logoFontSize, color: '#e10600', letterSpacing: '8px', marginLeft: '16px' }}
            >
              DC-1
            </motion.div>
          </div>

          {/* Step 3: Red Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            style={{ height: '2px', backgroundColor: '#e10600', width: '100%', transformOrigin: 'left' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default IntroScreen;
