/**
 * AquaTwin 3D - LegendPanel (Bottom Right Scientific Colorbar)
 * Renders scientific continuous gradient color scales with dynamic min/max telemetry limits.
 * Dynamically synchronizes temperature scales when slicing into the vertical water column (0m to -2000m).
 */

import React from 'react';
import { useOceanStore } from '../../services/oceanStore';
import { OceanVariable } from '../../types/ocean';

interface LegendConfig {
  label: string;
  unit: string;
  min: number | string;
  mid: number | string;
  max: number | string;
  gradientClass: string;
}

export const LegendPanel: React.FC = () => {
  const store = useOceanStore();
  const variable = store.variable;
  const depth = store.depth;

  // Compute depth-adjusted temperature legend
  const getTempConfig = (d: number): LegendConfig => {
    if (d <= 0) {
      return {
        label: 'Sea Surface Temp',
        unit: '°C',
        min: '22°C',
        mid: '28°C',
        max: '32°C',
        gradientClass: 'from-[#1e3a8a] via-[#0284c7] via-[#ea580c] to-[#dc2626]'
      };
    } else if (d <= 50) {
      return {
        label: 'Mixed Layer Temp (-50m)',
        unit: '°C',
        min: '20°C',
        mid: '25°C',
        max: '29.5°C',
        gradientClass: 'from-[#1e3a8a] via-[#0284c7] via-[#10b981] to-[#ea580c]'
      };
    } else if (d <= 100) {
      return {
        label: 'Thermocline Start (-100m)',
        unit: '°C',
        min: '15°C',
        mid: '20°C',
        max: '25°C',
        gradientClass: 'from-[#03045e] via-[#0077b6] via-[#14b8a6] to-[#fbbf24]'
      };
    } else if (d <= 200) {
      return {
        label: 'Thermocline Core (-200m)',
        unit: '°C',
        min: '10°C',
        mid: '14.5°C',
        max: '18°C',
        gradientClass: 'from-[#03045e] via-[#023e8a] to-[#0077b6]'
      };
    } else if (d <= 500) {
      return {
        label: 'Intermediate Temp (-500m)',
        unit: '°C',
        min: '6°C',
        mid: '9.5°C',
        max: '12°C',
        gradientClass: 'from-[#000814] via-[#001845] to-[#0284c7]'
      };
    } else if (d <= 1000) {
      return {
        label: 'Deep Water Temp (-1000m)',
        unit: '°C',
        min: '3.5°C',
        mid: '5.8°C',
        max: '8°C',
        gradientClass: 'from-[#000000] via-[#03071e] to-[#3b82f6]'
      };
    } else {
      return {
        label: 'Abyssal Plain Temp (-2000m)',
        unit: '°C',
        min: '1.5°C',
        mid: '2.4°C',
        max: '4°C',
        gradientClass: 'from-[#000000] via-[#020617] to-[#1e1b4b]'
      };
    }
  };

  const configMap: Record<OceanVariable, LegendConfig> = {
    sst: getTempConfig(depth),
    wave_height: {
      label: 'Significant Wave (SWH)',
      unit: 'meters',
      min: '0.5m',
      mid: '2.2m',
      max: '4.5m',
      gradientClass: 'from-[#020617] via-[#0284c7] via-[#00f2fe] to-[#e0f7fa]'
    },
    currents: {
      label: depth > 0 ? `Currents (-${depth}m)` : 'Current Velocity',
      unit: 'm/s',
      min: '0.02',
      mid: depth > 200 ? '0.25' : '0.55',
      max: depth > 200 ? '0.60' : '1.20',
      gradientClass: 'from-[#0070ba] via-[#00e676] via-[#ffb300] to-[#ff1744]'
    },
    salinity: {
      label: 'Ocean Salinity',
      unit: 'PSU',
      min: '31.0',
      mid: '34.5',
      max: '37.0',
      gradientClass: 'from-[#082f49] via-[#0369a1] via-[#10b981] to-[#f59e0b]'
    },
    ssh: {
      label: 'SSH Anomaly',
      unit: 'meters',
      min: '-0.25',
      mid: '0.00',
      max: '+0.25',
      gradientClass: 'from-[#3b82f6] via-[#082f49] to-[#ef4444]'
    },
    chlorophyll: {
      label: 'Chlorophyll-a (log)',
      unit: 'µg/L',
      min: '0.01',
      mid: '0.5',
      max: '10.0',
      gradientClass: 'from-[#020617] via-[#064e3b] via-[#10b981] to-[#a7f3d0]'
    }
  };

  const currentConfig = configMap[variable] || configMap.sst;

  return (
    <div className="glass-mission px-3.5 py-2.5 rounded-xl border border-slate-800 shadow-xl w-68 space-y-3 bg-[#090a0f]/92 select-none">
      {/* Primary Variable Legend */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-header text-slate-300 uppercase tracking-wider mb-1.5">
          <span className="font-bold">{currentConfig.label}</span>
          <span className="font-telemetry text-cyan-300 font-semibold">[{currentConfig.unit}]</span>
        </div>

        {/* Smooth Continuous Scientific Gradient Bar */}
        <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${currentConfig.gradientClass} border border-slate-700/50 shadow-inner mb-1.5`} />

        {/* Min / Mid / Max Readouts */}
        <div className="flex items-center justify-between text-[9px] font-telemetry text-slate-400">
          <span>{currentConfig.min}</span>
          <span className="text-slate-500">{currentConfig.mid}</span>
          <span className="text-slate-200 font-semibold">{currentConfig.max}</span>
        </div>
      </div>

      {/* TCHP / Isosurface Legend (only when isosurface layer is active) */}
      {store.showIsosurface && (
        <div className="pt-2 border-t border-cyan-950/80">
          <div className="flex items-center justify-between text-[10px] font-header text-slate-300 uppercase tracking-wider mb-1.5">
            <span className="font-bold">TCHP Risk (D{store.isosurfaceTargetTemp})</span>
            <span className="font-telemetry text-rose-300 font-semibold">[kJ/cm²]</span>
          </div>

          {/* TCHP Risk Color Bar */}
          <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-[#0ea5e9] via-[#06b6d4] via-[#f59e0b] to-[#ef4444] border border-slate-700/50 shadow-inner mb-1.5" />

          <div className="flex items-center justify-between text-[9px] font-telemetry text-slate-400">
            <span className="text-cyan-300">Low (&lt;40)</span>
            <span className="text-amber-300">High (80)</span>
            <span className="text-rose-300 font-semibold">V.High (&gt;120)</span>
          </div>
        </div>
      )}

      {/* Subsurface Current Depth Legend (when currents are on and at depth) */}
      {store.showCurrents && store.currentDepthLayer > 0 && (
        <div className="pt-2 border-t border-cyan-950/80">
          <div className="flex items-center justify-between text-[9px] font-telemetry text-slate-400">
            <span className="text-cyan-300">● Surface 0m</span>
            <span className="text-blue-400">● 100m</span>
            <span className="text-indigo-400">● 500m</span>
          </div>
        </div>
      )}
    </div>
  );
};
