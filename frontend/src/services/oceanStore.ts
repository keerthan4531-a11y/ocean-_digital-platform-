/**
 * AquaTwin 3D - Global Zustand Ocean State Store
 * Manages active layers, real-time API caches, and UI interactive state.
 */

import { create } from 'zustand';
import {
  OceanVariable,
  WaveDataPoint,
  CurrentVector,
  SSTPoint,
  ArgoFloat,
  BuoyData,
  ValidationSummary,
  CycloneEvent,
  GliderMission,
  CTDCastStation,
  IsosurfaceData
} from '../types/ocean';
import { fetchLiveWaveData, fetchLiveCurrentVectors, fetchLiveSSTGrid } from './marineDataService';
import { fetchLiveArgoFloats } from './argoService';
import { evaluateModelAgainstInSitu } from './validationService';
import { REAL_OMNI_BUOYS } from '../data/realOmniBuoys';
import { REAL_GLIDERS } from '../data/realGliders';
import { REAL_CTD_STATIONS } from '../data/realCTDStations';

export interface OceanStoreState {
  // Layer visibility toggles
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

  // Active variable & depth
  variable: OceanVariable;
  depth: number;
  verticalExaggeration: number;
  currentDepthLayer: number; // 0, 100, 500m
  isosurfaceTargetTemp: number; // 26 or 20°C

  // Real-time API data
  wavePoints: WaveDataPoint[];
  currentVectors: CurrentVector[];
  sstPoints: SSTPoint[];
  argoFloats: ArgoFloat[];
  buoys: BuoyData[];
  gliderMissions: GliderMission[];
  ctdStations: CTDCastStation[];
  isosurfaceData: IsosurfaceData | null;
  validationSummary: ValidationSummary | null;
  activeCyclone: CycloneEvent | null;

  // Selection & modals
  selectedBuoy: BuoyData | null;
  selectedArgo: ArgoFloat | null;
  selectedGlider: GliderMission | null;
  selectedCTDStation: CTDCastStation | null;
  isValidationOpen: boolean;
  isTransectOpen: boolean;
  isVolumeSlicerOpen: boolean;
  isCopilotOpen: boolean;
  isDepthSlicerCollapsed: boolean;

  // Time scrubber / 4D temporal playback
  forecastHour: number;
  isPlaying: boolean;
  speed: number;

  // Loading & error statuses
  isLoadingWaves: boolean;
  isLoadingCurrents: boolean;
  isLoadingArgo: boolean;
  isLoadingBuoys: boolean;
  isLoadingGliders: boolean;
  isLoadingCTD: boolean;
  isLoadingIsosurface: boolean;
  apiStatusMessage: string;

  // Actions
  toggleLayer: (layer: 'showWaves' | 'showCurrents' | 'showSST' | 'showSalinity' | 'showArgo' | 'showBuoys' | 'showBathymetry' | 'showGliders' | 'showCTDStations' | 'showIsosurface') => void;
  setVariable: (v: OceanVariable) => void;
  setDepth: (d: number) => void;
  setVerticalExaggeration: (v: number) => void;
  setCurrentDepthLayer: (d: number) => void;
  setIsosurfaceTargetTemp: (t: number) => void;
  setSelectedBuoy: (b: BuoyData | null) => void;
  setSelectedArgo: (a: ArgoFloat | null) => void;
  setSelectedGlider: (g: GliderMission | null) => void;
  setSelectedCTDStation: (c: CTDCastStation | null) => void;
  setIsValidationOpen: (open: boolean) => void;
  setIsTransectOpen: (open: boolean) => void;
  setIsVolumeSlicerOpen: (open: boolean) => void;
  setIsCopilotOpen: (open: boolean) => void;
  setIsDepthSlicerCollapsed: (collapsed: boolean) => void;
  setForecastHour: (h: number | ((prev: number) => number)) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (s: number) => void;
  setActiveCyclone: (c: CycloneEvent | null) => void;

  // API Fetch Actions
  fetchAllLiveOceanData: () => Promise<void>;
  fetchWaves: () => Promise<void>;
  fetchCurrents: (depthM?: number) => Promise<void>;
  fetchArgo: () => Promise<void>;
  fetchBuoys: () => Promise<void>;
  fetchGliders: () => Promise<void>;
  fetchCTDStations: () => Promise<void>;
  fetchIsosurface: (targetTemp?: number) => Promise<void>;
}

export const useOceanStore = create<OceanStoreState>((set, get) => ({
  // Default layer states
  showWaves: false,
  showCurrents: true,
  showSST: true,
  showSalinity: false,
  showArgo: true,
  showBuoys: true,
  showBathymetry: true,
  showGliders: true,
  showCTDStations: true,
  showIsosurface: false,

  variable: 'sst',
  depth: 0,
  verticalExaggeration: 1.0,
  currentDepthLayer: 0,
  isosurfaceTargetTemp: 26.0,

  wavePoints: [],
  currentVectors: [],
  sstPoints: [],
  argoFloats: [],
  buoys: REAL_OMNI_BUOYS,
  gliderMissions: REAL_GLIDERS,
  ctdStations: REAL_CTD_STATIONS,
  isosurfaceData: null,
  validationSummary: null,
  activeCyclone: null,

  selectedBuoy: null,
  selectedArgo: null,
  selectedGlider: null,
  selectedCTDStation: null,
  isValidationOpen: false,
  isTransectOpen: false,
  isVolumeSlicerOpen: false,
  isCopilotOpen: false,
  isDepthSlicerCollapsed: false,

  forecastHour: 0,
  isPlaying: false,
  speed: 1,

  isLoadingWaves: false,
  isLoadingCurrents: false,
  isLoadingArgo: false,
  isLoadingBuoys: false,
  isLoadingGliders: false,
  isLoadingCTD: false,
  isLoadingIsosurface: false,
  apiStatusMessage: 'Initializing live feeds...',

  toggleLayer: (layer) => set((state) => ({ [layer]: !state[layer] })),

  setVariable: (v) => {
    set({ variable: v });
    if (v === 'wave_height') set({ showWaves: true });
    if (v === 'currents') set({ showCurrents: true });
    if (v === 'sst') set({ showSST: true });
    if (v === 'salinity') set({ showSalinity: true });
    if (v === 'chlorophyll') set({ showCTDStations: true, showGliders: true });
  },

  setDepth: (d) => set({ depth: d }),
  setVerticalExaggeration: (v) => set({ verticalExaggeration: Math.max(1.0, Math.min(50.0, v)) }),
  setCurrentDepthLayer: (d) => {
    set({ currentDepthLayer: d });
    get().fetchCurrents(d);
  },
  setIsosurfaceTargetTemp: (t) => {
    set({ isosurfaceTargetTemp: t });
    get().fetchIsosurface(t);
  },

  setSelectedBuoy: (b) => set({ selectedBuoy: b, selectedArgo: null, selectedGlider: null, selectedCTDStation: null }),
  setSelectedArgo: (a) => set({ selectedArgo: a, selectedBuoy: null, selectedGlider: null, selectedCTDStation: null }),
  setSelectedGlider: (g) => set({ selectedGlider: g, selectedBuoy: null, selectedArgo: null, selectedCTDStation: null }),
  setSelectedCTDStation: (c) => set({ selectedCTDStation: c, selectedBuoy: null, selectedArgo: null, selectedGlider: null }),

  setIsValidationOpen: (open) => set({ isValidationOpen: open }),
  setIsTransectOpen: (open) => set({ isTransectOpen: open }),
  setIsVolumeSlicerOpen: (open) => set({ isVolumeSlicerOpen: open }),
  setIsCopilotOpen: (open) => set({ isCopilotOpen: open }),
  setIsDepthSlicerCollapsed: (collapsed) => set({ isDepthSlicerCollapsed: collapsed }),
  setForecastHour: (h) => set((state) => ({ forecastHour: typeof h === 'function' ? h(state.forecastHour) : h })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (s) => set({ speed: s }),
  setActiveCyclone: (c) => set({ activeCyclone: c }),

  fetchWaves: async () => {
    set({ isLoadingWaves: true, apiStatusMessage: 'Fetching live SWH from Open-Meteo Marine...' });
    try {
      const data = await fetchLiveWaveData();
      set({ wavePoints: data, isLoadingWaves: false, apiStatusMessage: 'Live wave height synchronized.' });
      
      const summary = evaluateModelAgainstInSitu(get().buoys, data);
      set({ validationSummary: summary });
    } catch {
      set({ isLoadingWaves: false, apiStatusMessage: 'Wave feed error; retrying...' });
    }
  },

  fetchCurrents: async (depthM = 0) => {
    set({ isLoadingCurrents: true, apiStatusMessage: `Fetching currents at ${depthM}m depth...` });
    try {
      if (depthM === 0) {
        const data = await fetchLiveCurrentVectors();
        set({ currentVectors: data, isLoadingCurrents: false, apiStatusMessage: 'Live surface current vectors synchronized.' });
      } else {
        const resp = await fetch(`/api/ocean/subsurface-currents?depth_m=${depthM}`, { signal: AbortSignal.timeout(3000) });
        if (resp.ok) {
          const json = await resp.json();
          if (json.vectors) {
            set({ currentVectors: json.vectors, isLoadingCurrents: false, apiStatusMessage: `Subsurface currents at ${depthM}m synchronized.` });
            return;
          }
        }
        set({ isLoadingCurrents: false });
      }
    } catch {
      set({ isLoadingCurrents: false });
    }
  },

  fetchArgo: async () => {
    set({ isLoadingArgo: true, apiStatusMessage: 'Connecting to Argo GDAC / Argovis...' });
    try {
      const data = await fetchLiveArgoFloats();
      set({ argoFloats: data, isLoadingArgo: false, apiStatusMessage: 'Active Argo profiling floats loaded.' });
    } catch {
      set({ isLoadingArgo: false });
    }
  },

  fetchBuoys: async () => {
    set({ isLoadingBuoys: true });
    try {
      const resp = await fetch('/api/ocean/in-situ/buoys', { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.buoys && json.buoys.length > 0) {
          set({ buoys: json.buoys });
        }
      }
    } catch {
      // Retain verified in-situ baseline
    }
    const summary = evaluateModelAgainstInSitu(get().buoys, get().wavePoints);
    set({ validationSummary: summary, isLoadingBuoys: false });
  },

  fetchGliders: async () => {
    set({ isLoadingGliders: true });
    try {
      const resp = await fetch('/api/ocean/in-situ/gliders', { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.gliders && json.gliders.length > 0) {
          set({ gliderMissions: json.gliders });
        }
      }
    } catch {
      // Retain verified glider baseline
    }
    set({ isLoadingGliders: false });
  },

  fetchCTDStations: async () => {
    set({ isLoadingCTD: true });
    try {
      const resp = await fetch('/api/ocean/in-situ/ctd-stations', { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.stations && json.stations.length > 0) {
          set({ ctdStations: json.stations });
        }
      }
    } catch {
      // Retain verified CTD baseline
    }
    set({ isLoadingCTD: false });
  },

  fetchIsosurface: async (targetTemp = 26.0) => {
    set({ isLoadingIsosurface: true, apiStatusMessage: `Computing ${targetTemp}°C Isosurface (TCHP)...` });
    try {
      const resp = await fetch(`/api/ocean/isosurface?target_temp_c=${targetTemp}&resolution=2.0`, { signal: AbortSignal.timeout(4000) });
      if (resp.ok) {
        const json = await resp.json();
        set({ isosurfaceData: json, isLoadingIsosurface: false, apiStatusMessage: `${targetTemp}°C Isosurface (D${Math.round(targetTemp)}) computed.` });
      } else {
        set({ isLoadingIsosurface: false });
      }
    } catch {
      set({ isLoadingIsosurface: false });
    }
  },

  fetchAllLiveOceanData: async () => {
    const { fetchWaves, fetchCurrents, fetchArgo, fetchBuoys, fetchGliders, fetchCTDStations, fetchIsosurface } = get();
    await Promise.allSettled([
      fetchWaves(),
      fetchCurrents(0),
      fetchArgo(),
      fetchBuoys(),
      fetchGliders(),
      fetchCTDStations(),
      fetchIsosurface(26.0),
      fetchLiveSSTGrid().then(sst => set({ sstPoints: sst }))
    ]);
    set({ apiStatusMessage: 'All live oceanographic systems active.' });
  }
}));

