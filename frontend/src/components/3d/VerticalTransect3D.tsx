/**
 * AquaTwin 3D - VerticalTransect3D
 * True 3D Interactive Volumetric Ocean Transect Slicer.
 * Features:
 * 1. Thin vertical ocean water column slice (SLAB_D = 0.08) with realistic water optics.
 * 2. 3D-to-2D screen-space projected depth callouts with glowing connector lines anchored
 *    to the exact 3D curtain edge vertices in real time (60 FPS during orbit drag).
 * 3. Volumetric thermal stratification, 3D isotherms, and interactive raycast probe.
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Layers, Compass, ArrowRight, X, Info, RotateCcw, Move3d } from 'lucide-react';

interface VerticalTransect3DProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransectOption {
  id: string;
  name: string;
  distanceKm: number;
  start: { name: string; lat: number; lon: number };
  end: { name: string; lat: number; lon: number };
  description: string;
}

interface DepthAnchorDef {
  id: string;
  depthM: number;
  localY: number;
  title: string;
  badgeClass: string;
  lineColor: string;
}

const SLAB_W = 7.6;
const SLAB_H = 3.8;
const SLAB_D = 0.08; // 88% thinner - thin vertical ocean cross-section!

const DEPTH_ANCHORS: DepthAnchorDef[] = [
  {
    id: 'surface',
    depthM: 0,
    localY: SLAB_H / 2, // +1.9
    title: '0m Sea Surface (28°C - 30°C)',
    badgeClass: 'bg-red-500/25 text-red-300 border-red-500/50',
    lineColor: '#ef4444'
  },
  {
    id: 'thermo',
    depthM: 150,
    localY: SLAB_H / 2 - (150 / 2000) * SLAB_H, // +1.615
    title: '⚡ -150m THERMOCLINE BARRIER',
    badgeClass: 'bg-yellow-500/25 text-yellow-300 border-yellow-500/50',
    lineColor: '#eab308'
  },
  {
    id: 'intermediate',
    depthM: 500,
    localY: SLAB_H / 2 - (500 / 2000) * SLAB_H, // +0.95
    title: '-500m Intermediate Water (10°C)',
    badgeClass: 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50',
    lineColor: '#06b6d4'
  },
  {
    id: 'abyssal',
    depthM: 2000,
    localY: -SLAB_H / 2, // -1.9
    title: '-2000m Abyssal Plain (< 3.5°C)',
    badgeClass: 'bg-blue-500/25 text-blue-300 border-blue-500/50',
    lineColor: '#3b82f6'
  }
];

const PRESET_TRANSECTS: TransectOption[] = [
  {
    id: 'chennai_portblair',
    name: 'Bay of Bengal Trans-Basin (Chennai to Port Blair)',
    distanceKm: 1380,
    start: { name: 'Chennai Coast', lat: 13.08, lon: 80.27 },
    end: { name: 'Port Blair (Andaman)', lat: 11.62, lon: 92.72 },
    description: 'Captures the low-salinity river lens, East India Coastal Current (EICC), and strong seasonal thermocline.'
  },
  {
    id: 'mumbai_oman',
    name: 'Arabian Sea High-Salinity Section (Mumbai to Central Basin)',
    distanceKm: 1150,
    start: { name: 'Mumbai Coast', lat: 18.92, lon: 72.83 },
    end: { name: 'Central Arabian Sea', lat: 15.00, lon: 65.00 },
    description: 'Displays intense surface evaporation, high salinity Arabian Sea Water (ASW), and summer upwelling.'
  },
  {
    id: 'equator_cross',
    name: 'Equatorial Indian Ocean Jet (0°N Section)',
    distanceKm: 3300,
    start: { name: 'Western Equatorial IO', lat: 0.0, lon: 60.0 },
    end: { name: 'Eastern Equatorial IO', lat: 0.0, lon: 90.0 },
    description: 'Visualizes the Wyrtki Jets, deep equatorial thermocline slope, and Indian Ocean Dipole (IOD) signal.'
  }
];

// Generates high-resolution thermal stratification texture with isotherms
function createTransectCanvasTexture(transectId: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const isBoB = transectId === 'chennai_portblair';

  // 1. Thermal Stratification Color Gradient (0m to -2000m)
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  // 0m (Surface): 28°C - 30°C
  grad.addColorStop(0.0, '#ef4444');
  grad.addColorStop(0.035, '#f97316');
  // -50m to -200m (Thermocline Barrier: rapid thermal drop to 14°C)
  grad.addColorStop(0.08, '#eab308');
  grad.addColorStop(0.14, '#22c55e');
  grad.addColorStop(0.24, '#06b6d4');
  // -200m to -1000m (Intermediate water: 14°C -> 6°C)
  grad.addColorStop(0.48, '#1d4ed8');
  // -1000m to -2000m (Abyssal Deep Water: < 3.5°C)
  grad.addColorStop(1.0, '#030a1c');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. High-salinity / river plume contour perturbation
  if (isBoB) {
    // Low salinity Ganga/Brahmaputra surface river lens near Andaman
    const lensGrad = ctx.createRadialGradient(850, 20, 10, 850, 20, 220);
    lensGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    lensGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lensGrad;
    ctx.fillRect(0, 0, 1024, 512);
  } else {
    // Arabian Sea high evaporation thermal core
    const evpGrad = ctx.createRadialGradient(250, 30, 10, 250, 30, 260);
    evpGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
    evpGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = evpGrad;
    ctx.fillRect(0, 0, 1024, 512);
  }

  // 3. 3D Isotherm Boundary Lines
  ctx.lineWidth = 2.5;

  // -50m Mixed Layer Depth (MLD) Isotherm
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.bezierCurveTo(280, 26, 680, 16, 1024, 22);
  ctx.stroke();

  // -150m Thermocline Core Isotherm (20°C)
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.95)';
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(0, 52);
  ctx.bezierCurveTo(300, 68, 700, 48, 1024, 58);
  ctx.stroke();

  // -500m Intermediate Isotherm (10°C)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)';
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.bezierCurveTo(350, 165, 750, 142, 1024, 154);
  ctx.stroke();

  // -1000m Deep Isotherm
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
  ctx.beginPath();
  ctx.moveTo(0, 275);
  ctx.bezierCurveTo(400, 290, 800, 265, 1024, 280);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const VerticalTransect3D: React.FC<VerticalTransect3DProps> = ({ isOpen, onClose }) => {
  const [selectedTransect, setSelectedTransect] = useState<TransectOption>(PRESET_TRANSECTS[0]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    depth: number;
    distancePct: number;
    temp: number;
    salinity: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const curtainMeshRef = useRef<THREE.Mesh | null>(null);
  const probeMarkerRef = useRef<THREE.Group | null>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameRef = useRef<number>(0);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.16, y: -0.28 }); // Default isometric perspective tilt

  // Subsurface calculation
  const getSubsurfaceTemp = (distancePct: number, depth: number) => {
    const isBayOfBengal = selectedTransect.id === 'chennai_portblair';
    const surfaceBase = isBayOfBengal ? 29.5 : 28.5;
    const distanceWave = Math.sin((distancePct / 100) * Math.PI) * 0.8;
    
    if (depth <= 50) return +(surfaceBase + distanceWave - (depth / 50) * 0.7).toFixed(1);
    if (depth <= 200) {
      const factor = (depth - 50) / 150;
      return +(surfaceBase - 0.7 - factor * 13.8 + distanceWave * 0.4).toFixed(1);
    }
    if (depth <= 1000) {
      const factor = (depth - 200) / 800;
      return +(14.5 - factor * 8.5).toFixed(1);
    }
    const factor = (depth - 1000) / 1000;
    return +(6.0 - factor * 3.2).toFixed(1);
  };

  const getSubsurfaceSalinity = (distancePct: number, depth: number) => {
    const isBayOfBengal = selectedTransect.id === 'chennai_portblair';
    const surfBase = isBayOfBengal ? 33.2 : 36.2;
    if (depth <= 100) return +(surfBase + (depth / 100) * 0.9).toFixed(1);
    return +(surfBase + 1.2 - (depth / 2000) * 0.5).toFixed(1);
  };

  const getTempColor = (temp: number) => {
    if (temp >= 28) return '#ef4444';
    if (temp >= 24) return '#f97316';
    if (temp >= 20) return '#eab308';
    if (temp >= 15) return '#22c55e';
    if (temp >= 10) return '#06b6d4';
    if (temp >= 5)  return '#3b82f6';
    return '#1e1b4b';
  };

  const handleResetCamera = () => {
    rotationRef.current = { x: 0.16, y: -0.28 };
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0.7, 8.0);
    }
  };

  // Mount Three.js 3D Volumetric Scene
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 920;
    const height = container.clientHeight || 400;

    // 1. Scene & Perspective Camera with perspective tilt
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.7, 8.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(6, 8, 8);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f2fe, 0.85);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    // Root Group for smooth orbit rotation
    const rootGroup = new THREE.Group();
    rootGroup.rotation.x = rotationRef.current.x;
    rootGroup.rotation.y = rotationRef.current.y;
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // 4. Thin Physical Volumetric Ocean Slice (SLAB_D = 0.08 - 88% thinner, authentic ocean water cross-section)
    const slabTexture = createTransectCanvasTexture(selectedTransect.id);

    // Front & Back face: vivid thermal stratification
    const frontBackMat = new THREE.MeshStandardMaterial({
      map: slabTexture,
      roughness: 0.15,
      metalness: 0.06,
      side: THREE.DoubleSide
    });

    // Subtle translucent cyan edge highlights on the thin sides
    const sidesMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.45
    });

    // Top face: thin sea-surface cap
    const topCapMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00c3e3,
      emissiveIntensity: 0.6,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });

    // Bottom face: dark bathymetric seafloor slab
    const bottomFloorMat = new THREE.MeshStandardMaterial({
      color: 0x020817,
      roughness: 0.9,
      metalness: 0.1
    });

    const materials = [sidesMat, sidesMat, topCapMat, bottomFloorMat, frontBackMat, frontBackMat];
    const slabGeo = new THREE.BoxGeometry(SLAB_W, SLAB_H, SLAB_D, 16, 16, 1);
    const slabMesh = new THREE.Mesh(slabGeo, materials);
    slabMesh.name = 'transect_slab_mesh';
    rootGroup.add(slabMesh);
    curtainMeshRef.current = slabMesh;

    // 5. Lightweight, sleek 3D Wireframe Boundary Cage
    const wireGeo = new THREE.WireframeGeometry(slabGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.14
    });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    rootGroup.add(wireMesh);

    // 6. Interactive 3D Raycast Probe Marker
    const probeGroup = new THREE.Group();
    probeGroup.visible = false;
    const probeRingGeo = new THREE.RingGeometry(0.12, 0.18, 24);
    const probeRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const probeRing = new THREE.Mesh(probeRingGeo, probeRingMat);
    probeGroup.add(probeRing);

    const probeLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0.25)
    ]);
    const probeLine = new THREE.Line(probeLineGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
    probeGroup.add(probeLine);

    rootGroup.add(probeGroup);
    probeMarkerRef.current = probeGroup;

    // 7. Mouse Orbit Interaction
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const raycaster = new THREE.Raycaster();
    const mouseNorm = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - prevMouseRef.current.x;
        const deltaY = e.clientY - prevMouseRef.current.y;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };

        rotationRef.current.y += deltaX * 0.008;
        rotationRef.current.x = Math.max(-0.55, Math.min(0.55, rotationRef.current.x + deltaY * 0.008));
        return;
      }

      // 3D Raycast Probe
      const rect = container.getBoundingClientRect();
      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNorm, camera);
      const intersects = raycaster.intersectObject(slabMesh);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const local = hit.point.clone();
        slabMesh.worldToLocal(local);

        // Depth: top is y = +1.9 (0m) to bottom y = -1.9 (-2000m)
        const depthPct = Math.max(0, Math.min(1, (SLAB_H / 2 - local.y) / SLAB_H));
        const depthM = Math.round(depthPct * 2000);

        // Distance: left x = -3.8 (0%) to right x = +3.8 (100%)
        const distPct = Math.max(0, Math.min(100, Math.round(((local.x + SLAB_W / 2) / SLAB_W) * 100)));

        const temp = getSubsurfaceTemp(distPct, depthM);
        const sal = getSubsurfaceSalinity(distPct, depthM);

        if (probeMarkerRef.current) {
          probeMarkerRef.current.position.copy(hit.point).add(new THREE.Vector3(0, 0, 0.04));
          probeMarkerRef.current.visible = true;
        }

        setHoveredPoint({
          depth: depthM,
          distancePct: distPct,
          temp,
          salinity: sal,
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top
        });
      } else {
        if (probeMarkerRef.current) probeMarkerRef.current.visible = false;
        setHoveredPoint(null);
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(5.0, Math.min(13.0, camera.position.z + e.deltaY * 0.008));
    };

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 920;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    // 8. 60 FPS Render & 3D Projection Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const now = performance.now();

      if (rootGroupRef.current) {
        rootGroupRef.current.rotation.y = rotationRef.current.y;
        rootGroupRef.current.rotation.x = rotationRef.current.x;
      }

      if (probeMarkerRef.current && probeMarkerRef.current.visible) {
        const pulse = 1.0 + 0.15 * Math.sin(now * 0.008);
        probeMarkerRef.current.scale.set(pulse, pulse, pulse);
      }

      // 3D-TO-2D REAL-TIME SCREEN PROJECTION FOR DEPTH ANCHOR LABELS (60 FPS)
      if (curtainMeshRef.current && cameraRef.current) {
        const cW = container.clientWidth || 920;
        const cH = container.clientHeight || 400;

        DEPTH_ANCHORS.forEach((anchor, idx) => {
          const el = labelRefs.current[idx];
          if (!el) return;

          // Compute 3D world position at the left edge of the curtain (x = -SLAB_W / 2)
          const localPt = new THREE.Vector3(-SLAB_W / 2, anchor.localY, 0);
          const worldPt = localPt.clone().applyMatrix4(curtainMeshRef.current!.matrixWorld);
          worldPt.project(cameraRef.current!);

          // If behind camera frustum, hide
          if (worldPt.z > 1.0) {
            el.style.opacity = '0';
            return;
          }

          // 2D screen coordinate in pixels
          const screenX = ((worldPt.x + 1) / 2) * cW;
          const screenY = ((-worldPt.y + 1) / 2) * cH;

          // Align connector line endpoint precisely to (screenX, screenY) with viewport clamping
          const elWidth = 240;
          const clampedX = Math.max(12, screenX - elWidth);
          const clampedY = Math.max(16, Math.min(cH - 36, screenY - 12));
          el.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0px)`;
          el.style.opacity = '1';
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [isOpen, selectedTransect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="liquid-glass-base liquid-glass-reflection w-full max-w-5xl rounded-3xl border border-cyan-500/40 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[92vh] bg-[#071326]/90">
        
        {/* Top specular highlight rim */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,242,254,0.4)]">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2 font-telemetry">
                3D Vertical Water Column Transect Slicer
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-telemetry font-bold">
                  TRUE 3D WEBGL ENGINE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-telemetry">
                Volumetric 3D ocean cross-section (0m to -2,000m) with orbiting perspective & real thermocline stratification
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetCamera}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-telemetry flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
              title="Reset 3D Camera View"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset 3D View</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transect Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {PRESET_TRANSECTS.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTransect(t)}
              className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                selectedTransect.id === t.id
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_16px_rgba(0,242,254,0.3)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-white mb-1 flex items-center justify-between font-telemetry">
                <span>{t.name.split('(')[0]}</span>
                <Compass className="w-4 h-4 text-cyan-400 opacity-90" />
              </div>
              <div className="text-[11px] text-cyan-300/90 font-telemetry flex items-center gap-1.5 mb-1">
                <span>{t.start.name}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>{t.end.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                {t.description}
              </p>
            </button>
          ))}
        </div>

        {/* 3D WebGL Transect Viewport Container */}
        <div className="relative flex-1 bg-slate-950/90 rounded-2xl border border-cyan-500/30 overflow-hidden flex flex-col shadow-inner">
          
          {/* Top Landmarks Banner */}
          <div className="flex justify-between items-center text-xs font-telemetry text-cyan-400 bg-slate-900/90 px-4 py-2 border-b border-slate-800 z-10">
            <span className="flex items-center gap-1.5 font-bold">
              📍 START: {selectedTransect.start.name} ({selectedTransect.start.lat}°N, {selectedTransect.start.lon}°E)
            </span>
            <span className="text-slate-400 font-telemetry">
              TRANSECT DISTANCE: ~{selectedTransect.distanceKm} KM
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              🏁 END: {selectedTransect.end.name} ({selectedTransect.end.lat}°N, {selectedTransect.end.lon}°E)
            </span>
          </div>

          {/* Actual 3D Three.js WebGL Canvas Mounting Point with explicit height */}
          <div className="relative w-full h-[400px] cursor-grab active:cursor-grabbing overflow-hidden">
            <div ref={containerRef} className="w-full h-full" style={{ width: '100%', height: '400px' }} />

            {/* 3D Navigation Controls Badge (HUD) */}
            <div className="absolute top-3 left-3 pointer-events-none z-20">
              <div className="liquid-glass-base px-3 py-1.5 rounded-xl text-[10px] font-telemetry text-slate-300 flex items-center space-x-2 border border-cyan-500/30 shadow-lg">
                <Move3d className="w-3.5 h-3.5 text-cyan-400" />
                <span>DRAG: ORBIT 3D CURTAIN</span>
                <span className="text-slate-500">|</span>
                <span>SCROLL: ZOOM</span>
              </div>
            </div>

            {/* 3D-Anchored Screen-Projected Depth Labels with glowing connector lines */}
            {DEPTH_ANCHORS.map((anchor, idx) => (
              <div
                key={anchor.id}
                ref={el => { labelRefs.current[idx] = el; }}
                className="absolute top-0 left-0 pointer-events-none z-20 flex items-center justify-end w-[240px] transition-opacity duration-100 will-change-transform"
                style={{ opacity: 0 }}
              >
                {/* Callout badge on the left */}
                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-telemetry font-bold border shadow-lg backdrop-blur-md whitespace-nowrap ${anchor.badgeClass}`}>
                  {anchor.title}
                </div>
                {/* Thin glowing connector line */}
                <div
                  className="h-[1.5px] flex-1 mx-1.5"
                  style={{
                    background: `linear-gradient(to right, ${anchor.lineColor}, #00f2fe)`
                  }}
                />
                {/* Anchor target dot touching the exact 3D curtain vertex */}
                <div
                  className="w-2 h-2 rounded-full border border-white flex-shrink-0"
                  style={{
                    backgroundColor: anchor.lineColor,
                    boxShadow: `0 0 8px ${anchor.lineColor}`
                  }}
                />
              </div>
            ))}

            {/* Floating 3D Raycast Tooltip Badge */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none z-30 liquid-glass-base px-3 py-2 rounded-xl border border-cyan-400 shadow-2xl font-telemetry text-xs text-white"
                style={{
                  left: `${Math.min(window.innerWidth - 240, hoveredPoint.screenX + 15)}px`,
                  top: `${Math.min(320, hoveredPoint.screenY - 15)}px`
                }}
              >
                <div className="font-bold text-cyan-300 border-b border-cyan-900 pb-1 mb-1 flex items-center justify-between gap-3">
                  <span>DEPTH: -{hoveredPoint.depth} METERS</span>
                  <span className="text-[10px] text-slate-400">{hoveredPoint.distancePct}% across</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Temperature:</span>
                  <span className="font-bold" style={{ color: getTempColor(hoveredPoint.temp) }}>
                    {hoveredPoint.temp}°C
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-slate-400">Salinity:</span>
                  <span className="font-bold text-amber-300">{hoveredPoint.salinity} PSU</span>
                </div>
              </div>
            )}
          </div>

          {/* Scientific Colormap Legend */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 text-xs z-10">
            <div className="flex items-center space-x-3">
              <span className="text-slate-400 font-telemetry text-[11px]">WATER TEMPERATURE:</span>
              <div className="w-48 h-2.5 rounded-full gradient-thermal border border-slate-700"></div>
              <div className="flex justify-between w-48 text-[10px] font-telemetry text-slate-400">
                <span>2°C</span>
                <span>12°C</span>
                <span>20°C</span>
                <span>30°C</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-telemetry">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Hover anywhere over 3D water block to inspect subsurface values</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
