/**
 * AquaTwin 3D - Oceanographic Data Types
 * Interfaces for live public APIs (Open-Meteo Marine, Argo GDAC / Argovis, NOAA NDBC / INCOIS OMNI)
 */

export type OceanVariable = 'sst' | 'salinity' | 'currents' | 'wave_height' | 'ssh' | 'chlorophyll';

export type CameraPreset = 'overview' | 'arabian_sea' | 'bay_of_bengal' | 'equatorial_io' | 'cyclone_corridor';

/**
 * Real Significant Wave Height (SWH) & swell data from Open-Meteo Marine API
 */
export interface WaveDataPoint {
  lat: number;
  lon: number;
  time: string;
  wave_height_m: number;       // Significant wave height in meters (SWH)
  wave_direction_deg: number;  // Direction wave is propagating towards (0-360°)
  wave_period_s: number;       // Peak wave period in seconds
  wind_wave_height_m?: number;
  swell_wave_height_m?: number;
}

export interface WaveGrid {
  timestamp: string;
  source: string;
  points: WaveDataPoint[];
}

/**
 * Real ocean current velocity vector from Open-Meteo Marine API
 */
export interface CurrentVector {
  lat: number;
  lon: number;
  time: string;
  velocity_ms: number;         // Current magnitude (m/s)
  direction_deg: number;       // Direction current is flowing towards (0-360°)
  u_ms: number;                // Eastward velocity component (m/s)
  v_ms: number;                // Northward velocity component (m/s)
  depth_m?: number;            // Subsurface depth level (0, 100, 500m)
}

export interface CurrentGrid {
  timestamp: string;
  source: string;
  vectors: CurrentVector[];
}

/**
 * Sea Surface Temperature (SST) Grid point
 */
export interface SSTPoint {
  lat: number;
  lon: number;
  sst_c: number;
  anomaly_c?: number;
}

export interface SSTGrid {
  timestamp: string;
  source: string;
  points: SSTPoint[];
}

/**
 * CTD & Biogeochemical In-Situ Measurement
 */
export interface CTDMeasurement {
  depth: number;       // Depth in meters (or pressure in dbar)
  temp: number;        // In-situ or potential temperature (°C)
  salinity: number;    // Practical salinity (PSU)
  density: number;     // Water density (kg/m³)
  chlorophyll?: number; // Chlorophyll-a concentration in µg/L
  oxygen?: number;     // Dissolved oxygen in µmol/kg
}

export interface TrajectoryPoint {
  lat: number;
  lon: number;
  depth: number;       // Negative for submerged (m)
  day: number;
}

/**
 * Real Argo Profiling Float data from Global Argo GDAC / Argovis API
 */
export interface ArgoFloat {
  wmo_id: string;              // WMO platform number (e.g. "2902214")
  platform_type: string;       // e.g. "APEX", "PROVOR", "Navis"
  basin: string;               // e.g. "Arabian Sea", "Bay of Bengal"
  lat: number;
  lon: number;
  cycle_number: number;
  last_profile_date: string;
  max_depth_m: number;
  surface_temp_c: number;
  surface_salinity_psu: number;
  status: 'ACTIVE_TRANSMITTING' | 'ARCHIVED' | 'DRIFTING';
  ctd_profile: CTDMeasurement[];
  trajectory: TrajectoryPoint[];
  source_api?: string;
}

/**
 * Autonomous Underwater Glider Mission
 */
export interface GliderSawtoothPoint {
  lat: number;
  lon: number;
  depth: number;       // in meters (0 to -1000m)
  dive: number;
}

export interface GliderMission {
  id: string;                  // e.g. "SG-IND01"
  name: string;                // e.g. "INCOIS Glider Samudra-1"
  glider_type: string;         // e.g. "Teledyne Slocum G3"
  basin: string;
  operator: string;
  lat: number;
  lon: number;
  heading_deg: number;
  speed_knots: number;
  current_depth_m: number;
  dive_state: 'DIVING' | 'CLIMBING' | 'SURFACED';
  battery_pct: number;
  mission_day: number;
  total_dives: number;
  surface_temp_c: number;
  surface_salinity_psu: number;
  chlorophyll_surface_ug_l: number;
  status: 'MISSION_ACTIVE' | 'RECOVERY_STANDBY' | 'DOCKED';
  last_surfaced: string;
  profile: CTDMeasurement[];
  sawtooth_trajectory: GliderSawtoothPoint[];
}

/**
 * Ship-based CTD Cast Station (ORV Sagar Kanya / Sagar Nidhi)
 */
export interface CTDCastStation {
  station_id: string;          // e.g. "CTD-SK-382-01"
  vessel: string;              // e.g. "ORV Sagar Kanya"
  cruise_id: string;           // e.g. "SK-382"
  basin: string;
  lat: number;
  lon: number;
  bottom_depth_m: number;
  cast_date: string;
  surface_temp_c: number;
  surface_salinity_psu: number;
  chlorophyll_max_ug_l: number;
  chlorophyll_max_depth_m: number;
  cast_profile: CTDMeasurement[];
}

/**
 * 3D Isosurface (D26 / D20 Isotherm) Data Point
 */
export interface IsosurfacePoint {
  lat: number;
  lon: number;
  target_temp_c: number;
  surface_temp_c: number;
  isotherm_depth_m: number;
  tchp_kj_cm2: number;
  cyclone_heat_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
}

export interface IsosurfaceData {
  timestamp: string;
  target_isotherm_c: number;
  basin: string;
  total_nodes: number;
  mean_isotherm_depth_m: number;
  max_tchp_kj_cm2: number;
  points: IsosurfacePoint[];
}


/**
 * Real Moored Buoy Telemetry (NOAA NDBC / INCOIS OMNI)
 */
export interface BuoyHistoryPoint {
  timestamp: string;
  sst: number;
  salinity: number;
  wave_height: number;
  current_speed: number;
}

export interface BuoyData {
  id: string;                  // e.g. "BD08", "AD06", "23008"
  name: string;
  basin: string;
  lat: number;
  lon: number;
  depth_m: number;
  sst_c: number;
  salinity_psu: number;
  air_temp_c: number;
  wind_speed_ms: number;
  wind_dir_deg: number;
  wave_height_m: number;
  current_speed_ms: number;
  current_dir_deg: number;
  sensor_health: 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';
  last_updated: string;
  history?: BuoyHistoryPoint[];
}

export type OmniBuoy = BuoyData; // Backward compatibility alias

/**
 * 4D Numerical Model Grid Point (Multi-depth)
 */
export interface GridPoint4D {
  lat: number;
  lon: number;
  depth_m: number;
  temp_c: number;
  salinity_psu: number;
  u_velocity_ms: number;
  v_velocity_ms: number;
  current_speed_ms: number;
  wave_height_m: number;
  ssh_m: number;
}

/**
 * Real Model vs Observation Residuals
 */
export interface ModelValidationMetric {
  buoy_id: string;
  name: string;
  lat: number;
  lon: number;
  model_sst: number;
  obs_sst: number;
  residual_sst: number;        // obs_sst - model_sst
  model_wave: number;
  obs_wave: number;
  residual_wave: number;       // obs_wave - model_wave
  model_salinity: number;
  obs_salinity: number;
  residual_salinity: number;
  model_current: number;
  obs_current: number;
  residual_current: number;
  accuracy_score_pct: number;
}

export interface ValidationSummary {
  status: string;
  timestamp: string;
  evaluated_sensors: number;
  metrics: {
    sst_rmse_c: number;
    sst_mean_bias_c: number;
    wave_rmse_m: number;
    wave_mean_bias_m: number;
    salinity_rmse_psu: number;
    salinity_mean_bias_psu: number;
    overall_model_skill_pct: number;
  };
  comparisons: ModelValidationMetric[];
}

/**
 * 3D Vertical Transect Profile
 */
export interface TransectDepthPoint {
  depth_m: number;
  temp_c: number;
  salinity_psu: number;
  density_kg_m3: number;
}

export interface TransectNode {
  index: number;
  lat: number;
  lon: number;
  water_column: TransectDepthPoint[];
}

export interface TransectProfile {
  start: { lat: number; lon: number };
  end: { lat: number; lon: number };
  depth_levels_m: number[];
  nodes: TransectNode[];
}

/**
 * Cyclone Track Simulation
 */
export interface CycloneTrackPoint {
  step: number;
  time: string;
  lat: number;
  lon: number;
  pressure_hpa: number;
  wind_knots: number;
  sst_cooling_c: number;
  category: string;
}

export interface CycloneEvent {
  id: string;
  name: string;
  basin: string;
  year: number;
  peak_category: string;
  description: string;
  track: CycloneTrackPoint[];
}

/**
 * Layer Visibility State for HUD Toggles
 */
export interface LayerVisibilityState {
  showWaves: boolean;
  showCurrents: boolean;
  showSST: boolean;
  showSalinity: boolean;
  showArgo: boolean;
  showBuoys: boolean;
  showBathymetry: boolean;
  showGliders: boolean;
  showCTDStations: boolean;
  showIsosurface: boolean;
}

/**
 * 3D Volume Slicing Box — Region Presets
 */
export interface VolumeRegion {
  id: string;
  name: string;
  description: string;
  bounds: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
    depthMin: number;
    depthMax: number;
  };
  color: string;
}

/**
 * 3D Volume Slicing Box — Probe Data at Intersection Point
 */
export interface VolumeProbeData {
  lat: number;
  lon: number;
  depth_m: number;
  temperature_c: number;
  salinity_psu: number;
  current_speed_ms: number;
  current_dir_deg: number;
  chlorophyll_ug_l: number;
  oxygen_umol_kg: number;
  density_kg_m3: number;
  pressure_bar: number;
}

export type VolumeVariable = 'temperature' | 'salinity' | 'current_speed' | 'chlorophyll' | 'density' | 'oxygen';

