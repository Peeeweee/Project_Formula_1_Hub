import { useEffect, useState } from 'react';

// A small, user-triggered demonstration; no WebGL, model download or startup gate.
export default function RaceStartDemo() {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (step < 0 || step > 5) return;
    const timer = setTimeout(() => setStep(value => value + 1), step === 5 ? 500 : 180);
    return () => clearTimeout(timer);
  }, [step]);
  return <div className="race-start-demo"><div className="start-lights" aria-hidden="true">{[0, 1, 2, 3, 4].map(index => <i key={index} className={step >= index && step < 6 ? 'lit' : ''} />)}</div><div><strong>Five lights. Then lights out.</strong><p aria-live="polite">{step === 6 ? 'The race begins. Reacting before lights out risks a penalty.' : 'The lights go out to signal the start. This is a simplified demonstration.'}</p></div><button disabled={step >= 0 && step < 6} onClick={() => setStep(0)}>{step === 6 ? 'Replay' : step >= 0 ? 'Watch the lights…' : 'See the start →'}</button></div>;
}
