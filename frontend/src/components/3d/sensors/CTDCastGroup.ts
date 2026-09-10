/**
 * AquaTwin 3D - CTDCastGroup
 * Ship-based CTD Cast Stations (ORV Sagar Kanya / Sagar Nidhi)
 * Emerald Green 3D Balloon Pin markers, vertical hydrographic plumb lines, and Chlorophyll-a Max beads.
 */

import * as THREE from 'three';
import { CTDCastStation } from '../../../types/ocean';
import { latLonToVector3 } from '../OceanGlobe3D';

export interface InteractiveCTDEntry {
  obj: THREE.Object3D;
  hitObj: THREE.Object3D;
  data: CTDCastStation;
  type: 'ctd';
}

export function createCTDCastGroup(
  stations: CTDCastStation[],
  selectedStationId: string | null,
  globeRadius: number,
  verticalExaggeration: number = 1.0
): {
  group: THREE.Group;
  interactiveEntries: InteractiveCTDEntry[];
  ctdMeshes: THREE.Object3D[];
  updateTime: (t: number) => void;
} {
  const group = new THREE.Group();
  group.name = 'sensor_ctd_group';

  const interactiveEntries: InteractiveCTDEntry[] = [];
  const ctdMeshes: THREE.Object3D[] = [];
  const animators: Array<{
    rosetteMesh: THREE.Mesh;
    chloroBead: THREE.Mesh;
    beaconRing: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    chloroMat: THREE.MeshStandardMaterial;
    phase: number;
  }> = [];

  stations.forEach((station, index) => {
    const isSelected = selectedStationId === station.station_id;
    const stationGroup = new THREE.Group();
    stationGroup.name = `sensor_ctd_${station.station_id}`;

    // 1. Positions along vertical water column
    const surfaceRadius = globeRadius * 1.018;
    const maxDepth = Math.min(station.bottom_depth_m || 1000, 2000);
    const bottomRadius = globeRadius * (1.018 - (maxDepth / 2000) * 0.035 * verticalExaggeration);

    const surfacePos = latLonToVector3(station.lat, station.lon, surfaceRadius);
    const bottomPos = latLonToVector3(station.lat, station.lon, bottomRadius);
    const normal = surfacePos.clone().normalize();

    // 2. Surface Marker: Emerald Green 3D Balloon Pin (#10b981)
    const rosetteGroup = new THREE.Group();
    rosetteGroup.position.copy(surfacePos);
    rosetteGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    const pinMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0x34d399 : 0x10b981,
      emissive: isSelected ? 0x059669 : 0x047857,
      emissiveIntensity: isSelected ? 1.4 : 0.9,
      metalness: 0.35,
      roughness: 0.25
    });

    // Inverted needle stem
    const stemGeo = new THREE.ConeGeometry(0.08, 0.20, 16);
    stemGeo.rotateX(Math.PI);
    const stemMesh = new THREE.Mesh(stemGeo, pinMat);
    stemMesh.position.set(0, 0.10, 0);
    rosetteGroup.add(stemMesh);

    // Balloon Head Sphere
    const headGeo = new THREE.SphereGeometry(0.12, 20, 20);
    const rosetteMesh = new THREE.Mesh(headGeo, pinMat);
    rosetteMesh.position.set(0, 0.22, 0);
    rosetteGroup.add(rosetteMesh);
    ctdMeshes.push(rosetteMesh);

    // Inner White Core Dot
    const coreGeo = new THREE.SphereGeometry(0.048, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.22, 0);
    rosetteGroup.add(coreMesh);

    // Surface beacon ring
    const ringGeo = new THREE.RingGeometry(0.04, 0.10, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isSelected ? 0x34d399 : 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const beaconRing = new THREE.Mesh(ringGeo, ringMat);
    rosetteGroup.add(beaconRing);

    stationGroup.add(rosetteGroup);

    // 3. Hydrographic Plumb Line / Cable down to max bottom depth
    const cableGeo = new THREE.BufferGeometry().setFromPoints([surfacePos, bottomPos]);
    const cableMat = new THREE.LineBasicMaterial({
      color: isSelected ? 0xf59e0b : 0x10b981,
      transparent: true,
      opacity: isSelected ? 0.95 : 0.70
    });
    const cableLine = new THREE.Line(cableGeo, cableMat);
    stationGroup.add(cableLine);

    // 4. Deep Rosette Package at bottom of cast
    const deepPkgGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 8);
    const deepPkgMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0xf59e0b : 0x059669,
      metalness: 0.7,
      roughness: 0.3
    });
    const deepPkgMesh = new THREE.Mesh(deepPkgGeo, deepPkgMat);
    deepPkgMesh.position.copy(bottomPos);
    deepPkgMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    stationGroup.add(deepPkgMesh);

    // 5. Deep Chlorophyll-a Maximum (DCM) Fluorescent Glowing Bead
    const chlDepth = station.chlorophyll_max_depth_m || 45;
    const chlRadius = globeRadius * (1.018 - (chlDepth / 2000) * 0.035 * verticalExaggeration);
    const chlPos = latLonToVector3(station.lat, station.lon, chlRadius);

    const chloroGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const chloroMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 1.5,
      metalness: 0.2,
      roughness: 0.2
    });
    const chloroBead = new THREE.Mesh(chloroGeo, chloroMat);
    chloroBead.position.copy(chlPos);
    stationGroup.add(chloroBead);

    // 6. Invisible Hit Hull (radius: 0.4)
    const hitGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.set(0, 0.22, 0);
    rosetteGroup.add(hitMesh);
    stationGroup.add(hitMesh);

    group.add(stationGroup);

    interactiveEntries.push({
      obj: stationGroup,
      hitObj: hitMesh,
      data: station,
      type: 'ctd'
    });

    animators.push({
      rosetteMesh,
      chloroBead,
      beaconRing,
      ringMat,
      chloroMat,
      phase: index * 1.2
    });
  });

  // Pulse & rotation animation loop
  const updateTime = (t: number) => {
    animators.forEach(({ rosetteMesh, chloroBead, beaconRing, ringMat, chloroMat, phase }) => {
      const time = t * 2.0 + phase;
      
      // Slow rosette rotation
      rosetteMesh.rotation.y = time * 0.5;

      // Chlorophyll bead glow pulse
      const glow = 1.2 + 0.6 * Math.sin(time * 1.5);
      chloroMat.emissiveIntensity = glow;
      const beadScale = 1.0 + 0.15 * Math.sin(time * 1.5);
      chloroBead.scale.set(beadScale, beadScale, beadScale);

      // Surface ring pulse
      const ringScale = 1.0 + 0.22 * Math.sin(time);
      beaconRing.scale.set(ringScale, ringScale, 1.0);
      ringMat.opacity = 0.45 + 0.35 * Math.sin(time);
    });
  };

  return { group, interactiveEntries, ctdMeshes, updateTime };
}
