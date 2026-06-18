import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const STRATEGIES = {
  oneStopSoftHard: {
    name: '1-Stop: Soft → Hard',
    pitLap: 22,
    predictedDuration: '1h 22m 14.510s',
    degGraph: [
      { lap: 1, grip: 100, type: 'Soft' },
      { lap: 10, grip: 88, type: 'Soft' },
      { lap: 20, grip: 70, type: 'Soft' },
      { lap: 22, grip: 30, type: 'PitStop' }, // Pit
      { lap: 23, grip: 98, type: 'Hard' },
      { lap: 35, grip: 92, type: 'Hard' },
      { lap: 50, grip: 84, type: 'Hard' },
      { lap: 70, grip: 72, type: 'Hard' }
    ]
  },
  oneStopMediumHard: {
    name: '1-Stop: Medium → Hard',
    pitLap: 28,
    predictedDuration: '1h 21m 58.215s',
    degGraph: [
      { lap: 1, grip: 98, type: 'Medium' },
      { lap: 15, grip: 88, type: 'Medium' },
      { lap: 27, grip: 72, type: 'Medium' },
      { lap: 28, grip: 30, type: 'PitStop' }, // Pit
      { lap: 29, grip: 98, type: 'Hard' },
      { lap: 45, grip: 88, type: 'Hard' },
      { lap: 60, grip: 79, type: 'Hard' },
      { lap: 70, grip: 73, type: 'Hard' }
    ]
  },
  twoStopSoftMediumSoft: {
    name: '2-Stop: Soft → Medium → Soft',
    pitLap: 18,
    predictedDuration: '1h 22m 30.142s',
    degGraph: [
      { lap: 1, grip: 100, type: 'Soft' },
      { lap: 17, grip: 74, type: 'Soft' },
      { lap: 18, grip: 30, type: 'PitStop' }, // Pit 1
      { lap: 19, grip: 98, type: 'Medium' },
      { lap: 35, grip: 84, type: 'Medium' },
      { lap: 48, grip: 70, type: 'Medium' },
      { lap: 49, grip: 30, type: 'PitStop' }, // Pit 2
      { lap: 50, grip: 100, type: 'Soft' },
      { lap: 70, grip: 80, type: 'Soft' }
    ]
  }
};

function PitWallAI() {
  const [selectedStrategyKey, setSelectedStrategyKey] = useState('oneStopMediumHard');
  const activeStrategy = STRATEGIES[selectedStrategyKey];

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-f1-light">🧠 Pit Wall AI Strategy Planner</h1>
        <p className="text-f1-muted text-sm mt-1">Calculate tyre wear, determine optimal pit windows, and analyze race strategy simulations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Strategy Selector Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-f1-light mb-4">Select Strategy</h3>
            
            <div className="flex flex-col gap-3">
              {Object.keys(STRATEGIES).map(key => {
                const strat = STRATEGIES[key];
                const isActive = key === selectedStrategyKey;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedStrategyKey(key)}
                    className={`p-4 rounded-md border text-left transition duration-300 ${
                      isActive 
                        ? 'bg-f1-red/10 border-f1-red text-f1-light' 
                        : 'bg-f1-panel/40 border-f1-border text-f1-muted hover:bg-f1-panel hover:text-f1-light'
                    }`}
                  >
                    <h4 className="font-bold text-sm">{strat.name}</h4>
                    <div className="mt-2 flex justify-between items-center text-[10px] text-f1-muted">
                      <span>Target Pit Stop: Lap {strat.pitLap}</span>
                      <span className="font-semibold text-f1-light">{strat.predictedDuration}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-f1-red/5 rounded-full blur-2xl pointer-events-none"></div>
            <h3 className="text-lg font-bold text-f1-light mb-2">⚡ Strategy Recommendation</h3>
            <p className="text-xs text-f1-muted leading-relaxed">
              Based on ambient temperature (22°C) and track abrasion index, the <span className="text-f1-red font-bold">{STRATEGIES.oneStopMediumHard.name}</span> is predicted to be the fastest overall strategy by 11.9s.
            </p>
          </div>
        </div>

        {/* Chart Telemetry Column */}
        <div className="lg:col-span-2">
          <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-f1-light mb-6 flex items-center gap-2">
              📉 Projected Tyre Grip Deg (%) over 70 Laps
            </h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activeStrategy.degGraph}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" opacity={0.6} />
                  <XAxis dataKey="lap" type="number" domain={[0, 70]} stroke="#666666" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#666666" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f0f18', 
                      borderColor: '#1a1a24', 
                      color: '#f0f0f0',
                      borderRadius: '4px'
                    }}
                    formatter={(value, name, props) => [`${value}% Grip`, `${props.payload.type} Compound`]}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Line 
                    type="monotone" 
                    name="Projected Tyre Grip" 
                    dataKey="grip" 
                    stroke="#e10600" 
                    strokeWidth={3} 
                    dot={{ strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PitWallAI;
