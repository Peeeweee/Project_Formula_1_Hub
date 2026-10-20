import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import CrewMember from './HumanPitCrew';
import { CanvasTexture, TextureLoader, SRGBColorSpace, RepeatWrapping, Vector3, TubeGeometry, CatmullRomCurve3, Object3D } from 'three';
import { pitStopPose } from '../../utils/introSequence';

function Asphalt() {
  const [maps, setMaps] = useState({});
  useEffect(() => {
    let active = true;
    const owned = [];
    const loader = new TextureLoader();
    const load = (name, color = false) => loader.loadAsync(`${import.meta.env.BASE_URL}textures/asphalt_02_${name}_1k.jpg`).then(texture => {
      owned.push(texture);
      if (!active) { texture.dispose(); return null; }
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(24, 30);
      texture.anisotropy = 4;
      if (color) texture.colorSpace = SRGBColorSpace;
      return texture;
    });
    Promise.allSettled([load('diff', true), load('nor_gl'), load('rough')]).then(results => {
      if (active) setMaps(Object.fromEntries(['map', 'normalMap', 'roughnessMap'].map((key, i) => [key, results[i].status === 'fulfilled' ? results[i].value : null])));
    });
    return () => { active = false; owned.forEach(texture => texture.dispose()); };
  }, []);
  return <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.025, 0]}><planeGeometry args={[80, 100]} /><meshStandardMaterial {...maps} color={maps.map ? '#ffffff' : '#5a5d60'} normalScale={[.4, .4]} roughness={.96} /></mesh>;
}
function Box({ at, size, color = '#30363f', ...props }) {
  return <mesh position={at} receiveShadow {...props}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={.8} /></mesh>;
}
function Label({ text, at, size = [3, .6], rotation = [0, 0, 0], background = '#121820', color = '#e7eeee' }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 160;
    const context = canvas.getContext('2d'); context.fillStyle = background; context.fillRect(0, 0, 1024, 160);
    context.fillStyle = color; context.font = 'bold 65px Arial'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(text, 512, 80);
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; return map;
  }, [text, background, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={at} rotation={rotation}><planeGeometry args={size} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>;
}
function Hose({ points }) {
  const geometry = useMemo(() => new TubeGeometry(new CatmullRomCurve3(points.map(point => new Vector3(...point))), 20, .025, 5, false), [points]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial color="#14181d" roughness={.8} /></mesh>;
}
function Tire({ at = [0, 0, 0], rotation = [0, 0, Math.PI / 2], scale = 1 }) {
  return <group position={at} rotation={rotation} scale={scale}>
    <mesh><cylinderGeometry args={[.4, .4, .32, 18]} /><meshStandardMaterial color="#111317" roughness={.95} /></mesh>
    <mesh position={[0, .165, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.3, .012, 5, 22]} /><meshStandardMaterial color="#e6cf46" /></mesh>
    <mesh position={[0, .17, 0]}><cylinderGeometry args={[.17, .17, .012, 12]} /><meshStandardMaterial color="#515761" metalness={.65} roughness={.4} /></mesh>
  </group>;
}
function Jack({ rear, started, reducedMotion }) {
  const root = useRef(null), arm = useRef(null), indicator = useRef(null);
  const z = rear ? 3.35 : -3.3;
  useFrame(() => {
    const pose = pitStopPose(reducedMotion || started === null ? 0 : performance.now() - started);
    if (root.current) root.current.position.x = (rear ? -1.8 : 1.8) * (1 - pose.approach);
    if (arm.current) arm.current.rotation.x = (rear ? -1 : 1) * pose.lift * 1.8;
    if (indicator.current) indicator.current.material.color.set(pose.released ? '#47ef91' : '#ed3c37');
  });
  return <group ref={root} position={[0, .05, z]} rotation={[0, rear ? Math.PI : 0, 0]}>
    <Box at={[0, .08, 0]} size={[.8, .1, .28]} color="#42aeb0" />
    <group ref={arm}><Box at={[0, .22, -.45]} size={[.06, .07, 1]} color="#929ba1" rotation={[-.25, 0, 0]} /><Box at={[0, .48, -.8]} size={[.55, .07, .08]} color="#1c232a" /></group>
    {!rear && <group position={[.55, 0, -.4]}><Box at={[0, 1.3, 0]} size={[.035, 2.6, .035]} color="#777e86" /><mesh ref={indicator} position={[0, 2.6, 0]}><boxGeometry args={[.32, .17, .12]} /><meshBasicMaterial color="#ed3c37" /></mesh></group>}
  </group>;
}
function Grandstand() {
  const seats = useRef(null);
  useEffect(() => {
    const dummy = new Object3D(); let index = 0;
    for (let row = 0; row < 5; row++) for (let seat = 0; seat < 28; seat++) {
      dummy.position.set(10 + row * .7, 1.8 + row * .45, -16 + seat * 1.05); dummy.updateMatrix(); seats.current.setMatrixAt(index++, dummy.matrix);
    }
    seats.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <><Box at={[12, .8, -2]} size={[5, 1.3, 36]} color="#434b59" /><instancedMesh ref={seats} args={[null, null, 140]}><boxGeometry args={[.55, .4, .75]} /><meshStandardMaterial color="#6b7b8b" roughness={.9} /></instancedMesh><Box at={[12, 4.8, -2]} size={[6, .12, 36]} color="#343b47" /></>;
}
export default function PitStopEnvironment({ started, reducedMotion }) {
  const wheelStations = [[-1, -1.7], [1, -1.7], [-1, 2.1], [1, 2.1]];
  return <group>
    <Asphalt />
    <Box at={[-.4, -.012, 0]} size={[5, .025, 8]} color="#636767" />
    {[-1.8, 1.8].map(x => <Box key={x} at={[x, .006, 0]} size={[.065, .015, 6.8]} color="#e4c34c" />)}
    {[-3.4, 3.4].map(z => <Box key={z} at={[0, .006, z]} size={[3.6, .015, .065]} color="#e4c34c" />)}
    <Box at={[0, .012, -2.5]} size={[1.9, .018, .09]} color="#e9e9e5" />
    <Box at={[3.8, .007, 0]} size={[.11, .02, 80]} color="#eeeeeb" />
    {Array.from({ length: 14 }, (_, i) => <Box key={i} at={[6.3, .005, i * 4 - 28]} size={[.12, .02, 1.8]} color="#e8d356" />)}
    <Label text="MERCEDES // PIT BOX" at={[0, .017, 3.1]} size={[3.1, .4]} rotation={[-Math.PI / 2, 0, 0]} background="#747b81" color="#f4f4f0" />
    {/* Garage bays and working equipment give the scene an actual pit-lane setting. */}
    <Box at={[-7.1, 2.1, 0]} size={[.3, 4.2, 42]} color="#252e38" />
    {[-12, -6, 0, 6, 12].map(z => <group key={z}><Box at={[-6.9, 1.65, z]} size={[.04, 3.1, 4.5]} color="#111923" /><Box at={[-6.7, 3.6, z]} size={[.7, .6, 5.7]} color="#263d43" /><Label text={z === 0 ? 'MERCEDES-AMG' : 'FORMULA DC-1'} at={[-6.31, 3.6, z]} size={[4.7, .45]} rotation={[0, Math.PI / 2, 0]} /><Box at={[-5.7, .85, z + 1.4]} size={[.85, 1.7, 1.2]} color="#26383e" /><Box at={[-5.2, 1.9, z + 1.4]} size={[.08, .55, .8]} color="#0b1218" /></group>)}
    <Box at={[-5, 4, 0]} size={[5, .15, 6]} color="#27333e" />
    <Box at={[-4.7, 1.8, -.7]} size={[.15, 3.6, .15]} color="#8c979d" />
    <Box at={[-2.5, 3.6, -.7]} size={[4.5, .12, .12]} color="#8c979d" />
    <Hose points={[[-4.7, 3.6, -.7], [-2.3, 3.1, -.9], [-1.8, 1.5, -1.7], [-1.55, .5, -1.7]]} />
    <Hose points={[[0, 3.6, -.7], [1.8, 3, -.7], [1.9, 1.3, -1.7], [1.55, .5, -1.7]]} />
    {[-1, 1].map(side => <group key={side} position={[side * 3.5, 0, 2.6]}><Tire at={[0, .4, 0]} /><Tire at={[0, .4, .9]} /><Box at={[0, .5, 1.8]} size={[.6, 1, .7]} color="#20363b" /></group>)}
    {/* Pit wall, fencing, bridge and grandstands, all real scene geometry. */}
    <Box at={[7.2, .7, 0]} size={[.45, 1.4, 80]} color="#3b4652" />
    {Array.from({ length: 14 }, (_, i) => <Box key={i} at={[7.2, 2.1, i * 4 - 28]} size={[.045, 2.1, .045]} color="#a2a8b0" />)}
    {[1.6, 2.2, 2.8].map(y => <Box key={y} at={[7.2, y, 0]} size={[.025, .025, 80]} color="#76818d" />)}
    <Grandstand /><group position={[0, 0, 28]} rotation={[0, Math.PI / 2, 0]}><Grandstand /></group>
    <Box at={[0, 5.5, -12]} size={[15, .8, 1]} color="#293943" /><Box at={[-6, 2.7, -12]} size={[.3, 5.4, .5]} color="#838c95" /><Box at={[6, 2.7, -12]} size={[.3, 5.4, .5]} color="#838c95" />
    <Label text="GRAND PRIX // PIT LANE" at={[0, 5.5, -11.48]} size={[10, .55]} />
    {wheelStations.map(([side, z]) => <group key={`${side}-${z}`}><CrewMember x={side * 1.85} z={z} role="gunner" facing={side * Math.PI / 2} started={started} reducedMotion={reducedMotion} /><CrewMember x={side * 2.8} z={z + .5} role="carrier" facing={side * Math.PI / 2} started={started} reducedMotion={reducedMotion} /></group>)}
    <CrewMember x={0} z={-4.05} role="jack" facing={Math.PI} started={started} reducedMotion={reducedMotion} /><CrewMember x={0} z={4} role="jack" facing={0} started={started} reducedMotion={reducedMotion} />
    <CrewMember x={2.8} z={-3.2} role="controller" facing={Math.PI / 2} started={started} reducedMotion={reducedMotion} />
    <CrewMember x={-4.8} z={3} role="engineer" facing={-Math.PI / 2} started={started} reducedMotion={reducedMotion} />
    <Jack started={started} reducedMotion={reducedMotion} /><Jack rear started={started} reducedMotion={reducedMotion} />
  </group>;
}
