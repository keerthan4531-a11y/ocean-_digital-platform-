/**
 * AquaTwin 3D - OceanWaveMaterial
 * High-fidelity 3D Gerstner Wave Shader Material.
 * Renders physical undulating ocean waves with:
 * - Real Significant Wave Height (SWH) vertex displacement
 * - Dynamic wave peak foam lines
 * - Sun glint specular reflections & Fresnel glancing light
 * - Translucent deep azure ocean optics
 */

import * as THREE from 'three';

export const oceanWaveVertexShader = `
  uniform float uTime;
  uniform float uAvgSwh;
  uniform float uPeakPeriod;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying float vWaveHeight;
  varying vec2 vUv;

  // Gerstner Wave Function for spherical geometry
  vec3 gerstnerWave(vec3 pos, vec3 dir, float steepness, float wavelength, float speed, inout vec3 tangent, inout vec3 binormal) {
    float k = 2.0 * 3.14159265 / max(0.5, wavelength);
    float c = sqrt(9.8 / k) * speed;
    float f = k * (dot(dir.xz, pos.xz) - c * uTime * 0.45);
    float a = (steepness / k) * (uAvgSwh * 0.12);

    tangent += vec3(
      -dir.x * dir.x * (steepness * sin(f)),
      dir.x * (steepness * cos(f)),
      -dir.x * dir.z * (steepness * sin(f))
    );
    binormal += vec3(
      -dir.x * dir.z * (steepness * sin(f)),
      dir.z * (steepness * cos(f)),
      -dir.z * dir.z * (steepness * sin(f))
    );

    return vec3(
      dir.x * (a * cos(f)),
      a * sin(f),
      dir.z * (a * cos(f))
    );
  }

  void main() {
    vUv = uv;
    vec3 gridPoint = position;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    vec3 p = gridPoint;

    // Superposition of 3 physical swell and chop wave octaves
    p += gerstnerWave(gridPoint, normalize(vec3(1.0, 0.0, 0.6)), 0.35, 2.2, 1.2, tangent, binormal);
    p += gerstnerWave(gridPoint, normalize(vec3(-0.8, 0.0, 0.5)), 0.25, 1.4, 1.5, tangent, binormal);
    p += gerstnerWave(gridPoint, normalize(vec3(0.3, 0.0, -1.0)), 0.20, 0.8, 1.9, tangent, binormal);

    vec3 normalMod = normalize(cross(binormal, tangent));
    vNormal = normalize(normalMatrix * normalMod);

    // Height offset along normal vector
    float disp = length(p - gridPoint);
    vWaveHeight = disp;

    // Physical radial displacement on sphere
    vec3 displaced = position + (normalize(position) * disp * (0.04 + uAvgSwh * 0.035));
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const oceanWaveFragmentShader = `
  uniform float uTime;
  uniform float uAvgSwh;
  uniform vec3 uDeepColor;
  uniform vec3 uShallowColor;
  uniform vec3 uFoamColor;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying float vWaveHeight;
  varying vec2 vUv;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);

    // 1. Fresnel glancing reflectance (reflects sky/atmosphere at shallow angles)
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.2);

    // 2. Base oceanic color interpolation: deep navy in troughs, vibrant azure on crests
    float crestFactor = smoothstep(0.02, 0.18, vWaveHeight);
    vec3 waterColor = mix(uDeepColor, uShallowColor, crestFactor);

    // 3. Dynamic Wave Crest Sea Foam (active during higher SWH)
    float foamThreshold = 0.12 - min(0.06, (uAvgSwh - 1.5) * 0.02);
    float foam = smoothstep(foamThreshold, foamThreshold + 0.05, vWaveHeight);
    waterColor = mix(waterColor, uFoamColor, foam * 0.85);

    // 4. Sparkling Sun Glint (Specular highlight)
    vec3 sunLightDir = normalize(vec3(1.2, 1.8, 1.4));
    vec3 halfVec = normalize(sunLightDir + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 64.0);
    vec3 sunGlint = vec3(1.0, 0.98, 0.9) * spec * 1.4;

    // 5. Composite Final Color with Fresnel Glow and Sunlight Glints
    vec3 finalColor = waterColor + (vec3(0.0, 0.8, 1.0) * fresnel * 0.45) + sunGlint;

    gl_FragColor = vec4(finalColor, uOpacity + foam * 0.25);
  }
`;

export function createOceanWaveMaterial(avgSwh: number = 2.2, peakPeriod: number = 8.5): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uAvgSwh: { value: avgSwh },
      uPeakPeriod: { value: peakPeriod },
      uDeepColor: { value: new THREE.Color(0x001f3f) },     // Deep oceanic navy
      uShallowColor: { value: new THREE.Color(0x00a8cc) },  // Tropical azure crest
      uFoamColor: { value: new THREE.Color(0xffffff) },     // White wave crest foam
      uOpacity: { value: 0.48 }                             // Rich translucent ocean body
    },
    vertexShader: oceanWaveVertexShader,
    fragmentShader: oceanWaveFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    side: THREE.FrontSide
  });
}
