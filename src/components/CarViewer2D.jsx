import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VIEWS = ['SIDE VIEW', 'FRONT VIEW', 'REAR VIEW', 'TOP VIEW'];

const CarViewer2D = ({ car }) => {
  const [currentView, setCurrentView] = useState('SIDE VIEW');
  const [sideColor, setSideColor] = useState('#e10600');
  const [accentColor, setAccentColor] = useState('#ffffff');

  useEffect(() => {
    if (car) {
      setSideColor(car.sideViewColor || car.modelConfig?.bodyColor || '#e10600');
      setAccentColor(car.accentColor || car.modelConfig?.accentColor || '#ffffff');
    }
  }, [car]);

  if (!car) return null;

  const isPreAero = car.eraId === 'early_years' || car.eraId === 'rear_engine';
  const isWings = car.eraId === 'wings_dfv';
  const isTurbo = car.eraId === 'turbo_ground_effect';
  const isV10V8 = car.eraId === 'v10_era' || car.eraId === 'v8_era';
  const isModern = car.eraId === 'turbo_hybrid' || car.eraId === 'ground_effect_hybrid';

  const hasHighNose = car.modelConfig?.hasHighNose || false;
  const noseYOffset = hasHighNose ? -8 : 0;

  const HOTSPOTS = [
    { id: 'front-wing', x: 45, y: 67, text: "Front Wing — creates downforce to push the car into the track" },
    { id: 'cockpit', x: 180, y: 42, text: "Cockpit — where the driver sits. Only 68cm wide." },
    { id: 'halo', x: 175, y: 32, text: "Halo — titanium safety structure. Can withstand 12 tonnes of force.", condition: isModern },
    { id: 'rear-wing', x: 310, y: 33, text: "Rear Wing — with DRS open, reduces drag by up to 20% on straights", condition: !isPreAero },
    { id: 'front-wheel', x: 95, y: 75, text: "Slick Tires — no tread at all. Only used in dry conditions." },
    { id: 'exhaust', x: 320, y: 58, text: "Exhaust — exits at over 800°C" }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <style>{`
        @keyframes pulse-dot {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .hotspot-pulse {
          animation: pulse-dot 1.5s infinite ease-out;
        }
      `}</style>
      
      {/* ANGLE TABS */}
      <div className="flex justify-center gap-2 mb-8">
        {VIEWS.map(v => (
          <button
            key={v}
            onClick={() => setCurrentView(v)}
            className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-colors border ${
              currentView === v 
                ? 'bg-f1-red text-white border-f1-red' 
                : 'bg-f1-panel text-f1-muted hover:text-white border-f1-border'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="relative w-full aspect-[3/1] max-w-2xl mx-auto flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full relative flex items-center justify-center"
          >
            {currentView === 'SIDE VIEW' && (
              <div className="relative w-full">
                <svg viewBox="0 0 400 120" className="w-full h-auto drop-shadow-2xl">
                  <defs>
                    <radialGradient id="exhaustGradSide">
                      <stop offset="0%" stopColor="#ff4400" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <linearGradient id="bodyGradSide" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                      <stop offset="30%" stopColor={sideColor} />
                      <stop offset="80%" stopColor={sideColor} />
                      <stop offset="100%" stopColor="#111111" />
                    </linearGradient>
                    <linearGradient id="carbonSide" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#333" />
                      <stop offset="100%" stopColor="#0a0a0f" />
                    </linearGradient>
                    <filter id="glowSide" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* SPEED LINES */}
                  <line x1="330" y1="50" x2="390" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="325" y1="55" x2="390" y2="55" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="335" y1="60" x2="390" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                  {/* REAR WING */}
                  {!isPreAero && (
                    <g>
                      {isModern || isV10V8 ? (
                        <g>
                          <path d="M 290,20 C 310,15 315,30 315,50 L 310,65 C 290,65 295,45 290,20 Z" fill={sideColor} stroke="#222" strokeWidth="1" />
                          <path d="M 292,25 L 312,28 L 313,38 L 293,35 Z" fill={accentColor} />
                          <path d="M 293,42 L 313,45 L 312,50 L 295,50 Z" fill="#111" />
                          {/* Rear wing louvres */}
                          <line x1="295" y1="55" x2="305" y2="55" stroke="#111" strokeWidth="1" />
                          <line x1="295" y1="58" x2="308" y2="58" stroke="#111" strokeWidth="1" />
                        </g>
                      ) : (
                        <g>
                           <rect x="305" y="25" width="12" height="40" fill={sideColor} stroke="#222" />
                           <rect x="295" y="30" width="22" height="5" fill={accentColor} />
                           <rect x="295" y="40" width="22" height="5" fill="#111" />
                        </g>
                      )}
                    </g>
                  )}

                  {/* FLOOR */}
                  {!isPreAero && (
                    <g>
                      <path d="M 40,70 L 310,70 L 315,65 L 45,65 Z" fill="url(#carbonSide)" />
                      {/* Diffuser strakes */}
                      <path d="M 290,65 C 295,65 305,60 315,55 L 315,65 Z" fill="#111" />
                    </g>
                  )}

                  {/* BODY & NOSE */}
                  {isPreAero ? (
                    <path d="M 50,55 C 80,40 180,35 250,45 C 300,50 310,65 250,65 L 50,65 C 30,65 40,60 50,55 Z" fill="url(#bodyGradSide)" stroke="#222" />
                  ) : (
                    <g>
                      {/* Nose Cone */}
                      <path d={`M 25,${55 + noseYOffset} C 40,55 80,45 120,40 L 120,65 L 35,65 C 20,65 20,${60 + noseYOffset} 25,${55 + noseYOffset} Z`} fill="url(#bodyGradSide)" />
                      <line x1="35" y1={58 + noseYOffset} x2="100" y2="50" stroke={accentColor} strokeWidth="2" />
                      {/* Main Chassis */}
                      <path d="M 120,40 C 160,35 220,35 280,45 L 315,60 L 310,65 L 120,65 Z" fill="url(#bodyGradSide)" stroke="#111" strokeWidth="0.5" />
                    </g>
                  )}

                  {/* ENGINE COVER / SHARK FIN */}
                  {isModern && (
                    <g>
                      <path d="M 180,35 C 220,30 260,35 280,50 L 250,50 C 220,40 190,35 180,35 Z" fill="#111" opacity="0.9" />
                      <path d="M 210,35 C 240,32 275,35 295,45 L 280,50 C 250,40 220,38 210,35 Z" fill="#222" />
                    </g>
                  )}

                  {/* SIDEPOD */}
                  {!isPreAero && (
                    <g>
                      {isModern || isV10V8 ? (
                        <g>
                          <path d="M 155,50 C 165,42 220,45 250,55 C 270,60 280,65 260,65 L 155,65 C 145,60 145,55 155,50 Z" fill="url(#carbonSide)" stroke="#222" />
                          <path d="M 160,52 C 180,48 220,50 240,58 C 250,62 250,65 240,65 L 160,65 Z" fill={sideColor} opacity="0.9" />
                          {/* Sidepod intake */}
                          <path d="M 155,50 L 165,50 L 155,65 L 150,65 Z" fill="#000" />
                          <path d="M 160,53 L 200,53" stroke={accentColor} strokeWidth="1.5" />
                        </g>
                      ) : (
                        <rect x="160" y="48" width="90" height="17" rx="3" fill="url(#carbonSide)" />
                      )}
                    </g>
                  )}

                  {/* COCKPIT & DRIVER */}
                  <path d="M 145,35 C 150,30 165,30 170,35 L 165,45 L 145,45 Z" fill="#111" />
                  <circle cx="158" cy="36" r="6" fill="#fff" stroke="#e10600" strokeWidth="2" />
                  <path d="M 155,34 L 162,34 L 161,38 L 155,38 Z" fill="#000" /> {/* Visor */}

                  {/* HALO */}
                  {isModern && (
                    <g>
                      <path d="M 148,39 C 160,26 175,39 180,43" stroke="#222" strokeWidth="3" fill="none" />
                      <path d="M 149,38 C 160,25 174,38 179,42" stroke="url(#carbonSide)" strokeWidth="1.5" fill="none" />
                    </g>
                  )}

                  {/* FRONT WING */}
                  {!isPreAero && (
                    <g>
                      {isModern || isV10V8 ? (
                        <g>
                          <path d="M 10,65 C 10,50 30,55 45,65 Z" fill="url(#carbonSide)" />
                          <path d="M 12,60 C 25,55 45,55 55,48 C 45,58 25,62 12,65 Z" fill={accentColor} />
                          <path d="M 15,53 C 25,50 40,50 48,45 C 38,52 25,55 15,58 Z" fill={accentColor} opacity="0.8" />
                          <rect x="8" y="48" width="6" height="17" rx="1" fill={sideColor} stroke="#222" strokeWidth="0.5" />
                          <path d="M 14,48 L 22,48" stroke={accentColor} strokeWidth="1" />
                        </g>
                      ) : (
                        <g>
                          <rect x="15" y="60" width="30" height="5" fill={accentColor} />
                          <rect x="25" y="55" width="20" height="3" fill={accentColor} />
                          <rect x="20" y="55" width="4" height="10" fill={sideColor} />
                        </g>
                      )}
                    </g>
                  )}

                  {/* SUSPENSION (SIDE) */}
                  <line x1="80" y1="55" x2="110" y2="60" stroke="#333" strokeWidth="2" />
                  <line x1="80" y1="65" x2="110" y2="60" stroke="#333" strokeWidth="2" />
                  <line x1="270" y1="55" x2="250" y2="60" stroke="#333" strokeWidth="2" />
                  <line x1="270" y1="65" x2="250" y2="60" stroke="#333" strokeWidth="2" />

                  {/* WHEELS */}
                  <g>
                    {/* Front Wheel */}
                    <circle cx="80" cy="72" r="18" fill="#111" stroke="#222" strokeWidth="4" />
                    <circle cx="80" cy="72" r="16" fill="none" stroke="#333" strokeWidth="1" />
                    <circle cx="80" cy="72" r="8" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
                    <circle cx="80" cy="72" r="2" fill="#e10600" />
                    <path d="M 80,54 A 18 18 0 0 1 98,72" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5" />
                    
                    {/* Rear Wheel */}
                    <circle cx="270" cy="70" r="20" fill="#111" stroke="#222" strokeWidth="5" />
                    <circle cx="270" cy="70" r="18" fill="none" stroke="#333" strokeWidth="1" />
                    <circle cx="270" cy="70" r="9" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
                    <circle cx="270" cy="70" r="2" fill="#e10600" />
                    <path d="M 270,50 A 20 20 0 0 1 290,70" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5" />
                  </g>

                  {/* EXHAUST */}
                  <circle cx="320" cy="58" r="5" fill="url(#exhaustGradSide)" filter="url(#glowSide)" className="animate-pulse" />
                  <line x1="312" y1="58" x2="318" y2="58" stroke="#555" strokeWidth="2" />
                </svg>

                {/* HOTSPOTS */}
                {HOTSPOTS.map(spot => {
                  if (spot.condition === false) return null;
                  return (
                    <div
                      key={spot.id}
                      className="absolute group z-10"
                      style={{ left: `${(spot.x / 400) * 100}%`, top: `${(spot.y / 120) * 100}%` }}
                    >
                      <div className="relative -ml-2 -mt-2 w-4 h-4 flex items-center justify-center cursor-help">
                         <div className="absolute inset-0 bg-f1-red rounded-full opacity-50 hotspot-pulse" />
                         <div className="w-2 h-2 bg-f1-red rounded-full z-10" />
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#111111] text-white text-[10px] p-2 rounded border border-f1-border shadow-lg z-20 text-center">
                        {spot.text}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111111]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {currentView === 'FRONT VIEW' && (
              <div className="relative w-[50%] mx-auto">
                <svg viewBox="0 0 200 160" className="w-full h-auto drop-shadow-2xl">
                  <defs>
                    <linearGradient id="bodyGradFront" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#111" />
                      <stop offset="20%" stopColor={sideColor} />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
                      <stop offset="80%" stopColor={sideColor} />
                      <stop offset="100%" stopColor="#111" />
                    </linearGradient>
                    <linearGradient id="carbonFront" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#222" />
                      <stop offset="100%" stopColor="#050505" />
                    </linearGradient>
                  </defs>

                  {/* REAR WING (Visible in background) */}
                  {!isPreAero && (
                    <g>
                      <path d="M 40,40 Q 100,45 160,40 L 160,50 L 40,50 Z" fill="url(#carbonFront)" />
                      <rect x="40" y="35" width="120" height="5" fill={accentColor} />
                      <rect x="38" y="30" width="4" height="40" fill={sideColor} stroke="#111" strokeWidth="0.5" />
                      <rect x="158" y="30" width="4" height="40" fill={sideColor} stroke="#111" strokeWidth="0.5" />
                    </g>
                  )}

                  {/* REAR WHEELS (Visible in background) */}
                  <rect x="35" y="60" width="30" height="50" rx="4" fill="#050505" opacity="0.8" />
                  <rect x="135" y="60" width="30" height="50" rx="4" fill="#050505" opacity="0.8" />

                  {/* AIRBOX / ROLL HOOP */}
                  <path d="M 85,45 C 90,30 110,30 115,45 L 120,65 L 80,65 Z" fill={sideColor} stroke="#111" strokeWidth="1" />
                  <path d="M 90,45 C 95,40 105,40 110,45 L 110,50 L 90,50 Z" fill="#000" />

                  {/* FRONT SUSPENSION WISHBONES */}
                  <path d="M 70,85 L 30,95 M 70,90 L 30,105" stroke="#444" strokeWidth="2" />
                  <path d="M 130,85 L 170,95 M 130,90 L 170,105" stroke="#444" strokeWidth="2" />

                  {/* FRONT WHEELS */}
                  <g>
                    <rect x="15" y="80" width="35" height="55" rx="5" fill="#111" stroke="#222" strokeWidth="2" />
                    <rect x="150" y="80" width="35" height="55" rx="5" fill="#111" stroke="#222" strokeWidth="2" />
                    <path d="M 25,80 L 25,135 M 35,80 L 35,135" stroke="#050505" strokeWidth="2" />
                    <path d="M 160,80 L 160,135 M 170,80 L 170,135" stroke="#050505" strokeWidth="2" />
                    {/* Wheel aero covers */}
                    {isModern && (
                      <g>
                        <ellipse cx="48" cy="107" rx="3" ry="25" fill="#222" />
                        <ellipse cx="152" cy="107" rx="3" ry="25" fill="#222" />
                      </g>
                    )}
                  </g>
                  
                  {/* SIDEPODS */}
                  {!isPreAero && (
                    <g>
                      <path d="M 60,85 C 50,75 50,70 65,65 C 80,60 120,60 135,65 C 150,70 150,75 140,85 C 135,100 130,110 100,110 C 70,110 65,100 60,85 Z" fill="url(#bodyGradFront)" stroke="#111" strokeWidth="1" />
                      <path d="M 65,75 C 60,70 70,68 80,68 C 85,68 85,75 80,75 C 75,75 65,77 65,75 Z" fill="#000" />
                      <path d="M 135,75 C 140,70 130,68 120,68 C 115,68 115,75 120,75 C 125,75 135,77 135,75 Z" fill="#000" />
                    </g>
                  )}

                  {/* COCKPIT */}
                  <path d="M 85,55 C 80,50 120,50 115,55 L 110,65 L 90,65 Z" fill="#111" />
                  {/* Helmet */}
                  <circle cx="100" cy="58" r="6" fill="#fff" stroke="#e10600" strokeWidth="1" />
                  
                  {/* HALO */}
                  {isModern && (
                    <g>
                      <path d="M 85,65 C 90,52 110,52 115,65" stroke="#222" strokeWidth="3" fill="none" />
                      <line x1="100" y1="52" x2="100" y2="65" stroke="#222" strokeWidth="2.5" />
                    </g>
                  )}
                  
                  {/* NOSE CONE */}
                  <path d="M 92,65 L 108,65 L 105,120 L 95,120 Z" fill="url(#bodyGradFront)" stroke="#111" strokeWidth="0.5" />
                  
                  {/* FRONT WING */}
                  {!isPreAero && (
                    <g>
                      {/* Main planes swept up */}
                      <path d="M 15,115 C 40,125 70,120 95,115 L 105,115 C 130,120 160,125 185,115 L 185,130 C 160,135 130,130 105,125 L 95,125 C 70,130 40,135 15,130 Z" fill="url(#carbonFront)" stroke="#333" strokeWidth="1" />
                      {/* Flaps */}
                      <path d="M 20,110 C 45,120 70,115 95,110 L 95,112 C 70,117 45,122 20,112 Z" fill={accentColor} />
                      <path d="M 180,110 C 155,120 130,115 105,110 L 105,112 C 130,117 155,122 180,112 Z" fill={accentColor} />
                      {/* Endplates */}
                      <path d="M 10,105 L 15,105 L 18,135 L 10,135 Z" fill={sideColor} stroke="#111" strokeWidth="0.5" />
                      <path d="M 190,105 L 185,105 L 182,135 L 190,135 Z" fill={sideColor} stroke="#111" strokeWidth="0.5" />
                    </g>
                  )}
                </svg>
              </div>
            )}

            {currentView === 'REAR VIEW' && (
              <div className="relative w-[50%] mx-auto">
                <svg viewBox="0 0 200 160" className="w-full h-auto drop-shadow-2xl">
                  <defs>
                    <linearGradient id="bodyGradRear" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#111" />
                      <stop offset="20%" stopColor={sideColor} />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
                      <stop offset="80%" stopColor={sideColor} />
                      <stop offset="100%" stopColor="#111" />
                    </linearGradient>
                    <linearGradient id="carbonRear" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#222" />
                      <stop offset="100%" stopColor="#050505" />
                    </linearGradient>
                    <radialGradient id="exhaustGlowRear">
                      <stop offset="0%" stopColor="#ff4400" />
                      <stop offset="50%" stopColor="#ff0000" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  {/* FRONT WING (Visible in background) */}
                  {!isPreAero && (
                    <g opacity="0.5">
                      <path d="M 20,130 L 180,130 L 175,135 L 25,135 Z" fill="url(#carbonRear)" />
                    </g>
                  )}

                  {/* FRONT WHEELS (Visible in background) */}
                  <rect x="25" y="80" width="25" height="40" rx="3" fill="#050505" opacity="0.6" />
                  <rect x="150" y="80" width="25" height="40" rx="3" fill="#050505" opacity="0.6" />

                  {/* REAR SUSPENSION WISHBONES */}
                  <path d="M 70,85 L 25,95 M 70,95 L 25,110" stroke="#444" strokeWidth="2" />
                  <path d="M 130,85 L 175,95 M 130,95 L 175,110" stroke="#444" strokeWidth="2" />

                  {/* REAR WHEELS */}
                  <g>
                    <rect x="10" y="75" width="40" height="65" rx="5" fill="#111" stroke="#222" strokeWidth="2" />
                    <rect x="150" y="75" width="40" height="65" rx="5" fill="#111" stroke="#222" strokeWidth="2" />
                    <path d="M 25,75 L 25,140 M 35,75 L 35,140" stroke="#050505" strokeWidth="2" />
                    <path d="M 165,75 L 165,140 M 175,75 L 175,140" stroke="#050505" strokeWidth="2" />
                    {/* Wet tire grooves if wanted, or slicks */}
                  </g>
                  
                  {/* FLOOR & DIFFUSER */}
                  <path d="M 40,130 L 160,130 L 165,140 L 35,140 Z" fill="url(#carbonRear)" />
                  <g stroke="#111" strokeWidth="2">
                    <path d="M 60,130 L 60,145 M 80,125 L 80,145 M 120,125 L 120,145 M 140,130 L 140,145" />
                  </g>

                  {/* SIDEPODS & COKE BOTTLE (Tapering to rear) */}
                  <path d="M 60,85 C 70,75 80,70 100,70 C 120,70 130,75 140,85 C 145,100 140,120 100,120 C 60,120 55,100 60,85 Z" fill="url(#bodyGradRear)" stroke="#111" strokeWidth="1" />
                  
                  {/* ENGINE COVER */}
                  <path d="M 90,40 C 95,25 105,25 110,40 L 115,75 L 85,75 Z" fill={sideColor} stroke="#111" strokeWidth="1" />

                  {/* EXHAUST */}
                  <circle cx="100" cy="100" r="15" fill="url(#exhaustGlowRear)" className="animate-pulse" />
                  <circle cx="100" cy="100" r="8" fill="#111" stroke="#333" strokeWidth="2" />
                  <circle cx="100" cy="100" r="5" fill="#ff4400" />

                  {/* REAR WING */}
                  {!isPreAero && (
                    <g>
                      {/* Endplates */}
                      <path d="M 25,30 L 30,30 L 35,80 L 25,75 Z" fill={sideColor} stroke="#111" strokeWidth="0.5" />
                      <path d="M 175,30 L 170,30 L 165,80 L 175,75 Z" fill={sideColor} stroke="#111" strokeWidth="0.5" />
                      {/* Main Planes */}
                      <path d="M 30,45 Q 100,55 170,45 L 168,60 Q 100,70 32,60 Z" fill="url(#carbonRear)" stroke="#333" strokeWidth="1" />
                      {/* DRS Flap */}
                      <path d="M 30,35 Q 100,45 170,35 L 169,42 Q 100,52 31,42 Z" fill={accentColor} />
                      {/* Actuator */}
                      <rect x="96" y="32" width="8" height="15" rx="2" fill="#222" />
                    </g>
                  )}
                </svg>
              </div>
            )}

            {currentView === 'TOP VIEW' && (
              <div className="relative w-[80%] mx-auto">
                <svg viewBox="0 0 400 140" className="w-full h-auto drop-shadow-2xl">
                  <defs>
                    <linearGradient id="bodyGradTop" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#111" />
                      <stop offset="20%" stopColor={sideColor} />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
                      <stop offset="80%" stopColor={sideColor} />
                      <stop offset="100%" stopColor="#111" />
                    </linearGradient>
                    <linearGradient id="carbonTop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#222" />
                      <stop offset="50%" stopColor="#050505" />
                      <stop offset="100%" stopColor="#222" />
                    </linearGradient>
                  </defs>

                  {/* SUSPENSION ARMS */}
                  <g stroke="#333" strokeWidth="2">
                    <path d="M 90,45 L 150,60 M 90,55 L 145,65 M 90,85 L 150,80 M 90,95 L 145,75" />
                    <path d="M 285,40 L 250,60 M 285,50 L 250,65 M 285,100 L 250,80 M 285,90 L 250,75" />
                  </g>

                  {/* WHEELS */}
                  <g>
                    <rect x="65" y="30" width="30" height="20" rx="3" fill="#111" stroke="#222" strokeWidth="1" />
                    <rect x="65" y="90" width="30" height="20" rx="3" fill="#111" stroke="#222" strokeWidth="1" />
                    <rect x="280" y="25" width="35" height="25" rx="3" fill="#111" stroke="#222" strokeWidth="1" />
                    <rect x="280" y="90" width="35" height="25" rx="3" fill="#111" stroke="#222" strokeWidth="1" />
                  </g>

                  {/* FLOOR */}
                  {!isPreAero && (
                    <path d="M 120,40 C 140,25 240,25 270,40 C 290,40 310,45 320,55 L 320,85 C 310,95 290,100 270,100 C 240,115 140,115 120,100 C 100,100 90,95 80,90 L 80,50 C 90,45 100,40 120,40 Z" fill="url(#carbonTop)" stroke="#111" strokeWidth="1" />
                  )}

                  {/* FRONT WING */}
                  {!isPreAero && (
                    <g>
                      <path d="M 20,55 C 50,45 80,50 90,55 L 90,85 C 80,90 50,95 20,85 Z" fill="url(#carbonTop)" stroke="#333" strokeWidth="1" />
                      <path d="M 25,58 C 45,52 65,55 75,58 L 75,82 C 65,85 45,88 25,82 Z" fill={accentColor} />
                      <rect x="15" y="50" width="5" height="40" rx="1" fill={sideColor} />
                    </g>
                  )}

                  {/* REAR WING */}
                  {!isPreAero && (
                    <g>
                      <rect x="310" y="45" width="20" height="50" fill={accentColor} stroke="#222" strokeWidth="0.5" />
                      <rect x="325" y="48" width="5" height="44" fill={sideColor} />
                      <rect x="305" y="43" width="30" height="4" fill={sideColor} />
                      <rect x="305" y="93" width="30" height="4" fill={sideColor} />
                    </g>
                  )}

                  {/* SIDEPODS (Coke Bottle) */}
                  {!isPreAero && (
                    <g>
                      <path d="M 150,45 C 180,30 230,30 260,50 C 270,55 270,60 250,65 L 160,65 C 150,60 145,55 150,45 Z" fill={sideColor} stroke="#111" strokeWidth="0.5" opacity="0.95" />
                      <path d="M 150,95 C 180,110 230,110 260,90 C 270,85 270,80 250,75 L 160,75 C 150,80 145,85 150,95 Z" fill={sideColor} stroke="#111" strokeWidth="0.5" opacity="0.95" />
                      {/* Louvres */}
                      <g stroke="#111" strokeWidth="1" fill="none">
                        <path d="M 180,42 Q 200,45 220,42 M 185,45 Q 200,48 215,45 M 190,48 Q 200,51 210,48" />
                        <path d="M 180,98 Q 200,95 220,98 M 185,95 Q 200,92 215,95 M 190,92 Q 200,89 210,92" />
                      </g>
                    </g>
                  )}

                  {/* MAIN BODY (Nose to engine) */}
                  {isPreAero ? (
                    <path d="M 20,70 C 60,50 140,45 220,50 C 280,55 310,65 310,70 C 310,75 280,85 220,90 C 140,95 60,90 20,70 Z" fill="url(#bodyGradTop)" stroke="#222" strokeWidth="1" />
                  ) : (
                    <g>
                      <path d={`M 25,70 C 50,65 100,60 160,55 C 220,50 260,55 285,65 L 285,75 C 260,85 220,90 160,85 C 100,80 50,75 25,70 Z`} fill="url(#bodyGradTop)" stroke="#111" strokeWidth="0.5" />
                      <line x1="25" y1="70" x2="140" y2="70" stroke={accentColor} strokeWidth="1" />
                    </g>
                  )}
                  
                  {/* COCKPIT */}
                  <ellipse cx="160" cy="70" rx="18" ry="10" fill="#000" stroke="#333" strokeWidth="2" />
                  <circle cx="155" cy="70" r="6" fill="#fff" stroke="#e10600" strokeWidth="1" />

                  {/* HALO */}
                  {isModern && (
                    <g>
                      <path d="M 155,70 L 165,70 M 165,70 C 170,62 155,58 145,62 M 165,70 C 170,78 155,82 145,78" stroke="#333" strokeWidth="2.5" fill="none" />
                    </g>
                  )}

                  {/* EXHAUST */}
                  <circle cx="295" cy="70" r="4" fill="#000" stroke="#555" strokeWidth="1" />
                </svg>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* INTERACTIVE LIVERY COLORS */}
      <div className="mt-8 flex justify-center items-center gap-6 p-4 bg-f1-panel border border-f1-border rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-f1-muted uppercase">Primary</span>
          <input 
            type="color" 
            value={sideColor} 
            onChange={(e) => setSideColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-f1-muted uppercase">Accent</span>
          <input 
            type="color" 
            value={accentColor} 
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
          />
        </div>
        <button 
          onClick={() => {
            setSideColor(car.sideViewColor || car.modelConfig?.bodyColor || '#e10600');
            setAccentColor(car.accentColor || car.modelConfig?.accentColor || '#ffffff');
          }}
          className="ml-4 text-[10px] font-bold text-f1-red uppercase hover:underline"
        >
          Reset Colors
        </button>
      </div>
    </div>
  );
};

export default CarViewer2D;
