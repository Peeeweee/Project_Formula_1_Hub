import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const StartingLights = () => {
  const [lightsOn, setLightsOn] = useState(0);
  const [lightsOut, setLightsOut] = useState(false);

  useEffect(() => {
    // Sequence: 1, 2, 3, 4, 5, OUT
    const sequence = async () => {
      for (let i = 1; i <= 5; i++) {
        await new Promise(r => setTimeout(r, 600)); // 600ms between lights
        setLightsOn(i);
      }
      // Wait a random duration between 0.2s and 1.5s for lights out
      await new Promise(r => setTimeout(r, 200 + Math.random() * 1300));
      setLightsOut(true);
    };
    sequence();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-[#0a0a0f] rounded-lg border border-f1-border">
      <div className="flex gap-4 p-6 bg-[#1a1a24] rounded-lg shadow-2xl border-t-4 border-[#000]">
        {[1, 2, 3, 4, 5].map((lightIndex) => (
          <div key={lightIndex} className="flex flex-col gap-2">
            {/* Top light (usually red in modern F1 starting gantries) */}
            <div 
              className={`w-12 h-12 rounded-full border-4 ${
                lightsOut 
                  ? 'bg-[#111] border-[#222] shadow-inner' 
                  : lightsOn >= lightIndex 
                    ? 'bg-f1-red border-red-400 shadow-[0_0_20px_#e10600]' 
                    : 'bg-[#333] border-[#222]'
              } transition-colors duration-75`}
            />
            {/* Bottom light */}
            <div 
              className={`w-12 h-12 rounded-full border-4 ${
                lightsOut 
                  ? 'bg-[#111] border-[#222] shadow-inner' 
                  : lightsOn >= lightIndex 
                    ? 'bg-f1-red border-red-400 shadow-[0_0_20px_#e10600]' 
                    : 'bg-[#333] border-[#222]'
              } transition-colors duration-75`}
            />
          </div>
        ))}
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-f1-light font-black uppercase tracking-widest text-lg"
      >
        {lightsOut ? (
          <span className="text-green-500 animate-pulse">Lights out and away we go!</span>
        ) : (
          <span className="text-f1-muted">Initializing telemetry...</span>
        )}
      </motion.p>
    </div>
  );
};

export default StartingLights;
