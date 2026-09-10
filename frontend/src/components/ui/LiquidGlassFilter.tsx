/**
 * AquaTwin 3D - LiquidGlassFilter
 * Global SVG filter definition for iOS 18/26-style Liquid Glass refraction.
 * Rendered ONCE at the application root to provide lightweight, hardware-accelerated
 * background distortion without duplicating filters across DOM nodes.
 */

import React from 'react';

export const LiquidGlassFilter: React.FC = () => {
  return (
    <svg
      aria-hidden="true"
      className="sr-only absolute -z-50 w-0 h-0 pointer-events-none opacity-0 overflow-hidden"
      style={{ position: 'absolute', width: 0, height: 0 }}
    >
      <defs>
        <filter id="liquid-glass-distortion" x="-10%" y="-10%" width="120%" height="120%">
          {/* Subtle noise turbulence for fluid organic displacement */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008"
            numOctaves="2"
            result="noise"
          />
          {/* Displace the graphic smoothly based on the turbulence map */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
        </filter>
      </defs>
    </svg>
  );
};
