import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useDialogAccessibility from '../hooks/useDialogAccessibility';
import { introFrame, INTRO_DURATION_MS, INTRO_FADE_MS, INTRO_LAUNCH_MS, INTRO_LOGO_MS, PIT_STOP_DURATION_MS } from '../utils/introSequence';
import PitWallConsole from './animations/PitWallConsole';
import logo from '../assets/f1_logo.svg';
const LogoReveal = lazy(() => import('./animations/IntroLogoReveal'));
const MercedesScene = lazy(() => import('./animations/MercedesIntroScene'));

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const BEATS = [
  { phase: 'arrival', label: 'Box entry', tag: '01 / APPROACH', title: 'Hit the marks.', text: 'The driver stops on the pit-box marks so the crew can reach all four wheels.', command: 'box_entry', detail: 'Car positioning' },
  { phase: 'jack', label: 'Jacks up', tag: '02 / LIFT', title: 'Lift. Stabilize. Service.', text: 'Front and rear jack operators lift the car, letting the tire crews begin work.', command: 'jacks_up', detail: 'Front + rear lift' },
  { phase: 'tires', label: 'Tire change', tag: '03 / WHEEL SERVICE', title: 'Four corners. One crew.', text: 'Wheel-gun operators release the nuts while carriers remove the old tires and bring in replacements.', command: 'wheel_service', detail: 'Remove → replace' },
  { phase: 'secure', label: 'Wheels secure', tag: '04 / CONFIRM', title: 'Secure every wheel.', text: 'Wheel nuts must be secured before the car is lowered. This animation simplifies the crew choreography.', command: 'wheels_secure', detail: 'Fit + secure' },
  { phase: 'clear', label: 'Crew clear', tag: '05 / SAFETY CHECK', title: 'Clear the car.', text: 'The jacks drop and personnel move clear. The release controller checks the pit lane for traffic.', command: 'crew_clear', detail: 'Lower + clear' },
  { phase: 'release', label: 'Release', tag: '06 / GO', title: 'Back into the race.', text: 'The release light turns green and the driver accelerates away. A real release also depends on approaching traffic.', command: 'release', detail: 'Lane clear → go' },
];

export default function IntroScreen({ onComplete }) {
  const [started, setStarted] = useState(null);
  const [frame, setFrame] = useState({ lights: 0, phase: 'loading' });
  const [stopTime, setStopTime] = useState(0);
  const [progress, setProgress] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const exiting = useRef(false);
  const completed = useRef(false);
  const completeRef = useRef(onComplete);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);
  const finish = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    setLeaving(true);
  }, []);
  const dialogRef = useDialogAccessibility(true, finish, true);
  const ready = useCallback(() => {
    setStarted(performance.now());
  }, []);
  const reportProgress = useCallback(value => setProgress(value), []);
  const complete = useCallback(() => {
    if (!exiting.current || completed.current) return;
    completed.current = true;
    completeRef.current();
  }, []);
  useEffect(() => {
    // Bound loading time separately so it never cuts off the longer animation.
    if (started !== null) return;
    const timeout = setTimeout(finish, 10000);
    return () => clearTimeout(timeout);
  }, [finish, started]);
  useEffect(() => {
    if (started === null) return;
    const timer = setInterval(() => {
      const elapsed = performance.now() - started;
      const next = introFrame(elapsed, reducedMotion);
      setStopTime(Math.floor(Math.max(0, Math.min(elapsed, INTRO_LAUNCH_MS) - 2000 * PIT_STOP_DURATION_MS / 8800) / 100) / 10);
      if (exiting.current) return;
      setFrame(previous => previous.lights === next.lights && previous.phase === next.phase ? previous : next);
      if (reducedMotion ? next.phase === 'done' : elapsed >= INTRO_DURATION_MS - INTRO_FADE_MS) finish();
    }, 50);
    return () => clearInterval(timer);
  }, [started, reducedMotion, finish]);
  const showingLogo = frame.phase === 'logo';
  const beatIndex = showingLogo ? BEATS.length - 1 : Math.max(0, BEATS.findIndex(beat => beat.phase === frame.phase));
  const beat = BEATS[beatIndex];
  return <motion.section initial={false} animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: reducedMotion ? .1 : INTRO_FADE_MS / 1000, ease: [0.4, 0, 0.2, 1] }} onAnimationComplete={complete} ref={dialogRef} role="dialog" aria-modal="true" aria-label="Mercedes pit-stop animation" tabIndex={-1} className={`mercedes-intro pit-intro ${leaving ? 'is-leaving' : ''} ${showingLogo ? 'is-logo-reveal' : ''} phase-${frame.phase}`}>
    <motion.header initial={reducedMotion ? false : { opacity: 0, y: -12 }} animate={{ opacity: showingLogo ? 0 : 1, y: 0 }} transition={{ duration: .35 }} className="intro-header">
      <div className="intro-brand"><img src={logo} alt="Formula 1" /><span>FORMULA <strong>DC-1</strong></span></div>
      <div className="intro-edition"><i aria-hidden="true" />MERCEDES PIT GARAGE<span>3D / ILLUSTRATIVE SEQUENCE</span></div>
    </motion.header>
    <div className="intro-teal-halo" aria-hidden="true" />
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: started === null ? 0 : 1 }} transition={{ duration: reducedMotion ? .1 : 1, ease: [0.22, 1, 0.36, 1] }} style={{ position: 'absolute', inset: 0 }}><SceneBoundary onFailure={finish}><Suspense fallback={null}><MercedesScene paused={showingLogo} started={started} reducedMotion={reducedMotion} onReady={ready} onProgress={reportProgress} onFailure={finish} /></Suspense></SceneBoundary></motion.div>
    <div className="intro-phase-title" aria-hidden="true"><span>GRAND PRIX / PIT LANE</span><AnimatePresence mode="wait" initial={false}><motion.p key={beat.phase} initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }} transition={{ duration: reducedMotion ? 0 : .16 }}>{["BOX, BOX", "JACKS UP", "TIRE CHANGE", "WHEELS SECURE", "CREW CLEAR", "RELEASE"][beatIndex]}</motion.p></AnimatePresence><small>0{beatIndex + 1}<i />06</small></div>
    <div className="intro-stage-number" aria-hidden="true">0{beatIndex + 1}</div>
    <div className="intro-scene-frame" aria-hidden="true"><span /><span /><span /><span /></div>
    <ol className="intro-sequence" aria-label="Opening sequence">
      {BEATS.map((item, index) => <li key={item.phase} aria-current={started !== null && beatIndex === index ? 'step' : undefined} className={beatIndex > index ? 'complete' : ''}><span>0{index + 1}</span><div>{item.label}<i /></div></li>)}
    </ol>
    <PitWallConsole beatIndex={beatIndex} loading={started === null} showingLogo={showingLogo} stopTime={stopTime} reducedMotion={reducedMotion} />
    <footer className="intro-bottom">
      <div className="intro-model-label"><h1>W13</h1><div><span>MERCEDES-AMG</span><p>MERCEDES PIT STOP</p></div></div>
      <div className="intro-start-control">
<div className={`pit-release-signal ${frame.phase === "release" ? "released" : ""}`} aria-hidden="true"><i /><span>{frame.phase === "release" ? "RELEASE" : "HOLD"}</span></div>
        <div className="intro-status" role="status">{started === null ? <><span>{progress === 100 ? 'Preparing graphics' : 'Loading Mercedes'}</span>{progress !== null && progress < 100 && <small>{progress}%</small>}</> : <span>{started !== null ? beat.label.toUpperCase() : 'PREPARING PIT BOX'}</span>}</div>
      </div>
      <a className="pit-asset-credit" href={`${import.meta.env.BASE_URL}pit-crew-base-attribution.txt`} target="_blank" rel="noreferrer">Crew asset credits ↗</a>
      <motion.button whileHover={reducedMotion ? undefined : { x: 3 }} whileTap={reducedMotion ? undefined : { scale: .97 }} className="intro-skip" onClick={finish} aria-label="Skip intro"><span>Skip intro</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg><kbd>esc</kbd></motion.button>
    </footer>
    {started !== null && !reducedMotion && <SceneBoundary onFailure={finish}><Suspense fallback={null}><LogoReveal active={showingLogo} started={started + INTRO_LOGO_MS} reducedMotion={reducedMotion} /></Suspense></SceneBoundary>}
  </motion.section>;
}
