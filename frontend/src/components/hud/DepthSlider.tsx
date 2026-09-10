import React from 'react';
import { Layers, ArrowDown } from 'lucide-react';

interface DepthSliderProps {
  depth: number;
  onChangeDepth: (depth: number) => void;
}

const DEPTH_MILESTONES = [
  { depth: 0, label: '0m', desc: 'Sea Surface' },
  { depth: 50, label: '50m', desc: 'Mixed Layer (MLD)' },
  { depth: 100, label: '100m', desc: 'Thermocline Start' },
  { depth: 200, label: '200m', desc: 'Thermocline Core' },
  { depth: 500, label: '500m', desc: 'Intermediate Water' },
  { depth: 1000, label: '1000m', desc: 'Deep Layer' },
  { depth: 2000, label: '2000m', desc: 'Abyssal Plain' }
];

export const DepthSlider: React.FC<DepthSliderProps> = ({ depth, onChangeDepth }) => {
  return (
    <div className="absolute right-4 top-20 z-30 pointer-events-none">
      <div className="glass-panel p-4 rounded-2xl pointer-events-auto border border-sky-500/30 shadow-2xl flex flex-col items-center w-56">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-sky-900/50 pb-2 mb-3">
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Depth Slicer
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-white bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700">
            -{depth}m
          </span>
        </div>

        {/* Vertical Depth Scale Track */}
        <div className="w-full flex space-x-3 items-center justify-center my-2">
          {/* Milestone Buttons */}
          <div className="flex flex-col space-y-1.5 w-full">
            {DEPTH_MILESTONES.map(m => {
              const isSelected = depth === m.depth;
              return (
                <button
                  key={m.depth}
                  onClick={() => onChangeDepth(m.depth)}
                  className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-md shadow-cyan-500/30'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{m.label}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Ocean Layer Badge */}
        <div className="w-full mt-2 pt-2 border-t border-sky-900/40 text-center">
          <div className="text-[10px] font-mono text-cyan-300 flex items-center justify-center gap-1">
            <ArrowDown className="w-3 h-3 text-cyan-400 animate-bounce" />
            <span>
              {depth === 0 && 'Surface Epipelagic Zone'}
              {depth > 0 && depth <= 100 && 'Sunlit Euphotic Layer'}
              {depth > 100 && depth <= 500 && 'Mesopelagic Thermocline'}
              {depth > 500 && depth <= 1000 && 'Bathypelagic Intermediate'}
              {depth > 1000 && 'Abyssopelagic Deep Sea Floor'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
