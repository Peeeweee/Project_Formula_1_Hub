import React from 'react';
import { motion } from 'framer-motion';

const RealisticTire = ({ compoundName, color, isSpinning = true }) => {
  // Determine if it's a slick or treaded tire
  const isSlick = ['Soft', 'Medium', 'Hard'].includes(compoundName);
  
  // Tire brand text (Pirelli uses P ZERO for slicks, CINTURATO for wets/inters)
  const brandText = isSlick ? 'P ZERO' : 'CINTURATO';

  return (
    <div className="relative w-full h-full max-w-[400px] max-h-[400px] mx-auto drop-shadow-2xl flex items-center justify-center">
      <motion.svg
        viewBox="0 0 500 500"
        className="w-full h-full"
        animate={{ rotate: isSpinning ? 360 : 0 }}
        transition={{ 
          duration: 20, 
          ease: "linear", 
          repeat: Infinity 
        }}
        style={{ filter: 'drop-shadow(0px 25px 35px rgba(0,0,0,0.8))' }}
      >
        <defs>
          {/* Main rubber gradient: gives the 3D bulging effect to the sidewall */}
          <radialGradient id="rubberGrad" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#2c2c2e" />
            <stop offset="85%" stopColor="#1a1a1c" />
            <stop offset="95%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Inner wheel rim base */}
          <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#111" />
            <stop offset="70%" stopColor="#222" />
            <stop offset="90%" stopColor="#0f0f12" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>

          {/* Carbon fiber subtle pattern for the wheel cover */}
          <pattern id="carbonPattern" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0,4 L4,0 M-1,1 L1,-1 M3,5 L5,3" stroke="#2a2a2a" strokeWidth="1" opacity="0.3"/>
          </pattern>

          {/* Metallic central hub nut */}
          <radialGradient id="nutGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e0e0e0" />
            <stop offset="40%" stopColor="#888" />
            <stop offset="100%" stopColor="#222" />
          </radialGradient>

          {/* Inner Rim Lip Highlight */}
          <linearGradient id="rimLipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#555" />
            <stop offset="50%" stopColor="#111" />
            <stop offset="100%" stopColor="#555" />
          </linearGradient>

          {/* Tread Pattern (only visible on the very outer edge for Wets/Inters) */}
          <pattern id="treadPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 10 0 Q 5 10 10 20" stroke="#0f0f10" strokeWidth="3" fill="none" opacity="0.6" />
          </pattern>

          {/* Text Path for the brand name */}
          <path id="textPathTop" d="M 110,250 A 140,140 0 0,1 390,250" />
          <path id="textPathBottom" d="M 390,250 A 140,140 0 0,1 110,250" />
        </defs>

        {/* 1. Outer Tread Edge (Visible mainly for Inters/Wets) */}
        <circle cx="250" cy="250" r="245" fill="url(#rubberGrad)" />
        {!isSlick && (
          <circle cx="250" cy="250" r="245" fill="url(#treadPattern)" />
        )}

        {/* 2. Main Sidewall Bulge */}
        <circle cx="250" cy="250" r="235" fill="url(#rubberGrad)" />
        
        {/* Subtle highlight ring for 3D bevel on the rubber */}
        <circle cx="250" cy="250" r="225" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="none" />

        {/* 3. The Compound Colored Stripe */}
        <circle cx="250" cy="250" r="185" stroke={color} strokeWidth="12" fill="none" opacity="0.9" />
        {/* Glow for the colored stripe */}
        <circle cx="250" cy="250" r="185" stroke={color} strokeWidth="20" fill="none" opacity="0.2" filter="blur(4px)" />

        {/* 4. Brand Text (PIRELLI placeholder / Compound Name) */}
        <text className="font-black tracking-widest" fill={color} fontSize="28" letterSpacing="6">
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
            {brandText}
          </textPath>
        </text>
        <text className="font-black tracking-widest" fill={color} fontSize="28" letterSpacing="6">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
            {brandText}
          </textPath>
        </text>

        {/* 5. Inner Rim / Wheel Cover */}
        <circle cx="250" cy="250" r="135" fill="url(#rimGrad)" />
        <circle cx="250" cy="250" r="135" fill="url(#carbonPattern)" />
        
        {/* Rim outer lip metallic shine */}
        <circle cx="250" cy="250" r="135" stroke="url(#rimLipGrad)" strokeWidth="6" fill="none" />
        <circle cx="250" cy="250" r="132" stroke="#000" strokeWidth="4" fill="none" />

        {/* 6. Wheel Cover Details (Modern F1 Covers) */}
        <circle cx="250" cy="250" r="90" stroke="#1a1a1a" strokeWidth="2" fill="none" />
        <circle cx="250" cy="250" r="60" stroke="#1a1a1a" strokeWidth="2" fill="none" />
        
        {/* Five spokes/cooling slats on the cover */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 250 250)`}>
            <path d="M 250,115 L 255,130 L 245,130 Z" fill="#0f0f10" />
            <line x1="250" y1="135" x2="250" y2="180" stroke="#111" strokeWidth="3" opacity="0.5" />
          </g>
        ))}

        {/* 7. Central Hub Nut */}
        <circle cx="250" cy="250" r="25" fill="#111" stroke="#333" strokeWidth="2" />
        <path d="M 235,240 L 265,240 L 270,260 L 230,260 Z" fill="url(#nutGrad)" />
        <circle cx="250" cy="250" r="12" fill="#050505" />
        
        {/* Light reflection over the whole tire for 3D gloss */}
        <path 
          d="M 5,250 A 245,245 0 0,1 495,250 A 245,245 0 0,0 5,250 Z" 
          fill="rgba(255,255,255,0.03)" 
        />
        <ellipse cx="250" cy="80" rx="150" ry="30" fill="rgba(255,255,255,0.04)" filter="blur(10px)" />

      </motion.svg>
    </div>
  );
};

export default RealisticTire;
