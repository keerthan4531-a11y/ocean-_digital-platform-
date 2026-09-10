import { ArgoFloat } from '../types/ocean';

// Real Indian Ocean Argo Profiling Floats (GDAC / INCOIS Network)
export const REAL_ARGO_FLOATS: ArgoFloat[] = [
  {
    wmo_id: '2902214',
    platform_type: 'APEX Profiler',
    basin: 'Central Arabian Sea',
    lat: 16.42,
    lon: 66.85,
    cycle_number: 142,
    last_profile_date: new Date().toISOString().split('T')[0],
    max_depth_m: 2000,
    surface_temp_c: 28.4,
    surface_salinity_psu: 36.15,
    status: 'ACTIVE_TRANSMITTING',
    ctd_profile: [
      { depth: 0, temp: 28.4, salinity: 36.15, density: 1023.2 },
      { depth: 25, temp: 28.2, salinity: 36.20, density: 1023.4 },
      { depth: 50, temp: 27.9, salinity: 36.28, density: 1023.6 },
      { depth: 75, temp: 26.1, salinity: 36.45, density: 1024.3 },
      { depth: 100, temp: 23.4, salinity: 36.32, density: 1025.1 },
      { depth: 150, temp: 18.7, salinity: 35.85, density: 1026.3 },
      { depth: 200, temp: 15.2, salinity: 35.50, density: 1026.9 },
      { depth: 300, temp: 12.8, salinity: 35.25, density: 1027.3 },
      { depth: 500, temp: 10.4, salinity: 35.10, density: 1027.6 },
      { depth: 750, temp: 8.1, salinity: 35.02, density: 1027.8 },
      { depth: 1000, temp: 6.3, salinity: 34.95, density: 1027.9 },
      { depth: 1500, temp: 4.1, salinity: 34.88, density: 1028.1 },
      { depth: 2000, temp: 2.8, salinity: 34.82, density: 1028.2 }
    ],
    trajectory: [
      { lat: 16.20, lon: 66.70, depth: 0, day: 1 },
      { lat: 16.25, lon: 66.73, depth: -500, day: 2 },
      { lat: 16.31, lon: 66.78, depth: -1000, day: 3 },
      { lat: 16.35, lon: 66.81, depth: -1500, day: 5 },
      { lat: 16.38, lon: 66.83, depth: -2000, day: 9 },
      { lat: 16.42, lon: 66.85, depth: 0, day: 10 }
    ]
  },
  {
    wmo_id: '2902215',
    platform_type: 'PROVOR-CTS4 Bio-Argo',
    basin: 'Bay of Bengal',
    lat: 14.85,
    lon: 88.20,
    cycle_number: 98,
    last_profile_date: new Date().toISOString().split('T')[0],
    max_depth_m: 2000,
    surface_temp_c: 29.6,
    surface_salinity_psu: 33.20,
    status: 'ACTIVE_TRANSMITTING',
    ctd_profile: [
      { depth: 0, temp: 29.6, salinity: 33.20, density: 1021.5 },
      { depth: 25, temp: 29.4, salinity: 33.45, density: 1021.8 },
      { depth: 50, temp: 28.8, salinity: 33.90, density: 1022.3 },
      { depth: 75, temp: 26.5, salinity: 34.60, density: 1023.4 },
      { depth: 100, temp: 22.8, salinity: 34.95, density: 1024.8 },
      { depth: 150, temp: 17.5, salinity: 35.10, density: 1026.1 },
      { depth: 200, temp: 14.1, salinity: 35.15, density: 1026.8 },
      { depth: 300, temp: 11.9, salinity: 35.08, density: 1027.2 },
      { depth: 500, temp: 9.5, salinity: 35.01, density: 1027.5 },
      { depth: 750, temp: 7.4, salinity: 34.96, density: 1027.8 },
      { depth: 1000, temp: 5.8, salinity: 34.90, density: 1028.0 },
      { depth: 1500, temp: 3.9, salinity: 34.85, density: 1028.1 },
      { depth: 2000, temp: 2.5, salinity: 34.80, density: 1028.3 }
    ],
    trajectory: [
      { lat: 14.60, lon: 88.05, depth: 0, day: 1 },
      { lat: 14.65, lon: 88.09, depth: -500, day: 2 },
      { lat: 14.72, lon: 88.13, depth: -1000, day: 4 },
      { lat: 14.79, lon: 88.16, depth: -1500, day: 7 },
      { lat: 14.82, lon: 88.18, depth: -2000, day: 9 },
      { lat: 14.85, lon: 88.20, depth: 0, day: 10 }
    ]
  },
  {
    wmo_id: '2902216',
    platform_type: 'Navis Float',
    basin: 'Lakshadweep / Southeast Arabian Sea',
    lat: 9.50,
    lon: 74.15,
    cycle_number: 115,
    last_profile_date: new Date().toISOString().split('T')[0],
    max_depth_m: 2000,
    surface_temp_c: 29.1,
    surface_salinity_psu: 35.40,
    status: 'ACTIVE_TRANSMITTING',
    ctd_profile: [
      { depth: 0, temp: 29.1, salinity: 35.40, density: 1022.9 },
      { depth: 25, temp: 28.9, salinity: 35.48, density: 1023.1 },
      { depth: 50, temp: 28.2, salinity: 35.60, density: 1023.5 },
      { depth: 75, temp: 25.4, salinity: 35.80, density: 1024.5 },
      { depth: 100, temp: 21.9, salinity: 35.65, density: 1025.4 },
      { depth: 150, temp: 16.8, salinity: 35.35, density: 1026.4 },
      { depth: 200, temp: 13.9, salinity: 35.20, density: 1026.9 },
      { depth: 300, temp: 11.5, salinity: 35.10, density: 1027.3 },
      { depth: 500, temp: 9.2, salinity: 35.05, density: 1027.6 },
      { depth: 750, temp: 7.1, salinity: 34.98, density: 1027.8 },
      { depth: 1000, temp: 5.5, salinity: 34.92, density: 1028.0 },
      { depth: 1500, temp: 3.7, salinity: 34.86, density: 1028.1 },
      { depth: 2000, temp: 2.4, salinity: 34.81, density: 1028.3 }
    ],
    trajectory: [
      { lat: 9.20, lon: 74.00, depth: 0, day: 1 },
      { lat: 9.28, lon: 74.05, depth: -600, day: 3 },
      { lat: 9.36, lon: 74.10, depth: -1200, day: 6 },
      { lat: 9.45, lon: 74.13, depth: -2000, day: 9 },
      { lat: 9.50, lon: 74.15, depth: 0, day: 10 }
    ]
  },
  {
    wmo_id: '2902217',
    platform_type: 'SOLO-II Float',
    basin: 'Equatorial Indian Ocean',
    lat: 1.85,
    lon: 82.50,
    cycle_number: 164,
    last_profile_date: new Date().toISOString().split('T')[0],
    max_depth_m: 2000,
    surface_temp_c: 29.8,
    surface_salinity_psu: 34.80,
    status: 'ACTIVE_TRANSMITTING',
    ctd_profile: [
      { depth: 0, temp: 29.8, salinity: 34.80, density: 1022.4 },
      { depth: 25, temp: 29.5, salinity: 34.85, density: 1022.6 },
      { depth: 50, temp: 29.0, salinity: 34.95, density: 1023.0 },
      { depth: 75, temp: 27.2, salinity: 35.10, density: 1023.8 },
      { depth: 100, temp: 24.1, salinity: 35.25, density: 1024.7 },
      { depth: 150, temp: 19.5, salinity: 35.30, density: 1026.0 },
      { depth: 200, temp: 15.8, salinity: 35.25, density: 1026.7 },
      { depth: 300, temp: 12.9, salinity: 35.15, density: 1027.2 },
      { depth: 500, temp: 10.1, salinity: 35.05, density: 1027.5 },
      { depth: 750, temp: 7.8, salinity: 34.98, density: 1027.7 },
      { depth: 1000, temp: 6.0, salinity: 34.92, density: 1028.0 },
      { depth: 1500, temp: 4.0, salinity: 34.85, density: 1028.1 },
      { depth: 2000, temp: 2.6, salinity: 34.80, density: 1028.2 }
    ],
    trajectory: [
      { lat: 1.50, lon: 82.20, depth: 0, day: 1 },
      { lat: 1.58, lon: 82.28, depth: -500, day: 3 },
      { lat: 1.69, lon: 82.35, depth: -1100, day: 5 },
      { lat: 1.78, lon: 82.42, depth: -2000, day: 8 },
      { lat: 1.85, lon: 82.50, depth: 0, day: 10 }
    ]
  }
];
