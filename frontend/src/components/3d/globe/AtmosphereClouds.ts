/**
 * AquaTwin 3D - AtmosphereClouds
 * Atmospheric cloud layer and Rayleigh scattering outer rim glow.
 */

import * as THREE from 'three';

export interface AtmosphereCloudsObject {
  cloudMesh: THREE.Mesh;
  atmosphereMesh: THREE.Mesh;
  updateTime: (deltaSeconds: number) => void;
}

export function createAtmosphereAndClouds(globeRadius: number): AtmosphereCloudsObject {
  const textureLoader = new THREE.TextureLoader();

  // 1. Atmospheric Cloud Layer
  const cloudGeometry = new THREE.SphereGeometry(globeRadius * 1.012, 64, 64);
  const cloudTexture = textureLoader.load('/textures/earth_clouds.jpg');
  const cloudMaterial = new THREE.MeshStandardMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloudMesh.name = 'atmospheric_clouds';

  // 2. Rayleigh Atmospheric Glow
  const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.045, 48, 48);
  const atmosphereMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
        gl_FragColor = vec4(0.0, 0.95, 1.0, 1.0) * intensity * 1.9;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  });
  const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  atmosphereMesh.name = 'atmosphere_rayleigh_glow';

  return {
    cloudMesh,
    atmosphereMesh,
    updateTime: (deltaSeconds: number) => {
      cloudMesh.rotation.y += deltaSeconds * 0.015; // Slow orbital drift
    }
  };
}
