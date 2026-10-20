import { memo, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3, MeshStandardMaterial, SRGBColorSpace, ACESFilmicToneMapping, PMREMGenerator, PCFSoftShadowMap } from 'three';
import { introCameraPosition, pitStopPose } from '../../utils/introSequence';

import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import PitStopEnvironment from './PitStopEnvironment';
import { loadHuman } from '../../utils/pitCrewAsset';
import { loadOpenRcCrew } from '../../utils/openRcCrewAsset';
import { loadHelmetViews } from '../../utils/renderedHelmet';

const MODEL_URL = `${import.meta.env.BASE_URL}mercedes-intro.glb`;

function release(scene) {
  const textures = new Set();
  const materials = new Set();
  scene.traverse(object => {
    object.geometry?.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  textures.forEach(texture => texture.dispose());
  materials.forEach(material => material.dispose());
}

async function loadModel(signal, onProgress) {
  const response = await fetch(MODEL_URL, { signal });
  if (!response.ok) throw new Error('Mercedes model unavailable');
  const total = Number(response.headers.get('content-length'));
  let buffer;
  if (response.body && total > 0) {
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); loaded += value.byteLength;
      onProgress(Math.min(100, Math.round(loaded / total * 100)));
    }
    const bytes = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    buffer = bytes.buffer;
  } else { buffer = await response.arrayBuffer(); }
  signal.throwIfAborted();
  onProgress(100);
  const gltf = await new GLTFLoader().parseAsync(buffer, '');
  if (signal.aborted) { release(gltf.scene); signal.throwIfAborted(); }
  return gltf.scene;
}

// Imperative animation of Three.js objects owned by this scene, not React state.
function animateWheels(parts, pose, scale) {
  for (const wheel of parts) {
    wheel.object.position.setX(wheel.x + wheel.side * pose.wheelOffset / scale);
    wheel.object.visible = pose.wheelVisible;
  }
}

function Car({ started, reducedMotion, onReady, onProgress, onFailure }) {
  const [scene, setScene] = useState(null);
  const group = useRef(null);
  const frames = useRef(0);
  const wheels = useRef([]);
  const modelScale = useRef(1);
  useEffect(() => {
    const controller = new AbortController();
    let ownedScene;
    Promise.all([loadModel(controller.signal, onProgress).then(model => { ownedScene = model; return model; }), loadHuman(), loadOpenRcCrew(), loadHelmetViews().catch(() => null)]).then(([model]) => {
      if (controller.signal.aborted) { release(model); return; }
      ownedScene = model;
      // Standard shading avoids costly transmission/clearcoat render passes.
      const replacements = new Map();
      model.traverse(object => {
        if (!object.isMesh) return;
        const simplify = material => {
          if (replacements.has(material)) return replacements.get(material);
          const result = new MeshStandardMaterial({ color: material.color, map: material.map, normalMap: material.normalMap, roughnessMap: material.roughnessMap, metalnessMap: material.metalnessMap, roughness: Math.max(.3, material.roughness ?? .5), metalness: Math.min(.65, material.metalness ?? .4), transparent: material.transparent, opacity: material.opacity, side: material.side, alphaTest: material.alphaTest });
          replacements.set(material, result);
          return result;
        };
        object.material = Array.isArray(object.material) ? object.material.map(simplify) : simplify(object.material);
        object.castShadow = true; object.receiveShadow = true;
      });
      replacements.forEach((replacement, original) => original.dispose());
      const bounds = new Box3().setFromObject(model);
      const size = bounds.getSize(new Vector3());
      const center = bounds.getCenter(new Vector3());
      const scale = 5.8 / Math.max(size.x, size.y, size.z);
      model.scale.multiplyScalar(scale);
      modelScale.current = scale;
      model.traverse(object => { if (/^(FrontTyre|RearTyre)(\.\d+)?$/.test(object.name)) wheels.current.push({ object, x: object.position.x, side: Math.sign(object.position.x) }); });
      model.position.set(-center.x * scale, -bounds.min.y * scale + .04, -center.z * scale);
      setScene(model);
    }).catch(error => { if (error.name !== 'AbortError') { console.warn('Mercedes intro could not load:', error); onFailure(); } });
    return () => { controller.abort(); if (ownedScene) release(ownedScene); };
  }, [onProgress, onFailure]);
  useFrame(({ camera }) => {
    if (!scene || !group.current) return;
    if (frames.current < 2) { frames.current += 1; if (frames.current === 2) onReady(); }
    if (started === null || reducedMotion) return;
    const elapsed = performance.now() - started;
    const [x, y, z] = introCameraPosition(elapsed);
    const fit = Math.min(1.8, Math.max(1, .85 / camera.aspect));
    camera.position.set(x * fit, y * fit, z * fit);
    camera.lookAt(-.5, .65, .1);
    const pose = pitStopPose(elapsed);
    group.current.position.set(0, pose.lift, pose.carZ);
    animateWheels(wheels.current, pose, modelScale.current);
    // Absolute elapsed time means a dropped frame never extends the intro.
  });
  return scene ? <group ref={group}><primitive object={scene} dispose={null} /></group> : null;
}

function setEnvironment(scene, texture) { scene.environment = texture; scene.environmentIntensity = .45; }

function Reflections() {
  const { gl, scene } = useThree();
  useEffect(() => {
    let active = true;
    const generator = new PMREMGenerator(gl), room = new RoomEnvironment();
    let environment = generator.fromScene(room, .04);
    setEnvironment(scene, environment.texture);
    room.dispose();
    // A local 1K CC0 panorama supplies real outdoor reflections; the room is
    // an immediate fallback, so a missing optional lighting file cannot block entry.
    new HDRLoader().load(`${import.meta.env.BASE_URL}environments/urban_courtyard_1k.hdr`, texture => {
      if (!active) { texture.dispose(); return; }
      const outdoor = generator.fromEquirectangular(texture);
      texture.dispose();
      setEnvironment(scene, outdoor.texture);
      environment.dispose(); environment = outdoor;
    }, undefined, () => {});
    return () => { active = false; setEnvironment(scene, null); environment.dispose(); generator.dispose(); };
  }, [gl, scene]);
  return null;
}

function MercedesIntroScene(props) {
  return <div className="intro-canvas" aria-hidden="true"><Canvas frameloop={props.paused ? 'never' : 'always'} shadows={PCFSoftShadowMap} camera={{ position: [8.8, 5.5, -9.8], fov: 46, near: .1, far: 110 }} dpr={[1, 1.15]} gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }} fallback={<span>3D is unavailable on this device. Use Skip intro to continue.</span>} onCreated={({ gl, camera }) => { gl.outputColorSpace = SRGBColorSpace; gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1.1; const fit = Math.min(1.8, Math.max(1, .85 / camera.aspect)); camera.position.multiplyScalar(fit); camera.lookAt(-.5, .65, .1); }}>
    <color attach="background" args={['#333f50']} /><fog attach="fog" args={['#333f50', 24, 70]} />
    <hemisphereLight args={['#d7e7ff', '#32313b', 1.3]} /><directionalLight castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-camera-near={1} shadow-camera-far={30} shadow-bias={-.0003} shadow-normalBias={.025} position={[4, 10, -5]} intensity={3.5} color="#fff4e7" /><directionalLight position={[-5, 4, 4]} intensity={1.2} color="#b5cde3" />
    <Reflections />
    <PitStopEnvironment started={props.started} reducedMotion={props.reducedMotion} />
    <Car {...props} />
  </Canvas></div>;
}
export default memo(MercedesIntroScene);
