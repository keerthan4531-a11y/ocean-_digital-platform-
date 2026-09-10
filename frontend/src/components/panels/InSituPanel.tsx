/**
 * AquaTwin 3D - InSituPanel (Mission Control Left Sub-Panel)
 * Lists real active in-situ moored buoys and Argo floats with live status pulse dots
 * and one-click deep telemetry modal activation.
 */

import React, { useState } from 'react';
import { Radio, Activity, ChevronRight, Waves, Thermometer } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { StatusDot } from '../ui/StatusDot';
import { useOceanStore } from '../../services/oceanStore';
import { BuoyData, ArgoFloat } from '../../types/ocean';

export const InSituPanel: React.FC = () => {
  const store = useOceanStore();
  const [tab, setTab] = useState<'buoys' | 'argo'>('buoys');

  return (
    <GlassPanel
      title="In-Situ Telemetry"
      subtitle="Calibrated Ground-Truth Sensors"
      icon={Radio}
      glowColor="emerald"
      action={
        <div className="flex bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] font-telemetry">
          <button
            onClick={() => setTab('buoys')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              tab === 'buoys' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Buoys ({store.buoys.length})
          </button>
          <button
            onClick={() => setTab('argo')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              tab === 'argo' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Argo ({store.argoFloats.length})
          </button>
        </div>
      }
    >
      <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar pr-0.5 pt-1">
        {tab === 'buoys' && (
          <>
            {store.buoys.map((b: BuoyData) => {
              const isSelected = store.selectedBuoy?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => store.setSelectedBuoy(b)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-950/70 border-emerald-400/60 shadow-sm shadow-emerald-950'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <StatusDot status={b.sensor_health === 'OPTIMAL' ? 'active' : 'warning'} size="sm" />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-telemetry font-bold text-white">{b.id}</span>
                        <span className="text-[10px] text-slate-400 font-telemetry truncate max-w-[110px]">
                          {b.name}
                        </span>
                      </div>
                      <div className="text-[9px] font-telemetry text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{b.lat.toFixed(1)}°N, {b.lon.toFixed(1)}°E</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-rose-300 font-semibold">{b.sst_c}°C</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-cyan-300">{b.wave_height_m}m</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
              );
            })}
          </>
        )}

        {tab === 'argo' && (
          <>
            {store.argoFloats.map((a: ArgoFloat) => {
              const isSelected = store.selectedArgo?.wmo_id === a.wmo_id;
              return (
                <div
                  key={a.wmo_id}
                  onClick={() => store.setSelectedArgo(a)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-yellow-950/70 border-yellow-400/60 shadow-sm shadow-yellow-950'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <StatusDot status="active" size="sm" />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-telemetry font-bold text-yellow-300">#{a.wmo_id}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-950/60 text-yellow-200 border border-yellow-800/60 font-telemetry">
                          {a.platform_type.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[9px] font-telemetry text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>Cycle #{a.cycle_number}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-cyan-300">0-{a.max_depth_m}m</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-rose-300">{a.surface_temp_c}°C</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
              );
            })}
          </>
        )}
      </div>
    </GlassPanel>
  );
};
