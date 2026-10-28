import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDialogAccessibility from '../hooks/useDialogAccessibility';
import circuitsData from '../data/circuits.json';
import constructorsData from '../data/constructors.json';
import { ALL_LINKS } from '../data/navigation';
import { GLOSSARY } from '../data/glossary';
import champions from '../data/champions.json';
import { getAllDrivers } from '../services/jolpicaApi';
import { searchItems, driverSearchItem, normalizeSearch } from '../utils/siteSearch';
const PAGES=ALL_LINKS.map(item=>({...item,id:item.path,label:item.label,sublabel:item.description,type:'page'}));
const CIRCUIT_ITEMS=circuitsData.map(c=>({id:`circuit_${c.id}`,label:c.name,sublabel:`${c.city}, ${c.country}`,path:`/venues/${c.id}`,type:'circuit'}));
const CONSTRUCTOR_ITEMS=constructorsData.map(c=>({id:`constructor_${c.id}`,label:c.name,sublabel:c.fullName,path:`/teams?team=${encodeURIComponent(c.id)}&section=team-profile`,type:'team'}));
const GLOSSARY_ITEMS=GLOSSARY.map(term=>({id:`term_${term.term}`,label:term.term,sublabel:term.definition,path:`/dictionary?term=${encodeURIComponent(term.term)}`,type:'term'}));
const ARCHIVE_DRIVERS=[...new Map(champions.flatMap(row=>(row.DriverStandings||[]).map(item=>item.Driver).filter(Boolean)).map(driver=>[driver.driverId,driver])).values()].map(driverSearchItem);

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const ref = useDialogAccessibility(isOpen, onClose);
  const navigate = useNavigate();
  const [drivers,setDrivers]=useState([]),[driverStatus,setDriverStatus]=useState('');
  useEffect(()=>{if(query.trim().length<2||drivers.length||[...PAGES,...CIRCUIT_ITEMS,...CONSTRUCTOR_ITEMS,...GLOSSARY_ITEMS].some(item=>normalizeSearch(item.label)===normalizeSearch(query)))return;let cancelled=false;const timer=setTimeout(()=>{setDriverStatus('Searching the driver archive…');getAllDrivers(1000).then(items=>{if(!cancelled){setDrivers(items.map(driverSearchItem));setDriverStatus('');}}).catch(()=>{if(!cancelled)setDriverStatus('Full driver search is unavailable. Local topics and archived champions remain searchable.');});},300);return()=>{cancelled=true;clearTimeout(timer);};},[query,drivers.length]);
  const q = query.trim().toLowerCase();
  const catalog=[...PAGES,...CIRCUIT_ITEMS,...CONSTRUCTOR_ITEMS,...GLOSSARY_ITEMS,...ARCHIVE_DRIVERS,...drivers];
  const results=q?searchItems(catalog,q):PAGES.filter(item=>['/','/watch','/strategy','/dictionary'].includes(item.id));
  const go = item => { navigate(item.path); onClose(); };
  return <div className="search-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}><section ref={ref} className="search-dialog" role="dialog" aria-modal="true" aria-label="Search the website" tabIndex={-1}><div className="search-input-row"><input aria-label="Search topics, drivers, circuits and teams" placeholder="Search topics, drivers, circuits and teams…" value={query} onChange={event => { setQuery(event.target.value); setSelected(0); }} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setSelected(index => Math.max(0,Math.min(index + 1, results.length - 1))); } if (event.key === 'ArrowUp') { event.preventDefault(); setSelected(index => Math.max(0, index - 1)); } if (event.key === 'Enter' && results[selected]) { event.preventDefault(); go(results[selected]); } }} /><button onClick={onClose} aria-label="Close search">✕</button></div><div className="search-results"><p className="learn-eyebrow">{q ? `${results.length} results` : 'Explore the website'}</p>{results.map((item, index) => <button className={index === selected ? 'selected' : ''} key={item.id} onClick={() => go(item)}><span>{item.label}<small>{item.sublabel || 'Page'}</small></span><span>{item.type==='page'?'Open':item.type}</span></button>)}{!results.length && <p className="search-empty">No results. Try another name or topic.</p>}</div>{q&&driverStatus&&<p className="search-driver-status" role="status">{driverStatus}</p>}<footer>↑ ↓ to browse · Enter to open <span>Esc to close</span></footer></section></div>;
}
