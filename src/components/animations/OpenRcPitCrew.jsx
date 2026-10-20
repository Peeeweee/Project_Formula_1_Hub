import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { loadOpenRcCrew } from '../../utils/openRcCrewAsset';
import { attachRenderedHelmet } from '../../utils/renderedHelmet';
import { pitStopPose } from '../../utils/introSequence';

export default function OpenRcPitCrew({ x, z, facing, started, reducedMotion }) {
  const [scene, setScene] = useState(null);
  const root = useRef(null), service = useRef(null);
  useEffect(() => {
    let active = true, disposeHelmet;
    const ownedMaterials = [];
    // Geometry and materials are immutable after loading and shared by four
    // instances. Only their transforms animate; the STL has no skeletal rig.
    loadOpenRcCrew().then(source => {
      if (!active) return;
      const instance = source.clone(true), fallbacks = [];
      instance.traverse(mesh => {
        if (!mesh.isMesh) return;
        mesh.material = [...mesh.material];
        for (const index of [1, 2]) {
          mesh.material[index] = mesh.material[index].clone();
          ownedMaterials.push(mesh.material[index]); fallbacks.push(mesh.material[index]);
        }
      });
      disposeHelmet = attachRenderedHelmet(instance, { position: [-.22, 1.205, .31], size: .30, fallbacks });
      setScene(instance);
    }).catch(error => console.warn('OpenRC crew unavailable:', error));
    return () => { active = false; disposeHelmet?.(); ownedMaterials.forEach(material => material.dispose()); };
  }, []);
  useFrame(() => {
    if (!root.current || !service.current) return;
    const time = reducedMotion || started === null ? 0 : performance.now() - started;
    const pose = pitStopPose(time), side = Math.sign(x);
    root.current.position.x = x + side * ((1 - pose.approach) * .55 - pose.approach * .18 + pose.wheelOffset * .55);
    // Small service motions preserve the downloaded model's natural kneeling
    // pose, with no stretched limbs or claim of full skeletal animation.
    service.current.rotation.x = pose.servicing && !reducedMotion ? Math.sin(time * .025) * .008 : 0;
    service.current.rotation.z = -.035 * pose.approach;
  });
  return <group ref={root} position={[x, 0, z + Math.sign(x) * .2]} rotation={[0, facing, 0]}>
    <group ref={service} rotation={[0, Math.PI, 0]} scale={.85}>{scene && <primitive object={scene} dispose={null} />}</group>
  </group>;
}
