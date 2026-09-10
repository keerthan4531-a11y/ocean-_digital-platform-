/**
 * AquaTwin 3D - DepthSliderPanel
 * 4D Water Column Depth Slicer with Vertical Exaggeration & Discrete Zone Snapping.
 * Updated to match the professional deep matte black institutional design system.
 */

import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ArrowDown, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { useOceanStore } from '../../services/oceanStore';

interface DepthLevel {
  depth: number;
  label: string;
  zone: string;
  tempApprox: string;
}

const DEPTH_LEVELS: DepthLevel[] = [
  { depth: 0, label: '0m', zone: 'Sea Surface', tempApprox: '29.5°C' },
  { depth: 50, label: '50m', zone: 'Mixed Layer', tempApprox: '28.2°C' },
  { depth: 100, label: '100m', zone: 'Thermocline Start', tempApprox: '22.5°C' },
  { depth: 200, label: '200m', zone: 'Thermocline Core', tempApprox: '14.8°C' },
  { depth: 500, label: '500m', zone: 'Intermediate Water', tempApprox: '9.6°C' },
  { depth: 1000, label: '1000m', zone: 'Deep Layer', tempApprox: '5.8°C' },
  { depth: 2000, label: '2000m', zone: 'Abyssal Plain', tempApprox: '2.4°C' }
];

export const DepthSliderPanel: React.FC = () => {
  const store = useOceanStore();
  const currentDepth = store.depth;
  const isCollapsed = store.isDepthSlicerCollapsed;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingTrack, setIsDraggingTrack] = useState(false);

  // Accurate button-aligned position calculation (0% at 0m, 33.3% at 100m, 100% at 2000m)
  const getButtonAlignedFill = (depth: number) => {
    const totalLevels = DEPTH_LEVELS.length;
    const exactIndex = DEPTH_LEVELS.findIndex(lvl => lvl.depth === depth);
    if (exactIndex !== -1) {
      return (exactIndex / (totalLevels - 1)) * 100;
    }

    // Piecewise linear interpolation between discrete levels
    for (let i = 0; i < totalLevels - 1; i++) {
      const d0 = DEPTH_LEVELS[i].depth;
      const d1 = DEPTH_LEVELS[i + 1].depth;
      if (depth >= d0 && depth <= d1) {
        const t = (depth - d0) / (d1 - d0);
        const p0 = (i / (totalLevels - 1)) * 100;
        const p1 = ((i + 1) / (totalLevels - 1)) * 100;
        return p0 + t * (p1 - p0);
      }
    }
    return depth > 2000 ? 100 : 0;
  };

  const fillPercentage = getButtonAlignedFill(currentDepth);

  // Handle direct click or drag along the vertical track (mapped to 7 discrete slots)
  const handleTrackInteraction = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const ratio = relativeY / rect.height; // 0.0 at top, 1.0 at bottom
    
    const fractionalIndex = ratio * (DEPTH_LEVELS.length - 1);
    const closestIndex = Math.min(DEPTH_LEVELS.length - 1, Math.max(0, Math.round(fractionalIndex)));
    const selectedLevel = DEPTH_LEVELS[closestIndex];

    store.setDepth(selectedLevel.depth);
    const targetLayer = selectedLevel.depth <= 0 ? 0 : selectedLevel.depth <= 250 ? 100 : 500;
    store.setCurrentDepthLayer(targetLayer);
  }, [store]);

  const onMouseDownTrack = (e: React.MouseEvent) => {
    setIsDraggingTrack(true);
    handleTrackInteraction(e.clientY);
  };

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingTrack) {
        handleTrackInteraction(e.clientY);
      }
    };
    const onMouseUp = () => setIsDraggingTrack(false);

    if (isDraggingTrack) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingTrack, handleTrackInteraction]);

  const activeZoneInfo = DEPTH_LEVELS.find(d => Math.abs(d.depth - currentDepth) < 40) || {
    depth: currentDepth,
    label: `${currentDepth}m`,
    zone: currentDepth < 100 ? 'Subsurface Layer' : currentDepth < 500 ? 'Thermocline Gradient' : 'Deep Abyss',
    tempApprox: `${Math.max(2.0, (29.5 - (currentDepth / 2000) * 27)).toFixed(1)}°C`
  };

  // Render Collapsed Pill
  if (isCollapsed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        onClick={() => store.setIsDepthSlicerCollapsed(false)}
        className="glass-mission p-3 rounded-2xl border border-slate-700/80 text-cyan-400 hover:text-white hover:border-slate-500 shadow-2xl flex flex-col items-center space-y-2 cursor-pointer backdrop-blur-2xl bg-[#090a0f]/90 transition-colors"
        title="Expand 4D Depth Slicer"
      >
        <ChevronLeft className="w-4 h-4 animate-pulse text-cyan-400" />
        <span className="text-[10px] font-telemetry [writing-mode:vertical-rl] tracking-widest uppercase font-bold text-slate-300">
          4D Slicer (-{currentDepth}m)
        </span>
        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="glass-mission w-76 rounded-2xl border border-slate-800 p-3.5 shadow-2xl backdrop-blur-2xl bg-[#090a0f]/92 flex flex-col relative select-none"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-header font-bold tracking-wider text-slate-100 uppercase leading-none">
                4D Depth Slicer
              </h2>
              <p className="text-[9px] font-telemetry text-slate-400 tracking-wide mt-0.5">
                Vertical Water Column
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-telemetry px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-700 font-bold">
              -{currentDepth}m
            </span>
            {currentDepth > 0 && (
              <button
                onClick={() => {
                  store.setDepth(0);
                  store.setCurrentDepthLayer(0);
                }}
                title="Reset to Sea Surface (0m)"
                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer border border-slate-800"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
            <button
              onClick={() => store.setIsDepthSlicerCollapsed(true)}
              title="Collapse 4D Depth Slicer Panel"
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors border border-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 1. Vertical Exaggeration Slider (1x - 50x) */}
        <div className="mb-3 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-telemetry mb-1">
            <span className="text-slate-300 font-semibold">Vertical Exaggeration</span>
            <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {store.verticalExaggeration}× Scale
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={store.verticalExaggeration}
            onChange={(e) => store.setVerticalExaggeration(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-850 rounded-lg cursor-pointer appearance-none my-1"
          />

          {/* Quick Preset Ticks */}
          <div className="flex items-center justify-between mt-1 text-[8.5px] font-telemetry text-slate-500">
            {[1, 5, 10, 25, 50].map(val => (
              <button
                key={val}
                onClick={() => store.setVerticalExaggeration(val)}
                className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${store.verticalExaggeration === val ? 'text-cyan-300 font-bold bg-slate-800 border border-slate-700' : 'hover:text-slate-300'}`}
              >
                {val}×
              </button>
            ))}
          </div>
        </div>

        {/* 2. 4D Water Column Depth Slicer */}
        <div className="mb-1 text-[10px] font-telemetry text-slate-300 font-semibold flex items-center justify-between">
          <span>Water Column Slicing</span>
          <span className="text-[9px] text-cyan-400 font-mono">~{activeZoneInfo.tempApprox}</span>
        </div>

        <div className="flex items-stretch space-x-2.5 pt-1">
          
          {/* Interactive Vertical Track */}
          <div
            ref={trackRef}
            onMouseDown={onMouseDownTrack}
            title="Click or drag vertically to slice into the ocean column (0m to -2000m)"
            className="relative w-3.5 bg-[#050608] rounded-full border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-start cursor-ns-resize select-none hover:border-slate-600 transition-colors group"
          >
            <motion.div
              animate={{ height: `${Math.max(8, fillPercentage)}%` }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] relative pointer-events-none"
            >
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#06b6d4] ring-2 ring-cyan-500" />
            </motion.div>
          </div>

          {/* Depth Level Zones List */}
          <div className="flex-1 space-y-1 relative">
            {DEPTH_LEVELS.map((lvl) => {
              const isActive = Math.abs(currentDepth - lvl.depth) < 30;
              return (
                <button
                  key={lvl.depth}
                  onClick={() => {
                    store.setDepth(lvl.depth);
                    const layer = lvl.depth <= 0 ? 0 : lvl.depth <= 250 ? 100 : 500;
                    store.setCurrentDepthLayer(layer);
                  }}
                  className={`w-full relative px-2.5 py-1.5 rounded-xl text-left transition-all border flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#141620] border-slate-700 text-white shadow-sm'
                      : 'bg-[#0b0c10]/50 border-slate-850 text-slate-400 hover:bg-[#12141c] hover:text-slate-200'
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-between w-full pr-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-telemetry font-bold text-slate-200">{lvl.label}</span>
                      <span className="text-[9px] font-telemetry text-slate-400 truncate max-w-[100px]">
                        {lvl.zone}
                      </span>
                    </div>
                    <span className="text-[8.5px] font-telemetry text-slate-500">
                      {lvl.tempApprox}
                    </span>
                  </div>

                  <div className="relative z-10 shrink-0">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse block" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Hydrostatic Telemetry Footer */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[9px] font-telemetry text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ArrowDown className="w-3 h-3 text-cyan-400" />
            <span>Hydrostatic Pressure</span>
          </span>
          <span className="text-cyan-300 font-semibold font-telemetry">
            {Math.round(currentDepth * 0.1)} bar (~{Math.round(currentDepth * 10)} kPa)
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
