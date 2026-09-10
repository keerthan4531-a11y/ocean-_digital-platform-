/**
 * AquaTwin 3D - AnimatedToggle
 * Custom mission-control toggle switch with smooth Framer Motion thumb slide,
 * glowing active track, and haptic scale tap feedback.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md';
  activeColor?: 'cyan' | 'emerald' | 'amber' | 'rose';
  disabled?: boolean;
  ariaLabel?: string;
}

export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  checked,
  onChange,
  size = 'md',
  activeColor = 'cyan',
  disabled = false,
  ariaLabel
}) => {
  const isSm = size === 'sm';

  const trackColor = {
    cyan: checked ? 'bg-cyan-500 shadow-[0_0_12px_rgba(0,242,254,0.6)]' : 'bg-slate-800',
    emerald: checked ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-slate-800',
    amber: checked ? 'bg-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'bg-slate-800',
    rose: checked ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' : 'bg-slate-800'
  }[activeColor];

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 border border-slate-700/60 focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        isSm ? 'w-8 h-4 p-0.5' : 'w-10 h-5 p-0.5'
      } ${trackColor}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`rounded-full bg-white shadow-md block ${
          isSm ? 'w-3 h-3' : 'w-4 h-4'
        } ${checked ? (isSm ? 'ml-4' : 'ml-5') : 'ml-0'}`}
      />
    </motion.button>
  );
};
