import { useState } from 'react';
import { CHAPTERS } from '../data/learningChapters';

export default function LearningJourney({ active, onSelect, children }) {
  const [answers, setAnswers] = useState(() => { try { return JSON.parse(localStorage.getItem('fdc1_lessons_v2')) || {}; } catch { return {}; } });
  const chapter = CHAPTERS[active];
  const answer = answers[chapter.id];
  const completed = CHAPTERS.filter(item => answers[item.id] === item.correct).length;
  function choose(index) {
    const next = { ...answers, [chapter.id]: index }; setAnswers(next);
    try { localStorage.setItem('fdc1_lessons_v2', JSON.stringify(next)); } catch { /* Optional local progress. */ }
  }
  return <div className="learn-layout">
    <aside className="learn-rail"><p className="learn-eyebrow">The essentials</p><nav aria-label="Learning chapters">{CHAPTERS.map((item, index) => <button key={item.id} aria-current={index === active ? 'step' : undefined} onClick={() => onSelect(index)}><span className="chapter-number">{answers[item.id] === item.correct ? '✓' : `0${index + 1}`}</span><span>{item.title}</span><span aria-hidden="true">↗</span></button>)}</nav><p className="learn-progress">{completed} of 5 knowledge checks complete<br /><small>Progress saved on this device</small></p></aside>
    <article className="learn-article" id={chapter.id}><header><p className="learn-eyebrow">Chapter 0{active + 1} <span> / {chapter.time}</span></p><h2>{chapter.title}</h2><p className="learn-deck">{chapter.subtitle}</p></header><div className="learn-content">{children}</div>
    <details className="learn-check" key={chapter.id}><summary>Check your understanding <span>Optional · 1 question</span></summary><fieldset><legend>{chapter.question}</legend>{chapter.answers.map((text, index) => <button key={text} onClick={() => choose(index)} aria-pressed={answer === index}>{text}</button>)}</fieldset><p aria-live="polite">{answer !== undefined && <><strong>{answer === chapter.correct ? 'Correct. ' : 'Not quite. '}</strong>{chapter.why}</>}</p></details>
    <footer className="learn-pagination"><button disabled={active === 0} onClick={() => onSelect(active - 1)}>← Previous chapter</button><button disabled={active === CHAPTERS.length - 1} onClick={() => onSelect(active + 1)}>Next chapter →</button></footer></article>
  </div>;
}
