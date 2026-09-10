import { CycloneEvent } from '../types/ocean';

export const HISTORIC_CYCLONES: CycloneEvent[] = [
  {
    id: 'biparjoy_2023',
    name: 'Cyclone Biparjoy',
    basin: 'Arabian Sea',
    year: 2023,
    peak_category: 'Extremely Severe Cyclonic Storm (ESCS)',
    description: 'Extremely long-lived Arabian Sea tropical cyclone with major ocean upwelling and significant SST cooling along its track.',
    track: [
      { step: 1, time: '06 Jun 00:00 UTC', lat: 11.9, lon: 66.0, pressure_hpa: 998, wind_knots: 40, sst_cooling_c: -0.4, category: 'Cyclonic Storm' },
      { step: 2, time: '07 Jun 12:00 UTC', lat: 12.8, lon: 66.2, pressure_hpa: 986, wind_knots: 65, sst_cooling_c: -0.9, category: 'Very Severe Cyclonic Storm' },
      { step: 3, time: '09 Jun 06:00 UTC', lat: 14.8, lon: 66.8, pressure_hpa: 970, wind_knots: 85, sst_cooling_c: -1.6, category: 'Extremely Severe Cyclonic Storm' },
      { step: 4, time: '11 Jun 00:00 UTC', lat: 18.1, lon: 67.5, pressure_hpa: 955, wind_knots: 95, sst_cooling_c: -2.8, category: 'Extremely Severe Cyclonic Storm' },
      { step: 5, time: '13 Jun 12:00 UTC', lat: 21.0, lon: 66.7, pressure_hpa: 968, wind_knots: 80, sst_cooling_c: -2.3, category: 'Very Severe Cyclonic Storm' },
      { step: 6, time: '15 Jun 18:00 UTC', lat: 23.2, lon: 68.6, pressure_hpa: 980, wind_knots: 65, sst_cooling_c: -1.8, category: 'Landfall (Gujarat Coast)' },
    ]
  },
  {
    id: 'michaung_2023',
    name: 'Cyclone Michaung',
    basin: 'Bay of Bengal',
    year: 2023,
    peak_category: 'Super Cyclonic Surge / ESCS',
    description: 'Catastrophic rain-producing cyclone affecting Tamil Nadu and Andhra Pradesh coasts with intense storm surge.',
    track: [
      { step: 1, time: '02 Dec 00:00 UTC', lat: 9.8, lon: 85.5, pressure_hpa: 1000, wind_knots: 35, sst_cooling_c: -0.3, category: 'Deep Depression' },
      { step: 2, time: '03 Dec 06:00 UTC', lat: 11.5, lon: 82.8, pressure_hpa: 988, wind_knots: 55, sst_cooling_c: -0.8, category: 'Cyclonic Storm' },
      { step: 3, time: '04 Dec 00:00 UTC', lat: 13.1, lon: 81.0, pressure_hpa: 978, wind_knots: 65, sst_cooling_c: -1.7, category: 'Off Chennai Coast (Heavy Rain)' },
      { step: 4, time: '04 Dec 18:00 UTC', lat: 14.5, lon: 80.3, pressure_hpa: 970, wind_knots: 75, sst_cooling_c: -2.2, category: 'Severe Cyclonic Storm' },
      { step: 5, time: '05 Dec 09:00 UTC', lat: 15.8, lon: 80.3, pressure_hpa: 982, wind_knots: 55, sst_cooling_c: -1.5, category: 'Landfall (Bapatla Coast)' },
    ]
  }
];
