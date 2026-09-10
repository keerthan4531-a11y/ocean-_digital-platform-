import React from 'react';
import { Waves, Activity, ShieldCheck, Compass, Layers, CheckCircle2, MessageSquareText, BarChart3 } from 'lucide-react';
import { CameraPreset } from '../../types/ocean';

interface TopNavBarProps {
  onSelectPreset: (preset: CameraPreset) => void;
  onOpenTransect: () => void;
  onOpenValidation: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onSelectPreset,
  onOpenTransect,
  onOpenValidation,
  onToggleCopilot,
  isCopilotOpen
}) => {
  return (
    <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      
      {/* Brand & Project Identity */}
      <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center space-x-3 pointer-events-auto border border-cyan-500/40 shadow-xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Waves className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-wider text-white">
              AQUATWIN <span className="text-cyan-400">3D</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50">
              LIVE 4D
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-tight">
            4D Numerical Ocean Model & In-Situ Digital Twin
          </p>
        </div>
      </div>

      {/* Center Live Telemetry & Model Status */}
      <div className="hidden lg:flex items-center space-x-2 glass-panel px-4 py-2 rounded-2xl pointer-events-auto border border-sky-500/30 font-mono text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400">INCOIS-ROMS 4D</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-1.5 text-cyan-300">
          <Activity className="w-3.5 h-3.5" />
          <span>OMNI BUOYS: 8 LIVE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-1.5 text-yellow-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ARGO FLOATS: 4 ACTIVE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="text-slate-400">
          UTC: <span className="text-white font-bold">{new Date().toISOString().substring(11, 19)}</span>
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center space-x-2.5 pointer-events-auto">
        
        {/* Basin Focus Presets */}
        <div className="hidden md:flex glass-panel p-1 rounded-xl border border-sky-500/30">
          <button
            onClick={() => onSelectPreset('bay_of_bengal')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bay of Bengal</span>
          </button>
          <button
            onClick={() => onSelectPreset('arabian_sea')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Arabian Sea</span>
          </button>
        </div>

        {/* 3D Vertical Transect Button */}
        <button
          onClick={onOpenTransect}
          className="glass-panel px-3 py-2 rounded-xl text-xs font-mono text-cyan-300 hover:text-white hover:bg-cyan-950/80 transition-all border border-cyan-500/40 flex items-center gap-1.5 shadow-lg shadow-cyan-950/50"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">3D Transect</span>
        </button>

        {/* Model vs Observation Validation Dashboard */}
        <button
          onClick={onOpenValidation}
          className="glass-panel px-3 py-2 rounded-xl text-xs font-mono text-emerald-300 hover:text-white hover:bg-emerald-950/80 transition-all border border-emerald-500/40 flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Model Validation</span>
        </button>

        {/* OceanCopilot AI Assistant Toggle */}
        <button
          onClick={onToggleCopilot}
          className={`glass-panel px-3 py-2 rounded-xl text-xs font-mono transition-all border flex items-center gap-1.5 shadow-lg ${
            isCopilotOpen
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
              : 'text-cyan-300 hover:text-white hover:bg-cyan-950/80 border-cyan-500/40'
          }`}
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Ocean-AI</span>
        </button>

      </div>
    </header>
  );
};
