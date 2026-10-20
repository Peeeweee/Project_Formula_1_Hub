import useDialogAccessibility from '../hooks/useDialogAccessibility';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSeasonRaces, getCircuitResults } from '../services/jolpicaApi';
import { getTrackSpecs } from '../data/trackSVGs';
import { COUNTRY_FLAGS } from '../utils/countryFlags';
import { useFavorites } from '../hooks/useFavorites';
import FadeInSection from '../components/FadeInSection';


export default function Circuits() {
  const [feedError, setFeedError] = useState(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const circuitDialogRef = useDialogAccessibility(Boolean(selectedCircuit), () => setSelectedCircuit(null));
  const [searchTerm, setSearchTerm] = useState('');
  const [circuitHistory, setCircuitHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    async function loadCircuits() {
      setLoading(true);
      try {
        const calendarRes = await getSeasonRaces('current', refreshVersion > 0);
        setRaces(calendarRes || []);
        setFeedError(null);
      } catch (err) {
        console.error('Failed to load races for circuits:', err);
        setFeedError('The calendar feed is unavailable. Try again shortly.');
      } finally {
        setLoading(false);
      }
    }
    loadCircuits();
  }, [refreshVersion]);

  // Fetch last 5 race results for selected circuit when modal opens
  useEffect(() => {
    if (!selectedCircuit) return;
    Promise.resolve().then(() => { if (!cancelled) { setCircuitHistory([]); setHistoryLoading(true); } });
    let cancelled = false;
    const circuitId = selectedCircuit.race.Circuit.circuitId;
    const currentYear = new Date().getFullYear();
    const yearsToFetch = [currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5];

    Promise.all(
      yearsToFetch.map(yr =>
        getCircuitResults(yr, circuitId)
          .then(races => races.map(race => ({ year: yr, winner: race.Results?.[0] })).filter(race => race.winner))
          .catch(() => null)
      )
    ).then(results => {
      if (!cancelled) {
        setCircuitHistory(results.flat().filter(Boolean));
        setHistoryLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [selectedCircuit]);

  const filteredRaces = races.filter(r => 
    r.raceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.Circuit?.circuitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.Circuit?.Location?.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#07070a] text-f1-light px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {feedError && <p role="status" className="rounded-xl border border-f1-border p-4 text-amber-300">{feedError} <button className="underline" onClick={() => setRefreshVersion(value => value + 1)}>Retry calendar</button></p>}
      {/* Header */}
      <div>
        <div className="border-l-2 border-f1-red pl-2 mb-2">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Explore the current calendar
          </h4>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              🏁 F1 Circuit Directory
            </h1>
            <p className="text-f1-muted text-xs sm:text-sm mt-1 max-w-2xl">
              Explore calendar venues with illustrative track outlines and bundled reference specifications. Lap records and overtaking-zone counts may reflect older seasons.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search circuit, country, GP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#12121c] border border-f1-border text-xs text-f1-light px-4 py-2.5 rounded focus:outline-none focus:border-f1-red font-mono pr-8"
            />
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-f1-muted hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-f1-muted text-xs font-mono">
          <div className="w-8 h-8 border-2 border-f1-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading circuit vector telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaces.map((race) => {
            const country = race.Circuit?.Location?.country || '';
            const flag = COUNTRY_FLAGS[country] || '🏁';
            const spec = getTrackSpecs(race.Circuit?.circuitId, race.Circuit?.circuitName);

            return (
              <FadeInSection key={`circuit-${race.round}-${race.Circuit?.circuitId}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedCircuit({ race, spec, flag })}
                  className="bg-[#0e0e15] border border-f1-border hover:border-f1-red/60 rounded-xl overflow-hidden shadow-xl cursor-pointer transition duration-300 flex flex-col justify-between group relative"
                >
                  {/* Bookmark button */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite('circuit', race.Circuit?.circuitId, race.Circuit?.circuitName); }}
                    className={`absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                      isFavorite(race.Circuit?.circuitId)
                        ? 'bg-f1-red text-white shadow-[0_0_8px_rgba(225,6,0,0.5)]'
                        : 'bg-black/60 text-white/30 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                    title={isFavorite(race.Circuit?.circuitId) ? 'Remove bookmark' : 'Bookmark circuit'}
                  >
                    {isFavorite(race.Circuit?.circuitId) ? '★' : '☆'}
                  </button>
                  {/* Official Dark F1 Telemetry Card Header (NO random road car photos!) */}
                  <div className="bg-gradient-to-r from-[#180a0a] via-[#12121c] to-[#0e0e15] border-b border-f1-border/60 p-5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-f1-red/10 to-transparent pointer-events-none" />
                    
                    <div className="flex items-center justify-between text-[10px] font-mono text-f1-muted uppercase tracking-wider mb-2">
                      <span className="bg-f1-red/20 text-f1-red border border-f1-red/40 px-2 py-0.5 rounded font-bold">
                        ROUND {race.round}
                      </span>
                      <span className="text-xl">{flag}</span>
                    </div>

                    <h3 className="font-extrabold text-lg text-white group-hover:text-f1-red transition leading-snug">
                      {race.Circuit?.circuitName}
                    </h3>
                    <p className="text-xs text-f1-muted mt-0.5 font-mono">{spec.locality}, {spec.country}</p>
                  </div>

                  {/* Card Content - Glowing Vector Track */}
                  <div className="p-5 space-y-4">
                    <div className="h-48 bg-[#08080d] border border-f1-border/50 rounded-lg p-4 flex items-center justify-center relative overflow-hidden group-hover:border-f1-red/40 transition">
                      {/* Dark grid background pattern */}
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e10600_1px,transparent_1px)] [background-size:16px_16px]" />

                      <svg
                        viewBox={spec.viewBox}
                        className="w-full h-full stroke-f1-red fill-none stroke-[4] drop-shadow-[0_0_12px_rgba(225,6,0,0.7)] transition duration-300 group-hover:stroke-red-500 group-hover:scale-105 relative z-10"
                        style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
                      >
                        <path d={spec.path} />
                      </svg>
                      
                      <span className="absolute bottom-2 right-2 text-[9px] font-mono text-f1-muted bg-black/80 px-2 py-0.5 rounded border border-f1-border/50 z-20">
                        DRS Zones: {spec.drsZones}
                      </span>
                    </div>

                    {/* Circuit Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-f1-border/40 pt-3 text-f1-muted">
                      <div>
                        <span className="block text-[9px] uppercase">Track Length</span>
                        <span className="text-white font-bold">{spec.length}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase">Corners</span>
                        <span className="text-white font-bold">{spec.turns} Turns</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FadeInSection>
            );
          })}
        </div>
      )}

      {/* CIRCUIT DETAIL MODAL */}
      <AnimatePresence>
        {selectedCircuit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCircuit(null)}
            ref={circuitDialogRef} role="dialog" aria-modal="true" aria-label="Circuit details" tabIndex={-1}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0e0e16] border border-f1-red/50 rounded-2xl p-6 sm:p-8 max-w-3xl w-full relative shadow-2xl space-y-6 my-8"
            >
              <button
                onClick={() => setSelectedCircuit(null)}
                className="absolute top-4 right-4 text-f1-muted hover:text-white bg-black/60 p-2 rounded-full z-20"
              >
                ✕
              </button>

              <div className="flex items-center gap-4">
                <span className="text-4xl">{selectedCircuit.flag}</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedCircuit.race.Circuit?.circuitName}</h2>
                  <p className="text-xs text-f1-muted">{selectedCircuit.race.raceName} • Round {selectedCircuit.race.round} • First GP: {selectedCircuit.spec.firstGP}</p>
                </div>
              </div>

              {/* Large Vector Track Display */}
              <div className="h-72 sm:h-80 bg-[#08080d] border border-f1-border rounded-xl p-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e10600_1px,transparent_1px)] [background-size:20px_20px]" />
                <svg
                  viewBox={selectedCircuit.spec.viewBox}
                  className="w-full h-full stroke-f1-red fill-none stroke-[5] drop-shadow-[0_0_20px_rgba(225,6,0,0.75)] relative z-10"
                  style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
                >
                  <path d={selectedCircuit.spec.path} />
                </svg>
              </div>

              {/* Circuit Details Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
                <div className="bg-[#12121c] border border-f1-border p-3 rounded">
                  <span className="text-[10px] text-f1-muted block uppercase">Distance</span>
                  <span className="text-sm font-bold text-white">{selectedCircuit.spec.length}</span>
                </div>
                <div className="bg-[#12121c] border border-f1-border p-3 rounded">
                  <span className="text-[10px] text-f1-muted block uppercase">Race Distance</span>
                  <span className="text-sm font-bold text-white">{selectedCircuit.spec.raceDistance}</span>
                </div>
                <div className="bg-[#12121c] border border-f1-border p-3 rounded">
                  <span className="text-[10px] text-f1-muted block uppercase">Corners</span>
                  <span className="text-sm font-bold text-white">{selectedCircuit.spec.turns} Turns</span>
                </div>
                <div className="bg-[#12121c] border border-f1-border p-3 rounded">
                  <span className="text-[10px] text-f1-muted block uppercase">DRS Zones</span>
                  <span className="text-sm font-bold text-f1-red">{selectedCircuit.spec.drsZones} Zones</span>
                </div>
              </div>

              {/* Lap Record & Info */}
              <div className="bg-[#12121c] border border-f1-border/60 p-4 rounded-lg space-y-2 font-mono text-xs text-f1-light">
                <div className="flex items-center justify-between border-b border-f1-border/40 pb-2">
                  <span className="text-f1-red font-bold">LAP RECORD:</span>
                  <span className="text-white font-bold">{selectedCircuit.spec.lapRecord}</span>
                </div>
                <div className="flex justify-between pt-1 text-f1-muted text-[11px]">
                  <span>Location: {selectedCircuit.race.Circuit?.Location?.locality}, {selectedCircuit.race.Circuit?.Location?.country}</span>
                  <span>Scheduled Date: {selectedCircuit.race.date}</span>
                </div>
              </div>

              {/* Historical Winners */}
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-f1-muted mb-3 flex items-center gap-2">
                  <span className="text-f1-red">🏆</span> Recent Winners at This Circuit
                </div>
                {historyLoading ? (
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="flex-1 h-14 bg-white/5 rounded-lg animate-pulse" />)}
                  </div>
                ) : circuitHistory.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {circuitHistory.map(({ year, winner }) => (
                      <div key={year} className="flex items-center justify-between bg-[#12121c] border border-f1-border/50 rounded-lg px-4 py-2.5 font-mono text-xs">
                        <span className="text-f1-red font-bold w-12">{year}</span>
                        <span className="text-white font-semibold flex-1">
                          {winner.Driver?.givenName} {winner.Driver?.familyName}
                        </span>
                        <span className="text-f1-muted text-[10px]">{winner.Constructor?.name}</span>
                        <span className="ml-3 text-f1-muted text-[10px]">{winner.Time?.time || winner.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-f1-muted text-xs font-mono text-center py-4">No historical data available</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
