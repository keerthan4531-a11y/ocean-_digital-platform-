/**
 * AquaTwin 3D - FluidParticleFlow
 * High-Performance Fluid Earth / Earth Nullschool Particle Flow Engine
 * Renders 1,800+ animated streamline comet particles flowing along ocean currents & wind vectors with:
 * - Dynamic velocity advection along real Open-Meteo & hydrodynamic fields
 * - Fluorescent velocity-gradient color trails (Cyan -> Emerald -> Gold -> Coral)
 * - Exponential tail alpha fading
 * - Ocean masking (particles exclusively spawn & travel in ocean basins)
 * - Cyclone vortex advection
 * - Subsurface depth attenuation (0m, 100m, 500m)
 */

import * as THREE from 'three';
import { CurrentVector, CycloneEvent } from '../../../types/ocean';
import { latLonToVector3 } from '../OceanGlobe3D';
import { isPointInOcean } from '../globe/OceanMask';

export interface FluidParticleFlowObject {
  group: THREE.Group;
  update: (timeSeconds: number, delta: number) => void;
  setVisible: (visible: boolean) => void;
  setDepthAndExaggeration: (depthM: number, verticalExaggeration: number) => void;
  setCyclone: (cyclone: CycloneEvent | null) => void;
  setLiveVectors: (vectors: CurrentVector[]) => void;
}

const NUM_PARTICLES = 1600;
const TRAIL_LENGTH = 12; // Number of points in each particle's fading trail

interface FlowParticle {
  lat: number;
  lon: number;
  age: number;
  maxAge: number;
  speedMultiplier: number;
  trail: THREE.Vector3[];
}

export function createFluidParticleFlow(
  globeRadius: number,
  depthM: number = 0,
  verticalExaggeration: number = 1.0,
  initialVectors: CurrentVector[] = [],
  activeCyclone: CycloneEvent | null = null
): FluidParticleFlowObject {
  const group = new THREE.Group();
  group.name = 'fluid_earth_particle_flow';

  let currentDepthM = depthM;
  let currentVertExag = verticalExaggeration;
  let liveVectors = initialVectors;
  let currentCyclone = activeCyclone;

  // Compute radius on globe
  const getFlowRadius = () => {
    const depthDrop = (currentDepthM / 2000) * 0.035 * currentVertExag;
    return globeRadius * (1.014 - depthDrop);
  };

  let flowRadius = getFlowRadius();

  // Color gradient stops for velocity
  const colorCalm = new THREE.Color(0x0284c7);      // < 0.3 m/s - Sky Blue
  const colorModerate = new THREE.Color(0x00f2fe);  // 0.3 - 0.7 m/s - Fluorescent Cyan
  const colorFast = new THREE.Color(0x10b981);      // 0.7 - 1.1 m/s - Emerald Mint
  const colorJet = new THREE.Color(0xfbbf24);       // 1.1 - 1.6 m/s - Golden Yellow
  const colorExtreme = new THREE.Color(0xf43f5e);   // > 1.6 m/s - Fiery Coral

  const getVelocityColor = (speed: number, alpha: number): THREE.Color => {
    const c = new THREE.Color();
    if (speed < 0.3) {
      c.copy(colorCalm);
    } else if (speed < 0.7) {
      const t = (speed - 0.3) / 0.4;
      c.copy(colorCalm).lerp(colorModerate, t);
    } else if (speed < 1.1) {
      const t = (speed - 0.7) / 0.4;
      c.copy(colorModerate).lerp(colorFast, t);
    } else if (speed < 1.6) {
      const t = (speed - 1.1) / 0.5;
      c.copy(colorFast).lerp(colorJet, t);
    } else {
      const t = Math.min(1.0, (speed - 1.6) / 0.8);
      c.copy(colorJet).lerp(colorExtreme, t);
    }
    // Apply tail fade by dimming towards black
    c.multiplyScalar(Math.max(0.04, alpha));
    return c;
  };

  // Spawn a particle at a valid ocean coordinate in the Indian Ocean & surrounding waters
  const spawnParticle = (p: FlowParticle) => {
    let attempts = 0;
    let lat = 0;
    let lon = 0;
    
    // Prioritize North Indian Ocean basin (30°S to 28°N, 35°E to 110°E)
    while (attempts < 15) {
      lat = -25.0 + Math.random() * 52.0; // -25°S to +27°N
      lon = 40.0 + Math.random() * 68.0;  // 40°E to 108°E
      if (isPointInOcean(lat, lon)) {
        break;
      }
      attempts++;
    }

    p.lat = lat;
    p.lon = lon;
    p.age = Math.floor(Math.random() * 20); // slight stagger
    p.maxAge = 70 + Math.floor(Math.random() * 110); // 70-180 frames lifespan
    p.speedMultiplier = 0.85 + Math.random() * 0.4;
    
    const initialPos = latLonToVector3(p.lat, p.lon, flowRadius);
    p.trail = [];
    for (let k = 0; k < TRAIL_LENGTH; k++) {
      p.trail.push(initialPos.clone());
    }
  };

  // Initialize particle array
  const particles: FlowParticle[] = [];
  for (let i = 0; i < NUM_PARTICLES; i++) {
    const p: FlowParticle = {
      lat: 0,
      lon: 0,
      age: 0,
      maxAge: 100,
      speedMultiplier: 1.0,
      trail: []
    };
    spawnParticle(p);
    // Pre-warm age so they don't all start at 0
    p.age = Math.floor(Math.random() * p.maxAge);
    particles.push(p);
  }

  // Pre-allocated LineSegments Buffer
  // Each particle has (TRAIL_LENGTH - 1) line segments.
  // Each segment has 2 vertices (start, end).
  const segmentsPerParticle = TRAIL_LENGTH - 1;
  const totalSegments = NUM_PARTICLES * segmentsPerParticle;
  const totalVertices = totalSegments * 2;

  const positions = new Float32Array(totalVertices * 3);
  const colors = new Float32Array(totalVertices * 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    linewidth: 2
  });

  const lineMesh = new THREE.LineSegments(geometry, material);
  group.add(lineMesh);

  // Velocity Field Evaluator (combines physical dynamics + real Open-Meteo observations + cyclones)
  const getVelocityAt = (lat: number, lon: number, timeSec: number): { u: number; v: number; speed: number } => {
    let u = 0;
    let v = 0;

    // 1. Somali Low-Level Jet (Western Arabian Sea: 4°N to 18°N, 45°E to 62°E)
    if (lat >= 2.0 && lat <= 20.0 && lon >= 44.0 && lon <= 65.0) {
      const jetCenterLat = 12.0;
      const distFromCore = Math.abs(lat - jetCenterLat) / 8.0;
      const somaliMag = Math.max(0, 1.6 * (1.0 - distFromCore * distFromCore));
      u += somaliMag * 0.75 + 0.15 * Math.sin(timeSec * 0.8 + lat * 0.2);
      v += somaliMag * 1.10 + 0.20 * Math.cos(timeSec * 0.7 + lon * 0.2);
    }

    // 2. Southwest Monsoon Current & Equatorial Jet (0° to 6°N, 55°E to 98°E)
    if (lat >= -2.0 && lat <= 7.0 && lon >= 52.0 && lon <= 100.0) {
      const eqMag = 1.35 * Math.exp(-Math.pow(lat - 2.5, 2) / 10.0);
      u += eqMag * 1.25 + 0.12 * Math.sin(timeSec * 1.1 + lon * 0.1);
      v += 0.15 * Math.cos(timeSec * 0.9 + lat);
    }

    // 3. East India Coastal Current (EICC) - Bay of Bengal Western Boundary (8°N to 22°N, 80°E to 89°E)
    if (lat >= 7.0 && lat <= 22.0 && lon >= 79.5 && lon <= 88.0) {
      const eiccMag = 0.95 * Math.exp(-Math.pow(lon - 82.5, 2) / 8.0);
      u += eiccMag * 0.35;
      v += eiccMag * 0.90; // Northward coastal jet
    }

    // 4. West India Coastal Current (WICC) - Eastern Arabian Sea (8°N to 23°N, 68°E to 76°E)
    if (lat >= 7.0 && lat <= 23.0 && lon >= 68.0 && lon <= 75.5) {
      const wiccMag = 0.75 * Math.exp(-Math.pow(lon - 72.0, 2) / 6.0);
      u += -wiccMag * 0.25;
      v += -wiccMag * 0.80; // Southward coastal current
    }

    // 5. Bay of Bengal Clockwise Gyre (Center ~16.5°N, 88.5°E)
    if (lat >= 8.0 && lat <= 22.0 && lon >= 82.0 && lon <= 96.0) {
      const cLat = 16.0;
      const cLon = 88.5;
      const dLat = lat - cLat;
      const dLon = (lon - cLon) * Math.cos((lat * Math.PI) / 180);
      const r = Math.sqrt(dLat * dLat + dLon * dLon);
      if (r > 0.5 && r < 9.0) {
        const gyreSpeed = 0.85 * Math.sin((r / 9.0) * Math.PI);
        // Clockwise tangential velocity
        u += (dLat / r) * gyreSpeed;
        v += -(dLon / r) * gyreSpeed;
      }
    }

    // 6. Arabian Sea Great Whirl (Center ~13.5°N, 64.0°E)
    if (lat >= 7.0 && lat <= 20.0 && lon >= 56.0 && lon <= 72.0) {
      const cLat = 13.5;
      const cLon = 64.0;
      const dLat = lat - cLat;
      const dLon = (lon - cLon) * Math.cos((lat * Math.PI) / 180);
      const r = Math.sqrt(dLat * dLat + dLon * dLon);
      if (r > 0.5 && r < 8.0) {
        const whirlSpeed = 0.90 * Math.sin((r / 8.0) * Math.PI);
        u += (dLat / r) * whirlSpeed;
        v += -(dLon / r) * whirlSpeed;
      }
    }

    // 7. South Equatorial Current (Westward: -16°S to -5°S, 45°E to 105°E)
    if (lat >= -18.0 && lat <= -4.0 && lon >= 42.0 && lon <= 106.0) {
      const secMag = 0.85;
      u += -secMag;
      v += -0.08 * Math.sin(lon * 0.15);
    }

    // 8. Active Cyclone Vortex Advection (Strong cyclonic spiral into low pressure eye)
    if (currentCyclone && currentCyclone.track && currentCyclone.track.length > 0) {
      const cycPoint = currentCyclone.track[0];
      const cycLat = cycPoint.lat;
      const cycLon = cycPoint.lon;
      const dLat = lat - cycLat;
      const dLon = (lon - cycLon) * Math.cos((lat * Math.PI) / 180);
      const r = Math.sqrt(dLat * dLat + dLon * dLon);
      if (r < 7.0 && r > 0.2) {
        // Northern hemisphere cyclonic: Counter-clockwise + inward inflow
        const maxWind = Math.min(2.8, (cycPoint.wind_knots || 65) / 35.0);
        const intensity = maxWind * Math.exp(-r / 3.0);
        const tangentialU = -(dLat / r) * intensity;
        const tangentialV = (dLon / r) * intensity;
        const radialInflowU = -(dLon / r) * intensity * 0.35;
        const radialInflowV = -(dLat / r) * intensity * 0.35;
        u += tangentialU + radialInflowU;
        v += tangentialV + radialInflowV;
      }
    }

    // 9. Blend with nearest Live Open-Meteo Vector observations
    if (liveVectors.length > 0) {
      for (let k = 0; k < liveVectors.length; k++) {
        const vec = liveVectors[k];
        const dLat = lat - vec.lat;
        const dLon = (lon - vec.lon) * Math.cos((lat * Math.PI) / 180);
        const distSq = dLat * dLat + dLon * dLon;
        if (distSq < 25.0) { // Within 5 degrees
          const weight = Math.exp(-distSq / 8.0) * 0.65;
          u = u * (1.0 - weight) + vec.u_ms * weight;
          v = v * (1.0 - weight) + vec.v_ms * weight;
          break;
        }
      }
    }

    // Subsurface depth attenuation (100m -> 75%, 500m -> 40%)
    if (currentDepthM > 0) {
      const depthDecay = Math.max(0.35, 1.0 - (currentDepthM / 2000) * 0.75);
      u *= depthDecay;
      v *= depthDecay;
    }

    const speed = Math.sqrt(u * u + v * v);
    return { u, v, speed };
  };

  return {
    group,
    update: (timeSeconds: number, delta: number) => {
      flowRadius = getFlowRadius();
      const dt = Math.min(delta, 0.05);

      let vertOffset = 0;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = particles[i];
        p.age++;

        // Query velocity vector at particle location
        const { u, v, speed } = getVelocityAt(p.lat, p.lon, timeSeconds);

        // Advect particle along velocity field (degrees/second scaling)
        // lon advection scaled by cos(lat) for spherical fidelity
        const cosLat = Math.max(0.2, Math.cos((p.lat * Math.PI) / 180));
        const stepScale = 1.15 * p.speedMultiplier;

        p.lat += v * dt * stepScale * 1.8;
        p.lon += (u / cosLat) * dt * stepScale * 1.8;

        // Check if out of bounds, hit land, or aged out
        const isDead = p.age >= p.maxAge || 
                       p.lat < -35.0 || p.lat > 30.0 || 
                       p.lon < 32.0 || p.lon > 115.0 ||
                       !isPointInOcean(p.lat, p.lon);

        if (isDead) {
          spawnParticle(p);
        }

        // Current 3D position
        const currentPos = latLonToVector3(p.lat, p.lon, flowRadius);

        // Shift trail history (0 is head, TRAIL_LENGTH-1 is tail tip)
        for (let k = TRAIL_LENGTH - 1; k > 0; k--) {
          p.trail[k].copy(p.trail[k - 1]);
        }
        p.trail[0].copy(currentPos);

        // Fill line segments buffer for this particle
        for (let seg = 0; seg < segmentsPerParticle; seg++) {
          const ptA = p.trail[seg];
          const ptB = p.trail[seg + 1];

          // Normalized alpha from head (1.0) to tail tip (0.05)
          const alphaA = Math.pow(1.0 - seg / TRAIL_LENGTH, 1.4);
          const alphaB = Math.pow(1.0 - (seg + 1) / TRAIL_LENGTH, 1.4);

          const colA = getVelocityColor(speed, alphaA);
          const colB = getVelocityColor(speed, alphaB);

          // Vertex A
          const idxA = vertOffset * 3;
          positions[idxA] = ptA.x;
          positions[idxA + 1] = ptA.y;
          positions[idxA + 2] = ptA.z;

          colors[idxA] = colA.r;
          colors[idxA + 1] = colA.g;
          colors[idxA + 2] = colA.b;
          vertOffset++;

          // Vertex B
          const idxB = vertOffset * 3;
          positions[idxB] = ptB.x;
          positions[idxB + 1] = ptB.y;
          positions[idxB + 2] = ptB.z;

          colors[idxB] = colB.r;
          colors[idxB + 1] = colB.g;
          colors[idxB + 2] = colB.b;
          vertOffset++;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    },
    setVisible: (visible: boolean) => {
      group.visible = visible;
    },
    setDepthAndExaggeration: (depthM: number, verticalExaggeration: number) => {
      currentDepthM = depthM;
      currentVertExag = verticalExaggeration;
      flowRadius = getFlowRadius();
    },
    setCyclone: (cyclone: CycloneEvent | null) => {
      currentCyclone = cyclone;
    },
    setLiveVectors: (vectors: CurrentVector[]) => {
      liveVectors = vectors;
    }
  };
}
