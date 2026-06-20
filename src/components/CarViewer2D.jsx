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
                <svg viewBox="0 0 400 120" className="w-full h-auto drop-shadow-xl">
                  <defs>
                    <radialGradient id="exhaustGradSide">
                      <stop offset="0%" stopColor="#ff4400" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  {/* SPEED LINES */}
                  <line x1="320" y1="50" x2="390" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="320" y1="55" x2="390" y2="55" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="320" y1="60" x2="390" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                  {/* REAR WING */}
                  {!isPreAero && (
                    <g>
                      {isWings ? (
                        <g>
                          <rect x="310" y="20" width="3" height="40" fill={sideColor} />
                          <rect x="298" y="20" width="28" height="5" fill={accentColor} />
                          <rect x="298" y="20" width="3" height="40" fill={sideColor} />
                        </g>
                      ) : isModern ? (
                        <g>
                          <rect x="310" y="30" width="5" height="25" fill={sideColor} />
                          <rect x="295" y="25" width="35" height="5" fill={accentColor} />
                          <rect x="295" y="32" width="35" height="4" fill={accentColor} />
                          <rect x="295" y="25" width="4" height="35" fill={sideColor} />
                        </g>
                      ) : (
                        <g>
                          <rect x="310" y="30" width="5" height="25" fill={sideColor} />
                          <rect x="298" y="30" width="28" height="5" fill={accentColor} />
                          <rect x="298" y="30" width="3" height="30" fill={sideColor} />
                        </g>
                      )}
                    </g>
                  )}

                  {/* BODY & NOSE */}
                  {isTurbo ? (
                    <polygon points="60,55 80,45 200,42 240,45 300,48 320,58 300,65 60,65" fill={sideColor} />
                  ) : isPreAero ? (
                    <path d="M 60 55 Q 80 40 200 38 L 300 45 Q 320 55 300 65 L 60 65 Z" fill={sideColor} />
                  ) : (
                    <polygon points="60,55 80,40 200,38 240,42 300,45 320,55 300,65 60,65" fill={sideColor} />
                  )}
                  <polygon points={`20,${52 + noseYOffset} 60,45 60,65`} fill={sideColor} />

                  {/* SIDEPOD */}
                  {isWings ? (
                    <rect x="180" y="52" width="60" height="13" rx="4" fill={sideColor} opacity="0.85" />
                  ) : isTurbo ? (
                    <rect x="170" y="45" width="100" height="20" rx="4" fill={sideColor} opacity="0.85" />
                  ) : isModern ? (
                    <path d="M 180 55 L 260 55 Q 280 55 280 65 L 190 65 Q 180 65 180 55 Z" fill={sideColor} opacity="0.85" />
                  ) : (
                    <rect x="180" y="48" width="100" height="17" rx="4" fill={sideColor} opacity="0.85" />
                  )}

                  {/* COCKPIT */}
                  <rect x="155" y="35" width="55" height="20" rx="4" fill="#111111" />
                  <polygon points="160,35 165,28 175,28 170,35" fill="rgba(100,200,255,0.3)" />

                  {/* HALO */}
                  {isModern && (
                    <path d="M 160 38 Q 175 25 190 38" stroke="#cccccc" strokeWidth="2.5" fill="none" />
                  )}

                  {/* FRONT WING */}
                  {isPreAero ? (
                    <rect x="40" y="65" width="20" height="3" fill={accentColor} />
                  ) : isModern ? (
                    <g>
                      <rect x="5" y="65" width="70" height="5" fill={accentColor} />
                      <rect x="5" y="60" width="3" height="15" fill={accentColor} />
                      <rect x="72" y="60" width="3" height="15" fill={accentColor} />
                    </g>
                  ) : isV10V8 ? (
                    <g>
                      <rect x="22" y="65" width="55" height="5" fill={accentColor} />
                      <rect x="22" y="60" width="55" height="2" fill={accentColor} />
                      <rect x="22" y="58" width="3" height="15" fill={accentColor} />
                      <rect x="74" y="58" width="3" height="15" fill={accentColor} />
                    </g>
                  ) : (
                    <g>
                      <rect x="22" y="65" width="55" height="5" fill={accentColor} />
                      <rect x="22" y="60" width="3" height="15" fill={accentColor} />
                      <rect x="74" y="60" width="3" height="15" fill={accentColor} />
                    </g>
                  )}

                  {/* FLOOR LINE */}
                  <line x1="60" y1="70" x2="310" y2="70" stroke="#333333" strokeWidth="1" />

                  {/* WHEELS */}
                  <circle cx="95" cy="75" r="18" fill="#1a1a1a" stroke="#333" />
                  <circle cx="95" cy="75" r="8" fill="#2a2a2a" />
                  {[0, 72, 144, 216, 288].map(deg => (
                    <line key={`fw-${deg}`} x1="95" y1="75" x2={95 + 18 * Math.cos(deg * Math.PI / 180)} y2={75 + 18 * Math.sin(deg * Math.PI / 180)} stroke="#444" strokeWidth="1.5" />
                  ))}

                  <circle cx="285" cy="75" r="20" fill="#1a1a1a" stroke="#333" />
                  <circle cx="285" cy="75" r="9" fill="#2a2a2a" />
                  {[0, 72, 144, 216, 288].map(deg => (
                    <line key={`rw-${deg}`} x1="285" y1="75" x2={285 + 20 * Math.cos(deg * Math.PI / 180)} y2={75 + 20 * Math.sin(deg * Math.PI / 180)} stroke="#444" strokeWidth="1.5" />
                  ))}

                  {/* EXHAUST */}
                  <circle cx="320" cy="58" r="4" fill="url(#exhaustGradSide)" />
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
                  {/* WHEELS */}
                  <ellipse cx="30" cy="120" rx="22" ry="12" fill="#1a1a1a" />
                  <ellipse cx="170" cy="120" rx="22" ry="12" fill="#1a1a1a" />
                  
                  {/* SIDEPODS */}
                  <rect x="40" y="70" width="45" height="35" fill={sideColor} opacity="0.9" />
                  <rect x="115" y="70" width="45" height="35" fill={sideColor} opacity="0.9" />
                  
                  {/* FRONT WING */}
                  <rect x="10" y="108" width="180" height="8" fill={accentColor} />
                  <rect x="10" y="95" width="2" height="22" fill={accentColor} />
                  <rect x="188" y="95" width="2" height="22" fill={accentColor} />
                  
                  {/* NOSE */}
                  <polygon points="85,108 115,108 100,140" fill={sideColor} />
                  
                  {/* BODY CENTER */}
                  <rect x="85" y="50" width="30" height="60" fill={sideColor} />
                  
                  {/* COCKPIT */}
                  <rect x="82" y="38" width="36" height="18" fill="#111111" />
                  
                  {/* HALO */}
                  {isModern && <path d="M 82 48 Q 100 30 118 48" stroke="#cccccc" strokeWidth="2.5" fill="none" />}
                </svg>
              </div>
            )}

            {currentView === 'REAR VIEW' && (
              <div className="relative w-[50%] mx-auto">
                <svg viewBox="0 0 200 160" className="w-full h-auto drop-shadow-2xl">
                  {/* WHEELS */}
                  <ellipse cx="30" cy="120" rx="22" ry="12" fill="#1a1a1a" />
                  <ellipse cx="170" cy="120" rx="22" ry="12" fill="#1a1a1a" />
                  
                  {/* SIDEPODS */}
                  <rect x="40" y="70" width="45" height="35" fill={sideColor} opacity="0.9" />
                  <rect x="115" y="70" width="45" height="35" fill={sideColor} opacity="0.9" />

                  {/* BODY */}
                  <rect x="85" y="50" width="30" height="60" fill={sideColor} />

                  {/* REAR WING */}
                  {!isPreAero && (
                    <g>
                      <rect x="20" y="30" width="160" height="8" fill={accentColor} />
                      <rect x="30" y="50" width="140" height="6" fill={sideColor} />
                      <rect x="20" y="30" width="3" height="40" fill={sideColor} />
                      <rect x="177" y="30" width="3" height="40" fill={sideColor} />
                    </g>
                  )}

                  {/* DIFFUSER */}
                  <polygon points="70,135 130,135 140,150 60,150" fill="#111111" stroke="#333" />
                  
                  {/* EXHAUST */}
                  <defs>
                    <radialGradient id="exhaustGrad">
                      <stop offset="0%" stopColor="#ff4400" />
                      <stop offset="100%" stopColor="#000000" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="75" r="8" fill="url(#exhaustGrad)" />
                </svg>
              </div>
            )}

            {currentView === 'TOP VIEW' && (
              <div className="relative w-[80%] mx-auto">
                <svg viewBox="0 0 400 140" className="w-full h-auto drop-shadow-2xl">
                  {/* WHEELS */}
                  <rect x="60" y="34" width="28" height="15" rx="4" fill="#1a1a1a" />
                  <rect x="60" y="91" width="28" height="15" rx="4" fill="#1a1a1a" />
                  <rect x="290" y="30" width="30" height="18" rx="4" fill="#1a1a1a" />
                  <rect x="290" y="92" width="30" height="18" rx="4" fill="#1a1a1a" />
                  
                  {/* SUSPENSION ARMS */}
                  <line x1="88" y1="41" x2="160" y2="60" stroke="#333" strokeWidth="2" />
                  <line x1="88" y1="98" x2="160" y2="80" stroke="#333" strokeWidth="2" />
                  <line x1="290" y1="39" x2="240" y2="60" stroke="#333" strokeWidth="2" />
                  <line x1="290" y1="101" x2="240" y2="80" stroke="#333" strokeWidth="2" />

                  {/* FRONT WING */}
                  <rect x="20" y="58" width="80" height="24" fill={accentColor} />

                  {/* REAR WING */}
                  {!isPreAero && <rect x="305" y="55" width="75" height="30" fill={accentColor} />}

                  {/* SIDEPODS */}
                  <ellipse cx="195" cy="48" rx="60" ry="14" fill={sideColor} opacity="0.85" />
                  <ellipse cx="195" cy="92" rx="60" ry="14" fill={sideColor} opacity="0.85" />

                  {/* MAIN BODY */}
                  <ellipse cx="200" cy="70" rx="160" ry="22" fill={sideColor} />
                  
                  {/* COCKPIT */}
                  <ellipse cx="185" cy="70" rx="25" ry="12" fill="#111111" />
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
