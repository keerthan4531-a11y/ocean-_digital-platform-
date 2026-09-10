/**
 * AquaTwin 3D - BuoyNetworkGroup
 * INCOIS OMNI & NOAA NDBC Moored Buoys with distinct 3D Coral Red Balloon Pin markers.
 */

import * as THREE from 'three';
import { BuoyData } from '../../../types/ocean';
import { latLonToVector3 } from '../OceanGlobe3D';

export interface InteractiveSensorEntry {
  obj: THREE.Object3D;
  hitObj: THREE.Object3D;
  data: BuoyData;
  type: 'buoy';
}

export function createBuoyNetworkGroup(
  buoys: BuoyData[],
  selectedBuoyId: string | undefined,
  globeRadius: number
): { group: THREE.Group; interactiveEntries: InteractiveSensorEntry[] } {
  const group = new THREE.Group();
  group.name = 'sensor_buoys_group';
  const interactiveEntries: InteractiveSensorEntry[] = [];

  buoys.forEach(buoy => {
    const buoyPos = latLonToVector3(buoy.lat, buoy.lon, globeRadius * 1.018);
    const buoyGroup = new THREE.Group();
    buoyGroup.name = `sensor_buoy_${buoy.id}`;
    buoyGroup.position.copy(buoyPos);

    const normal = buoyPos.clone().normalize();
    buoyGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    const isSelected = selectedBuoyId === buoy.id;

    // 1. Coral Red 3D Balloon Pin (#ef4444)
    const pinMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0xf87171 : 0xef4444,
      emissive: isSelected ? 0xdc2626 : 0x991b1b,
      emissiveIntensity: isSelected ? 1.4 : 0.9,
      metalness: 0.35,
      roughness: 0.25
    });

    // Inverted needle stem
    const stemGeo = new THREE.ConeGeometry(0.08, 0.20, 16);
    stemGeo.rotateX(Math.PI);
    const stemMesh = new THREE.Mesh(stemGeo, pinMat);
    stemMesh.position.set(0, 0.10, 0);
    buoyGroup.add(stemMesh);

    // Balloon Head Sphere
    const headGeo = new THREE.SphereGeometry(0.12, 20, 20);
    const headMesh = new THREE.Mesh(headGeo, pinMat);
    headMesh.position.set(0, 0.22, 0);
    buoyGroup.add(headMesh);

    // Top Radio Antenna Mast
    const antGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8);
    const antMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });
    const antMesh = new THREE.Mesh(antGeo, antMat);
    antMesh.position.set(0, 0.38, 0);
    buoyGroup.add(antMesh);

    // Top Red Flashing Beacon Tip
    const tipGeo = new THREE.SphereGeometry(0.028, 8, 8);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xff4d4f });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.set(0, 0.45, 0);
    buoyGroup.add(tipMesh);

    // 2. Ground Contact Beacon Ring on water surface
    const ringGeo = new THREE.RingGeometry(0.04, 0.10, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isSelected ? 0xf87171 : 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    buoyGroup.add(ringMesh);

    // 3. Invisible hit hull
    const hitGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.set(0, 0.22, 0);
    buoyGroup.add(hitMesh);

    group.add(buoyGroup);
    interactiveEntries.push({
      obj: buoyGroup,
      hitObj: hitMesh,
      data: buoy,
      type: 'buoy'
    });
  });

  return { group, interactiveEntries };
}
