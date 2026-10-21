import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import useDialogAccessibility from '../hooks/useDialogAccessibility';
import { dictionaryFilm, filmChapter } from '../data/dictionaryFilms';
const Scene=lazy(()=>import('./animations/GlossaryScene'));
export default function GlossaryModal({termData,onClose}) {
 const film=dictionaryFilm(termData.term),reduced=useReducedMotion();
 const [elapsed,setElapsed]=useState(0),[playing,setPlaying]=useState(!reduced),[ready,setReady]=useState(false);
 const elapsedRef=useRef(0),dialog=useDialogAccessibility(true,onClose),duration=film.duration;
 const onReady=useCallback(()=>setReady(true),[]);
 const seek=useCallback(value=>{elapsedRef.current=value;setElapsed(value);},[]);
 useEffect(()=>{
  if(!playing||!ready)return;
  let request,last=null,lastPaint=0;
  const tick=stamp=>{
   if(last===null||document.hidden){last=stamp;request=requestAnimationFrame(tick);return;}
   const delta=Math.min((stamp-last)/1000,.1);last=stamp;elapsedRef.current=Math.min(duration,elapsedRef.current+delta);
   if(stamp-lastPaint>=1000/24||elapsedRef.current===duration){setElapsed(elapsedRef.current);lastPaint=stamp;}
   if(elapsedRef.current>=duration){setPlaying(false);return;}request=requestAnimationFrame(tick);
  };
  request=requestAnimationFrame(tick);return()=>cancelAnimationFrame(request);
 },[playing,ready,duration]);
 const chapter=filmChapter(film,elapsed);
 const toggle=()=>{if(elapsed>=duration)seek(0);setPlaying(value=>elapsed>=duration?true:!value);};
 return <div className="glossary-lab-backdrop" onClick={onClose}><motion.section ref={dialog} role="dialog" aria-modal="true" aria-label={termData.term} tabIndex={-1} className="glossary-lab dictionary-film" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} onClick={event=>event.stopPropagation()}>
  <header><div><span className="learning-eyebrow">ANIMATED EXPLAINER / {termData.era}</span><h2>{termData.term}</h2><p>{film.definition}</p></div><button aria-label="Close glossary explanation" onClick={onClose}>X</button></header>
  <div className="glossary-lab-viewport"><Suspense fallback={<p className="glossary-scene-fallback" role="status">Preparing this demonstration...</p>}><Scene term={termData.term} time={elapsed} onReady={onReady}/></Suspense></div>
  <div className="dictionary-transport"><button onClick={toggle} disabled={!ready} aria-label={elapsed>=duration?'Replay animation':playing?'Pause animation':'Play animation'}>{!ready?'Preparing...':elapsed>=duration?'Replay':playing?'Pause':'Play'}</button><label><span className="sr-only">Animation timeline</span><input aria-label="Animation timeline" type="range" min="0" max={duration} step="0.05" value={elapsed} onChange={event=>{setPlaying(false);seek(Number(event.target.value));}}/></label><output aria-label="Playback time">{elapsed.toFixed(1)} / {duration}s</output></div>
  <div className="dictionary-chapters" role="group" aria-label="Animation chapters">{film.chapters.map((item,index)=><button key={item.label} aria-pressed={chapter===index} onClick={()=>{setPlaying(false);seek(item.at);}}><small>{String(Math.round(item.at)).padStart(2,'0')}s</small>{item.label}</button>)}</div>
  <div className="glossary-lab-narration" aria-live="polite"><p>{film.chapters[chapter].text}</p></div>
  <footer>Illustrative reconstruction. Timing, cutaways and example data are simplified; multi-lap stories compress race time. Historical and 2026 systems are identified separately. <a href="https://www.formula1.com/en/page/f1-glossary" target="_blank" rel="noreferrer">F1 glossary reference</a></footer>
 </motion.section></div>;
}
