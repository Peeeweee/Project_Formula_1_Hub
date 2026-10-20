import { Sprite, SpriteMaterial, TextureLoader, SRGBColorSpace, Vector3 } from 'three';
import { HELMET_FRAME_BOUNDS } from '../data/helmetFrames.js';
import { helmetViewIndex } from './helmetViewIndex.js';

let viewsPromise;
export function loadHelmetViews() {
  if (!viewsPromise) {
    const loader = new TextureLoader();
    viewsPromise = Promise.allSettled(HELMET_FRAME_BOUNDS.map(async (bounds, index) => {
      const texture = await loader.loadAsync(`${import.meta.env.BASE_URL}helmet-views/helmet-${String(index).padStart(2, '0')}.png`);
      texture.colorSpace = SRGBColorSpace;
      const [left, top, right, bottom] = bounds, width = right - left, height = bottom - top;
      texture.offset.set(left / 256, 1 - bottom / 256); texture.repeat.set(width / 256, height / 256);
      return { texture, width, height, centerX: (128 - left) / width, centerY: (bottom - 128) / height };
    })).then(results => {
      const failure = results.find(result => result.status === 'rejected');
      if (failure) {
        results.forEach(result => { if (result.status === 'fulfilled') result.value.texture.dispose(); });
        viewsPromise = null; throw failure.reason;
      }
      return results.map(result => result.value);
    });
  }
  return viewsPromise;
}

// Licensed rendered views preserve the detailed helmet appearance without
// distributing the original Blendkit mesh. Crew bodies remain live 3D meshes.
export function attachRenderedHelmet(parent, { position = [0, .085, 0], size = .32, fallbacks = [] } = {}) {
  let active = true, sprite;
  const relative = new Vector3();
  loadHelmetViews().then(views => {
    if (!active) return;
    const material = new SpriteMaterial({ map: views[0].texture, transparent: true, alphaTest: .04, depthWrite: true, toneMapped: false });
    sprite = new Sprite(material); sprite.position.set(...position); sprite.frustumCulled = false;
    const referenceHeight = HELMET_FRAME_BOUNDS[0][3] - HELMET_FRAME_BOUNDS[0][1];
    const select = camera => {
      camera.getWorldPosition(relative); parent.worldToLocal(relative); relative.sub(sprite.position);
      const frame = views[helmetViewIndex(relative.x, relative.y, relative.z)];
      material.map = frame.texture;
      sprite.center.set(frame.centerX, frame.centerY);
      sprite.scale.set(size * frame.width / referenceHeight, size * frame.height / referenceHeight, 1);
      sprite.updateMatrixWorld(true);
    };
    sprite.onBeforeRender = (_renderer, _scene, camera) => select(camera);
    sprite.scale.set(size, size, 1); parent.add(sprite);
    fallbacks.forEach(object => { object.visible = false; });
  }).catch(() => {}); // A missing optional view keeps the original helmet visible.
  return () => {
    active = false;
    if (sprite) { parent.remove(sprite); sprite.material.dispose(); }
    fallbacks.forEach(object => { object.visible = true; });
  };
}
