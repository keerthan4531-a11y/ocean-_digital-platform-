/**
 * AquaTwin 3D - VolumeControlPanel
 * Mission control side panel for the 3D Orthogonal Volume Slicing Box.
 * Provides:
 * - Region selection (Bay of Bengal, Arabian Sea, Equatorial IO, Full Indian Ocean)
 * - 3D Orthogonal Cutting Sliders: X (Latitude), Y (Depth 0m-2000m), Z (Longitude)
 * - Variable Selector (Temperature, Salinity, Currents, Chlorophyll, Density, Oxygen)
 * - Live Hydrographic Probe Telemetry HUD (All 6 physical variables computed at slice intersection)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Layers, 
  Compass, 
  Activity, 
  Droplets, 
  Wind, 
  Sparkles, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Gauge, 
  Sliders,
  Radio,
  Clock
} from 'lucide-react';
import { 
  VolumeRegion, 
  VolumeProbeData, 
  VolumeVariable 
} from '../../types/ocean';
import { 
  VOLUME_REGIONS, 
  VOLUME_VARIABLE_META, 
  probeVolumePoint 
} from '../../services/volumeDataService';

interface VolumeControlPanelProps {
  selectedRegion: VolumeRegion;
  onSelectRegion: (region: VolumeRegion) => void;
  cutLat: number;
  onCutLatChange: (lat: number) => void;
  cutDepth: number;
  onCutDepthChange: (depth: number) => void;
  cutLon: number;
  onCutLonChange: (lon: number) => void;
  activeVariable: VolumeVariable;
  onSelectVariable: (variable: VolumeVariable) => void;
  visiblePlanes: { x: boolean; y: boolean; z: boolean };
  onTogglePlane: (plane: 'x' | 'y' | 'z') => void;
  probeData: VolumeProbeData;
  onResetSlices: () => void;
}

const VARIABLES: VolumeVariable[] = [
  'temperature',
  'salinity',
  'current_speed',
  'chlorophyll',
  'density',
  'oxygen'
];

const DEPTH_PRESETS = [
  { depth: 0, label: '0m', desc: 'Sea Surface' },
  { depth: 75, label: '75m', desc: 'Thermocline' },
  { depth: 200, label: '200m', desc: 'Mid-Water' },
  { depth: 500, label: '500m', desc: 'Intermediate' },
  { depth: 1000, label: '1000m', desc: 'Deep Layer' },
  { depth: 2000, label: '2000m', desc: 'Abyssal' }
];

export const VolumeControlPanel: React.FC<VolumeControlPanelProps> = ({
  selectedRegion,
  onSelectRegion,
  cutLat,
  onCutLatChange,
  cutDepth,
  onCutDepthChange,
  cutLon,
  onCutLonChange,
  activeVariable,
  onSelectVariable,
  visiblePlanes,
  onTogglePlane,
  probeData,
  onResetSlices
}) => {
  const bounds = selectedRegion.bounds;

  return (
    <div className="flex flex-col space-y-3.5 w-84 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar font-telemetry select-none text-slate-100">
      
      {/* 1. Region Selector Card */}
      <div className="glass-mission p-3.5 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-cyan-950 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Box className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-header font-bold tracking-wider text-cyan-300 uppercase">
              Ocean Region Box
            </span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-700/50 font-mono">
            3D NetCDF Grid
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {VOLUME_REGIONS.map((reg) => {
            const isSelected = reg.id === selectedRegion.id;
            return (
              <button
                key={reg.id}
                onClick={() => onSelectRegion(reg)}
                className={`px-2.5 py-2 rounded-xl text-left transition-all border text-xs cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="font-header font-bold truncate text-[11px] flex items-center justify-between w-full">
                  <span>{reg.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />}
                </div>
                <span className="text-[8px] text-slate-400 font-mono mt-0.5 truncate">
                  {reg.bounds.latMin}°N–{reg.bounds.latMax}°N
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[9px] text-slate-400 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/50">
          {selectedRegion.description}
        </p>
      </div>

      {/* 2. Variable Selector (Color Theme for Slices) */}
      <div className="glass-mission p-3.5 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-cyan-950 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-header font-bold tracking-wider text-cyan-300 uppercase">
              Slice Variable Color
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono">
            {VOLUME_VARIABLE_META[activeVariable].unit}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {VARIABLES.map((v) => {
            const meta = VOLUME_VARIABLE_META[v];
            const isSelected = v === activeVariable;
            return (
              <button
                key={v}
                onClick={() => onSelectVariable(v)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col items-center text-center ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-base mb-0.5">{meta.icon}</span>
                <span className="text-[9px] font-semibold leading-tight">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Orthogonal 3D Cutting Slicers (X, Y, Z) */}
      <div className="glass-mission p-3.5 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-header font-bold tracking-wider text-cyan-300 uppercase">
              3D Orthogonal Slicers
            </span>
          </div>
          <button
            onClick={onResetSlices}
            title="Reset cutting planes to center"
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 transition-colors border border-slate-700/50 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Y-Axis: Depth Slicer (0m to 2000m) */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-cyan-900/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onTogglePlane('y')}
                className={`p-0.5 rounded transition-colors ${visiblePlanes.y ? 'text-cyan-400' : 'text-slate-600'}`}
                title="Toggle Y-Plane Visibility"
              >
                {visiblePlanes.y ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <span className="font-bold text-cyan-300 text-[11px]">Y-Cut: Water Depth</span>
            </div>
            <span className="font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/60 text-[10px]">
              -{cutDepth}m
            </span>
          </div>

          <input
            type="range"
            min={bounds.depthMin}
            max={bounds.depthMax}
            step={25}
            value={cutDepth}
            onChange={(e) => onCutDepthChange(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer appearance-none"
          />

          <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono">
            {DEPTH_PRESETS.map((dp) => (
              <button
                key={dp.depth}
                onClick={() => onCutDepthChange(dp.depth)}
                className={`hover:text-cyan-300 transition-colors cursor-pointer ${cutDepth === dp.depth ? 'text-cyan-300 font-bold' : ''}`}
              >
                {dp.label}
              </button>
            ))}
          </div>
        </div>

        {/* X-Axis: Latitude Slicer */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-emerald-900/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onTogglePlane('x')}
                className={`p-0.5 rounded transition-colors ${visiblePlanes.x ? 'text-emerald-400' : 'text-slate-600'}`}
                title="Toggle X-Plane Visibility"
              >
                {visiblePlanes.x ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <span className="font-bold text-emerald-300 text-[11px]">X-Cut: Latitude Slice</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60 text-[10px]">
              {cutLat.toFixed(1)}°N
            </span>
          </div>

          <input
            type="range"
            min={bounds.latMin}
            max={bounds.latMax}
            step={0.5}
            value={cutLat}
            onChange={(e) => onCutLatChange(Number(e.target.value))}
            className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer appearance-none"
          />

          <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono">
            <span>{bounds.latMin}°N</span>
            <span>{((bounds.latMin + bounds.latMax) / 2).toFixed(0)}°N</span>
            <span>{bounds.latMax}°N</span>
          </div>
        </div>

        {/* Z-Axis: Longitude Slicer */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-amber-900/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onTogglePlane('z')}
                className={`p-0.5 rounded transition-colors ${visiblePlanes.z ? 'text-amber-400' : 'text-slate-600'}`}
                title="Toggle Z-Plane Visibility"
              >
                {visiblePlanes.z ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <span className="font-bold text-amber-300 text-[11px]">Z-Cut: Longitude Slice</span>
            </div>
            <span className="font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60 text-[10px]">
              {cutLon.toFixed(1)}°E
            </span>
          </div>

          <input
            type="range"
            min={bounds.lonMin}
            max={bounds.lonMax}
            step={0.5}
            value={cutLon}
            onChange={(e) => onCutLonChange(Number(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer appearance-none"
          />

          <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono">
            <span>{bounds.lonMin}°E</span>
            <span>{((bounds.lonMin + bounds.lonMax) / 2).toFixed(0)}°E</span>
            <span>{bounds.lonMax}°E</span>
          </div>
        </div>
      </div>

      {/* 4. Live Intersection Probe Telemetry Box */}
      <div className="glass-mission p-3.5 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-cyan-950 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-header font-bold tracking-wider text-cyan-300 uppercase">
              Intersection Probe
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-[9px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE 6-DOF</span>
          </div>
        </div>

        {/* Intersection Coordinates Header */}
        <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 text-[10px] font-mono flex items-center justify-between mb-2.5 text-cyan-200">
          <span>📍 ({probeData.lat.toFixed(1)}°N, {probeData.lon.toFixed(1)}°E)</span>
          <span className="font-bold text-cyan-400">Depth: -{probeData.depth_m}m</span>
        </div>

        {/* 6 Physical Oceanographic Parameters */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          
          {/* 1. Water Temperature */}
          <div className="bg-slate-900/60 p-2 rounded-xl border border-red-950/60 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 flex items-center gap-1">
              <span>🌡️</span>
              <span>Water Temp</span>
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm font-bold text-red-300 font-mono">
                {probeData.temperature_c}°C
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                {probeData.depth_m < 50 ? 'Mixed' : probeData.depth_m < 300 ? 'Thermo' : 'Abyssal'}
              </span>
            </div>
          </div>

          {/* 2. Salinity */}
          <div className="bg-slate-900/60 p-2 rounded-xl border border-blue-950/60 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 flex items-center gap-1">
              <span>🧂</span>
              <span>Salinity</span>
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm font-bold text-blue-300 font-mono">
                {probeData.salinity_psu} PSU
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                {probeData.salinity_psu > 35.5 ? 'High ASW' : probeData.salinity_psu < 33 ? 'River Plume' : 'Normal'}
              </span>
            </div>
          </div>

          {/* 3. Ocean Currents */}
          <div className="bg-slate-900/60 p-2 rounded-xl border border-cyan-950/60 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 flex items-center gap-1">
              <span>🌊</span>
              <span>Current Flow</span>
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm font-bold text-cyan-300 font-mono">
                {probeData.current_speed_ms} m/s
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                {probeData.current_dir_deg}° flow
              </span>
            </div>
          </div>

          {/* 4. Chlorophyll */}
          <div className="bg-slate-900/60 p-2 rounded-xl border border-emerald-950/60 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 flex items-center gap-1">
              <span>🟢</span>
              <span>Chlorophyll-a</span>
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm font-bold text-emerald-300 font-mono">
                {probeData.chlorophyll_ug_l} µg/L
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                {probeData.depth_m >= 40 && probeData.depth_m <= 90 ? 'DCM Peak' : 'Basal'}
              </span>
            </div>
          </div>

          {/* 5. Dissolved Oxygen */}
          <div className="bg-slate-900/60 p-2 rounded-xl border border-purple-950/60 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 flex items-center gap-1">
              <span>⚗️</span>
              <span>Dissolved O₂</span>
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm font-bold text-purple-300 font-mono">
                {probeData.oxygen_umol_kg} µmol
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                {probeData.oxygen_umol_kg < 50 ? 'OMZ Core' : 'Oxic'}
              </span>
            </div>
          </div>

          {/* 6. Hydrostatic Pressure & Density */}
          <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 flex items-center gap-1">
              <span>📏</span>
              <span>Pressure / ρ</span>
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-200 font-mono">
                {probeData.pressure_bar} bar
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                {probeData.density_kg_m3} kg/m³
              </span>
            </div>
          </div>

        </div>

        {/* 4D Temporal Changes Telemetry Banner */}
        <div className="mt-3 pt-2.5 border-t border-cyan-950 flex items-center justify-between text-[9px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Temporal Evolution</span>
          </span>
          <span className="text-cyan-300 font-semibold font-mono">
            4D Stepping Synchronized
          </span>
        </div>

      </div>

    </div>
  );
};
