import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SCHEDULE = [
  { gp: 'Bahrain Grand Prix', track: 'Sakhir', date: 'Finished', winner: 'Max Verstappen', active: false },
  { gp: 'Saudi Arabian Grand Prix', track: 'Jeddah', date: 'Finished', winner: 'Max Verstappen', active: false },
  { gp: 'Australian Grand Prix', track: 'Melbourne', date: 'Finished', winner: 'Lando Norris', active: false },
  { gp: 'Japanese Grand Prix', track: 'Suzuka', date: 'Finished', winner: 'Max Verstappen', active: false },
  { gp: 'Chinese Grand Prix', track: 'Shanghai', date: 'Finished', winner: 'Max Verstappen', active: false },
  { gp: 'Miami Grand Prix', track: 'Miami', date: 'Finished', winner: 'Lando Norris', active: false },
  { gp: 'Monaco Grand Prix', track: 'Monte Carlo', date: 'Finished', winner: 'Charles Leclerc', active: false },
  { gp: 'Canadian Grand Prix', track: 'Montreal', date: 'Active GP', winner: 'Lewis Hamilton', active: true },
  { gp: 'Spanish Grand Prix', track: 'Barcelona', date: 'June 21', winner: '-', active: false },
  { gp: 'Austrian Grand Prix', track: 'Spielberg', date: 'June 28', winner: '-', active: false }
];

function LiveSeason() {
  const [positions, setPositions] = useState([
    { name: 'Max Verstappen', team: 'Red Bull', lapTime: '1:14.281', gap: 'LEADER' },
    { name: 'Lando Norris', team: 'McLaren', lapTime: '1:14.394', gap: '+1.130s' },
    { name: 'Lewis Hamilton', team: 'Ferrari', lapTime: '1:14.452', gap: '+1.621s' },
    { name: 'Charles Leclerc', team: 'Ferrari', lapTime: '1:14.610', gap: '+2.859s' }
  ]);
  
  const [lap, setLap] = useState(64);
  const totalLaps = 70;
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let interval;
    if (isSimulating && lap < totalLaps) {
      interval = setInterval(() => {
        setLap(prev => prev + 1);
        
        // Randomly shuffle minor lap times/gaps to simulate racing
        setPositions(prev => {
          const updated = [...prev];
          // Simple random swap/gap changes
          if (Math.random() > 0.6) {
            const temp = updated[1];
            updated[1] = updated[2];
            updated[2] = temp;
          }
          return updated.map((driver, index) => {
            const baseSec = 74 + Math.random() * 0.8;
            const lapStr = `1:${baseSec.toFixed(3)}`;
            let gapStr = 'LEADER';
            if (index > 0) {
              const gapVal = index * 1.2 + Math.random() * 0.5;
              gapStr = `+${gapVal.toFixed(3)}s`;
            }
            return { ...driver, lapTime: lapStr, gap: gapStr };
          });
        });
      }, 1500);
    } else if (lap >= totalLaps) {
      setIsSimulating(false);
    }
    return () => clearInterval(interval);
  }, [isSimulating, lap]);

  const handleSimulate = () => {
    if (lap >= totalLaps) {
      setLap(60);
    }
    setIsSimulating(true);
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-f1-light">🏁 Live Season & Schedule</h1>
        <p className="text-f1-muted text-sm mt-1">Real-time mock race tracking, results history, and championship calendar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Race Simulator Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-f1-red/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-f1-light flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-f1-red animate-pulse"></span> Canadian Grand Prix Live
                </h3>
                <span className="text-xs text-f1-muted uppercase font-semibold">Circuit Gilles Villeneuve</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-f1-muted block">Current Lap</span>
                <span className="text-2xl font-black text-f1-light">{lap}/{totalLaps}</span>
              </div>
            </div>

            {/* Standing board */}
            <div className="space-y-2 mb-6">
              {positions.map((p, index) => (
                <div key={p.name} className="flex justify-between items-center bg-f1-dark/40 border border-f1-border/50 p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-f1-red w-4">P{index + 1}</span>
                    <div>
                      <span className="font-bold text-f1-light text-sm">{p.name}</span>
                      <span className="text-xs text-f1-muted ml-2">{p.team}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <span className="text-xs text-f1-muted block">Last Lap</span>
                      <span className="text-xs text-f1-light font-semibold">{p.lapTime}</span>
                    </div>
                    <div>
                      <span className="text-xs text-f1-muted block">Gap</span>
                      <span className="text-xs text-f1-light font-semibold">{p.gap}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center border-t border-f1-border pt-4">
              <span className="text-xs text-f1-muted">Simulate final laps of the GP</span>
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="bg-f1-red text-f1-light px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-sm transform -skew-x-12 disabled:opacity-50"
              >
                {isSimulating ? 'Racing...' : lap >= totalLaps ? 'Reset & Restart' : 'Trigger Lap Update'}
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Panel */}
        <div className="lg:col-span-1">
          <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-f1-light mb-4">📅 2026 Calendar</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {SCHEDULE.map((race, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded border text-xs flex justify-between items-center transition ${
                    race.active 
                      ? 'border-f1-red bg-f1-red/5' 
                      : 'border-f1-border bg-f1-dark/20'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-f1-light">{race.gp}</h4>
                    <span className="text-f1-muted mt-0.5 block">{race.track}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase ${
                      race.active 
                        ? 'bg-f1-red text-f1-light' 
                        : race.winner !== '-' 
                          ? 'bg-f1-border text-f1-muted' 
                          : 'bg-f1-panel border border-f1-border text-f1-muted'
                    }`}>
                      {race.active ? 'LIVE' : race.date}
                    </span>
                    {race.winner !== '-' && (
                      <span className="text-[10px] text-f1-muted block mt-1">🥇 {race.winner}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LiveSeason;
