import { useState } from 'react';
import logos from '../data/teamLogos.json';
export default function TeamLogo({ id, name, historical = false }) {
 const [failed, setFailed] = useState(false);
 const aliases = { redbull: 'red_bull', racing_bulls: 'rb', astonmartin: 'aston_martin' };
 const entry = logos[aliases[id] || id];
 return <div className="team-logo">{entry && !failed ? <img src={`${import.meta.env.BASE_URL}${entry.path}`} alt={`${name} ${entry.historical ? 'archived' : 'official'} logo${historical && !entry.historical ? ' (current identity)' : ''}`} width="120" height="64" loading="lazy" decoding="async" onError={() => setFailed(true)} /> : <span aria-label={`${name}: archived logo unavailable`}>{name.split(' ').map(word => word[0]).slice(0,3).join('')}</span>}</div>;
}
