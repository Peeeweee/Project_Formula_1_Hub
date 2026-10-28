import titles from '../data/constructorChampions.json' with { type: 'json' };
export function titleYears(id) {
 const aliases = { team_lotus: 'lotus', redbull: 'red_bull', alfa_romeo: 'alfa' };
 return titles.filter(row => row.ConstructorStandings[0].Constructor.constructorId === (aliases[id] || id)).map(row => row.season);
}
export function seasonRange(currentYear = new Date().getFullYear()) {
 return Array.from({ length: currentYear - 1948 }, (_, i) => currentYear + 1 - i);
}
