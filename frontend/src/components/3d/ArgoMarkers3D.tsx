/**
 * AquaTwin 3D - ArgoMarkers3D
 * 3D interactive markers for real Argo profiling floats with subsurface dive trajectories.
 */

import React from 'react';
import * as THREE from 'three';
import { ArgoFloat } from '../../types/ocean';
import { latLonToVector3 } from './OceanGlobe3D';

interface ArgoMarkers3DProps {
  argoFloats: ArgoFloat[];
  selectedArgo: ArgoFloat | null;
  onSelectArgo: (argo: ArgoFloat) => void;
  radius?: number;
  visible?: boolean;
}

export function createArgoMarkersGroup(
  argoFloats: ArgoFloat[],
  selectedId: string | null = null,
  radius: number = 10.18
): {
  group: THREE.Group;
  interactiveMeshes: { obj: THREE.Object3D; data: ArgoFloat }[];
} {
  const group = new THREE.Group();
  group.name = 'argo_markers_root';
  const interactiveMeshes: { obj: THREE.Object3D; data: ArgoFloat }[] = [];

  argoFloats.forEach((argo) => {
    const isSelected = selectedId === argo.wmo_id;
    const pos = latLonToVector3(argo.lat, argo.lon, radius);

    const argoSubGroup = new THREE.Group();
    argoSubGroup.name = `sensor_argo_${argo.wmo_id}`;
    argoSubGroup.position.copy(pos);
    argoSubGroup.lookAt(0, 0, 0);

    const markerGeo = new THREE.OctahedronGeometry(0.16, 0);
    const markerMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0xfde047 : 0x10b981,
      emissive: isSelected ? 0xeab308 : 0x059669,
      emissiveIntensity: isSelected ? 1.4 : 0.9
    });
    const markerMesh = new THREE.Mesh(markerGeo, markerMat);
    argoSubGroup.add(markerMesh);

    group.add(argoSubGroup);
    interactiveMeshes.push({ obj: markerMesh, data: argo });

    // Subsurface 3D dive trajectory
    if (argo.trajectory && argo.trajectory.length > 1) {
      const curvePoints: THREE.Vector3[] = [];
      argo.trajectory.forEach((pt) => {
        const depthOffset = (pt.depth / 2000) * 0.55;
        const r = radius + depthOffset;
        curvePoints.push(latLonToVector3(pt.lat, pt.lon, r));
      });

      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.025, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xfde047 : 0x34d399,
        transparent: true,
        opacity: isSelected ? 0.9 : 0.6
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.name = `sensor_argo_path_${argo.wmo_id}`;
      group.add(tubeMesh);
    }
  });

  return { group, interactiveMeshes };
}

export const ArgoMarkers3D: React.FC<ArgoMarkers3DProps> = ({
  argoFloats,
  selectedArgo,
  onSelectArgo,
  radius = 10.18,
  visible = true
}) => {
  return (
    <div className="hidden" data-visible={visible} data-count={argoFloats.length} data-selected={selectedArgo?.wmo_id} />
  );
};
