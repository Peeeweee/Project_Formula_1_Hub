export function summariseDriverResults(races, standings, currentYear = new Date().getFullYear()) {
  const entries = races.flatMap(race => race.Results || []);
  const starts = entries.filter(result => !/did not start|did not qualify|did not prequalify|withdrew|withdrawn|excluded/i.test(result.status || ''));
  const wins = entries.filter(result => Number(result.position) === 1).length;
  const podiums = entries.filter(result => Number(result.position) >= 1 && Number(result.position) <= 3).length;
  const finishes = starts.filter(result => result.status === 'Finished' || /^\+\d+ Laps?$/.test(result.status || '')).length;
  return {
    wins, podiums, poles: starts.filter(result => Number(result.grid) === 1).length,
    races: starts.length, winRate: starts.length ? (wins / starts.length * 100).toFixed(1) : '0.0',
    fastestLaps: entries.filter(result => result.FastestLap?.rank === '1').length,
    reliability: starts.length ? (finishes / starts.length * 100).toFixed(1) : '0.0',
    championships: standings.filter(row => Number(row.season) < currentYear && row.DriverStandings?.[0]?.position === '1').length,
    longevity: new Set(races.map(race => race.season)).size,
  };
}
