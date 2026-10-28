import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PARTS } from '../data/garageParts';

export default function GarageGuide({ car, onFocus }) {
  const [selected, setSelected] = useState(0);
  const part = PARTS[selected];
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 space-y-4" aria-labelledby="garage-learn">
      <p className="text-xs uppercase tracking-widest text-f1-red font-bold">Look closer</p><h2 id="garage-learn" className="text-2xl font-black">What makes this car work?</h2>
      <p className="text-sm text-f1-muted">Viewing {car.name} · {car.year}. The model is a visual reference; moving parts, internal systems and exact aerodynamic flow may not be represented. Specifications are approximate historical reference values.</p>
      <div className="flex flex-wrap gap-2">{PARTS.map((item, index) => <button key={item.name} aria-pressed={selected === index} onClick={() => { setSelected(index); onFocus(item.camera); }} className={`rounded-lg border px-4 py-2 text-sm ${selected === index ? 'border-f1-red bg-f1-red/15' : 'border-f1-border text-f1-muted'}`}>{item.name}</button>)}</div>
      <div aria-live="polite" className="rounded-xl border border-f1-border bg-f1-panel p-5"><h3 className="font-bold text-xl">{part.name}</h3><p className="mt-2 text-f1-muted">{part.text}</p><p className="mt-3 text-sm"><strong>Watch for: </strong>{part.watch}</p><p className="mt-3 text-sm text-f1-muted">{Number(car.year) >= 2026 ? '2026 era: active aero and electrical Overtake Mode replace the older DRS approach.' : 'Historical era: this car predates the 2026 active-aero rules. Technical systems and limits differ by season.'}</p></div>
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })} className="mr-4 text-sm underline text-white">See the selected camera view ↑</button>
      <Link className="inline-block text-sm underline text-white" to="/cars">Explore the full car anatomy guide →</Link>
    </section>
  );
}
