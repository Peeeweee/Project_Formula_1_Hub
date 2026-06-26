import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RPMGauge = ({ driverId }) => {
  const [rpm, setRpm] = useState(0);
  
  useEffect(() => {
    // Reset RPM to 0 when a new driver is loaded
    setRpm(0);
    
    // Animate RPM revving up
    let timeout1, timeout2, timeout3;
    
    // Initial rev
    timeout1 = setTimeout(() => setRpm(65), 300);
    // Downshift/Dip
    timeout2 = setTimeout(() => setRpm(45), 700);
    // Final high rev
    timeout3 = setTimeout(() => setRpm(85 + Math.random() * 10), 1000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [driverId]);

  // Calculate SVG stroke dash array for a semi-circle gauge
  const radius = 40;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (rpm / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#0a0a0f] border border-f1-border rounded-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-f1-red/10 to-transparent pointer-events-none" />
      
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Background track */}
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="#1a1a24"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Active RPM fill */}
          <motion.path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="#e10600"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
          />
        </svg>
        <div className="absolute bottom-0 left-0 w-full text-center flex flex-col items-center">
          <span className="text-xl font-black text-f1-light leading-none">{Math.round((rpm / 100) * 12000).toLocaleString()}</span>
          <span className="text-[8px] text-f1-muted font-bold tracking-widest">RPM</span>
        </div>
      </div>
      
      {/* Shift lights */}
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4, 5, 6, 7].map(i => {
          const threshold = i * 14.2; // roughly 100 / 7
          const isLit = rpm >= threshold;
          let colorClass = 'bg-[#222]';
          if (isLit) {
            if (i <= 3) colorClass = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
            else if (i <= 5) colorClass = 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
            else colorClass = 'bg-f1-red shadow-[0_0_8px_#e10600]';
          }
          
          return (
            <div 
              key={i} 
              className={`w-3 h-1.5 rounded-sm transition-colors duration-150 ${colorClass}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RPMGauge;
