/**
 * AquaTwin 3D - AnimatedCounter
 * Smoothly interpolates and counts up/down when numerical telemetry props change.
 * Uses Framer Motion physics springs for jitter-free 60 FPS transitions.
 */

import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  precision = 0,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const spring = useSpring(value, {
    stiffness: 140,
    damping: 24,
    mass: 0.8
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(precision)}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span className={`font-telemetry inline-block ${className}`}>
      {display}
    </motion.span>
  );
};
