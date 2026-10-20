import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import useDialogAccessibility from '../hooks/useDialogAccessibility';
import { X } from 'lucide-react';
import StrategyVisualizer from './animations/StrategyVisualizer';
import CarPhysicsVisualizer from './animations/CarPhysicsVisualizer';
import TireVisualizer from './animations/TireVisualizer';
import RaceControlVisualizer from './animations/RaceControlVisualizer';

const PHASES = ['action', 'demonstration', 'result'];
const PHASE_DURATIONS = { action: 2000, demonstration: 2500, result: 3500 };

const GlossaryModal = ({ termData, onClose }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const dialogRef = useDialogAccessibility(Boolean(termData), onClose);

  useEffect(() => {
    if (!termData || reducedMotion) return;
    
    // Auto-play sequencer
    const currentPhase = PHASES[phaseIndex];
    const duration = PHASE_DURATIONS[currentPhase];
    
    const timer = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [phaseIndex, termData, reducedMotion]);

  if (!termData) return null;

  const currentPhase = PHASES[phaseIndex];

  const renderEngine = () => {
    const props = { phase: currentPhase, term: termData.term };
    switch (termData.engine) {
      case 'strategy': return <StrategyVisualizer {...props} />;
      case 'car_physics': return <CarPhysicsVisualizer {...props} />;
      case 'tire_physics': return <TireVisualizer {...props} />;
      case 'race_control': return <RaceControlVisualizer {...props} />;
      default: return <div className="min-h-64 flex items-center justify-center rounded-xl border border-f1-border bg-f1-dark p-6"><div className="text-center"><p className="text-xs uppercase tracking-widest text-f1-red">{termData.era}</p><h3 className="mt-3 text-2xl font-black text-white">{termData.term}</h3><p className="mt-3 text-sm text-f1-muted">Use the three steps below to follow the idea. This is a simplified explanation, not a physical simulation.</p></div></div>;
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
          ref={dialogRef} role="dialog" aria-modal="true" aria-label={termData.term} tabIndex={-1}
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
              <p className="text-xs font-bold text-f1-red">{termData.era}</p>
              <p className="text-gray-400 text-sm mt-1">{termData.definition}</p>
            </div>
            <button aria-label="Close glossary explanation" onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Animation Viewport */}
          <div className="p-6 bg-black relative">
            {renderEngine()}
            
            {/* Phase Indicators */}
            <div className="absolute top-8 left-8 flex gap-2">
              {PHASES.map((p, idx) => (
                <button key={p} aria-pressed={idx === phaseIndex} onClick={() => setPhaseIndex(idx)} className="flex flex-col items-center gap-1">
                  <div className={`h-1 w-12 rounded-full transition-colors duration-500 ${idx <= phaseIndex ? 'bg-[#e10600]' : 'bg-gray-800'}`} />
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${idx === phaseIndex ? 'text-white' : 'text-gray-600'}`}>{p}</span>
                </button>
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
