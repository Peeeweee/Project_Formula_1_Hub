import { AnimatePresence, motion } from 'framer-motion';
import { PIT_INSIGHTS, STRATEGY_EXAMPLE, strategyProjection } from '../../data/pitWallInsights';

const projection = strategyProjection();
const breakEven = projection.find(point => point.net >= 0).lap;
const curve = projection.map(point => `${12 + point.lap * 15},${88 - point.saving * 1.8}`).join(' ');
const transition = { duration: .22, ease: [.22, 1, .36, 1] };

export default function PitWallConsole({ beatIndex, loading, showingLogo, stopTime, reducedMotion }) {
  const insight = PIT_INSIGHTS[beatIndex];
  const tireService = beatIndex === 2;
  const fresh = beatIndex >= 3;
  return <motion.aside initial={reducedMotion ? false : { opacity: 0, x: 20 }} animate={{ opacity: showingLogo ? 0 : 1, x: 0 }} transition={{ duration: reducedMotion ? .1 : .4 }} className="intro-insight pit-console pit-data-console" aria-label="Pit-stop system display">
    <div className="pit-data-heading"><span>PIT WALL / ENGINEERING</span><span className="pit-demo-badge">SIMULATION</span></div>
    <div className="pit-car-identity"><div><small>2022 / MERCEDES-AMG</small><strong>W13 <span>E PERFORMANCE</span></strong></div><span>18 inch<small>WHEELS</small></span></div>
    <div className="pit-data-status"><span><i />{loading ? 'PREPARING PIT BOX' : insight.status}</span><strong>{stopTime.toFixed(1)}<small>s stopped</small></strong></div>
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={insight.tab} className="pit-insight-page" initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }} transition={reducedMotion ? { duration: 0 } : transition}>
        <div className="pit-page-label"><span>{insight.tab}</span><span>0{beatIndex + 1} / 06</span></div>
        <h2>{insight.title}</h2><p className="pit-data-description">{insight.text}</p>
        {beatIndex > 0 && beatIndex < 4 && <div className="pit-mechanism"><span>CREW / MECHANICS</span><p>{insight.mechanism}</p><div><span>JACKS <b>{loading ? 'WAIT' : insight.jack}</b></span><span>WHEELS <b>{loading ? 'WAIT' : insight.wheels}</b></span></div></div>}
        {beatIndex >= 4 ? <div className="pit-strategy-plot"><div><span>EXAMPLE / TIME RECOVERED</span><b>{breakEven} laps to repay stop</b></div><svg viewBox="0 0 252 110" role="img" aria-label={`Illustrative tire strategy: cumulative fresh-tire gain repays a ${STRATEGY_EXAMPLE.pitLoss}-second pit loss after ${breakEven} laps.`}><path d="M12 16V88H240" stroke="#465065" fill="none" /><path d={`M12 ${88 - STRATEGY_EXAMPLE.pitLoss * 1.8}H240`} stroke="#c5a66b" strokeDasharray="4 4" /><motion.polyline points={curve} fill="none" stroke="#73dbc4" strokeWidth="2" initial={{ pathLength: reducedMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reducedMotion ? 0 : .7 }} /><text x="14" y="104">0</text><text x="208" y="104">15 laps</text><text x="14" y="45">20s pit loss</text></svg><p>92s used vs 90s fresh initially; +0.12s vs +0.06s per lap degradation. Example inputs, not a W13 prediction.</p></div> : beatIndex === 0 ? <div className="pit-sensor-channels"><span>ILLUSTRATIVE CHANNEL LEVELS</span>{['THROTTLE', 'BRAKE', 'POWER DEMAND'].map((name, index) => <div key={name}><span>{name}</span><div><motion.i animate={{ scaleX: loading ? 0 : insight.channels[index] / 100 }} transition={{ duration: reducedMotion ? 0 : .65 }} /></div><b>{loading ? '--' : `${insight.channels[index]}%`}</b></div>)}</div> : null}
        <div className="pit-analysis-note"><span>{insight.analysis}</span><p>{insight.detail}</p></div>
      </motion.div>
    </AnimatePresence>
    <div className="pit-tire-readout"><div><span>MEDIUM SLICK / EXAMPLE</span><strong>{fresh ? 'FRESH SET FITTED' : tireService ? 'USED TO FRESH' : 'USED SET ON CAR'}</strong></div><div className="pit-corner-grid">{['FL', 'FR', 'RL', 'RR'].map(wheel => <div key={wheel}><span>{wheel}</span><motion.i animate={{ borderColor: fresh ? '#73dbc4' : tireService ? '#f1be62' : '#77869b', rotate: tireService && !reducedMotion ? 180 : 0 }} transition={{ duration: reducedMotion ? 0 : .7 }} /><small>{fresh ? 'SECURE' : tireService ? 'SERVICE' : 'FITTED'}</small></div>)}</div></div>
    <p className="pit-data-footnote">Illustrative data / no live telemetry. <a href="https://www.mercedesamgf1.com/news/introducing-w13-the-mercedes-amg-petronas-f1-teams-challenger-for-2022" target="_blank" rel="noreferrer">Car source</a></p>
  </motion.aside>;
}
