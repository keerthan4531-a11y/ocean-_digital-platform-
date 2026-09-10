/**
 * AquaTwin 3D - VolumeSlicerBox3D
 * Dedicated modal view for 3D Hydrographic Ocean Volume Slicing. Box (Region Explorer).
 * 
 * Features:
 * - 3D Bounding Box representing a specific ocean region (Bay of Bengal, Arabian Sea, etc.)
 * - 3 Orthogonal Interactive Cutting Planes (X = Latitude, Y = Depth, Z = Longitude)
 * - Dynamic GPU Canvas Textures on each slice plane reflecting physical ocean variables
 * - 3D Intersection Crosshairs with glowing holographic probe beacon
 * - Direct Click-to-Probe raycasting on all 3 planes
 * - Full 6-DOF telemetry readout panel with live depth/salinity/currents/chlorophyll
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  X, 
  RotateCcw, 
  Maximize2, 
  Compass, 
  Layers, 
  Info,
  Sliders,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { VolumeRegion, VolumeVariable, VolumeProbeData } from '../../types/ocean';
import { 
  VOLUME_REGIONS, 
  generateSliceTexture, 
  probeVolumePoint, 
  VOLUME_VARIABLE_META 
} from '../../services/volumeDataService';
import { VolumeControlPanel } from '../panels/VolumeControlPanel';

interface VolumeSlicerBox3DProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3D Box Dimensions in Three.js world units
const BOX_W = 10.0; // X axis = Longitude (or Latitude)
const BOX_H = 6.0;  // Y axis = Depth (0m at +3.0, -2000m at -3.0)
const BOX_D = 8.0;  // Z axis = Latitude (or Longitude)

export const VolumeSlicerBox3D: React.FC<VolumeSlicerBox3DProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedRegion, setSelectedRegion] = useState<VolumeRegion>(VOLUME_REGIONS[0]);
  const [activeVariable, setActiveVariable] = useState<VolumeVariable>('temperature');

  // Slicing coordinates within region bounds
  const [cutLat, setCutLat] = useState<number>(14.0);
  const [cutDepth, setCutDepth] = useState<number>(100);
  const [cutLon, setCutLon] = useState<number>(86.0);

  // Plane visibility toggles
  const [visiblePlanes, setVisiblePlanes] = useState<{ x: boolean; y: boolean; z: boolean }>({
    x: true,
    y: true,
    z: true
  });

  // Three.js refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const boxGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Plane mesh refs
  const planeXMeshRef = useRef<THREE.Mesh | null>(null);
  const planeYMeshRef = useRef<THREE.Mesh | null>(null);
  const planeZMeshRef = useRef<THREE.Mesh | null>(null);
  const probeBeaconRef = useRef<THREE.Group | null>(null);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Reset slicing coordinates when region changes
  useEffect(() => {
    const b = selectedRegion.bounds;
    setCutLat(+((b.latMin + b.latMax) / 2).toFixed(1));
    setCutDepth(100);
    setCutLon(+((b.lonMin + b.lonMax) / 2).toFixed(1));
  }, [selectedRegion]);

  // Compute live probe data at intersection
  const probeData = useMemo<VolumeProbeData>(() => {
    return probeVolumePoint(cutLat, cutLon, cutDepth);
  }, [cutLat, cutLon, cutDepth]);

  // Helper to map geographic coordinates to 3D box coordinates
  // X axis = Longitude (bounds.lonMin -> bounds.lonMax) => -BOX_W/2 -> +BOX_W/2
  // Y axis = Depth (0m -> 2000m) => +BOX_H/2 (surface) -> -BOX_H/2 (deep)
  // Z axis = Latitude (bounds.latMin -> bounds.latMax) => +BOX_D/2 (South) -> -BOX_D/2 (North)
  const geoTo3D = (lat: number, lon: number, depth: number) => {
    const b = selectedRegion.bounds;
    const normLon = (lon - b.lonMin) / (b.lonMax - b.lonMin);
    const normDepth = depth / (b.depthMax - b.depthMin);
    const normLat = (lat - b.latMin) / (b.latMax - b.latMin);

    const x = (normLon - 0.5) * BOX_W;
    const y = (0.5 - normDepth) * BOX_H;
    const z = (0.5 - normLat) * BOX_D;

    return { x, y, z };
  };

  // Helper to map 3D coordinate back to geographic
  const threeDToGeo = (x: number, y: number, z: number) => {
    const b = selectedRegion.bounds;
    const normLon = Math.max(0, Math.min(1, x / BOX_W + 0.5));
    const normDepth = Math.max(0, Math.min(1, 0.5 - y / BOX_H));
    const normLat = Math.max(0, Math.min(1, 0.5 - z / BOX_D));

    const lon = b.lonMin + normLon * (b.lonMax - b.lonMin);
    const depth = b.depthMin + normDepth * (b.depthMax - b.depthMin);
    const lat = b.latMin + normLat * (b.latMax - b.latMin);

    return { lat, lon, depth };
  };

  // Initialize Three.js Scene
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;
    const container = mountRef.current;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(13, 9, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 1.2);
    dirLight1.position.set(15, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-15, -10, -15);
    scene.add(dirLight2);

    // 4. Box Group
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    boxGroupRef.current = boxGroup;

    // 5. Sci-Fi Wireframe Bounding Box
    const boxGeo = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({ 
      color: 0x00f2fe, 
      transparent: true, 
      opacity: 0.75,
      linewidth: 2 
    });
    const boxWireframe = new THREE.LineSegments(edges, lineMat);
    boxGroup.add(boxWireframe);

    // Subtle translucent ocean water cube background
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.08,
      roughness: 0.1,
      transmission: 0.7,
      side: THREE.BackSide
    });
    const waterMesh = new THREE.Mesh(boxGeo, waterMat);
    boxGroup.add(waterMesh);

    // 6. Base Ocean Floor Grid (at Y = -BOX_H/2)
    const gridHelper = new THREE.GridHelper(Math.max(BOX_W, BOX_D), 16, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -BOX_H / 2;
    boxGroup.add(gridHelper);

    // 7. Corner Vertex Beacon Accents
    const cornerOffsets = [
      [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1]
    ];
    cornerOffsets.forEach(([cx, cy, cz]) => {
      const cornerGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const cornerMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
      const corner = new THREE.Mesh(cornerGeo, cornerMat);
      corner.position.set(cx * (BOX_W / 2), cy * (BOX_H / 2), cz * (BOX_D / 2));
      boxGroup.add(corner);
    });

    // 8. Orthogonal Slicing Plane Meshes
    // Plane Y (Depth Slice - Horizontal)
    const planeYGeo = new THREE.PlaneGeometry(BOX_W, BOX_D);
    planeYGeo.rotateX(-Math.PI / 2);
    const planeYMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      roughness: 0.3
    });
    const planeYMesh = new THREE.Mesh(planeYGeo, planeYMat);
    planeYMesh.name = 'plane_y';
    boxGroup.add(planeYMesh);
    planeYMeshRef.current = planeYMesh;

    // Plane X (Latitude Slice - Vertical N-S, varying along Z axis)
    const planeXGeo = new THREE.PlaneGeometry(BOX_W, BOX_H);
    const planeXMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      roughness: 0.3
    });
    const planeXMesh = new THREE.Mesh(planeXGeo, planeXMat);
    planeXMesh.name = 'plane_x';
    boxGroup.add(planeXMesh);
    planeXMeshRef.current = planeXMesh;

    // Plane Z (Longitude Slice - Vertical E-W, varying along X axis)
    const planeZGeo = new THREE.PlaneGeometry(BOX_D, BOX_H);
    planeZGeo.rotateY(Math.PI / 2);
    const planeZMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      roughness: 0.3
    });
    const planeZMesh = new THREE.Mesh(planeZGeo, planeZMat);
    planeZMesh.name = 'plane_z';
    boxGroup.add(planeZMesh);
    planeZMeshRef.current = planeZMesh;

    // 9. 3D Holographic Intersection Probe Beacon
    const probeGroup = new THREE.Group();
    // Inner glowing sphere
    const beaconGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    probeGroup.add(beaconMesh);

    // Outer pulsing ring
    const ringGeo = new THREE.RingGeometry(0.24, 0.32, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotateX(Math.PI / 2);
    probeGroup.add(ringMesh);

    // 3 Axis Crosshair Laser Beams extending through the box
    const laserMatX = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.8 });
    const laserGeoX = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-BOX_W/2, 0, 0), new THREE.Vector3(BOX_W/2, 0, 0)]);
    const laserX = new THREE.Line(laserGeoX, laserMatX);
    probeGroup.add(laserX);

    const laserMatY = new THREE.LineBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.8 });
    const laserGeoY = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -BOX_H/2, 0), new THREE.Vector3(0, BOX_H/2, 0)]);
    const laserY = new THREE.Line(laserGeoY, laserMatY);
    probeGroup.add(laserY);

    const laserMatZ = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8 });
    const laserGeoZ = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -BOX_D/2), new THREE.Vector3(0, 0, BOX_D/2)]);
    const laserZ = new THREE.Line(laserGeoZ, laserMatZ);
    probeGroup.add(laserZ);

    boxGroup.add(probeGroup);
    probeBeaconRef.current = probeGroup;

    // 10. Animation & Render Loop
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const delta = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      // Pulse probe beacon ring
      if (probeBeaconRef.current) {
        const pulse = 1.0 + 0.25 * Math.sin(currentTime * 0.006);
        ringMesh.scale.set(pulse, pulse, pulse);
        ringMesh.rotation.z += delta * 1.5;
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 11. Mouse & Orbit Drag Controls
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current && boxGroupRef.current) {
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };

        boxGroupRef.current.rotation.y += deltaX * 0.006;
        boxGroupRef.current.rotation.x = Math.max(
          -1.2,
          Math.min(1.2, boxGroupRef.current.rotation.x + deltaY * 0.006)
        );
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const newDistance = cameraRef.current.position.length() + e.deltaY * 0.02;
      const clamped = Math.max(10.0, Math.min(38.0, newDistance));
      cameraRef.current.position.setLength(clamped);
    };

    // Click on slicing planes to reposition the crosshairs
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      if (!container || !cameraRef.current || !boxGroupRef.current) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const planes = [planeYMeshRef.current, planeXMeshRef.current, planeZMeshRef.current].filter(Boolean) as THREE.Mesh[];
      const intersects = raycaster.intersectObjects(planes, false);

      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        // Transform world point into local box coordinates
        const localPoint = boxGroupRef.current.worldToLocal(hitPoint.clone());
        const geo = threeDToGeo(localPoint.x, localPoint.y, localPoint.z);

        setCutLat(+geo.lat.toFixed(1));
        setCutLon(+geo.lon.toFixed(1));
        setCutDepth(+Math.round(geo.depth / 25) * 25);
      }
    };

    const onResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [isOpen]);

  // Update Plane Positions, Textures, and Probe Beacon when coordinates or variables change
  useEffect(() => {
    if (!isOpen) return;
    const b = selectedRegion.bounds;
    const pos = geoTo3D(cutLat, cutLon, cutDepth);

    // 1. Update Plane Y (Horizontal Depth Slice)
    if (planeYMeshRef.current) {
      planeYMeshRef.current.position.y = pos.y;
      planeYMeshRef.current.visible = visiblePlanes.y;

      const canvasY = generateSliceTexture(activeVariable, 'y', cutDepth, b, 64);
      const texY = new THREE.CanvasTexture(canvasY);
      texY.minFilter = THREE.LinearFilter;
      texY.magFilter = THREE.LinearFilter;
      (planeYMeshRef.current.material as THREE.MeshStandardMaterial).map = texY;
      (planeYMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }

    // 2. Update Plane X (Latitude Slice - varying along Z axis)
    if (planeXMeshRef.current) {
      planeXMeshRef.current.position.z = pos.z;
      planeXMeshRef.current.visible = visiblePlanes.x;

      const canvasX = generateSliceTexture(activeVariable, 'x', cutLat, b, 64);
      const texX = new THREE.CanvasTexture(canvasX);
      texX.minFilter = THREE.LinearFilter;
      texX.magFilter = THREE.LinearFilter;
      (planeXMeshRef.current.material as THREE.MeshStandardMaterial).map = texX;
      (planeXMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }

    // 3. Update Plane Z (Longitude Slice - varying along X axis)
    if (planeZMeshRef.current) {
      planeZMeshRef.current.position.x = pos.x;
      planeZMeshRef.current.visible = visiblePlanes.z;

      const canvasZ = generateSliceTexture(activeVariable, 'z', cutLon, b, 64);
      const texZ = new THREE.CanvasTexture(canvasZ);
      texZ.minFilter = THREE.LinearFilter;
      texZ.magFilter = THREE.LinearFilter;
      (planeZMeshRef.current.material as THREE.MeshStandardMaterial).map = texZ;
      (planeZMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }

    // 4. Update Probe Beacon Position
    if (probeBeaconRef.current) {
      probeBeaconRef.current.position.set(pos.x, pos.y, pos.z);
    }
  }, [isOpen, selectedRegion, activeVariable, cutLat, cutDepth, cutLon, visiblePlanes]);

  // Reset slices to region center
  const handleResetSlices = () => {
    const b = selectedRegion.bounds;
    setCutLat(+((b.latMin + b.latMax) / 2).toFixed(1));
    setCutDepth(100);
    setCutLon(+((b.lonMin + b.lonMax) / 2).toFixed(1));
    if (boxGroupRef.current) {
      boxGroupRef.current.rotation.set(0.3, -0.6, 0);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-[#020617]/95 backdrop-blur-2xl text-slate-100 select-none overflow-hidden"
      >
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-noise-overlay opacity-30 pointer-events-none" />

        {/* Top Mission Control Header */}
        <header className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-cyan-500/20 liquid-glass-base">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
              <Box className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-black font-header tracking-wider uppercase text-white flex items-center gap-2">
                  3D Orthogonal Volume Slicing Box
                  <span className="text-[9px] font-telemetry px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-semibold">
                    {selectedRegion.name}
                  </span>
                </h1>
              </div>
              <p className="text-[10px] font-telemetry text-slate-400">
                3D NetCDF Water Column Slicing & Hydrographic Telemetry
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetSlices}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950 border border-slate-700/80 hover:border-cyan-400/60 text-xs font-telemetry text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Slices</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-500/60 text-slate-400 hover:text-rose-300 transition-all cursor-pointer shadow-lg"
              title="Close Volume Explorer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Workspace Layout (3D Viewport + Side Control Panel) */}
        <div className="relative flex-1 flex overflow-hidden">
          
          {/* 3D WebGL Viewport */}
          <div className="relative flex-1 h-full cursor-grab active:cursor-grabbing">
            <div ref={mountRef} className="w-full h-full" />

            {/* Sci-Fi HUD Viewport Corner Accents */}
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-tr" />
            <div className="hud-corner hud-corner-bl" />
            <div className="hud-corner hud-corner-br" />

            {/* Floating 3D Navigation Guide HUD */}
            <div className="absolute bottom-6 left-6 pointer-events-none z-10">
              <div className="liquid-glass-base px-4 py-2 rounded-xl text-xs font-telemetry text-slate-300 flex items-center space-x-3 border border-cyan-500/30 shadow-2xl">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>DRAG: ROTATE 3D BOX</span>
                </div>
                <span className="text-slate-600">|</span>
                <span>SCROLL: ZOOM</span>
                <span className="text-slate-600">|</span>
                <span className="text-cyan-300 font-bold">CLICK PLANE: INSPECT PROBE</span>
              </div>
            </div>

            {/* Active Slice Badge Overlay (Top-Left of 3D Canvas) */}
            <div className="absolute top-4 left-6 pointer-events-none z-10 flex flex-col space-y-1.5 font-telemetry">
              <div className="liquid-glass-base px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs flex items-center space-x-2 text-white">
                <span className="text-base">{VOLUME_VARIABLE_META[activeVariable].icon}</span>
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                  {VOLUME_VARIABLE_META[activeVariable].label} Field
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 text-[10px]">
                  Range: {VOLUME_VARIABLE_META[activeVariable].range[0]} - {VOLUME_VARIABLE_META[activeVariable].range[1]} {VOLUME_VARIABLE_META[activeVariable].unit}
                </span>
              </div>
            </div>

          </div>

          {/* Right Side Mission Control Panel */}
          <aside className="relative z-10 p-4 border-l border-cyan-500/20 liquid-glass-base flex flex-col justify-start">
            <VolumeControlPanel
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              cutLat={cutLat}
              onCutLatChange={setCutLat}
              cutDepth={cutDepth}
              onCutDepthChange={setCutDepth}
              cutLon={cutLon}
              onCutLonChange={setCutLon}
              activeVariable={activeVariable}
              onSelectVariable={setActiveVariable}
              visiblePlanes={visiblePlanes}
              onTogglePlane={(p) => setVisiblePlanes(prev => ({ ...prev, [p]: !prev[p] }))}
              probeData={probeData}
              onResetSlices={handleResetSlices}
            />
          </aside>

        </div>

      </motion.div>
    </AnimatePresence>
  );
};
