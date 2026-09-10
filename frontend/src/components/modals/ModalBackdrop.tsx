/**
 * AquaTwin 3D - ModalBackdrop
 * Blurred dark overlay with fade entrance and exit transitions.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ModalBackdropProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export const ModalBackdrop: React.FC<ModalBackdropProps> = ({ children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
        {children}
      </div>
    </motion.div>
  );
};
