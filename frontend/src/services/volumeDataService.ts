/**
 * AquaTwin 3D - Volume Data Service
 * Generates realistic oceanographic data for any (lat, lon, depth) point
 * using parametric ocean models calibrated to Indian Ocean characteristics.
 *
 * Data Sources & Models:
 * - Temperature: Depth-stratified thermal profile with regional anomalies
 * - Salinity: Arabian Sea high-sal (~36.5 PSU), Bay of Bengal low-sal (~32 PSU)
 * - Currents: Depth-dependent decay with regional gyre patterns
 * - Chlorophyll: Deep Chlorophyll Maximum (DCM) at ~50-80m
 * - Density: Simplified UNESCO equation of state
 * - Oxygen: Oxygen Minimum Zone at 200-800m in Arabian Sea
 */

import type { VolumeRegion, VolumeProbeData, VolumeVariable } from '../types/ocean';

// ============================================================
// Preset Ocean Regions
// ============================================================
export const VOLUME_REGIONS: VolumeRegion[] = [
  {
    id: 'bay_of_bengal',
    name: 'Bay of Bengal',
    description: 'Low-salinity basin fed by Ganges-Brahmaputra discharge. Strong seasonal thermocline and East India Coastal Current (EICC).',
    bounds: { latMin: 5, latMax: 22, lonMin: 78, lonMax: 95, depthMin: 0, depthMax: 2000 },
    color: '#06b6d4'
  },
  {
    id: 'arabian_sea',
    name: 'Arabian Sea',
    description: 'High-salinity basin with intense monsoon upwelling, Arabian Sea Water (ASW), and deep Oxygen Minimum Zone (OMZ).',
    bounds: { latMin: 5, latMax: 25, lonMin: 50, lonMax: 78, depthMin: 0, depthMax: 2000 },
    color: '#f59e0b'
  },
  {
    id: 'equatorial_io',
    name: 'Equatorial Indian Ocean',
    description: 'Wyrtki Jet corridor, IOD signal region, and equatorial upwelling/downwelling belt.',
    bounds: { latMin: -10, latMax: 5, lonMin: 50, lonMax: 100, depthMin: 0, depthMax: 2000 },
    color: '#10b981'
  },
  {
    id: 'full_indian_ocean',
    name: 'Full Indian Ocean',
    description: 'Complete Indian Ocean basin from Southern Ocean to Arabian Sea, including all major gyres and current systems.',
    bounds: { latMin: -30, latMax: 30, lonMin: 30, lonMax: 120, depthMin: 0, depthMax: 2000 },
    color: '#8b5cf6'
  }
];

// ============================================================
// Parametric Ocean Models
// ============================================================

/**
 * Temperature model: exponential decay with depth + regional anomalies
 * Surface ~29.5°C (tropical), ~2.4°C at 2000m (abyssal)
 */
function computeTemperature(lat: number, lon: number, depth: number): number {
  // Base surface temperature (latitude-dependent)
  const latFactor = Math.cos((lat / 90) * (Math.PI / 2));
  const baseSurface = 20 + 10 * latFactor; // ~30°C at equator, ~20°C at 30°

  // Regional warm/cold anomalies
  let anomaly = 0;
  // Bay of Bengal warm pool
  const bobDist = Math.sqrt((lat - 14) ** 2 + (lon - 88) ** 2);
  if (bobDist < 12) anomaly += 1.5 * Math.exp(-bobDist / 6);
  // Somalia upwelling cold pool
  const somDist = Math.sqrt((lat - 10) ** 2 + (lon - 52) ** 2);
  if (somDist < 10) anomaly -= 3.0 * Math.exp(-somDist / 5);
  // Arabian Sea warm
  const asDist = Math.sqrt((lat - 20) ** 2 + (lon - 65) ** 2);
  if (asDist < 15) anomaly += 0.8 * Math.exp(-asDist / 8);

  // Depth decay: mixed layer (0-50m), thermocline (50-500m), deep (500-2000m)
  let temp: number;
  if (depth <= 50) {
    temp = baseSurface + anomaly - (depth / 50) * 1.5;
  } else if (depth <= 500) {
    const surfaceTemp = baseSurface + anomaly - 1.5;
    const thermoclineDecay = ((depth - 50) / 450);
    temp = surfaceTemp - thermoclineDecay * (surfaceTemp - 8.0);
  } else {
    const deepDecay = ((depth - 500) / 1500);
    temp = 8.0 - deepDecay * 5.6;
  }

  return Math.max(1.8, Math.min(32.0, temp));
}

/**
 * Salinity model: regional variation + depth profile
 * Arabian Sea ~36.5 PSU, Bay of Bengal ~32 PSU (river discharge)
 */
function computeSalinity(lat: number, lon: number, depth: number): number {
  // Base salinity
  let baseSal = 34.8;

  // Arabian Sea high salinity (evaporation-dominated)
  const asDist = Math.sqrt((lat - 18) ** 2 + (lon - 62) ** 2);
  if (asDist < 20) baseSal += 1.7 * Math.exp(-asDist / 10);

  // Bay of Bengal low salinity (river discharge)
  const bobDist = Math.sqrt((lat - 18) ** 2 + (lon - 88) ** 2);
  if (bobDist < 15) baseSal -= 2.8 * Math.exp(-bobDist / 8);

  // Ganges-Brahmaputra river mouth extreme freshening
  const gangDist = Math.sqrt((lat - 22) ** 2 + (lon - 89) ** 2);
  if (gangDist < 5 && depth < 30) baseSal -= 3.5 * Math.exp(-gangDist / 3);

  // Depth profile: surface variability, deep convergence to ~34.9
  if (depth <= 100) {
    // Surface layer retains regional character
    return Math.max(30.0, Math.min(37.5, baseSal));
  } else if (depth <= 500) {
    const blend = (depth - 100) / 400;
    return baseSal + blend * (34.9 - baseSal);
  } else {
    // Deep water converges
    return 34.85 + 0.05 * Math.sin(depth / 500);
  }
}

/**
 * Current speed model: surface-intensified, exponential depth decay
 */
function computeCurrentSpeed(lat: number, lon: number, depth: number): number {
  // Surface current speed (latitude/region dependent)
  let surfaceSpeed = 0.3;

  // Somali Current jet (fast)
  const somDist = Math.sqrt((lat - 8) ** 2 + (lon - 50) ** 2);
  if (somDist < 10) surfaceSpeed += 1.2 * Math.exp(-somDist / 5);

  // East India Coastal Current
  const eiccDist = Math.sqrt((lat - 15) ** 2 + (lon - 82) ** 2);
  if (eiccDist < 8) surfaceSpeed += 0.5 * Math.exp(-eiccDist / 4);

  // Equatorial Jet
  if (Math.abs(lat) < 3) surfaceSpeed += 0.8 * Math.exp(-Math.abs(lat));

  // Depth decay
  const depthFactor = Math.exp(-depth / 300);
  return Math.max(0.01, surfaceSpeed * depthFactor);
}

/**
 * Current direction model (degrees, 0=N)
 */
function computeCurrentDir(lat: number, lon: number, depth: number): number {
  // Simplified gyre patterns
  if (lat > 10 && lon < 78) {
    // Arabian Sea clockwise gyre (SW monsoon)
    return (180 + (lon - 60) * 3 + depth * 0.01) % 360;
  } else if (lat > 5 && lon >= 78) {
    // Bay of Bengal cyclonic (counterclockwise)
    return (270 + (lat - 15) * 5) % 360;
  }
  // Equatorial: eastward
  return (90 + lat * 2) % 360;
}

/**
 * Chlorophyll-a model: Deep Chlorophyll Maximum (DCM) at ~50-80m
 */
function computeChlorophyll(lat: number, lon: number, depth: number): number {
  // DCM Gaussian peak
  const dcmDepth = 65; // meters
  const dcmWidth = 30;
  const dcmPeak = Math.exp(-((depth - dcmDepth) ** 2) / (2 * dcmWidth ** 2));

  // Surface chlorophyll
  let surfaceChl = 0.3;

  // Upwelling regions have higher chlorophyll
  const somDist = Math.sqrt((lat - 10) ** 2 + (lon - 52) ** 2);
  if (somDist < 10) surfaceChl += 2.0 * Math.exp(-somDist / 5);

  // Coastal productivity
  if (lon > 78 && lon < 85 && lat > 12 && lat < 20) surfaceChl += 0.8;

  // Depth profile
  if (depth <= 20) {
    return surfaceChl;
  } else if (depth <= 120) {
    return surfaceChl * 0.5 + dcmPeak * 2.5;
  }
  // Below DCM, rapid decrease
  return Math.max(0.0, 0.02 * Math.exp(-(depth - 120) / 200));
}

/**
 * Dissolved Oxygen model: Oxygen Minimum Zone (OMZ) at 200-800m
 */
function computeOxygen(lat: number, lon: number, depth: number): number {
  // Surface saturated
  if (depth <= 50) return 200 + 20 * Math.cos((lat / 30) * Math.PI);

  // OMZ core (Arabian Sea has the world's thickest OMZ)
  const omzDepth = 400;
  const omzWidth = 200;
  const omzIntensity = Math.exp(-((depth - omzDepth) ** 2) / (2 * omzWidth ** 2));

  let baseOxygen = 180 - omzIntensity * 170;

  // Arabian Sea OMZ is more intense
  const asDist = Math.sqrt((lat - 15) ** 2 + (lon - 65) ** 2);
  if (asDist < 20) baseOxygen -= omzIntensity * 40 * Math.exp(-asDist / 12);

  // Deep water re-oxygenation
  if (depth > 800) {
    baseOxygen += ((depth - 800) / 1200) * 60;
  }

  return Math.max(5, Math.min(230, baseOxygen));
}

/**
 * Density model: simplified UNESCO equation of state
 * σ = 999.842594 + coefficients of T and S
 */
function computeDensity(temp: number, sal: number): number {
  // Simplified: ρ ≈ 1000 + 0.8 * (S - 35) - 0.2 * (T - 10)
  const rho = 1000 + 0.8 * (sal - 35) - 0.17 * (temp - 10) + 0.003 * (temp - 10) ** 2;
  return Math.max(1020, Math.min(1030, rho));
}

// ============================================================
// Public API
// ============================================================

/**
 * Compute all oceanographic variables at a given (lat, lon, depth) point
 */
export function probeVolumePoint(lat: number, lon: number, depth: number): VolumeProbeData {
  const temp = computeTemperature(lat, lon, depth);
  const sal = computeSalinity(lat, lon, depth);
  const currSpeed = computeCurrentSpeed(lat, lon, depth);
  const currDir = computeCurrentDir(lat, lon, depth);
  const chl = computeChlorophyll(lat, lon, depth);
  const o2 = computeOxygen(lat, lon, depth);
  const density = computeDensity(temp, sal);
  const pressure = depth * 0.1; // 1 bar per 10m

  return {
    lat,
    lon,
    depth_m: depth,
    temperature_c: +temp.toFixed(2),
    salinity_psu: +sal.toFixed(2),
    current_speed_ms: +currSpeed.toFixed(3),
    current_dir_deg: +currDir.toFixed(0),
    chlorophyll_ug_l: +chl.toFixed(3),
    oxygen_umol_kg: +o2.toFixed(1),
    density_kg_m3: +density.toFixed(1),
    pressure_bar: +pressure.toFixed(1)
  };
}

/**
 * Get the value of a specific variable at a given point
 */
export function getVariableValue(lat: number, lon: number, depth: number, variable: VolumeVariable): number {
  const probe = probeVolumePoint(lat, lon, depth);
  switch (variable) {
    case 'temperature': return probe.temperature_c;
    case 'salinity': return probe.salinity_psu;
    case 'current_speed': return probe.current_speed_ms;
    case 'chlorophyll': return probe.chlorophyll_ug_l;
    case 'density': return probe.density_kg_m3;
    case 'oxygen': return probe.oxygen_umol_kg;
  }
}

/**
 * Color mapping for each variable
 */
export function getVariableColor(value: number, variable: VolumeVariable): [number, number, number] {
  switch (variable) {
    case 'temperature': {
      // Blue (cold) → Cyan → Yellow → Red (hot)
      const t = Math.max(0, Math.min(1, (value - 2) / 28));
      if (t < 0.25) return [0, 0, 0.5 + t * 2];
      if (t < 0.5) return [0, (t - 0.25) * 4, 1];
      if (t < 0.75) return [(t - 0.5) * 4, 1, 1 - (t - 0.5) * 4];
      return [1, 1 - (t - 0.75) * 4, 0];
    }
    case 'salinity': {
      // Green (fresh) → Blue → Purple (saline)
      const t = Math.max(0, Math.min(1, (value - 30) / 7));
      if (t < 0.5) return [0, 0.8 - t * 1.2, t * 2];
      return [t * 1.4, 0, 1 - (t - 0.5) * 0.6];
    }
    case 'current_speed': {
      // Dark blue (slow) → Cyan → Yellow (fast)
      const t = Math.max(0, Math.min(1, value / 1.5));
      if (t < 0.33) return [0, t * 2, 0.4 + t * 1.5];
      if (t < 0.66) return [(t - 0.33) * 3, 0.7 + (t - 0.33), 1 - (t - 0.33) * 2];
      return [1, 1, 0];
    }
    case 'chlorophyll': {
      // Black (none) → Green → Bright Green (high)
      const t = Math.max(0, Math.min(1, value / 3.0));
      return [0, 0.2 + t * 0.8, 0.1 * t];
    }
    case 'density': {
      // Light (low density) → Dark blue (high density)
      const t = Math.max(0, Math.min(1, (value - 1020) / 10));
      return [0.1 * (1 - t), 0.5 * (1 - t), 0.3 + t * 0.7];
    }
    case 'oxygen': {
      // Red (anoxic) → Yellow → Blue (oxygenated)
      const t = Math.max(0, Math.min(1, value / 220));
      if (t < 0.15) return [0.8, 0, 0];
      if (t < 0.4) return [1, (t - 0.15) * 4, 0];
      return [1 - (t - 0.4) * 1.5, 1 - (t - 0.4) * 0.5, (t - 0.4) * 1.5];
    }
  }
}

/**
 * Generate a 2D texture canvas for a cutting plane
 */
export function generateSliceTexture(
  variable: VolumeVariable,
  axis: 'x' | 'y' | 'z',
  fixedValue: number,
  bounds: VolumeRegion['bounds'],
  resolution: number = 64
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      let lat: number, lon: number, depth: number;

      const u = i / (resolution - 1);
      const v = j / (resolution - 1);

      if (axis === 'x') {
        // Fixed latitude, varying lon (u) and depth (v)
        lat = fixedValue;
        lon = bounds.lonMin + u * (bounds.lonMax - bounds.lonMin);
        depth = bounds.depthMin + v * (bounds.depthMax - bounds.depthMin);
      } else if (axis === 'y') {
        // Fixed depth, varying lat (u) and lon (v)
        lat = bounds.latMax - v * (bounds.latMax - bounds.latMin);
        lon = bounds.lonMin + u * (bounds.lonMax - bounds.lonMin);
        depth = fixedValue;
      } else {
        // Fixed longitude, varying lat (u) and depth (v)
        lat = bounds.latMax - u * (bounds.latMax - bounds.latMin);
        lon = fixedValue;
        depth = bounds.depthMin + v * (bounds.depthMax - bounds.depthMin);
      }

      const val = getVariableValue(lat, lon, depth, variable);
      const [r, g, b] = getVariableColor(val, variable);

      ctx.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      ctx.fillRect(i, j, 1, 1);
    }
  }

  return canvas;
}

/**
 * Variable display metadata
 */
export const VOLUME_VARIABLE_META: Record<VolumeVariable, { label: string; unit: string; icon: string; range: [number, number] }> = {
  temperature: { label: 'Temperature', unit: '°C', icon: '🌡️', range: [2, 30] },
  salinity: { label: 'Salinity', unit: 'PSU', icon: '🧂', range: [30, 37] },
  current_speed: { label: 'Current Speed', unit: 'm/s', icon: '🌊', range: [0, 1.5] },
  chlorophyll: { label: 'Chlorophyll-a', unit: 'µg/L', icon: '🟢', range: [0, 3] },
  density: { label: 'Density', unit: 'kg/m³', icon: '📏', range: [1020, 1030] },
  oxygen: { label: 'Dissolved O₂', unit: 'µmol/kg', icon: '⚗️', range: [5, 220] }
};
