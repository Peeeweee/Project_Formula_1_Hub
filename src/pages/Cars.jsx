import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import erasData from '../data/eras.json';
import constructorsData from '../data/constructors.json';

const CARS_DATA = [
  { id: 'ferrari', name: 'Ferrari SF-26', powerUnit: 'Ferrari 069/3', chassis: 'Carbon-fibre composite honeycomb', weight: '798kg', aeroEfficiency: 'High-downforce wing profile', maxRpm: '15,000 RPM' },
  { id: 'redbull', name: 'Red Bull RB22', powerUnit: 'Honda RBPTH002', chassis: 'Carbon-composite monocoque', weight: '798kg', aeroEfficiency: 'Ground-effect Venturi tunnels', maxRpm: '15,000 RPM' },
  { id: 'mclaren', name: 'McLaren MCL38', powerUnit: 'Mercedes-AMG M15', chassis: 'Carbon-synthetic structure', weight: '798kg', aeroEfficiency: 'Outwash aerodynamics config', maxRpm: '15,000 RPM' }
];

const ICONIC_CARS_DATA = [
  { id: 'alfetta', name: 'Alfa Romeo Alfetta 159', year: 1951, team: 'Alfa Romeo', engineType: '1.5L Supercharged L8', horsepowerEst: 425, weightKg: 710, topSpeedKmh: 290, downforceLevel: 1, reliabilityScore: 6, handling: 4 },
  { id: 'w196', name: 'Mercedes-Benz W196', year: 1954, team: 'Mercedes-Benz', engineType: '2.5L Naturally Aspirated L8', horsepowerEst: 257, weightKg: 720, topSpeedKmh: 280, downforceLevel: 1, reliabilityScore: 8, handling: 5 },
  { id: 'lotus25', name: 'Lotus 25', year: 1962, team: 'Lotus', engineType: '1.5L Naturally Aspirated V8', horsepowerEst: 195, weightKg: 450, topSpeedKmh: 260, downforceLevel: 2, reliabilityScore: 7, handling: 8 },
  { id: 'lotus72', name: 'Lotus 72', year: 1970, team: 'Lotus', engineType: '3.0L Naturally Aspirated V8', horsepowerEst: 440, weightKg: 530, topSpeedKmh: 310, downforceLevel: 5, reliabilityScore: 7, handling: 7 },
  { id: 'mp4_4', name: 'McLaren MP4/4', year: 1988, team: 'McLaren', engineType: '1.5L Turbocharged V6', horsepowerEst: 650, weightKg: 540, topSpeedKmh: 333, downforceLevel: 7, reliabilityScore: 9, handling: 9 },
  { id: 'fw14b', name: 'Williams FW14B', year: 1992, team: 'Williams', engineType: '3.5L Naturally Aspirated V10', horsepowerEst: 760, weightKg: 505, topSpeedKmh: 340, downforceLevel: 8, reliabilityScore: 8, handling: 9 },
  { id: 'f2004', name: 'Ferrari F2004', year: 2004, team: 'Ferrari', engineType: '3.0L Naturally Aspirated V10', horsepowerEst: 950, weightKg: 605, topSpeedKmh: 360, downforceLevel: 9, reliabilityScore: 10, handling: 10 },
  { id: 'rb9', name: 'Red Bull RB9', year: 2013, team: 'Red Bull', engineType: '2.4L Naturally Aspirated V8', horsepowerEst: 750, weightKg: 642, topSpeedKmh: 340, downforceLevel: 9, reliabilityScore: 9, handling: 10 },
  { id: 'w11', name: 'Mercedes-AMG W11', year: 2020, team: 'Mercedes', engineType: '1.6L Turbocharged Hybrid V6', horsepowerEst: 1020, weightKg: 746, topSpeedKmh: 360, downforceLevel: 10, reliabilityScore: 10, handling: 10 },
  { id: 'rb19', name: 'Red Bull RB19', year: 2023, team: 'Red Bull', engineType: '1.6L Turbocharged Hybrid V6', horsepowerEst: 1000, weightKg: 798, topSpeedKmh: 350, downforceLevel: 9, reliabilityScore: 10, handling: 9 },
  { id: 'bt46b', name: 'Brabham BT46B', year: 1978, team: 'Brabham', engineType: '3.0L Naturally Aspirated H12', horsepowerEst: 520, weightKg: 575, topSpeedKmh: 300, downforceLevel: 8, reliabilityScore: 5, handling: 8 },
  { id: 'bgp001', name: 'Brawn BGP 001', year: 2009, team: 'Brawn GP', engineType: '2.4L Naturally Aspirated V8', horsepowerEst: 740, weightKg: 605, topSpeedKmh: 335, downforceLevel: 8, reliabilityScore: 9, handling: 9 }
];

const ERA_IMAGES = {
  early_years: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Alfa_Romeo_159_Alfetta_1.jpg',
  rear_engine: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Lotus-climax-25.jpg',
  wings_dfv: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Lotus_72_John_Player_Special.jpg',
  turbo_ground_effect: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/McLaren_MP4-4.jpg',
  v10_era: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Ferrari_F2004_front-left_2019_Ferrari_Museum.jpg',
  v8_era: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Red_Bull_RB9_Vettel.jpg',
  turbo_hybrid: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Lewis_Hamilton_Mercedes_W11_2020.jpg',
  ground_effect_hybrid: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Red_Bull_RB19_front_right_2023.jpg'
};

const ERA_DETAILS = {
  early_years: {
    teams: "Alfa Romeo, Maserati, Ferrari, Mercedes-Benz",
    regulations: "Engine capacity set to 1.5L supercharged or 4.5L naturally aspirated. Front-engine chassis design was mandatory. Safety helmets were not regulated, and drivers wore linen caps."
  },
  rear_engine: {
    teams: "Cooper, Lotus, Brabham, BRM",
    regulations: "Engine size reduced to 1.5L in 1961 to restrict speeds, then doubled to 3.0L in 1966. Introduction of modern aviation-grade aluminum monocoque structures instead of spaceframe tubes."
  },
  wings_dfv: {
    teams: "Lotus, Tyrrell, McLaren, Ferrari",
    regulations: "Introduction of wings attached directly to the chassis rather than the suspension. Ford-Cosworth DFV V8 engines introduced as low-cost spec units. Slick tyres introduced by Goodyear in 1971."
  },
  turbo_ground_effect: {
    teams: "Ferrari, Williams, McLaren, Brabham, Renault",
    regulations: "Venturi tunnels allowed ground-effect downforce until banned in 1983 due to cornering speeds. Fuel tank sizes restricted. 1.5L Turbocharged engines restricted via boost limits (pop-off valves) before being banned in 1989."
  },
  v10_era: {
    teams: "McLaren, Williams, Ferrari, Renault",
    regulations: "Slick tyres banned and replaced by grooved tyres in 1998 to limit corner speed. V10 engines mandated in 2000. Electronic driver aids like traction control banned, allowed, and banned again."
  },
  v8_era: {
    teams: "Red Bull Racing, McLaren, Ferrari, Brawn GP",
    regulations: "Mandatory transition to 2.4L V8 engines. Introduction of KERS (Kinetic Energy Recovery System) in 2009 and DRS (Drag Reduction System) in 2011 to encourage overtaking."
  },
  turbo_hybrid: {
    teams: "Mercedes, Red Bull Racing, Ferrari",
    regulations: "Drastic change to 1.6L V6 Turbo Hybrid power units. Introduction of the Halo cockpit safety protection device in 2018. Fuel flow limits strictly regulated to 100 kg/hour."
  },
  ground_effect_hybrid: {
    teams: "Red Bull Racing, Ferrari, McLaren, Mercedes",
    regulations: "Complete aerodynamic overhaul transitioning to Venturi-driven underbody ground effect downforce. Introduction of 18-inch wheels with low-profile tyres. Budget cap introduced to limit spending."
  }
};

const CONSTRUCTOR_DETAILS = {
  ferrari: {
    entries: 1082,
    wins: 243,
    poles: 244,
    podiums: 807,
    iconicCar: "Ferrari F2004",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/9/93/Ferrari_F2004_front-left_2019_Ferrari_Museum.jpg",
    championshipsDecade: [
      { decade: "1960s", championships: 2 },
      { decade: "1970s", championships: 4 },
      { decade: "1980s", championships: 2 },
      { decade: "1990s", championships: 1 },
      { decade: "2000s", championships: 7 },
      { decade: "2010s", championships: 0 },
      { decade: "2020s", championships: 0 }
    ]
  },
  mclaren: {
    entries: 946,
    wins: 184,
    poles: 156,
    podiums: 501,
    iconicCar: "McLaren MP4/4",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/b/b3/McLaren_MP4-4.jpg",
    championshipsDecade: [
      { decade: "1970s", championships: 1 },
      { decade: "1980s", championships: 4 },
      { decade: "1990s", championships: 3 },
      { decade: "2000s", championships: 0 },
      { decade: "2010s", championships: 0 },
      { decade: "2020s", championships: 0 }
    ]
  },
  williams: {
    entries: 802,
    wins: 114,
    poles: 128,
    podiums: 313,
    iconicCar: "Williams FW14B",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Williams_FW14B_Donington.jpg",
    championshipsDecade: [
      { decade: "1980s", championships: 4 },
      { decade: "1990s", championships: 5 },
      { decade: "2000s", championships: 0 },
      { decade: "2010s", championships: 0 },
      { decade: "2020s", championships: 0 }
    ]
  },
  mercedes: {
    entries: 300,
    wins: 125,
    poles: 137,
    podiums: 289,
    iconicCar: "Mercedes-AMG F1 W11",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Lewis_Hamilton_Mercedes_W11_2020.jpg",
    championshipsDecade: [
      { decade: "1950s", championships: 0 },
      { decade: "2010s", championships: 6 },
      { decade: "2020s", championships: 2 }
    ]
  },
  redbull: {
    entries: 375,
    wins: 115,
    poles: 95,
    podiums: 268,
    iconicCar: "Red Bull RB19",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/4/44/Red_Bull_RB19_front_right_2023.jpg",
    championshipsDecade: [
      { decade: "2010s", championships: 4 },
      { decade: "2020s", championships: 2 }
    ]
  },
  lotus: {
    entries: 491,
    wins: 79,
    poles: 107,
    podiums: 172,
    iconicCar: "Lotus 72",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Lotus_72_John_Player_Special.jpg",
    championshipsDecade: [
      { decade: "1960s", championships: 3 },
      { decade: "1970s", championships: 4 }
    ]
  },
  renault: {
    entries: 400,
    wins: 35,
    poles: 51,
    podiums: 103,
    iconicCar: "Renault R25",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/5/52/Renault_R25_front_2019_Renault_Classic.jpg",
    championshipsDecade: [
      { decade: "2000s", championships: 2 }
    ]
  },
  brabham: {
    entries: 402,
    wins: 35,
    poles: 39,
    podiums: 124,
    iconicCar: "Brabham BT46B 'Fan Car'",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Brabham_BT46B_2019_Goodwood.jpg",
    championshipsDecade: [
      { decade: "1960s", championships: 2 }
    ]
  },
  benetton: {
    entries: 260,
    wins: 27,
    poles: 15,
    podiums: 102,
    iconicCar: "Benetton B195",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Benetton_B195_front-left_2019_Michael_Schumacher_Private_Collection.jpg",
    championshipsDecade: [
      { decade: "1990s", championships: 1 }
    ]
  },
  tyrrell: {
    entries: 430,
    wins: 23,
    poles: 14,
    podiums: 77,
    iconicCar: "Tyrrell P34 'six-wheeler'",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Tyrrell_P34_front-left_2013_Donington_Goodwood.jpg",
    championshipsDecade: [
      { decade: "1970s", championships: 1 }
    ]
  },
  cooper: {
    entries: 129,
    wins: 16,
    poles: 11,
    podiums: 58,
    iconicCar: "Cooper T51",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/d/da/Cooper_T51_Climax_1959.jpg",
    championshipsDecade: [
      { decade: "1950s", championships: 1 },
      { decade: "1960s", championships: 1 }
    ]
  },
  brm: {
    entries: 197,
    wins: 17,
    poles: 11,
    podiums: 61,
    iconicCar: "BRM P57",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/a/a2/BRM_P57_1962.jpg",
    championshipsDecade: [
      { decade: "1960s", championships: 1 }
    ]
  },
  brawn: {
    entries: 17,
    wins: 8,
    poles: 5,
    podiums: 15,
    iconicCar: "Brawn BGP 001",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/d/df/Jenson_Button_Brawn_BGP001_2009.jpg",
    championshipsDecade: [
      { decade: "2000s", championships: 1 }
    ]
  }
};

const getConstructorDetails = (id) => {
  return CONSTRUCTOR_DETAILS[id] || {
    entries: 80,
    wins: 0,
    poles: 0,
    podiums: 2,
    iconicCar: "Standard F1 Spec Car",
    iconicCarImage: "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
    championshipsDecade: [
      { decade: "2020s", championships: 0 }
    ]
  };
};

const ANATOMY_PARTS = [
  {
    id: 'front_wing',
    name: 'Front Wing',
    material: 'Carbon Fiber Composite',
    purpose: 'Generates front downforce and directs air flow around the front tyres.',
    funFact: 'It can flex under high aerodynamic loads to shed drag, but the FIA strictly tests this stiffness.',
    linePoints: [[150, 70], [60, 70]],
    align: 'right'
  },
  {
    id: 'monocoque',
    name: 'Monocoque',
    material: 'Carbon-Kevlar & Honeycomb',
    purpose: 'The survival cell that houses the driver cockpit and protects them during impacts.',
    funFact: 'It is strong enough to withstand survival forces equivalent to falling from a multi-story building.',
    linePoints: [[150, 140], [50, 140]],
    align: 'right'
  },
  {
    id: 'halo',
    name: 'Halo',
    material: 'Grade 5 Titanium',
    purpose: 'A curved protective bar that shields the driver\'s head from flying debris.',
    funFact: 'Though initially criticized for its looks, it can support the weight of a double-decker London bus (12 tonnes).',
    linePoints: [[150, 190], [50, 190]],
    align: 'right'
  },
  {
    id: 'fuel_tank',
    name: 'Fuel Tank',
    material: 'Kevlar-Reinforced Rubber Bladder',
    purpose: 'Holds up to 110kg of fuel, situated directly behind the driver cockpit.',
    funFact: 'F1 fuel tanks are highly flexible, puncture-proof bladders designed to prevent fires during heavy crashes.',
    linePoints: [[150, 260], [40, 260]],
    align: 'right'
  },
  {
    id: 'floor',
    name: 'Floor',
    material: 'Carbon Fiber & Titanium Skids',
    purpose: 'Generates up to 60% of the car\'s downforce using ground-effect Venturi tunnels.',
    funFact: 'If the floor gets damaged by kerbs, a car can instantly lose up to 10-15% of its overall cornering grip.',
    linePoints: [[110, 310], [50, 310]],
    align: 'right'
  },
  {
    id: 'sidepod',
    name: 'Sidepod',
    material: 'Carbon Fiber',
    purpose: 'Houses radiators for engine cooling and shapes airflow toward the rear wing.',
    funFact: 'Teams constantly change sidepod shapes to balance engine cooling with minimal aerodynamic drag.',
    linePoints: [[195, 290], [250, 290]],
    align: 'left'
  },
  {
    id: 'mgu_k',
    name: 'MGU-K',
    material: 'High-Performance Copper & Steel',
    purpose: 'Recuperates kinetic energy under braking and delivers 120kW (160hp) of hybrid power.',
    funFact: 'MGU-K stands for Motor Generator Unit - Kinetic, and acts as both an electric generator and a motor.',
    linePoints: [[150, 345], [250, 345]],
    align: 'left'
  },
  {
    id: 'diffuser',
    name: 'Diffuser',
    material: 'Carbon Fiber',
    purpose: 'Accelerates under-car airflow to expand at the rear, creating a massive low-pressure suction.',
    funFact: 'The diffuser works in synergy with the rear wing to pull the car onto the tarmac at high speeds.',
    linePoints: [[150, 412], [250, 412]],
    align: 'left'
  },
  {
    id: 'rear_wing',
    name: 'Rear Wing',
    material: 'Carbon Fiber Composite',
    purpose: 'Generates massive rear downforce and stability at high speeds.',
    funFact: 'Rear wings create a huge aerodynamic wake (dirty air) that makes overtaking difficult for cars behind.',
    linePoints: [[150, 445], [250, 445]],
    align: 'left'
  },
  {
    id: 'drs_actuator',
    name: 'DRS Actuator',
    material: 'Electro-Hydraulic Pistons',
    purpose: 'Opens the rear wing flap to reduce drag and increase top speed on straightaways.',
    funFact: 'DRS stands for Drag Reduction System and can increase top speeds by up to 10-12 km/h when activated.',
    linePoints: [[150, 433], [60, 433]],
    align: 'right'
  }
];

function Cars() {
  const [selectedCar, setSelectedCar] = useState(CARS_DATA[0]);
  const [selectedEra, setSelectedEra] = useState(null);
  const [selectedConstructor, setSelectedConstructor] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);

  // Comparator states
  const [carAId, setCarAId] = useState(ICONIC_CARS_DATA[6].id); // Ferrari F2004 default
  const [carBId, setCarBId] = useState(ICONIC_CARS_DATA[8].id); // Mercedes W11 default

  const carA = ICONIC_CARS_DATA.find(c => c.id === carAId);
  const carB = ICONIC_CARS_DATA.find(c => c.id === carBId);

  // Drag Scroll States & Refs
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const x = useMotionValue(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  const calculateConstraints = () => {
    if (containerRef.current && innerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const innerWidth = innerRef.current.scrollWidth;
      const minDrag = containerWidth - innerWidth;
      setConstraints({ left: minDrag < 0 ? minDrag : 0, right: 0 });
    }
  };

  useEffect(() => {
    calculateConstraints();
    window.addEventListener('resize', calculateConstraints);
    return () => window.removeEventListener('resize', calculateConstraints);
  }, []);

  useEffect(() => {
    const unsubscribe = x.on("change", (latest) => {
      const maxDrag = constraints.left;
      if (maxDrag < 0) {
        const progress = (latest / maxDrag) * 100;
        setScrollProgress(Math.max(0, Math.min(100, progress)));
      }
    });
    return () => unsubscribe();
  }, [constraints]);

  const animateScroll = (direction) => {
    const step = 320;
    const currentX = x.get();
    let targetX = direction === 'left' ? currentX + step : currentX - step;
    
    targetX = Math.max(constraints.left, Math.min(constraints.right, targetX));
    animate(x, targetX, { type: 'spring', stiffness: 120, damping: 20 });
  };

  const activeConstructorDetails = selectedConstructor 
    ? getConstructorDetails(selectedConstructor.id) 
    : null;

  // Format Radar data for compared cars
  const radarData = [
    {
      subject: 'Power',
      A: carA ? Math.min((carA.horsepowerEst / 1100) * 100, 100) : 0,
      B: carB ? Math.min((carB.horsepowerEst / 1100) * 100, 100) : 0,
    },
    {
      subject: 'Speed',
      A: carA ? Math.min(((carA.topSpeedKmh - 200) / 170) * 100, 100) : 0,
      B: carB ? Math.min(((carB.topSpeedKmh - 200) / 170) * 100, 100) : 0,
    },
    {
      subject: 'Downforce',
      A: carA ? carA.downforceLevel * 10 : 0,
      B: carB ? carB.downforceLevel * 10 : 0,
    },
    {
      subject: 'Reliability',
      A: carA ? carA.reliabilityScore * 10 : 0,
      B: carB ? carB.reliabilityScore * 10 : 0,
    },
    {
      subject: 'Handling',
      A: carA ? carA.handling * 10 : 0,
      B: carB ? carB.handling * 10 : 0,
    }
  ];

  const activePart = ANATOMY_PARTS.find(p => p.id === hoveredPart);

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-16">
      {/* SECTION 1: Era Timeline Gallery */}
      <section>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Technological Heritage
          </h4>
        </div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-f1-light tracking-tight">F1 Era Timeline Gallery</h2>
            <p className="text-f1-muted text-xs mt-1">Drag or navigate through the historical technical epochs of Formula 1 design.</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => animateScroll('left')}
              className="w-10 h-10 bg-f1-panel border border-f1-border hover:border-f1-red rounded-sm flex items-center justify-center text-f1-light transition duration-300"
            >
              ◀
            </button>
            <button
              onClick={() => animateScroll('right')}
              className="w-10 h-10 bg-f1-panel border border-f1-border hover:border-f1-red rounded-sm flex items-center justify-center text-f1-light transition duration-300"
            >
              ▶
            </button>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          <motion.div
            ref={innerRef}
            drag="x"
            dragConstraints={constraints}
            style={{ x }}
            className="flex gap-6 py-4 w-max"
          >
            {erasData.map((era) => (
              <div
                key={era.id}
                onClick={() => setSelectedEra(era)}
                className="w-[300px] bg-f1-panel border border-f1-border rounded-lg overflow-hidden hover:border-f1-red/60 transition duration-300 flex flex-col group"
              >
                <div className="h-40 relative bg-[#09090f]">
                  <img 
                    src={ERA_IMAGES[era.id]} 
                    alt={era.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-f1-panel to-transparent" />
                  <span className="absolute bottom-3 left-4 text-xs bg-f1-red text-f1-light font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {era.years}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-f1-light group-hover:text-f1-red transition-colors leading-tight mb-2">
                      {era.name}
                    </h3>
                    <span className="inline-block text-[9px] bg-f1-dark text-f1-muted border border-f1-border font-bold uppercase px-2 py-1 rounded-sm mb-3">
                      ⚡ {era.engineType}
                    </span>
                    <p className="text-xs text-f1-muted leading-relaxed">
                      {era.description}
                    </p>
                  </div>

                  <span className="text-[9px] text-f1-red font-black uppercase tracking-wider block">
                    Click to examine blueprint →
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-6 w-full max-w-sm mx-auto h-1 bg-f1-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-f1-red transition-all duration-150" 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </section>

      {/* SECTION 2: Constructors Gallery */}
      <section>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Pioneering Teams
          </h4>
        </div>
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-f1-light tracking-tight">F1 Constructors Gallery</h2>
          <p className="text-f1-muted text-xs mt-1">Discover the builders and architects who defined the racing pedigree of Formula 1.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {constructorsData.map((team) => (
            <motion.div
              key={team.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedConstructor(team)}
              className="bg-f1-panel border border-f1-border rounded-lg overflow-hidden cursor-pointer hover:border-f1-red/60 transition duration-300 relative flex flex-col"
            >
              <div 
                className="h-1.5 w-full" 
                style={{ backgroundColor: team.teamColor }} 
              />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-extrabold text-lg text-f1-light leading-tight">
                      {team.name}
                    </h3>
                    <span className="text-[10px] bg-f1-dark text-f1-muted font-black px-2 py-0.5 border border-f1-border rounded-sm uppercase">
                      {team.nationality}
                    </span>
                  </div>
                  <span className="text-[10px] text-f1-muted uppercase font-bold tracking-wider mt-1 block">
                    {team.yearsActive}
                  </span>
                  
                  <div className="mt-4 pt-3 border-t border-f1-border/40">
                    <span className="text-[9px] text-f1-muted font-black uppercase tracking-wider block mb-1">Famous Drivers</span>
                    <p className="text-xs text-f1-light font-medium leading-relaxed">
                      {team.drivers.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-f1-border/40 text-xs">
                  <span className="font-bold text-f1-muted uppercase text-[9px]">Championships:</span>
                  <span className="font-black text-f1-red text-sm">{team.championships} 🏆</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 3: Car Spec Comparator */}
      <section>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Benchmark Telemetry
          </h4>
        </div>
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-f1-light tracking-tight">Car Spec Comparator</h2>
          <p className="text-f1-muted text-xs mt-1">Select and benchmark two historical or modern F1 cars to compare their performance parameters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-30">
          <div>
            <label className="block text-[10px] font-black uppercase text-f1-red mb-2 tracking-wider">Select Car A</label>
            <select
              value={carAId}
              onChange={(e) => setCarAId(e.target.value)}
              className="w-full bg-[#0f0f18] border border-f1-border text-f1-light text-xs px-4 py-3 rounded outline-none focus:ring-1 focus:ring-f1-red transition cursor-pointer"
            >
              {ICONIC_CARS_DATA.map(car => (
                <option key={`optA-${car.id}`} value={car.id} className="bg-f1-panel">
                  {car.name} ({car.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-f1-red mb-2 tracking-wider">Select Car B</label>
            <select
              value={carBId}
              onChange={(e) => setCarBId(e.target.value)}
              className="w-full bg-[#0f0f18] border border-f1-border text-f1-light text-xs px-4 py-3 rounded outline-none focus:ring-1 focus:ring-f1-red transition cursor-pointer"
            >
              {ICONIC_CARS_DATA.map(car => (
                <option key={`optB-${car.id}`} value={car.id} className="bg-f1-panel">
                  {car.name} ({car.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {carA && carB && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-f1-light mb-4 border-b border-f1-border/40 pb-2 uppercase tracking-wide">
                  Specs Head-to-Head
                </h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-f1-border text-f1-muted uppercase font-bold">
                      <th className="py-2 text-left">Spec Dimension</th>
                      <th className="py-2 text-center text-f1-red font-black text-xs sm:text-sm">{carA.name}</th>
                      <th className="py-2 text-center text-[#ffd300] font-black text-xs sm:text-sm">{carB.name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-f1-border/30 font-mono text-f1-light">
                    <tr>
                      <td className="py-3 font-bold text-f1-muted text-left">Chassis Year</td>
                      <td className="py-3 text-center">{carA.year}</td>
                      <td className="py-3 text-center">{carB.year}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-f1-muted text-left">Engine Design</td>
                      <td className="py-3 text-center">{carA.engineType}</td>
                      <td className="py-3 text-center">{carB.engineType}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-f1-muted text-left">Horsepower (Est)</td>
                      <td className={`py-3 text-center font-bold ${carA.horsepowerEst > carB.horsepowerEst ? 'text-f1-red' : ''}`}>{carA.horsepowerEst} HP</td>
                      <td className={`py-3 text-center font-bold ${carB.horsepowerEst > carA.horsepowerEst ? 'text-f1-red' : ''}`}>{carB.horsepowerEst} HP</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-f1-muted text-left">Weight</td>
                      <td className={`py-3 text-center font-bold ${carA.weightKg < carB.weightKg ? 'text-f1-red' : ''}`}>{carA.weightKg} kg</td>
                      <td className={`py-3 text-center font-bold ${carB.weightKg < carA.weightKg ? 'text-f1-red' : ''}`}>{carB.weightKg} kg</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-f1-muted text-left">Top Speed</td>
                      <td className={`py-3 text-center font-bold ${carA.topSpeedKmh > carB.topSpeedKmh ? 'text-f1-red' : ''}`}>{carA.topSpeedKmh} km/h</td>
                      <td className={`py-3 text-center font-bold ${carB.topSpeedKmh > carA.topSpeedKmh ? 'text-f1-red' : ''}`}>{carB.topSpeedKmh} km/h</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-f1-muted text-left">Downforce Level (1-10)</td>
                      <td className={`py-3 text-center font-bold ${carA.downforceLevel > carB.downforceLevel ? 'text-f1-red' : ''}`}>{carA.downforceLevel}</td>
                      <td className={`py-3 text-center font-bold ${carB.downforceLevel > carA.downforceLevel ? 'text-f1-red' : ''}`}>{carB.downforceLevel}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-f1-muted text-left">Reliability Index (1-10)</td>
                      <td className={`py-3 text-center font-bold ${carA.reliabilityScore > carB.reliabilityScore ? 'text-f1-red' : ''}`}>{carA.reliabilityScore}</td>
                      <td className={`py-3 text-center font-bold ${carB.reliabilityScore > carA.reliabilityScore ? 'text-f1-red' : ''}`}>{carB.reliabilityScore}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-f1-light mb-1 uppercase tracking-wide">
                  Car Performance Radar
                </h3>
                <p className="text-[10px] text-f1-muted mb-4 uppercase">Direct overlay benchmark across 5 design metrics.</p>
              </div>
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#1a1a24" />
                    <PolarAngleAxis dataKey="subject" stroke="#666666" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#1a1a24" />
                    <Radar 
                      name={carA.name} 
                      dataKey="A" 
                      stroke="#e10600" 
                      fill="#e10600" 
                      fillOpacity={0.2} 
                    />
                    <Radar 
                      name={carB.name} 
                      dataKey="B" 
                      stroke="#ffd300" 
                      fill="#ffd300" 
                      fillOpacity={0.2} 
                    />
                    <Legend verticalAlign="bottom" height={24} fontSize={10} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 4: Modern F1 Car Anatomy */}
      <section>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Aerodynamics & Safety
          </h4>
        </div>
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-f1-light tracking-tight">Modern F1 Car Anatomy</h2>
          <p className="text-f1-muted text-xs mt-1">Hover over labels or parts to inspect the engineering anatomy of a formula race car.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center bg-f1-panel border border-f1-border p-8 rounded-lg shadow-xl relative overflow-hidden">
          {/* Left Labels Column */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            {ANATOMY_PARTS.filter(p => p.align === 'right').map(part => (
              <div 
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                className={`p-3 rounded border transition duration-200 cursor-pointer ${
                  hoveredPart === part.id 
                    ? 'bg-f1-red/10 border-f1-red text-f1-light' 
                    : 'bg-[#09090f] border-f1-border/50 text-f1-muted hover:border-f1-border hover:text-f1-light'
                }`}
              >
                <span className="font-extrabold text-xs uppercase block">{part.name}</span>
                <span className="text-[9px] text-f1-muted block mt-0.5">{part.material}</span>
              </div>
            ))}
          </div>

          {/* Center SVG Column */}
          <div className="lg:col-span-2 flex justify-center items-center">
            <svg viewBox="0 0 300 500" className="w-[300px] h-[500px] select-none">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a24" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="300" height="500" fill="url(#grid)" />

              {/* Floor Underbody */}
              <path 
                d="M 110,240 L 190,240 L 195,380 L 180,410 L 120,410 L 105,380 Z" 
                fill={hoveredPart === 'floor' ? '#e10600' : '#1e1e2c'} 
                stroke={hoveredPart === 'floor' ? '#e10600' : '#444'} 
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredPart('floor')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* Front Wing */}
              <rect 
                x="70" y="70" width="160" height="15" rx="2" 
                fill={hoveredPart === 'front_wing' ? '#e10600' : '#2d2d3a'} 
                stroke={hoveredPart === 'front_wing' ? '#e10600' : '#666'} 
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredPart('front_wing')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* Wheels - Front Left */}
              <rect x="40" y="90" width="25" height="50" rx="3" fill="#0c0c14" stroke="#222" />
              {/* Wheels - Front Right */}
              <rect x="235" y="90" width="25" height="50" rx="3" fill="#0c0c14" stroke="#222" />

              {/* Wheels - Rear Left */}
              <rect x="35" y="360" width="30" height="60" rx="3" fill="#0c0c14" stroke="#222" />
              {/* Wheels - Rear Right */}
              <rect x="235" y="360" width="30" height="60" rx="3" fill="#0c0c14" stroke="#222" />

              {/* Suspension Arms */}
              <line x1="65" y1="115" x2="135" y2="125" stroke="#444" strokeWidth="2" />
              <line x1="65" y1="115" x2="135" y2="145" stroke="#444" strokeWidth="2" />
              <line x1="235" y1="115" x2="165" y2="125" stroke="#444" strokeWidth="2" />
              <line x1="235" y1="115" x2="165" y2="145" stroke="#444" strokeWidth="2" />

              <line x1="65" y1="390" x2="120" y2="390" stroke="#444" strokeWidth="2" />
              <line x1="65" y1="390" x2="120" y2="405" stroke="#444" strokeWidth="2" />
              <line x1="235" y1="390" x2="180" y2="390" stroke="#444" strokeWidth="2" />
              <line x1="235" y1="390" x2="180" y2="405" stroke="#444" strokeWidth="2" />

              {/* Monocoque/Chassis center body */}
              <path 
                d="M 135,85 L 165,85 L 165,190 L 180,240 L 180,390 L 120,390 L 120,240 L 135,190 Z" 
                fill={hoveredPart === 'monocoque' ? '#e10600' : '#3d3d4d'} 
                stroke={hoveredPart === 'monocoque' ? '#e10600' : '#888'} 
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredPart('monocoque')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* Halo cockpit protection */}
              <path 
                d="M 135,190 C 135,170 150,170 150,170 C 150,170 165,170 165,190 C 165,210 153,220 150,225 C 147,220 135,210 135,190 Z" 
                fill="none" 
                stroke={hoveredPart === 'halo' ? '#e10600' : '#777'} 
                strokeWidth="3.5"
                onMouseEnter={() => setHoveredPart('halo')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* Cockpit opening */}
              <ellipse cx="150" cy="210" rx="12" ry="20" fill="#08080f" />

              {/* Sidepods */}
              {/* Left Sidepod */}
              <path 
                d="M 120,240 L 95,260 L 95,340 L 120,370 Z" 
                fill={hoveredPart === 'sidepod' ? '#e10600' : '#2d2d3a'} 
                stroke={hoveredPart === 'sidepod' ? '#e10600' : '#666'} 
                strokeWidth="1"
                onMouseEnter={() => setHoveredPart('sidepod')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />
              {/* Right Sidepod */}
              <path 
                d="M 180,240 L 205,260 L 205,340 L 180,370 Z" 
                fill={hoveredPart === 'sidepod' ? '#e10600' : '#2d2d3a'} 
                stroke={hoveredPart === 'sidepod' ? '#e10600' : '#666'} 
                strokeWidth="1"
                onMouseEnter={() => setHoveredPart('sidepod')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* Fuel Tank */}
              <rect 
                x="135" y="245" width="30" height="30" rx="3"
                fill={hoveredPart === 'fuel_tank' ? '#e10600' : '#1e1e2a'} 
                stroke={hoveredPart === 'fuel_tank' ? '#e10600' : '#555'} 
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredPart('fuel_tank')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* MGU-K */}
              <rect 
                x="140" y="325" width="20" height="40" rx="2"
                fill={hoveredPart === 'mgu_k' ? '#e10600' : '#252535'} 
                stroke={hoveredPart === 'mgu_k' ? '#e10600' : '#666'} 
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredPart('mgu_k')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* Diffuser */}
              <path 
                d="M 120,405 L 180,405 L 185,420 L 115,420 Z" 
                fill={hoveredPart === 'diffuser' ? '#e10600' : '#1a1a24'} 
                stroke={hoveredPart === 'diffuser' ? '#e10600' : '#444'} 
                strokeWidth="1"
                onMouseEnter={() => setHoveredPart('diffuser')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* Rear Wing */}
              <rect 
                x="85" y="440" width="130" height="12" rx="1"
                fill={hoveredPart === 'rear_wing' ? '#e10600' : '#2d2d3a'} 
                stroke={hoveredPart === 'rear_wing' ? '#e10600' : '#555'} 
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredPart('rear_wing')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* DRS Actuator */}
              <rect 
                x="145" y="433" width="10" height="8" rx="1"
                fill={hoveredPart === 'drs_actuator' ? '#e10600' : '#0a0a0f'} 
                stroke={hoveredPart === 'drs_actuator' ? '#e10600' : '#666'} 
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredPart('drs_actuator')}
                onMouseLeave={() => setHoveredPart(null)}
                className="transition duration-200 cursor-pointer"
              />

              {/* Leader Lines */}
              {ANATOMY_PARTS.map(part => {
                const isHovered = hoveredPart === part.id;
                return (
                  <g key={`anatomy-line-${part.id}`} className="pointer-events-none">
                    <line
                      x1={part.linePoints[0][0]}
                      y1={part.linePoints[0][1]}
                      x2={part.linePoints[1][0]}
                      y2={part.linePoints[1][1]}
                      stroke={isHovered ? '#e10600' : '#44445c'}
                      strokeWidth={isHovered ? 1.5 : 0.8}
                      strokeDasharray={isHovered ? '0' : '2 2'}
                      className="transition duration-200"
                    />
                    <circle
                      cx={part.linePoints[0][0]}
                      cy={part.linePoints[0][1]}
                      r={isHovered ? 4 : 2}
                      fill={isHovered ? '#e10600' : '#888'}
                      className="transition duration-200"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right Labels Column */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            {ANATOMY_PARTS.filter(p => p.align === 'left').map(part => (
              <div 
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                className={`p-3 rounded border transition duration-200 cursor-pointer ${
                  hoveredPart === part.id 
                    ? 'bg-f1-red/10 border-f1-red text-f1-light' 
                    : 'bg-[#09090f] border-f1-border/50 text-f1-muted hover:border-f1-border hover:text-f1-light'
                }`}
              >
                <span className="font-extrabold text-xs uppercase block">{part.name}</span>
                <span className="text-[9px] text-f1-muted block mt-0.5">{part.material}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box Card */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {activePart ? (
              <motion.div 
                key={activePart.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-f1-panel border border-f1-red p-6 rounded-lg shadow-xl"
              >
                <span className="text-[9px] text-f1-red uppercase font-black tracking-widest block mb-0.5">Component Breakdown</span>
                <h4 className="text-xl font-extrabold text-f1-light tracking-tight">{activePart.name}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4 pt-4 border-t border-f1-border/40 text-xs">
                  <div>
                    <span className="text-[9px] text-f1-muted uppercase font-black block mb-0.5">Primary Material</span>
                    <span className="font-bold text-f1-light">{activePart.material}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-f1-muted uppercase font-black block mb-0.5">Engineering Purpose</span>
                    <span className="text-f1-light leading-relaxed">{activePart.purpose}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-f1-muted uppercase font-black block mb-0.5">Engineering Trivia</span>
                    <span className="text-f1-light italic leading-relaxed">"{activePart.funFact}"</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl text-center">
                <p className="text-xs text-f1-muted uppercase font-bold tracking-wider">
                  💡 Hover over any component to examine detailed blueprints.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* SECTION 5: Car Specifications & Aero */}
      <section>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Active Aerodynamics
          </h4>
        </div>
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-f1-light tracking-tight">Car Specifications & Aero</h2>
          <p className="text-f1-muted text-xs mt-1">Technical analysis of the current grid's power units, aerodynamics, and chassis configurations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-3">
            {CARS_DATA.map(car => (
              <motion.button
                key={car.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedCar(car)}
                className={`p-5 rounded-lg border text-left flex justify-between items-center transition duration-300 ${
                  selectedCar.id === car.id
                    ? 'bg-f1-panel border-f1-red text-f1-light shadow-lg'
                    : 'bg-f1-panel/40 border-f1-border text-f1-muted hover:bg-f1-panel hover:text-f1-light'
                }`}
              >
                <div>
                  <h3 className="font-bold text-lg">{car.name}</h3>
                  <p className="text-xs text-f1-muted mt-1">{car.powerUnit}</p>
                </div>
                <span className="text-f1-red text-xl">→</span>
              </motion.button>
            ))}
          </div>

          <div className="lg:col-span-2">
            <motion.div
              key={selectedCar.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-f1-panel border border-f1-border rounded-lg p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-f1-red/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="border-b border-f1-border pb-4 mb-6">
                <h2 className="text-2xl font-black text-f1-light">{selectedCar.name}</h2>
                <span className="text-xs text-f1-red uppercase font-bold tracking-widest">{selectedCar.powerUnit}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-f1-muted block font-semibold uppercase">Chassis Construction</span>
                    <span className="text-lg font-bold text-f1-light mt-1 block">{selectedCar.chassis}</span>
                  </div>
                  <div>
                    <span className="text-xs text-f1-muted block font-semibold uppercase">Minimum Weight</span>
                    <span className="text-lg font-bold text-f1-light mt-1 block">{selectedCar.weight}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-f1-muted block font-semibold uppercase">Aerodynamic Focus</span>
                    <span className="text-lg font-bold text-f1-light mt-1 block">{selectedCar.aeroEfficiency}</span>
                  </div>
                  <div>
                    <span className="text-xs text-f1-muted block font-semibold uppercase">Max engine RPM</span>
                    <span className="text-lg font-bold text-f1-light mt-1 block">{selectedCar.maxRpm}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-f1-dark/60 border border-f1-border rounded-md">
                <h4 className="text-sm font-bold text-f1-light mb-2">💡 Engineering Insight</h4>
                <p className="text-xs text-f1-muted leading-relaxed">
                  The 2026 regulations enforce strict limits on hybrid power unit components. Under these rules, cars rely on active aerodynamics and 50% electrification to maximize downforce and recuperate energy efficiently.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ERA OVERLAY MODAL */}
      <AnimatePresence>
        {selectedEra && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEra(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-f1-panel border border-f1-red rounded-lg overflow-hidden max-w-lg w-full relative"
            >
              <button 
                onClick={() => setSelectedEra(null)}
                className="absolute top-4 right-4 text-f1-muted hover:text-f1-light text-base font-bold z-10 bg-[#0f0f18]/60 p-2 rounded-full w-8 h-8 flex items-center justify-center transition duration-300"
              >
                ✕
              </button>

              <div className="relative h-56 w-full bg-[#09090f]">
                <img 
                  src={ERA_IMAGES[selectedEra.id]} 
                  alt={selectedEra.name} 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f18] via-[#0f0f18]/40 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-xs bg-f1-red text-f1-light font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {selectedEra.years}
                  </span>
                  <h2 className="text-2xl font-black text-f1-light leading-tight mt-1">
                    {selectedEra.name}
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-[#07070a] p-3.5 border border-f1-border rounded">
                  <span className="text-[9px] text-f1-red uppercase font-black tracking-wider block mb-1">Engine & Power Output</span>
                  <span className="text-xs font-bold text-f1-light leading-relaxed">{selectedEra.engineType}</span>
                </div>

                <div className="bg-[#07070a] p-3.5 border border-f1-border rounded">
                  <span className="text-[9px] text-f1-red uppercase font-black tracking-wider block mb-1">Notable Constructors</span>
                  <span className="text-xs font-bold text-f1-light leading-relaxed">{ERA_DETAILS[selectedEra.id]?.teams || "N/A"}</span>
                </div>

                <div className="bg-[#07070a] p-3.5 border border-f1-border rounded">
                  <span className="text-[9px] text-f1-red uppercase font-black tracking-wider block mb-1">Regulation & Technical Changes</span>
                  <span className="text-xs text-f1-muted leading-relaxed block">
                    {ERA_DETAILS[selectedEra.id]?.regulations || "N/A"}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONSTRUCTOR OVERLAY MODAL */}
      <AnimatePresence>
        {selectedConstructor && activeConstructorDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedConstructor(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-f1-panel border border-f1-red rounded-lg overflow-hidden max-w-xl w-full relative"
            >
              <button 
                onClick={() => setSelectedConstructor(null)}
                className="absolute top-4 right-4 text-f1-muted hover:text-f1-light text-base font-bold z-10 bg-[#0f0f18]/60 p-2 rounded-full w-8 h-8 flex items-center justify-center transition duration-300"
              >
                ✕
              </button>

              <div className="p-6 border-b border-f1-border/40 flex items-center gap-4 bg-[#09090f]">
                {selectedConstructor.logoUrl && (
                  <img 
                    src={selectedConstructor.logoUrl} 
                    alt={selectedConstructor.name} 
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h2 className="text-2xl font-black text-f1-light leading-tight">
                    {selectedConstructor.fullName}
                  </h2>
                  <div className="mt-1 flex gap-2 text-[10px] font-bold text-f1-muted uppercase">
                    <span>{selectedConstructor.nationality}</span>
                    <span>•</span>
                    <span>Years Active: {selectedConstructor.yearsActive}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#07070a] p-3 border border-f1-border rounded">
                    <span className="text-[9px] text-f1-muted uppercase font-black tracking-wider block mb-0.5">GP Entries</span>
                    <span className="text-sm font-extrabold text-f1-light">{activeConstructorDetails.entries}</span>
                  </div>
                  <div className="bg-[#07070a] p-3 border border-f1-border rounded">
                    <span className="text-[9px] text-f1-muted uppercase font-black tracking-wider block mb-0.5">GP Wins</span>
                    <span className="text-sm font-extrabold text-f1-red">{activeConstructorDetails.wins}</span>
                  </div>
                  <div className="bg-[#07070a] p-3 border border-f1-border rounded">
                    <span className="text-[9px] text-f1-muted uppercase font-black tracking-wider block mb-0.5">Pole Positions</span>
                    <span className="text-sm font-extrabold text-f1-light">{activeConstructorDetails.poles}</span>
                  </div>
                  <div className="bg-[#07070a] p-3 border border-f1-border rounded">
                    <span className="text-[9px] text-f1-muted uppercase font-black tracking-wider block mb-0.5">Podiums</span>
                    <span className="text-sm font-extrabold text-f1-light">{activeConstructorDetails.podiums}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#07070a] p-4 border border-f1-border rounded">
                  <div>
                    <span className="text-[9px] text-f1-red uppercase font-black tracking-wider block mb-1">Most Iconic Car</span>
                    <h4 className="font-extrabold text-f1-light text-base leading-tight mb-2">
                      {activeConstructorDetails.iconicCar}
                    </h4>
                    <p className="text-[10px] text-f1-muted leading-relaxed">
                      Representing the pinnacle of their design history, this chassis delivered outstanding aerodynamics and racing dominance.
                    </p>
                  </div>
                  <div className="h-28 rounded overflow-hidden bg-[#09090f]">
                    <img 
                      src={activeConstructorDetails.iconicCarImage} 
                      alt={activeConstructorDetails.iconicCar} 
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>

                {selectedConstructor.championships > 0 && (
                  <div>
                    <span className="text-[10px] text-f1-muted font-bold uppercase tracking-wider block mb-3">
                      World Championships per Decade
                    </span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activeConstructorDetails.championshipsDecade} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" opacity={0.4} />
                          <XAxis dataKey="decade" stroke="#666666" fontSize={9} tickLine={false} />
                          <YAxis stroke="#666666" fontSize={9} tickLine={false} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f0f18', 
                              borderColor: '#1a1a24', 
                              color: '#f0f0f0',
                              borderRadius: '4px',
                              fontSize: '10px'
                            }}
                          />
                          <Bar 
                            dataKey="championships" 
                            fill={selectedConstructor.teamColor} 
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cars;
