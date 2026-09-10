/**
 * AquaTwin 3D - BuoyMarkers3D
 * 3D interactive markers for real INCOIS OMNI and NOAA NDBC moored buoys.
 */

import React from 'react';
import * as THREE from 'three';
import { BuoyData } from '../../types/ocean';
import { latLonToVector3 } from './OceanGlobe3D';

interface BuoyMarkers3DProps {
  buoys: BuoyData[];
  selectedBuoy: BuoyData | null;
  onSelectBuoy: (buoy: BuoyData) => void;
  radius?: number;
  visible?: boolean;
}

export function createBuoyMarkersGroup(
  buoys: BuoyData[],
  selectedId: string | null = null,
  radius: number = 10.18
): {
  group: THREE.Group;
  interactiveMeshes: { obj: THREE.Object3D; data: BuoyData }[];
} {
  const group = new THREE.Group();
  group.name = 'buoy_markers_root';
  const interactiveMeshes: { obj: THREE.Object3D; data: BuoyData }[] = [];

  buoys.forEach((buoy) => {
    const isSelected = selectedId === buoy.id;
    const pos = latLonToVector3(buoy.lat, buoy.lon, radius);

    const buoySubGroup = new THREE.Group();
    buoySubGroup.name = `sensor_buoy_${buoy.id}`;
    buoySubGroup.position.copy(pos);
    buoySubGroup.lookAt(0, 0, 0);

    const ringGeo = new THREE.RingGeometry(0.18, 0.28, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isSelected ? 0xf59e0b : 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isSelected ? 0.95 : 0.75
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    buoySubGroup.add(ringMesh);

    const coreGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0xffffff : 0x22d3ee,
      emissive: isSelected ? 0xf59e0b : 0x0891b2,
      emissiveIntensity: 0.9
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    buoySubGroup.add(coreMesh);

    group.add(buoySubGroup);
    interactiveMeshes.push({ obj: coreMesh, data: buoy });
  });

  return { group, interactiveMeshes };
}

export const BuoyMarkers3D: React.FC<BuoyMarkers3DProps> = ({
  buoys,
  selectedBuoy,
  onSelectBuoy,
  radius = 10.18,
  visible = true
}) => {
  return (
    <div className="hidden" data-visible={visible} data-count={buoys.length} data-selected={selectedBuoy?.id} />
  );
};
