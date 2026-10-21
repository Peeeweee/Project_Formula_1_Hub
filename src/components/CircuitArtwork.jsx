import geometry from '../data/circuitGeometry.json';
export default function CircuitArtwork({ circuitId, name, className = '' }) {
 const track=geometry[circuitId] || Object.values(geometry).find(item=>item.name.toLowerCase()===name?.toLowerCase());
 return <div className={`circuit-artwork ${className}`}><svg viewBox="0 0 500 320" role="img" aria-label={track?`${name || track.name} reference circuit layout`:'Circuit layout unavailable'}>{track?<><path d={track.path} fill="none" stroke="#303c51" strokeWidth="14" strokeLinejoin="round"/><path d={track.path} fill="none" stroke="#ed354c" strokeWidth="3.5" strokeLinejoin="round"/></>:<text x="250" y="160" fill="#a5b4c9" textAnchor="middle" fontSize="15">No verified layout available</text>}</svg><span>REFERENCE LAYOUT / <a href="https://github.com/bacinger/f1-circuits" target="_blank" rel="noreferrer">GEODATA SOURCE ↗</a></span></div>;
}
