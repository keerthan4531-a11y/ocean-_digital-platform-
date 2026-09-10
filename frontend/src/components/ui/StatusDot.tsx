/**
 * AquaTwin 3D - StatusDot
 * Pulsing live status indicator dot with semantic color coding:
 * green (active), yellow (warning), red (alert/cyclone), grey (offline).
 */

import React from 'react';

export type StatusType = 'active' | 'warning' | 'alert' | 'offline';

interface StatusDotProps {
  status?: StatusType;
  size?: 'sm' | 'md' | 'lg';
  ping?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'active',
  size = 'md',
  ping = true
}) => {
  const colorMap = {
    active: {
      dot: 'bg-emerald-400',
      ping: 'bg-emerald-400/50',
      glow: 'shadow-[0_0_8px_rgba(16,185,129,0.8)]'
    },
    warning: {
      dot: 'bg-amber-400',
      ping: 'bg-amber-400/50',
      glow: 'shadow-[0_0_8px_rgba(251,191,36,0.8)]'
    },
    alert: {
      dot: 'bg-rose-400',
      ping: 'bg-rose-400/50',
      glow: 'shadow-[0_0_8px_rgba(244,63,94,0.8)]'
    },
    offline: {
      dot: 'bg-slate-500',
      ping: 'bg-slate-500/30',
      glow: 'shadow-none'
    }
  }[status];

  const sizeClass = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }[size];

  const pingSizeClass = {
    sm: 'w-3 h-3 -inset-0.5',
    md: 'w-4 h-4 -inset-1',
    lg: 'w-5 h-5 -inset-1.5'
  }[size];

  return (
    <span className="relative flex items-center justify-center shrink-0">
      {ping && status !== 'offline' && (
        <span
          className={`absolute rounded-full animate-ping opacity-75 ${pingSizeClass} ${colorMap.ping}`}
        />
      )}
      <span
        className={`relative inline-block rounded-full ${sizeClass} ${colorMap.dot} ${colorMap.glow}`}
      />
    </span>
  );
};
