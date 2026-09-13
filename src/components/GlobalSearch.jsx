import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import circuitsData from '../data/circuits.json';
import constructorsData from '../data/constructors.json';

const PAGES = [
  { id: 'start', label: 'Start Here', path: '/', icon: '🏠', type: 'page' },
  { id: 'news', label: 'News Wire', path: '/news', icon: '📰', type: 'page' },
  { id: 'racers', label: 'Racers', path: '/racers', icon: '🏎', type: 'page' },
  { id: 'cars', label: 'Cars', path: '/cars', icon: '🚗', type: 'page' },
  { id: 'circuits', label: 'Circuits', path: '/circuits', icon: '🏁', type: 'page' },
  { id: 'strategy', label: 'Strategy', path: '/strategy', icon: '📊', type: 'page' },
  { id: 'live', label: 'Live Season', path: '/live-season', icon: '🔴', type: 'page' },
  { id: 'alltime', label: 'All-Time Records', path: '/all-time', icon: '🏆', type: 'page' },
  { id: 'pitwall', label: 'Pit Wall AI', path: '/pit-wall-ai', icon: '🤖', type: 'page' },
  { id: 'garage', label: '3D Garage', path: '/garage', icon: '🔧', type: 'page' },
];

const CIRCUIT_ITEMS = circuitsData.map(c => ({
  id: `circuit_${c.id}`,
  label: c.name,
  sublabel: `${c.city}, ${c.country}`,
  path: '/circuits',
  icon: '🏁',
  type: 'circuit',
}));

const CONSTRUCTOR_ITEMS = constructorsData.map(c => ({
  id: `constructor_${c.id}`,
  label: c.name,
  sublabel: `${c.championships} Championships`,
  path: '/cars',
  icon: '🏎',
  type: 'constructor',
  color: c.teamColor,
}));

const TYPE_LABELS = {
  page: 'Pages',
  circuit: 'Circuits',
  constructor: 'Teams',
  driver: 'Drivers',
};

const TYPE_ORDER = ['page', 'driver', 'circuit', 'constructor'];

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelected(0);
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setSelected(0);
      return;
    }

    const allItems = [...PAGES, ...CIRCUIT_ITEMS, ...CONSTRUCTOR_ITEMS];
    const matched = allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.sublabel?.toLowerCase().includes(q)
    );

    setResults(matched.slice(0, 12));
    setSelected(0);
  }, [query]);

  const go = useCallback((item) => {
    navigate(item.path);
    onClose();
  }, [navigate, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) { go(results[selected]); }
  }, [isOpen, results, selected, go, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Group results by type
  const grouped = TYPE_ORDER.reduce((acc, type) => {
    const items = results.filter(r => r.type === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});

  // Flat index map for keyboard nav
  let flatIdx = 0;
  const flatMap = {};
  TYPE_ORDER.forEach(type => {
    const items = grouped[type];
    if (Array.isArray(items)) {
      items.forEach(item => {
        flatMap[flatIdx++] = item;
      });
    }
  });

  let renderIdx = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl bg-[#0e0e15] border border-f1-red/30 rounded-xl shadow-[0_0_50px_rgba(225,6,0,0.15)] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-f1-red/20 bg-black/20">
              <svg className="w-5 h-5 text-f1-red animate-pulse shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="ACCESS TELEMETRY (PAGES, DRIVERS, TEAMS)..."
                className="flex-1 bg-transparent text-white text-sm placeholder-f1-muted/40 outline-none font-mono tracking-wide uppercase"
                autoComplete="off"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-f1-red/10 border border-f1-red/30 text-[10px] text-f1-red font-bold font-mono uppercase tracking-widest">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-f1-red/30 scrollbar-track-transparent">
              {query.trim() === '' && (
                <div className="px-5 py-12 text-center text-f1-muted/50 text-sm">
                  <div className="flex justify-center mb-4">
                    <span className="w-12 h-12 rounded-full border border-f1-red/20 bg-f1-red/5 flex items-center justify-center text-f1-red text-xl animate-pulse">⌕</span>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-widest">Awaiting query parameters</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['Monza', 'Ferrari', 'Racers', 'Circuits', 'Garage'].map(hint => (
                      <button
                        key={hint}
                        onClick={() => setQuery(hint)}
                        className="px-3 py-1.5 rounded bg-f1-red/5 border border-f1-red/20 text-[10px] font-bold uppercase tracking-widest text-f1-red hover:bg-f1-red hover:text-white transition duration-200"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() !== '' && results.length === 0 && (
                <div className="px-5 py-12 text-center text-f1-muted/50 text-sm">
                  <div className="text-3xl mb-3 opacity-50">🏁</div>
                  <p className="font-mono text-xs uppercase tracking-widest">No telemetry found for <span className="text-f1-red font-bold">"{query}"</span></p>
                </div>
              )}

              {TYPE_ORDER.map(type => {
                const items = grouped[type];
                if (!Array.isArray(items)) return null;
                return (
                  <div key={type} className="mb-2">
                    <div className="px-6 pt-3 pb-2 text-[10px] font-black uppercase tracking-[3px] text-f1-red border-b border-f1-red/10 mb-1 mx-2">
                      {TYPE_LABELS[type]}
                    </div>
                    {items.map(item => {
                      const idx = renderIdx++;
                      const isSelected = selected === idx;
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setSelected(idx)}
                          onClick={() => go(item)}
                          className={`w-full flex items-center gap-4 px-6 py-3 transition-all text-left border-l-4 ${
                            isSelected 
                              ? 'bg-f1-red/10 border-f1-red shadow-[inset_0_0_20px_rgba(225,6,0,0.05)]' 
                              : 'border-transparent hover:bg-white/5'
                          }`}
                        >
                          <span
                            className="w-8 h-8 rounded bg-black/40 border border-white/10 flex items-center justify-center text-sm shrink-0"
                            style={item.color ? { borderLeftColor: item.color, borderLeftWidth: '3px' } : {}}
                          >
                            {item.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-black tracking-wide uppercase truncate ${isSelected ? 'text-white' : 'text-f1-light'}`}>
                              {item.label}
                            </div>
                            {item.sublabel && (
                              <div className={`text-[10px] font-mono tracking-widest uppercase truncate mt-0.5 ${isSelected ? 'text-f1-red' : 'text-f1-muted'}`}>
                                {item.sublabel}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <kbd className="shrink-0 text-[10px] font-black font-mono text-white px-2.5 py-1 rounded bg-f1-red tracking-widest uppercase shadow-lg shadow-f1-red/40 flex items-center gap-1">
                              ENTER <span className="opacity-50">↵</span>
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-f1-red/20 bg-[#07070a] flex justify-between items-center text-[9px] text-f1-muted font-mono uppercase tracking-[2px]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-1 rounded">↑↓</kbd> NAVIGATE</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-1 rounded">↵</kbd> OPEN</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-1 rounded">ESC</kbd> CLOSE</span>
              </div>
              <span className="text-f1-red font-bold animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-f1-red" />
                SYSTEM ONLINE
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
