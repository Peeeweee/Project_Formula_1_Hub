import { useState } from 'react';
import StrategyLab from '../components/StrategyLab';
import DataNote from '../components/DataNote';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceDot 
} from 'recharts';
import FadeInSection from '../components/FadeInSection';
import anomalyData from '../data/lap_anomalies/driver_830_anomalies.json';

const TIRE_GUIDE = [
  {
    name: 'SOFT TIRES',
    color: '#ef4444',
    badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
    speed: 'Short-run performance',
    durability: 'Shorter life · conditions vary',
    description: 'Often chosen for short performance runs. Grip, warm-up and wear depend on the event selection and conditions.'
  },
  {
    name: 'MEDIUM TIRES',
    color: '#fbbf24',
    badgeBg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    speed: 'Balanced choice',
    durability: 'Balanced life · conditions vary',
    description: 'A common compromise. Good speed with solid longevity for race stints.'
  },
  {
    name: 'HARD TIRES',
    color: '#ffffff',
    badgeBg: 'bg-white/20 text-white border-white/40',
    speed: 'Long-run focus',
    durability: 'Longer life · conditions vary',
    description: 'Often suitable for longer stints, with a warm-up tradeoff. Hard tires still degrade, and their performance depends on conditions.'
  }
];

const DRIVER_STRATEGIES = [
  {
    driver: 'Max Verstappen',
    team: 'Red Bull Racing',
    color: '#3b82f6',
    strategyName: '1-Stop Strategy (Medium ➔ Hard)',
    summary: 'Max started on Yellow Medium tires, built a 5-second gap, pitted on Lap 23 for White Hard tires, and controlled the race to victory.',
    stints: [
      { compound: 'MEDIUM', start: 1, end: 22, color: '#fbbf24' },
      { compound: 'HARD', start: 23, end: 57, color: '#ffffff' }
    ]
  },
  {
    driver: 'Lando Norris',
    team: 'McLaren',
    color: '#ff8700',
    strategyName: 'Overcut Strategy (Medium ➔ Hard)',
    summary: 'Lando stayed out 6 laps longer on Medium tires to catch clear air before pitting on Lap 29 for Hard tires, finishing P2.',
    stints: [
      { compound: 'MEDIUM', start: 1, end: 28, color: '#fbbf24' },
      { compound: 'HARD', start: 29, end: 57, color: '#ffffff' }
    ]
  },
  {
    driver: 'Charles Leclerc',
    team: 'Ferrari',
    color: '#e10600',
    strategyName: 'Alternative Strategy (Hard ➔ Soft)',
    summary: 'Charles started on Hard tires to run deep into the race, then fitted fresh Soft tires on Lap 33 to charge through the pack.',
    stints: [
      { compound: 'HARD', start: 1, end: 32, color: '#ffffff' },
      { compound: 'SOFT', start: 33, end: 57, color: '#ef4444' }
    ]
  },
  {
    driver: 'Lewis Hamilton',
    team: 'Mercedes',
    color: '#00a19c',
    strategyName: '2-Stop Attack (Medium ➔ Hard ➔ Soft)',
    summary: 'Lewis pitted early on Lap 18, then made a late sprint pit stop on Lap 43 for Soft tires to attack on fresh tires late in the race.',
    stints: [
      { compound: 'MEDIUM', start: 1, end: 18, color: '#fbbf24' },
      { compound: 'HARD', start: 19, end: 42, color: '#ffffff' },
      { compound: 'SOFT', start: 43, end: 57, color: '#ef4444' }
    ]
  },
  {
    driver: 'Oscar Piastri',
    team: 'McLaren',
    color: '#ff8700',
    strategyName: 'Aggressive Undercut (Soft ➔ Hard)',
    summary: 'Oscar launched on Soft tires to grab track position off the line, pitting early on Lap 14 for Hard tires to defend P3.',
    stints: [
      { compound: 'SOFT', start: 1, end: 14, color: '#ef4444' },
      { compound: 'HARD', start: 15, end: 57, color: '#ffffff' }
    ]
  },
  {
    driver: 'George Russell',
    team: 'Mercedes',
    color: '#00a19c',
    strategyName: 'Standard 1-Stop (Medium ➔ Hard)',
    summary: 'George executed a clean 1-stop strategy, pitting on Lap 24 for Hards and maintaining strong race pace in stint two.',
    stints: [
      { compound: 'MEDIUM', start: 1, end: 24, color: '#fbbf24' },
      { compound: 'HARD', start: 25, end: 57, color: '#ffffff' }
    ]
  },
  {
    driver: 'Carlos Sainz',
    team: 'Ferrari',
    color: '#e10600',
    strategyName: 'Long Stint Overcut (Medium ➔ Soft)',
    summary: 'Carlos managed his Medium tires to Lap 30, taking advantage of a Safety Car window to swap directly to Softs for the sprint finish.',
    stints: [
      { compound: 'MEDIUM', start: 1, end: 30, color: '#fbbf24' },
      { compound: 'SOFT', start: 31, end: 57, color: '#ef4444' }
    ]
  },
  {
    driver: 'Sergio Pérez',
    team: 'Red Bull Racing',
    color: '#3b82f6',
    strategyName: 'Recovery 2-Stop (Soft ➔ Medium ➔ Hard)',
    summary: 'Checo made an early pit stop on Lap 12 to clear traffic, followed by a second stop on Lap 34 to attack the closing laps.',
    stints: [
      { compound: 'SOFT', start: 1, end: 12, color: '#ef4444' },
      { compound: 'MEDIUM', start: 13, end: 34, color: '#fbbf24' },
      { compound: 'HARD', start: 35, end: 57, color: '#ffffff' }
    ]
  },
  {
    driver: 'Fernando Alonso',
    team: 'Aston Martin',
    color: '#229977',
    strategyName: 'Endurance Hard Start (Hard ➔ Medium)',
    summary: 'Fernando started on Hard tires to avoid first-lap chaos, going long until Lap 36 before switching to Mediums to overtake midfield rivals.',
    stints: [
      { compound: 'HARD', start: 1, end: 36, color: '#ffffff' },
      { compound: 'MEDIUM', start: 37, end: 57, color: '#fbbf24' }
    ]
  },
  {
    driver: 'Kimi Antonelli',
    team: 'Mercedes',
    color: '#00a19c',
    strategyName: 'Rookie Sprint 1-Stop (Medium ➔ Hard)',
    summary: 'Kimi demonstrated impressive tire conservation in his debut stints, stretching his Mediums to Lap 25 with low thermal wear.',
    stints: [
      { compound: 'MEDIUM', start: 1, end: 25, color: '#fbbf24' },
      { compound: 'HARD', start: 26, end: 57, color: '#ffffff' }
    ]
  },
  {
    driver: 'Alexander Albon',
    team: 'Williams',
    color: '#002b49',
    strategyName: 'Defensive 1-Stop (Medium ➔ Hard)',
    summary: 'Alex held off a DRS train behind him by pitting early on Lap 19 for Hards and relying on high straight-line speed to hold points position.',
    stints: [
      { compound: 'MEDIUM', start: 1, end: 19, color: '#fbbf24' },
      { compound: 'HARD', start: 20, end: 57, color: '#ffffff' }
    ]
  },
  {
    driver: 'Pierre Gasly',
    team: 'Alpine',
    color: '#ff87bc',
    strategyName: 'Sprint 2-Stop (Soft ➔ Medium ➔ Soft)',
    summary: 'Pierre ran an aggressive multi-stop strategy on high-grip compounds to maximize sector 2 cornering speed.',
    stints: [
      { compound: 'SOFT', start: 1, end: 15, color: '#ef4444' },
      { compound: 'MEDIUM', start: 16, end: 38, color: '#fbbf24' },
      { compound: 'SOFT', start: 39, end: 57, color: '#ef4444' }
    ]
  }
];

const generateLapTelemetry = () => {
  const data = [];
  for (let lap = 1; lap <= 57; lap++) {
    let baseTime = 85 + (lap * 0.05); // Degredation
    if (lap === 1) baseTime += 8;
    if (lap === 23 || lap === 29 || lap === 43) baseTime += 20;
    if (lap >= 30 && lap <= 33) baseTime += 25;

    data.push({
      lap,
      verstappen: parseFloat((baseTime).toFixed(2)),
      norris: parseFloat((baseTime + 0.3).toFixed(2)),
      leclerc: parseFloat((baseTime + 0.6).toFixed(2)),
      isAnomaly: lap === 23 || lap === 31 || lap === 43
    });
  }
  return data;
};

export default function Strategy() {
  const [mode, setMode] = useState('beginner'); // 'beginner' or 'pro'
  const [selectedDriver, setSelectedDriver] = useState(DRIVER_STRATEGIES[0]);
  const [telemetryData] = useState(generateLapTelemetry);
  const [proFocus, setProFocus] = useState('verstappen');


  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#07070a] text-f1-light px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Top Header with Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-f1-border pb-6">
        <div>
          <div className="border-l-2 border-f1-red pl-2 mb-2">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              {mode === 'beginner' ? 'F1 Race Strategy Made Simple' : 'Explore the strategy model'}
            </h4>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {mode === 'beginner' ? 'Race Strategy & Tyre Guide' : 'Pro Telemetry & Degradation Matrix'}
          </h1>
          <p className="text-f1-muted text-xs sm:text-sm mt-1 max-w-2xl">
            {mode === 'beginner' 
              ? 'Understand how Formula 1 pit stops, tire compounds, and race tactics decide who wins the Grand Prix!' 
              : 'Illustrative lap-time patterns and unusual-lap examples, with their assumptions explained.'}
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="bg-[#12121c] p-1.5 rounded-xl border border-f1-border flex items-center gap-1 self-start md:self-auto font-mono text-xs">
          <button
            onClick={() => setMode('beginner')}
            className={`px-4 py-2 rounded-lg font-bold transition duration-200 ${
              mode === 'beginner' 
                ? 'bg-f1-red text-white shadow-lg shadow-f1-red/20' 
                : 'text-f1-muted hover:text-white'
            }`}
          >
            Beginner Mode
          </button>
          <button
            onClick={() => setMode('pro')}
            className={`px-4 py-2 rounded-lg font-bold transition duration-200 ${
              mode === 'pro' 
                ? 'bg-f1-red text-white shadow-lg shadow-f1-red/20' 
                : 'text-f1-muted hover:text-white'
            }`}
          >
            Pro Telemetry
          </button>
        </div>
      </div>

      <DataNote kind="Teaching simulation">The driver stories, stints and lap traces on this page illustrate strategy concepts; they are not a reconstruction of a particular Grand Prix. Team labels are illustrative historical examples. Lower lap times mean faster laps. A slow lap alone does not prove what happened.</DataNote>
      <StrategyLab />
      {/* BEGINNER MODE VIEW */}
      {mode === 'beginner' ? (
        <div className="space-y-10">
          {/* SECTION 1: TIRE 101 GUIDE */}
          <FadeInSection>
            <div className="bg-[#0e0e15] border border-f1-border/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-f1-red animate-pulse" />
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    F1 Tyre Compounds Explained
                  </h2>
                  <p className="text-xs text-f1-muted">Normally, drivers must use two different slick specifications in a dry Grand Prix. Wet-weather use and event-specific rules can change the requirements.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TIRE_GUIDE.map((tire) => (
                  <div 
                    key={tire.name}
                    className="bg-[#12121c] border border-f1-border/60 rounded-xl p-5 space-y-3 flex flex-col justify-between hover:border-f1-red/40 transition duration-200"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${tire.badgeBg}`}>
                          {tire.name}
                        </span>
                        <span className="w-4 h-4 rounded-full border-2 border-black" style={{ backgroundColor: tire.color }} />
                      </div>
                      
                      <div className="text-xs font-mono font-bold text-white pt-1">
                        <div>{tire.speed}</div>
                        <div className="text-f1-muted">{tire.durability}</div>
                      </div>
                    </div>

                    <p className="text-xs text-f1-muted leading-relaxed border-t border-f1-border/40 pt-3">
                      {tire.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>

          {/* SECTION 2: HOW DRIVERS WON THE RACE */}
          <FadeInSection>
            <div className="bg-[#0e0e15] border border-f1-border/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col space-y-4 border-b border-f1-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      Race Strategy Breakdown by Driver
                    </h2>
                    <p className="text-xs text-f1-muted">Select any driver below ({DRIVER_STRATEGIES.length} Drivers) to explore their pit strategy!</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {DRIVER_STRATEGIES.map(d => (
                    <button
                      key={d.driver}
                      onClick={() => setSelectedDriver(d)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition duration-200 flex items-center gap-2 border ${
                        selectedDriver.driver === d.driver 
                          ? 'bg-f1-red text-white border-f1-red shadow-md shadow-f1-red/30' 
                          : 'bg-[#14141f] text-f1-muted border-f1-border/50 hover:text-white hover:border-f1-red/50 hover:bg-[#1a1a28]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span>{d.driver}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Driver Card */}
              <div className="bg-[#12121c] border border-f1-border rounded-xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-f1-muted flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedDriver.color }} />
                      {selectedDriver.team}
                    </span>
                    <h3 className="text-2xl font-black text-white">{selectedDriver.driver}</h3>
                  </div>
                  
                  <span className="bg-f1-red/20 text-f1-red border border-f1-red/40 px-3 py-1 rounded text-xs font-mono font-bold">
                    {selectedDriver.strategyName}
                  </span>
                </div>

                <p className="text-xs text-f1-light leading-relaxed bg-[#07070a] p-4 rounded-lg border border-f1-border/40 font-sans">
                  <span className="font-bold text-white font-mono">Strategy Story:</span> {selectedDriver.summary}
                </p>

                <div className="space-y-2 font-mono">
                  <div className="flex justify-between text-xs text-f1-muted">
                    <span>Start (Lap 1)</span>
                    <span>Mid Race (Lap 28)</span>
                    <span>Finish (Lap 57)</span>
                  </div>
                  <div className="h-9 w-full bg-[#07070a] rounded-lg overflow-hidden flex border border-f1-border/50">
                    {selectedDriver.stints.map((stint, idx) => {
                      const widthPercent = ((stint.end - stint.start + 1) / 57) * 100;
                      return (
                        <div
                          key={`stint-${idx}`}
                          style={{ width: `${widthPercent}%`, backgroundColor: stint.color }}
                          className="h-full relative flex items-center justify-center text-xs font-black text-black border-r border-black/40 px-2"
                        >
                          <span>{stint.compound} (Laps {stint.start}–{stint.end})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* SECTION 3: EASY EVENT CHART */}
          <FadeInSection>
            <div className="bg-[#0e0e15] border border-f1-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-f1-border/40 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Lap Speed & Pit Stop Events
                  </h2>
                  <p className="text-xs text-f1-muted">
                    Notice how lap times jump up when cars stop for fresh tires or when a Safety Car comes out!
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetryData} margin={{ top: 15, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c28" opacity={0.5} />
                    <XAxis dataKey="lap" stroke="#666666" fontSize={11} label={{ value: 'Lap Number (1 to 57)', position: 'bottom', fill: '#888' }} />
                    <YAxis domain={['auto', 'auto']} stroke="#666666" fontSize={11} unit="s" />
                    <Tooltip 
                      formatter={(value) => [`${value}s`, 'Lap Time']}
                      labelFormatter={(lap) => `Lap ${lap}`}
                      contentStyle={{ backgroundColor: '#0e0e16', borderColor: '#e10600', borderRadius: '8px', fontSize: '12px' }} 
                    />

                    <Line type="monotone" dataKey="verstappen" stroke="#3b82f6" name="Max Verstappen" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="norris" stroke="#ff8700" name="Lando Norris" strokeWidth={2.5} dot={false} />

                    <ReferenceDot x={23} y={108} r={7} fill="#fbbf24" stroke="#ffffff" strokeWidth={2} label={{ value: 'Pit Stop (Lap 23)', fill: '#fbbf24', fontSize: 11, position: 'top' }} />
                    <ReferenceDot x={31} y={113} r={7} fill="#ef4444" stroke="#ffffff" strokeWidth={2} label={{ value: 'Safety Car (Lap 31)', fill: '#ef4444', fontSize: 11, position: 'top' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </FadeInSection>
        </div>
      ) : (
        /* PRO TELEMETRY MODE VIEW */
        <div className="space-y-10">
          {/* PRO SECTION 1: TELEMETRY MATRIX STATS */}
          <FadeInSection>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
              <div className="bg-[#0e0e15] border border-f1-border p-5 rounded-xl space-y-1">
                <span className="text-[10px] text-f1-muted uppercase block">Degradation Rate</span>
                <span className="text-xl font-bold text-white">+0.048s / Lap</span>
                <span className="text-[10px] text-green-400 block pt-1">Thermal fade under control</span>
              </div>
              <div className="bg-[#0e0e15] border border-f1-border p-5 rounded-xl space-y-1">
                <span className="text-[10px] text-f1-muted uppercase block">Average Pit Loss</span>
                <span className="text-xl font-bold text-white">21.850 seconds</span>
                <span className="text-[10px] text-f1-red block pt-1">In-lap + Out-lap delta</span>
              </div>
              <div className="bg-[#0e0e15] border border-f1-border p-5 rounded-xl space-y-1">
                <span className="text-[10px] text-f1-muted uppercase block">Fuel Weight Compensation</span>
                <span className="text-xl font-bold text-white">-0.035s / Lap</span>
                <span className="text-[10px] text-blue-400 block pt-1">110kg ➔ 5kg fuel burn</span>
              </div>
              <div className="bg-[#0e0e15] border border-f1-border p-5 rounded-xl space-y-1">
                <span className="text-[10px] text-f1-muted uppercase block">Optimal Pit Window</span>
                <span className="text-xl font-bold text-f1-red">Laps 21 – 26</span>
                <span className="text-[10px] text-f1-muted block pt-1">Undercut advantage: 1.4s</span>
              </div>
            </div>
          </FadeInSection>

          {/* PRO SECTION 2: MULTI-DRIVER LAP TIME TRACE & DEGRADATION */}
          <FadeInSection>
            <div className="bg-[#0e0e15] border border-f1-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-f1-border/40 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Lap Time Trace & Degradation Delta
                  </h2>
                  <p className="text-xs text-f1-muted font-mono">Generated lap-time traces for learning (seconds); these are not measured telemetry.</p>
                </div>

                <div className="flex gap-2 font-mono text-xs">
                  {['verstappen', 'norris', 'leclerc'].map((driverKey) => (
                    <button
                      key={driverKey}
                      onClick={() => setProFocus(driverKey)}
                      className={`px-3 py-1.5 rounded font-bold uppercase transition ${
                        proFocus === driverKey 
                          ? 'bg-f1-red text-white' 
                          : 'bg-[#14141f] text-f1-muted hover:text-white'
                      }`}
                    >
                      {driverKey}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetryData} margin={{ top: 15, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#1c1c28" opacity={0.6} />
                    <XAxis dataKey="lap" stroke="#666666" fontSize={11} label={{ value: 'Lap Number (1 to 57)', position: 'bottom', fill: '#888' }} />
                    <YAxis domain={['auto', 'auto']} stroke="#666666" fontSize={11} unit="s" />
                    <Tooltip 
                      formatter={(value) => [`${value}s`, 'Pace']}
                      labelFormatter={(lap) => `Telemetry Lap ${lap}`}
                      contentStyle={{ backgroundColor: '#09090e', borderColor: '#e10600', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} 
                    />

                    <Line type="monotone" dataKey="verstappen" stroke="#3b82f6" name="VER (Red Bull)" strokeWidth={proFocus === 'verstappen' ? 3 : 1} dot={false} />
                    <Line type="monotone" dataKey="norris" stroke="#ff8700" name="NOR (McLaren)" strokeWidth={proFocus === 'norris' ? 3 : 1} dot={false} />
                    <Line type="monotone" dataKey="leclerc" stroke="#e10600" name="LEC (Ferrari)" strokeWidth={proFocus === 'leclerc' ? 3 : 1} dot={false} />

                    {telemetryData.filter(d => d.isAnomaly).map(d => (
                      <ReferenceDot key={`anomaly-${d.lap}`} x={d.lap} y={d.verstappen} r={6} fill="#e10600" stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </FadeInSection>

          {/* PRO SECTION 3: AUTOMATED TELEMETRY ANOMALY ENGINE */}
          <FadeInSection>
            <div className="bg-[#0e0e15] border border-f1-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Automated Telemetry Anomaly Detector
                </h2>
                <p className="text-xs text-f1-muted font-mono">Bundled Isolation Forest examples flag unusual lap durations. Suggested causes are hypotheses, not verified race-control events.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                {anomalyData.map((anom, idx) => (
                  <div 
                    key={`anom-${idx}`}
                    className={`p-4 rounded-xl border ${anom.isAnomaly ? 'bg-f1-red/10 border-f1-red text-white' : 'bg-[#12121c] border-f1-border/50 text-f1-muted'}`}
                  >
                    <div className="flex justify-between items-center font-bold mb-1">
                      <span>LAP {anom.lap}</span>
                      <span className={anom.isAnomaly ? 'text-f1-red font-black' : 'text-green-400'}>
                        {anom.isAnomaly ? 'ANOMALY DETECTED' : 'NORMAL PACE'}
                      </span>
                    </div>
                    <div className="text-[11px]">
                      Example duration: {anom.milliseconds} ms ({(anom.milliseconds / 1000).toFixed(2)}s)
                    </div>
                    {anom.reason && (
                      <div className="text-[10px] mt-2 bg-black/50 p-2 rounded text-f1-light border border-f1-red/30">
                        Event Code: {anom.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
      )}
    </div>
  );
}
