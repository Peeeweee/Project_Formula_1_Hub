import { useState } from 'react';
import { Link } from 'react-router-dom';
import DataNote from '../components/DataNote';

const EVENTS = {
  racing: { label: 'Green flag', title: 'Racing normally', text: 'Watch the interval over several laps. A shrinking interval can suggest the driver is catching up, but traffic and pit cycles matter.', rows: [['1', 'Driver A', 'Leader', '—', 'M · 18 laps'], ['2', 'Driver B', '+5.000', '+5.000', 'H · 7 laps'], ['3', 'Driver C', '+8.000', '+3.000', 'M · 19 laps']] },
  pit: { label: 'Pit stop', title: 'Track position is changing', text: 'Driver B is in the pits. A temporary drop in position does not necessarily mean their strategy is worse. Compare again after rivals have also stopped.', rows: [['1', 'Driver A', 'Leader', '—', 'M · 18 laps'], ['2', 'Driver C', '+8.000', '+8.000', 'M · 19 laps'], ['3', 'Driver B', '+27.000', '+19.000', 'PIT → H']] },
  safety: { label: 'Safety Car', title: 'The field is neutralised', text: 'Drivers slow down and normally queue behind the Safety Car. Gaps tend to shrink. A stop may cost less relative time, but track position and the restart still matter.', rows: [['1', 'Driver A', 'Leader', '—', 'M · 18 laps'], ['2', 'Driver B', '+0.900', '+0.900', 'H · 7 laps'], ['3', 'Driver C', '+1.800', '+0.900', 'M · 19 laps']] },
};
const FLAGS = [
  ['Yellow', 'Hazard ahead. Slow down and do not overtake in the affected area. Double waved yellows require extra caution and readiness to stop.'],
  ['Green', 'The hazard restriction has ended at the applicable point. Normal racing can resume subject to other signals.'],
  ['Red', 'The session is suspended. Drivers slow down and follow race control instructions.'],
  ['Blue', 'In a race, a car about to be lapped must allow the faster car through. It does not tell every slower rival to give up a position.'],
  ['VSC', 'Drivers follow minimum time requirements. It usually preserves gaps more closely than a physical Safety Car, but gaps are not perfectly fixed.'],
  ['Chequered', 'The session or race has ended for the driver crossing the line.'],
];

export default function WatchRace() {
  const [event, setEvent] = useState('racing');
  const [reference, setReference] = useState('interval');
  const scenario = EVENTS[event];
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-16 space-y-8">
      <header><p className="text-xs font-bold uppercase tracking-widest text-f1-red">Keep this beside the broadcast</p><h1 className="text-3xl sm:text-5xl font-black">Watch your first race</h1><p className="mt-3 max-w-3xl text-f1-muted">Start with the running order, the gap ahead, and the tires. Add strategy and technical details as you get comfortable.</p></header>
      <DataNote kind="Interactive example">These drivers and times are fictional teaching examples. <Link className="underline text-white" to="/live-season">Open available season and session data →</Link></DataNote>
      <section className="rounded-2xl border border-f1-border bg-f1-panel p-5 sm:p-8 space-y-5">
        <h2 className="text-2xl font-black">Read the timing tower</h2>
        <div className="flex flex-wrap gap-2">{Object.entries(EVENTS).map(([key, item]) => <button key={key} aria-pressed={event === key} onClick={() => setEvent(key)} className={`rounded-lg border px-4 py-2 text-sm ${event === key ? 'border-f1-red bg-f1-red/15' : 'border-f1-border text-f1-muted'}`}>{item.label}</button>)}</div>
        <label className="block text-sm">Explain this column <select value={reference} onChange={e => setReference(e.target.value)} className="ml-2 rounded bg-f1-dark border border-f1-border p-2"><option value="interval">Interval</option><option value="gap">Gap to leader</option></select></label>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Fictional timing tower during {scenario.label}</caption><thead className="text-f1-muted"><tr>{['Pos', 'Driver', 'Gap', 'Interval', 'Tires / age'].map(label => <th key={label} scope="col" className="p-3">{label}</th>)}</tr></thead><tbody>{scenario.rows.map(row => <tr key={row[1]} className="border-t border-f1-border">{row.map((cell, index) => <td key={index} className={`p-3 font-mono ${index === (reference === 'gap' ? 2 : 3) ? 'bg-f1-red/10 text-white' : 'text-f1-muted'}`}>{cell}</td>)}</tr>)}</tbody></table></div>
        <div aria-live="polite" className="rounded-xl bg-f1-dark p-4"><h3 className="font-bold">{scenario.title}</h3><p className="mt-1 text-sm text-f1-muted">{scenario.text}</p><p className="mt-3 text-sm">{reference === 'gap' ? 'Gap measures time behind the leader. +8.000 means eight seconds behind P1.' : 'Interval measures time to the car immediately ahead. In the green-flag example, P3 is eight seconds behind P1 but only three seconds behind P2.'}</p></div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-f1-border bg-f1-panel p-6"><h2 className="text-2xl font-black mb-4">Signals you will see</h2>{FLAGS.map(([name, text]) => <details key={name} className="border-t border-f1-border py-3"><summary className="cursor-pointer font-bold">{name}</summary><p className="mt-2 text-sm text-f1-muted">{text}</p></details>)}</section>
        <section className="rounded-2xl border border-f1-border bg-f1-panel p-6 space-y-4"><h2 className="text-2xl font-black">Three questions to follow</h2><ol className="list-decimal pl-5 space-y-4 text-f1-muted"><li><strong className="text-white">Who is catching whom?</strong> Compare intervals over multiple laps.</li><li><strong className="text-white">Who still needs to pit?</strong> Check tire age and stops before judging the order.</li><li><strong className="text-white">What changed?</strong> Look for flags, traffic, rain, penalties or a tire change.</li></ol><p className="text-sm text-f1-muted">S / M / H mean soft, medium and hard slicks. I / W mean intermediate and wet tires. Tire age counts laps on that set. Purple usually marks the best sector overall; green marks a personal improvement.</p><p className="text-sm text-f1-muted">A time penalty can change the final order. DNF means did not finish; a retired driver can still be classified under the distance rules.</p><Link to="/strategy?section=strategy-lab" className="inline-block rounded-lg bg-f1-red px-4 py-2 font-bold">Try a pit-stop decision →</Link></section>
      </div>
      <DataNote kind="2026 context" source={{ label: 'FIA explanation', url: 'https://www.fia.com/news/f1s-new-era-everything-you-need-know-about-how-fia-making-formula-1-more-competitive-more' }}>Active aero changes wing configuration in designated zones. Overtake Mode provides an electrical overtaking assist when eligibility conditions are met. Older races use DRS terminology; these systems are different.</DataNote>
    </div>
  );
}
