/**
 * AquaTwin 3D - TopNavBar (Mission Control Command Header)
 * Features shifting gradient glow underline, live UTC clock, live API telemetry badges,
 * region focus shortcuts, and modal triggers.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Layers, 
  BarChart3, 
  Bot, 
  Waves, 
  Wind, 
  Activity, 
  Radio, 
  Clock,
  Sparkles,
  Box
} from 'lucide-react';
import { CameraPreset } from '../../types/ocean';
import { LiveBadge } from '../ui/LiveBadge';
import { StatusDot } from '../ui/StatusDot';
import { LiquidButton } from '../ui/LiquidButton';
import { useOceanStore } from '../../services/oceanStore';

interface TopNavBarProps {
  onOpenVolumeSlicer: () => void;
  onOpenValidation: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onOpenVolumeSlicer,
  onOpenValidation,
  onToggleCopilot,
  isCopilotOpen
}) => {
  const store = useOceanStore();
  const [utcTime, setUtcTime] = useState<string>('');

  // Live UTC digital clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full liquid-glass-base liquid-glass-reflection border-b border-cyan-500/20 px-4 py-2.5 shadow-2xl backdrop-blur-2xl">
      {/* Dynamic Animated Gradient Underline (cyan -> teal -> emerald -> cyan) */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] animate-glow-shift opacity-80" />

      <div className="flex items-center justify-between">
        
        {/* Left: Minimal Brand Icon */}
        <div className="flex items-center space-x-3">
          <div className="relative p-2 rounded-xl bg-[#0e1017] border border-slate-700/80 text-cyan-400 shadow-md">
            <Compass className="w-5 h-5 animate-[spin_30s_linear_infinite]" />
          </div>
        </div>

        {/* Center: Live UTC Clock & Status Heartbeat */}
        <div className="hidden xl:flex items-center space-x-2 bg-[#0a0c10] px-3 py-1 rounded-full border border-slate-800 font-telemetry text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">UTC:</span>
          <span className="font-bold text-white tracking-widest">{utcTime || '00:00:00'}</span>
          <span className="text-slate-700">|</span>
          <StatusDot status="active" size="sm" />
          <span className="text-[10px] text-emerald-400 font-semibold">FEED ONLINE</span>
        </div>

        {/* Right: Action Tools */}
        <div className="flex items-center space-x-2">

          {/* 3D Volume Slicing Box Button */}
          <LiquidButton
            size="sm"
            variant="cyan"
            icon={Box}
            onClick={onOpenVolumeSlicer}
          >
            <span className="hidden md:inline">3D Volume Box</span>
          </LiquidButton>

          {/* Model Validation Button */}
          <LiquidButton
            size="sm"
            variant="emerald"
            icon={BarChart3}
            onClick={onOpenValidation}
          >
            <span className="hidden md:inline">Validation</span>
          </LiquidButton>

          {/* OceanCopilot AI Button */}
          <LiquidButton
            size="sm"
            variant="cyan"
            active={isCopilotOpen}
            icon={Sparkles}
            onClick={onToggleCopilot}
          >
            <span>Ocean-AI</span>
          </LiquidButton>

        </div>
      </div>
    </div>
  );
};
