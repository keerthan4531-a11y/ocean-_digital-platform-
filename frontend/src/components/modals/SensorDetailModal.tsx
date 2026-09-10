/**
 * AquaTwin 3D - SensorDetailModal (Mission Control CTD Telemetry Modal)
 * Slide-up glassmorphism modal with animated entrance, live CTD depth curves (0 to -2000m),
 * BGC Chlorophyll/Dissolved Oxygen profiles for Gliders and CTD Casts,
 * and calibrated sensor health status.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Radio, Waves, Thermometer, Wind, Droplets, Compass, ShieldCheck, Navigation, Anchor } from 'lucide-react';
import { BuoyData, ArgoFloat, GliderMission, CTDCastStation } from '../../types/ocean';
import { ModalBackdrop } from './ModalBackdrop';
import { modalScaleVariants } from '../../hooks/useStaggerAnimation';
import { LiveBadge } from '../ui/LiveBadge';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface SensorDetailModalProps {
  buoy: BuoyData | null;
  argo: ArgoFloat | null;
  glider?: GliderMission | null;
  ctdStation?: CTDCastStation | null;
  onClose: () => void;
}

export const SensorDetailModal: React.FC<SensorDetailModalProps> = ({
  buoy,
  argo,
  glider,
  ctdStation,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'temperature' | 'salinity' | 'chlorophyll' | 'oxygen'>('temperature');

  if (!buoy && !argo && !glider && !ctdStation) return null;

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          className="liquid-glass-base liquid-glass-reflection w-full max-w-3xl rounded-3xl border border-white/20 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)] relative flex flex-col max-h-[90vh] bg-[#0a192f]/85"
        >
          {/* Top specular highlight rim */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-4 mb-4">
            <div className="flex items-center space-x-3.5">
              <div className={`p-2.5 rounded-xl border ${
                glider ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                ctdStation ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                argo ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 
                'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              }`}>
                {glider ? <Navigation className="w-6 h-6 animate-pulse" /> :
                 ctdStation ? <Anchor className="w-6 h-6 animate-pulse" /> :
                 argo ? <Activity className="w-6 h-6 animate-pulse" /> : 
                 <Radio className="w-6 h-6 animate-pulse" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold tracking-wide text-white font-header">
                    {glider ? `Glider ${glider.id}` :
                     ctdStation ? `CTD ${ctdStation.station_id}` :
                     argo ? `Argo Float #${argo.wmo_id}` : buoy?.name}
                  </h2>
                  <LiveBadge
                    label={
                      glider ? glider.glider_type :
                      ctdStation ? ctdStation.vessel :
                      argo ? argo.platform_type : 'Moored Telemetry'
                    }
                    status="active"
                    variant={
                      glider ? 'amber' :
                      ctdStation ? 'emerald' :
                      argo ? 'amber' : 'cyan'
                    }
                  />
                </div>
                <p className="text-xs text-slate-400 font-telemetry mt-0.5">
                  {glider ? `${glider.basin} • ${glider.operator} • Day ${glider.mission_day} • GPS: ${glider.lat}°N, ${glider.lon}°E` :
                   ctdStation ? `${ctdStation.basin} • ${ctdStation.cruise_id} • Cast: ${ctdStation.cast_date} • GPS: ${ctdStation.lat}°N, ${ctdStation.lon}°E` :
                   argo ? `${argo.basin} • Cycle #${argo.cycle_number} • GPS: ${argo.lat}°N, ${argo.lon}°E` : 
                   `${buoy?.basin} • Depth: -${buoy?.depth_m}m • GPS: ${buoy?.lat}°N, ${buoy?.lon}°E`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* GLIDER MISSION DETAIL VIEW */}
          {glider && (
            <div className="space-y-4 overflow-y-auto no-scrollbar">
              {/* Telemetry Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Dive State</span>
                  <span className={`text-lg font-bold font-telemetry ${glider.dive_state === 'DIVING' ? 'text-cyan-300' : glider.dive_state === 'CLIMBING' ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {glider.dive_state}
                  </span>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Current Depth</span>
                  <span className="text-lg font-bold text-cyan-300 font-telemetry">-{glider.current_depth_m}m</span>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Battery</span>
                  <span className={`text-lg font-bold font-telemetry ${glider.battery_pct > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {glider.battery_pct}%
                  </span>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Total Dives</span>
                  <span className="text-lg font-bold text-white font-telemetry">{glider.total_dives}</span>
                </div>
              </div>

              {/* BGC Profile Tabs */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-header font-bold text-slate-300 uppercase tracking-wider">
                  BGC Water Column Profiler
                </span>
                <div className="flex space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  {(['temperature', 'salinity', 'chlorophyll', 'oxygen'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-telemetry transition-colors cursor-pointer ${
                        activeTab === tab 
                          ? tab === 'temperature' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold' :
                            tab === 'salinity' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold' :
                            tab === 'chlorophyll' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold' :
                            'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab === 'temperature' ? 'Temp (°C)' : tab === 'salinity' ? 'Sal (PSU)' : tab === 'chlorophyll' ? 'Chl-a (µg/L)' : 'DO₂ (µmol/L)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTD/BGC Profile SVG Plot */}
              <div className="relative h-64 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 flex">
                <div className="flex flex-col justify-between text-[10px] font-telemetry text-slate-500 pr-3 border-r border-slate-800">
                  <span>0m</span><span>-250m</span><span>-500m</span><span>-750m</span><span>-1000m</span>
                </div>
                <div className="flex-1 relative ml-4">
                  <svg className="w-full h-full overflow-visible">
                    {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                      <line key={ratio} x1="0%" y1={`${ratio * 100}%`} x2="100%" y2={`${ratio * 100}%`} stroke="#1e293b" strokeDasharray="4 4" />
                    ))}
                    {glider.profile && glider.profile.length > 1 && (
                      <polyline
                        fill="none"
                        stroke={activeTab === 'temperature' ? '#f43f5e' : activeTab === 'salinity' ? '#fbbf24' : activeTab === 'chlorophyll' ? '#10b981' : '#06b6d4'}
                        strokeWidth="2.5"
                        points={glider.profile
                          .map((pt) => {
                            const y = (pt.depth / 1000) * 100;
                            const x = activeTab === 'temperature'
                              ? ((pt.temp - 2) / 30) * 100
                              : activeTab === 'salinity'
                              ? ((pt.salinity - 32) / 5) * 100
                              : activeTab === 'chlorophyll'
                              ? ((pt.chlorophyll || 0) / 3) * 100
                              : ((pt.oxygen || 0) / 250) * 100;
                            return `${Math.max(5, Math.min(95, x))},${y}`;
                          })
                          .join(' ')}
                      />
                    )}
                  </svg>
                  {activeTab === 'chlorophyll' && (
                    <div className="absolute top-[18%] left-[35%] bg-emerald-950/90 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded text-[10px] font-telemetry">
                      Deep Chlorophyll Maximum (DCM ~50m)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CTD CAST STATION DETAIL VIEW */}
          {ctdStation && !glider && (
            <div className="space-y-4 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Surface Temp</span>
                  <span className="text-lg font-bold text-rose-400 font-telemetry">{ctdStation.surface_temp_c}°C</span>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Surface Salinity</span>
                  <span className="text-lg font-bold text-amber-400 font-telemetry">{ctdStation.surface_salinity_psu} PSU</span>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Chl-a Max</span>
                  <span className="text-lg font-bold text-emerald-400 font-telemetry">{ctdStation.chlorophyll_max_ug_l} µg/L</span>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">DCM Depth</span>
                  <span className="text-lg font-bold text-cyan-300 font-telemetry">-{ctdStation.chlorophyll_max_depth_m}m</span>
                </div>
              </div>

              {/* Profile Tabs */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-header font-bold text-slate-300 uppercase tracking-wider">
                  Hydrographic Cast Profile (0m to -{ctdStation.bottom_depth_m}m)
                </span>
                <div className="flex space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  {(['temperature', 'salinity', 'chlorophyll', 'oxygen'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-telemetry transition-colors cursor-pointer ${
                        activeTab === tab 
                          ? tab === 'temperature' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold' :
                            tab === 'salinity' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold' :
                            tab === 'chlorophyll' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold' :
                            'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab === 'temperature' ? 'Temp (°C)' : tab === 'salinity' ? 'Sal (PSU)' : tab === 'chlorophyll' ? 'Chl-a (µg/L)' : 'DO₂ (µmol/L)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTD Profile SVG Plot */}
              <div className="relative h-64 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 flex">
                <div className="flex flex-col justify-between text-[10px] font-telemetry text-slate-500 pr-3 border-r border-slate-800">
                  <span>0m</span><span>-500m</span><span>-1000m</span><span>-1500m</span><span>-2000m</span>
                </div>
                <div className="flex-1 relative ml-4">
                  <svg className="w-full h-full overflow-visible">
                    {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                      <line key={ratio} x1="0%" y1={`${ratio * 100}%`} x2="100%" y2={`${ratio * 100}%`} stroke="#1e293b" strokeDasharray="4 4" />
                    ))}
                    {ctdStation.cast_profile && ctdStation.cast_profile.length > 1 && (
                      <polyline
                        fill="none"
                        stroke={activeTab === 'temperature' ? '#f43f5e' : activeTab === 'salinity' ? '#fbbf24' : activeTab === 'chlorophyll' ? '#10b981' : '#06b6d4'}
                        strokeWidth="2.5"
                        points={ctdStation.cast_profile
                          .map((pt) => {
                            const maxDepth = ctdStation.bottom_depth_m || 2000;
                            const y = (pt.depth / maxDepth) * 100;
                            const x = activeTab === 'temperature'
                              ? ((pt.temp - 2) / 30) * 100
                              : activeTab === 'salinity'
                              ? ((pt.salinity - 32) / 5) * 100
                              : activeTab === 'chlorophyll'
                              ? ((pt.chlorophyll || 0) / 3) * 100
                              : ((pt.oxygen || 0) / 250) * 100;
                            return `${Math.max(5, Math.min(95, x))},${y}`;
                          })
                          .join(' ')}
                      />
                    )}
                  </svg>
                  {activeTab === 'chlorophyll' && (
                    <div className="absolute top-[15%] left-[30%] bg-emerald-950/90 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded text-[10px] font-telemetry">
                      DCM at -{ctdStation.chlorophyll_max_depth_m}m (Chl-a: {ctdStation.chlorophyll_max_ug_l} µg/L)
                    </div>
                  )}
                </div>
              </div>

              {/* Station Metadata */}
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs font-telemetry">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Vessel:</span>
                  <span className="text-emerald-400 font-bold">{ctdStation.vessel}</span>
                </div>
                <div className="text-slate-400">
                  Bottom: <span className="text-slate-200">{ctdStation.bottom_depth_m}m</span>
                </div>
              </div>
            </div>
          )}

          {/* ARGO FLOAT CTD PROFILE VIEW */}
          {argo && !glider && !ctdStation && (
            <div className="space-y-4">
              {/* Telemetry Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Mission Cycle</span>
                  <span className="text-lg font-bold text-white font-telemetry">Cycle #{argo.cycle_number}</span>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Max Dive Depth</span>
                  <span className="text-lg font-bold text-cyan-300 font-telemetry">-{argo.max_depth_m}m</span>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Surface Temp</span>
                  <span className="text-lg font-bold text-rose-400 font-telemetry">{argo.surface_temp_c}°C</span>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] font-telemetry text-slate-400 block uppercase">Surface Salinity</span>
                  <span className="text-lg font-bold text-amber-400 font-telemetry">{argo.surface_salinity_psu} PSU</span>
                </div>
              </div>

              {/* CTD Chart Header */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-header font-bold text-slate-300 uppercase tracking-wider">
                  CTD Water Column Profiler (0m to -2000m)
                </span>
                <div className="flex space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab('temperature')}
                    className={`px-3 py-1 rounded-lg text-xs font-telemetry transition-colors cursor-pointer ${
                      activeTab === 'temperature' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Temperature (°C)
                  </button>
                  <button
                    onClick={() => setActiveTab('salinity')}
                    className={`px-3 py-1 rounded-lg text-xs font-telemetry transition-colors cursor-pointer ${
                      activeTab === 'salinity' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Salinity (PSU)
                  </button>
                </div>
              </div>

              {/* CTD Curve Plot Visualization */}
              <div className="relative h-64 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 flex">
                {/* Y-Axis: Depth */}
                <div className="flex flex-col justify-between text-[10px] font-telemetry text-slate-500 pr-3 border-r border-slate-800">
                  <span>0m</span>
                  <span>-500m</span>
                  <span>-1000m</span>
                  <span>-1500m</span>
                  <span>-2000m</span>
                </div>

                {/* SVG Curve Plot */}
                <div className="flex-1 relative ml-4">
                  <svg className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                      <line
                        key={ratio}
                        x1="0%"
                        y1={`${ratio * 100}%`}
                        x2="100%"
                        y2={`${ratio * 100}%`}
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                      />
                    ))}

                    {/* CTD Profile Polyline */}
                    {argo.ctd_profile && argo.ctd_profile.length > 1 && (
                      <polyline
                        fill="none"
                        stroke={activeTab === 'temperature' ? '#f43f5e' : '#fbbf24'}
                        strokeWidth="2.5"
                        points={argo.ctd_profile
                          .map((pt) => {
                            const y = (pt.depth / 2000) * 100;
                            // Scale X: Temp 2 to 32°C, Salinity 32 to 37 PSU
                            const x = activeTab === 'temperature'
                              ? ((pt.temp - 2) / 30) * 100
                              : ((pt.salinity - 32) / 5) * 100;
                            return `${Math.max(5, Math.min(95, x))},${y}`;
                          })
                          .join(' ')}
                      />
                    )}
                  </svg>

                  {/* Thermocline Callout Badge */}
                  <div className="absolute top-[28%] left-[20%] bg-cyan-950/90 text-cyan-300 border border-cyan-600/50 px-2 py-0.5 rounded text-[10px] font-telemetry">
                    Thermocline Core Drop (-150m to -300m)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BUOY TELEMETRY VIEW */}
          {buoy && !glider && !ctdStation && !argo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center space-x-1.5 text-rose-400 mb-1">
                    <Thermometer className="w-4 h-4" />
                    <span className="text-[10px] font-telemetry uppercase">Sea Surface Temp</span>
                  </div>
                  <span className="text-2xl font-bold font-telemetry text-white">{buoy.sst_c}°C</span>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center space-x-1.5 text-cyan-400 mb-1">
                    <Waves className="w-4 h-4" />
                    <span className="text-[10px] font-telemetry uppercase">Significant Wave</span>
                  </div>
                  <span className="text-2xl font-bold font-telemetry text-white">{buoy.wave_height_m}m</span>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
                    <Wind className="w-4 h-4" />
                    <span className="text-[10px] font-telemetry uppercase">Current Speed</span>
                  </div>
                  <span className="text-2xl font-bold font-telemetry text-white">{buoy.current_speed_ms} m/s</span>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center space-x-1.5 text-amber-400 mb-1">
                    <Droplets className="w-4 h-4" />
                    <span className="text-[10px] font-telemetry uppercase">Salinity</span>
                  </div>
                  <span className="text-2xl font-bold font-telemetry text-white">{buoy.salinity_psu} PSU</span>
                </div>
              </div>

              {/* Atmospheric & Station Health */}
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs font-telemetry">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Station Status:</span>
                  <span className="text-emerald-400 font-bold">{buoy.sensor_health}</span>
                </div>
                <div className="text-slate-400">
                  Last Uplink: <span className="text-slate-200">{buoy.last_updated}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </ModalBackdrop>
    </AnimatePresence>
  );
};
