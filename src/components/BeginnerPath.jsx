import { useState } from 'react';
import { Link } from 'react-router-dom';
import LearningJourney from './LearningJourney';
import { CHAPTERS } from '../data/learningChapters';
export default function BeginnerPath(){
 const [active,setActive]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem('fdc1_lessons_v2'))||{};const next=CHAPTERS.findIndex(chapter=>saved[chapter.id]!==chapter.correct);return next<0?0:next;}catch{return 0;}});
 const chapter=CHAPTERS[active];
 return <section className="beginner-path" id="learning-path"><div className="beginner-path-heading"><div><p className="experience-kicker">YOUR FIRST LAPS / ABOUT 15–20 MINUTES</p><h2>A clear way into F1.</h2><p>Eight short chapters. One question at a time. Pick up where you left off on this device.</p></div><Link to="/watch">Watching today? Open the race companion →</Link></div><LearningJourney active={active} onSelect={setActive}><p>{chapter.body}</p><Link className="experience-primary" to={chapter.path}>{chapter.action} →</Link></LearningJourney></section>;
}
