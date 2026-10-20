import { attachRenderedHelmet } from './renderedHelmet.js';
import { Box3, Group, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry, Vector3 } from 'three';

export function normalizeCrewRig(scene, height = 1.76) {
  // updateMatrixWorld invokes SkinnedMesh's bind-matrix inverse update;
  // updateWorldMatrix alone does not. This matters for imported unit transforms.
  scene.updateMatrixWorld(true);
  scene.traverse(object => { if (object.isSkinnedMesh) object.computeBoundingBox(); });
  const bounds = new Box3().setFromObject(scene), size = bounds.getSize(new Vector3()), center = bounds.getCenter(new Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0) throw new Error('Crew rig has invalid bounds');
  const scale = height / size.y;
  scene.scale.multiplyScalar(scale);
  scene.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  scene.rotation.y = Math.PI;
  scene.updateMatrixWorld(true);
}

// Keep the source rig and cloth detail; replace the exposed head with a fitted
// helmet. Every geometry/material created here belongs to this crew instance.
export function equipCrewSuit(scene, role) {
  const geometries = [], materials = [];
  let disposeRendered;
  scene.traverse(object => {
    if (!object.isSkinnedMesh) return;
    const source = object.geometry, joints = source.getAttribute('skinIndex'), weights = source.getAttribute('skinWeight');
    if (!source.index || !joints || !weights) return;
    const headBones = new Set(object.skeleton.bones.map((bone, i) => /Head/.test(bone.name) ? i : -1));
    const isHead = index => {
      let weight = 0;
      for (let slot = 0; slot < 4; slot++) if (headBones.has(joints.getComponent(index, slot))) weight += weights.getComponent(index, slot);
      return weight > .45;
    };
    const indices = [];
    for (let i = 0; i < source.index.count; i += 3) {
      const triangle = [source.index.getX(i), source.index.getX(i + 1), source.index.getX(i + 2)];
      if (!triangle.some(isHead)) indices.push(...triangle);
    }
    const geometry = source.clone(); geometry.setIndex(indices);
    geometry.clearGroups(); object.geometry = geometry; geometries.push(geometry);
  });
  const head = scene.getObjectByName('mixamorigHead');
  if (head) {
    const helmet = new Group();
    const scale = head.getWorldScale(new Vector3());
    helmet.scale.set(1 / Math.abs(scale.x), 1 / Math.abs(scale.y), 1 / Math.abs(scale.z));
    const shell = new MeshStandardMaterial({ color: role === 'controller' ? '#219b91' : '#25383b', roughness: .34, metalness: .22 });
    const visor = new MeshStandardMaterial({ color: '#10272e', roughness: .13, metalness: .72 });
    const trim = new MeshStandardMaterial({ color: '#65ccc2', roughness: .45, metalness: .2 });
    const rubber = new MeshStandardMaterial({ color: '#111619', roughness: .8 });
    materials.push(shell, visor, trim, rubber);
    const add = (geometry, material, at, size, rotation) => {
      geometries.push(geometry);
      const mesh = new Mesh(geometry, material); mesh.position.set(...at); mesh.scale.set(...size);
      if (rotation) mesh.rotation.set(...rotation);
      mesh.castShadow = true; helmet.add(mesh); return mesh;
    };
    add(new SphereGeometry(1, 32, 24), shell, [0, .085, 0], [.137, .165, .15]);
    add(new SphereGeometry(1, 32, 16, 0, Math.PI, Math.PI * .28, Math.PI * .32), visor, [0, .087, 0], [.141, .17, .156]);
    add(new SphereGeometry(1, 24, 16), shell, [0, .005, .065], [.13, .067, .12]);
    add(new TorusGeometry(1, .026, 6, 48), trim, [0, .12, 0], [.139, .139, .139], [Math.PI / 2, 0, 0]);
    add(new TorusGeometry(1, .07, 6, 32), rubber, [0, -.038, 0], [.095, .095, .095], [Math.PI / 2, 0, 0]);
    head.add(helmet);
    if (typeof window !== 'undefined') disposeRendered = attachRenderedHelmet(helmet, { fallbacks: [...helmet.children] });
  }
  return () => { disposeRendered?.(); geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); };
}
