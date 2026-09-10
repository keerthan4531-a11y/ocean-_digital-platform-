/**
 * AquaTwin 3D - MetricCard
 * Premium glassmorphic HUD metric card with neon glow accents and trend indicators.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'cyan' | 'coral' | 'amber' | 'emerald';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = 'cyan',
  badge
}) => {
  const accentClasses = {
    cyan: 'border-cyan-500/30 text-cyan-400',
    coral: 'border-rose-500/30 text-rose-400',
    amber: 'border-amber-500/30 text-amber-400',
    emerald: 'border-emerald-500/30 text-emerald-400'
  }[accentColor];

  const glowBg = {
    cyan: 'from-cyan-500/10 to-transparent',
    coral: 'from-rose-500/10 to-transparent',
    amber: 'from-amber-500/10 to-transparent',
    emerald: 'from-emerald-500/10 to-transparent'
  }[accentColor];

  return (
    <div className={`glass-panel rounded-xl p-3.5 border ${accentClasses} bg-gradient-to-b ${glowBg} transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className={`w-4 h-4 ${accentClasses.split(' ')[1]}`} />}
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {unit && <span className="text-xs font-mono text-slate-400">{unit}</span>}
      </div>

      {trend && (
        <div className="mt-1.5 text-[11px] font-mono flex items-center space-x-1">
          <span className={trendPositive ? 'text-emerald-400' : 'text-rose-400'}>
            {trendPositive ? '↑' : '↓'} {trend}
          </span>
          <span className="text-slate-500">vs model baseline</span>
        </div>
      )}
    </div>
  );
};
