import test from 'node:test';
import assert from 'node:assert/strict';
import { strategyProjection, STRATEGY_EXAMPLE, PIT_INSIGHTS } from '../src/data/pitWallInsights.js';

test('example strategy counts pit loss and cumulative tire degradation before claiming a gain', () => {
  const points = strategyProjection();
  assert.equal(points[0].net, -STRATEGY_EXAMPLE.pitLoss);
  assert.equal(points[1].saving, 2);
  assert.ok(points[8].net < 0);
  assert.equal(points.find(point => point.net >= 0).lap, 9);
  const noAdvantage = strategyProjection({ ...STRATEGY_EXAMPLE, oldLap: 90, oldDegradation: .06 });
  assert.ok(noAdvantage.every(point => point.net === -20));
});
test('phase panels describe safe wheel service with bounded illustrative channels', () => {
  assert.equal(PIT_INSIGHTS.length, 6);
  assert.equal(PIT_INSIGHTS[2].jack, 'UP');
  assert.equal(PIT_INSIGHTS[3].wheels, 'SECURE');
  assert.equal(PIT_INSIGHTS[4].jack, 'DOWN');
  assert.equal(PIT_INSIGHTS[5].status, 'RELEASED');
  assert.ok(PIT_INSIGHTS.every(item => item.channels.every(value => value >= 0 && value <= 100)));
});
