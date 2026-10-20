import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshStandardMaterial } from 'three';

let assetPromise;
function prepare(scene) {
  const suit = new MeshStandardMaterial({ color: '#203538', roughness: .85 });
  const helmet = new MeshStandardMaterial({ color: '#152b2e', roughness: .35, metalness: .2 });
  const visor = new MeshStandardMaterial({ color: '#07191d', roughness: .12, metalness: .7 });
  const equipment = new MeshStandardMaterial({ color: '#242b2d', roughness: .42, metalness: .45 });
  scene.traverse(mesh => {
    if (!mesh.isMesh) return;
    const geometry = mesh.geometry, positions = geometry.getAttribute('position'), buckets = [[], [], [], []];
    for (let i = 0; i < geometry.index.count; i += 3) {
      const face = [geometry.index.getX(i), geometry.index.getX(i + 1), geometry.index.getX(i + 2)];
      const x = face.reduce((sum, index) => sum + positions.getX(index), 0) / 3;
      const y = face.reduce((sum, index) => sum + positions.getY(index), 0) / 3;
      const z = face.reduce((sum, index) => sum + positions.getZ(index), 0) / 3;
      const head = y > 1.065 && x < -.08 && z > .12;
      const glass = head && y > 1.14 && y < 1.25 && z > .365;
      const tools = (y > .65 && y < .89 && z > .49) || y < .17;
      buckets[glass ? 2 : head ? 1 : tools ? 3 : 0].push(...face);
    }
    geometry.setIndex(buckets.flat()); geometry.clearGroups();
    let offset = 0;
    buckets.forEach((indices, materialIndex) => { if (indices.length) geometry.addGroup(offset, indices.length, materialIndex); offset += indices.length; });
    mesh.material.dispose(); mesh.material = [suit, helmet, visor, equipment];
    mesh.castShadow = true; mesh.receiveShadow = true;
  });
  return scene;
}
export function loadOpenRcCrew() {
  if (!assetPromise) assetPromise = new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}openrc-pit-crew.glb`).then(asset => prepare(asset.scene)).catch(error => { assetPromise = null; throw error; });
  return assetPromise;
}
