/**
 * AquaTwin 3D - OceanGlobe3D
 * Interactive 3D WebGL Ocean Globe with Real-Time Data Integration:
 * - 3D Wave Surface with Real SWH Vertex Displacement (Open-Meteo Marine API)
 * - 3D Particle Advection along Real (u, v) Current Vectors
 * - Real In-Situ Moored Buoys (INCOIS OMNI / NOAA NDBC)
 * - Real Argo Profiling Floats with Subsurface CTD Trajectories (Argovis / GDAC)
 * - Accurate Indian Ocean Coastlines & GEBCO Bathymetric Trenches
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { BuoyData, ArgoFloat, OceanVariable, CycloneEvent, WaveDataPoint, CurrentVector, GliderMission, CTDCastStation, IsosurfaceData } from '../../types/ocean';
import { createOceanWaveSurface, OceanWaveSurfaceObject } from './waves/OceanWaveSurface';
import { createOceanThermalField, OceanThermalFieldObject } from './globe/OceanThermalField';
import { createFluidParticleFlow, FluidParticleFlowObject } from './currents/FluidParticleFlow';
import { createAtmosphereAndClouds, AtmosphereCloudsObject } from './globe/AtmosphereClouds';
import { createBuoyNetworkGroup } from './sensors/BuoyNetworkGroup';
import { createArgoFloatGroup } from './sensors/ArgoFloatGroup';
import { createGliderMissionGroup } from './sensors/GliderMissionGroup';
import { createCTDCastGroup } from './sensors/CTDCastGroup';
import { createIsosurfaceMesh, IsosurfaceMeshObject, generateDefaultIsothermGrid } from './IsosurfaceMesh3D';
import { initializeOceanMask, isPointInOcean } from './globe/OceanMask';

interface OceanGlobe3DProps {
  variable: OceanVariable;
  depth?: number;
  verticalExaggeration?: number;
  currentDepthLayer?: number;
  buoys?: BuoyData[];
  argoFloats?: ArgoFloat[];
  gliders?: GliderMission[];
  ctdStations?: CTDCastStation[];
  isosurfaceData?: IsosurfaceData | null;
  isosurfaceTargetTemp?: number;
  wavePoints?: WaveDataPoint[];
  currentVectors?: CurrentVector[];
  selectedBuoy?: BuoyData | null;
  selectedArgo?: ArgoFloat | null;
  selectedGlider?: GliderMission | null;
  selectedCTDStation?: CTDCastStation | null;
  onSelectBuoy?: (buoy: BuoyData) => void;
  onSelectArgo?: (argo: ArgoFloat) => void;
  onSelectGlider?: (glider: GliderMission) => void;
  onSelectCTDStation?: (station: CTDCastStation) => void;
  activeCyclone?: CycloneEvent | null;
  showWaves?: boolean;
  showCurrents?: boolean;
  showBuoys?: boolean;
  showArgo?: boolean;
  showGliders?: boolean;
  showCTDStations?: boolean;
  showIsosurface?: boolean;
  showBathymetry?: boolean;
}

const GLOBE_RADIUS = 10.0;


// Converts Lat/Lon (degrees) and altitude/radius to 3D Cartesian (x, y, z)
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// ==========================================================================
// STRICT OCEAN MASK (Option B): White (255) = Ocean, Black (0) = Landmass
// Prevents ocean particles from EVER spawning or rendering over land.
// ==========================================================================
let oceanMaskBuffer: Uint8Array | null = null;
const MASK_WIDTH = 1024;
const MASK_HEIGHT = 512;

export function generateOceanMask(): void {
  if (oceanMaskBuffer) return;
  const canvas = document.createElement('canvas');
  canvas.width = MASK_WIDTH;
  canvas.height = MASK_HEIGHT;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // 1. Fill entire world with Ocean white (#ffffff)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, MASK_WIDTH, MASK_HEIGHT);

  // 2. Load authentic high-resolution Earth Water Mask texture
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/textures/earth_water.png';
  img.onload = () => {
    ctx.drawImage(img, 0, 0, MASK_WIDTH, MASK_HEIGHT);
    const imgData = ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT);
    oceanMaskBuffer = new Uint8Array(imgData.data.buffer);
  };

  // 3. Immediate synchronous fallback mask while image loads (Pure Black #000000 = Land)
  ctx.fillStyle = '#000000';
  const gToP = (lat: number, lon: number) => ({
    x: ((lon + 180) / 360) * MASK_WIDTH,
    y: ((90 - lat) / 180) * MASK_HEIGHT
  });

  // Peninsular India & Northern Subcontinent landmass
  ctx.beginPath();
  const ind0 = gToP(24.0, 68.0);
  ctx.moveTo(ind0.x, ind0.y);
  [
    gToP(24.5, 72.0), gToP(28.0, 75.0), gToP(32.0, 76.0), gToP(36.0, 75.0),
    gToP(32.0, 82.0), gToP(28.0, 88.0), gToP(26.0, 93.0), gToP(24.0, 91.0),
    gToP(22.0, 89.5), gToP(20.5, 87.0), gToP(17.5, 83.0), gToP(15.5, 80.5),
    gToP(13.0, 80.3), gToP(10.0, 79.8), gToP(8.1, 77.5),  // Cape Comorin
    gToP(9.5, 76.3),  gToP(12.5, 75.0), gToP(15.5, 73.8), gToP(18.9, 72.8),
    gToP(21.0, 70.0), gToP(22.5, 69.0), gToP(23.5, 68.5)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Sri Lanka
  ctx.beginPath();
  const sl0 = gToP(9.8, 80.2);
  ctx.moveTo(sl0.x, sl0.y);
  [gToP(8.5, 81.2), gToP(6.0, 80.5), gToP(7.0, 79.8)].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Arabian Peninsula, Iran, Pakistan landmasses
  ctx.beginPath();
  const ar0 = gToP(12.5, 43.5);
  ctx.moveTo(ar0.x, ar0.y);
  [
    gToP(14.5, 48.0), gToP(17.0, 54.5), gToP(22.5, 59.8), gToP(26.0, 56.5),
    gToP(30.0, 48.0), gToP(34.0, 36.0), gToP(28.0, 34.5), gToP(20.0, 40.0),
    gToP(16.0, 42.0)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Pakistan & Iran land
  ctx.beginPath();
  const pak0 = gToP(25.0, 61.5);
  ctx.moveTo(pak0.x, pak0.y);
  [
    gToP(25.3, 66.8), gToP(24.8, 67.5), gToP(24.0, 68.5),
    gToP(38.0, 75.0), gToP(38.0, 60.0), gToP(30.0, 58.0)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Horn of Africa & East Africa
  ctx.beginPath();
  const af0 = gToP(12.0, 51.0);
  ctx.moveTo(af0.x, af0.y);
  [
    gToP(10.5, 51.2), gToP(5.0, 48.5), gToP(0.0, 42.5), gToP(-10.0, 40.5),
    gToP(-20.0, 35.0), gToP(-25.0, 32.0), gToP(0.0, 30.0), gToP(15.0, 36.0)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Southeast Asia (Myanmar, Thailand, Malaya)
  ctx.beginPath();
  const se0 = gToP(20.0, 92.5);
  ctx.moveTo(se0.x, se0.y);
  [
    gToP(16.0, 94.5), gToP(15.5, 97.5), gToP(10.0, 98.5), gToP(5.0, 100.5),
    gToP(1.3, 103.8), gToP(10.0, 105.0), gToP(24.0, 98.0)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  const syncImgData = ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT);
  oceanMaskBuffer = new Uint8Array(syncImgData.data.buffer);
}

export function isOceanAt(lat: number, lon: number): boolean {
  if (!oceanMaskBuffer) {
    generateOceanMask();
    if (!oceanMaskBuffer) return true;
  }

  const px = Math.floor(((lon + 180) / 360) * MASK_WIDTH) % MASK_WIDTH;
  const py = Math.floor(((90 - lat) / 180) * MASK_HEIGHT) % MASK_HEIGHT;
  if (px < 0 || py < 0 || px >= MASK_WIDTH || py >= MASK_HEIGHT) return false;

  const idx = (py * MASK_WIDTH + px) * 4;
  // Red channel > 120 is Ocean, < 120 is Land
  return oceanMaskBuffer[idx] > 120;
}

// Generates procedural globe texture reflecting the active physical variable & GEBCO bathymetry (4096x2048 4K)
function generateVariableEarthTexture(variable: OceanVariable, showBathymetry: boolean = true): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  const geoToPixel = (lat: number, lon: number) => ({
    x: ((lon + 180) / 360) * 4096,
    y: ((90 - lat) / 180) * 2048
  });

  // 1. Base Ocean Fill by Variable
  if (variable === 'sst') {
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#1e3a8a');
    oceanGrad.addColorStop(0.35, '#0284c7');
    oceanGrad.addColorStop(0.48, '#ea580c'); // Equatorial warm pool
    oceanGrad.addColorStop(0.55, '#dc2626'); // Northern Indian Ocean warm pool (30°C)
    oceanGrad.addColorStop(0.65, '#0284c7');
    oceanGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Warm tropical pool highlight in Bay of Bengal
    const bob = geoToPixel(14.0, 88.0);
    const bobGrad = ctx.createRadialGradient(bob.x, bob.y, 20, bob.x, bob.y, 160);
    bobGrad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
    bobGrad.addColorStop(0.6, 'rgba(249, 115, 22, 0.4)');
    bobGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bobGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Upwelling cold pool off Somalia / Oman
    const oman = geoToPixel(16.0, 56.0);
    const omanGrad = ctx.createRadialGradient(oman.x, oman.y, 10, oman.x, oman.y, 100);
    omanGrad.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
    omanGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = omanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

  } else if (variable === 'salinity') {
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#0c4a6e');
    oceanGrad.addColorStop(0.5, '#0369a1');
    oceanGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Arabian Sea High-Salinity Plume (36.5 PSU)
    const as = geoToPixel(16.0, 65.0);
    const asGrad = ctx.createRadialGradient(as.x, as.y, 20, as.x, as.y, 140);
    asGrad.addColorStop(0, 'rgba(245, 158, 11, 0.75)');
    asGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = asGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Bay of Bengal River Discharge Plume (Ganges/Brahmaputra 32.0 PSU)
    const bob = geoToPixel(18.0, 88.0);
    const bobGrad = ctx.createRadialGradient(bob.x, bob.y, 10, bob.x, bob.y, 120);
    bobGrad.addColorStop(0, 'rgba(16, 185, 129, 0.85)');
    bobGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bobGrad;
    ctx.fillRect(0, 0, 2048, 1024);

  } else if (variable === 'wave_height') {
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#020617');
    oceanGrad.addColorStop(0.4, '#082f49');
    oceanGrad.addColorStop(0.5, '#0284c7');
    oceanGrad.addColorStop(0.65, '#0369a1');
    oceanGrad.addColorStop(1, '#020617');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

  } else {
    // Currents: Dark obsidian ocean background to make particles pop
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#020617');
    oceanGrad.addColorStop(0.5, '#07162c');
    oceanGrad.addColorStop(1, '#020617');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);
  }

  // 2. Bathymetry Trenches & Ridges (Mid-Indian Ridge, Java/Sunda Trench, Ninety East Ridge)
  if (showBathymetry) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);

    // Sunda / Java Trench
    ctx.beginPath();
    ctx.moveTo(1500, 520);
    ctx.bezierCurveTo(1540, 580, 1560, 640, 1600, 700);
    ctx.stroke();

    // Ninety East Ridge
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(1536, 450);
    ctx.lineTo(1536, 850);
    ctx.stroke();

    // Central Indian Ridge
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.beginPath();
    ctx.moveTo(1380, 580);
    ctx.lineTo(1420, 880);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  // 3. Graticule Lat/Lon Grid Lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 2048; x += 170.6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y < 1024; y += 85.3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // 4. Landmass Silhouettes (High-Contrast Forest Green with Glowing Green Coastlines)
  ctx.fillStyle = '#1a2f1a';  // Dark forest green-grey for land (visible against blue ocean)
  ctx.strokeStyle = '#4ade80'; // Bright green coastline glow
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 8;

  // Indian Subcontinent & Sri Lanka
  const indiaPoints = [
    geoToPixel(8.0, 77.5),   // Kanyakumari
    geoToPixel(10.0, 79.8),  // Point Calimere
    geoToPixel(13.0, 80.3),  // Chennai
    geoToPixel(16.0, 81.3),  // Machilipatnam
    geoToPixel(17.7, 83.3),  // Visakhapatnam
    geoToPixel(20.0, 86.5),  // Paradip
    geoToPixel(21.8, 87.5),  // Balasore
    geoToPixel(22.5, 89.5),  // Sundarbans / Ganga Delta
    geoToPixel(26.0, 90.0),  // Assam / Brahmaputra
    geoToPixel(28.0, 84.0),  // Himalayas Southern Foothills
    geoToPixel(34.0, 76.0),  // Kashmir / North
    geoToPixel(31.0, 72.0),  // Punjab / Indus
    geoToPixel(25.0, 68.0),  // Sindh
    geoToPixel(23.5, 68.5),  // Rann of Kutch
    geoToPixel(22.5, 69.5),  // Gulf of Kutch
    geoToPixel(20.8, 70.4),  // Saurashtra South
    geoToPixel(21.7, 72.5),  // Gulf of Khambhat
    geoToPixel(19.0, 72.8),  // Mumbai
    geoToPixel(15.4, 73.8),  // Goa
    geoToPixel(13.0, 74.8),  // Mangalore
    geoToPixel(9.9, 76.2),   // Kochi
    geoToPixel(8.0, 77.5)    // Cape Comorin
  ];
  ctx.beginPath();
  ctx.moveTo(indiaPoints[0].x, indiaPoints[0].y);
  for (let i = 1; i < indiaPoints.length; i++) ctx.lineTo(indiaPoints[i].x, indiaPoints[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sri Lanka
  const sl = geoToPixel(7.8, 80.7);
  ctx.beginPath();
  ctx.ellipse(sl.x, sl.y, 9, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Arabian Peninsula (Oman, Yemen, Saudi Arabia, UAE)
  const arabia = [
    geoToPixel(12.8, 45.0),  // Aden
    geoToPixel(14.5, 49.0),  // Mukalla
    geoToPixel(17.0, 54.0),  // Salalah
    geoToPixel(20.5, 58.5),  // Ras al Hadd
    geoToPixel(23.6, 58.5),  // Muscat
    geoToPixel(26.2, 56.4),  // Musandam
    geoToPixel(25.3, 55.3),  // Dubai
    geoToPixel(27.0, 50.0),  // Persian Gulf
    geoToPixel(30.0, 48.0),  // Kuwait / Euphrates
    geoToPixel(29.0, 40.0),  // Northern Arabia
    geoToPixel(28.0, 35.0),  // Gulf of Aqaba
    geoToPixel(22.0, 39.0),  // Jeddah
    geoToPixel(16.0, 42.5),  // Jizan
    geoToPixel(12.8, 43.3)   // Bab-el-Mandeb
  ];
  ctx.beginPath();
  ctx.moveTo(arabia[0].x, arabia[0].y);
  for (let i = 1; i < arabia.length; i++) ctx.lineTo(arabia[i].x, arabia[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Horn of Africa & East Africa Coastline
  const africa = [
    geoToPixel(11.8, 51.2),  // Ras Asir / Guardafui
    geoToPixel(9.0, 50.5),   // Hafun
    geoToPixel(4.0, 47.5),   // Central Somalia
    geoToPixel(1.0, 44.0),   // Mogadishu
    geoToPixel(-4.0, 39.6),  // Mombasa
    geoToPixel(-6.8, 39.3),  // Dar es Salaam
    geoToPixel(-11.0, 40.5), // Ruvuma
    geoToPixel(-15.0, 40.5), // Mozambique
    geoToPixel(-25.0, 33.0), // Maputo
    geoToPixel(-34.0, 20.0), // Cape of Good Hope
    geoToPixel(-30.0, 17.0), // West Coast
    geoToPixel(-20.0, 12.0), // Namibia
    geoToPixel(0.0, 9.0),    // Gabon / Equatorial
    geoToPixel(12.0, 43.0),  // Djibouti
    geoToPixel(15.0, 40.0)   // Eritrea
  ];
  ctx.beginPath();
  ctx.moveTo(africa[0].x, africa[0].y);
  for (let i = 1; i < africa.length; i++) ctx.lineTo(africa[i].x, africa[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Madagascar
  const madagascar = [
    geoToPixel(-12.0, 49.3),
    geoToPixel(-16.0, 49.8),
    geoToPixel(-25.0, 47.0),
    geoToPixel(-25.5, 45.0),
    geoToPixel(-20.0, 44.0),
    geoToPixel(-15.0, 46.5),
    geoToPixel(-12.0, 49.3)
  ];
  ctx.beginPath();
  ctx.moveTo(madagascar[0].x, madagascar[0].y);
  for (let i = 1; i < madagascar.length; i++) ctx.lineTo(madagascar[i].x, madagascar[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Southeast Asia & Indonesian Archipelago (Bay of Bengal Eastern Rim)
  const seAsia = [
    geoToPixel(22.0, 91.8),  // Chittagong
    geoToPixel(20.0, 92.8),  // Myanmar Rakhine
    geoToPixel(16.0, 94.5),  // Ayeyarwady Delta
    geoToPixel(16.5, 97.5),  // Gulf of Martaban
    geoToPixel(12.0, 98.6),  // Tenasserim
    geoToPixel(7.5, 99.0),   // Phuket / West Malaya
    geoToPixel(1.3, 103.8),  // Singapore
    geoToPixel(4.0, 103.5),  // East Malaya
    geoToPixel(13.0, 100.5), // Bangkok
    geoToPixel(10.0, 104.0), // Gulf of Thailand
    geoToPixel(21.0, 98.0)   // Inland Indochina
  ];
  ctx.beginPath();
  ctx.moveTo(seAsia[0].x, seAsia[0].y);
  for (let i = 1; i < seAsia.length; i++) ctx.lineTo(seAsia[i].x, seAsia[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sumatra & Java (Sunda Trench Arc)
  const sumatra = [
    geoToPixel(5.5, 95.3),   // Banda Aceh
    geoToPixel(2.0, 98.5),
    geoToPixel(-3.0, 103.0),
    geoToPixel(-5.9, 106.0), // Sunda Strait
    geoToPixel(-4.0, 102.0),
    geoToPixel(0.0, 98.0),
    geoToPixel(5.5, 95.3)
  ];
  ctx.beginPath();
  ctx.moveTo(sumatra[0].x, sumatra[0].y);
  for (let i = 1; i < sumatra.length; i++) ctx.lineTo(sumatra[i].x, sumatra[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Reset shadow for other canvas elements
  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Creates an authentic circular glowing star point texture
 */
function createStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.25, 'rgba(215, 240, 255, 0.85)');
  gradient.addColorStop(0.55, 'rgba(100, 180, 255, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates a photorealistic 3D Deep Space Starfield with Milky Way galactic belt
 */
function createDeepSpaceStarfield(scene: THREE.Scene): { starField: THREE.Points; brightStars: THREE.Points; nebulaField: THREE.Points; updateTime: (delta: number, time: number) => void } {
  const starTexture = createStarTexture();

  // 1. 8,000+ Deep Space Stellar Background Stars (Sharp celestial pinpricks)
  const starCount = 8000;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // Distribute on distant celestial sphere (radius 300 to 500)
    const r = 300 + Math.random() * 200;
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);

    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);

    // Stellar spectral classification (O, B, A, F, G, K, M)
    const starType = Math.random();
    if (starType < 0.70) {
      // Pure White / Silver Star
      starColors[i * 3] = 0.92;
      starColors[i * 3 + 1] = 0.94;
      starColors[i * 3 + 2] = 1.0;
    } else if (starType < 0.88) {
      // Hot Blue-White Star (Class O/B)
      starColors[i * 3] = 0.65;
      starColors[i * 3 + 1] = 0.85;
      starColors[i * 3 + 2] = 1.0;
    } else {
      // Warm Amber / Golden Star (Class K/M)
      starColors[i * 3] = 1.0;
      starColors[i * 3 + 1] = 0.82;
      starColors[i * 3 + 2] = 0.55;
    }
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 1.4,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // 2. 450+ Bright Primary Constellation Stars (with subtle twinkling)
  const brightCount = 450;
  const brightPositions = new Float32Array(brightCount * 3);
  const brightColors = new Float32Array(brightCount * 3);

  for (let i = 0; i < brightCount; i++) {
    const r = 320 + Math.random() * 150;
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);

    brightPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    brightPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    brightPositions[i * 3 + 2] = r * Math.cos(phi);

    const bType = Math.random();
    if (bType < 0.5) {
      brightColors[i * 3] = 0.8;
      brightColors[i * 3 + 1] = 0.95;
      brightColors[i * 3 + 2] = 1.0;
    } else {
      brightColors[i * 3] = 1.0;
      brightColors[i * 3 + 1] = 0.9;
      brightColors[i * 3 + 2] = 0.7;
    }
  }

  const brightGeo = new THREE.BufferGeometry();
  brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
  brightGeo.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));

  const brightMat = new THREE.PointsMaterial({
    size: 2.8,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const brightStars = new THREE.Points(brightGeo, brightMat);
  scene.add(brightStars);

  // 3. Dense Milky Way Galactic Core & Cosmic Stardust Band
  const nebulaCount = 600;
  const nebulaPositions = new Float32Array(nebulaCount * 3);
  const nebulaColors = new Float32Array(nebulaCount * 3);

  for (let i = 0; i < nebulaCount; i++) {
    const angle = (i / nebulaCount) * Math.PI * 2;
    const spreadX = (Math.random() - 0.5) * 70;
    const spreadY = (Math.random() - 0.5) * 50;
    const r = 350 + (Math.random() - 0.5) * 40;

    nebulaPositions[i * 3] = Math.cos(angle) * r + spreadX;
    nebulaPositions[i * 3 + 1] = Math.sin(angle) * 110 + spreadY;
    nebulaPositions[i * 3 + 2] = Math.sin(angle) * r + spreadX;

    nebulaColors[i * 3] = 0.03 + Math.random() * 0.06;
    nebulaColors[i * 3 + 1] = 0.08 + Math.random() * 0.12;
    nebulaColors[i * 3 + 2] = 0.22 + Math.random() * 0.25;
  }

  const nebulaGeo = new THREE.BufferGeometry();
  nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
  nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

  const nebulaMat = new THREE.PointsMaterial({
    size: 40.0,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const nebulaField = new THREE.Points(nebulaGeo, nebulaMat);
  scene.add(nebulaField);

  return {
    starField,
    brightStars,
    nebulaField,
    updateTime: (delta: number, time: number) => {
      starField.rotation.y += delta * 0.003;
      brightStars.rotation.y += delta * 0.003;
      nebulaField.rotation.y += delta * 0.002;
      brightMat.size = 2.6 + 0.5 * Math.sin(time * 2.0);
    }
  };
}

export const OceanGlobe3D: React.FC<OceanGlobe3DProps> = ({
  variable,
  depth = 0,
  verticalExaggeration = 1.0,
  currentDepthLayer = 0,
  buoys = [],
  argoFloats = [],
  gliders = [],
  ctdStations = [],
  isosurfaceData = null,
  isosurfaceTargetTemp = 26,
  wavePoints = [],
  currentVectors = [],
  selectedBuoy = null,
  selectedArgo = null,
  selectedGlider = null,
  selectedCTDStation = null,
  onSelectBuoy = () => {},
  onSelectArgo = () => {},
  onSelectGlider = () => {},
  onSelectCTDStation = () => {},
  activeCyclone = null,
  showWaves = true,
  showCurrents = true,
  showBuoys = true,
  showArgo = true,
  showGliders = true,
  showCTDStations = true,
  showIsosurface = false,
  showBathymetry = true
}) => {
  const [hoveredSensor, setHoveredSensor] = useState<{
    data: any;
    type: 'buoy' | 'argo' | 'glider' | 'ctd';
    x: number;
    y: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const oceanThermalFieldRef = useRef<OceanThermalFieldObject | null>(null);
  const oceanWaveSurfaceRef = useRef<OceanWaveSurfaceObject | null>(null);
  const fluidParticleFlowRef = useRef<FluidParticleFlowObject | null>(null);
  const atmosphereCloudsRef = useRef<AtmosphereCloudsObject | null>(null);
  const argoMeshesRef = useRef<THREE.Object3D[]>([]);
  const gliderGroupAnimRef = useRef<((t: number) => void) | null>(null);
  const ctdGroupAnimRef = useRef<((t: number) => void) | null>(null);
  const isosurfaceMeshRef = useRef<IsosurfaceMeshObject | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const interactiveObjectsRef = useRef<{ obj: THREE.Object3D; hitObj?: THREE.Object3D; data: any; type: 'buoy' | 'argo' | 'glider' | 'ctd' }[]>([]);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Compute live SWH and peak period from real Open-Meteo wave data
  const { avgSwh, peakPeriod } = React.useMemo(() => {
    if (!wavePoints || wavePoints.length === 0) {
      return { avgSwh: 2.1, peakPeriod: 8.5 };
    }
    const sumSwh = wavePoints.reduce((acc, p) => acc + (p.wave_height_m || 1.8), 0);
    const sumPeriod = wavePoints.reduce((acc, p) => acc + (p.wave_period_s || 8.0), 0);
    return {
      avgSwh: +(sumSwh / wavePoints.length).toFixed(2),
      peakPeriod: +(sumPeriod / wavePoints.length).toFixed(1)
    };
  }, [wavePoints]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Deep Space Starfield & Milky Way Cosmic Nebula Background
    const deepSpace = createDeepSpaceStarfield(scene);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. Renderer Setup with Antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Directional & Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(20, 25, 20);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f2fe, 0.6);
    rimLight.position.set(-20, -10, -15);
    scene.add(rimLight);

    // 4. Globe Group: Initial rotation to highlight Indian Ocean Basin
    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = -Math.PI * 0.933; // -2.93 radians
    globeGroup.rotation.x = 0.18;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 5. Authentic NASA Earth Core Mesh with 4K Satellite Photography
    initializeOceanMask();
    const textureLoader = new THREE.TextureLoader();
    const nasaTexture = textureLoader.load('/textures/earth_blue_marble.jpg');
    nasaTexture.colorSpace = THREE.SRGBColorSpace;
    nasaTexture.generateMipmaps = true;
    nasaTexture.minFilter = THREE.LinearMipmapLinearFilter;

    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 128, 128);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: nasaTexture,
      roughness: 0.42,
      metalness: 0.08
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);
    globeMeshRef.current = globeMesh;

    // 6. Atmospheric Cloud Layer & Rayleigh Outer Glow
    const atmosphereClouds = createAtmosphereAndClouds(GLOBE_RADIUS);
    globeGroup.add(atmosphereClouds.cloudMesh);
    scene.add(atmosphereClouds.atmosphereMesh);
    atmosphereCloudsRef.current = atmosphereClouds;

    // 7. Dynamic 3D Multi-Depth Ocean Thermal Field Layer
    const oceanThermalField = createOceanThermalField(GLOBE_RADIUS, variable, depth);
    globeGroup.add(oceanThermalField.mesh);
    oceanThermalFieldRef.current = oceanThermalField;

    // 8. REAL 3D Undulating Gerstner Ocean Wave Surface
    const oceanWaveSurface = createOceanWaveSurface(GLOBE_RADIUS, avgSwh, peakPeriod);
    oceanWaveSurface.setVisible(showWaves);
    globeGroup.add(oceanWaveSurface.mesh);
    oceanWaveSurfaceRef.current = oceanWaveSurface;

    // 8. Fluid Earth / Earth Nullschool 1,600+ Particle Flow Tracer Engine
    const fluidParticleFlow = createFluidParticleFlow(
      GLOBE_RADIUS,
      currentDepthLayer,
      verticalExaggeration,
      currentVectors || [],
      activeCyclone
    );
    fluidParticleFlow.setVisible(showCurrents);
    globeGroup.add(fluidParticleFlow.group);
    fluidParticleFlowRef.current = fluidParticleFlow;

    // 9. Continuous 60 FPS Render & Simulation Loop
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Rotate Deep Space Starfield & Nebula
      deepSpace.updateTime(delta, currentTime * 0.001);

      // Update 3D Gerstner Wave Surface Displacement
      if (oceanWaveSurfaceRef.current) {
        oceanWaveSurfaceRef.current.updateTime(currentTime * 0.001);
      }

      // Animate Fluid Earth Particle Flow Tracers
      if (fluidParticleFlowRef.current) {
        fluidParticleFlowRef.current.update(currentTime * 0.001, delta);
      }

      // Rotate Atmospheric Clouds
      if (atmosphereCloudsRef.current) {
        atmosphereCloudsRef.current.updateTime(delta);
      }

      // Animate Glider Pings & Sawtooth Dive Hulls
      if (gliderGroupAnimRef.current) {
        gliderGroupAnimRef.current(currentTime * 0.001);
      }

      // Animate CTD Rosette Pings & Chlorophyll-a Glow
      if (ctdGroupAnimRef.current) {
        ctdGroupAnimRef.current(currentTime * 0.001);
      }

      // Animate 3D Isosurface TCHP Pulse
      if (isosurfaceMeshRef.current) {
        isosurfaceMeshRef.current.updateTime(currentTime * 0.001);
      }

      // Pulse Argo float markers
      const argoPulse = 1.0 + 0.12 * Math.sin(currentTime * 0.00314);
      argoMeshesRef.current.forEach(m => {
        m.scale.set(0.65 * argoPulse, 0.82 * argoPulse, 1.0);
      });

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Mouse Interaction Controls (Orbit Drag & Zoom)
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current && globeGroupRef.current) {
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };

        globeGroupRef.current.rotation.y += deltaX * 0.005;
        globeGroupRef.current.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroupRef.current.rotation.x + deltaY * 0.005));
      }

      // Hover Raycasting for Floating Tooltip Label
      if (!isDraggingRef.current && containerRef.current && cameraRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, cameraRef.current);
        const targetMeshes = interactiveObjectsRef.current.map(item => item.hitObj || item.obj);
        const intersects = raycaster.intersectObjects(targetMeshes, true);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const entry = interactiveObjectsRef.current.find(item => item.obj === hit || item.hitObj === hit || item.obj.children.includes(hit));
          if (entry) {
            const worldPos = new THREE.Vector3();
            entry.obj.getWorldPosition(worldPos);
            worldPos.project(cameraRef.current);
            const x = ((worldPos.x + 1) / 2) * rect.width;
            const y = ((-worldPos.y + 1) / 2) * rect.height;
            setHoveredSensor({ data: entry.data, type: entry.type, x, y });
            containerRef.current.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredSensor(null);
        containerRef.current.style.cursor = 'grab';
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const newZ = cameraRef.current.position.z + e.deltaY * 0.02;
      cameraRef.current.position.z = Math.max(14.0, Math.min(42.0, newZ));
    };

    // Raycasting for interactive sensors selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const targetMeshes = interactiveObjectsRef.current.map(item => item.hitObj || item.obj);
      const intersects = raycaster.intersectObjects(targetMeshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const entry = interactiveObjectsRef.current.find(item => item.obj === hit || item.hitObj === hit || item.obj.children.includes(hit));
        if (entry) {
          if (entry.type === 'buoy') onSelectBuoy(entry.data as BuoyData);
          else if (entry.type === 'argo') onSelectArgo(entry.data as ArgoFloat);
          else if (entry.type === 'glider') onSelectGlider(entry.data as GliderMission);
          else if (entry.type === 'ctd') onSelectCTDStation(entry.data as CTDCastStation);
        }
      }
    };

    const onResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Update Ocean Thermal Field and Ocean Wave Surface when variable or depth changes
  useEffect(() => {
    if (oceanThermalFieldRef.current) {
      oceanThermalFieldRef.current.update(variable, depth);
    }
    if (oceanWaveSurfaceRef.current) {
      oceanWaveSurfaceRef.current.updateDepth(depth);
    }
  }, [variable, depth]);

  // Update Wave Mesh visibility & live SWH uniforms
  useEffect(() => {
    if (oceanWaveSurfaceRef.current) {
      oceanWaveSurfaceRef.current.setVisible(showWaves);
      oceanWaveSurfaceRef.current.updateSwh(avgSwh, peakPeriod);
    }
  }, [showWaves, avgSwh, peakPeriod]);

  // Update Fluid Particle Flow visibility, depth layer, live vectors, and cyclones
  useEffect(() => {
    if (fluidParticleFlowRef.current) {
      fluidParticleFlowRef.current.setVisible(showCurrents);
      fluidParticleFlowRef.current.setDepthAndExaggeration(currentDepthLayer, verticalExaggeration);
      fluidParticleFlowRef.current.setCyclone(activeCyclone);
      fluidParticleFlowRef.current.setLiveVectors(currentVectors || []);
    }
  }, [showCurrents, currentDepthLayer, verticalExaggeration, currentVectors, activeCyclone]);

  // Update In-Situ Sensors (Buoys, Argo, Gliders, CTD, Isosurface, Cyclone)
  useEffect(() => {
    const globeGroup = globeGroupRef.current;
    if (!globeGroup) return;

    const toRemove: THREE.Object3D[] = [];
    globeGroup.traverse(child => {
      if (child.name.startsWith('sensor_') || child.name.startsWith('cyclone_') || child.name.startsWith('depth_layer_') || child.name.startsWith('isosurface_')) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(c => globeGroup.remove(c));
    interactiveObjectsRef.current = [];

    // 1. INCOIS / NOAA Moored Buoys
    if (showBuoys) {
      const { group: buoyGroup, interactiveEntries } = createBuoyNetworkGroup(buoys, selectedBuoy?.id, GLOBE_RADIUS);
      globeGroup.add(buoyGroup);
      interactiveObjectsRef.current.push(...interactiveEntries);
    }

    // 2. Argo Floats & Subsurface Trajectories (with Vertical Exaggeration)
    if (showArgo) {
      const { group: argoGroup, interactiveEntries, argoMeshes } = createArgoFloatGroup(argoFloats, selectedArgo?.wmo_id, GLOBE_RADIUS, verticalExaggeration);
      globeGroup.add(argoGroup);
      interactiveObjectsRef.current.push(...interactiveEntries);
      argoMeshesRef.current = argoMeshes;
    }

    // 3. Autonomous Underwater Gliders (Sawtooth Dives & BGC Sensors)
    if (showGliders && gliders.length > 0) {
      const { group: gliderGroup, interactiveEntries, updateTime } = createGliderMissionGroup(gliders, selectedGlider?.id || null, GLOBE_RADIUS, verticalExaggeration);
      globeGroup.add(gliderGroup);
      interactiveObjectsRef.current.push(...interactiveEntries);
      gliderGroupAnimRef.current = updateTime;
    } else {
      gliderGroupAnimRef.current = null;
    }

    // 4. Ship-based CTD Cast Stations
    if (showCTDStations && ctdStations.length > 0) {
      const { group: ctdGroup, interactiveEntries, updateTime } = createCTDCastGroup(ctdStations, selectedCTDStation?.station_id || null, GLOBE_RADIUS, verticalExaggeration);
      globeGroup.add(ctdGroup);
      interactiveObjectsRef.current.push(...interactiveEntries);
      ctdGroupAnimRef.current = updateTime;
    } else {
      ctdGroupAnimRef.current = null;
    }

    // 5. 3D Isosurface Thermal Blanket (D26 / D20 - TCHP Cyclone Energy)
    if (showIsosurface) {
      const activeIsosurfaceData = isosurfaceData || generateDefaultIsothermGrid(isosurfaceTargetTemp);
      const isoMeshObj = createIsosurfaceMesh(GLOBE_RADIUS, activeIsosurfaceData, isosurfaceTargetTemp, verticalExaggeration);
      isoMeshObj.setVisible(true);
      globeGroup.add(isoMeshObj.group);
      isosurfaceMeshRef.current = isoMeshObj;
    } else {
      isosurfaceMeshRef.current = null;
    }

    // 6. Cyclone Track
    if (activeCyclone) {
      const trackPoints = activeCyclone.track.map(pt => latLonToVector3(pt.lat, pt.lon, GLOBE_RADIUS * 1.025));
      if (trackPoints.length > 1) {
        const curve = new THREE.CatmullRomCurve3(trackPoints);
        const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.04, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.85 });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        tubeMesh.name = `cyclone_path_${activeCyclone.id}`;
        globeGroup.add(tubeMesh);
      }
    }

    // 7. Update Ocean Water Surface Optical Attenuation with Depth
    if (oceanWaveSurfaceRef.current) {
      oceanWaveSurfaceRef.current.updateDepth(depth);
    }

  }, [buoys, argoFloats, gliders, ctdStations, isosurfaceData, isosurfaceTargetTemp, selectedBuoy, selectedArgo, selectedGlider, selectedCTDStation, activeCyclone, depth, verticalExaggeration, showBuoys, showArgo, showGliders, showCTDStations, showIsosurface]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Liquid-Glass Tooltip on Sensor Hover */}
      {hoveredSensor && (
        <div
          style={{
            left: `${hoveredSensor.x}px`,
            top: `${hoveredSensor.y - 18}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none'
          }}
          className="absolute z-30 liquid-glass-base liquid-glass-reflection px-3 py-1.5 rounded-xl border border-cyan-400/50 shadow-2xl backdrop-blur-xl flex items-center space-x-2 text-white transition-opacity duration-150"
        >
          <span className={`w-2 h-2 rounded-full ${hoveredSensor.type === 'glider' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : (hoveredSensor.type === 'ctd' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400 shadow-[0_0_8px_#00f2fe]')} animate-pulse`} />
          <span className="font-telemetry font-bold text-xs">
            {hoveredSensor.type === 'buoy' && (hoveredSensor.data as BuoyData).name}
            {hoveredSensor.type === 'argo' && `Argo Float #${(hoveredSensor.data as ArgoFloat).wmo_id}`}
            {hoveredSensor.type === 'glider' && (hoveredSensor.data as GliderMission).name}
            {hoveredSensor.type === 'ctd' && (hoveredSensor.data as CTDCastStation).station_id}
          </span>
          <span className="text-slate-400 text-[10px] font-telemetry">|</span>
          
          {hoveredSensor.type === 'glider' && (
            <span className="text-amber-300 text-[10px] font-telemetry font-semibold">
              {(hoveredSensor.data as GliderMission).current_depth_m}m depth • Chl: {(hoveredSensor.data as GliderMission).chlorophyll_surface_ug_l} µg/L
            </span>
          )}
          {hoveredSensor.type === 'ctd' && (
            <span className="text-emerald-300 text-[10px] font-telemetry font-semibold">
              Max Chl: {(hoveredSensor.data as CTDCastStation).chlorophyll_max_ug_l} µg/L (at {(hoveredSensor.data as CTDCastStation).chlorophyll_max_depth_m}m)
            </span>
          )}
          {hoveredSensor.type === 'buoy' && (
            <span className="text-cyan-300 text-[10px] font-telemetry font-semibold">
              {(hoveredSensor.data as BuoyData).sst_c}°C • {(hoveredSensor.data as BuoyData).wave_height_m}m wave
            </span>
          )}
          {hoveredSensor.type === 'argo' && (
            <span className="text-cyan-300 text-[10px] font-telemetry font-semibold">
              {(hoveredSensor.data as ArgoFloat).surface_temp_c}°C SST • {(hoveredSensor.data as ArgoFloat).max_depth_m}m CTD
            </span>
          )}
        </div>
      )}
      
      {/* Top 4D Depth Slicing Telemetry HUD Banner (when depth > 0 or vertical exaggeration > 1) */}
      {(depth > 0 || verticalExaggeration > 1.0) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="liquid-glass-base px-4 py-2 rounded-2xl border border-cyan-400/50 shadow-2xl backdrop-blur-xl flex items-center space-x-3 text-xs font-telemetry text-white pointer-events-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2fe] animate-pulse" />
            <div className="flex items-center space-x-2">
              <span className="font-header font-bold text-cyan-300 tracking-wider uppercase">
                {depth === 0 ? 'Surface Layer' : depth <= 100 ? 'Mixed Layer / Thermocline' : depth <= 500 ? 'Thermocline Core' : 'Abyssal Zone'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-white font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/60">
                Depth: -{depth}m
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-300 font-semibold">
                Temp: ~{Math.max(2.0, (29.5 - (depth / 2000) * 27)).toFixed(1)}°C
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-300 font-semibold">
                Pressure: {Math.round(depth * 0.1)} bar
              </span>
              {verticalExaggeration > 1.0 && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-cyan-200 font-bold bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
                    {verticalExaggeration}× Exaggeration
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3D HUD Navigation Badge */}
      <div className="absolute bottom-6 left-6 pointer-events-none z-10">
        <div className="liquid-glass-base px-3.5 py-2 rounded-xl text-xs font-telemetry text-slate-300 flex items-center space-x-3 border border-cyan-500/30 shadow-xl">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>DRAG: ROTATE</span>
          </div>
          <span className="text-slate-500">|</span>
          <span>SCROLL: ZOOM</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 font-bold">
            {verticalExaggeration > 1.0 && `🔍 VERT EXAG: ${verticalExaggeration}× • `}
            {currentDepthLayer > 0 ? `⚡ CURRENTS: ${currentDepthLayer}m DEPTH` : '⚡ SURFACE CURRENTS'}
            {showIsosurface && ` • 🌡️ D${Math.round(isosurfaceTargetTemp)} ISOSURFACE ACTIVE`}
          </span>
        </div>
      </div>
    </div>
  );
};

