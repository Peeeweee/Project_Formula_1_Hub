import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealisticTire from '../RealisticTire';

const TireVisualizer = ({ phase, term }) => {
  // We'll map terms to compounds for visual flavor
  const getCompound = () => {
    if (term === 'Marbles') return { name: 'Soft', color: '#e10600' };
    if (term === 'Graining') return { name: 'Medium', color: '#ffd300' };
    if (term === 'Blistering') return { name: 'Hard', color: '#ffffff' };
    return { name: 'Medium', color: '#ffd300' };
  };

  const tireConfig = getCompound();
  
  // Decide if tire should spin
  const isSpinning = !(term === 'Flat Spot' && (phase === 'demonstration' || phase === 'result'));

  // Generate random coordinates for marbles/graining effects
  const randomOffsets = Array.from({ length: 30 }).map((_, i) => ({
    x: Math.random() * 200 - 100,
    y: Math.random() * 20 - 10,
    delay: Math.random() * 0.5
  }));

  return (
    <div className="w-full h-72 bg-[#0a0a0f] rounded-lg overflow-hidden relative flex items-center justify-center border border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
      
      {/* Background Asphalt Texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      
      {/* Speed lines for motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isSpinning && Array.from({ length: 5 }).map((_, i) => (
          <motion.div 
            key={`speed-${i}`}
            className="absolute h-0.5 bg-white/10"
            style={{ width: Math.random() * 100 + 50, top: `${Math.random() * 100}%` }}
            animate={{ x: ['100vw', '-20vw'] }}
            transition={{ repeat: Infinity, duration: Math.random() * 0.5 + 0.2, ease: "linear" }}
          />
        ))}
      </div>

      {/* The Realistic Tire Component */}
      <div className="relative z-10 w-48 h-48 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]">
        <RealisticTire compoundName={tireConfig.name} color={tireConfig.color} isSpinning={isSpinning} />
        
        {/* Flat Spot Overlay (a flat shadow covering the bottom) */}
        <AnimatePresence>
          {term === 'Flat Spot' && (phase === 'demonstration' || phase === 'result') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[60%] h-[15%] bg-black rounded-[50%] blur-[2px]"
            />
          )}
        </AnimatePresence>

        {/* Blistering / Graining Dynamic Overlay */}
        <AnimatePresence>
          {(term === 'Blistering' || term === 'Graining') && (phase === 'demonstration' || phase === 'result') && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full pointer-events-none rounded-full overflow-hidden"
              style={{ boxShadow: term === 'Blistering' ? 'inset 0 0 20px rgba(0,0,0,0.9)' : 'none' }}
            >
              {randomOffsets.slice(0, term === 'Blistering' ? 15 : 30).map((pos, i) => (
                <motion.div 
                  key={i}
                  className={`absolute left-1/2 top-1/2 rounded-full ${term === 'Blistering' ? 'bg-black w-4 h-4 shadow-inner' : 'bg-[#222] w-2 h-1'}`}
                  style={{ x: pos.x, y: pos.y, rotate: pos.x * 2 }}
                  animate={{ opacity: [0, 1, 0], scale: term === 'Blistering' ? [0.5, 1.2, 1] : 1 }}
                  transition={{ duration: 1, repeat: Infinity, delay: pos.delay }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Track Surface & Particles */}
      <div className="absolute bottom-4 w-[200%] h-8 flex items-center justify-center">
        {/* Ground shadow/contact patch */}
        <div className="w-48 h-4 bg-black/80 blur-md rounded-[100%]" />
        
        {/* Smoke for Flat Spot */}
        <AnimatePresence>
          {term === 'Flat Spot' && phase === 'action' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.5, 2, 3], y: -50 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/30 blur-2xl rounded-full mix-blend-screen"
            />
          )}
        </AnimatePresence>

        {/* Marbles flying off */}
        <AnimatePresence>
          {term === 'Marbles' && (phase === 'demonstration' || phase === 'result') && (
            randomOffsets.map((pos, i) => (
              <motion.div
                key={`marble-${i}`}
                className="absolute w-2 h-2 bg-black rounded-full shadow-lg"
                initial={{ x: '50vw', y: 0, opacity: 1 }}
                animate={{ x: '-10vw', y: [0, -20, 0], opacity: 0 }}
                transition={{ duration: 0.8, repeat: Infinity, delay: pos.delay, ease: "linear" }}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TireVisualizer;
