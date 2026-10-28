import { lazy, Suspense, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GLOSSARY } from '../data/glossary';
const GlossaryModal=lazy(()=>import('../components/GlossaryModal'));
export default function Dictionary(){
 const [params,setParams]=useSearchParams(),[query,setQuery]=useState('');
 const selected=GLOSSARY.find(item=>item.term===params.get('term'));
 const terms=GLOSSARY.filter(item=>`${item.term} ${item.definition}`.toLowerCase().includes(query.toLowerCase()));
 return <div className="experience-page"><header className="experience-heading"><p className="experience-kicker">THE LANGUAGE OF RACING</p><h1>F1, translated.</h1><p>Hear a word on the broadcast? Find the meaning, then watch how it works. Every explanation has chapters and playback controls.</p><Link to="/watch">Learn to read the broadcast →</Link></header><label className="experience-search">Find a term<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try safety car, tires, or energy…"/></label><p className="experience-result-count" role="status">{terms.length} explanations</p><div className="experience-card-grid">{terms.map(item=><button className="experience-topic" key={item.term} onClick={()=>setParams({term:item.term})}><span className="experience-kicker">ANIMATED EXPLAINER ↗</span><h2>{item.term}</h2><p>{item.definition}</p><span>Explore the mechanism →</span></button>)}</div>{!terms.length&&<p>No matching term. Try a shorter word or search the definition.</p>}{selected&&<Suspense fallback={<p role="status">Loading explanation…</p>}><GlossaryModal key={selected.term} termData={selected} onClose={()=>setParams({})}/></Suspense>}</div>;
}
