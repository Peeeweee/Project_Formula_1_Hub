import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, animate, AnimatePresence, useTransform } from 'framer-motion';
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
import FadeInSection from '../components/FadeInSection';
import getWikipediaImage from '../utils/getWikipediaImage';
import carVault from '../data/carVault.json';
import CarViewer3D from '../components/CarViewer3D';
import CarViewer2D from '../components/CarViewer2D';
import CarVaultFilters from '../components/CarVaultFilters';
import { PlotlyTooltip } from '../components';

class LocalErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div style={{color: 'red', padding: '20px', zIndex: 9999, position: 'relative', background: 'black', width: '100%', height: '100%', fontSize: '20px'}}>{this.state.error.toString()}<br/><pre>{this.state.error.stack}</pre></div>;
    }
    return this.props.children;
  }
}

const TeamLogo = ({ team, size = "small" }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  const isSmall = size === "small";
  const containerClass = isSmall 
    ? "w-12 h-12 rounded-xl p-1 border border-white/5 shadow-md aspect-square" 
    : "h-20 min-w-[5rem] max-w-[16rem] px-3 py-1.5 rounded-2xl border border-white/5 shadow-xl";

  const fallbackText = team.name.substring(0, 2).toUpperCase();
  const color = team.teamColor || '#e10600';

  return (
    <div 
      className={`relative bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f] flex items-center justify-center shrink-0 overflow-hidden transition-all duration-500 group/logo ${containerClass}`}
      style={{ boxShadow: `0 4px 20px ${color}15` }}
    >
      {/* Elegant Hover Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover/logo:opacity-20 transition-opacity duration-700 blur-xl"
        style={{ backgroundColor: color }}
      />
      
      {(!team.logoUrl || imgError) ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative z-10 flex flex-col items-center justify-center w-full h-full"
        >
          <span 
            className="font-black uppercase italic text-white/30 tracking-tighter transition-transform duration-300 group-hover/logo:scale-110" 
            style={{ fontSize: isSmall ? '16px' : '26px' }}
          >
            {fallbackText}
          </span>
          <div 
            className="absolute bottom-1 w-1/2 h-[3px] rounded-full opacity-60 group-hover/logo:opacity-100 transition-opacity"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          />
        </motion.div>
      ) : (
        <div className="relative z-10 w-full h-full flex items-center justify-center rounded-lg overflow-hidden bg-black/40">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-white/5" />
          )}
          <motion.img 
            src={team.logoUrl} 
            alt={team.name} 
            className={`max-w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] transition-all duration-700 ease-out group-hover/logo:scale-110 group-hover/logo:-rotate-3 ${imgLoaded ? 'opacity-100' : 'opacity-0 scale-95'}`}
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </div>
      )}
    </div>
  );
};

const CarCard = ({ car, onClick, imageCache = {}, setImageCache = () => {} }) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (imageCache[car.carId]) {
      setImgUrl(imageCache[car.carId]);
      setLoading(false);
      return;
    }
    let isMounted = true;
    getWikipediaImage(car.wikiSearchTerm).then(url => {
      if (!isMounted) return;
      setImgUrl(url);
      setLoading(false);
      if (url) {
        setImageCache(prev => ({ ...prev, [car.carId]: url }));
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [car.wikiSearchTerm, car.carId, imageCache, setImageCache]);

  const driversText = Array.isArray(car.drivers) ? car.drivers : (car.driver ? car.driver.split(',').map(s=>s.trim()) : []);
  const displayDrivers = driversText.slice(0, 2).join(', ');
  const driverSuffix = driversText.length > 2 ? ` +${driversText.length - 2} more` : '';

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="group relative h-[240px] bg-[#0f0f18] rounded-lg overflow-hidden border border-[#2a2a2a] cursor-pointer flex flex-col transition-colors duration-150"
      style={{ '--hover-border': car.teamColor }}
    >
      <style>{`
        .group:hover { border-color: var(--hover-border); }
      `}</style>
      <div className="h-1 w-full shrink-0" style={{ backgroundColor: car.teamColor }} />
      <div className="h-[120px] bg-black relative flex items-center justify-center overflow-hidden shrink-0">
        {loading ? (
          <div className="w-full h-full bg-[#1a1a24] animate-pulse" />
        ) : imgUrl ? (
          <img src={imgUrl} alt={car.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <span className="text-4xl font-black text-white/10 uppercase">{car.name.substring(0, 2)}</span>
        )}
      </div>
      <div className="h-[100px] p-3 flex flex-col justify-between relative shrink-0">
        <div className="absolute top-[-10px] left-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-[#0a0a0f] shadow" style={{ backgroundColor: car.eraColor }}>
          {car.eraName}
        </div>
        {car.isChampionshipCar && (
          <div className="absolute top-[-10px] right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow">
            🏆 WCC
          </div>
        )}
        <div className="mt-2">
          <h3 className="text-[13px] font-bold text-white leading-tight line-clamp-2">{car.name}</h3>
          <p className="text-[11px] text-f1-muted mt-0.5">{car.team} • {car.year}</p>
        </div>
        <p className="text-[10px] italic text-f1-muted/80 truncate">
          {displayDrivers}{driverSuffix}
        </p>
      </div>
      <div className="absolute bottom-2 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        <button className="w-full py-1.5 border border-f1-red text-f1-red text-[11px] font-bold uppercase rounded bg-[#0f0f18]/90 backdrop-blur-sm transition-colors pointer-events-auto">
          View Car
        </button>
      </div>
    </motion.div>
  );
};

const EraCard = ({ era, onClick }) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getWikipediaImage(era.wikiSearchTerm).then(url => {
      if (!isMounted) return;
      if (url) {
        setImgUrl(url);
      } else {
        setImgUrl(ERA_IMAGES[era.id] || null);
      }
      setLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setImgUrl(ERA_IMAGES[era.id] || null);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [era.wikiSearchTerm, era.id]);

  return (
    <div
      onClick={() => onClick(imgUrl)}
      className="w-[300px] bg-f1-panel border border-f1-border rounded-lg overflow-hidden hover:border-f1-red/60 transition duration-300 flex flex-col group shrink-0 cursor-pointer"
    >
      <div className="h-40 relative bg-[#09090f] flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="w-full h-full bg-[#1a1a24] animate-pulse" />
        ) : imgUrl ? (
          <img 
            src={imgUrl} 
            alt={era.name} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 pointer-events-none"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = ERA_IMAGES[era.id];
            }}
          />
        ) : (
          <span className="text-lg font-black text-white/50 text-center px-4">{era.name}</span>
        )}
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
  );
};

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
  early_years: 'https://images.unsplash.com/photo-1544829728-e5cb9eedc20e?auto=format&fit=crop&q=80&w=800',
  rear_engine: 'https://images.unsplash.com/photo-1616004975510-9114f7b60da4?auto=format&fit=crop&q=80&w=800',
  wings_dfv: 'https://images.unsplash.com/photo-1574526315843-c0d235c5c00e?auto=format&fit=crop&q=80&w=800',
  turbo_ground_effect: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
  v10_era: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
  v8_era: 'https://images.unsplash.com/photo-1506469717960-433cebe3f181?auto=format&fit=crop&q=80&w=800',
  turbo_hybrid: 'https://images.unsplash.com/photo-1535732820275-9ffd998cac22?auto=format&fit=crop&q=80&w=800',
  ground_effect_hybrid: 'https://images.unsplash.com/photo-1707038166547-8a8f15d74268?auto=format&fit=crop&q=80&w=800'
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
    iconicCarImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
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
    iconicCarImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
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
    iconicCarImage: "https://images.unsplash.com/photo-1574526315843-c0d235c5c00e?auto=format&fit=crop&q=80&w=800",
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
    iconicCarImage: "https://images.unsplash.com/photo-1535732820275-9ffd998cac22?auto=format&fit=crop&q=80&w=800",
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
    iconicCarImage: "https://images.unsplash.com/photo-1707038166547-8a8f15d74268?auto=format&fit=crop&q=80&w=800",
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
    iconicCarImage: "https://images.unsplash.com/photo-1616004975510-9114f7b60da4?auto=format&fit=crop&q=80&w=800",
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
    iconicCarImage: "https://images.unsplash.com/photo-1506469717960-433cebe3f181?auto=format&fit=crop&q=80&w=800",
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
    iconicCarImage: "https://images.unsplash.com/photo-1544829728-e5cb9eedc20e?auto=format&fit=crop&q=80&w=800",
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
    iconicCarImage: "https://images.unsplash.com/photo-1592919119100-a54823485750?auto=format&fit=crop&q=80&w=800",
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
  // LEFT SIDE LABELS
  {
    id: 'front_wing',
    name: 'Front Wing',
    material: 'Carbon Fiber Composite',
    purpose: 'Generates front downforce and directs air flow around the front tyres.',
    funFact: 'It can flex under high aerodynamic loads to shed drag, but the FIA strictly tests this stiffness.',
    hotspot: { cx: 600, cy: 165, rx: 160, ry: 30 },
    lineTarget: { x: 350, y: 120 },
    labelPos: { left: '4%', top: '15%' },
    align: 'left'
  },
  {
    id: 'monocoque',
    name: 'Monocoque',
    material: 'Carbon-Kevlar & Honeycomb',
    purpose: 'The survival cell that houses the driver cockpit and protects them during impacts.',
    funFact: 'It is strong enough to withstand survival forces equivalent to falling from a multi-story building.',
    hotspot: { cx: 600, cy: 375, rx: 40, ry: 75 },
    lineTarget: { x: 350, y: 256 },
    labelPos: { left: '4%', top: '32%' },
    align: 'left'
  },
  {
    id: 'fuel_tank',
    name: 'Fuel Tank',
    material: 'Kevlar-Reinforced Rubber Bladder',
    purpose: 'Holds up to 110kg of fuel, situated directly behind the driver cockpit.',
    funFact: 'F1 fuel tanks are highly flexible, puncture-proof bladders designed to prevent fires during heavy crashes.',
    hotspot: { cx: 600, cy: 480, rx: 35, ry: 30 },
    lineTarget: { x: 350, y: 392 },
    labelPos: { left: '4%', top: '49%' },
    align: 'left'
  },
  {
    id: 'sidepod',
    name: 'Sidepod',
    material: 'Carbon Fiber',
    purpose: 'Houses radiators for engine cooling and shapes airflow toward the rear wing.',
    funFact: 'Teams constantly change sidepod shapes to balance engine cooling with minimal aerodynamic drag.',
    hotspot: { cx: 520, cy: 500, rx: 40, ry: 100 },
    lineTarget: { x: 350, y: 528 },
    labelPos: { left: '4%', top: '66%' },
    align: 'left'
  },
  {
    id: 'floor',
    name: 'Floor',
    material: 'Carbon Fiber & Titanium Skids',
    purpose: 'Generates up to 60% of the car\'s downforce using ground-effect Venturi tunnels.',
    funFact: 'If the floor gets damaged by kerbs, a car can instantly lose up to 10-15% of its overall cornering grip.',
    hotspot: { cx: 480, cy: 600, rx: 60, ry: 150 },
    lineTarget: { x: 350, y: 664 },
    labelPos: { left: '4%', top: '83%' },
    align: 'left'
  },
  // RIGHT SIDE LABELS
  {
    id: 'halo',
    name: 'Halo',
    material: 'Grade 5 Titanium',
    purpose: 'A curved protective bar that shields the driver\'s head from flying debris.',
    funFact: 'Though initially criticized for its looks, it can support the weight of a double-decker London bus (12 tonnes).',
    hotspot: { cx: 600, cy: 390, rx: 45, ry: 35 },
    lineTarget: { x: 850, y: 200 },
    labelPos: { right: '4%', top: '25%' },
    align: 'right'
  },
  {
    id: 'mgu_k',
    name: 'MGU-K',
    material: 'High-Performance Copper & Steel',
    purpose: 'Recuperates kinetic energy under braking and delivers 120kW (160hp) of hybrid power.',
    funFact: 'MGU-K stands for Motor Generator Unit - Kinetic, and acts as both an electric generator and a motor.',
    hotspot: { cx: 600, cy: 600, rx: 25, ry: 35 },
    lineTarget: { x: 850, y: 320 },
    labelPos: { right: '4%', top: '40%' },
    align: 'right'
  },
  {
    id: 'drs_actuator',
    name: 'DRS Actuator',
    material: 'Electro-Hydraulic Pistons',
    purpose: 'Opens the rear wing flap to reduce drag and increase top speed on straightaways.',
    funFact: 'DRS stands for Drag Reduction System and can increase top speeds by up to 10-12 km/h when activated.',
    hotspot: { cx: 600, cy: 735, rx: 15, ry: 20 },
    lineTarget: { x: 850, y: 440 },
    labelPos: { right: '4%', top: '55%' },
    align: 'right'
  },
  {
    id: 'diffuser',
    name: 'Diffuser',
    material: 'Carbon Fiber',
    purpose: 'Accelerates under-car airflow to expand at the rear, creating a massive low-pressure suction.',
    funFact: 'The diffuser works in synergy with the rear wing to pull the car onto the tarmac at high speeds.',
    hotspot: { cx: 600, cy: 755, rx: 90, ry: 25 },
    lineTarget: { x: 850, y: 560 },
    labelPos: { right: '4%', top: '70%' },
    align: 'right'
  },
  {
    id: 'rear_wing',
    name: 'Rear Wing',
    material: 'Carbon Fiber Composite',
    purpose: 'Generates massive rear downforce and stability at high speeds.',
    funFact: 'Rear wings create a huge aerodynamic wake (dirty air) that makes overtaking difficult for cars behind.',
    hotspot: { cx: 600, cy: 755, rx: 130, ry: 20 },
    lineTarget: { x: 850, y: 680 },
    labelPos: { right: '4%', top: '85%' },
    align: 'right'
  }
];

function Cars() {
  const [selectedCar, setSelectedCar] = useState(CARS_DATA[0]);
  const [selectedEra, setSelectedEra] = useState(null);
  const [selectedConstructor, setSelectedConstructor] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);


  // Comparator states
  const [carAId, setCarAId] = useState('ferrari-f2004'); // Ferrari F2004 default
  const [carBId, setCarBId] = useState('mercedes-w11'); // Mercedes W11 default

  // Drag Scroll States & Refs
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const x = useMotionValue(0);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  const progressWidth = useTransform(
    x,
    [0, constraints.left || -1],
    ["0%", "100%"]
  );

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
    // Use a tiny timeout to ensure fonts/images have rendered before grabbing width
    const timeout = setTimeout(calculateConstraints, 100);
    window.addEventListener('resize', calculateConstraints);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', calculateConstraints);
    };
  }, []);

  const animateScroll = (direction) => {
    const step = 320;
    
    // Dynamically recalculate in case layout changed
    let maxLeft = constraints.left;
    if (containerRef.current && innerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const innerWidth = innerRef.current.scrollWidth;
      maxLeft = Math.min(0, containerWidth - innerWidth);
      if (maxLeft !== constraints.left) {
        setConstraints({ left: maxLeft, right: 0 });
      }
    }

    const currentX = x.get();
    let targetX = direction === 'left' ? currentX + step : currentX - step;
    
    targetX = Math.max(maxLeft, Math.min(0, targetX));
    animate(x, targetX, { type: 'spring', stiffness: 120, damping: 20 });
  };

  const activeConstructorDetails = selectedConstructor 
    ? getConstructorDetails(selectedConstructor.id) 
    : null;

  // Format Radar data for compared cars (moved below allCars initialization)

  const activePart = ANATOMY_PARTS.find(p => p.id === hoveredPart);

  // --- CAR VAULT LOGIC ---
  const allCars = React.useMemo(() => {
    return carVault.flatMap(era => era.cars.map(car => ({ ...car, eraName: era.eraName, eraColor: era.eraColor })));
  }, []);

  const carA = allCars.find(c => c.carId === carAId) || allCars[0];
  const carB = allCars.find(c => c.carId === carBId) || allCars[1];

  const getHandlingScore = (car) => {
    if (!car) return 0;
    return Math.min(10, Math.max(1, Math.round(car.downforceLevel * 0.8 + (1000 - car.weightKg)/1000 * 2 + (car.year > 2000 ? 1 : 0))));
  };

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
      A: carA ? getHandlingScore(carA) * 10 : 0,
      B: carB ? getHandlingScore(carB) * 10 : 0,
    }
  ];

  const eraMap = React.useMemo(() => {
    return Object.fromEntries(carVault.map(e => [e.eraId, e]));
  }, []);

  const [filteredCars, setFilteredCars] = useState(allCars);
  const [vaultSelectedCar, setVaultSelectedCar] = useState(null);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [isGroupedView, setIsGroupedView] = useState(false);
  const [imageCache, setImageCache] = useState({});

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!vaultSelectedCar) return;
      if (e.key === 'Escape') {
        setVaultSelectedCar(null);
      } else if (e.key === 'ArrowLeft') {
        if (selectedCarIndex > 0) {
          setVaultSelectedCar(filteredCars[selectedCarIndex - 1]);
          setSelectedCarIndex(selectedCarIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (selectedCarIndex < filteredCars.length - 1) {
          setVaultSelectedCar(filteredCars[selectedCarIndex + 1]);
          setSelectedCarIndex(selectedCarIndex + 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vaultSelectedCar, selectedCarIndex, filteredCars]);

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-16">
      {/* SECTION 1: Era Timeline Gallery */}
      <FadeInSection>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Technological Heritage
          </h4>
        </div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light tracking-tight">F1 Era Timeline Gallery</h2>
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

        <div className="md:hidden text-[10px] text-f1-muted pb-2 animate-pulse text-center w-full">
          ← Swipe to explore eras →
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
              <EraCard key={era.id} era={era} onClick={(imgUrl) => setSelectedEra({ ...era, displayImage: imgUrl })} />
            ))}
          </motion.div>
        </div>

        <div className="mt-6 w-full max-w-sm mx-auto h-1 bg-f1-border rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-f1-red transition-all duration-150" 
            style={{ width: progressWidth }}
          />
        </div>
      </FadeInSection>

      {/* SECTION 2: Constructors Gallery */}
      <FadeInSection>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Pioneering Teams
          </h4>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light tracking-tight">F1 Constructors Gallery</h2>
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
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 relative overflow-hidden">
                {/* Background Watermark Logo */}
                {team.logoUrl && (
                  <div className="absolute -top-4 -right-4 w-32 h-32 opacity-10 pointer-events-none mix-blend-screen">
                    <img src={team.logoUrl} alt="" className="w-full h-full object-contain scale-110" referrerPolicy="no-referrer" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <TeamLogo team={team} size="small" />
                      <div>
                        <h3 className="font-extrabold text-lg text-f1-light leading-tight">
                          {team.name}
                        </h3>
                        <span className="text-[10px] text-f1-muted uppercase font-bold tracking-wider mt-0.5 block">
                          {team.yearsActive}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-f1-dark text-f1-muted font-black px-2 py-0.5 border border-f1-border rounded-sm uppercase shrink-0">
                      {team.nationality}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-f1-border/40">
                    <span className="text-[9px] text-f1-muted font-black uppercase tracking-wider block mb-1">Famous Drivers</span>
                    <p className="text-xs text-f1-light font-medium leading-relaxed">
                      {team.drivers.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-f1-border/40 text-xs relative z-10">
                  <span className="font-bold text-f1-muted uppercase text-[9px]">Championships:</span>
                  <span className="font-black text-f1-red text-sm">{team.championships} 🏆</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </FadeInSection>

      {/* SECTION: Car Vault */}
      <FadeInSection>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Interactive Encyclopedia
          </h4>
        </div>
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light tracking-tight">Car Vault</h2>
            <p className="text-f1-muted text-xs mt-1">89 iconic F1 cars from 1950 to today — explore every era.</p>
          </div>
          
          <div className="flex bg-[#1a1a24] p-1 rounded-lg border border-[#2a2a2a] shrink-0">
            <button 
              onClick={() => setIsGroupedView(false)}
              className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${!isGroupedView ? 'bg-[#2a2a35] text-white' : 'text-f1-muted hover:text-white'}`}
            >
              Grid View
            </button>
            <button 
              onClick={() => setIsGroupedView(true)}
              className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${isGroupedView ? 'bg-[#2a2a35] text-white' : 'text-f1-muted hover:text-white'}`}
            >
              Era Groups
            </button>
          </div>
        </div>

        <CarVaultFilters cars={allCars} onFilterChange={setFilteredCars} />

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {isGroupedView ? (
              <motion.div key="grouped" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {carVault.map(era => {
                  const eraCars = filteredCars.filter(c => c.eraId === era.eraId);
                  if (eraCars.length === 0) return null;
                  return (
                    <div key={era.eraId} className="mb-10">
                      <div className="mb-4 pb-2 border-b border-[#2a2a2a] flex items-end gap-4">
                        <h3 className="text-xl font-black" style={{ color: era.eraColor }}>{era.eraName}</h3>
                        <span className="text-xs text-f1-muted font-bold mb-1">{era.years}</span>
                        <span className="text-[10px] text-f1-muted ml-auto mb-1">{eraCars.length} cars</span>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                        {eraCars.map((car) => (
                          <div key={car.carId} className="w-[260px] shrink-0 snap-start">
                            <CarCard 
                              car={car} 
                              imageCache={imageCache} 
                              setImageCache={setImageCache} 
                              onClick={() => {
                                setVaultSelectedCar(car);
                                setSelectedCarIndex(filteredCars.findIndex(c => c.carId === car.carId));
                              }} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="grid" layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredCars.map((car) => (
                    <CarCard 
                      key={car.carId}
                      car={car} 
                      imageCache={imageCache}
                      setImageCache={setImageCache}
                      onClick={() => {
                        setVaultSelectedCar(car);
                        setSelectedCarIndex(filteredCars.indexOf(car));
                      }} 
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {vaultSelectedCar && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/92 z-[100] flex items-center justify-center p-2 sm:p-4"
            >
              <LocalErrorBoundary>
              <div className="w-full max-w-[1000px] max-h-[90vh] bg-[#0f0f18] border border-[#2a2a2a] rounded-xl flex flex-col relative overflow-hidden shadow-2xl">
                
                <button 
                  onClick={() => {
                    if (selectedCarIndex > 0) {
                      setVaultSelectedCar(filteredCars[selectedCarIndex - 1]);
                      setSelectedCarIndex(selectedCarIndex - 1);
                    }
                  }}
                  disabled={selectedCarIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1a1a24] text-white flex items-center justify-center z-50 hover:bg-f1-red disabled:opacity-30 disabled:hover:bg-[#1a1a24] transition-all"
                >
                  ◀
                </button>
                <button 
                  onClick={() => {
                    if (selectedCarIndex < filteredCars.length - 1) {
                      setVaultSelectedCar(filteredCars[selectedCarIndex + 1]);
                      setSelectedCarIndex(selectedCarIndex + 1);
                    }
                  }}
                  disabled={selectedCarIndex === filteredCars.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1a1a24] text-white flex items-center justify-center z-50 hover:bg-f1-red disabled:opacity-30 disabled:hover:bg-[#1a1a24] transition-all"
                >
                  ▶
                </button>

                <div className="flex justify-between items-center p-4 border-b border-[#2a2a2a] bg-[#1a1a24] shrink-0 pl-14 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-black uppercase text-[#0a0a0f]" style={{ backgroundColor: vaultSelectedCar.eraColor }}>
                      {vaultSelectedCar.eraName}
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.div key={vaultSelectedCar.carId} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <h2 className="text-xl font-black text-white leading-tight">{vaultSelectedCar.name}</h2>
                        <div className="text-[11px] text-f1-muted font-bold">{vaultSelectedCar.team} • {vaultSelectedCar.year}</div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => setVaultSelectedCar(null)}
                    className="w-8 h-8 rounded-full bg-[#2a2a35] hover:bg-f1-red text-white flex items-center justify-center transition-colors shrink-0"
                  >
                    ✕
                  </motion.button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-12 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={vaultSelectedCar.carId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col md:flex-row gap-6 md:gap-8"
                    >
                      <div className="w-full md:w-[55%] flex flex-col gap-6">
                        <div className="h-[300px] md:h-[360px] bg-[#0a0a0f] rounded-lg border border-[#2a2a2a] overflow-hidden flex items-center justify-center shadow-inner relative">
                          <CarViewer2D car={vaultSelectedCar} />
                        </div>
                        {imageCache[vaultSelectedCar.carId] && (
                          <div>
                            <h4 className="text-[10px] text-f1-muted font-bold uppercase tracking-wider mb-2">Historical Reference Photo</h4>
                            <div className="w-full aspect-video rounded-lg overflow-hidden border border-[#2a2a2a]">
                              <img src={imageCache[vaultSelectedCar.carId]} alt={vaultSelectedCar.name} className="w-full h-full object-cover" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-[45%] flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#1a1a24] p-3 border border-[#2a2a2a] rounded">
                            <div className="text-[9px] text-f1-muted uppercase font-black tracking-wider mb-1">Engine</div>
                            <div className="text-sm font-extrabold text-white truncate">{vaultSelectedCar.engineType}</div>
                          </div>
                          <div className="bg-[#1a1a24] p-3 border border-[#2a2a2a] rounded">
                            <div className="text-[9px] text-f1-muted uppercase font-black tracking-wider mb-1">Power</div>
                            <div className="text-sm font-extrabold text-white">{vaultSelectedCar.horsepowerEst} hp <span className="text-[10px] font-normal text-f1-muted">(est.)</span></div>
                          </div>
                          <div className="bg-[#1a1a24] p-3 border border-[#2a2a2a] rounded">
                            <div className="text-[9px] text-f1-muted uppercase font-black tracking-wider mb-1">Weight</div>
                            <div className="text-sm font-extrabold text-white">{vaultSelectedCar.weightKg} kg</div>
                          </div>
                          <div className="bg-[#1a1a24] p-3 border border-[#2a2a2a] rounded">
                            <div className="text-[9px] text-f1-muted uppercase font-black tracking-wider mb-1">Top Speed</div>
                            <div className="text-sm font-extrabold text-white">{vaultSelectedCar.topSpeedKmh} km/h</div>
                          </div>
                          <div className="bg-[#1a1a24] p-3 border border-[#2a2a2a] rounded col-span-2 sm:col-span-1">
                            <div className="text-[9px] text-f1-muted uppercase font-black tracking-wider mb-1 flex justify-between">
                              Downforce <span>{vaultSelectedCar.downforceLevel}/10</span>
                            </div>
                            <div className="flex gap-1 h-2 mt-2">
                              {[...Array(10)].map((_, i) => (
                                <div key={i} className={`flex-1 rounded-full ${i < vaultSelectedCar.downforceLevel ? 'bg-f1-red' : 'bg-[#333]'}`} />
                              ))}
                            </div>
                          </div>
                          <div className="bg-[#1a1a24] p-3 border border-[#2a2a2a] rounded col-span-2 sm:col-span-1">
                            <div className="text-[9px] text-f1-muted uppercase font-black tracking-wider mb-1 flex justify-between">
                              Reliability <span>{vaultSelectedCar.reliabilityScore}/10</span>
                            </div>
                            <div className="flex gap-1 h-2 mt-2">
                              {[...Array(10)].map((_, i) => (
                                <div key={i} className={`flex-1 rounded-full ${i < vaultSelectedCar.reliabilityScore ? 'bg-[#52B788]' : 'bg-[#333]'}`} />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] text-f1-muted font-bold uppercase tracking-wider mb-2">Drivers</h4>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(vaultSelectedCar.drivers) ? vaultSelectedCar.drivers.map(d => (
                              <span key={d} className="px-3 py-1 bg-[#2a2a35] text-white text-[11px] rounded font-bold">{d}</span>
                            )) : (vaultSelectedCar.driver || '').split(',').map(d => (
                              <span key={d.trim()} className="px-3 py-1 bg-[#2a2a35] text-white text-[11px] rounded font-bold">{d.trim()}</span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] text-f1-muted font-bold uppercase tracking-wider mb-2">Championships</h4>
                          <div className="text-[13px] font-bold text-white flex items-center gap-2">
                            {vaultSelectedCar.championships > 0 ? (
                              <>
                                <span className="text-yellow-500 text-lg">🏆</span>
                                {vaultSelectedCar.championships} World Championship(s)
                              </>
                            ) : (
                              <span className="text-f1-muted font-normal italic text-xs">No championships won with this car.</span>
                            )}
                          </div>
                        </div>

                        <div className="text-[13px] leading-[1.7] text-f1-muted border-t border-[#2a2a2a] pt-4">
                          {vaultSelectedCar.description}
                        </div>

                        {vaultSelectedCar.funFact && (
                          <div className="border-l-4 border-f1-red pl-4 py-3 bg-[#1a1a24]/50 rounded-r">
                            <span className="block text-[10px] font-black uppercase text-f1-red mb-1">Did you know?</span>
                            <p className="text-[12px] italic text-white leading-relaxed">{vaultSelectedCar.funFact}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              </LocalErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </FadeInSection>

      {/* SECTION 3: Car Spec Comparator */}
      <FadeInSection>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Benchmark Telemetry
          </h4>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light tracking-tight">Car Spec Comparator</h2>
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
              {allCars.map(car => (
                <option key={`optA-${car.carId}`} value={car.carId} className="bg-f1-panel">
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
              {allCars.map(car => (
                <option key={`optB-${car.carId}`} value={car.carId} className="bg-f1-panel">
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
      </FadeInSection>

      {/* SECTION 4: Modern F1 Car Anatomy */}
      <FadeInSection>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Aerodynamics & Safety
          </h4>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light tracking-tight">Modern F1 Car Anatomy</h2>
          <p className="text-f1-muted text-xs mt-1">Hover over labels or parts to inspect the engineering anatomy of a formula race car.</p>
        </div>

        <div className="bg-[#07070a] border border-[#1a1a24] rounded-xl shadow-[0_30px_60px_-15px_rgba(225,6,0,0.15)] relative overflow-hidden group/anatomy aspect-square md:aspect-[3/2] w-full max-w-[1400px] mx-auto flex items-center justify-center min-h-[600px]">
          
          {/* Glowing Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-f1-red/10 via-[#07070a]/20 to-transparent opacity-40 pointer-events-none mix-blend-screen transition-opacity duration-1000 group-hover/anatomy:opacity-70" />
          
          {/* Grid lines inside the box */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Unified SVG Layout (1200x800 coordinate space) */}
          <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full pointer-events-none z-20 select-none filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id="neonGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e10600" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#800000" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="carbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1a24" />
                <stop offset="100%" stopColor="#07070a" />
              </linearGradient>
              <linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#444" />
                <stop offset="50%" stopColor="#888" />
                <stop offset="100%" stopColor="#444" />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <pattern id="carbonPattern" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#111" />
                <path d="M0,0 L4,4 M4,0 L0,4" stroke="#222" strokeWidth="1" />
              </pattern>
            </defs>

            {/* --- HYPER-REALISTIC CODED F1 CAR SVG DRAWING --- */}
            <g className="transition-all duration-1000 ease-in-out origin-center">
              {/* Background floor shadow (Organic shape) */}
              <path d="M 590,120 C 650,120 720,150 750,200 C 780,300 780,400 760,500 C 750,600 700,750 600,770 C 500,750 450,600 440,500 C 420,400 420,300 450,200 C 480,150 550,120 590,120 Z" fill="url(#neonGlow)" filter="url(#glowEffect)" opacity="0.15" className="animate-pulse" />

              {/* FLOOR */}
              <g filter={hoveredPart === 'floor' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <path d="M 480,330 C 450,400 440,500 450,620 C 455,660 480,720 510,740 L 690,740 C 720,720 745,660 750,620 C 760,500 750,400 720,330 C 700,300 650,250 600,250 C 550,250 500,300 480,330 Z" fill="url(#carbonPattern)" stroke={hoveredPart === 'floor' ? '#e10600' : '#222'} strokeWidth={hoveredPart === 'floor' ? 4 : 2} />
              </g>

              {/* FRONT WING */}
              <g filter={hoveredPart === 'front_wing' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <path d="M 460,180 C 500,140 550,130 600,125 C 650,130 700,140 740,180 C 740,190 730,195 720,190 C 680,160 620,150 600,150 C 580,150 520,160 480,190 C 470,195 460,190 460,180 Z" fill="#07070a" stroke={hoveredPart === 'front_wing' ? '#fff' : '#e10600'} strokeWidth={hoveredPart === 'front_wing' ? 3 : 2} />
                <path d="M 470,170 C 520,130 570,110 600,110 C 630,110 680,130 730,170 C 735,160 740,140 740,140 C 680,100 620,80 600,80 C 580,80 520,100 460,140 C 460,140 465,160 470,170 Z" fill="url(#carbon)" stroke={hoveredPart === 'front_wing' ? '#e10600' : '#333'} strokeWidth="1" />
                <path d="M 450,130 Q 440,160 460,190 L 465,185 Q 450,160 460,130 Z" fill={hoveredPart === 'front_wing' ? '#fff' : '#e10600'} />
                <path d="M 750,130 Q 760,160 740,190 L 735,185 Q 750,160 740,130 Z" fill={hoveredPart === 'front_wing' ? '#fff' : '#e10600'} />
              </g>

              {/* FRONT SUSPENSION */}
              <g className="transition-all duration-300">
                <path d="M 420,240 L 580,260 M 420,250 L 575,280 M 420,280 L 565,310" stroke="#777" strokeWidth="3" fill="none" />
                <path d="M 780,240 L 620,260 M 780,250 L 625,280 M 780,280 L 635,310" stroke="#777" strokeWidth="3" fill="none" />
              </g>

              {/* FRONT WHEELS */}
              <g>
                <rect x="385" y="210" width="45" height="110" rx="10" fill="#050508" stroke="#222" strokeWidth="3" />
                <rect x="770" y="210" width="45" height="110" rx="10" fill="#050508" stroke="#222" strokeWidth="3" />
                <ellipse cx="407" cy="265" rx="18" ry="45" fill="#111" stroke="#333" strokeWidth="2" />
                <ellipse cx="792" cy="265" rx="18" ry="45" fill="#111" stroke="#333" strokeWidth="2" />
              </g>

              {/* MONOCOQUE & COCKPIT */}
              <g filter={hoveredPart === 'monocoque' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <path d="M 590,110 C 600,105 610,110 610,140 C 615,200 625,280 635,320 L 565,320 C 575,280 585,200 590,140 Z" fill="url(#carbon)" stroke={hoveredPart === 'monocoque' ? '#e10600' : '#444'} strokeWidth={hoveredPart === 'monocoque' ? 3 : 2} />
                <ellipse cx="600" cy="120" rx="6" ry="10" fill="#e10600" />
                <path d="M 565,320 L 635,320 C 645,360 650,400 650,450 L 550,450 C 550,400 555,360 565,320 Z" fill="#111" stroke={hoveredPart === 'monocoque' ? '#e10600' : '#e10600'} strokeWidth={hoveredPart === 'monocoque' ? 4 : 2} />
                <path d="M 580,360 C 580,340 620,340 620,360 C 625,380 625,410 600,410 C 575,410 575,380 580,360 Z" fill="#000" stroke={hoveredPart === 'monocoque' ? '#e10600' : '#444'} strokeWidth="3" />
                <circle cx="600" cy="375" r="12" fill="#fff" stroke={hoveredPart === 'monocoque' ? '#ff0000' : '#ff0000'} strokeWidth="2" />
              </g>

              {/* FUEL TANK (INTERNAL SCHEMATIC) */}
              <g filter={hoveredPart === 'fuel_tank' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <path d="M 570,410 L 630,410 C 640,430 640,490 630,510 L 570,510 C 560,490 560,430 570,410 Z" fill={hoveredPart === 'fuel_tank' ? 'rgba(225,6,0,0.3)' : 'rgba(255,255,255,0.03)'} stroke={hoveredPart === 'fuel_tank' ? '#e10600' : '#666'} strokeWidth={hoveredPart === 'fuel_tank' ? 3 : 1.5} strokeDasharray={hoveredPart === 'fuel_tank' ? 'none' : '4 4'} />
                <rect x="590" y="420" width="20" height="20" rx="4" fill="none" stroke={hoveredPart === 'fuel_tank' ? '#e10600' : '#666'} strokeWidth={hoveredPart === 'fuel_tank' ? 2 : 1} strokeDasharray={hoveredPart === 'fuel_tank' ? 'none' : '2 2'} />
              </g>

              {/* HALO */}
              <g filter={hoveredPart === 'halo' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <path d="M 598,360 L 602,360 L 604,390 L 596,390 Z" fill={hoveredPart === 'halo' ? '#fff' : 'url(#metallic)'} />
                <path d="M 560,400 C 560,370 600,370 600,370 C 600,370 640,370 640,400 C 645,430 630,430 600,430 C 570,430 555,430 560,400 Z" fill="none" stroke={hoveredPart === 'halo' ? '#fff' : 'url(#metallic)'} strokeWidth={hoveredPart === 'halo' ? 8 : 6} opacity="0.9" />
              </g>

              {/* SIDEPODS */}
              <g filter={hoveredPart === 'sidepod' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <path d="M 530,370 C 480,380 470,450 480,520 C 490,590 530,650 560,680 L 580,680 C 570,600 550,550 560,450 C 565,420 540,380 530,370 Z" fill="url(#carbonPattern)" stroke={hoveredPart === 'sidepod' ? '#fff' : '#e10600'} strokeWidth={hoveredPart === 'sidepod' ? 4 : 2} />
                <path d="M 670,370 C 720,380 730,450 720,520 C 710,590 670,650 640,680 L 620,680 C 630,600 650,550 640,450 C 635,420 660,380 670,370 Z" fill="url(#carbonPattern)" stroke={hoveredPart === 'sidepod' ? '#fff' : '#e10600'} strokeWidth={hoveredPart === 'sidepod' ? 4 : 2} />
                <g stroke={hoveredPart === 'sidepod' ? '#e10600' : '#111'} strokeWidth="4" fill="none">
                  <path d="M 490,440 Q 520,445 540,435 M 485,460 Q 520,465 545,455 M 485,480 Q 520,485 545,475 M 490,500 Q 520,505 540,495 M 495,520 Q 520,525 535,515" />
                  <path d="M 710,440 Q 680,445 660,435 M 715,460 Q 680,465 655,455 M 715,480 Q 680,485 655,475 M 710,500 Q 680,505 660,495 M 705,520 Q 680,525 665,515" />
                </g>
              </g>

              {/* MGU-K & ENGINE BLOCK (INTERNAL SCHEMATIC) */}
              <g filter={hoveredPart === 'mgu_k' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <path d="M 575,520 L 625,520 L 620,650 L 580,650 Z" fill="none" stroke={hoveredPart === 'mgu_k' ? '#ffaa00' : '#444'} strokeWidth={hoveredPart === 'mgu_k' ? 2 : 1} strokeDasharray="2 2" />
                <rect x="575" y="600" width="20" height="40" rx="4" fill={hoveredPart === 'mgu_k' ? 'rgba(255,170,0,0.3)' : 'none'} stroke={hoveredPart === 'mgu_k' ? '#fff' : '#ffaa00'} strokeWidth={hoveredPart === 'mgu_k' ? 3 : 1} opacity={hoveredPart === 'mgu_k' ? 1 : 0.6} />
                <g stroke={hoveredPart === 'mgu_k' ? '#fff' : '#ffaa00'} strokeWidth={hoveredPart === 'mgu_k' ? 2 : 1} opacity={hoveredPart === 'mgu_k' ? 1 : 0.6}>
                  <line x1="575" y1="610" x2="595" y2="610" />
                  <line x1="575" y1="620" x2="595" y2="620" />
                  <line x1="575" y1="630" x2="595" y2="630" />
                </g>
              </g>

              {/* ENGINE COVER & SHARK FIN */}
              <g className="transition-all duration-300">
                <path d="M 550,450 C 550,500 580,680 590,700 L 610,700 C 620,680 650,500 650,450 Z" fill="#111" stroke="#333" strokeWidth="2" opacity="0.8" />
                <line x1="600" y1="450" x2="600" y2="700" stroke="#e10600" strokeWidth="3" filter="url(#glowEffect)" />
              </g>

              {/* REAR SUSPENSION */}
              <g className="transition-all duration-300">
                <path d="M 440,630 L 575,650 M 440,660 L 580,680 M 440,680 L 585,695" stroke="#777" strokeWidth="3" fill="none" />
                <path d="M 760,630 L 625,650 M 760,660 L 620,680 M 760,680 L 615,695" stroke="#777" strokeWidth="3" fill="none" />
              </g>

              {/* REAR WHEELS */}
              <g>
                <rect x="380" y="600" width="55" height="120" rx="10" fill="#050508" stroke="#222" strokeWidth="3" />
                <rect x="765" y="600" width="55" height="120" rx="10" fill="#050508" stroke="#222" strokeWidth="3" />
                <ellipse cx="407" cy="660" rx="22" ry="50" fill="#111" stroke="#333" strokeWidth="2" />
                <ellipse cx="792" cy="660" rx="22" ry="50" fill="#111" stroke="#333" strokeWidth="2" />
              </g>

              {/* DIFFUSER */}
              <g filter={hoveredPart === 'diffuser' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <path d="M 500,740 L 700,740 L 670,780 L 530,780 Z" fill={hoveredPart === 'diffuser' ? 'rgba(225,6,0,0.3)' : 'none'} stroke={hoveredPart === 'diffuser' ? '#e10600' : 'none'} />
                <path d="M 530,740 L 530,780 M 550,735 L 550,785 M 570,735 L 570,785 M 630,735 L 630,785 M 650,735 L 650,785 M 670,740 L 670,780" stroke={hoveredPart === 'diffuser' ? '#fff' : '#111'} strokeWidth={hoveredPart === 'diffuser' ? 5 : 3} />
              </g>

              {/* REAR WING */}
              <g filter={hoveredPart === 'rear_wing' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <path d="M 480,720 Q 470,740 480,770 L 490,770 L 490,720 Z" fill={hoveredPart === 'rear_wing' ? '#fff' : '#e10600'} />
                <path d="M 720,720 Q 730,740 720,770 L 710,770 L 710,720 Z" fill={hoveredPart === 'rear_wing' ? '#fff' : '#e10600'} />
                <path d="M 485,735 C 550,725 650,725 715,735 L 715,750 C 650,740 550,740 485,750 Z" fill="url(#carbonPattern)" stroke={hoveredPart === 'rear_wing' ? '#e10600' : '#444'} strokeWidth={hoveredPart === 'rear_wing' ? 4 : 2} />
                <path d="M 485,755 C 550,748 650,748 715,755 L 715,765 C 650,760 550,760 485,765 Z" fill="#07070a" stroke={hoveredPart === 'rear_wing' ? '#fff' : '#e10600'} strokeWidth={hoveredPart === 'rear_wing' ? 4 : 2} />
              </g>

              {/* DRS ACTUATOR */}
              <g filter={hoveredPart === 'drs_actuator' ? 'url(#glowEffect)' : 'none'} className="transition-all duration-300">
                <rect x="592" y="730" width="16" height="25" rx="3" fill={hoveredPart === 'drs_actuator' ? '#e10600' : 'url(#metallic)'} stroke={hoveredPart === 'drs_actuator' ? '#fff' : '#222'} strokeWidth={hoveredPart === 'drs_actuator' ? 3 : 1} />
              </g>

              {/* EXHAUST */}
              <g>
                <ellipse cx="600" cy="710" rx="12" ry="15" fill="#000" stroke="#777" strokeWidth="3" />
                <circle cx="600" cy="710" r="8" fill="#e10600" filter="url(#glowEffect)" opacity="0.9" className="animate-pulse" />
                <circle cx="600" cy="710" r="4" fill="#fff" filter="url(#glowEffect)" opacity="0.9" className="animate-pulse" />
              </g>
            </g>

            {/* --- INTERACTIVE INVISIBLE HOTSPOTS & LEADER LINES --- */}
            {ANATOMY_PARTS.map(part => {
              const isHovered = hoveredPart === part.id;
              return (
                <g key={`anatomy-line-${part.id}`}>
                  {/* Invisible Hotspot for hover detection */}
                  <ellipse
                    cx={part.hotspot.cx}
                    cy={part.hotspot.cy}
                    rx={part.hotspot.rx}
                    ry={part.hotspot.ry}
                    fill="transparent"
                    className="cursor-crosshair pointer-events-auto"
                    onMouseEnter={() => setHoveredPart(part.id)}
                    onMouseLeave={() => setHoveredPart(null)}
                  />

                  {/* Leader Line */}
                  <line
                    x1={part.hotspot.cx}
                    y1={part.hotspot.cy}
                    x2={part.lineTarget.x}
                    y2={part.lineTarget.y}
                    stroke={isHovered ? '#e10600' : '#ffffff'}
                    strokeWidth={isHovered ? 2 : 0.5}
                    strokeDasharray={isHovered ? 'none' : '2 4'}
                    className={`transition-all duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-20'}`}
                  />
                  
                  {/* Glowing Connection Dots */}
                  <circle
                    cx={part.hotspot.cx}
                    cy={part.hotspot.cy}
                    r={isHovered ? 5 : 3}
                    fill={isHovered ? '#e10600' : '#ffffff'}
                    className={`transition-all duration-300 pointer-events-none ${isHovered ? 'opacity-100 shadow-[0_0_8px_#e10600]' : 'opacity-30'}`}
                  />
                  {isHovered && (
                    <circle
                      cx={part.hotspot.cx}
                      cy={part.hotspot.cy}
                      r={15}
                      fill="none"
                      stroke="#e10600"
                      strokeWidth="2"
                      className="animate-ping opacity-60 pointer-events-none"
                    />
                  )}
                  <circle
                    cx={part.lineTarget.x}
                    cy={part.lineTarget.y}
                    r={3}
                    fill={isHovered ? '#e10600' : '#ffffff'}
                    className={`transition-all duration-300 opacity-50 pointer-events-none`}
                  />
                </g>
              );
            })}
          </svg>

          {/* Absolute Positioned UI Labels (HTML layer dynamically scaling with aspect-[3/2]) */}
          {ANATOMY_PARTS.map((part, i) => (
            <motion.div 
              key={part.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              onMouseEnter={() => setHoveredPart(part.id)}
              onMouseLeave={() => setHoveredPart(null)}
              style={{ ...part.labelPos, transform: 'translateY(-50%)', width: '22%' }}
              className={`absolute p-2 sm:p-4 rounded-lg border backdrop-blur-md transition-all duration-300 cursor-crosshair overflow-hidden z-30 ${
                hoveredPart === part.id 
                  ? 'bg-f1-red/15 border-f1-red text-white shadow-[0_0_20px_rgba(225,6,0,0.3)] scale-[1.05]' 
                  : 'bg-[#0a0a0f]/80 border-white/10 text-f1-muted hover:border-white/30 hover:bg-[#1a1a24]/90'
              } ${part.align === 'left' ? 'text-left' : 'text-right'}`}
            >
              {hoveredPart === part.id && (
                <motion.div layoutId={`active-label-${part.align}`} className={`absolute top-0 bottom-0 w-1 bg-f1-red shadow-[0_0_10px_#e10600] ${part.align === 'left' ? 'left-0' : 'right-0'}`} />
              )}
              <span className="font-extrabold text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[0.2em] block leading-tight">{part.name}</span>
              <span className={`text-[6px] sm:text-[8px] md:text-[9px] block mt-1 uppercase tracking-widest transition-colors ${hoveredPart === part.id ? 'text-f1-red' : 'text-f1-muted/50'}`}>{part.material}</span>
            </motion.div>
          ))}
        </div>

        {/* Info Box Card */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activePart ? (
              <motion.div 
                key={activePart.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="bg-gradient-to-r from-[#0f0f18] to-[#07070a] border border-f1-red/50 p-8 rounded-xl shadow-[0_10px_40px_rgba(225,6,0,0.15)] relative overflow-hidden group/infobox"
              >
                {/* Techy background lines */}
                <div className="absolute top-0 right-0 w-64 h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(225,6,0,0.03)_10px,rgba(225,6,0,0.03)_20px)] pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-1 w-8 bg-f1-red animate-pulse" />
                  <span className="text-[10px] text-f1-red uppercase font-black tracking-[0.3em]">Telemetry & Specs</span>
                </div>
                
                <h4 className="text-3xl font-black text-white tracking-tight drop-shadow-md">{activePart.name}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-6 pt-6 border-t border-white/10 text-sm relative z-10">
                  <div>
                    <span className="text-[10px] text-f1-muted/60 uppercase font-black tracking-widest block mb-1">Primary Material</span>
                    <span className="font-extrabold text-white bg-white/5 px-2 py-1 rounded inline-block">{activePart.material}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-f1-muted/60 uppercase font-black tracking-widest block mb-1">Engineering Purpose</span>
                    <span className="text-f1-light leading-relaxed text-xs">{activePart.purpose}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-f1-muted/60 uppercase font-black tracking-widest block mb-1">Engineering Trivia</span>
                    <span className="text-f1-red italic leading-relaxed text-xs font-medium">"{activePart.funFact}"</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#07070a] border border-white/5 p-8 rounded-xl flex flex-col items-center justify-center text-center h-[200px]"
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-f1-muted/20 animate-[spin_10s_linear_infinite] flex items-center justify-center mb-4">
                  <div className="w-2 h-2 bg-f1-red rounded-full animate-pulse" />
                </div>
                <p className="text-xs text-f1-muted uppercase font-black tracking-[0.2em]">
                  Awaiting Telemetry Input...
                </p>
                <p className="text-[10px] text-f1-muted/40 uppercase tracking-widest mt-2">
                  Initialize scan by selecting a chassis component
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FadeInSection>

      {/* SECTION 5: Car Specifications & Aero */}
      <FadeInSection>
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Active Aerodynamics
          </h4>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light tracking-tight">Car Specifications & Aero</h2>
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
      </FadeInSection>

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

              <div className="relative h-56 w-full bg-[#09090f] flex items-center justify-center">
                {(selectedEra.displayImage || ERA_IMAGES[selectedEra.id]) ? (
                  <img 
                    src={selectedEra.displayImage || ERA_IMAGES[selectedEra.id]} 
                    alt={selectedEra.name} 
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      // If both Wikipedia and Unsplash fail, hide the image and let the fallback text show underneath
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-black text-white/50 text-center px-4">{selectedEra.name}</span>
                )}
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
                <TeamLogo team={selectedConstructor} size="large" />
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
                  <div className="h-28 rounded overflow-hidden bg-[#09090f] flex items-center justify-center">
                    {activeConstructorDetails.iconicCarImage ? (
                      <img 
                        src={activeConstructorDetails.iconicCarImage} 
                        alt={activeConstructorDetails.iconicCar} 
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-sm font-black text-white/50 text-center px-2">{selectedConstructor.name}</span>
                    )}
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
                          <Tooltip content={<PlotlyTooltip xKey="decade" />} />
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
