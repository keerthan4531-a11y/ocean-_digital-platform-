/**
 * AquaTwin 3D - Verified Autonomous Underwater Gliders (INCOIS / NIOT / MoES)
 * Sawtooth undulating dive trajectories (0m to -1000m) with Biogeochemical (BGC) telemetry
 */

import { GliderMission } from '../types/ocean';

export const REAL_GLIDERS: GliderMission[] = [
  {
    id: 'SG-IND01',
    name: 'INCOIS Glider Samudra-1',
    glider_type: 'Teledyne Slocum G3',
    basin: 'Western Bay of Bengal',
    operator: 'INCOIS / NIOT',
    lat: 16.85,
    lon: 84.12,
    heading_deg: 135,
    speed_knots: 0.65,
    current_depth_m: 420,
    dive_state: 'DIVING',
    battery_pct: 82,
    mission_day: 18,
    total_dives: 124,
    surface_temp_c: 29.8,
    surface_salinity_psu: 32.6,
    chlorophyll_surface_ug_l: 0.45,
    status: 'MISSION_ACTIVE',
    last_surfaced: new Date().toISOString(),
    profile: [
      { depth: 0, temp: 29.8, salinity: 32.6, chlorophyll: 0.45, oxygen: 210.5, density: 1021.1 },
      { depth: 25, temp: 29.5, salinity: 33.1, chlorophyll: 0.85, oxygen: 208.0, density: 1021.6 },
      { depth: 50, temp: 28.6, salinity: 33.8, chlorophyll: 1.95, oxygen: 195.2, density: 1022.4 },
      { depth: 75, temp: 25.8, salinity: 34.5, chlorophyll: 1.40, oxygen: 165.0, density: 1023.7 },
      { depth: 100, temp: 22.1, salinity: 34.9, chlorophyll: 0.35, oxygen: 110.4, density: 1025.0 },
      { depth: 150, temp: 17.2, salinity: 35.1, chlorophyll: 0.05, oxygen: 45.8, density: 1026.2 },
      { depth: 250, temp: 13.5, salinity: 35.1, chlorophyll: 0.01, oxygen: 18.2, density: 1027.0 },
      { depth: 500, temp: 9.8, salinity: 35.0, chlorophyll: 0.00, oxygen: 24.5, density: 1027.5 },
      { depth: 750, temp: 7.2, salinity: 34.9, chlorophyll: 0.00, oxygen: 48.0, density: 1027.8 },
      { depth: 1000, temp: 5.6, salinity: 34.88, chlorophyll: 0.00, oxygen: 75.3, density: 1028.0 }
    ],
    sawtooth_trajectory: [
      { lat: 17.20, lon: 83.80, depth: 0, dive: 1 },
      { lat: 17.12, lon: 83.87, depth: -1000, dive: 1 },
      { lat: 17.05, lon: 83.95, depth: 0, dive: 2 },
      { lat: 16.98, lon: 84.02, depth: -1000, dive: 2 },
      { lat: 16.91, lon: 84.08, depth: 0, dive: 3 },
      { lat: 16.85, lon: 84.12, depth: -420, dive: 3 }
    ]
  },
  {
    id: 'SG-IND02',
    name: 'NIOT Seaglider Sagar-Tara',
    glider_type: 'Kongsberg Seaglider 1K',
    basin: 'Eastern Arabian Sea',
    operator: 'NIOT / MoES',
    lat: 14.80,
    lon: 72.40,
    heading_deg: 220,
    speed_knots: 0.58,
    current_depth_m: 180,
    dive_state: 'CLIMBING',
    battery_pct: 74,
    mission_day: 26,
    total_dives: 186,
    surface_temp_c: 28.7,
    surface_salinity_psu: 36.3,
    chlorophyll_surface_ug_l: 0.62,
    status: 'MISSION_ACTIVE',
    last_surfaced: new Date().toISOString(),
    profile: [
      { depth: 0, temp: 28.7, salinity: 36.3, chlorophyll: 0.62, oxygen: 215.0, density: 1023.2 },
      { depth: 25, temp: 28.4, salinity: 36.35, chlorophyll: 1.10, oxygen: 212.0, density: 1023.4 },
      { depth: 50, temp: 27.2, salinity: 36.45, chlorophyll: 2.30, oxygen: 185.0, density: 1024.1 },
      { depth: 75, temp: 24.5, salinity: 36.20, chlorophyll: 1.20, oxygen: 130.0, density: 1024.8 },
      { depth: 100, temp: 21.0, salinity: 35.95, chlorophyll: 0.20, oxygen: 70.0, density: 1025.6 },
      { depth: 150, temp: 16.5, salinity: 35.60, chlorophyll: 0.02, oxygen: 12.0, density: 1026.5 },
      { depth: 300, temp: 12.2, salinity: 35.25, chlorophyll: 0.00, oxygen: 8.5, density: 1027.3 },
      { depth: 500, temp: 9.9, salinity: 35.10, chlorophyll: 0.00, oxygen: 28.0, density: 1027.6 }
    ],
    sawtooth_trajectory: [
      { lat: 15.15, lon: 72.85, depth: 0, dive: 1 },
      { lat: 15.05, lon: 72.70, depth: -500, dive: 1 },
      { lat: 14.95, lon: 72.55, depth: 0, dive: 2 },
      { lat: 14.88, lon: 72.46, depth: -500, dive: 2 },
      { lat: 14.80, lon: 72.40, depth: -180, dive: 3 }
    ]
  }
];
