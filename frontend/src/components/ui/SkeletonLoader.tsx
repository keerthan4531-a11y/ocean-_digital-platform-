/**
 * AquaTwin 3D - SkeletonLoader
 * Shimmering loading placeholder with animated sweep for telemetry and chart data.
 */

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = 'h-4 w-full',
  count = 1
}) => {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-lg bg-slate-800/60 border border-slate-700/40 animate-shimmer ${className}`}
        />
      ))}
    </div>
  );
};
