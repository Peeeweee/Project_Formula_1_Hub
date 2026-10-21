import { lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import circuitsData from '../data/circuits.json';
import FadeInSection from '../components/FadeInSection';
import WeekendGuide from '../components/WeekendGuide';
import PointsExplorer from '../components/PointsExplorer';
import CircuitVenueMedia from '../components/CircuitVenueMedia';
import RealisticTire from '../components/RealisticTire';
import useDialogAccessibility from '../hooks/useDialogAccessibility';
const GlossaryModal = lazy(() => import('../components/GlossaryModal'));
import { GLOSSARY } from '../data/glossary';

const TIRES = [
  {
    name: 'Soft',
    color: '#e10600',
    use: 'The fastest tire, but it wears out the quickest. Best for short sprints and setting fast laps.',
    speed: 100,
    durability: 30
  },
  {
    name: 'Medium',
    color: '#ffd300',
    use: 'A great middle option. It offers a good mix of speed and how long it lasts on the track.',
    speed: 80,
    durability: 60
  },
  {
    name: 'Hard',
    color: '#ffffff',
    use: 'The slowest tire, but it lasts a very long time. Perfect for driving long distances without stopping.',
    speed: 60,
    durability: 90
  },
  {
    name: 'Intermediate',
    color: '#00a650',
    use: 'Has grooves to pump water away. Used when the track is a little wet or it is lightly raining.',
    speed: 50,
    durability: 70
  },
  {
    name: 'Wet',
    color: '#007aff',
    use: 'Has deep grooves to clear lots of water. Only used during heavy rain to stop the car from sliding.',
    speed: 40,
    durability: 85
  }
];

const COUNTRY_FLAGS = {
  'Bahrain': '🇧🇭',
  'Saudi Arabia': '🇸🇦',
  'Australia': '🇦🇺',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'USA': '🇺🇸',
  'Italy': '🇮🇹',
  'Monaco': '🇲🇨',
  'Canada': '🇨🇦',
  'Spain': '🇪🇸',
  'Austria': '🇦🇹',
  'UK': '🇬🇧',
  'Hungary': '🇭🇺',
  'Belgium': '🇧🇪',
  'Netherlands': '🇳🇱',
  'Azerbaijan': '🇦🇿',
  'Singapore': '🇸🇬',
  'Mexico': '🇲🇽',
  'Brazil': '🇧🇷',
  'UAE': '🇦🇪',
  'Qatar': '🇶🇦'
};

// GLOSSARY array imported from data file

const headingVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

function AnimatedCounter({ end, label }) {
  return <div className="flex flex-col items-center"><span className="text-3xl font-black text-f1-light">{end}</span><span className="text-xs text-f1-muted uppercase tracking-wider">{label}</span></div>;
}

function StartHere() {
  const [hoveredCircuit, setHoveredCircuit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTire, setSelectedTire] = useState(null);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState(null);

  const tireDialogRef = useDialogAccessibility(Boolean(selectedTire), () => setSelectedTire(null));
  const circuitDialogRef = useDialogAccessibility(Boolean(selectedCircuit), () => setSelectedCircuit(null));

  const scrollToSection = name => {
    document.getElementById(name === 'timeline' ? 'weekend' : name)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const filteredGlossary = GLOSSARY.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headingText = "New to F1? Start here.";
  const headingWords = headingText.split(' ');

  return (
    <div className="learn-page pt-16 pb-12 w-full">
      {/* Animated Hero Section */}
      <div className="w-full bg-[#0a0a0f] h-[220px] flex flex-col justify-center px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-start md:items-center justify-between z-10">
          <div>
            <motion.h1 
              className="text-4xl md:text-5xl font-extrabold text-f1-light flex flex-wrap gap-2"
              variants={{
                hidden: { opacity: 1 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 }
                }
              }}
              initial={false}
              animate="show"
            >
              {headingWords.map((word, i) => (
                <motion.span key={i} variants={headingVariants} className="inline-block">
                  {word}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p 
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0 }}
              className="text-lg text-f1-muted mt-2"
            >
              The racing, the strategy, and the machines — explained simply.
            </motion.p>
          </div>
          
          <div className="hidden md:flex gap-8 mt-4 md:mt-0">
            <AnimatedCounter end={22} label="Drivers" />
            <AnimatedCounter end={11} label="Teams" />
            <AnimatedCounter end={10} label="Points positions" />
          </div>
        </div>

        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-f1-red w-full origin-left"
          initial={false}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0 }}
        />
      </div>

      {/* Navigation Pills */}
      <div className="max-w-7xl mx-auto px-6 mt-6 mb-12 flex flex-wrap gap-3">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => scrollToSection('timeline')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">How a Race Works</motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => scrollToSection('points')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">Points</motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => scrollToSection('tires')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">Tires</motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => scrollToSection('circuits')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">Circuits</motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => scrollToSection('glossary')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">Glossary</motion.button>
        <Link to="/watch" className="border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red">Watch a Race ↗</Link>
        <Link to="/strategy" className="border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red">Strategy ↗</Link>
      </div>

      <div className="px-6 max-w-7xl mx-auto w-full">
        {/* 1. Race Weekend Timeline Section */}
        <FadeInSection className="mb-16">
          <div id="weekend" className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              The Weekend Schedule
            </h4>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight">
            What happens during a race weekend?
          </h2>

          <WeekendGuide />
        </FadeInSection>

        {/* 2. Points System Section */}
        <FadeInSection className="mb-16">
          <div id="points" className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              How to Win
            </h4>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight">
            How do you score points?
          </h2>

          <PointsExplorer />
        </FadeInSection>

        {/* 3. Tire Compound Guide Section */}
        <FadeInSection className="mb-16">
          <div id="tires" className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              Tire Guide
            </h4>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight">
            Which tires do they use?
          </h2>
          <p className="text-xs text-f1-muted mb-5">Bars are illustrative comparisons, not measured performance percentages. Grip and tire life depend on the track, conditions and compound selection.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {TIRES.map((tire) => (
              <motion.div 
                whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                key={tire.name} 
                role="button" tabIndex={0} aria-label={`Explore ${tire.name} tires`}
                  onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedTire(tire); } }}
                  onClick={() => setSelectedTire(tire)}
                className="cursor-pointer bg-f1-panel border border-f1-border p-5 rounded-lg flex flex-col justify-between hover:border-f1-muted transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div 
                      className="w-5 h-5 rounded-full border-4" 
                      style={{ borderColor: tire.color, backgroundColor: 'transparent' }} 
                    />
                    <span className="font-extrabold text-lg text-f1-light">{tire.name}</span>
                  </div>
                  <p className="text-xs text-f1-muted leading-relaxed mb-4 min-h-[40px]">
                    {tire.use}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-f1-border/40">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-f1-muted uppercase mb-1">
                      <span>Speed</span>
                      <span className="text-f1-light">{tire.speed}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-f1-border rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${tire.speed}%`, backgroundColor: tire.color }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-f1-muted uppercase mb-1">
                      <span>How long it lasts</span>
                      <span className="text-f1-light">{tire.durability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-f1-border rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${tire.durability}%`, backgroundColor: tire.color }} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeInSection>

        {/* 4. Circuit Map Section */}
        <FadeInSection className="mb-16">
          <div id="circuits" className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              Where they race
            </h4>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight flex justify-between items-center">
            <span>World Map of Circuits</span>
            {hoveredCircuit && (
              <span className="text-xs text-f1-red font-bold uppercase tracking-wider hidden sm:inline animate-pulse">
                Looking at: {hoveredCircuit.name}
              </span>
            )}
          </h2>

          <p className="learning-footnote">A reference atlas of recent F1 venues, not the live season calendar. Select a circuit to explore photographs of the venue and its geographic layout.</p>
          <label className="circuit-picker">Find a circuit <select value={selectedCircuit?.id || ''} onChange={event=>setSelectedCircuit(circuitsData.find(c=>c.id===event.target.value) || null)}><option value="">Select a venue</option>{circuitsData.map(c=><option key={c.id} value={c.id}>{c.name} / {c.country}</option>)}</select></label>
          <div className="relative w-full aspect-[2/1] bg-f1-panel border border-f1-border rounded-lg overflow-hidden flex items-center justify-center">
            {/* Base SVG Map */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" 
              alt="World Map Outline" 
              className="w-full h-full object-cover opacity-20 filter invert select-none pointer-events-none" 
            />

            {/* Circuit Pins */}
            {circuitsData.map((c) => {
              const x = ((c.lng + 180) / 360) * 100;
              const y = ((90 - c.lat) / 180) * 100;

              const isHovered = hoveredCircuit?.id === c.id;

              return (
                <div 
                  key={c.id} role="button" tabIndex={0} aria-label={`Explore ${c.name}`}
                  onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedCircuit(c); } }}
                  className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onMouseEnter={() => setHoveredCircuit(c)}
                  onMouseLeave={() => setHoveredCircuit(null)}
                  onClick={() => setSelectedCircuit(c)}
                >
                  {/* Pulsing red dot */}
                  <div className={`absolute inset-0 rounded-full bg-f1-red transition-all duration-300 ${isHovered ? 'scale-150 ring-4 ring-f1-red/20' : ' opacity-75'}`} />
                  <div className="relative w-2.5 h-2.5 rounded-full bg-f1-red border border-f1-light" />
                </div>
              );
            })}

            {/* Removed Hover Tooltip Card. Now handled by click-to-open Gran Turismo Modal. */}
          </div>
        </FadeInSection>

        {/* 5. Glossary Section */}
        <FadeInSection className="mb-16">
          <div id="glossary" className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              F1 Dictionary
            </h4>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span>Words you should know</span>
            {/* Custom Search Bar */}
            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Search for a word..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#07070a] border border-f1-border text-f1-light placeholder-f1-muted text-xs px-4 py-2.5 rounded-sm focus:ring-1 focus:ring-f1-red focus:border-transparent outline-none transition duration-300"
              />
            </div>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGlossary.map(item => <button key={item.term} onClick={() => setSelectedGlossaryTerm(item)} className="bg-f1-panel border border-f1-border rounded-lg p-5 text-left hover:border-f1-red transition-colors"><h3 className="text-lg font-extrabold text-f1-light mb-2">{item.term} <span className="text-f1-red float-right">↗</span></h3><p className="text-sm text-f1-muted leading-relaxed">{item.definition}</p></button>)}
          </div>
          {!filteredGlossary.length && <p className="text-f1-muted py-8">No matching words found.</p>}
        </FadeInSection>

      </div>

      {/* Tire Preview Modal */}
      <AnimatePresence>
        {selectedTire && (
          <motion.div 
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTire(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              ref={tireDialogRef} role="dialog" aria-modal="true" aria-label="Tire details" tabIndex={-1}
              className="bg-f1-panel border border-f1-border rounded-xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button Desktop */}
              <button 
                onClick={() => setSelectedTire(null)}
                className="hidden md:flex absolute top-6 right-6 w-10 h-10 rounded-full hover:bg-f1-border items-center justify-center text-f1-light transition-colors z-20"
              >
                ✕
              </button>

              <div className="w-full md:w-1/2 p-8 flex items-center justify-center relative bg-gradient-to-br from-black/60 to-transparent">
                {/* Close Button Mobile */}
                <button 
                  onClick={() => setSelectedTire(null)}
                  className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-full bg-f1-border flex items-center justify-center text-f1-light z-20"
                >
                  ✕
                </button>
                <div className="w-full aspect-square max-w-[350px]">
                  <RealisticTire compoundName={selectedTire.name} color={selectedTire.color} />
                </div>
              </div>
              
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-f1-panel border-t md:border-t-0 md:border-l border-f1-border relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-8 h-8 rounded-full border-[6px] shadow-lg" 
                    style={{ borderColor: selectedTire.color, backgroundColor: 'transparent', boxShadow: `0 0 15px ${selectedTire.color}40` }} 
                  />
                  <h2 className="text-3xl md:text-4xl font-black text-f1-light uppercase tracking-tight">{selectedTire.name} <span className="text-xl md:text-2xl text-f1-muted">Compound</span></h2>
                </div>

                <p className="text-base md:text-lg text-f1-muted leading-relaxed mb-10">
                  {selectedTire.use}
                </p>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs md:text-sm font-bold text-f1-muted uppercase tracking-widest mb-2">
                      <span>Top Speed</span>
                      <span className="text-f1-light">{selectedTire.speed}%</span>
                    </div>
                    <div className="w-full h-3 bg-[#111] rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedTire.speed}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: selectedTire.color }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs md:text-sm font-bold text-f1-muted uppercase tracking-widest mb-2">
                      <span>Durability</span>
                      <span className="text-f1-light">{selectedTire.durability}%</span>
                    </div>
                    <div className="w-full h-3 bg-[#111] rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedTire.durability}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: selectedTire.color }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gran Turismo Circuit Preview Modal */}
      <AnimatePresence>
        {selectedCircuit && (
          <motion.div 
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedCircuit(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              ref={circuitDialogRef} role="dialog" aria-modal="true" aria-label="Circuit details" tabIndex={-1}
              className="bg-f1-panel border border-f1-border rounded-xl shadow-2xl max-w-6xl w-full flex flex-col overflow-hidden relative max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button Desktop */}
              <button 
                onClick={() => setSelectedCircuit(null)}
                className="hidden md:flex absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 hover:bg-f1-border items-center justify-center text-f1-light transition-colors z-20 backdrop-blur-sm"
              >
                ✕
              </button>

              <div className="w-full h-72 md:h-96 relative shrink-0">
                {/* Gran Turismo Track Photo */}
                <CircuitVenueMedia key={selectedCircuit.id} circuit={selectedCircuit} />

                
                {/* Close Button Mobile */}
                <button 
                  onClick={() => setSelectedCircuit(null)}
                  className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-f1-light z-20 backdrop-blur-sm"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 md:p-8 relative z-10 overflow-y-auto">
                <div className="flex items-end gap-4 mb-8">
                  <div className="text-6xl md:text-8xl drop-shadow-lg">
                    {COUNTRY_FLAGS[selectedCircuit.country] || '🏁'}
                  </div>
                  <div>
                    <h4 className="text-f1-red font-black tracking-widest uppercase text-xs md:text-sm mb-1 drop-shadow-md">
                      {selectedCircuit.city}, {selectedCircuit.country}
                    </h4>
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-xl">
                      {selectedCircuit.name}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#0a0a0f]/80 backdrop-blur-md p-6 rounded-lg border border-white/5 shadow-inner">
                  <div>
                    <span className="text-[10px] text-f1-muted font-bold uppercase tracking-wider block mb-1">Track Length</span>
                    <span className="text-xl md:text-2xl font-black text-f1-light">{selectedCircuit.lapLength} <span className="text-sm font-bold text-f1-muted">km</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-f1-muted font-bold uppercase tracking-wider block mb-1">Corners</span>
                    <span className="text-xl md:text-2xl font-black text-f1-light">{selectedCircuit.turns}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-f1-muted font-bold uppercase tracking-wider block mb-1">Historical DRS Zones</span>
                    <span className="text-xl md:text-2xl font-black text-f1-light">{selectedCircuit.drsZones} <span className="text-sm font-bold text-f1-muted">DRS</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-f1-muted font-bold uppercase tracking-wider block mb-1">Layout source</span>
                    <span className="text-sm md:text-base font-bold text-f1-red">Open circuit geodata / reference layout</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual explanations load only when requested. */}
      {selectedGlossaryTerm && <Suspense fallback={<p role="status">Loading explanation…</p>}><GlossaryModal
        termData={selectedGlossaryTerm} 
        onClose={() => setSelectedGlossaryTerm(null)} 
      /></Suspense>}
    </div>
  );
}

export default StartHere;
