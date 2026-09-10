/**
 * AquaTwin 3D - CurrentStreamlines
 * Hydrodynamic Ocean Current Streamlines & Flow Ribbons (Windy.com / NASA Eyes style)
 * Replaces noisy dot clouds with elegant, continuous, animated flow streamlines.
 */

import * as THREE from 'three';
import { latLonToVector3 } from '../OceanGlobe3D';
import { isPointInOcean } from '../globe/OceanMask';

export interface StreamlineGroupObject {
  group: THREE.Group;
  updateTime: (timeSeconds: number) => void;
  setVisible: (visible: boolean) => void;
}

// Major realistic circulation trajectories in the Northern Indian Ocean
const STREAMLINE_DEFINITIONS: { name: string; points: [number, number][] }[] = [
  // 1. East India Coastal Current (EICC) - Up the east coast of India
  {
    name: 'EICC_Main',
    points: [
      [6.5, 82.0], [8.0, 81.5], [10.5, 80.8], [12.5, 80.5],
      [15.0, 80.8], [17.5, 83.5], [19.5, 86.0], [20.8, 88.5], [21.5, 91.0]
    ]
  },
  {
    name: 'EICC_Offshore',
    points: [
      [5.5, 83.5], [7.5, 83.0], [10.0, 82.2], [13.0, 81.8],
      [16.0, 82.5], [18.0, 85.0], [20.0, 87.5], [21.0, 90.0]
    ]
  },
  // 2. West India Coastal Current (WICC) - Along Kerala, Goa, Mumbai, Gujarat
  {
    name: 'WICC_South',
    points: [
      [7.5, 76.5], [9.5, 75.8], [12.0, 74.5], [15.0, 73.0],
      [18.0, 72.0], [20.5, 71.0], [21.8, 69.5], [22.8, 68.0]
    ]
  },
  {
    name: 'WICC_Offshore',
    points: [
      [6.5, 75.0], [8.5, 74.0], [11.5, 72.8], [14.5, 71.5],
      [17.5, 70.2], [20.0, 68.8], [21.5, 67.2]
    ]
  },
  // 3. Southwest Monsoon Current (SMC) - Fast Equatorial Jet flowing eastward south of Sri Lanka
  {
    name: 'Equatorial_Jet_1',
    points: [
      [1.0, 56.0], [2.0, 62.0], [2.5, 70.0], [3.0, 78.0],
      [4.0, 84.0], [4.5, 90.0], [5.0, 96.0]
    ]
  },
  {
    name: 'Equatorial_Jet_2',
    points: [
      [-2.0, 58.0], [-1.0, 65.0], [0.0, 74.0], [0.5, 82.0],
      [1.0, 88.0], [1.5, 95.0]
    ]
  },
  {
    name: 'Sri_Lanka_Dome',
    points: [
      [4.0, 78.0], [5.0, 81.0], [6.0, 84.0], [7.5, 86.5],
      [9.0, 88.0], [10.5, 87.0], [11.0, 84.5], [9.5, 83.0]
    ]
  },
  // 4. Bay of Bengal Central Gyre (Large clockwise circular flow)
  {
    name: 'BoB_Gyre_North',
    points: [
      [18.0, 86.0], [18.5, 89.0], [17.5, 92.0], [15.0, 93.0],
      [12.5, 91.5], [11.5, 88.0], [13.0, 85.0], [16.0, 84.5], [18.0, 86.0]
    ]
  },
  {
    name: 'BoB_Gyre_Inner',
    points: [
      [16.5, 87.0], [17.0, 89.5], [16.0, 91.5], [14.0, 91.8],
      [12.8, 89.5], [13.2, 87.2], [15.0, 86.5], [16.5, 87.0]
    ]
  },
  {
    name: 'Andaman_Sea_Inflow',
    points: [
      [6.0, 94.0], [8.0, 95.5], [10.5, 96.5], [12.5, 97.0],
      [14.5, 96.5], [15.5, 95.0]
    ]
  },
  // 5. Arabian Sea Great Whirl & Somali Jet
  {
    name: 'Somali_Jet_1',
    points: [
      [3.0, 48.0], [6.0, 51.0], [9.5, 53.0], [13.0, 55.5],
      [16.0, 58.5], [18.0, 62.0], [19.0, 66.0], [18.5, 70.0]
    ]
  },
  {
    name: 'Somali_Jet_2',
    points: [
      [1.0, 47.0], [4.5, 50.0], [8.0, 52.0], [11.5, 54.0],
      [14.5, 57.0], [16.5, 60.5], [17.0, 64.5]
    ]
  },
  {
    name: 'Arabian_Sea_Whirl',
    points: [
      [12.0, 60.0], [14.5, 63.0], [15.5, 66.5], [14.0, 69.0],
      [11.5, 68.0], [9.5, 64.5], [10.0, 61.5], [12.0, 60.0]
    ]
  },
  {
    name: 'Oman_Upwelling_Stream',
    points: [
      [16.0, 54.0], [18.5, 57.0], [21.0, 60.0], [22.5, 62.5],
      [23.5, 65.0], [22.8, 67.5]
    ]
  },
  // 6. South Equatorial Current (Westward circulation)
  {
    name: 'South_Equatorial_1',
    points: [
      [-6.0, 96.0], [-6.5, 88.0], [-7.0, 80.0], [-7.5, 72.0],
      [-8.0, 64.0], [-8.5, 56.0]
    ]
  },
  {
    name: 'South_Equatorial_2',
    points: [
      [-10.0, 94.0], [-10.5, 86.0], [-11.0, 78.0], [-11.5, 70.0],
      [-12.0, 62.0], [-12.5, 54.0]
    ]
  }
];

export interface StreamlineGroupObject {
  group: THREE.Group;
  updateTime: (timeSeconds: number) => void;
  setVisible: (visible: boolean) => void;
  setDepthAndExaggeration?: (depthM: number, verticalExaggeration: number) => void;
}

export function createCurrentStreamlines(
  globeRadius: number,
  depthM: number = 0,
  verticalExaggeration: number = 1.0
): StreamlineGroupObject {
  const group = new THREE.Group();
  group.name = `ocean_current_streamlines_${depthM}m`;

  const animatedMaterials: THREE.LineDashedMaterial[] = [];
  const streakMeshes: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; speed: number; offset: number }[] = [];

  // Compute depth-adjusted altitude on globe
  const depthDrop = (depthM / 2000) * 0.04 * verticalExaggeration;
  const lineAltitude = globeRadius * (1.014 - depthDrop);

  // Depth-specific visual theme & speed decay
  const isSurface = depthM === 0;
  const is100m = depthM > 0 && depthM <= 150;
  const color1 = isSurface ? 0x00f2fe : (is100m ? 0x3b82f6 : 0x818cf8);
  const color2 = isSurface ? 0x06b6d4 : (is100m ? 0x60a5fa : 0xa855f7);
  const arrowColor = isSurface ? 0x38bdf8 : (is100m ? 0x93c5fd : 0xc084fc);
  const speedScale = isSurface ? 1.0 : (is100m ? 0.7 : 0.4);

  // Use subset of streamlines for deeper ocean layers
  const activeDefs = isSurface
    ? STREAMLINE_DEFINITIONS
    : (is100m ? STREAMLINE_DEFINITIONS.slice(0, 10) : STREAMLINE_DEFINITIONS.slice(0, 6));

  activeDefs.forEach((def, defIdx) => {
    // Filter points to guarantee ocean-only coordinates
    const validPoints = def.points.filter(([lat, lon]) => isPointInOcean(lat, lon));
    if (validPoints.length < 2) return;

    const v3Points = validPoints.map(([lat, lon]) => latLonToVector3(lat, lon, lineAltitude));
    const curve = new THREE.CatmullRomCurve3(v3Points, false, 'catmullrom', 0.2);

    // 1. Base Streamline Guide Track (subtle cyan/teal glow)
    const points50 = curve.getPoints(64);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points50);

    const lineMat = new THREE.LineDashedMaterial({
      color: defIdx % 2 === 0 ? color1 : color2,
      dashSize: 0.8,
      gapSize: 0.6,
      transparent: true,
      opacity: isSurface ? 0.72 : 0.85,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });
    animatedMaterials.push(lineMat);

    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();
    group.add(line);

    // 2. Animated Flow Arrow / Flow Streak traveling along the curve
    const streakGeo = new THREE.ConeGeometry(0.12, 0.45, 8);
    streakGeo.rotateX(Math.PI / 2); // Point along forward tangent
    const streakMat = new THREE.MeshBasicMaterial({
      color: arrowColor,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const streakMesh = new THREE.Mesh(streakGeo, streakMat);
    group.add(streakMesh);

    streakMeshes.push({
      mesh: streakMesh,
      curve,
      speed: (0.08 + (defIdx % 3) * 0.02) * speedScale,
      offset: (defIdx * 0.17) % 1.0
    });
  });

  return {
    group,
    updateTime: (timeSeconds: number) => {
      // Animate the dash offset of streamlines
      animatedMaterials.forEach((mat, idx) => {
        mat.dashSize = 0.6 + 0.2 * Math.sin(timeSeconds * 2.0 + idx);
      });

      // Advance moving current flow arrows along streamline curves
      streakMeshes.forEach(item => {
        const u = (item.offset + timeSeconds * item.speed) % 1.0;
        const pos = item.curve.getPointAt(u);
        const tangent = item.curve.getTangentAt(u);

        item.mesh.position.copy(pos);
        item.mesh.lookAt(pos.clone().add(tangent));
      });
    },
    setVisible: (visible: boolean) => {
      group.visible = visible;
    }
  };
}

