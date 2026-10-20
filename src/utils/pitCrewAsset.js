import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let assetPromise;
export function loadHuman() {
  if (!assetPromise) assetPromise = new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}pit-crew-suit.glb`).then(asset => asset.scene).catch(error => { assetPromise = null; throw error; });
  return assetPromise;
}
