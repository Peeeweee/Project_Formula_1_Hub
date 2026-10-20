import { useState } from 'react';
import { Link } from 'react-router-dom';

const PARTS = [
  { name: 'Front wing', camera: 'front', text: 'Creates front downforce and guides airflow along the car. Its balance affects turn-in and front-tire loading.', watch: 'Understeer: the car runs wider than the driver wants. Setup, tire condition and speed can all contribute.' },
  { name: 'Floor & diffuser', camera: 'side', text: 'Shapes the flow beneath the car to help create downforce. The effect depends on ride height and the regulations for that era.', watch: 'Teams tune ride height to balance aerodynamic performance, stability and clearance over bumps.' },
  { name: 'Rear wing', camera: 'rear', text: 'Helps load the rear tires for cornering, while adding drag on straights. Teams choose a compromise for each circuit.', watch: 'A lower-drag setup can improve straight-line speed while reducing cornering performance.' },
  { name: 'Tires & suspension', camera: 'side', text: 'Tires provide the contact with the road. Suspension controls wheel movement and the car’s platform; temperature and load affect grip.', watch: 'A tire can lose performance through overheating, wear or being too cold. Compound alone does not determine pace.' },
  { name: 'Power unit', camera: 'rear', text: 'Combines a turbocharged combustion engine, electrical machine and energy storage. Energy recovery and deployment affect lap performance.', watch: 'The 2026 system removes the MGU-H and increases the electrical contribution compared with 2014–2025.' },
  { name: 'Cockpit & Halo', camera: 'cockpit', text: 'The driver operates steering, braking, gears and many settings from the cockpit. The Halo helps protect the head from impacts.', watch: 'Safety structures reduce risk; they cannot guarantee protection in every accident.' },
];

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
