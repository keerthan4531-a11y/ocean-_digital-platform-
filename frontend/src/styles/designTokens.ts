/**
 * AquaTwin 3D - Mission Control Design Tokens
 * Central source of truth for colors, typography, shadows, transitions, and glassmorphism.
 */

export const tokens = {
  colors: {
    bgBase: '#030712',                  // Near-black deep navy background
    bgSurface: 'rgba(10, 25, 47, 0.55)', // Translucent glassmorphic panel base
    bgSurfaceHover: 'rgba(12, 33, 64, 0.75)',
    bgSurfaceActive: 'rgba(14, 45, 89, 0.85)',
    
    // Primary & Secondary Accents
    accentPrimary: '#00f2fe',           // Electric cyan
    accentSecondary: '#0891b2',         // Deep ocean teal
    accentCyanGlow: 'rgba(0, 242, 254, 0.4)',
    accentTealGlow: 'rgba(8, 145, 178, 0.4)',

    // Semantic Telemetry Status Colors
    statusSuccess: '#10b981',           // Emerald glow (active, calibrated)
    statusWarning: '#fbbf24',           // Amber (warning, thermocline)
    statusDanger: '#f43f5e',            // Rose red (cyclone alert, high residual)
    statusOffline: '#64748b',           // Slate grey (offline)

    // Scientific Data Scales
    thermalHot: '#ef4444',              // > 30°C SST
    thermalWarm: '#f97316',             // 28-30°C
    thermalMild: '#06b6d4',             // 24-28°C
    thermalCold: '#1e3a8a',             // < 24°C Abyssal

    // Typography & Text
    textPrimary: '#e2e8f0',             // High-contrast clean white-slate
    textSecondary: '#94a3b8',           // Subtle telemetry labels
    textMuted: '#64748b',               // Faint grid labels & units
    textAccent: '#38bdf8',              // Sky cyan highlights

    // Borders & Glass Accents
    borderGlass: 'rgba(0, 242, 254, 0.12)',
    borderGlassHover: 'rgba(0, 242, 254, 0.38)',
    borderGlassActive: 'rgba(0, 242, 254, 0.70)',
    borderGlowSubtle: 'rgba(56, 189, 248, 0.20)'
  },

  typography: {
    fontHeader: "'Space Grotesk', 'Orbitron', -apple-system, sans-serif",
    fontMono: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    fontBody: "'Inter', -apple-system, sans-serif",
    sizes: {
      labelTiny: '9px',
      labelSmall: '10px',
      labelMedium: '11px',
      bodyText: '13px',
      valueSmall: '14px',
      valueMedium: '16px',
      valueLarge: '22px',
      headerTitle: '18px'
    },
    letterSpacing: {
      wide: '0.08em',
      wider: '0.12em',
      widest: '0.18em'
    }
  },

  glass: {
    panel: {
      background: 'rgba(10, 25, 47, 0.60)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 242, 254, 0.12)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    },
    panelHover: {
      borderColor: 'rgba(0, 242, 254, 0.40)',
      boxShadow: '0 12px 36px rgba(0, 242, 254, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }
  },

  shadows: {
    glowCyan: '0 0 16px rgba(0, 242, 254, 0.45)',
    glowCyanStrong: '0 0 24px rgba(0, 242, 254, 0.75)',
    glowEmerald: '0 0 14px rgba(16, 185, 129, 0.50)',
    glowAmber: '0 0 14px rgba(251, 191, 36, 0.50)',
    glowRose: '0 0 16px rgba(244, 63, 94, 0.55)',
    insetGlow: 'inset 0 0 12px rgba(0, 242, 254, 0.10)'
  },

  transitions: {
    default: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
} as const;
