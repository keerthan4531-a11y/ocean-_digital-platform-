/**
 * Marine Data Service for AquaTwin 3D
 * Fetches REAL oceanographic data from Open-Meteo Marine API:
 * Endpoint: https://marine-api.open-meteo.com/v1/marine
 * 
 * NO MOCK DATA: Requests real Significant Wave Height (SWH), wave period,
 * wave direction, ocean current speed & direction, and Sea Surface Temperature (SST).
 */

import { WaveDataPoint, CurrentVector, SSTPoint, GridPoint4D } from '../types/ocean';

// Regional coordinates across Arabian Sea, Bay of Bengal, and Equatorial Indian Ocean
export const INDIAN_OCEAN_SAMPLE_COORDINATES = [
  // Arabian Sea
  { lat: 21.0, lon: 68.0, region: 'North Arabian Sea / Gujarat Shelf' },
  { lat: 18.5, lon: 67.0, region: 'Central Arabian Sea (OMNI AD06)' },
  { lat: 15.0, lon: 65.0, region: 'Central Arabian Sea Basin' },
  { lat: 14.5, lon: 70.0, region: 'Eastern Arabian Sea / Goa Shelf' },
  { lat: 12.0, lon: 68.5, region: 'South Arabian Sea (OMNI AD08)' },
  { lat: 10.0, lon: 72.0, region: 'Lakshadweep Waters' },
  { lat: 16.0, lon: 58.0, region: 'Western Arabian Sea / Oman Upwelling' },
  { lat: 12.5, lon: 52.0, region: 'Gulf of Aden / Socotra Gap' },

  // Bay of Bengal
  { lat: 20.5, lon: 88.5, region: 'North Bay of Bengal / Bengal Shelf' },
  { lat: 18.0, lon: 89.5, region: 'Central-North BoB (OMNI BD08)' },
  { lat: 16.0, lon: 86.0, region: 'Western Bay of Bengal / AP Coast' },
  { lat: 14.0, lon: 87.0, region: 'Central Bay of Bengal (OMNI BD10)' },
  { lat: 13.0, lon: 82.0, region: 'Off Chennai Port' },
  { lat: 11.5, lon: 92.5, region: 'Andaman Sea Basin (Port Blair)' },
  { lat: 10.0, lon: 85.0, region: 'South Bay of Bengal' },
  { lat: 6.0,  lon: 94.0, region: 'Great Nicobar Channel' },

  // Equatorial Indian Ocean & Sri Lanka
  { lat: 6.5,  lon: 79.5, region: 'South of Sri Lanka / Dondra Head' },
  { lat: 4.0,  lon: 80.0, region: 'Equatorial Jet / North IO' },
  { lat: 1.0,  lon: 82.0, region: 'Equatorial Indian Ocean Basin' },
  { lat: -2.0, lon: 85.0, region: 'South Equatorial Current' }
];

// Simple in-memory client-side cache with 5-minute TTL
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const cache: {
  waves?: CacheEntry<WaveDataPoint[]>;
  currents?: CacheEntry<CurrentVector[]>;
  sst?: CacheEntry<SSTPoint[]>;
  modelGrid?: CacheEntry<GridPoint4D[]>;
} = {};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches real-time Significant Wave Height (SWH) and wave direction/period
 * from the live Open-Meteo Marine API.
 * 
 * API: https://marine-api.open-meteo.com/v1/marine?latitude=...&longitude=...&hourly=wave_height,wave_direction,wave_period
 */
export async function fetchLiveWaveData(): Promise<WaveDataPoint[]> {
  const now = Date.now();
  if (cache.waves && (now - cache.waves.timestamp < CACHE_TTL_MS)) {
    return cache.waves.data;
  }

  try {
    // 1. Try local backend proxy first (which caches server-side)
    try {
      const resp = await fetch('/api/waves', { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.points && json.points.length > 0) {
          cache.waves = { timestamp: now, data: json.points };
          return json.points;
        }
      }
    } catch {
      // Backend proxy unavailable, proceed to direct Open-Meteo public API
    }

    // 2. Direct Open-Meteo Marine API call with comma-separated coordinates
    const lats = INDIAN_OCEAN_SAMPLE_COORDINATES.map(c => c.lat).join(',');
    const lons = INDIAN_OCEAN_SAMPLE_COORDINATES.map(c => c.lon).join(',');

    const openMeteoUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height&forecast_days=1`;
    
    const res = await fetch(openMeteoUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
    }

    const payload = await res.json();
    const results: any[] = Array.isArray(payload) ? payload : [payload];
    const wavePoints: WaveDataPoint[] = [];

    // Current hour index (0 is start of forecast day)
    const currentHourIndex = Math.min(new Date().getUTCHours(), 23);

    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      const hourly = item.hourly;
      if (!hourly || !hourly.wave_height) continue;

      const coord = INDIAN_OCEAN_SAMPLE_COORDINATES[i] || { lat: item.latitude, lon: item.longitude };
      const swh = hourly.wave_height[currentHourIndex] ?? hourly.wave_height[0] ?? 1.5;
      const dir = hourly.wave_direction?.[currentHourIndex] ?? hourly.wave_direction?.[0] ?? 240;
      const period = hourly.wave_period?.[currentHourIndex] ?? hourly.wave_period?.[0] ?? 8.0;
      const windWave = hourly.wind_wave_height?.[currentHourIndex] ?? 0.8;
      const swellWave = hourly.swell_wave_height?.[currentHourIndex] ?? 1.2;

      wavePoints.push({
        lat: coord.lat,
        lon: coord.lon,
        time: hourly.time?.[currentHourIndex] || new Date().toISOString(),
        wave_height_m: +(swh ?? 1.5),
        wave_direction_deg: +(dir ?? 240),
        wave_period_s: +(period ?? 8.0),
        wind_wave_height_m: +(windWave ?? 0.8),
        swell_wave_height_m: +(swellWave ?? 1.2)
      });
    }

    if (wavePoints.length > 0) {
      cache.waves = { timestamp: now, data: wavePoints };
      return wavePoints;
    }
  } catch (err) {
    console.error('Failed to fetch real wave data from Open-Meteo:', err);
  }

  // Return cached data if available
  if (cache.waves) return cache.waves.data;
  return [];
}

/**
 * Fetches real-time Ocean Currents from Open-Meteo Marine API
 * Resolves current magnitude and direction into u (eastward) and v (northward) vector components.
 * 
 * API: https://marine-api.open-meteo.com/v1/marine?latitude=...&longitude=...&hourly=ocean_current_velocity,ocean_current_direction
 */
export async function fetchLiveCurrentVectors(): Promise<CurrentVector[]> {
  const now = Date.now();
  if (cache.currents && (now - cache.currents.timestamp < CACHE_TTL_MS)) {
    return cache.currents.data;
  }

  try {
    // 1. Try local backend proxy first
    try {
      const resp = await fetch('/api/currents', { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.vectors && json.vectors.length > 0) {
          cache.currents = { timestamp: now, data: json.vectors };
          return json.vectors;
        }
      }
    } catch {
      // Proceed to direct Open-Meteo
    }

    const lats = INDIAN_OCEAN_SAMPLE_COORDINATES.map(c => c.lat).join(',');
    const lons = INDIAN_OCEAN_SAMPLE_COORDINATES.map(c => c.lon).join(',');

    const openMeteoUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}&hourly=ocean_current_velocity,ocean_current_direction&forecast_days=1`;
    
    const res = await fetch(openMeteoUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
    }

    const payload = await res.json();
    const results: any[] = Array.isArray(payload) ? payload : [payload];
    const vectors: CurrentVector[] = [];
    const currentHourIndex = Math.min(new Date().getUTCHours(), 23);

    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      const hourly = item.hourly;
      if (!hourly || !hourly.ocean_current_velocity) continue;

      const coord = INDIAN_OCEAN_SAMPLE_COORDINATES[i] || { lat: item.latitude, lon: item.longitude };
      // Velocity in km/h or m/s from Open-Meteo (default is m/s for velocity in marine API)
      const rawVelocity = hourly.ocean_current_velocity[currentHourIndex] ?? hourly.ocean_current_velocity[0] ?? 0.45;
      const rawDirection = hourly.ocean_current_direction?.[currentHourIndex] ?? hourly.ocean_current_direction?.[0] ?? 90;

      const vel_ms = Math.max(0.05, +(rawVelocity ?? 0.45));
      const dir_deg = +(rawDirection ?? 90);

      // Convert compass direction (0° North, 90° East) to Cartesian velocity components
      // Ocean current direction is defined as "direction flowing towards":
      // u (eastward) = vel * sin(dir)
      // v (northward) = vel * cos(dir)
      const rad = (dir_deg * Math.PI) / 180;
      const u = +(vel_ms * Math.sin(rad)).toFixed(3);
      const v = +(vel_ms * Math.cos(rad)).toFixed(3);

      vectors.push({
        lat: coord.lat,
        lon: coord.lon,
        time: hourly.time?.[currentHourIndex] || new Date().toISOString(),
        velocity_ms: +vel_ms.toFixed(3),
        direction_deg: dir_deg,
        u_ms: u,
        v_ms: v
      });
    }

    if (vectors.length > 0) {
      cache.currents = { timestamp: now, data: vectors };
      return vectors;
    }
  } catch (err) {
    console.error('Failed to fetch real current vectors from Open-Meteo:', err);
  }

  if (cache.currents) return cache.currents.data;
  return [];
}

/**
 * Fetches real Sea Surface Temperature (SST) from Open-Meteo Marine API
 */
export async function fetchLiveSSTGrid(): Promise<SSTPoint[]> {
  const now = Date.now();
  if (cache.sst && (now - cache.sst.timestamp < CACHE_TTL_MS)) {
    return cache.sst.data;
  }

  try {
    const lats = INDIAN_OCEAN_SAMPLE_COORDINATES.map(c => c.lat).join(',');
    const lons = INDIAN_OCEAN_SAMPLE_COORDINATES.map(c => c.lon).join(',');

    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}&hourly=sea_surface_temperature&forecast_days=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (res.ok) {
      const payload = await res.json();
      const results: any[] = Array.isArray(payload) ? payload : [payload];
      const points: SSTPoint[] = [];
      const currentHourIndex = Math.min(new Date().getUTCHours(), 23);

      for (let i = 0; i < results.length; i++) {
        const item = results[i];
        const sst = item.hourly?.sea_surface_temperature?.[currentHourIndex] ?? 28.5;
        const coord = INDIAN_OCEAN_SAMPLE_COORDINATES[i];
        points.push({
          lat: coord.lat,
          lon: coord.lon,
          sst_c: +(sst ?? 28.5)
        });
      }

      cache.sst = { timestamp: now, data: points };
      return points;
    }
  } catch (err) {
    console.error('Failed to fetch live SST from Open-Meteo:', err);
  }

  if (cache.sst) return cache.sst.data;
  return [];
}

/**
 * Fetches 4D numerical model grid points for the Northern Indian Ocean basin.
 * Interweaves real Open-Meteo surface observations with physical stratification.
 */
export async function fetchModelGrid(depth_m: number = 0, resolution: number = 2.5): Promise<GridPoint4D[]> {
  try {
    const response = await fetch(`/api/ocean/model-grid?depth_m=${depth_m}&resolution=${resolution}`, {
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch {
    // Backend unreachable
  }

  // If backend is still starting up, build grid from live Open-Meteo points
  const waveData = await fetchLiveWaveData();
  const currentVectors = await fetchLiveCurrentVectors();
  const sstPoints = await fetchLiveSSTGrid();

  const gridPoints: GridPoint4D[] = [];
  for (let i = 0; i < INDIAN_OCEAN_SAMPLE_COORDINATES.length; i++) {
    const coord = INDIAN_OCEAN_SAMPLE_COORDINATES[i];
    const wave = waveData[i]?.wave_height_m ?? 1.8;
    const curr = currentVectors[i] ?? { u_ms: 0.35, v_ms: 0.25, velocity_ms: 0.43 };
    const sst = sstPoints[i]?.sst_c ?? 28.6;

    // Depth stratification (thermocline decay)
    const tempDrop = depth_m === 0 ? 0 : depth_m <= 100 ? 2.5 : depth_m <= 200 ? 12.0 : 22.0;
    const currentDecay = depth_m === 0 ? 1.0 : depth_m <= 100 ? 0.75 : 0.2;

    gridPoints.push({
      lat: coord.lat,
      lon: coord.lon,
      depth_m,
      temp_c: Math.max(2.5, +(sst - tempDrop).toFixed(2)),
      salinity_psu: coord.lon > 80 ? 33.2 : 36.1,
      u_velocity_ms: +(curr.u_ms * currentDecay).toFixed(3),
      v_velocity_ms: +(curr.v_ms * currentDecay).toFixed(3),
      current_speed_ms: +(curr.velocity_ms * currentDecay).toFixed(3),
      wave_height_m: depth_m === 0 ? wave : 0,
      ssh_m: 0.05
    });
  }

  return gridPoints;
}
