/**
 * AquaTwin 3D - LiquidGlass
 * Apple iOS 18/26-style Liquid Glass wrapper component.
 * Features refractive background distortion, specular edge highlights,
 * dynamic mouse-tracking light reflection, and Framer Motion spring physics.
 */

import React, { useRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface LiquidGlassProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  intensity?: 'subtle' | 'strong';
  tint?: 'neutral' | 'cyan' | 'rose' | 'emerald';
  interactive?: boolean;
  distort?: boolean;
  className?: string;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  intensity = 'subtle',
  tint = 'neutral',
  interactive = true,
  distort = false,
  className = '',
  ...motionProps
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic light reflection tracking mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    containerRef.current.style.setProperty('--mouse-x', `${x}%`);
    containerRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  const tintClass = {
    neutral: '',
    cyan: 'liquid-tint-cyan',
    rose: 'liquid-tint-rose',
    emerald: 'liquid-tint-emerald'
  }[tint];

  const intensityClass = intensity === 'strong' 
    ? 'backdrop-blur-2xl saturate-[200%]' 
    : 'backdrop-blur-xl saturate-[180%]';

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`liquid-glass-base ${intensityClass} ${tintClass} ${
        interactive ? 'liquid-glass-reflection' : ''
      } ${distort ? 'liquid-filter-active' : ''} ${className}`}
      {...motionProps}
    >
      {/* Curved specular edge light simulation */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-black/30 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
