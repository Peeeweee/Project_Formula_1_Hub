import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RaceControlVisualizer = ({ phase, term }) => {
  const isFlag = ['VSC', 'Safety Car', 'Blue Flag', 'Jump Start'].includes(term);
  const isTiming = ['Purple Sector', 'Delta Time', 'DNF', 'Parc Fermé'].includes(term);

  // Digital FIA Light Panel (Marshaling panel)
  const LightPanel = ({ type, blinking }) => {
    let bgColor = '#111';
    let textColor = '#222';
    let text = '';
    
    if (type === 'VSC') { bgColor = '#ffd300'; textColor = '#000'; text = 'VSC'; }
    if (type === 'Safety Car') { bgColor = '#ffd300'; textColor = '#000'; text = 'SC'; }
    if (type === 'Blue Flag') { bgColor = '#007aff'; textColor = '#fff'; }
    
    return (
      <div className="bg-black p-2 border-4 border-gray-800 rounded-xl shadow-2xl relative">
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 blur-xl z-0" 
          style={{ backgroundColor: bgColor }}
          animate={{ opacity: blinking ? [0.2, 0.8, 0.2] : 0.8 }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
        {/* Panel surface */}
        <div className="w-32 h-32 bg-[#111] grid grid-cols-8 grid-rows-8 gap-0.5 relative z-10 p-1 rounded-lg border border-white/10">
          {Array.from({ length: 64 }).map((_, i) => {
            const isBlueFlag = type === 'Blue Flag';
            // Simple blue flag pattern
            const isBlue = isBlueFlag && (i < 32 || i % 8 < 4); 
            
            return (
              <motion.div 
                key={i} 
                className="rounded-[1px]"
                animate={{ 
                  backgroundColor: blinking 
                    ? [isBlue ? '#007aff' : bgColor, '#111', isBlue ? '#007aff' : bgColor] 
                    : (isBlue ? '#007aff' : bgColor) 
                }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
            );
          })}
          {text && (
            <div className="absolute inset-0 flex items-center justify-center font-black text-5xl tracking-tighter mix-blend-multiply" style={{ color: textColor }}>
              {text}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Realistic F1 Steering Wheel Dash
  const SteeringWheelDash = () => {
    const rpmLeds = Array.from({ length: 15 }).map((_, i) => {
      let color = i < 5 ? '#00a650' : i < 10 ? '#e10600' : '#007aff';
      return (
        <motion.div 
          key={i} className="w-3 h-3 rounded-full border border-black/50"
          style={{ backgroundColor: '#111', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}
          animate={{ 
            backgroundColor: phase === 'demonstration' || phase === 'result' 
              ? (i < (phase === 'result' && term === 'Purple Sector' ? 15 : 10) ? color : '#111') 
              : '#111',
            boxShadow: phase === 'demonstration' || phase === 'result'
              ? (i < (phase === 'result' && term === 'Purple Sector' ? 15 : 10) ? `0 0 8px ${color}` : 'none')
              : 'none'
          }}
        />
      );
    });

    return (
      <div className="bg-[#1a1a1a] p-4 rounded-2xl shadow-2xl border-t-4 border-[#333] flex flex-col items-center relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle, #2a2a2a 1px, transparent 1px)', backgroundSize: '4px 4px' }}>
        {/* Faux Carbon Fiber texture */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #111 25%, #111 75%, #000 75%, #000)', backgroundPosition: '0 0, 2px 2px', backgroundSize: '4px 4px' }} />
        
        {/* RPM LEDs */}
        <div className="flex gap-1 mb-4 bg-black/50 p-2 rounded-full border border-white/5 relative z-10">
          {rpmLeds}
        </div>

        {/* LCD Screen */}
        <div className="w-64 h-36 bg-[#0a0f1a] border-[8px] border-[#05080f] rounded-lg p-3 relative z-10 flex flex-col justify-between shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start text-gray-500 text-[10px] font-mono font-bold tracking-widest">
            <span>LAP 42/50</span>
            <span>BBIAS 56.0</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center font-mono">
            {term === 'Purple Sector' && (
              <>
                <div className="text-gray-400 text-xs mb-1">SECTOR 1</div>
                <motion.div className="text-4xl font-black tracking-tighter"
                  animate={{ 
                    color: phase === 'result' ? '#b800ff' : phase === 'demonstration' ? '#00a650' : '#fff',
                    scale: phase === 'result' ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  28.452
                </motion.div>
              </>
            )}

            {term === 'Delta Time' && (
              <>
                <div className="text-gray-400 text-xs mb-1">DELTA VSC</div>
                <motion.div className="text-4xl font-black tracking-tighter"
                  animate={{ color: phase === 'demonstration' || phase === 'result' ? '#00a650' : '#e10600' }}
                >
                  {phase === 'action' ? '+0.450' : '-0.125'}
                </motion.div>
              </>
            )}

            {term === 'DNF' && (
              <motion.div className="text-4xl font-black tracking-tighter text-[#e10600]">
                {phase === 'action' ? 'SLOW P' : 'ENG FAIL'}
              </motion.div>
            )}

            {term === 'Parc Fermé' && (
              <motion.div className="text-3xl font-black tracking-tighter text-[#ffd300]">
                {phase === 'result' ? 'PARC FERMÉ' : 'GARAGE'}
              </motion.div>
            )}
          </div>

          <div className="flex justify-between items-end">
            <div className="text-white text-2xl font-black">7</div>
            <div className="text-white font-mono font-bold text-lg">295 <span className="text-[10px] text-gray-500">KMH</span></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-72 bg-[#0a0a0f] rounded-lg overflow-hidden relative flex items-center justify-center border border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

      {/* Starting Lights (Jump Start) */}
      {term === 'Jump Start' && (
        <div className="flex gap-4 bg-[#111] p-6 rounded-2xl border-4 border-[#222] shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative z-10">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col gap-2 bg-black p-2 rounded-lg border border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#111] shadow-inner" />
              <motion.div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: '#111' }}
                animate={{ 
                  backgroundColor: phase === 'action' || phase === 'demonstration' ? '#e10600' : '#111',
                  boxShadow: phase === 'action' || phase === 'demonstration' ? '0 0 20px #e10600' : 'none'
                }}
                transition={{ delay: phase === 'action' ? i * 0.2 : 0 }}
              />
            </div>
          ))}
          {/* Jump start car passing early */}
          <motion.div 
            className="absolute -bottom-16 w-16 h-4 bg-white rounded-full blur-sm"
            initial={{ left: -100 }}
            animate={{ left: phase === 'demonstration' || phase === 'result' ? 400 : -100 }}
            transition={{ duration: 0.5, delay: phase === 'demonstration' ? 0.2 : 0 }}
          />
        </div>
      )}

      {/* Marshaling Light Panels */}
      {isFlag && term !== 'Jump Start' && (
        <div className="relative z-10 flex flex-col items-center gap-6">
          <LightPanel type={term} blinking={phase === 'action' || phase === 'demonstration'} />
          
          {/* Motion blur car passing by */}
          <div className="absolute -bottom-10 w-[400px] h-8 overflow-hidden pointer-events-none">
            <motion.div 
              className="w-32 h-2 bg-white/50 rounded-full blur-md"
              initial={{ x: -200 }}
              animate={{ x: 500 }}
              transition={{ repeat: Infinity, duration: term === 'Safety Car' || term === 'VSC' ? 2 : 0.8 }}
            />
          </div>
        </div>
      )}

      {/* Steering Wheel Dash */}
      {isTiming && (
        <div className="relative z-10">
          <SteeringWheelDash />
        </div>
      )}
      
    </div>
  );
};

export default RaceControlVisualizer;
