/**
 * AquaTwin 3D - BottomTimelineBar (4D Temporal Scrubber)
 * 4D time playback dock with animated glowing cyan progress fill, pulsing position bead,
 * speed multiplier, and forecast step controls.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock, FastForward } from 'lucide-react';
import { useOceanStore } from '../../services/oceanStore';

const FORECAST_STEPS = [0, 6, 12, 18, 24, 36, 48, 72];

export const BottomTimelineBar: React.FC = () => {
  const store = useOceanStore();
  const currentStep = store.forecastHour;
  const isPlaying = store.isPlaying;
  const speed = store.speed;

  const currentIndex = FORECAST_STEPS.indexOf(currentStep);
  const maxStep = FORECAST_STEPS[FORECAST_STEPS.length - 1];
  const progressPercent = Math.min(100, (currentStep / maxStep) * 100);

  const handleStepBack = () => {
    if (currentIndex > 0) store.setForecastHour(FORECAST_STEPS[currentIndex - 1]);
  };

  const handleStepForward = () => {
    if (currentIndex < FORECAST_STEPS.length - 1) store.setForecastHour(FORECAST_STEPS[currentIndex + 1]);
  };

  return (
    <div className="liquid-glass-base liquid-glass-reflection p-3 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-2.5 backdrop-blur-2xl">
      
      {/* Header Info: Forecast Time & Speed Multiplier */}
      <div className="flex items-center justify-between text-xs font-telemetry">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>4D Forecast Playback</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            TIMESTEP: <span className="text-cyan-300 font-bold tracking-widest font-telemetry">T+{String(currentStep).padStart(2, '0')} HOURS</span>
          </span>
        </div>

        {/* Speed Multiplier Pill */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <FastForward className="w-3 h-3 text-slate-400 ml-1" />
          {[1, 5, 24].map((s) => (
            <button
              key={s}
              onClick={() => store.setSpeed(s)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-telemetry transition-colors cursor-pointer ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,242,254,0.6)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Control Buttons & Glowing Scrubber Track */}
      <div className="flex items-center space-x-3">
        
        {/* Step Back */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleStepBack}
          disabled={currentIndex === 0}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors cursor-pointer border border-white/10"
        >
          <SkipBack className="w-4 h-4" />
        </motion.button>

        {/* Play / Pause Toggle with Squishy Liquid Glass Spring */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={() => store.setIsPlaying(!isPlaying)}
          className={`p-3 rounded-2xl transition-all shadow-xl flex items-center justify-center cursor-pointer relative overflow-hidden border ${
            isPlaying
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.7),inset_0_1px_1px_rgba(255,255,255,0.8)]'
              : 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_16px_rgba(0,242,254,0.7),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:bg-cyan-300'
          }`}
        >
          <span className="absolute top-0 inset-x-0 h-[1px] bg-white/60 pointer-events-none" />
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
        </motion.button>

        {/* Step Forward */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleStepForward}
          disabled={currentIndex === FORECAST_STEPS.length - 1}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors cursor-pointer border border-white/10"
        >
          <SkipForward className="w-4 h-4" />
        </motion.button>

        {/* Interactive Steps with Glowing Progress Fill */}
        <div className="flex-1 flex flex-col justify-center space-y-1.5 relative">
          
          {/* Continuous Glowing Progress Track */}
          <div className="relative h-2 w-full bg-slate-900/90 rounded-full border border-slate-800/90 overflow-hidden shadow-inner">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-300 rounded-full shadow-[0_0_10px_#00f2fe]"
            />
          </div>

          {/* Stepped Markers */}
          <div className="flex items-center justify-between px-0.5">
            {FORECAST_STEPS.map((step) => {
              const isActive = currentStep === step;
              return (
                <button
                  key={step}
                  onClick={() => store.setForecastHour(step)}
                  className="group flex flex-col items-center cursor-pointer focus:outline-none"
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-all border ${
                      isActive
                        ? 'bg-cyan-400 border-white shadow-[0_0_8px_#00f2fe] scale-125'
                        : 'bg-slate-800 border-slate-700 group-hover:bg-slate-700'
                    }`}
                  />
                  <span className={`text-[9px] font-telemetry mt-0.5 ${isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
                    +{step}h
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Reset to T+00 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => store.setForecastHour(0)}
          title="Reset to T+00"
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </motion.button>

      </div>
    </div>
  );
};
