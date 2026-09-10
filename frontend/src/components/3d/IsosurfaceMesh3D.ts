/**
 * AquaTwin 3D - IsosurfaceMesh3D
 * Volumetric 3D Translucent Depth Curtain / Isotherm Blanket (D26 / D20) in the Indian Ocean.
 * Displays Tropical Cyclone Heat Potential (TCHP) risk zones with depth contours.
 */

import * as THREE from 'three';
import { IsosurfaceData, IsosurfacePoint } from '../../types/ocean';
import { latLonToVector3 } from './OceanGlobe3D';

export interface IsosurfaceMeshObject {
  group: THREE.Group;
  updateData: (data: IsosurfaceData, verticalExaggeration: number) => void;
  setVisible: (visible: boolean) => void;
  updateTime: (t: number) => void;
}

/**
 * Maps TCHP (Tropical Cyclone Heat Potential in kJ/cm²) or heat risk to THREE.Color
 * - Very High (>80 kJ/cm²): Red (#ef4444)
 * - High (50 - 80 kJ/cm²): Amber (#f59e0b)
 * - Moderate (25 - 50 kJ/cm²): Cyan (#06b6d4)
 * - Low (<25 kJ/cm²): Blue (#3b82f6)
 */
function getTCHPColor(tchp: number, risk?: string): THREE.Color {
  if (risk === 'VERY_HIGH' || tchp >= 80) {
    // Red (#ef4444)
    return new THREE.Color(0xef4444);
  }
  if (risk === 'HIGH' || tchp >= 50) {
    // Amber (#f59e0b)
    const factor = (tchp - 50) / 30;
    const cLow = new THREE.Color(0xf59e0b);
    const cHigh = new THREE.Color(0xef4444);
    return cLow.lerp(cHigh, Math.min(1, Math.max(0, factor)));
  }
  if (risk === 'MODERATE' || tchp >= 25) {
    // Cyan to Amber
    const factor = (tchp - 25) / 25;
    const cLow = new THREE.Color(0x06b6d4);
    const cHigh = new THREE.Color(0xf59e0b);
    return cLow.lerp(cHigh, Math.min(1, Math.max(0, factor)));
  }
  // Low: Blue to Cyan
  const factor = tchp / 25;
  const cLow = new THREE.Color(0x3b82f6);
  const cHigh = new THREE.Color(0x06b6d4);
  return cLow.lerp(cHigh, Math.min(1, Math.max(0, factor)));
}

/**
 * Builds synthetic regional Indian Ocean isotherm grid if no live points are provided
 */
export function generateDefaultIsothermGrid(targetTemp: number = 26): IsosurfaceData {
  const points: IsosurfacePoint[] = [];
  const lats: number[] = [];
  const lons: number[] = [];

  for (let lat = -8.0; lat <= 22.0; lat += 2.0) lats.push(lat);
  for (let lon = 50.0; lon <= 98.0; lon += 2.0) lons.push(lon);

  lats.forEach(lat => {
    lons.forEach(lon => {
      // Approximate physical bathymetry & thermocline characteristics
      // Bay of Bengal has thick warm layer (80-110m), Western Arabian has shallow upwelling (30-50m)
      let baseDepth = targetTemp === 26 ? 75 : 140;

      // Deeper warm pool in Eastern Indian Ocean & Bay of Bengal
      if (lon > 80 && lat > 5) baseDepth += 25;
      // Shallow upwelling off Oman / Somalia
      if (lon < 62 && lat > 10) baseDepth -= 35;
      // Equatorial thermocline ridge
      if (Math.abs(lat) < 4) baseDepth += 15;

      const isothermDepth = Math.max(15, Math.min(180, baseDepth + Math.sin(lat * 0.3) * 12 + Math.cos(lon * 0.2) * 10));
      const sst = targetTemp === 26 ? 29.5 + Math.sin(lat * 0.1) * 0.8 : 28.5;
      
      // TCHP approx formula = rho * Cp * integral(T - 26)dz ~= 0.418 * (SST - 26) * Depth
      const deltaT = Math.max(0.1, sst - targetTemp);
      const tchp = Number((0.418 * deltaT * isothermDepth).toFixed(1));

      let risk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' = 'LOW';
      if (tchp > 80) risk = 'VERY_HIGH';
      else if (tchp > 50) risk = 'HIGH';
      else if (tchp > 25) risk = 'MODERATE';

      points.push({
        lat,
        lon,
        target_temp_c: targetTemp,
        surface_temp_c: sst,
        isotherm_depth_m: isothermDepth,
        tchp_kj_cm2: tchp,
        cyclone_heat_risk: risk
      });
    });
  });

  return {
    timestamp: new Date().toISOString(),
    target_isotherm_c: targetTemp,
    basin: 'Indian Ocean Basin',
    total_nodes: points.length,
    mean_isotherm_depth_m: 78.4,
    max_tchp_kj_cm2: 94.2,
    points
  };
}

export function createIsosurfaceMesh(
  globeRadius: number,
  initialData: IsosurfaceData | null,
  targetTemp: number = 26,
  verticalExaggeration: number = 1.0
): IsosurfaceMeshObject {
  const group = new THREE.Group();
  group.name = 'isosurface_layer_group';

  // Mesh & Wireframe holders
  let surfaceMesh: THREE.Mesh | null = null;
  let wireframeLines: THREE.LineSegments | null = null;

  // Physical translucent material
  const surfaceMaterial = new THREE.MeshPhysicalMaterial({
    transparent: true,
    opacity: 0.55,
    roughness: 0.25,
    transmission: 0.35,
    side: THREE.DoubleSide,
    vertexColors: true,
    depthWrite: false,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2
  });

  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.40,
    depthWrite: false
  });

  // Rebuilds geometry from IsosurfaceData points
  const updateData = (data: IsosurfaceData | null, vertExaggeration: number = verticalExaggeration) => {
    // Remove previous meshes
    if (surfaceMesh) {
      group.remove(surfaceMesh);
      surfaceMesh.geometry.dispose();
      surfaceMesh = null;
    }
    if (wireframeLines) {
      group.remove(wireframeLines);
      wireframeLines.geometry.dispose();
      wireframeLines = null;
    }

    const isoData = (data && data.points && data.points.length > 0) ? data : generateDefaultIsothermGrid(targetTemp);
    const pts = isoData.points;

    // 1. Identify grid topology (unique sorted latitudes and longitudes)
    const uniqueLats = Array.from(new Set(pts.map(p => Number(p.lat.toFixed(2))))).sort((a, b) => b - a);
    const uniqueLons = Array.from(new Set(pts.map(p => Number(p.lon.toFixed(2))))).sort((a, b) => a - b);

    const latCount = uniqueLats.length;
    const lonCount = uniqueLons.length;

    // Index lookup map
    const ptMap = new Map<string, IsosurfacePoint>();
    pts.forEach(p => {
      const key = `${p.lat.toFixed(2)}_${p.lon.toFixed(2)}`;
      ptMap.set(key, p);
    });

    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const linePositions: number[] = [];

    // Map of (row, col) -> vertex index
    const vertexGrid: number[][] = Array.from({ length: latCount }, () => Array(lonCount).fill(-1));
    let vertexCounter = 0;

    for (let r = 0; r < latCount; r++) {
      const lat = uniqueLats[r];
      for (let c = 0; c < lonCount; c++) {
        const lon = uniqueLons[c];
        const key = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
        const pt = ptMap.get(key);

        if (pt) {
          const depth = Math.max(0, pt.isotherm_depth_m || 50);
          const radius = globeRadius * (1.0 - (depth / 2000) * 0.04 * vertExaggeration);
          const pos = latLonToVector3(lat, lon, radius);

          positions.push(pos.x, pos.y, pos.z);
          const col = getTCHPColor(pt.tchp_kj_cm2, pt.cyclone_heat_risk);
          colors.push(col.r, col.g, col.b);

          vertexGrid[r][c] = vertexCounter++;
        }
      }
    }

    // 2. Generate Triangles & Contour Segments
    for (let r = 0; r < latCount - 1; r++) {
      for (let c = 0; c < lonCount - 1; c++) {
        const iTopLeft = vertexGrid[r][c];
        const iTopRight = vertexGrid[r][c + 1];
        const iBotLeft = vertexGrid[r + 1][c];
        const iBotRight = vertexGrid[r + 1][c + 1];

        // Valid quad
        if (iTopLeft !== -1 && iTopRight !== -1 && iBotLeft !== -1 && iBotRight !== -1) {
          // Tri 1
          indices.push(iTopLeft, iBotLeft, iTopRight);
          // Tri 2
          indices.push(iTopRight, iBotLeft, iBotRight);

          // Grid wireframe contours
          const pTL = new THREE.Vector3(positions[iTopLeft * 3], positions[iTopLeft * 3 + 1], positions[iTopLeft * 3 + 2]);
          const pTR = new THREE.Vector3(positions[iTopRight * 3], positions[iTopRight * 3 + 1], positions[iTopRight * 3 + 2]);
          const pBL = new THREE.Vector3(positions[iBotLeft * 3], positions[iBotLeft * 3 + 1], positions[iBotLeft * 3 + 2]);

          // East-West line
          linePositions.push(pTL.x, pTL.y, pTL.z, pTR.x, pTR.y, pTR.z);
          // North-South line
          linePositions.push(pTL.x, pTL.y, pTL.z, pBL.x, pBL.y, pBL.z);
        }
      }
    }

    if (positions.length > 0 && indices.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      surfaceMesh = new THREE.Mesh(geo, surfaceMaterial);
      group.add(surfaceMesh);

      if (linePositions.length > 0) {
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        wireframeLines = new THREE.LineSegments(lineGeo, wireframeMaterial);
        group.add(wireframeLines);
      }
    }
  };

  // Initial build
  updateData(initialData, verticalExaggeration);

  const setVisible = (visible: boolean) => {
    group.visible = visible;
  };

  const updateTime = (t: number) => {
    if (!group.visible || !surfaceMesh) return;
    // Subtle physical shimmer
    const shimmer = 0.52 + 0.05 * Math.sin(t * 1.5);
    surfaceMaterial.opacity = shimmer;
  };

  return {
    group,
    updateData,
    setVisible,
    updateTime
  };
}
