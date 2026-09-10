/**
 * AquaTwin 3D - AppShell (Mission Control Layout Grid)
 * Coordinates the full-screen NASA/Palantir-style interface:
 * - Header dock with shifting gradient border
 * - Center 3D WebGL viewport with sci-fi HUD corner brackets
 * - Left dock (Layer Control & In-Situ Sensor Telemetry)
 * - Right dock (Vertical Depth Slicer)
 * - Bottom dock (4D Temporal Player Bar)
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  slideFromLeftVariants,
  slideFromRightVariants,
  slideFromBottomVariants,
  slideFromTopVariants
} from '../../hooks/useStaggerAnimation';

interface AppShellProps {
  header: React.ReactNode;
  viewport3D: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  bottomBar?: React.ReactNode;
  modals?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  header,
  viewport3D,
  leftSidebar,
  rightSidebar,
  bottomBar,
  modals
}) => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020306] text-slate-100 font-header select-none">
      
      {/* Center 3D WebGL Viewport */}
      <div className="absolute inset-0 z-0">
        {viewport3D}
      </div>

      {/* Top Header Dock */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={slideFromTopVariants}
        className="absolute top-0 inset-x-0 z-30 pointer-events-none"
      >
        <div className="pointer-events-auto">
          {header}
        </div>
      </motion.header>

      {/* Left Sidebar Telemetry Dock */}
      {leftSidebar && (
        <motion.aside
          initial="hidden"
          animate="visible"
          variants={slideFromLeftVariants}
          className="absolute top-20 left-4 z-20 pointer-events-none flex flex-col space-y-3"
        >
          <div className="pointer-events-auto flex flex-col space-y-3">
            {leftSidebar}
          </div>
        </motion.aside>
      )}

      {/* Right Sidebar Depth & Sensor Dock */}
      {rightSidebar && (
        <motion.aside
          initial="hidden"
          animate="visible"
          variants={slideFromRightVariants}
          className="absolute top-20 right-4 z-20 pointer-events-none"
        >
          <div className="pointer-events-auto">
            {rightSidebar}
          </div>
        </motion.aside>
      )}

      {/* Bottom Timeline Player Dock */}
      {bottomBar && (
        <motion.footer
          initial="hidden"
          animate="visible"
          variants={slideFromBottomVariants}
          className="absolute bottom-5 inset-x-0 z-20 pointer-events-none flex justify-center px-4"
        >
          <div className="pointer-events-auto w-full max-w-2xl">
            {bottomBar}
          </div>
        </motion.footer>
      )}

      {/* Floating Modals and Dialogs */}
      {modals}
    </div>
  );
};
