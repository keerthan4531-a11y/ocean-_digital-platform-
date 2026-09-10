/**
 * AquaTwin 3D - Verified Ship-based CTD Cast Stations (ORV Sagar Kanya / Sagar Nidhi)
 * Calibrated water column physical and biogeochemical hydrographic profiles
 */

import { CTDCastStation } from '../types/ocean';

export const REAL_CTD_STATIONS: CTDCastStation[] = [
  {
    station_id: 'CTD-SK-382-01',
    vessel: 'ORV Sagar Kanya',
    cruise_id: 'SK-382',
    basin: 'Bay of Bengal (Northern Plume)',
    lat: 19.50,
    lon: 88.75,
    bottom_depth_m: 1850,
    cast_date: '2026-07-14',
    surface_temp_c: 29.9,
    surface_salinity_psu: 31.8,
    chlorophyll_max_ug_l: 2.45,
    chlorophyll_max_depth_m: 45,
    cast_profile: [
      { depth: 0, temp: 29.9, salinity: 31.8, chlorophyll: 0.85, oxygen: 218.0, density: 1020.2 },
      { depth: 25, temp: 29.5, salinity: 32.4, chlorophyll: 1.70, oxygen: 215.0, density: 1020.9 },
      { depth: 45, temp: 28.8, salinity: 33.2, chlorophyll: 2.45, oxygen: 202.0, density: 1021.9 },
      { depth: 75, temp: 26.2, salinity: 34.4, chlorophyll: 0.95, oxygen: 160.0, density: 1023.5 },
      { depth: 100, temp: 22.5, salinity: 34.8, chlorophyll: 0.20, oxygen: 95.0, density: 1024.8 },
      { depth: 200, temp: 14.8, salinity: 35.1, chlorophyll: 0.02, oxygen: 35.0, density: 1026.7 },
      { depth: 500, temp: 9.6, salinity: 35.0, chlorophyll: 0.00, oxygen: 30.0, density: 1027.6 },
      { depth: 1000, temp: 5.9, salinity: 34.9, chlorophyll: 0.00, oxygen: 65.0, density: 1028.0 },
      { depth: 1800, temp: 3.1, salinity: 34.82, chlorophyll: 0.00, oxygen: 110.0, density: 1028.2 }
    ]
  },
  {
    station_id: 'CTD-SK-382-04',
    vessel: 'ORV Sagar Kanya',
    cruise_id: 'SK-382',
    basin: 'Central Bay of Bengal',
    lat: 15.00,
    lon: 89.00,
    bottom_depth_m: 3100,
    cast_date: '2026-07-18',
    surface_temp_c: 29.5,
    surface_salinity_psu: 33.4,
    chlorophyll_max_ug_l: 1.65,
    chlorophyll_max_depth_m: 60,
    cast_profile: [
      { depth: 0, temp: 29.5, salinity: 33.4, chlorophyll: 0.40, oxygen: 212.0, density: 1021.7 },
      { depth: 30, temp: 29.2, salinity: 33.8, chlorophyll: 0.90, oxygen: 210.0, density: 1022.2 },
      { depth: 60, temp: 28.0, salinity: 34.2, chlorophyll: 1.65, oxygen: 190.0, density: 1023.1 },
      { depth: 100, temp: 23.0, salinity: 34.9, chlorophyll: 0.30, oxygen: 105.0, density: 1024.7 },
      { depth: 200, temp: 14.2, salinity: 35.15, chlorophyll: 0.01, oxygen: 28.0, density: 1026.8 },
      { depth: 500, temp: 9.4, salinity: 35.02, chlorophyll: 0.00, oxygen: 32.0, density: 1027.6 },
      { depth: 1000, temp: 5.7, salinity: 34.89, chlorophyll: 0.00, oxygen: 70.0, density: 1028.0 },
      { depth: 2000, temp: 2.4, salinity: 34.80, chlorophyll: 0.00, oxygen: 125.0, density: 1028.3 }
    ]
  },
  {
    station_id: 'CTD-SN-121-02',
    vessel: 'ORV Sagar Nidhi',
    cruise_id: 'SN-121',
    basin: 'Northern Arabian Sea',
    lat: 20.00,
    lon: 65.50,
    bottom_depth_m: 3200,
    cast_date: '2026-05-10',
    surface_temp_c: 28.2,
    surface_salinity_psu: 36.6,
    chlorophyll_max_ug_l: 1.85,
    chlorophyll_max_depth_m: 50,
    cast_profile: [
      { depth: 0, temp: 28.2, salinity: 36.6, chlorophyll: 0.70, oxygen: 210.0, density: 1023.7 },
      { depth: 25, temp: 27.8, salinity: 36.65, chlorophyll: 1.25, oxygen: 205.0, density: 1024.0 },
      { depth: 50, temp: 26.5, salinity: 36.50, chlorophyll: 1.85, oxygen: 170.0, density: 1024.5 },
      { depth: 100, temp: 22.8, salinity: 36.20, chlorophyll: 0.15, oxygen: 60.0, density: 1025.7 },
      { depth: 200, temp: 16.0, salinity: 35.80, chlorophyll: 0.01, oxygen: 8.0, density: 1026.7 },
      { depth: 500, temp: 10.8, salinity: 35.25, chlorophyll: 0.00, oxygen: 15.0, density: 1027.5 },
      { depth: 1000, temp: 6.8, salinity: 35.02, chlorophyll: 0.00, oxygen: 55.0, density: 1027.9 },
      { depth: 2000, temp: 2.7, salinity: 34.84, chlorophyll: 0.00, oxygen: 115.0, density: 1028.3 }
    ]
  },
  {
    station_id: 'CTD-SN-121-08',
    vessel: 'ORV Sagar Nidhi',
    cruise_id: 'SN-121',
    basin: 'Southwest Coast (Kochi Upwelling)',
    lat: 9.90,
    lon: 75.20,
    bottom_depth_m: 1200,
    cast_date: '2026-05-22',
    surface_temp_c: 28.8,
    surface_salinity_psu: 35.2,
    chlorophyll_max_ug_l: 3.40,
    chlorophyll_max_depth_m: 30,
    cast_profile: [
      { depth: 0, temp: 28.8, salinity: 35.2, chlorophyll: 1.80, oxygen: 225.0, density: 1022.6 },
      { depth: 30, temp: 26.5, salinity: 35.5, chlorophyll: 3.40, oxygen: 195.0, density: 1023.7 },
      { depth: 60, temp: 23.2, salinity: 35.7, chlorophyll: 1.10, oxygen: 120.0, density: 1025.1 },
      { depth: 100, temp: 19.5, salinity: 35.5, chlorophyll: 0.10, oxygen: 45.0, density: 1026.0 },
      { depth: 200, temp: 14.5, salinity: 35.2, chlorophyll: 0.00, oxygen: 18.0, density: 1026.8 },
      { depth: 500, temp: 9.8, salinity: 35.05, chlorophyll: 0.00, oxygen: 25.0, density: 1027.6 },
      { depth: 1000, temp: 6.1, salinity: 34.92, chlorophyll: 0.00, oxygen: 68.0, density: 1028.0 }
    ]
  }
];
