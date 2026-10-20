import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDialogAccessibility from '../hooks/useDialogAccessibility';
import circuitsData from '../data/circuits.json';
import constructorsData from '../data/constructors.json';
const PAGES = [
  { id: 'watch', label: 'Watch Your First Race', path: '/watch', icon: '🏁', type: 'page' },
  { id: 'start', label: 'Learn F1', path: '/', icon: '🏠', type: 'page' },
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

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const ref = useDialogAccessibility(isOpen, onClose);
  const navigate = useNavigate();
  const q = query.trim().toLowerCase();
  const results = q ? [...PAGES, ...CIRCUIT_ITEMS, ...CONSTRUCTOR_ITEMS].filter(item => `${item.label} ${item.sublabel || ''}`.toLowerCase().includes(q)).slice(0, 12) : PAGES.filter(item => ['start', 'watch', 'strategy', 'garage'].includes(item.id));
  const go = item => { navigate(item.path); onClose(); };
  return <div className="search-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}><section ref={ref} className="search-dialog" role="dialog" aria-modal="true" aria-label="Search the website" tabIndex={-1}><div className="search-input-row"><input aria-label="Search pages, circuits and teams" placeholder="Search pages, circuits and teams…" value={query} onChange={event => { setQuery(event.target.value); setSelected(0); }} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setSelected(index => Math.min(index + 1, results.length - 1)); } if (event.key === 'ArrowUp') { event.preventDefault(); setSelected(index => Math.max(0, index - 1)); } if (event.key === 'Enter' && results[selected]) go(results[selected]); }} /><button onClick={onClose} aria-label="Close search">✕</button></div><div className="search-results"><p className="learn-eyebrow">{q ? `${results.length} results` : 'Explore the website'}</p>{results.map((item, index) => <button className={index === selected ? 'selected' : ''} key={item.id} onClick={() => go(item)}><span>{item.label}<small>{item.sublabel || 'Page'}</small></span><span>{item.type === 'constructor' ? 'Team' : item.type === 'circuit' ? 'Circuit' : '↗'}</span></button>)}{!results.length && <p className="search-empty">No results. Try another name or topic.</p>}</div><footer>↑ ↓ to browse · Enter to open <span>Esc to close</span></footer></section></div>;
}
