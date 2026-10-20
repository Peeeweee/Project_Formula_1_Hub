import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { helmetViewIndex } from '../src/utils/helmetViewIndex.js';
import { HELMET_FRAME_BOUNDS } from '../src/data/helmetFrames.js';

test('camera-facing helmet views wrap at the back and keep front/back correct at both elevations', () => {
  assert.equal(helmetViewIndex(0, 0, 1), 0);
  assert.equal(helmetViewIndex(1, 0, 0), 2);
  assert.equal(helmetViewIndex(0, 0, -1), 4);
  assert.equal(helmetViewIndex(-1, 0, 0), 6);
  assert.equal(helmetViewIndex(0, 1, 1), 8);
  assert.equal(helmetViewIndex(0, 1, -1), 12);
  assert.equal(helmetViewIndex(.00001, 0, -1), helmetViewIndex(-.00001, 0, -1));
  for (let degrees = -360; degrees <= 360; degrees++) {
    const angle = degrees * Math.PI / 180;
    assert.ok(helmetViewIndex(Math.sin(angle), .3, Math.cos(angle)) < 16);
  }
});

test('every camera view ships as a valid 256px PNG with valid nonempty alpha bounds', async () => {
  assert.equal(HELMET_FRAME_BOUNDS.length, 16);
  for (let i = 0; i < HELMET_FRAME_BOUNDS.length; i++) {
    const png = await readFile(new URL(`../public/helmet-views/helmet-${String(i).padStart(2, '0')}.png`, import.meta.url));
    assert.equal(png.readUInt32BE(0), 0x89504e47);
    assert.equal(png.readUInt32BE(16), 256); assert.equal(png.readUInt32BE(20), 256);
    const [left, top, right, bottom] = HELMET_FRAME_BOUNDS[i];
    assert.ok(left >= 0 && top >= 0 && right <= 256 && bottom <= 256);
    assert.ok(right > left && bottom > top);
  }
});
