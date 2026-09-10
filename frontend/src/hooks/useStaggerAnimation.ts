/**
 * Framer Motion animation variants for Mission Control panel entrance animations.
 * Provides staggered entrances (0.05s between panels), smooth ease-out curves,
 * and directional slide-ins.
 */

import { Variants } from 'framer-motion';

export const containerStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

export const slideFromLeftVariants: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.25, ease: 'easeIn' }
  }
};

export const slideFromRightVariants: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.25, ease: 'easeIn' }
  }
};

export const slideFromBottomVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.25, ease: 'easeIn' }
  }
};

export const slideFromTopVariants: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  }
};

export const modalScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};
