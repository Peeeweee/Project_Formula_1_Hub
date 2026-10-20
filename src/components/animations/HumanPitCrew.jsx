import { useEffect, useRef, useState } from 'react';
import OpenRcPitCrew from './OpenRcPitCrew';
import { useFrame } from '@react-three/fiber';
import { loadHuman } from '../../utils/pitCrewAsset';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { Quaternion, Vector3 } from 'three';
import { equipCrewSuit, normalizeCrewRig } from '../../utils/crewSuit';
import { pitStopPose } from '../../utils/introSequence';

// Two-bone IK positions elbows/knees anatomically rather than rotating block limbs.
const a = new Vector3(), b = new Vector3(), c = new Vector3(), direction = new Vector3(), bend = new Vector3(), knee = new Vector3();
const q = new Quaternion(), parentQ = new Quaternion(), worldQ = new Quaternion();
const origin = new Vector3();
function aim(bone, child, target) {
  bone.getWorldPosition(a); child.getWorldPosition(b);
  q.setFromUnitVectors(b.sub(a).normalize(), c.copy(target).sub(a).normalize());
  bone.getWorldQuaternion(worldQ); worldQ.premultiply(q);
  bone.parent.getWorldQuaternion(parentQ); bone.quaternion.copy(parentQ.invert().multiply(worldQ));
  bone.updateWorldMatrix(false, true);
}
function solve(upper, lower, end, target, pole, lengths) {
  upper.getWorldPosition(a);
  origin.copy(a);
  direction.copy(target).sub(origin);
  const distance = Math.max(.001, Math.min(direction.length(), lengths[0] + lengths[1] - .001)); direction.normalize();
  bend.copy(pole).sub(origin);
  bend.addScaledVector(direction, -bend.dot(direction)).normalize();
  const cosine = Math.max(-1, Math.min(1, (lengths[0] ** 2 + distance ** 2 - lengths[1] ** 2) / (2 * lengths[0] * distance)));
  knee.copy(origin).addScaledVector(direction, lengths[0] * cosine).addScaledVector(bend, lengths[0] * Math.sqrt(1 - cosine * cosine));
  aim(upper, lower, knee); aim(lower, end, target);
}
function chain(scene, names) {
  const bones = names.map(name => scene.getObjectByName(name));
  if (bones.some(bone => !bone)) return null;
  const positions = bones.map(bone => bone.getWorldPosition(new Vector3()));
  return { bones, lengths: [positions[0].distanceTo(positions[1]), positions[1].distanceTo(positions[2])] };
}

export default function HumanPitCrew(props) {
  return props.role === 'gunner' ? <OpenRcPitCrew {...props} /> : <GenericPitCrew {...props} />;
}

function GenericPitCrew({ x, z, role, facing, started, reducedMotion }) {
  const root = useRef(null), body = useRef(null), tire = useRef(null);
  const [rig, setRig] = useState(null);
  useEffect(() => {
    let active = true, owned, disposeSuit;
    const ownedMaterials = [];
    loadHuman().then(source => {
      if (!active) return;
      owned = clone(source);
      owned.traverse(object => {
        if (!object.isSkinnedMesh) return;
        // Preserve the GLTF bind pose: skeleton.pose() ignores the imported
        // non-bone parent transform on this centimeter-based Mixamo rig.
        const material = object.material.clone();
        if (object.name.toLowerCase().includes('visor')) { material.color.set('#1b242d'); material.map = null; material.roughness = .17; material.metalness = .55; }
        else { material.map = null; material.color.set(role === 'controller' ? '#168d86' : '#182429'); material.roughness = .85; material.metalness = .05; }
        object.material = material; ownedMaterials.push(material);
        object.castShadow = true; object.receiveShadow = true;
        object.boundingBox = null;
      });
      normalizeCrewRig(owned);
      disposeSuit = equipCrewSuit(owned, role);
      const legs = [chain(owned, ['mixamorigRightUpLeg', 'mixamorigRightLeg', 'mixamorigRightFoot']), chain(owned, ['mixamorigLeftUpLeg', 'mixamorigLeftLeg', 'mixamorigLeftFoot'])];
      const arms = [chain(owned, ['mixamorigRightArm', 'mixamorigRightForeArm', 'mixamorigRightHand']), chain(owned, ['mixamorigLeftArm', 'mixamorigLeftForeArm', 'mixamorigLeftHand'])];
      for (const limb of [...legs, ...arms]) if (limb) limb.side = Math.sign(limb.bones[0].getWorldPosition(new Vector3()).x) || 1;
      setRig({ scene: owned, legs, arms });
    }).catch(error => console.warn('Human crew mesh unavailable:', error));
    return () => { active = false; disposeSuit?.(); ownedMaterials.forEach(material => material.dispose()); owned?.traverse(object => { if (object.isSkinnedMesh) object.skeleton.dispose(); }); };
  }, [role]);
  useFrame(() => {
    if (!rig || !root.current || !body.current) return;
    const time = reducedMotion || started === null ? 0 : performance.now() - started;
    const pose = pitStopPose(time), working = role === 'carrier', side = Math.sign(x);
    root.current.position.x = role === 'jack' ? (z < 0 ? 2.3 : -2.3) * (1 - pose.approach) : x - (working ? side * pose.approach * .32 : 0);
    const crouch = working ? pose.approach * .2 : .02;
    body.current.position.y = -crouch;
    body.current.rotation.x = working ? -.12 * pose.approach : 0;
    root.current.updateMatrixWorld(true);
    const world = (px, py, pz) => root.current.localToWorld(new Vector3(px, py, pz));
    rig.legs.forEach(leg => { if (leg) solve(...leg.bones, world(leg.side * .14, .1, .08), world(leg.side * .4, .5, -.65), leg.lengths); });
    const reach = working && pose.approach > .2;
    rig.arms.forEach(arm => {
      if (arm) solve(...arm.bones, world(arm.side * .17, reach ? .62 : 1.02, reach ? -.56 : -.25), world(arm.side * .65, .9, -.4), arm.lengths);
    });
    if (tire.current) { tire.current.visible = pose.carrying || time < 3000; tire.current.position.y = reach ? .62 : .95; }
  });
  return <group ref={root} position={[x, 0, z]} rotation={[0, facing, 0]}>
    {rig && <group ref={body}><primitive object={rig.scene} dispose={null} /></group>}
    {rig && role === 'carrier' && <group ref={tire} position={[0, .65, -.55]} rotation={[0, 0, Math.PI / 2]}><mesh castShadow><cylinderGeometry args={[.39, .39, .3, 40]} /><meshStandardMaterial color="#141416" roughness={.95} /></mesh><mesh position={[0, .155, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.3, .008, 8, 48]} /><meshStandardMaterial color="#c4bb58" /></mesh></group>}
  </group>;
}
