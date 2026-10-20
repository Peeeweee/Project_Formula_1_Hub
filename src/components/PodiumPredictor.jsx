import { useState } from 'react';

function readPrediction(key, ids) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && [value.p1, value.p2, value.p3].every(id => ids.includes(id)) && new Set([value.p1, value.p2, value.p3]).size === 3 ? value : {};
  } catch { return {}; }
}

export default function PodiumPredictor({ nextRaceName = 'Upcoming Grand Prix', drivers = [], raceId = 'none' }) {
  const TOP_DRIVERS = drivers.map(row => ({ id: row.Driver.driverId, name: `${row.Driver.givenName} ${row.Driver.familyName}`, team: row.Constructors?.map(team => team.name).join(' / ') || 'Team unavailable', color: '#e10600' }));
  const storageKey = `fdc1_podium_${raceId}`;
  const [initial] = useState(() => readPrediction(storageKey, TOP_DRIVERS.map(driver => driver.id)));
  const [p1, setP1] = useState(initial.p1 || '');
  const [p2, setP2] = useState(initial.p2 || '');
  const [p3, setP3] = useState(initial.p3 || '');
  const [saved, setSaved] = useState(Boolean(initial.p1));
  const [saveError, setSaveError] = useState(null);
  const handleSave = () => {
    if (!p1 || !p2 || !p3 || new Set([p1, p2, p3]).size !== 3) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ p1, p2, p3, date: new Date().toISOString() }));
      setSaved(true);
      setSaveError(null);
    } catch { setSaveError('Device storage is unavailable. Your picks are still visible, but could not be saved.'); }
  };
  const handleReset = () => {
    try { localStorage.removeItem(storageKey); } catch { /* Editing still works. */ }
    setP1(''); setP2(''); setP3(''); setSaved(false);
  };

  const getDriver = (id) => TOP_DRIVERS.find(d => d.id === id);

  return (
    <div className="bg-[#0e0e15] border border-f1-red/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-f1-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-f1-red text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-widest rounded-sm">
              PIT WALL MINI-GAME
            </span>
            <span className="text-xs text-f1-muted font-mono uppercase">Podium Challenge</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            🎯 Predict The Podium: {nextRaceName}
          </h3>
        </div>

        {saved && (
          <span className="bg-green-500/20 text-green-400 border border-green-500/40 text-xs font-mono font-bold px-3 py-1 rounded inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            PREDICTION LOCKED
          </span>
        )}
      </div>

      <p className="text-sm text-f1-muted">Your personal picks for this race, saved on this device. Entrants shown come from the available season standings; the event entry list may differ.</p>
      {TOP_DRIVERS.length === 0 && <p className="text-sm text-amber-300">Load the season standings to make your picks.</p>}
      {saveError && <p role="status" className="text-sm text-amber-300">{saveError}</p>}
      {/* Podium Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* P1 */}
        <div className="bg-[#12121c] border border-yellow-500/40 p-5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-widest">🥇 1st Place (P1)</span>
            <span className="text-xs text-yellow-500/60 font-bold">25 PTS</span>
          </div>

          <select
            disabled={saved || !TOP_DRIVERS.length}
            aria-label="Choose P1"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            className="bg-[#07070a] border border-f1-border text-xs text-white p-3 rounded font-bold focus:outline-none focus:border-yellow-500 disabled:opacity-75"
          >
            <option value="">-- Select Winner --</option>
            {TOP_DRIVERS.map(d => (
              <option key={`p1-${d.id}`} value={d.id} disabled={p2 === d.id || p3 === d.id}>
                {d.name} ({d.team})
              </option>
            ))}
          </select>

          {p1 && (
            <div className="text-xs font-bold text-white flex items-center gap-2 pt-2 border-t border-f1-border/30">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getDriver(p1)?.color }} />
              {getDriver(p1)?.name}
            </div>
          )}
        </div>

        {/* P2 */}
        <div className="bg-[#12121c] border border-slate-300/40 p-5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">🥈 2nd Place (P2)</span>
            <span className="text-xs text-slate-400 font-bold">18 PTS</span>
          </div>

          <select
            disabled={saved || !TOP_DRIVERS.length}
            aria-label="Choose P2"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            className="bg-[#07070a] border border-f1-border text-xs text-white p-3 rounded font-bold focus:outline-none focus:border-slate-300 disabled:opacity-75"
          >
            <option value="">-- Select 2nd Place --</option>
            {TOP_DRIVERS.map(d => (
              <option key={`p2-${d.id}`} value={d.id} disabled={p1 === d.id || p3 === d.id}>
                {d.name} ({d.team})
              </option>
            ))}
          </select>

          {p2 && (
            <div className="text-xs font-bold text-white flex items-center gap-2 pt-2 border-t border-f1-border/30">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getDriver(p2)?.color }} />
              {getDriver(p2)?.name}
            </div>
          )}
        </div>

        {/* P3 */}
        <div className="bg-[#12121c] border border-amber-700/40 p-5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest">🥉 3rd Place (P3)</span>
            <span className="text-xs text-amber-600/60 font-bold">15 PTS</span>
          </div>

          <select
            disabled={saved || !TOP_DRIVERS.length}
            aria-label="Choose P3"
            value={p3}
            onChange={(e) => setP3(e.target.value)}
            className="bg-[#07070a] border border-f1-border text-xs text-white p-3 rounded font-bold focus:outline-none focus:border-amber-600 disabled:opacity-75"
          >
            <option value="">-- Select 3rd Place --</option>
            {TOP_DRIVERS.map(d => (
              <option key={`p3-${d.id}`} value={d.id} disabled={p1 === d.id || p2 === d.id}>
                {d.name} ({d.team})
              </option>
            ))}
          </select>

          {p3 && (
            <div className="text-xs font-bold text-white flex items-center gap-2 pt-2 border-t border-f1-border/30">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getDriver(p3)?.color }} />
              {getDriver(p3)?.name}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {saved ? (
          <button
            onClick={handleReset}
            className="bg-[#1a1a24] hover:bg-f1-red text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded border border-f1-border transition"
          >
            Unlock / Edit Prediction
          </button>
        ) : (
          <button
            disabled={!p1 || !p2 || !p3}
            onClick={handleSave}
            className="bg-f1-red hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded transition shadow-lg shadow-f1-red/20"
          >
            🔒 Lock In Prediction
          </button>
        )}
      </div>
    </div>
  );
}
