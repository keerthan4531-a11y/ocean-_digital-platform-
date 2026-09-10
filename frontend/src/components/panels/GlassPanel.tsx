/**
 * AquaTwin 3D - GlassPanel (Mission Control Base Component)
 * Reusable panel wrapper providing 20px backdrop blur, subtle corner accents,
 * glowing border states, and Framer Motion micro-animations.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, ChevronDown } from 'lucide-react';

export interface GlassPanelProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  glowColor?: 'cyan' | 'teal' | 'emerald' | 'amber' | 'rose';
  liquid?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  action,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false,
  glowColor = 'cyan',
  liquid = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const glowBorderClass = {
    cyan: 'border-cyan-500/20 hover:border-cyan-400/50 shadow-cyan-950/20',
    teal: 'border-teal-500/20 hover:border-teal-400/50 shadow-teal-950/20',
    emerald: 'border-emerald-500/20 hover:border-emerald-400/50 shadow-emerald-950/20',
    amber: 'border-amber-500/20 hover:border-amber-400/50 shadow-amber-950/20',
    rose: 'border-rose-500/20 hover:border-rose-400/50 shadow-rose-950/20'
  }[glowColor];

  const baseStyleClass = liquid
    ? 'liquid-glass-base liquid-glass-reflection'
    : 'glass-mission';

  return (
    <motion.section
      layout
      whileHover={{ scale: 1.008 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`relative ${baseStyleClass} ${glowBorderClass} p-3.5 shadow-2xl transition-colors duration-200 ${className}`}
    >
      {/* Top subtle HUD sci-fi corner accent notch */}
      <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-cyan-400/60 rounded-tl-[12px] pointer-events-none" />
      <div className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t border-r border-cyan-400/60 rounded-tr-[12px] pointer-events-none" />

      {/* Header bar if title or icon provided */}
      {(title || Icon || badge || action) && (
        <header className="flex items-center justify-between border-b border-cyan-950/80 pb-2.5 mb-3 select-none">
          <div className="flex items-center space-x-2.5">
            {Icon && (
              <div className="p-1 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                <Icon className="w-3.5 h-3.5 drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-[11px] font-header font-bold tracking-wider text-slate-100 uppercase leading-none">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[9px] font-telemetry text-slate-400 tracking-wide mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {badge}
            {action}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <motion.div animate={{ rotate: isCollapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.div>
              </button>
            )}
          </div>
        </header>
      )}

      {/* Panel Content with Collapsible AnimatePresence */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
