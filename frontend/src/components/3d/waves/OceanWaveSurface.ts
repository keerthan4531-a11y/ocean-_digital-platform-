/**
 * AquaTwin 3D - OceanWaveSurface
 * High-resolution 3D Ocean Surface mesh with real Gerstner wave displacement
 * and dynamic depth-stratified optical attenuation (Surface Cyan -> Thermocline Cobalt -> Abyssal Midnight).
 */

import * as THREE from 'three';
import { createOceanWaveMaterial } from './OceanWaveMaterial';

export interface OceanWaveSurfaceObject {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  updateTime: (timeSeconds: number) => void;
  updateSwh: (avgSwh: number, peakPeriod: number) => void;
  updateDepth: (depth: number) => void;
  setVisible: (visible: boolean) => void;
}

export function createOceanWaveSurface(globeRadius: number, avgSwh: number = 2.2, peakPeriod: number = 8.5): OceanWaveSurfaceObject {
  // High tessellation for smooth 3D Gerstner wave swells
  const geometry = new THREE.SphereGeometry(globeRadius * 1.008, 160, 160);
  const material = createOceanWaveMaterial(avgSwh, peakPeriod);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'real_ocean_wave_surface';

  // Depth color profiles
  const getDepthColors = (depth: number) => {
    if (depth <= 0) {
      return {
        shallow: new THREE.Color(0x00e5ff), // Vibrant tropical azure
        deep: new THREE.Color(0x003366),
        opacity: 0.52
      };
    } else if (depth <= 50) {
      return {
        shallow: new THREE.Color(0x00b4d8), // Mixed layer teal
        deep: new THREE.Color(0x002855),
        opacity: 0.58
      };
    } else if (depth <= 100) {
      return {
        shallow: new THREE.Color(0x0077b6), // Thermocline start aquamarine
        deep: new THREE.Color(0x03045e),
        opacity: 0.65
      };
    } else if (depth <= 200) {
      return {
        shallow: new THREE.Color(0x023e8a), // Thermocline core cobalt
        deep: new THREE.Color(0x001233),
        opacity: 0.72
      };
    } else if (depth <= 500) {
      return {
        shallow: new THREE.Color(0x001845), // Intermediate indigo
        deep: new THREE.Color(0x000814),
        opacity: 0.78
      };
    } else if (depth <= 1000) {
      return {
        shallow: new THREE.Color(0x03071e), // Deep twilight
        deep: new THREE.Color(0x000000),
        opacity: 0.84
      };
    } else {
      return {
        shallow: new THREE.Color(0x020617), // Abyssal plain midnight
        deep: new THREE.Color(0x000000),
        opacity: 0.90
      };
    }
  };

  return {
    mesh,
    material,
    updateTime: (timeSeconds: number) => {
      material.uniforms.uTime.value = timeSeconds;
    },
    updateSwh: (swh: number, period: number) => {
      material.uniforms.uAvgSwh.value = swh;
      material.uniforms.uPeakPeriod.value = period;
    },
    updateDepth: (depth: number) => {
      const colors = getDepthColors(depth);
      material.uniforms.uShallowColor.value.copy(colors.shallow);
      material.uniforms.uDeepColor.value.copy(colors.deep);
      material.uniforms.uOpacity.value = colors.opacity;
    },
    setVisible: (visible: boolean) => {
      mesh.visible = visible;
    }
  };
}
