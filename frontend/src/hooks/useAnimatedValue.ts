/**
 * Hook for smoothly animating numerical telemetry values using Framer Motion springs.
 * Avoids abrupt snap-changes when sensor data or forecast timesteps update.
 */

import { useEffect } from 'react';
import { useSpring, useTransform, MotionValue } from 'framer-motion';

interface UseAnimatedValueOptions {
  damping?: number;
  stiffness?: number;
  precision?: number;
}

export function useAnimatedValue(
  value: number,
  options: UseAnimatedValueOptions = {}
): MotionValue<string> {
  const { damping = 28, stiffness = 160, precision = 1 } = options;

  const spring = useSpring(value, { damping, stiffness });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return useTransform(spring, (latest) => latest.toFixed(precision));
}
