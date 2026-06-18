import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import circuitsData from '../data/circuits.json';
import FadeInSection from '../components/FadeInSection';

const TIMELINE_STEPS = [
  {
    number: '01',
    name: 'Practice 1',
    desc: "Teams test their cars to see how they handle the track. Drivers practice driving and check if the car feels right.",
    details: "Teams sometimes put metal cages with sensors on the cars to check the air flow. They also test driving with heavy fuel to see how the engine performs."
  },
  {
    number: '02',
    name: 'Practice 2',
    desc: "Engineers focus on how the tires wear out over time. This is the most important session for planning Sunday's race.",
    details: "One driver might test soft, fast tires while the other tests medium, longer-lasting tires. This helps them decide when to pit during the race."
  },
  {
    number: '03',
    name: 'Practice 3',
    desc: "A short final practice for going as fast as possible for one single lap. Teams get ready for the all-important qualifying session.",
    details: "Drivers push hard to find the perfect speed and braking points. A crash here is bad, as it might stop you from entering qualifying."
  },
  {
    number: '04',
    name: 'Qualifying',
    desc: "Qualifying is like a time trial — every driver races alone to set the fastest lap they can. The fastest driver gets to start Sunday's race at the very front.",
    details: "It happens in three parts, and the slowest cars get knocked out each round. The final ten cars fight for the number one spot, called pole position."
  },
  {
    number: '05',
    name: 'Sprint (Optional)',
    desc: "A short, fast race on Saturday where you don't have to stop for new tires. The top eight drivers get extra championship points.",
    details: "You have to race hard but be careful not to crash. If you break the car, it ruins your starting spot for the main race on Sunday."
  },
  {
    number: '06',
    name: 'Race',
    desc: "The main event on Sunday where drivers race for almost 200 miles to score big points. You need a fast car, smart pit stops, and great driving to win.",
    details: "Drivers must manage their tires and make clean pit stops. The top ten drivers earn points, and the winner gets the most."
  }
];

const POINTS_SYSTEM = [
  { position: 'P1', points: 25, label: 'Winner' },
  { position: 'P2', points: 18, label: '2nd Place' },
  { position: 'P3', points: 15, label: '3rd Place' },
  { position: 'P4', points: 12, label: '4th Place' },
  { position: 'P5', points: 10, label: '5th Place' },
  { position: 'P6', points: 8, label: '6th Place' },
  { position: 'P7', points: 6, label: '7th Place' },
  { position: 'P8', points: 4, label: '8th Place' },
  { position: 'P9', points: 2, label: '9th Place' },
  { position: 'P10', points: 1, label: '10th Place' },
  { position: 'FL', points: 1, label: 'Fastest Lap' }
];

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

const GLOSSARY = [
  { term: 'DRS', definition: 'Drag Reduction System. It is a movable flap on the rear wing that reduces air drag and helps you go faster on straights.' },
  { term: 'ERS', definition: 'Energy Recovery System. It saves energy when you brake and lets you use it later as an electric boost.' },
  { term: 'Undercut', definition: 'Pitting earlier than the other driver to gain track position. You get fresh tires first and drive faster while they are still on old tires.' },
  { term: 'Overcut', definition: 'Staying out longer on old tires while the other driver pits. If they are slow warming up their new tires, you can pass them when you finally stop.' },
  { term: 'VSC', definition: 'Virtual Safety Car. A digital warning that forces everyone to slow down equally because of a small crash on the track.' },
  { term: 'Safety Car', definition: 'A real car that drives on the track to slow everyone down after a big crash. It bunches all the racers back together safely.' },
  { term: 'Parc Fermé', definition: 'It translates to "closed park." It is a locked zone where teams cannot touch the cars overnight after qualifying.' },
  { term: 'Box', definition: 'The message teams say on the radio when they want you to drive into the pit lane for new tires.' },
  { term: 'DNF', definition: 'Did Not Finish. This means a driver crashed or their car broke down, so they could not complete the race.' },
  { term: 'Pit Window', definition: 'The perfect time in the race to stop for new tires. It depends on how worn your current tires are.' },
  { term: 'Halo', definition: 'A strong metal bar shaped like a wishbone above the driver. It protects your head from flying parts in a crash.' },
  { term: 'MGUK', definition: 'A part of the engine that catches energy when you brake. It turns that heat into electricity to make the car faster.' },
  { term: 'MGUH', definition: 'A part of the engine that catches heat from the exhaust pipe. It also turns heat into electricity.' },
  { term: 'Flat Spot', definition: 'A flat patch on your round tire. It happens if you brake too hard and the wheel stops spinning while the car slides.' },
  { term: 'Marbles', definition: 'Little bits of rubber that fall off the tires. They pile up on the sides of the track and make it very slippery.' },
  { term: 'Graining', definition: 'When the tire surface rips slightly and rubber sticks to it. It makes the tire bumpy and you lose grip.' },
  { term: 'Blistering', definition: 'When the tire gets so hot that the rubber boils and bubbles pop out. It ruins the tire and slows you down.' },
  { term: 'Quali Mode', definition: 'Turning the engine up to maximum power. You only use it for one lap because it can damage the engine.' },
  { term: 'Push Lap', definition: 'A lap where you drive as fast as you possibly can. You give it 100% effort to get a good time.' },
  { term: 'Purple Sector', definition: 'The track is divided into three parts called sectors. Purple means you were the absolute fastest person in that section.' },
  { term: 'Delta Time', definition: 'The time difference between you and someone else. It shows if you are catching up or falling behind.' },
  { term: 'Jump Start', definition: 'When you start driving before the red lights turn off. You get a time penalty for cheating the start.' },
  { term: 'Backmarker', definition: 'A slow driver at the very back of the race. The leaders often have to drive past them.' },
  { term: 'Lapped Car', definition: 'A car that is so slow the leader has driven a whole extra lap around the track and caught up to them again.' },
  { term: 'Blue Flag', definition: 'A blue flag tells a slow driver that a fast driver is behind them. The slow driver must move out of the way.' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15
    }
  }
};

const headingVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

function AnimatedCounter({ end, label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(end / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-black text-f1-light">{count}</span>
      <span className="text-xs text-f1-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

function StartHere() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [hoveredCircuit, setHoveredCircuit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sectionRefs = {
    timeline: useRef(null),
    points: useRef(null),
    tires: useRef(null),
    circuits: useRef(null),
    glossary: useRef(null)
  };

  const scrollToSection = (refName) => {
    sectionRefs[refName].current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredGlossary = GLOSSARY.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headingText = "New to F1? Start here.";
  const headingWords = headingText.split(' ');

  return (
    <div className="pt-16 pb-12 w-full">
      {/* Animated Hero Section */}
      <div className="w-full bg-[#0a0a0f] h-[220px] flex flex-col justify-center px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-start md:items-center justify-between z-10">
          <div>
            <motion.h1 
              className="text-4xl md:text-5xl font-extrabold text-f1-light flex gap-2"
              variants={{
                hidden: { opacity: 1 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {headingWords.map((word, i) => (
                <motion.span key={i} variants={headingVariants} className="inline-block">
                  {word}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-lg text-f1-muted mt-2"
            >
              The fastest sport on Earth — explained simply.
            </motion.p>
          </div>
          
          <div className="hidden md:flex gap-8 mt-4 md:mt-0">
            <AnimatedCounter end={20} label="Drivers" />
            <AnimatedCounter end={10} label="Teams" />
            <AnimatedCounter end={24} label="Races" />
          </div>
        </div>

        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-f1-red w-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Navigation Pills */}
      <div className="max-w-7xl mx-auto px-6 mt-6 mb-12 flex flex-wrap gap-3">
        <button onClick={() => scrollToSection('timeline')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">How a Race Works</button>
        <button onClick={() => scrollToSection('points')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">Points</button>
        <button onClick={() => scrollToSection('tires')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">Tires</button>
        <button onClick={() => scrollToSection('circuits')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">Circuits</button>
        <button onClick={() => scrollToSection('glossary')} className="bg-f1-panel border border-f1-border text-f1-light px-4 py-2 rounded-full text-sm font-semibold hover:border-f1-red transition">Glossary</button>
      </div>

      <div className="px-6 max-w-7xl mx-auto">
        {/* 1. Race Weekend Timeline Section */}
        <FadeInSection className="mb-16">
          <div ref={sectionRefs.timeline} className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              The Weekend Schedule
            </h4>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight">
            What happens during a race weekend?
          </h2>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-6 gap-4"
          >
            {TIMELINE_STEPS.map((step, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  onClick={() => toggleExpand(index)}
                  className={`bg-f1-panel border cursor-pointer p-5 rounded-lg transition-all duration-300 flex flex-col justify-between select-none ${
                    isExpanded 
                      ? 'border-f1-red ring-1 ring-f1-red md:col-span-2' 
                      : 'border-f1-border hover:border-f1-red/50'
                  }`}
                  layout
                >
                  <div>
                    <span className="text-[10px] font-black text-f1-red tracking-widest block mb-1">
                      PART {step.number}
                    </span>
                    <h3 className="font-extrabold text-f1-light text-lg mb-2">
                      {step.name}
                    </h3>
                    <p className="text-xs text-f1-muted leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-f1-border text-xs text-f1-light leading-relaxed overflow-hidden"
                      >
                        {step.details}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-5 text-[10px] text-f1-muted font-bold uppercase flex justify-between items-center">
                    <span>{isExpanded ? 'Click to hide' : 'Click to read more'}</span>
                    <span className="text-f1-red font-black">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </FadeInSection>

        {/* 2. Points System Section */}
        <FadeInSection className="mb-16">
          <div ref={sectionRefs.points} className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              How to Win
            </h4>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight">
            How do you score points?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {POINTS_SYSTEM.map((p) => {
                const isP1 = p.position === 'P1';
                return (
                  <div 
                    key={p.position}
                    className={`border rounded-lg p-4 flex flex-col justify-between transition duration-300 ${
                      isP1 
                        ? 'col-span-2 bg-f1-red/10 border-f1-red shadow-lg shadow-f1-red/5' 
                        : 'bg-f1-panel border-f1-border hover:border-f1-muted'
                    }`}
                  >
                    <div>
                      <span className={`text-2xl font-black block ${isP1 ? 'text-f1-red' : 'text-f1-light'}`}>
                        {p.position}
                      </span>
                      <span className="text-[10px] text-f1-muted font-bold uppercase tracking-wider">
                        {p.label}
                      </span>
                    </div>
                    <div className="mt-3 text-right">
                      <span className={`text-3xl font-black ${isP1 ? 'text-f1-red' : 'text-f1-light'}`}>
                        {p.points}
                      </span>
                      <span className="text-[10px] text-f1-muted ml-1 font-bold uppercase">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-f1-light mb-2">Points Chart</h3>
                <p className="text-xs text-f1-muted mb-6">The winner gets 25 points, but the 10th place driver only gets 1. You want to finish as high as possible.</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={POINTS_SYSTEM} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" opacity={0.6} />
                    <XAxis dataKey="position" stroke="#666666" fontSize={11} tickLine={false} />
                    <YAxis stroke="#666666" fontSize={12} tickLine={false} />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f0f18', 
                        borderColor: '#1a1a24', 
                        color: '#f0f0f0',
                        borderRadius: '4px'
                      }}
                    />
                    <Bar dataKey="points">
                      {POINTS_SYSTEM.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.position === 'P1' ? '#e10600' : '#1a1a24'} 
                          stroke={entry.position === 'P1' ? '#e10600' : '#666666'}
                          strokeWidth={1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* 3. Tire Compound Guide Section */}
        <FadeInSection className="mb-16">
          <div ref={sectionRefs.tires} className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              Tire Guide
            </h4>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight">
            Which tires do they use?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {TIRES.map((tire) => (
              <div 
                key={tire.name} 
                className="bg-f1-panel border border-f1-border p-5 rounded-lg flex flex-col justify-between hover:border-f1-muted transition-all duration-300"
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
              </div>
            ))}
          </div>
        </FadeInSection>

        {/* 4. Circuit Map Section */}
        <FadeInSection className="mb-16">
          <div ref={sectionRefs.circuits} className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              Where they race
            </h4>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight flex justify-between items-center">
            <span>World Map of Races</span>
            {hoveredCircuit && (
              <span className="text-xs text-f1-red font-bold uppercase tracking-wider hidden sm:inline animate-pulse">
                Looking at: {hoveredCircuit.name}
              </span>
            )}
          </h2>

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
                  key={c.id} 
                  className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onMouseEnter={() => setHoveredCircuit(c)}
                  onMouseLeave={() => setHoveredCircuit(null)}
                >
                  {/* Pulsing red dot */}
                  <div className={`absolute inset-0 rounded-full bg-f1-red transition-all duration-300 ${isHovered ? 'scale-150 ring-4 ring-f1-red/20' : 'animate-ping opacity-75'}`} />
                  <div className="relative w-2.5 h-2.5 rounded-full bg-f1-red border border-f1-light" />
                </div>
              );
            })}

            {/* Floating Tooltip Card */}
            <AnimatePresence>
              {hoveredCircuit && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-4 left-4 z-30 bg-[#0f0f18]/95 backdrop-blur-md border border-f1-red p-4 rounded shadow-2xl max-w-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">
                      {COUNTRY_FLAGS[hoveredCircuit.country] || '🏁'}
                    </span>
                    <h4 className="font-extrabold text-f1-light text-sm">
                      {hoveredCircuit.name}
                    </h4>
                  </div>
                  <div className="space-y-1 text-[11px] text-f1-muted">
                    <p>City & Country: <span className="text-f1-light font-medium">{hoveredCircuit.city}, {hoveredCircuit.country}</span></p>
                    <p>Track Length: <span className="text-f1-light font-medium">{hoveredCircuit.lapLength} km</span></p>
                    <p>Corners: <span className="text-f1-light font-medium">{hoveredCircuit.turns}</span></p>
                    <p>Speed Boost Zones: <span className="text-f1-light font-medium">{hoveredCircuit.drsZones}</span></p>
                    <p className="border-t border-f1-border/40 pt-1 mt-1 text-f1-red font-semibold">
                      Fastest Lap Ever: {hoveredCircuit.lapRecord}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeInSection>

        {/* 5. Glossary Section */}
        <FadeInSection className="mb-16">
          <div ref={sectionRefs.glossary} className="border-l-2 border-f1-red pl-2 mb-4 scroll-mt-24">
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

          {/* Glossary Results */}
          {filteredGlossary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredGlossary.map((item) => (
                  <motion.div 
                    key={item.term}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-f1-panel border border-f1-border p-4 rounded hover:border-f1-red/30 transition-all duration-300"
                  >
                    <h3 className="font-extrabold text-f1-light text-base mb-1 tracking-wider">
                      {item.term}
                    </h3>
                    <p className="text-xs text-f1-muted leading-relaxed">
                      {item.definition}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-f1-border rounded bg-f1-panel/20">
              <span className="text-3xl">🔍</span>
              <p className="text-sm text-f1-muted mt-2">No matching words found.</p>
            </div>
          )}
        </FadeInSection>

      </div>
    </div>
  );
}

export default StartHere;
