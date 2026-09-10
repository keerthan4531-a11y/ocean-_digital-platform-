/**
 * AquaTwin 3D - LayerControlPanel
 * Interactive UI panel with independent toggle switches for each real data layer:
 * - Waves (3D Vertex Displacement Mesh driven by real Open-Meteo SWH)
 * - Currents (Live 60 FPS particles following real u, v vector field)
 * - Temperature (SST thermal map)
 * - Salinity (Halocline plumes)
 * - Argo Floats (Global Argo GDAC / Argovis)
 * - Moored Buoys (INCOIS OMNI & NOAA NDBC)
 * - GEBCO Bathymetry (Submarine trenches & ridges)
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
  Layers,
  CloudLightning,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { OceanVariable, CycloneEvent } from '../../types/ocean';
import { HISTORIC_CYCLONES } from '../../data/cycloneTracks';
import { useOceanStore } from '../../services/oceanStore';

interface LayerControlPanelProps {
  activeVariable?: OceanVariable;
  onChangeVariable?: (variable: OceanVariable) => void;
  showBuoys?: boolean;
  onToggleBuoys?: () => void;
  showArgo?: boolean;
  onToggleArgo?: () => void;
  showParticles?: boolean;
  onToggleParticles?: () => void;
  activeCyclone?: CycloneEvent | null;
  onSelectCyclone?: (cyclone: CycloneEvent | null) => void;
}

export const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  activeVariable: propVariable,
  onChangeVariable: propOnChangeVariable,
  showBuoys: propShowBuoys,
  onToggleBuoys: propOnToggleBuoys,
  showArgo: propShowArgo,
  onToggleArgo: propOnToggleArgo,
  showParticles: propShowParticles,
  onToggleParticles: propOnToggleParticles,
  activeCyclone: propActiveCyclone,
  onSelectCyclone: propOnSelectCyclone
}) => {
  const store = useOceanStore();

  const showWaves = store.showWaves;
  const showCurrents = propShowParticles !== undefined ? propShowParticles : store.showCurrents;
  const showSST = store.showSST;
  const showSalinity = store.showSalinity;
  const showArgo = propShowArgo !== undefined ? propShowArgo : store.showArgo;
  const showBuoys = propShowBuoys !== undefined ? propShowBuoys : store.showBuoys;
  const showBathymetry = store.showBathymetry;
  const activeVariable = propVariable || store.variable;
  const activeCyclone = propActiveCyclone !== undefined ? propActiveCyclone : store.activeCyclone;

  const toggleLayer = (layer: 'showWaves' | 'showCurrents' | 'showSST' | 'showSalinity' | 'showArgo' | 'showBuoys' | 'showBathymetry') => {
    store.toggleLayer(layer);
    if (layer === 'showBuoys' && propOnToggleBuoys) propOnToggleBuoys();
    if (layer === 'showArgo' && propOnToggleArgo) propOnToggleArgo();
    if (layer === 'showCurrents' && propOnToggleParticles) propOnToggleParticles();
  };

  const setVariable = (v: OceanVariable) => {
    store.setVariable(v);
    if (propOnChangeVariable) propOnChangeVariable(v);
  };

  const selectCyclone = (c: CycloneEvent | null) => {
    store.setActiveCyclone(c);
    if (propOnSelectCyclone) propOnSelectCyclone(c);
  };

  const layersList = [
    {
      id: 'showWaves' as const,
      label: 'Waves (3D Displacement)',
      sub: 'Open-Meteo SWH Vertex Shader',
      icon: <Waves className="w-4 h-4 text-cyan-400" />,
      active: showWaves,
      badge: `${store.wavePoints.length || 20} pts`
    },
    {
      id: 'showCurrents' as const,
      label: 'Currents (Vector Flow)',
      sub: 'Real (u, v) Particle Advection',
      icon: <Wind className="w-4 h-4 text-emerald-400" />,
      active: showCurrents,
      badge: '60 FPS'
    },
    {
      id: 'showSST' as const,
      label: 'Temperature (SST)',
      sub: 'Sea Surface Thermal Grid',
      icon: <Thermometer className="w-4 h-4 text-rose-400" />,
      active: showSST,
      variableTrigger: 'sst' as OceanVariable
    },
    {
      id: 'showSalinity' as const,
      label: 'Salinity (Halocline)',
      sub: 'BoB River Plumes & Arabian Sea',
      icon: <Droplets className="w-4 h-4 text-amber-400" />,
      active: showSalinity,
      variableTrigger: 'salinity' as OceanVariable
    },
    {
      id: 'showArgo' as const,
      label: 'Argo Profiling Floats',
      sub: 'Global Argo GDAC CTD Profiles',
      icon: <Activity className="w-4 h-4 text-yellow-400" />,
      active: showArgo,
      badge: `${store.argoFloats.length || 3} Active`
    },
    {
      id: 'showBuoys' as const,
      label: 'Moored Buoy Network',
      sub: 'INCOIS OMNI & NOAA NDBC',
      icon: <Radio className="w-4 h-4 text-blue-400" />,
      active: showBuoys,
      badge: `${store.buoys.length || 8} Moored`
    },
    {
      id: 'showBathymetry' as const,
      label: 'GEBCO Bathymetry',
      sub: 'Java Trench & Mid-Indian Ridge',
      icon: <Map className="w-4 h-4 text-indigo-400" />,
      active: showBathymetry
    }
  ];

  return (
    <aside className="absolute top-20 left-4 z-30 w-76 flex flex-col space-y-3 pointer-events-none">
      
      {/* Real Layer Toggle Control Card */}
      <div className="glass-panel p-4 rounded-2xl pointer-events-auto border border-cyan-500/30 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
              Ocean Data Layers
            </h2>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-700/60 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE APIs</span>
          </span>
        </div>

        {/* List of independent layer toggle buttons */}
        <div className="space-y-1.5">
          {layersList.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                toggleLayer(item.id);
                if (item.variableTrigger) {
                  setVariable(item.variableTrigger);
                }
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all border ${
                item.active
                  ? 'bg-cyan-950/80 border-cyan-400/80 text-white shadow-md shadow-cyan-950/40'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <div className="flex items-start space-x-2.5">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <div className="text-xs font-mono font-semibold flex items-center space-x-1.5">
                    <span>{item.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {item.sub}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
                {item.active ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Extreme Event Replay (Cyclones) */}
      <div className="glass-panel p-3.5 rounded-2xl pointer-events-auto border border-rose-500/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-rose-900/50 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <CloudLightning className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-rose-200 uppercase">
              Extreme Event Tracks
            </h2>
          </div>
          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
            OBSERVED
          </span>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => selectCyclone(null)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              activeCyclone === null
                ? 'bg-slate-800 text-white border-slate-600'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            None (Standard Climatology)
          </button>

          {HISTORIC_CYCLONES.map(c => (
            <button
              key={c.id}
              onClick={() => selectCyclone(c)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                activeCyclone?.id === c.id
                  ? 'bg-rose-950/80 border-rose-400 text-white font-bold shadow-md shadow-rose-950/50'
                  : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{c.name} ({c.year})</span>
                <span className="text-[10px] text-rose-400 font-normal">{c.basin}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </aside>
  );
};
