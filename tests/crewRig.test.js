import test from 'node:test';
import { Buffer } from 'node:buffer';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { equipCrewSuit, normalizeCrewRig } from '../src/utils/crewSuit.js';

async function loadGeometryOnlyRig() {
  const bytes = await readFile(new URL('../public/pit-crew-suit.glb', import.meta.url));
  const jsonSize = bytes.readUInt32LE(12);
  const doc = JSON.parse(bytes.subarray(20, 20 + jsonSize).toString());
  // The test exercises the shipped skeleton and geometry without a browser's
  // image decoder. Production keeps the original normal texture.
  delete doc.images; delete doc.textures; delete doc.samplers;
  doc.materials.forEach(material => { delete material.normalTexture; });
  let json = Buffer.from(JSON.stringify(doc));
  json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
  const bin = bytes.subarray(28 + jsonSize);
  const header = Buffer.alloc(20); header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + json.length + bin.length, 8); header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(bin.length); binHeader.writeUInt32LE(0x004e4942, 4);
  const result = Buffer.concat([header, json, binHeader, bin]);
  return (await new GLTFLoader().parseAsync(result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength), '')).scene;
}

test('imported centimeter rig normalizes upright without giant or flattened skinned meshes', async () => {
  const scene = await loadGeometryOnlyRig();
  normalizeCrewRig(scene);
  const box = new Box3().setFromObject(scene), size = box.getSize(new Vector3());
  assert.ok(Math.abs(size.y - 1.76) < .001);
  assert.ok(size.x > .5 && size.x < 1.8);
  assert.ok(size.z > .2 && size.z < .7);
  assert.ok(Math.abs(box.min.y) < .001);
});

test('helmet conversion preserves the shared source mesh and keeps a complete human-sized rig', async () => {
  const scene = await loadGeometryOnlyRig();
  normalizeCrewRig(scene);
  let mesh; scene.traverse(object => { if (object.isSkinnedMesh) mesh = object; });
  const original = mesh.geometry, triangleIndices = original.index.count;
  const dispose = equipCrewSuit(scene, 'gunner');
  assert.notEqual(mesh.geometry, original);
  assert.equal(original.index.count, triangleIndices);
  assert.ok(mesh.geometry.index.count > 0);
  assert.ok(mesh.geometry.index.count < triangleIndices);
  assert.ok(scene.getObjectByName('mixamorigHead').children.some(child => child.isGroup));
  scene.updateMatrixWorld(true);
  const size = new Box3().setFromObject(scene).getSize(new Vector3());
  assert.ok(size.y > 1.5 && size.y < 2.2);
  dispose();
});
