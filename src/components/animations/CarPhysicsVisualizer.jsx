import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import F1CarSVG from '../F1CarSVG';

const CarPhysicsVisualizer = ({ phase, term }) => {
  const isAero = ['DRS', 'Slipstream'].includes(term);
  const isEnergy = ['ERS', 'MGUK', 'MGUH', 'Quali Mode'].includes(term);
  const isSafety = ['Halo'].includes(term);

  // Speed lines background
  const speedLines = Array.from({ length: 10 }).map((_, i) => (
    <motion.div
      key={`bg-${i}`}
      className="absolute h-0.5 bg-white/10"
      style={{ width: Math.random() * 100 + 50, top: `${Math.random() * 100}%` }}
      animate={{ x: ['100vw', '-20vw'] }}
      transition={{ repeat: Infinity, duration: Math.random() * 0.3 + 0.1, ease: "linear" }}
    />
  ));

  return (
    <div className="w-full h-72 bg-[#0a0a0f] rounded-lg overflow-hidden relative flex items-center justify-center border border-white/10 shadow-inner">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px)', backgroundSize: '40px 100%' }} />
      {speedLines}

      {/* Main Car Wrapper */}
      <motion.div 
        className="relative z-10"
        initial={{ x: -20 }}
        animate={{ 
          x: phase === 'action' ? -20 : phase === 'demonstration' ? 20 : 60,
          scale: isAero && phase === 'result' ? 1.05 : 1
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {/* Aerodynamic wind streaks */}
        <AnimatePresence>
          {isAero && (phase === 'demonstration' || phase === 'result') && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[30, 45, 60].map((y, i) => (
                <motion.div
                  key={`wind-${i}`}
                  className="absolute h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                  style={{ top: y, width: 200, left: 100 }}
                  animate={{ x: [-100, -300], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <F1CarSVG 
          color="#e10600" 
          scale={1.5} 
          drsOpen={term === 'DRS' && (phase === 'action' || phase === 'demonstration' || phase === 'result')}
          brakesGlowing={isEnergy && phase === 'action'}
          energyFlow={isEnergy && (phase === 'demonstration' || phase === 'result')}
        />

        {/* HALO Debris Animation */}
        <AnimatePresence>
          {isSafety && (phase === 'demonstration' || phase === 'result') && (
            <motion.div 
              className="absolute w-4 h-4 bg-yellow-500 rounded-sm rotate-45 shadow-lg"
              initial={{ x: -100, y: -50, scale: 0 }}
              animate={{ 
                x: [ -100, 100, 200 ], 
                y: [ -50, 20, -100 ],
                scale: [ 1, 1.5, 0.5 ],
                rotate: [ 0, 360, 720 ]
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

      </motion.div>

      {/* Energy UI Overlays */}
      <AnimatePresence>
        {isEnergy && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-lg flex items-center gap-4"
          >
            <div className="text-xs font-bold text-gray-400 tracking-widest">ERS DEPLOYMENT</div>
            <div className="w-48 h-3 bg-[#222] rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full rounded-full"
                animate={{ 
                  width: phase === 'action' ? '100%' : phase === 'demonstration' ? '50%' : '10%',
                  backgroundColor: phase === 'action' ? '#00a650' : phase === 'demonstration' ? '#ffd300' : '#e10600'
                }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="text-sm font-mono font-bold text-white">
              {phase === 'action' ? 'CHARGING' : phase === 'demonstration' ? 'DEPLOYING' : 'DEPLETED'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRS / Speed Overlay */}
      <AnimatePresence>
        {isAero && phase === 'result' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute top-8 right-8 bg-[#e10600]/20 border border-[#e10600]/50 text-[#e10600] px-4 py-2 rounded-md font-mono font-bold text-2xl"
          >
            +18 km/h BOOST
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default CarPhysicsVisualizer;
