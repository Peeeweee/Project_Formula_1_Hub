import test from 'node:test';
import assert from 'node:assert/strict';
import { introFrame, introCameraPosition, pitStopPose, INTRO_DURATION_MS, INTRO_LAUNCH_MS, INTRO_LOGO_MS, PIT_STOP_DURATION_MS, INTRO_FADE_MS } from '../src/utils/introSequence.js';

const at = time => time * PIT_STOP_DURATION_MS / 8800;

test('pit-stop sequence lifts, changes wheels, clears crew and releases within 10 seconds', () => {
  assert.equal(PIT_STOP_DURATION_MS, 10000);
  assert.equal(introFrame(INTRO_LOGO_MS - 1).phase, 'release');
  assert.equal(introFrame(at(0)).phase, 'arrival');
  assert.equal(introFrame(at(2200)).phase, 'jack');
  assert.equal(introFrame(at(3000)).phase, 'tires');
  assert.equal(introFrame(at(5300)).phase, 'secure');
  assert.equal(introFrame(at(6300)).phase, 'clear');
  assert.equal(introFrame(INTRO_LAUNCH_MS).phase, 'release');
  assert.equal(introFrame(INTRO_DURATION_MS).phase, 'done');
});
test('car stops before wheel service and stays lifted until replacements are fitted', () => {
  assert.equal(pitStopPose(at(2000)).carZ, 0);
  assert.equal(pitStopPose(at(2800)).lift, .16);
  assert.equal(pitStopPose(at(3900)).wheelVisible, false);
  assert.ok(pitStopPose(at(3450)).wheelOffset > .7);
  assert.equal(pitStopPose(at(5000)).wheelOffset, 0);
  assert.equal(pitStopPose(at(5000)).wheelVisible, true);
  assert.equal(pitStopPose(at(6000)).lift, 0);
  assert.equal(pitStopPose(INTRO_LAUNCH_MS).approach, 0);
  assert.equal(pitStopPose(at(6999)).released, false);
  assert.ok(pitStopPose(INTRO_DURATION_MS).carZ < -10);
});
test('camera transitions continuously and reduced motion avoids pit-stop movement', () => {
  for (const boundary of [2000, 4200, 6100]) {
    const before = introCameraPosition(at(boundary) - 1), after = introCameraPosition(at(boundary) + 1);
    assert.ok(before.every((value, axis) => Math.abs(value - after[axis]) < .001));
  }
  assert.equal(introFrame(500, true).phase, 'arrival');
  assert.equal(introFrame(700, true).phase, 'done');
});

test('logo follows the full car departure and stays visible through the final fade', () => {
  assert.equal(introFrame(INTRO_LOGO_MS).phase, 'logo');
  assert.ok(pitStopPose(INTRO_LOGO_MS).carZ <= -17);
  assert.equal(introFrame(INTRO_DURATION_MS - INTRO_FADE_MS).phase, 'logo');
  assert.equal(introFrame(INTRO_DURATION_MS - 1).phase, 'logo');
  assert.equal(introFrame(INTRO_DURATION_MS).phase, 'done');
  assert.equal(introFrame(INTRO_LOGO_MS, true).phase, 'done');
});

test('logo finale holds for five seconds including the smooth final fade', () => {
  assert.equal(INTRO_DURATION_MS - INTRO_LOGO_MS, 5000);
  assert.equal(introFrame(INTRO_LOGO_MS + 4000).phase, 'logo');
});
