// Deliberately simple teaching model. Seconds per lap are assumptions, not telemetry.
export const COMPOUNDS = {
  soft: { label: 'Soft', pace: -0.7, degradation: 0.13, color: '#ef4444' },
  medium: { label: 'Medium', pace: 0, degradation: 0.065, color: '#fbbf24' },
  hard: { label: 'Hard', pace: 0.45, degradation: 0.035, color: '#ffffff' },
};

export function simulateStrategy({ pitLap = 22, compound = 'hard', traffic = 0, safetyCarLap = 0 } = {}) {
  const stop = Math.min(49, Math.max(5, Number(pitLap)));
  const nextTire = COMPOUNDS[compound] || COMPOUNDS.hard;
  const safetyStop = safetyCarLap > 0 && stop >= safetyCarLap && stop <= safetyCarLap + 2;
  const pitLoss = safetyStop ? 12 : 22;
  let total = 0;
  const laps = Array.from({ length: 50 }, (_, index) => {
    const lap = index + 1;
    const afterStop = lap > stop;
    const tire = afterStop ? nextTire : COMPOUNDS.medium;
    const age = afterStop ? lap - stop - 1 : lap - 1;
    // The same neutralisation applies to both strategies; only pit-loss savings differ.
    const underSafetyCar = safetyCarLap > 0 && lap >= safetyCarLap && lap <= safetyCarLap + 2;
    const pace = underSafetyCar ? 120 : 90 + tire.pace + tire.degradation * age - 0.025 * index;
    const delay = !underSafetyCar && afterStop && lap <= stop + 3 ? Number(traffic) : 0;
    const seconds = pace + delay + (lap === stop ? pitLoss : 0);
    total += seconds;
    return { lap, seconds: Number(seconds.toFixed(2)) };
  });
  return { laps, total, pitLoss, legal: compound !== 'medium' };
}
