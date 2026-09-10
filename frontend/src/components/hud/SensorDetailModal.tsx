import React, { useState } from 'react';
import { X, Activity, Radio, Waves, Thermometer, Wind, Droplets, Compass, ShieldCheck } from 'lucide-react';
import type { OmniBuoy, ArgoFloat } from '../../types/ocean';

interface SensorDetailModalProps {
  buoy: OmniBuoy | null;
  argo: ArgoFloat | null;
  onClose: () => void;
}

export const SensorDetailModal: React.FC<SensorDetailModalProps> = ({
  buoy,
  argo,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'temperature' | 'salinity'>('temperature');

  if (!buoy && !argo) return null;

  if (argo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="glass-panel w-full max-w-3xl rounded-2xl border border-yellow-500/40 p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-sky-900/50 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-wide text-white">
                    Argo Profiling Float #{argo.wmo_id}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono">
                    {argo.platform_type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {argo.basin} | Lat: {argo.lat}°N, Lon: {argo.lon}°E | Status: {argo.status}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ARGO FLOAT CTD PROFILE VIEW */}
          <div className="space-y-4">
            {/* Top Quick Status Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Mission Cycle</span>
                <span className="text-lg font-bold text-white font-mono">Cycle #{argo.cycle_number}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Max Dive Depth</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">-{argo.max_depth_m}m</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Surface Temp</span>
                <span className="text-lg font-bold text-red-400 font-mono">{argo.surface_temp_c}°C</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Surface Salinity</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{argo.surface_salinity_psu} PSU</span>
              </div>
            </div>

            {/* CTD Chart Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase">
                CTD Vertical Profiler (Depth 0 to -2000m)
              </span>
              <div className="flex space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveTab('temperature')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    activeTab === 'temperature' ? 'bg-red-500/30 text-red-300 border border-red-500/50 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Temperature (°C)
                </button>
                <button
                  onClick={() => setActiveTab('salinity')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    activeTab === 'salinity' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Salinity (PSU)
                </button>
              </div>
            </div>

            {/* Interactive SVG CTD Curve Graph */}
            <div className="h-60 bg-slate-950/80 rounded-xl border border-slate-800 p-4 relative flex items-center">
              {/* Depth Axis (Left) */}
              <div className="w-16 h-full flex flex-col justify-between text-[10px] font-mono text-slate-500 border-r border-slate-800 pr-2">
                <span>0m</span>
                <span>-200m</span>
                <span>-500m</span>
                <span>-1000m</span>
                <span>-2000m</span>
              </div>

              {/* CTD Curve Display */}
              <div className="flex-1 h-full relative ml-4">
                <svg className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="0%" x2="100%" y2="0%" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* Temperature Curve */}
                  {activeTab === 'temperature' && (
                    <polyline
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={argo.ctd_profile.map(pt => {
                        const x = (pt.temp / 30) * 100;
                        const y = (pt.depth / 2000) * 100;
                        return `${x}%,${y}%`;
                      }).join(' ')}
                    />
                  )}

                  {/* Salinity Curve */}
                  {activeTab === 'salinity' && (
                    <polyline
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={argo.ctd_profile.map(pt => {
                        const x = ((pt.salinity - 32) / 5) * 100;
                        const y = (pt.depth / 2000) * 100;
                        return `${x}%,${y}%`;
                      }).join(' ')}
                    />
                  )}

                  {/* Data Points */}
                  {argo.ctd_profile.map((pt, idx) => {
                    const x = activeTab === 'temperature' 
                      ? (pt.temp / 30) * 100 
                      : ((pt.salinity - 32) / 5) * 100;
                    const y = (pt.depth / 2000) * 100;
                    return (
                      <circle
                        key={idx}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill={activeTab === 'temperature' ? '#f43f5e' : '#f59e0b'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* CTD Value Table */}
            <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/40 text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-900 sticky top-0 text-slate-400">
                  <tr>
                    <th className="p-2">Depth (m)</th>
                    <th className="p-2">Temperature (°C)</th>
                    <th className="p-2">Salinity (PSU)</th>
                    <th className="p-2">Water Density (kg/m³)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {argo.ctd_profile.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-cyan-300">-{p.depth}m</td>
                      <td className="p-2 text-red-400">{p.temp}°C</td>
                      <td className="p-2 text-amber-400">{p.salinity}</td>
                      <td className="p-2 text-slate-400">{p.density}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // OMNI Buoy View
  if (buoy) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-cyan-500/40 p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-sky-900/50 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl border bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wide text-white">
                  {buoy.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono">
                  INCOIS OMNI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {buoy.basin} Moored Station | Lat: {buoy.lat}°N, Lon: {buoy.lon}°E | Status: {buoy.sensor_health}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OMNI MOORED BUOY VIEW */}
        <div className="space-y-4">
          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Sea Surface Temp</span>
                <span className="text-xl font-bold text-white font-mono">{buoy.sst_c}°C</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Wave Height (Hs)</span>
                <span className="text-xl font-bold text-white font-mono">{buoy.wave_height_m}m</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Current Speed</span>
                <span className="text-xl font-bold text-white font-mono">{buoy.current_speed_ms} m/s</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Surface Salinity</span>
                <span className="text-xl font-bold text-white font-mono">{buoy.salinity_psu} PSU</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Wind Speed / Dir</span>
                <span className="text-lg font-bold text-white font-mono">{buoy.wind_speed_ms} m/s ({buoy.wind_dir_deg}°)</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Mooring Depth</span>
                <span className="text-lg font-bold text-white font-mono">-{buoy.depth_m}m</span>
              </div>
            </div>
          </div>

          {/* 24-Hour Telemetry Time Series Table */}
          {buoy.history && (
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                24-Hour Telemetry Log (Hourly Ingestion)
              </h3>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="p-2.5">Time (UTC)</th>
                      <th className="p-2.5">SST (°C)</th>
                      <th className="p-2.5">Salinity (PSU)</th>
                      <th className="p-2.5">Wave Height (m)</th>
                      <th className="p-2.5">Current (m/s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {buoy.history.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-cyan-400 font-bold">{h.timestamp}</td>
                        <td className="p-2.5">{h.sst}°C</td>
                        <td className="p-2.5 text-amber-400">{h.salinity}</td>
                        <td className="p-2.5 text-blue-400">{h.wave_height}m</td>
                        <td className="p-2.5 text-emerald-400">{h.current_speed} m/s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
  }

  return null;
};
