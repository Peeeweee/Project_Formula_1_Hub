import test from 'node:test';
import assert from 'node:assert/strict';
import { summariseDriverResults } from '../src/utils/driverStats.js';
import { simulateStrategy } from '../src/utils/strategySimulation.js';
import { standingsProgression, latestObservationDate } from '../src/utils/raceData.js';
import { normaliseNewsItems } from '../src/utils/newsItems.js';
import { cachedFetch, clearAllCache, getCacheInfo } from '../src/services/cache.js';

test('strategy compares equal plans and accounts for Safety Car pit savings', () => {
  const green = simulateStrategy({ pitLap: 22, compound: 'hard' });
  assert.equal(green.laps.length, 50);
  assert.equal(green.pitLoss, 22);
  assert.equal(simulateStrategy({ pitLap: 22, compound: 'hard' }).total, green.total);
  const safety = simulateStrategy({ pitLap: 22, safetyCarLap: 22 });
  assert.equal(safety.pitLoss, 12);
  assert.equal(simulateStrategy({ pitLap: 25, safetyCarLap: 22 }).pitLoss, 22);
  assert.equal(simulateStrategy({ compound: 'medium' }).legal, false);
});

test('traffic costs only the selected strategy and is not applied during neutralisation', () => {
  const clean = simulateStrategy({ pitLap: 20 });
  const traffic = simulateStrategy({ pitLap: 20, traffic: 1.6 });
  assert.ok(Math.abs(traffic.total - clean.total - 4.8) < 0.000001);
  const scClean = simulateStrategy({ pitLap: 20, safetyCarLap: 21 });
  const scTraffic = simulateStrategy({ pitLap: 20, safetyCarLap: 21, traffic: 1.6 });
  assert.equal(scTraffic.total, scClean.total);
});

test('championship chart retains published Sprint-inclusive totals and missing observations', () => {
  const rows = standingsProgression([
    { round: 1, standings: [{ Driver: { driverId: 'a' }, points: '33' }] },
    { round: 2, standings: null },
    { round: 3, standings: [{ Driver: { driverId: 'a' }, points: '58' }] },
  ], ['a', 'b']);
  assert.deepEqual(rows, [{ round: 'R1', a: 33, b: null }, { round: 'R2', a: null, b: null }, { round: 'R3', a: 58, b: null }]);
});

test('source observation time comes from data, including unsorted records', () => {
  assert.equal(latestObservationDate([{ date: '2026-01-01T10:00:00Z' }, { date: 'invalid' }], [{ date: '2026-01-01T11:00:00Z' }]).toISOString(), '2026-01-01T11:00:00.000Z');
  assert.equal(latestObservationDate([]), null);
});

test('RSS keeps only real linked articles, deduplicates and preserves unknown dates', () => {
  const news = normaliseNewsItems([{ name: 'Publisher', items: [
    { title: '<b>Wing update</b>', link: 'https://example.com/wing', pubDate: '2026-01-01 10:00:00', description: '<p>New wing explained.</p>' },
    { title: 'wing update', link: 'https://example.com/duplicate' },
    { title: 'Unknown date', link: 'https://example.com/unknown', pubDate: 'bad' },
    { title: 'Unsafe link', link: 'javascript:alert(1)' },
    { title: 'Missing link' },
  ] }]);
  assert.equal(news.length, 2);
  assert.equal(news[0].date, '2026-01-01T10:00:00.000Z');
  assert.equal(news[0].category, 'TECHNICAL');
  assert.equal(news[1].date, null);
  assert.equal(news[0].snippet, 'New wing explained.');
  const rfc = normaliseNewsItems([{ name: 'P', items: [{ title: 'Race', link: 'https://example.com/race', pubDate: 'Sun, 18 Oct 2026 10:00:00 GMT' }] }]);
  assert.equal(rfc[0].date, '2026-10-18T10:00:00.000Z');
});

test('cache deduplicates requests, supports refresh, and keeps user preferences', async () => {
  const values = new Map([['fdc1_favorites', 'keep'], ['fdc1_lessons_v1', 'keep']]);
  globalThis.localStorage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key), get length() { return values.size; }, key: index => [...values.keys()][index] };
  let calls = 0;
  const fetcher = async () => ++calls;
  assert.deepEqual(await Promise.all([cachedFetch('example', fetcher, 1), cachedFetch('example', fetcher, 1)]), [1, 1]);
  assert.equal(await cachedFetch('example', fetcher, 1), 1);
  assert.equal(await cachedFetch('example', fetcher, 1, { force: true }), 2);
  assert.equal(getCacheInfo('example').data, 2);
  clearAllCache();
  assert.equal(values.get('fdc1_favorites'), 'keep');
  assert.equal(values.get('fdc1_lessons_v1'), 'keep');
  assert.equal(getCacheInfo('example'), null);
});

test('blocked storage does not block network fetches or cache refresh', async () => {
  globalThis.localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(await cachedFetch('no-storage', async () => 'available', 1), 'available');
  await assert.rejects(cachedFetch('failed', async () => { throw new Error('offline'); }, 1), /offline/);
  assert.equal(await cachedFetch('failed', async () => 'recovered', 1), 'recovered');
  clearAllCache();
  delete globalThis.localStorage;
});


test('driver statistics count real results and never turn an ongoing leader into a champion', () => {
  const stats = summariseDriverResults([
    { season: '2025', Results: [{ position: '1', grid: '1', status: 'Finished', FastestLap: { rank: '1' } }] },
    { season: '2025', Results: [{ position: '3', grid: '4', status: '+1 Lap' }] },
    { season: '2026', Results: [{ position: '15', grid: '5', status: 'Engine' }] },
    { season: '2026', Results: [{ position: '20', grid: '0', status: 'Did not start' }] },
  ], [
    { season: '2025', DriverStandings: [{ position: '1' }] },
    { season: '2026', DriverStandings: [{ position: '1' }] },
  ], 2026);
  assert.equal(stats.wins, 1);
  assert.equal(stats.podiums, 2);
  assert.equal(stats.poles, 1);
  assert.equal(stats.races, 3);
  assert.equal(stats.championships, 1);
  assert.equal(stats.fastestLaps, 1);
  assert.equal(stats.reliability, '66.7');
});
