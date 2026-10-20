import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { COMPOUNDS, simulateStrategy } from '../utils/strategySimulation';
import DataNote from './DataNote';

export default function StrategyLab() {
  const [pitLap, setPitLap] = useState(22);
  const [compound, setCompound] = useState('hard');
  const [traffic, setTraffic] = useState(0);
  const [safetyCarLap, setSafetyCarLap] = useState(0);
  const result = simulateStrategy({ pitLap, compound, traffic, safetyCarLap });
  const baseline = simulateStrategy({ pitLap: 25, compound: 'hard', safetyCarLap });
  const delta = result.total - baseline.total;
  const chart = result.laps.map((lap, index) => ({ ...lap, baseline: baseline.laps[index].seconds }));
  return (
    <section id="strategy-lab" className="scroll-mt-24 rounded-2xl border border-f1-red/40 bg-f1-panel p-5 sm:p-8 space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-widest text-f1-red">Your turn on the pit wall</p><h2 className="text-2xl font-black text-white">Make the strategy call</h2></div>
      <p className="text-sm text-f1-muted">You start a 50-lap dry race on mediums. Compare your one-stop plan with a rival switching to hards on lap 25.</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">Pit at end of lap <strong>{pitLap}</strong><input className="mt-3 w-full accent-red-600" type="range" min="5" max="49" value={pitLap} onChange={e => setPitLap(Number(e.target.value))} /></label>
        <label className="text-sm">Next tire<select className="mt-2 w-full rounded border border-f1-border bg-f1-dark p-2" value={compound} onChange={e => setCompound(e.target.value)}>{Object.entries(COMPOUNDS).map(([key, tire]) => <option key={key} value={key}>{tire.label}</option>)}</select></label>
        <label className="text-sm">Traffic after your stop<select className="mt-2 w-full rounded border border-f1-border bg-f1-dark p-2" value={traffic} onChange={e => setTraffic(Number(e.target.value))}><option value="0">Clear air</option><option value="0.8">0.8s/lap for 3 laps</option><option value="1.6">1.6s/lap for 3 laps</option></select></label>
        <label className="text-sm">Safety Car starts<select className="mt-2 w-full rounded border border-f1-border bg-f1-dark p-2" value={safetyCarLap} onChange={e => setSafetyCarLap(Number(e.target.value))}><option value="0">No Safety Car</option>{[15, 22, 30, 40].map(lap => <option key={lap} value={lap}>Lap {lap} (3 laps)</option>)}</select></label>
      </div>
      <div aria-live="polite" className="rounded-xl border border-f1-border bg-f1-dark p-4">
        <p className="text-xl font-bold text-white">{Math.abs(delta) < 0.05 ? 'Even with your rival' : `${Math.abs(delta).toFixed(1)}s ${delta < 0 ? 'faster' : 'slower'} than your rival`}</p>
        <p className="mt-1 text-sm text-f1-muted">Your pit loss: {result.pitLoss}s. {result.pitLoss === 12 ? 'Stopping under the Safety Car costs less time because the field is slower.' : 'Stopping under green flags costs more time relative to cars on track.'} {compound === 'soft' ? 'Softs are initially quicker, but their higher wear can hurt a long final stint.' : 'A longer opening stint means older mediums; a shorter one means more laps on your next set.'}</p>
        {!result.legal && <p className="mt-2 text-sm text-amber-300">Dry-race rule check: medium → medium uses only one slick specification. This plan would need another compound to meet the usual two-compound requirement.</p>}
      </div>
      <div className="h-64" role="img" aria-label="Simulated lap times for your strategy and the rival; lower times mean faster laps">
        <ResponsiveContainer width="100%" height="100%"><LineChart data={chart}><CartesianGrid stroke="#242430" strokeDasharray="3 3" /><XAxis dataKey="lap" stroke="#aaa" /><YAxis domain={['auto', 'auto']} unit="s" stroke="#aaa" width={60} /><Tooltip contentStyle={{ background: '#111118', borderColor: '#555' }} labelFormatter={lap => `Lap ${lap}`} /><Legend /><Line dataKey="seconds" name="Your plan" stroke="#ef4444" dot={false} isAnimationActive={false} /><Line dataKey="baseline" name="Rival: medium → hard, lap 25" stroke="#38bdf8" dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer>
      </div>
      <DataNote kind="Simulation">Fixed assumptions: 90s base lap, linear tire wear, 22s green / 12s Safety Car pit loss, equal car pace. Traffic applies only to your first three laps after stopping. Weather, overtaking, warm-up and actual race positions are not modelled. Compare tradeoffs, not real race predictions.</DataNote>
    </section>
  );
}
