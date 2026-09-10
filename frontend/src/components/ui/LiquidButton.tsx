/**
 * AquaTwin 3D - LiquidButton
 * High-end tactile button crafted with iOS 18/26 Liquid Glass material.
 * Features squishy elastic spring morph (stiffness 400, damping 17),
 * specular edge illumination, and dynamic mouse tracking highlights.
 */

import React, { useRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface LiquidButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  children,
  icon: Icon,
  variant = 'cyan',
  size = 'md',
  active = false,
  className = '',
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    buttonRef.current.style.setProperty('--mouse-x', `${x}%`);
    buttonRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs rounded-xl gap-1.5',
    md: 'px-3.5 py-1.5 text-xs rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm rounded-2xl gap-2.5'
  }[size];

  const variantStyles = {
    cyan: active
      ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]'
      : 'bg-slate-900/60 text-slate-200 border-white/20 hover:border-cyan-400/50 hover:text-white',
    emerald: active
      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]'
      : 'bg-slate-900/60 text-slate-200 border-white/20 hover:border-emerald-400/50 hover:text-white',
    amber: active
      ? 'bg-amber-500/30 text-amber-200 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]'
      : 'bg-slate-900/60 text-slate-200 border-white/20 hover:border-amber-400/50 hover:text-white',
    rose: active
      ? 'bg-rose-500/30 text-rose-200 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)]'
      : 'bg-slate-900/60 text-slate-200 border-white/20 hover:border-rose-400/50 hover:text-white',
    ghost: 'bg-transparent text-slate-300 border-white/10 hover:border-white/30 hover:text-white'
  }[variant];

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={{ scale: 1.035, y: -0.5 }}
      whileTap={{ scale: 0.965 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`relative inline-flex items-center justify-center font-header font-semibold cursor-pointer select-none overflow-hidden backdrop-blur-xl border shadow-lg liquid-glass-reflection ${sizeClasses} ${variantStyles} ${className}`}
      {...props}
    >
      {/* Specular top rim light */}
      <span className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" />}
      {children && <span className="relative z-10">{children}</span>}
    </motion.button>
  );
};
