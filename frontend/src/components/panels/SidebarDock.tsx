import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Radio, 
  Waves, 
  Wind, 
  Thermometer, 
  Droplets, 
  Activity, 
  Map, 
  ChevronLeft, 
  ChevronRight,
  ChevronRight as ArrowRight,
  Sparkles,
  Search,
  Navigation,
  Anchor,
  Flame,
  Zap
} from 'lucide-react';
import { useOceanStore } from '../../services/oceanStore';
import { OceanVariable, BuoyData, ArgoFloat, GliderMission, CTDCastStation } from '../../types/ocean';
import { AnimatedToggle } from '../ui/AnimatedToggle';
import { StatusDot } from '../ui/StatusDot';

interface SidebarDockProps {
  onSelectBuoy?: (b: BuoyData) => void;
  onSelectArgo?: (a: ArgoFloat) => void;
  onSelectGlider?: (g: GliderMission) => void;
  onSelectCTD?: (c: CTDCastStation) => void;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
  onSelectBuoy,
  onSelectArgo,
  onSelectGlider,
  onSelectCTD
}) => {
  const store = useOceanStore();
  const [activeTab, setActiveTab] = useState<'layers' | 'buoys' | 'argo' | 'gliders' | 'ctd'>('layers');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const layers = [
    {
      id: 'showWaves' as const,
      label: 'Significant Waves',
      icon: Waves,
      active: store.showWaves,
      color: 'cyan' as const
    },
    {
      id: 'showCurrents' as const,
      label: 'Ocean Currents',
      icon: Wind,
      active: store.showCurrents,
      color: 'emerald' as const,
      hasDepthSelector: true
    },
    {
      id: 'showIsosurface' as const,
      label: '3D Thermal Isosurface',
      icon: Flame,
      active: store.showIsosurface,
      color: 'rose' as const,
      hasIsosurfaceSelector: true
    },
    {
      id: 'showSST' as const,
      label: 'Sea Surface Temperature',
      icon: Thermometer,
      active: store.showSST,
      triggerVar: 'sst' as OceanVariable,
      color: 'cyan' as const
    },
    {
      id: 'showSalinity' as const,
      label: 'Ocean Salinity',
      icon: Droplets,
      active: store.showSalinity,
      triggerVar: 'salinity' as OceanVariable,
      color: 'amber' as const
    },
    {
      id: 'showGliders' as const,
      label: 'Underwater Gliders',
      icon: Navigation,
      active: store.showGliders,
      color: 'amber' as const
    },
    {
      id: 'showCTDStations' as const,
      label: 'CTD Rosette Casts',
      icon: Anchor,
      active: store.showCTDStations,
      color: 'emerald' as const
    },
    {
      id: 'showArgo' as const,
      label: 'Argo Profiling Floats',
      icon: Activity,
      active: store.showArgo,
      color: 'cyan' as const
    },
    {
      id: 'showBuoys' as const,
      label: 'Moored Buoys',
      icon: Radio,
      active: store.showBuoys,
      color: 'cyan' as const
    },
    {
      id: 'showBathymetry' as const,
      label: 'Bathymetry Relief',
      icon: Map,
      active: store.showBathymetry,
      color: 'cyan' as const
    }
  ];

  const filteredBuoys = store.buoys.filter(b => 
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.basin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArgo = store.argoFloats.filter(a =>
    a.wmo_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.basin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.platform_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGliders = store.gliderMissions.filter(g =>
    g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.basin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCTD = store.ctdStations.filter(c =>
    c.station_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vessel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.basin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex items-start">
      
      {/* Collapsed Pill Button */}
      {isCollapsed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsCollapsed(false)}
          className="glass-mission p-3 rounded-2xl border border-slate-700/80 text-cyan-400 hover:text-white hover:border-slate-500 shadow-2xl flex flex-col items-center space-y-2 cursor-pointer backdrop-blur-2xl bg-[#090a0f]/90"
        >
          <ChevronRight className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-telemetry [writing-mode:vertical-rl] tracking-widest uppercase font-bold text-slate-300">
            Telemetry Dock
          </span>
        </motion.button>
      )}

      {/* Expanded Mission Control Dock */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-mission w-80 rounded-2xl border border-slate-800 p-3.5 shadow-2xl backdrop-blur-2xl bg-[#090a0f]/92 flex flex-col max-h-[calc(100vh-140px)] overflow-hidden relative"
          >
            {/* Header with Minimize Button */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-cyan-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-header font-bold tracking-wider text-slate-100 uppercase leading-none">
                    Command Telemetry
                  </h2>
                  <p className="text-[9px] font-telemetry text-slate-400 tracking-wide mt-0.5">
                    Live Ocean Models & In-Situ Feeds
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCollapsed(true)}
                title="Minimize Sidebar"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs (5 Tabs) */}
            <div className="grid grid-cols-5 gap-1 bg-[#050608] p-1 rounded-xl border border-slate-800/80 mb-3 text-[9px] font-telemetry">
              <button
                onClick={() => setActiveTab('layers')}
                className={`py-1 rounded-lg transition-all font-semibold cursor-pointer text-center ${
                  activeTab === 'layers'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Layers
              </button>
              <button
                onClick={() => setActiveTab('buoys')}
                className={`py-1 rounded-lg transition-all font-semibold cursor-pointer text-center ${
                  activeTab === 'buoys'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Buoys ({store.buoys.length})
              </button>
              <button
                onClick={() => setActiveTab('argo')}
                className={`py-1 rounded-lg transition-all font-semibold cursor-pointer text-center ${
                  activeTab === 'argo'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Argo ({store.argoFloats.length})
              </button>
              <button
                onClick={() => setActiveTab('gliders')}
                className={`py-1 rounded-lg transition-all font-semibold cursor-pointer text-center ${
                  activeTab === 'gliders'
                    ? 'bg-amber-950/80 text-amber-200 border border-amber-800/60 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Gliders ({store.gliderMissions.length})
              </button>
              <button
                onClick={() => setActiveTab('ctd')}
                className={`py-1 rounded-lg transition-all font-semibold cursor-pointer text-center ${
                  activeTab === 'ctd'
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/60 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CTD ({store.ctdStations.length})
              </button>
            </div>

            {/* TAB 1: OCEAN DATA LAYERS (Super clean, simple title & toggle) */}
            {activeTab === 'layers' && (
              <div className="space-y-1.5 overflow-y-auto no-scrollbar pr-0.5 max-h-[calc(100vh-230px)]">
                {layers.map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <div
                      key={layer.id}
                      className={`px-3 py-2 rounded-xl border transition-all ${
                        layer.active
                          ? 'bg-[#11131a] border-slate-700 text-white shadow-sm'
                          : 'bg-[#0b0c10]/60 border-slate-850 text-slate-400 hover:bg-[#12141c] hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center flex-1 select-none cursor-default pr-2"
                          onClick={() => {
                            if (layer.triggerVar) store.setVariable(layer.triggerVar);
                          }}
                        >
                          <span className="text-xs font-semibold tracking-wide text-slate-200">
                            {layer.label}
                          </span>
                        </div>

                        <div className="shrink-0">
                          <AnimatedToggle
                            size="sm"
                            checked={layer.active}
                            onChange={() => {
                              store.toggleLayer(layer.id);
                              if (!layer.active && layer.triggerVar) {
                                store.setVariable(layer.triggerVar);
                              }
                            }}
                            activeColor={layer.color}
                            ariaLabel={`Toggle ${layer.label}`}
                          />
                        </div>
                      </div>

                      {/* Subsurface Current Depth Switcher */}
                      {layer.hasDepthSelector && layer.active && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] font-telemetry">
                          <span className="text-slate-400">Depth Level:</span>
                          <div className="flex space-x-1">
                            {[0, 100, 500].map(d => (
                              <button
                                key={d}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  store.setCurrentDepthLayer(d);
                                }}
                                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                  store.currentDepthLayer === d
                                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {d === 0 ? 'Surface' : `${d}m`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Isosurface Temperature Switcher (26°C / 20°C) */}
                      {layer.hasIsosurfaceSelector && layer.active && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] font-telemetry">
                          <span className="text-slate-400">Isotherm:</span>
                          <div className="flex space-x-1">
                            {[26, 20].map(t => (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  store.setIsosurfaceTargetTemp(t);
                                }}
                                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                  store.isosurfaceTargetTemp === t
                                    ? 'bg-rose-500 text-white border-rose-400 font-bold'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {t === 26 ? '26°C (D26)' : '20°C (D20)'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: IN-SITU MOORED BUOYS */}
            {activeTab === 'buoys' && (
              <div className="flex flex-col flex-1 overflow-hidden space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search buoy (e.g. BD08, BoB)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-telemetry text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>

                <div className="space-y-1.5 overflow-y-auto no-scrollbar pr-0.5 flex-1 max-h-80">
                  {filteredBuoys.map((b: BuoyData) => {
                    const isSelected = store.selectedBuoy?.id === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          store.setSelectedBuoy(b);
                          if (onSelectBuoy) onSelectBuoy(b);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-400 shadow-md shadow-emerald-950'
                            : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <StatusDot status={b.sensor_health === 'OPTIMAL' ? 'active' : 'warning'} size="sm" />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-telemetry font-bold text-white">{b.id}</span>
                              <span className="text-[10px] text-slate-400 font-telemetry truncate max-w-[120px]">
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

                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: ARGO PROFILING FLOATS */}
            {activeTab === 'argo' && (
              <div className="flex flex-col flex-1 overflow-hidden space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Argo WMO ID..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-telemetry text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>

                <div className="space-y-1.5 overflow-y-auto no-scrollbar pr-0.5 flex-1 max-h-80">
                  {filteredArgo.map((a: ArgoFloat) => {
                    const isSelected = store.selectedArgo?.wmo_id === a.wmo_id;
                    return (
                      <div
                        key={a.wmo_id}
                        onClick={() => {
                          store.setSelectedArgo(a);
                          if (onSelectArgo) onSelectArgo(a);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-yellow-950/80 border-yellow-400 shadow-md shadow-yellow-950'
                            : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
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

                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: AUTONOMOUS UNDERWATER GLIDERS */}
            {activeTab === 'gliders' && (
              <div className="flex flex-col flex-1 overflow-hidden space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search gliders..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-telemetry text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>

                <div className="space-y-1.5 overflow-y-auto no-scrollbar pr-0.5 flex-1 max-h-80">
                  {filteredGliders.map((g: GliderMission) => {
                    const isSelected = store.selectedGlider?.id === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() => {
                          store.setSelectedGlider(g);
                          if (onSelectGlider) onSelectGlider(g);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-950/80 border-amber-400 shadow-md shadow-amber-950'
                            : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <StatusDot status="active" size="sm" />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-telemetry font-bold text-amber-300">{g.id}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-200 border border-amber-800/60 font-telemetry">
                                {g.dive_state}
                              </span>
                            </div>
                            <div className="text-[9px] font-telemetry text-slate-400 flex items-center space-x-2 mt-0.5">
                              <span>Depth: {g.current_depth_m}m</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-emerald-300 font-semibold">Chl: {g.chlorophyll_surface_ug_l} µg/L</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-cyan-300">Bat: {g.battery_pct}%</span>
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: SHIP-BASED CTD ROSETTE CASTS */}
            {activeTab === 'ctd' && (
              <div className="flex flex-col flex-1 overflow-hidden space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search CTD stations..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-telemetry text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>

                <div className="space-y-1.5 overflow-y-auto no-scrollbar pr-0.5 flex-1 max-h-80">
                  {filteredCTD.map((c: CTDCastStation) => {
                    const isSelected = store.selectedCTDStation?.station_id === c.station_id;
                    return (
                      <div
                        key={c.station_id}
                        onClick={() => {
                          store.setSelectedCTDStation(c);
                          if (onSelectCTD) onSelectCTD(c);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-400 shadow-md shadow-emerald-950'
                            : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <StatusDot status="active" size="sm" />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-telemetry font-bold text-emerald-300">{c.station_id}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-200 border border-emerald-800/60 font-telemetry">
                                {c.vessel.split(' ')[1]}
                              </span>
                            </div>
                            <div className="text-[9px] font-telemetry text-slate-400 flex items-center space-x-2 mt-0.5">
                              <span>Max Chl: {c.chlorophyll_max_ug_l} µg/L</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-cyan-300">DCM: {c.chlorophyll_max_depth_m}m</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">{c.bottom_depth_m}m</span>
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

