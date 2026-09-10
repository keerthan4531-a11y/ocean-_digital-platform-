/**
 * AquaTwin 3D - LiveBadge
 * Reusable aerospace-style live telemetry indicator pill with glowing border and status dot.
 */

import React from 'react';
import { StatusDot, StatusType } from './StatusDot';
import { LucideIcon } from 'lucide-react';

interface LiveBadgeProps {
  label: string;
  status?: StatusType;
  icon?: LucideIcon;
  subtext?: string;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'muted';
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({
  label,
  status = 'active',
  icon: Icon,
  subtext,
  variant = 'cyan'
}) => {
  const variantStyles = {
    cyan: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.15)]',
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.15)]',
    rose: 'bg-rose-950/80 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    muted: 'bg-slate-900/80 text-slate-400 border-slate-700 shadow-none'
  }[variant];

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] font-telemetry tracking-wide backdrop-blur-md ${variantStyles}`}>
      <StatusDot status={status} size="sm" />
      {Icon && <Icon className="w-3 h-3 opacity-90" />}
      <span className="font-semibold uppercase">{label}</span>
      {subtext && <span className="text-slate-400 font-normal">[{subtext}]</span>}
    </div>
  );
};
