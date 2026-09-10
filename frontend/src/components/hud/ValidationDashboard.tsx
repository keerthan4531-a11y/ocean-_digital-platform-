import React from 'react';
import { BarChart3, CheckCircle2, AlertTriangle, X, TrendingUp, Cpu, Gauge } from 'lucide-react';
import { ValidationSummary } from '../../types/ocean';

interface ValidationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  validationSummary: ValidationSummary;
}

export const ValidationDashboard: React.FC<ValidationDashboardProps> = ({
  isOpen,
  onClose,
  validationSummary
}) => {
  if (!isOpen) return null;

  const { metrics, comparisons } = validationSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-5xl rounded-2xl border border-emerald-500/40 p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-900/50 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BarChart3 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
                Ground-Truth Model Validation Engine
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  INCOIS-ROMS vs OMNI BUOYS
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Statistical comparison of numerical physics forecast vs calibrated in-situ buoy telemetry
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

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Overall Skill Score</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              {metrics.overall_model_skill_pct}%
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> High Operational Accuracy
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-red-400" />
              <span>SST RMSE</span>
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              ±{metrics.sst_rmse_c}°C
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Bias: {metrics.sst_mean_bias_c > 0 ? `+${metrics.sst_mean_bias_c}` : metrics.sst_mean_bias_c}°C
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Salinity RMSE</span>
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              ±{metrics.salinity_rmse_psu} PSU
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Bias: {metrics.salinity_mean_bias_psu > 0 ? `+${metrics.salinity_mean_bias_psu}` : metrics.salinity_mean_bias_psu} PSU
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Matched Sensors</span>
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-1 font-mono">
              {validationSummary.evaluated_sensors} Moored Stations
            </div>
            <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
              Bay of Bengal & Arabian Sea
            </div>
          </div>
        </div>

        {/* Detailed Sensor Residuals Comparison Table */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-1">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3">Station ID</th>
                <th className="p-3">Location</th>
                <th className="p-3">Model SST</th>
                <th className="p-3">Buoy SST</th>
                <th className="p-3">Residual (ΔT)</th>
                <th className="p-3">Model Sal</th>
                <th className="p-3">Buoy Sal</th>
                <th className="p-3">Skill Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-200">
              {comparisons.map(c => {
                const isOver = c.residual_sst < 0; // Model predicted warmer than observed
                return (
                  <tr key={c.buoy_id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-bold text-cyan-400">{c.name}</td>
                    <td className="p-3 text-slate-400">{c.lat}°N, {c.lon}°E</td>
                    <td className="p-3 text-slate-300">{c.model_sst}°C</td>
                    <td className="p-3 font-bold text-white">{c.obs_sst}°C</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        Math.abs(c.residual_sst) <= 0.3
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {c.residual_sst > 0 ? `+${c.residual_sst}` : c.residual_sst}°C
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{c.model_salinity}</td>
                    <td className="p-3 font-bold text-white">{c.obs_salinity}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${c.accuracy_score_pct}%` }}
                          />
                        </div>
                        <span className="font-bold text-emerald-400">{c.accuracy_score_pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Residual Interpretation Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span>High Skill (&lt; 0.3°C deviation)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span>Minor Bias (&gt; 0.3°C deviation)</span>
            </span>
          </div>
          <span>Updated: Real-time MoES In-Situ Ingestion</span>
        </div>

      </div>
    </div>
  );
};
