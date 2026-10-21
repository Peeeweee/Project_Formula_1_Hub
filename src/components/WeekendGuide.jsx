import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WEEKEND_FORMATS, WEEKEND_SOURCE } from '../data/weekendGuide';
export default function WeekendGuide() {
 const [format,setFormat]=useState('standard'); const [selected,setSelected]=useState(0);
 const steps=WEEKEND_FORMATS[format],step=steps[selected];
 return <div className="weekend-guide"><div className="learning-toolbar"><div role="group" aria-label="Weekend format">{['standard','sprint'].map(value=><button key={value} aria-pressed={format===value} onClick={()=>{setFormat(value);setSelected(0);}}>{value==='standard'?'Standard weekend':'Sprint weekend'}</button>)}</div><span>2026 format / local schedules can vary</span></div>
 <div className="weekend-workbench"><div className="weekend-session-list" role="tablist" aria-label="Weekend sessions">{steps.map((item,i)=><button key={item.name} role="tab" id={`weekend-tab-${i}`} aria-controls="weekend-session-detail" aria-selected={selected===i} onClick={()=>setSelected(i)}><small>{item.day} / 0{i+1}</small><strong>{item.name}</strong><span>{item.duration}</span></button>)}</div>
 <div role="tabpanel" id="weekend-session-detail" aria-labelledby={`weekend-tab-${selected}`} className="weekend-detail"><AnimatePresence mode="wait" initial={false}><motion.article key={format+selected} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.18}}><span className="learning-eyebrow">{step.day} / {step.name}</span><h3>{step.focus}</h3><p>{step.text}</p><div className="learning-detail-grid"><div><h4>What to watch</h4><p>{step.watch}</p></div><div><h4>Think like an engineer</h4><p>{step.data}</p></div></div></motion.article></AnimatePresence></div></div><a className="learning-source" href={WEEKEND_SOURCE} target="_blank" rel="noreferrer">F1 format reference / Sprint guide ↗</a></div>;
}
