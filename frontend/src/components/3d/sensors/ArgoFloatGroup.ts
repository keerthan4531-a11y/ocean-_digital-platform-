/**
 * AquaTwin 3D - ArgoFloatGroup
 * Global Argo GDAC Profiling Floats with compact, elegant 3D Balloon Pin markers
 * and vertical hydrographic plumb-line cable.
 */

import * as THREE from 'three';
import { ArgoFloat } from '../../../types/ocean';
import { latLonToVector3 } from '../OceanGlobe3D';

export interface InteractiveArgoEntry {
  obj: THREE.Object3D;
  hitObj: THREE.Object3D;
  data: ArgoFloat;
  type: 'argo';
}

/**
 * Creates an elegant, distinct 3D Balloon Pin marker
 */
function create3DBalloonPin(
  colorHex: number,
  emissiveHex: number,
  isSelected: boolean = false,
  coreColorHex: number = 0xffffff
): { pinGroup: THREE.Group; headMesh: THREE.Mesh } {
  const pinGroup = new THREE.Group();

  const pinMat = new THREE.MeshStandardMaterial({
    color: isSelected ? 0xfef08a : colorHex,
    emissive: isSelected ? 0xfacc15 : emissiveHex,
    emissiveIntensity: isSelected ? 1.4 : 0.9,
    metalness: 0.35,
    roughness: 0.25
  });

  // 1. Inverted Tapered Needle Stem (Touching surface at y=0)
  const stemGeo = new THREE.ConeGeometry(0.08, 0.20, 16);
  stemGeo.rotateX(Math.PI); // Tip points down to y=0
  const stemMesh = new THREE.Mesh(stemGeo, pinMat);
  stemMesh.position.set(0, 0.10, 0);
  pinGroup.add(stemMesh);

  // 2. Balloon Head Sphere (Upper bulb)
  const headGeo = new THREE.SphereGeometry(0.12, 20, 20);
  const headMesh = new THREE.Mesh(headGeo, pinMat);
  headMesh.position.set(0, 0.22, 0);
  pinGroup.add(headMesh);

  // 3. Inner White Core Bead
  const coreGeo = new THREE.SphereGeometry(0.048, 12, 12);
  const coreMat = new THREE.MeshBasicMaterial({ color: coreColorHex });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.set(0, 0.22, 0);
  pinGroup.add(coreMesh);

  // 4. Ground Contact Beacon Ring on water surface
  const ringGeo = new THREE.RingGeometry(0.04, 0.10, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: isSelected ? 0xfacc15 : colorHex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: isSelected ? 0.95 : 0.65,
    depthWrite: false
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  pinGroup.add(ringMesh);

  return { pinGroup, headMesh };
}

export function createArgoFloatGroup(
  argoFloats: ArgoFloat[],
  selectedArgoWmo: string | undefined,
  globeRadius: number,
  verticalExaggeration: number = 1.0
): { group: THREE.Group; interactiveEntries: InteractiveArgoEntry[]; argoMeshes: THREE.Object3D[] } {
  const group = new THREE.Group();
  group.name = 'sensor_argo_group';
  const interactiveEntries: InteractiveArgoEntry[] = [];
  const argoMeshes: THREE.Object3D[] = [];

  argoFloats.forEach(argo => {
    const argoPos = latLonToVector3(argo.lat, argo.lon, globeRadius * 1.018);
    const argoGroup = new THREE.Group();
    argoGroup.name = `sensor_argo_${argo.wmo_id}`;
    argoGroup.position.copy(argoPos);

    // Normal vector pointing straight out from globe center
    const normal = argoPos.clone().normalize();
    argoGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    const isSelected = selectedArgoWmo === argo.wmo_id;

    // 1. Golden Amber 3D Balloon Pin Marker (#facc15)
    const { pinGroup, headMesh } = create3DBalloonPin(
      isSelected ? 0xfacc15 : 0xeab308,
      isSelected ? 0xca8a04 : 0xa16207,
      isSelected,
      0xffffff
    );
    argoGroup.add(pinGroup);
    argoMeshes.push(headMesh);

    // 2. Invisible Raycast Hit Sphere
    const hitGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.set(0, 0.22, 0);
    argoGroup.add(hitMesh);

    // 3. Subsurface CTD Profile Plumb-Line Cable (down to 2000m)
    const deepRadius = globeRadius * (1.018 - 0.035 * verticalExaggeration);
    const deepPos = latLonToVector3(argo.lat, argo.lon, deepRadius);
    const cablePoints = [argoPos, deepPos];
    const cableGeo = new THREE.BufferGeometry().setFromPoints(cablePoints);
    const cableMat = new THREE.LineBasicMaterial({
      color: isSelected ? 0xfef08a : 0xeab308,
      transparent: true,
      opacity: isSelected ? 0.9 : 0.45
    });
    const cable = new THREE.Line(cableGeo, cableMat);
    group.add(cable);

    group.add(argoGroup);

    interactiveEntries.push({
      obj: argoGroup,
      hitObj: hitMesh,
      data: argo,
      type: 'argo'
    });
  });

  return { group, interactiveEntries, argoMeshes };
}
