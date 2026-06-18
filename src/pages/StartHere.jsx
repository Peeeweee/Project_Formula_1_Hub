import React, { useState } from 'react';
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
    desc: "Teams run initial baseline setups to adapt to the circuit's track conditions. Drivers scrub tires, verify sensor calibrations, and gather initial aero data.",
    details: "Aerodynamic rakes are frequently installed behind the front wheels to map airflow. Teams typically test different fuel loads to evaluate raw engine maps and suspension response."
  },
  {
    number: '02',
    name: 'Practice 2',
    desc: "Engineers focus on race simulation runs and long-term tire degradation data. This is historically the most critical session for defining Sunday's main strategy.",
    details: "Teams split their driver programs, running one on soft compounds and the other on mediums with high fuel loads to compare degradation slopes and lap time drop-offs."
  },
  {
    number: '03',
    name: 'Practice 3',
    desc: "A short final session dedicated to low-fuel qualifying trim simulation runs. Teams optimize single-lap setups and practice pit stop entries.",
    details: "Drivers push the limits to find maximum cornering velocity and perfect their braking points. Any mistake here risks a crash that could prevent participation in qualifying."
  },
  {
    number: '04',
    name: 'Qualifying',
    desc: "A high-stakes knockout competition divided into three sessions: Q1, Q2, and Q3. The driver who sets the absolute fastest lap starts Sunday's race from pole position.",
    details: "Q1 eliminates the slowest five cars, Q2 drops five more, and Q3 determines the final top-ten grid spots. Power units are turned to maximum performance modes."
  },
  {
    number: '05',
    name: 'Sprint (Optional)',
    desc: "A fast-paced 100km race with no mandatory pit stops held on selected weekends. Points are awarded to the top eight finishers, setting a mini-race spectacle.",
    details: "Drivers must balance aggression with caution, as damaging the car could ruin their starting position or chassis readiness for the main event."
  },
  {
    number: '06',
    name: 'Race',
    desc: "The Grand Prix event where drivers compete over 300km to score points for the championship. Victory demands flawless strategy, quick pit stops, and raw speed.",
    details: "Tyre management, DRS zone tactics, safety car reactions, and clean pit stops are critical. Points are awarded to the top ten finishers, with an extra point for the fastest lap."
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
    use: 'Designed for qualifying sessions and short, high-grip race stints.',
    speed: 100,
    durability: 30
  },
  {
    name: 'Medium',
    color: '#ffd300',
    use: 'Strikes a balanced compromise between outright speed and longevity.',
    speed: 80,
    durability: 60
  },
  {
    name: 'Hard',
    color: '#ffffff',
    use: 'Perfect for long runs on high-abrasion surfaces with low degradation.',
    speed: 60,
    durability: 90
  },
  {
    name: 'Intermediate',
    color: '#00a650',
    use: 'Optimal for damp tracks and transitioning light wet weather conditions.',
    speed: 50,
    durability: 70
  },
  {
    name: 'Wet',
    color: '#007aff',
    use: 'Designed for heavy downpours to displace max water and avoid hydroplaning.',
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
  { term: 'DRS', definition: 'Drag Reduction System - A driver-controlled device aimed at promoting overtaking by opening a slot in the rear wing to reduce aerodynamic drag.' },
  { term: 'ERS', definition: 'Energy Recovery System - Technology that harvests waste thermal and kinetic energy during braking and exhaust flow to store in the battery for additional electric power.' },
  { term: 'Undercut', definition: 'A pit stop strategy where a driver pits early to gain a lap-time advantage on fresh tyres, overtaking competitors when they eventually pit.' },
  { term: 'Overcut', definition: 'A pit stop strategy where a driver stays out longer on older tyres to set fast laps while competitors warm up their fresh tyres, emerging ahead after pitting.' },
  { term: 'VSC', definition: 'Virtual Safety Car - A safety system requiring all drivers to reduce speed by a set percentage (indicated by a delta time) without overtaking, used for minor incidents.' },
  { term: 'Safety Car', definition: 'A physical sports car deployed to lead the field at a reduced speed when there is a major track hazard or accident, neutralizing gaps.' },
  { term: 'Parc Fermé', definition: 'The secure area where cars must be left after qualifying and the race for technical inspections, during which setup modifications are strictly banned.' },
  { term: 'Box', definition: 'The radio command telling a driver to enter the pit lane for a tyre change or mechanical adjustment during a session.' },
  { term: 'DNF', definition: 'Did Not Finish - A status given to a driver who is forced to retire from a race due to an accident, mechanical failure, or disqualification.' },
  { term: 'Pit Window', definition: 'The range of laps during a race when a team plans to make a scheduled pit stop based on tyre life and track position traffic.' },
  { term: 'Halo', definition: 'A titanium safety structure mounted above the cockpit to protect the driver\'s head from flying debris and heavy impacts.' },
  { term: 'MGUK', definition: 'Motor Generator Unit Kinetic - An electrical generator/motor that converts kinetic energy from the rear brakes into electricity, and vice versa.' },
  { term: 'MGUH', definition: 'Motor Generator Unit Heat - An electrical generator/motor connected to the turbocharger that converts thermal energy from exhaust gases into electricity.' },
  { term: 'Flat Spot', definition: 'A worn, flat section on a tyre caused by locking the wheels under heavy braking, causing severe vibrations and handling issues.' },
  { term: 'Marbles', definition: 'Small pieces of tyre rubber that accumulate off the clean racing line, making the track extremely slippery for cars that run wide.' },
  { term: 'Graining', definition: 'A condition where small rubber strips peel off the tyre surface and stick to the tread, reducing contact area and grip.' },
  { term: 'Blistering', definition: 'A condition where excess heat causes the tyre tread compound to bubble and peel away, creating highly visible craters and reducing traction.' },
  { term: 'Quali Mode', definition: 'An engine configuration set to maximum power output for single-lap performance, increasing stress on power unit components.' },
  { term: 'Push Lap', definition: 'A fast lap where a driver exerts maximum effort to set a fast time, typically after a cool-down or prep lap in qualifying.' },
  { term: 'Purple Sector', definition: 'An indicator showing that a driver has set the absolute fastest sector time of the session so far.' },
  { term: 'Delta Time', definition: 'The difference in time between two laps, drivers, or against a target pace set by the FIA (e.g. under VSC conditions).' },
  { term: 'Jump Start', definition: 'Occurs when a car moves from its grid slot before the starting red lights are extinguished, resulting in a time penalty.' },
  { term: 'Backmarker', definition: 'A slower car near the rear of the field, often about to be lapped by the race leaders.' },
  { term: 'Lapped Car', definition: 'A car that has been overtaken by the race leader and is one or more full laps behind the front-running pack.' },
  { term: 'Blue Flag', definition: 'A flag waved to warn a backmarker that a faster car is behind them and they must yield the position at the earliest safe opportunity.' }
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

function StartHere() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [hoveredCircuit, setHoveredCircuit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredGlossary = GLOSSARY.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      {/* 1. Race Weekend Timeline Section */}
      <FadeInSection className="mb-16">
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Race Weekend Blueprint
          </h4>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight">
          The Timeline of a Grand Prix Weekend
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
                    SESSION {step.number}
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
                  <span>{isExpanded ? 'Click to collapse' : 'Click to expand'}</span>
                  <span className="text-f1-red font-black">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </FadeInSection>

      {/* 2. Points System Section */}
      <FadeInSection className="mb-16">
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Championship System
          </h4>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight">
          How Points Are Awarded
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
              <h3 className="text-lg font-bold text-f1-light mb-2">Visual Breakdown</h3>
              <p className="text-xs text-f1-muted mb-6">Visualizing the steep points drop-off curve from P1 down to P10.</p>
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
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Pirelli Telemetry
          </h4>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight">
          Tire Compound Guide
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
                    <span>Durability</span>
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
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Global Locations
          </h4>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight flex justify-between items-center">
          <span>Formula 1 Circuits Map</span>
          {hoveredCircuit && (
            <span className="text-xs text-f1-red font-bold uppercase tracking-wider hidden sm:inline animate-pulse">
              Hovering over: {hoveredCircuit.name}
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
            // Mapping lat/lng to standard Equirectangular projection coordinates
            const x = ((c.lng + 180) / 360) * 100;
            // The latitude mapping can be adjusted slightly for map height/margins:
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
                  <p>Location: <span className="text-f1-light font-medium">{hoveredCircuit.city}, {hoveredCircuit.country}</span></p>
                  <p>Lap Length: <span className="text-f1-light font-medium">{hoveredCircuit.lapLength} km</span></p>
                  <p>Turns: <span className="text-f1-light font-medium">{hoveredCircuit.turns}</span></p>
                  <p>DRS Zones: <span className="text-f1-light font-medium">{hoveredCircuit.drsZones}</span></p>
                  <p className="border-t border-f1-border/40 pt-1 mt-1 text-f1-red font-semibold">
                    Record: {hoveredCircuit.lapRecord}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FadeInSection>

      {/* 5. Glossary Section */}
      <FadeInSection className="mb-16">
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            F1 Dictionary
          </h4>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light mb-6 tracking-tight flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span>Formula 1 Glossary</span>
          {/* Custom Search Bar */}
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search terms or definitions..."
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
            <p className="text-sm text-f1-muted mt-2">No matching glossary terms found.</p>
          </div>
        )}
      </FadeInSection>

      {/* Hero / Welcome Section */}
      <FadeInSection className="relative bg-gradient-to-r from-f1-panel to-f1-dark border border-f1-border rounded-lg p-8 md:p-12 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-f1-red/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-f1-red font-bold tracking-widest text-sm uppercase">Welcome to the Command Center</span>
          <h1 className="text-4xl md:text-6xl font-black text-f1-light mt-2 mb-4 tracking-tight leading-none">
            ENGINEERED FOR <span className="text-f1-red">SPEED</span>
          </h1>
          <p className="text-lg text-f1-muted mb-6 leading-relaxed">
            Welcome to the ultimate Formula 1 dashboard. Dive deep into telemetry analytics, 
            constructor data, car aerodynamics, and live pit strategies powered by simulated telemetry feeds.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="#explore" 
              className="bg-f1-red text-f1-light px-6 py-3 font-semibold rounded-sm tracking-wider uppercase text-sm hover:bg-red-700 transition duration-300 transform -skew-x-12"
            >
              Explore Features
            </a>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
}

export default StartHere;
