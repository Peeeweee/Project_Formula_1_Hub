import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import StrategyVisualizer from './animations/StrategyVisualizer';
import CarPhysicsVisualizer from './animations/CarPhysicsVisualizer';
import TireVisualizer from './animations/TireVisualizer';
import RaceControlVisualizer from './animations/RaceControlVisualizer';

const PHASES = ['action', 'demonstration', 'result'];
const PHASE_DURATIONS = { action: 2000, demonstration: 2500, result: 3500 };

const GlossaryModal = ({ termData, onClose }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!termData) return;
    
    // Auto-play sequencer
    const currentPhase = PHASES[phaseIndex];
    const duration = PHASE_DURATIONS[currentPhase];
    
    const timer = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [phaseIndex, termData]);

  if (!termData) return null;

  const currentPhase = PHASES[phaseIndex];

  const renderEngine = () => {
    const props = { phase: currentPhase, term: termData.term };
    switch (termData.engine) {
      case 'strategy': return <StrategyVisualizer {...props} />;
      case 'car_physics': return <CarPhysicsVisualizer {...props} />;
      case 'tire_physics': return <TireVisualizer {...props} />;
      case 'race_control': return <RaceControlVisualizer {...props} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{termData.term}</h2>
              <p className="text-gray-400 text-sm mt-1">{termData.definition}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Animation Viewport */}
          <div className="p-6 bg-black relative">
            {renderEngine()}
            
            {/* Phase Indicators */}
            <div className="absolute top-8 left-8 flex gap-2">
              {PHASES.map((p, idx) => (
                <div key={p} className="flex flex-col items-center gap-1">
                  <div className={`h-1 w-12 rounded-full transition-colors duration-500 ${idx <= phaseIndex ? 'bg-[#e10600]' : 'bg-gray-800'}`} />
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${idx === phaseIndex ? 'text-white' : 'text-gray-600'}`}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Narration Footer */}
          <div className="p-6 bg-[#1a1a1a] min-h-[120px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg text-center text-gray-200 font-medium"
              >
                {termData[currentPhase]}
              </motion.p>
            </AnimatePresence>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlossaryModal;
