import React from 'react';
import { OceanVariable } from '../../types/ocean';

interface ColorScaleLegendProps {
  variable: OceanVariable;
  depth: number;
}

export const ColorScaleLegend: React.FC<ColorScaleLegendProps> = ({ variable, depth }) => {
  const configs: Record<OceanVariable, { title: string; unit: string; gradientClass: string; min: string; mid: string; max: string }> = {
    sst: {
      title: depth > 0 ? `Water Temp (-${depth}m)` : 'Sea Surface Temp',
      unit: '°C',
      gradientClass: 'gradient-thermal',
      min: depth > 200 ? '2.0°' : '24.0°',
      mid: depth > 200 ? '12.0°' : '28.0°',
      max: depth > 200 ? '22.0°' : '31.5°',
    },
    salinity: {
      title: 'Ocean Salinity',
      unit: 'PSU',
      gradientClass: 'gradient-salinity',
      min: '32.0',
      mid: '34.5',
      max: '37.0',
    },
    currents: {
      title: 'Current Velocity',
      unit: 'm/s',
      gradientClass: 'gradient-currents',
      min: '0.0',
      mid: '0.45',
      max: '1.2+',
    },
    wave_height: {
      title: 'Significant Wave Height',
      unit: 'meters',
      gradientClass: 'gradient-viridis',
      min: '0.5m',
      mid: '2.0m',
      max: '4.5m',
    },
    ssh: {
      title: 'Sea Surface Height Anomaly',
      unit: 'meters',
      gradientClass: 'gradient-salinity',
      min: '-0.25m',
      mid: '0.0m',
      max: '+0.30m',
    },
    chlorophyll: {
      title: 'Chlorophyll-a (BGC)',
      unit: 'µg/L',
      gradientClass: 'gradient-viridis',
      min: '0.01',
      mid: '0.50',
      max: '5.0+',
    }
  };

  const config = configs[variable] || configs.sst;

  return (
    <div className="absolute right-4 bottom-6 z-30 pointer-events-none">
      <div className="glass-panel px-3.5 py-2.5 rounded-xl border border-sky-500/30 shadow-xl pointer-events-auto w-56 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-300 mb-1.5 font-bold">
          <span className="truncate">{config.title}</span>
          <span className="text-cyan-400 text-[11px]">[{config.unit}]</span>
        </div>

        {/* Gradient Bar */}
        <div className={`h-2.5 w-full rounded-full border border-slate-700 ${config.gradientClass} shadow-inner`} />

        {/* Ticks */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
          <span>{config.min}</span>
          <span>{config.mid}</span>
          <span>{config.max}</span>
        </div>
      </div>
    </div>
  );
};
