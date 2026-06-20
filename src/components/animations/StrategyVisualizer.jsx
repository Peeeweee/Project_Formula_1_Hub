import React from 'react';
import { motion } from 'framer-motion';

const TopDownCar = ({ color }) => (
  <svg width="40" height="16" viewBox="0 0 40 16">
    {/* Tires */}
    <rect x="6" y="0" width="8" height="3" fill="#111" rx="1" />
    <rect x="6" y="13" width="8" height="3" fill="#111" rx="1" />
    <rect x="28" y="0" width="8" height="3" fill="#111" rx="1" />
    <rect x="28" y="13" width="8" height="3" fill="#111" rx="1" />
    {/* Axles/Suspension */}
    <line x1="10" y1="3" x2="10" y2="13" stroke="#333" strokeWidth="1" />
    <line x1="32" y1="3" x2="32" y2="13" stroke="#333" strokeWidth="1" />
    {/* Body */}
    <path d="M 4 8 L 12 4 L 20 4 L 28 6 L 36 6 L 36 10 L 28 10 L 20 12 L 12 12 Z" fill={color} />
    {/* Front Wing */}
    <rect x="2" y="3" width="4" height="10" fill="#222" rx="1" />
    {/* Rear Wing */}
    <rect x="34" y="2" width="4" height="12" fill={color} rx="1" />
    {/* Driver Helmet */}
    <circle cx="18" cy="8" r="2" fill="#fff" />
  </svg>
);

const StrategyVisualizer = ({ phase, term }) => {
  // A straight track with a detailed pit lane
  
  const getCar1Variants = () => {
    switch (term) {
      case 'Undercut':
        if (phase === 'action') return { x: 100, y: 50 }; // Pits
        if (phase === 'demonstration') return { x: 350, y: 0, transition: { duration: 1 } }; // Fast out-lap
        if (phase === 'result') return { x: 500, y: 0, transition: { duration: 1 } }; // Ahead
        return { x: 0, y: 0 };
      case 'Overcut':
        if (phase === 'action') return { x: 150, y: 0 }; // Stays out
        if (phase === 'demonstration') return { x: 350, y: 0, transition: { duration: 1 } }; // Pushes
        if (phase === 'result') return { x: 500, y: 0, transition: { duration: 1 } }; // Ahead
        return { x: 0, y: 0 };
      default:
        return { x: phase === 'result' ? 450 : phase === 'demonstration' ? 250 : 50 };
    }
  };

  const getCar2Variants = () => {
    switch (term) {
      case 'Undercut':
        if (phase === 'action') return { x: 150, y: 0 }; // Stays out
        if (phase === 'demonstration') return { x: 250, y: 0, transition: { duration: 1 } }; // Slow old tires
        if (phase === 'result') return { x: 400, y: 50, transition: { duration: 1 } }; // Pits and emerges behind
        return { x: 50, y: 0 };
      case 'Overcut':
        if (phase === 'action') return { x: 100, y: 50 }; // Pits
        if (phase === 'demonstration') return { x: 200, y: 0, transition: { duration: 1 } }; // Slow cold tires
        if (phase === 'result') return { x: 350, y: 0, transition: { duration: 1 } }; // Behind
        return { x: 0, y: 0 };
      default:
        return { x: phase === 'result' ? 250 : phase === 'demonstration' ? 120 : 0 };
    }
  };

  // Kerb generator
  const kerbs = Array.from({ length: 40 }).map((_, i) => (
    <rect key={i} x={i * 15} y="15" width="15" height="5" fill={i % 2 === 0 ? '#e10600' : '#ffffff'} />
  ));
  const kerbsBottom = Array.from({ length: 40 }).map((_, i) => (
    <rect key={i} x={i * 15} y="80" width="15" height="5" fill={i % 2 === 0 ? '#e10600' : '#ffffff'} />
  ));

  return (
    <div className="w-full h-72 bg-[#1a1a1a] rounded-lg overflow-hidden relative flex items-center justify-center border border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
      
      {/* Grass Background */}
      <div className="absolute inset-0 bg-[#0c3614] opacity-80" style={{ backgroundImage: 'radial-gradient(circle, #0f4019 1px, transparent 1px)', backgroundSize: '8px 8px' }} />

      <svg width="600" height="200" viewBox="0 0 600 200" className="relative z-10 drop-shadow-xl">
        {/* Main Track Asphalt */}
        <rect x="0" y="20" width="600" height="60" fill="#2c2c2e" />
        
        {/* Track Kerbs */}
        <g>{kerbs}</g>
        <g>{kerbsBottom}</g>
        
        {/* Starting Grid Lines */}
        <line x1="50" y1="20" x2="50" y2="80" stroke="#fff" strokeWidth="4" />
        <line x1="60" y1="20" x2="60" y2="40" stroke="#fff" strokeWidth="2" />
        <line x1="60" y1="60" x2="60" y2="80" stroke="#fff" strokeWidth="2" />

        {/* Racing Line (Darker asphalt where cars drive) */}
        <path d="M 0 45 L 600 45" stroke="#1a1a1c" strokeWidth="15" fill="none" opacity="0.6" strokeLinecap="round" />

        {/* Pit Wall */}
        <rect x="150" y="85" width="300" height="8" fill="#111" />
        <rect x="150" y="86" width="300" height="2" fill="#444" />
        {/* Pit Crew Canopies */}
        <rect x="250" y="80" width="20" height="10" fill="#e10600" />
        <rect x="350" y="80" width="20" height="10" fill="#007aff" />
        
        {/* Pit Lane Asphalt */}
        <path d="M 50 80 Q 100 110 150 110 L 450 110 Q 500 110 550 80" fill="none" stroke="#222" strokeWidth="25" strokeLinecap="round" />
        
        {/* Pit Lane Speed Limit Line */}
        <line x1="150" y1="98" x2="150" y2="122" stroke="#fff" strokeWidth="2" />
        <text x="155" y="115" fill="#fff" fontSize="8" fontWeight="bold">80</text>
        <line x1="450" y1="98" x2="450" y2="122" stroke="#fff" strokeWidth="2" />

        {/* Pit Box Markings */}
        <rect x="240" y="100" width="40" height="20" fill="none" stroke="#e10600" strokeWidth="1" opacity="0.5" />
        <rect x="340" y="100" width="40" height="20" fill="none" stroke="#007aff" strokeWidth="1" opacity="0.5" />

        {/* Car 2 (Trailing / Alternative) */}
        <motion.g 
          initial={{ x: 0, y: 0 }}
          animate={getCar2Variants()}
        >
          <g transform="translate(-20, 36)">
            <TopDownCar color="#00a650" />
            {/* Motion Blur Tail */}
            <motion.path d="M 4 8 L -20 8" stroke="#00a650" strokeWidth="2" opacity="0.3" filter="blur(2px)" 
              animate={{ opacity: phase === 'demonstration' ? 0.6 : 0 }} 
            />
          </g>
        </motion.g>
        
        {/* Car 1 (Leader / Primary) */}
        <motion.g 
          initial={{ x: 50, y: 0 }}
          animate={getCar1Variants()}
        >
          <g transform="translate(-20, 36)">
            <TopDownCar color="#007aff" />
            {/* Motion Blur Tail */}
            <motion.path d="M 4 8 L -30 8" stroke="#007aff" strokeWidth="2" opacity="0.5" filter="blur(2px)"
              animate={{ opacity: phase === 'demonstration' ? 0.8 : 0 }} 
            />
          </g>
        </motion.g>
      </svg>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-6 bg-black/60 backdrop-blur-sm border border-white/10 p-3 rounded-lg flex gap-6 text-xs font-mono shadow-xl">
        <div className="flex items-center gap-2 text-white"><div className="w-4 h-4 rounded-sm bg-[#007aff] border border-white/20 shadow-inner"></div> Primary Strategy</div>
        <div className="flex items-center gap-2 text-white"><div className="w-4 h-4 rounded-sm bg-[#00a650] border border-white/20 shadow-inner"></div> Rival Strategy</div>
      </div>
    </div>
  );
};

export default StrategyVisualizer;
