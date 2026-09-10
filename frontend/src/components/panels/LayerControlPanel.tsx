/**
 * AquaTwin 3D - LayerControlPanel (Mission Control Left Sidebar)
 * Wraps in GlassPanel and provides AnimatedToggle switches for each real data layer.
 */

import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Waves, 
  Radio, 
  Activity, 
  Map, 
  Layers
} from 'lucide-react';
import { OceanVariable } from '../../types/ocean';
import { GlassPanel } from './GlassPanel';
import { AnimatedToggle } from '../ui/AnimatedToggle';
import { useOceanStore } from '../../services/oceanStore';

interface LayerControlPanelProps {
  activeVariable?: OceanVariable;
  onChangeVariable?: (v: OceanVariable) => void;
}

export const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  activeVariable,
  onChangeVariable
}) => {
  const store = useOceanStore();
  const currentVariable = activeVariable || store.variable;

  const setVar = (v: OceanVariable) => {
    store.setVariable(v);
    if (onChangeVariable) onChangeVariable(v);
  };

  const layers = [
    {
      id: 'showWaves' as const,
      label: 'Waves (3D Surface)',
      sub: 'Open-Meteo SWH Vertex Shader',
      icon: Waves,
      active: store.showWaves,
      badge: `${store.wavePoints.length || 16} pts`,
      color: 'cyan' as const
    },
    {
      id: 'showCurrents' as const,
      label: 'Currents (u, v Vectors)',
      sub: 'Real Advection Field (60 FPS)',
      icon: Wind,
      active: store.showCurrents,
      badge: `${store.currentVectors.length || 16} vec`,
      color: 'emerald' as const
    },
    {
      id: 'showSST' as const,
      label: 'Sea Surface Temp',
      sub: 'Thermal Gradient Grid',
      icon: Thermometer,
      active: store.showSST,
      triggerVar: 'sst' as OceanVariable,
      badge: '°C',
      color: 'cyan' as const
    },
    {
      id: 'showSalinity' as const,
      label: 'Salinity (Halocline)',
      sub: 'BoB Runoff & Arabian Evaporation',
      icon: Droplets,
      active: store.showSalinity,
      triggerVar: 'salinity' as OceanVariable,
      badge: 'PSU',
      color: 'amber' as const
    },
    {
      id: 'showArgo' as const,
      label: 'Argo 3D Floats',
      sub: 'GDAC Subsurface CTD Profiles',
      icon: Activity,
      active: store.showArgo,
      badge: `${store.argoFloats.length || 3} Active`,
      color: 'cyan' as const
    },
    {
      id: 'showBuoys' as const,
      label: 'Moored Buoy Network',
      sub: 'INCOIS OMNI & NOAA NDBC',
      icon: Radio,
      active: store.showBuoys,
      badge: `${store.buoys.length || 8} Moored`,
      color: 'cyan' as const
    },
    {
      id: 'showBathymetry' as const,
      label: 'GEBCO Bathymetry',
      sub: 'Mid-Indian Ridge & Java Trench',
      icon: Map,
      active: store.showBathymetry,
      badge: 'Relief',
      color: 'cyan' as const
    }
  ];

  return (
    <GlassPanel
      title="Ocean Data Layers"
      subtitle="Numerical Models & In-Situ Feeds"
      icon={Layers}
      glowColor="cyan"
    >
      <div className="space-y-1.5 pt-1">
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <div
              key={layer.id}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                layer.active
                  ? 'bg-cyan-950/70 border-cyan-500/40 text-white shadow-sm shadow-cyan-950/40'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div 
                className="flex items-center space-x-2.5 flex-1 select-none cursor-default"
                onClick={() => {
                  if (layer.triggerVar) setVar(layer.triggerVar);
                }}
              >
                <div className={`p-1.5 rounded-lg ${layer.active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-header font-semibold tracking-wide flex items-center gap-1.5">
                    <span>{layer.label}</span>
                    {layer.triggerVar && currentVariable === layer.triggerVar && layer.active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[9px] font-telemetry text-slate-400">
                    {layer.sub}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 pl-1">
                {layer.badge && (
                  <span className="text-[9px] font-telemetry px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                    {layer.badge}
                  </span>
                )}
                <AnimatedToggle
                  size="sm"
                  checked={layer.active}
                  onChange={() => {
                    store.toggleLayer(layer.id);
                    if (!layer.active && layer.triggerVar) setVar(layer.triggerVar);
                  }}
                  activeColor={layer.color}
                  ariaLabel={`Toggle ${layer.label}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};
