import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ERAS = [
  { id: 'early_years', label: 'The Founding Years' },
  { id: 'rear_engine', label: 'Rear-Engine Revolution' },
  { id: 'wings_dfv', label: 'Cosworth DFV & Wings' },
  { id: 'turbo_ground_effect', label: 'Ground Effect & Turbo Era' },
  { id: 'v10_era', label: 'The Golden V10 Era' },
  { id: 'v8_era', label: 'The High-RPM V8 Era' },
  { id: 'turbo_hybrid', label: 'V6 Turbo Hybrid Era' },
  { id: 'ground_effect_hybrid', label: 'Ground Effect Revival' }
];

const CarVaultFilters = ({ cars = [], onFilterChange }) => {
  const [selectedEra, setSelectedEra] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [yearRange, setYearRange] = useState([1950, 2024]);
  const [searchInput, setSearchInput] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [championshipOnly, setChampionshipOnly] = useState(false);
  const [sortBy, setSortBy] = useState('year-asc');
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filteredCount, setFilteredCount] = useState(cars.length);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDriverSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Derived unique teams
  const teams = useMemo(() => {
    const allTeams = cars.map(c => c.team).filter(Boolean);
    return [...new Set(allTeams)].sort();
  }, [cars]);

  // Filtering logic
  useEffect(() => {
    let result = [...cars];

    if (selectedEra !== 'all') {
      result = result.filter(c => c.eraId === selectedEra);
    }
    if (selectedTeam !== 'all') {
      result = result.filter(c => c.team === selectedTeam);
    }
    
    result = result.filter(c => c.year >= yearRange[0] && c.year <= yearRange[1]);
    
    if (driverSearch.trim() !== '') {
      const lowerSearch = driverSearch.toLowerCase();
      result = result.filter(c => String(c.driver || c.drivers).toLowerCase().includes(lowerSearch));
    }
    
    if (championshipOnly) {
      result = result.filter(c => c.isChampionshipCar);
    }

    result.sort((a, b) => {
      if (sortBy === 'year-asc') return a.year - b.year;
      if (sortBy === 'year-desc') return b.year - a.year;
      if (sortBy === 'team-az') return (a.team || '').localeCompare(b.team || '');
      if (sortBy === 'horsepower') return (b.horsepowerEst || 0) - (a.horsepowerEst || 0);
      if (sortBy === 'topspeed') return (b.topSpeedKmh || 0) - (a.topSpeedKmh || 0);
      return 0;
    });

    setFilteredCount(result.length);
    if (onFilterChange) {
      onFilterChange(result);
    }
  }, [cars, selectedEra, selectedTeam, yearRange, driverSearch, championshipOnly, sortBy]); // Excluding onFilterChange to avoid loop if parent recreates it

  const resetAll = () => {
    setSelectedEra('all');
    setSelectedTeam('all');
    setYearRange([1950, 2024]);
    setSearchInput('');
    setChampionshipOnly(false);
    setSortBy('year-asc');
  };

  const getEraCount = (eraId) => cars.filter(c => c.eraId === eraId).length;

  const badges = [];
  if (selectedEra !== 'all') {
    const eraObj = ERAS.find(e => e.id === selectedEra);
    badges.push({ id: 'era', label: `Era: ${eraObj?.label || selectedEra}`, onRemove: () => setSelectedEra('all') });
  }
  if (selectedTeam !== 'all') {
    badges.push({ id: 'team', label: `Team: ${selectedTeam}`, onRemove: () => setSelectedTeam('all') });
  }
  if (yearRange[0] > 1950 || yearRange[1] < 2024) {
    badges.push({ id: 'year', label: `Years: ${yearRange[0]}–${yearRange[1]}`, onRemove: () => setYearRange([1950, 2024]) });
  }
  if (searchInput.trim() !== '') {
    badges.push({ id: 'driver', label: `Driver: "${searchInput}"`, onRemove: () => setSearchInput('') });
  }
  if (championshipOnly) {
    badges.push({ id: 'champ', label: `Championship Only`, onRemove: () => setChampionshipOnly(false) });
  }

  const hasActiveFilters = badges.length > 0;

  return (
    <div className="bg-[#0f0f18] w-full p-4 rounded-xl border border-f1-border shadow-2xl mb-8">
      <style>{`
        .dual-slider::-webkit-slider-thumb {
          pointer-events: auto;
          width: 14px;
          height: 14px;
          background: #e10600;
          border-radius: 50%;
          appearance: none;
          cursor: grab;
        }
        .dual-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
        }
        .dual-slider::-moz-range-thumb {
          pointer-events: auto;
          width: 14px;
          height: 14px;
          background: #e10600;
          border-radius: 50%;
          border: none;
          cursor: grab;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
      `}</style>

      {/* ROW 1: QUICK ERA PILLS & FILTER TOGGLE */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 overflow-x-auto custom-scrollbar pb-2 md:pb-0 w-full">
          <div className="flex gap-2 whitespace-nowrap min-w-max">
            <button
              onClick={() => setSelectedEra('all')}
              className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase transition-colors z-10 ${
                selectedEra === 'all' ? 'text-white' : 'text-f1-muted hover:text-white bg-[#1a1a24] border border-f1-border'
              }`}
            >
              {selectedEra === 'all' && (
                <motion.div
                  layoutId="eraIndicator"
                  className="absolute inset-0 bg-f1-red rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              All Eras ({cars.length})
            </button>
            {ERAS.map(era => {
              const count = getEraCount(era.id);
              if (count === 0 && selectedEra !== era.id) return null;
              return (
                <button
                  key={era.id}
                  onClick={() => setSelectedEra(era.id)}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase transition-colors z-10 ${
                    selectedEra === era.id ? 'text-white' : 'text-f1-muted hover:text-white bg-[#1a1a24] border border-f1-border'
                  }`}
                >
                  {selectedEra === era.id && (
                    <motion.div
                      layoutId="eraIndicator"
                      className="absolute inset-0 bg-f1-red rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {era.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a24] border border-f1-border rounded text-xs font-bold uppercase text-white hover:bg-[#222230] transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters {hasActiveFilters && <span className="bg-f1-red text-white px-1.5 py-0.5 rounded-full text-[10px]">{badges.length}</span>}
        </button>
      </div>

      {/* ROW 2: ADVANCED FILTERS */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-6 mt-4 border-t border-f1-border">
              
              {/* TEAM DROPDOWN */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-f1-muted font-bold uppercase tracking-wider">Team</label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-[#1a1a24] border border-f1-border rounded p-2 text-sm text-white focus:border-f1-red focus:outline-none"
                >
                  <option value="all">All Teams</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              {/* DRIVER SEARCH */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-f1-muted font-bold uppercase tracking-wider">Driver Search</label>
                <div className="relative">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-f1-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by driver name..."
                    className="w-full bg-[#1a1a24] border border-f1-border rounded py-2 pl-9 pr-3 text-sm text-white focus:border-f1-red focus:outline-none placeholder-f1-muted/50"
                  />
                </div>
              </div>

              {/* YEAR RANGE */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-f1-muted font-bold uppercase tracking-wider">Year Range</label>
                <div className="pt-2 px-1">
                  <div className="relative w-full h-1.5 bg-[#222] rounded-full">
                    <div 
                      className="absolute h-full bg-f1-red rounded-full" 
                      style={{ 
                        left: `${((yearRange[0] - 1950) / (2024 - 1950)) * 100}%`,
                        right: `${100 - ((yearRange[1] - 1950) / (2024 - 1950)) * 100}%` 
                      }} 
                    />
                    <input 
                      type="range" 
                      min="1950" 
                      max="2024" 
                      value={yearRange[0]} 
                      onChange={(e) => setYearRange([Math.min(parseInt(e.target.value), yearRange[1]), yearRange[1]])}
                      className="absolute w-full -top-1 appearance-none bg-transparent pointer-events-none dual-slider z-10"
                    />
                    <input 
                      type="range" 
                      min="1950" 
                      max="2024" 
                      value={yearRange[1]} 
                      onChange={(e) => setYearRange([yearRange[0], Math.max(parseInt(e.target.value), yearRange[0])])}
                      className="absolute w-full -top-1 appearance-none bg-transparent pointer-events-none dual-slider z-20"
                    />
                  </div>
                  <div className="text-center text-[11px] text-f1-muted font-mono mt-3">
                    {yearRange[0]} – {yearRange[1]}
                  </div>
                </div>
              </div>

              {/* SORT BY */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-f1-muted font-bold uppercase tracking-wider">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#1a1a24] border border-f1-border rounded p-2 text-sm text-white focus:border-f1-red focus:outline-none"
                >
                  <option value="year-asc">Year (Oldest first)</option>
                  <option value="year-desc">Year (Newest first)</option>
                  <option value="team-az">Team (A to Z)</option>
                  <option value="horsepower">Horsepower (Highest first)</option>
                  <option value="topspeed">Top Speed (Highest first)</option>
                </select>
              </div>

              {/* TOGGLE & RESET */}
              <div className="flex flex-col justify-between gap-4">
                <label className="flex items-center gap-3 cursor-pointer group mt-4 lg:mt-6">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={championshipOnly}
                      onChange={(e) => setChampionshipOnly(e.target.checked)}
                      className="sr-only" 
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${championshipOnly ? 'bg-f1-red' : 'bg-[#222]'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${championshipOnly ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white group-hover:text-f1-red transition-colors">
                    <span className="text-lg">🏆</span>
                    <span>Championship cars only</span>
                  </div>
                </label>

                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={resetAll}
                  className="text-[10px] font-bold text-f1-muted hover:text-white uppercase tracking-wider self-start lg:self-end mb-1"
                >
                  Clear all filters
                </motion.button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULTS COUNTER & BADGES */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-xs font-mono text-f1-muted">
          Showing {filteredCount} {hasActiveFilters && `of ${cars.length}`} cars
        </span>
        
        {filteredCount === 0 && (
          <span className="text-xs text-f1-red ml-2 flex items-center gap-2">
            No cars match your filters. 
            <button onClick={resetAll} className="underline hover:text-white">Reset</button>
          </span>
        )}

        <AnimatePresence>
          {badges.map(badge => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1a24] border border-f1-border rounded text-[10px] text-white"
            >
              {badge.label}
              <button onClick={badge.onRemove} className="hover:text-f1-red focus:outline-none">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default CarVaultFilters;
