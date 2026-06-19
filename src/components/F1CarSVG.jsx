import React from 'react';

const F1CarSVG = ({
  color = "#e10600",
  scale = 1,
  opacity = 1,
  className = ""
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 60"
      width={200 * scale}
      height={60 * scale}
      opacity={opacity}
      className={className}
      style={{ display: 'block', maxWidth: '100%', transform: 'scaleX(-1)' }}
    >
      <defs>
        <filter id="exhaust-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* MOTION BLUR LINES */}
      <line x1="185" y1="28" x2="200" y2="28" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />
      <line x1="185" y1="32" x2="200" y2="32" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />
      <line x1="185" y1="36" x2="200" y2="36" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />

      {/* EXHAUST GLOW */}
      <ellipse cx="178" cy="32" rx="8" ry="4" fill="rgba(255, 100, 0, 0.3)" filter="url(#exhaust-blur)" />

      {/* REAR WING */}
      <rect x="171" y="10" width="4" height="20" fill={color} />
      <rect x="165" y="10" width="10" height="4" fill={color} />
      <rect x="165" y="22" width="10" height="4" fill={color} />

      {/* FRONT WING */}
      <rect x="10" y="38" width="25" height="4" fill={color} style={{ filter: 'brightness(0.7)' }} />

      {/* BODY */}
      <path
        d="M 20 40 L 45 34 L 80 32 L 90 22 L 105 22 L 140 28 L 170 30 L 170 40 Z"
        fill={color}
      />

      {/* COCKPIT */}
      <ellipse cx="96" cy="24" rx="11" ry="4" fill="#111111" />

      {/* HALO */}
      <path d="M 78 22 Q 95 12 112 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* WHEELS */}
      {/* Front */}
      <circle cx="45" cy="44" r="9" fill="#222222" stroke="#444" strokeWidth="1" />
      <circle cx="45" cy="44" r="4" fill="#333333" />
      
      {/* Rear */}
      <circle cx="155" cy="44" r="10" fill="#222222" stroke="#444" strokeWidth="1" />
      <circle cx="155" cy="44" r="5" fill="#333333" />
    </svg>
  );
};

export default F1CarSVG;
