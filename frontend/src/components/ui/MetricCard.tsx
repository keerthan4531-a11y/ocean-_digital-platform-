/**
 * AquaTwin 3D - MetricCard (Elevated Mission Control Component)
 * Stat card with contextual neon glow, AnimatedCounter interpolation, and trend arrows.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface MetricCardProps {
  label: string;
  value: number | string;
  numericValue?: number;
  unit?: string;
  icon?: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'cyan' | 'coral' | 'amber' | 'emerald';
  badge?: string;
  precision?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  numericValue,
  unit,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = 'cyan',
  badge,
  precision = 1
}) => {
  const accentStyles = {
    cyan: {
      border: 'border-cyan-500/25 hover:border-cyan-400/60',
      iconBg: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40',
      glow: 'shadow-[0_0_14px_rgba(0,242,254,0.12)]',
      text: 'text-cyan-400'
    },
    coral: {
      border: 'border-rose-500/25 hover:border-rose-400/60',
      iconBg: 'bg-rose-950/80 text-rose-400 border-rose-500/40',
      glow: 'shadow-[0_0_14px_rgba(244,63,94,0.12)]',
      text: 'text-rose-400'
    },
    amber: {
      border: 'border-amber-500/25 hover:border-amber-400/60',
      iconBg: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
      glow: 'shadow-[0_0_14px_rgba(251,191,36,0.12)]',
      text: 'text-amber-400'
    },
    emerald: {
      border: 'border-emerald-500/25 hover:border-emerald-400/60',
      iconBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
      glow: 'shadow-[0_0_14px_rgba(16,185,129,0.12)]',
      text: 'text-emerald-400'
    }
  }[accentColor];

  const parsedNumber = typeof value === 'number' ? value : numericValue;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`glass-mission p-3 rounded-xl border ${accentStyles.border} ${accentStyles.glow} relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          {Icon && (
            <div className={`p-1 rounded border ${accentStyles.iconBg}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-[10px] font-header font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
        </div>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 font-telemetry border border-cyan-500/30">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline space-x-1 mt-0.5">
        {parsedNumber !== undefined ? (
          <AnimatedCounter
            value={parsedNumber}
            precision={precision}
            className="text-xl font-bold text-white tracking-tight"
          />
        ) : (
          <span className="text-xl font-bold font-telemetry text-white tracking-tight">{value}</span>
        )}
        {unit && <span className="text-xs font-telemetry text-slate-400 ml-0.5">{unit}</span>}
      </div>

      {trend && (
        <div className="mt-1.5 text-[10px] font-telemetry flex items-center space-x-1 text-slate-400">
          <span className={trendPositive ? 'text-emerald-400' : 'text-rose-400'}>
            {trendPositive ? '▲' : '▼'} {trend}
          </span>
          <span className="text-slate-500">vs model</span>
        </div>
      )}
    </motion.div>
  );
};
