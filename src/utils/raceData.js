export function standingsProgression(rounds, driverIds) {
  return rounds.map(({ round, standings }) => {
    const point = { round: `R${round}` };
    for (const id of driverIds) {
      const driver = standings?.find(row => row.Driver?.driverId === id);
      point[id] = driver ? Number(driver.points) : null;
    }
    return point;
  });
}

export function latestObservationDate(...groups) {
  const dates = groups.flat().map(item => Date.parse(item.date)).filter(Number.isFinite);
  return dates.length ? new Date(dates.reduce((latest, date) => Math.max(latest, date), 0)) : null;
}
