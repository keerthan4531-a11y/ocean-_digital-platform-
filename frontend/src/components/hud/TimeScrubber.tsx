import React from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Clock, FastForward } from 'lucide-react';

interface TimeScrubberProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  forecastHour: number;
  onChangeForecastHour: (hour: number) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
}

const FORECAST_STEPS = [0, 6, 12, 18, 24, 36, 48, 72];

export const TimeScrubber: React.FC<TimeScrubberProps> = ({
  isPlaying,
  onTogglePlay,
  forecastHour,
  onChangeForecastHour,
  speed,
  onChangeSpeed
}) => {
  const currentIndex = FORECAST_STEPS.indexOf(forecastHour);

  const handleStepBack = () => {
    if (currentIndex > 0) onChangeForecastHour(FORECAST_STEPS[currentIndex - 1]);
  };

  const handleStepForward = () => {
    if (currentIndex < FORECAST_STEPS.length - 1) onChangeForecastHour(FORECAST_STEPS[currentIndex + 1]);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full max-w-2xl px-4">
      <div className="glass-panel p-3.5 rounded-2xl pointer-events-auto border border-sky-500/30 shadow-2xl flex flex-col space-y-2.5">
        
        {/* Playback Controls & Time Stamp */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 text-cyan-400">
              <Clock className="w-4 h-4" />
              <span className="font-bold">4D TEMPORAL PLAYER</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              FORECAST: <span className="text-cyan-300 font-bold">T+{forecastHour.toString().padStart(2, '0')} HOURS</span>
            </span>
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
            <FastForward className="w-3 h-3 text-slate-400 ml-1" />
            {[1, 5, 24].map(s => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  speed === s
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider with Step Markers */}
        <div className="relative flex items-center space-x-3">
          {/* Step Back */}
          <button
            onClick={handleStepBack}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            className={`p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                : 'bg-cyan-500 text-slate-950 shadow-cyan-500/30 hover:bg-cyan-400'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
          </button>

          {/* Step Forward */}
          <button
            onClick={handleStepForward}
            disabled={currentIndex === FORECAST_STEPS.length - 1}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Interactive Steps Bar */}
          <div className="flex-1 flex items-center space-x-1 relative">
            {FORECAST_STEPS.map((h, i) => {
              const isActive = forecastHour === h;
              const isPast = forecastHour > h;
              return (
                <button
                  key={h}
                  onClick={() => onChangeForecastHour(h)}
                  className="flex-1 group py-1 flex flex-col items-center cursor-pointer"
                >
                  <div className="w-full flex items-center">
                    <div 
                      className={`h-1.5 w-full rounded-full transition-all ${
                        isActive
                          ? 'bg-cyan-400 shadow-md shadow-cyan-400/50'
                          : isPast
                          ? 'bg-cyan-700'
                          : 'bg-slate-800 group-hover:bg-slate-700'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-mono mt-1 ${isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
                    +{h}h
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reset */}
          <button
            onClick={() => onChangeForecastHour(0)}
            title="Reset to T+00"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
