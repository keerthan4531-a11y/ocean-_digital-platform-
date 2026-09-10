/**
 * AquaTwin 3D - GliderMissionGroup
 * Autonomous Underwater Gliders (INCOIS / NIOT / MoES)
 * Sawtooth undulating dive trajectories (0m to -1000m) with 3D torpedo hulls & pulsing beacons.
 */

import * as THREE from 'three';
import { GliderMission } from '../../../types/ocean';
import { latLonToVector3 } from '../OceanGlobe3D';

export interface InteractiveGliderEntry {
  obj: THREE.Object3D;
  hitObj: THREE.Object3D;
  data: GliderMission;
  type: 'glider';
}

export function createGliderMissionGroup(
  gliders: GliderMission[],
  selectedGliderId: string | null,
  globeRadius: number,
  verticalExaggeration: number = 1.0
): {
  group: THREE.Group;
  interactiveEntries: InteractiveGliderEntry[];
  gliderMeshes: THREE.Mesh[];
  updateTime: (timeSeconds: number) => void;
} {
  const group = new THREE.Group();
  group.name = 'sensor_gliders_group';

  const interactiveEntries: InteractiveGliderEntry[] = [];
  const gliderMeshes: THREE.Mesh[] = [];
  const animators: Array<{
    beaconRing: THREE.Mesh;
    beaconMat: THREE.MeshBasicMaterial;
    gliderBodyGroup: THREE.Group;
    phaseOffset: number;
  }> = [];

  gliders.forEach((glider, index) => {
    const isSelected = selectedGliderId === glider.id;
    const gliderRoot = new THREE.Group();
    gliderRoot.name = `sensor_glider_${glider.id}`;

    // 1. Calculate Cartesian Positions
    const surfaceRadius = globeRadius * 1.018;
    const currentDepth = Math.max(0, glider.current_depth_m || 0);
    const depthRadius = globeRadius * (1.018 - (currentDepth / 2000) * 0.035 * verticalExaggeration);

    const surfacePos = latLonToVector3(glider.lat, glider.lon, surfaceRadius);
    const subsurfacePos = latLonToVector3(glider.lat, glider.lon, depthRadius);

    // Normal vector pointing straight out from globe center
    const normal = surfacePos.clone().normalize();

    // 2. Surface Telemetry Marker: Compact Cyan 3D Balloon Pin (#06b6d4)
    const surfaceBeaconGroup = new THREE.Group();
    surfaceBeaconGroup.position.copy(surfacePos);
    surfaceBeaconGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    const pinMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0x38bdf8 : 0x06b6d4,
      emissive: isSelected ? 0x0284c7 : 0x0891b2,
      emissiveIntensity: isSelected ? 1.4 : 0.9,
      metalness: 0.35,
      roughness: 0.25
    });

    // Inverted needle stem
    const stemGeo = new THREE.ConeGeometry(0.08, 0.20, 16);
    stemGeo.rotateX(Math.PI);
    const stemMesh = new THREE.Mesh(stemGeo, pinMat);
    stemMesh.position.set(0, 0.10, 0);
    surfaceBeaconGroup.add(stemMesh);

    // Balloon Head Sphere
    const headGeo = new THREE.SphereGeometry(0.12, 20, 20);
    const headMesh = new THREE.Mesh(headGeo, pinMat);
    headMesh.position.set(0, 0.22, 0);
    surfaceBeaconGroup.add(headMesh);
    gliderMeshes.push(headMesh);

    // Inner Amber Core Dot
    const coreGeo = new THREE.SphereGeometry(0.048, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.22, 0);
    surfaceBeaconGroup.add(coreMesh);

    // Ground Contact Beacon Ring on water surface
    const ringGeo = new THREE.RingGeometry(0.04, 0.10, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isSelected ? 0x38bdf8 : 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const beaconRing = new THREE.Mesh(ringGeo, ringMat);
    surfaceBeaconGroup.add(beaconRing);

    gliderRoot.add(surfaceBeaconGroup);

    // 3. Subsurface Glider Hull (Torpedo Body + Delta Wings)
    const gliderBodyGroup = new THREE.Group();
    gliderBodyGroup.position.copy(subsurfacePos);

    // Orient body tangent to surface and aligned with heading
    const headingRad = ((glider.heading_deg || 0) * Math.PI) / 180;
    const upVec = normal.clone();
    
    // East tangent vector approx: cross(up, north)
    const worldNorth = new THREE.Vector3(0, 1, 0);
    const eastVec = new THREE.Vector3().crossVectors(worldNorth, upVec).normalize();
    if (eastVec.lengthSq() < 0.001) {
      eastVec.set(1, 0, 0);
    }
    const northTangent = new THREE.Vector3().crossVectors(upVec, eastVec).normalize();
    
    // Heading direction on local tangent plane (0° = North, 90° = East)
    const forwardVec = northTangent.clone().multiplyScalar(Math.cos(headingRad))
      .add(eastVec.clone().multiplyScalar(Math.sin(headingRad))).normalize();

    // Pitch tilt according to dive state
    let pitchAngle = 0;
    if (glider.dive_state === 'DIVING') pitchAngle = -0.28;
    else if (glider.dive_state === 'CLIMBING') pitchAngle = 0.28;

    const rotMatrix = new THREE.Matrix4();
    const rightVec = new THREE.Vector3().crossVectors(forwardVec, upVec).normalize();
    rotMatrix.makeBasis(rightVec, upVec, forwardVec);
    gliderBodyGroup.quaternion.setFromRotationMatrix(rotMatrix);

    // Materials
    const bodyColor = isSelected ? 0x00f2fe : 0xfacc15;
    const accentColor = isSelected ? 0x38bdf8 : 0x0284c7;
    const hullMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      metalness: 0.65,
      roughness: 0.25,
      emissive: isSelected ? 0x0284c7 : 0x854d0e,
      emissiveIntensity: 0.6
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.8,
      roughness: 0.3
    });

    // Fuselage cylinder
    const fuselageGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.38, 16);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    gliderBodyGroup.add(fuselage);
    gliderMeshes.push(fuselage);

    // Nose cone
    const noseGeo = new THREE.ConeGeometry(0.065, 0.16, 16);
    noseGeo.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, hullMat);
    nose.position.set(0, 0, 0.27);
    gliderBodyGroup.add(nose);
    gliderMeshes.push(nose);

    // Delta Swept Wings
    const wingGeo = new THREE.BoxGeometry(0.68, 0.012, 0.11);
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, 0.02);
    gliderBodyGroup.add(wings);
    gliderMeshes.push(wings);

    // Vertical stabilizer / rudder
    const rudderGeo = new THREE.BoxGeometry(0.012, 0.14, 0.10);
    const rudder = new THREE.Mesh(rudderGeo, wingMat);
    rudder.position.set(0, 0.07, -0.15);
    gliderBodyGroup.add(rudder);
    gliderMeshes.push(rudder);

    // Apply base pitch to glider body
    gliderBodyGroup.rotateX(pitchAngle);
    gliderRoot.add(gliderBodyGroup);

    // 4. Tether line between surface beacon and subsurface position
    if (currentDepth > 10) {
      const tetherGeo = new THREE.BufferGeometry().setFromPoints([surfacePos, subsurfacePos]);
      const tetherMat = new THREE.LineDashedMaterial({
        color: isSelected ? 0x00f2fe : 0xeab308,
        dashSize: 0.12,
        gapSize: 0.08,
        opacity: 0.55,
        transparent: true
      });
      const tether = new THREE.Line(tetherGeo, tetherMat);
      tether.computeLineDistances();
      gliderRoot.add(tether);
    }

    // 5. Sawtooth Dive Trajectory Tube
    if (glider.sawtooth_trajectory && glider.sawtooth_trajectory.length > 1) {
      const curvePoints: THREE.Vector3[] = [];
      glider.sawtooth_trajectory.forEach(pt => {
        const d = Math.abs(pt.depth || 0);
        const r = globeRadius * (1.018 - (d / 2000) * 0.035 * verticalExaggeration);
        curvePoints.push(latLonToVector3(pt.lat, pt.lon, r));
      });

      if (curvePoints.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.028, 6, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x00f2fe : 0xeab308,
          transparent: true,
          opacity: isSelected ? 0.85 : 0.65,
          depthWrite: false
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        gliderRoot.add(tubeMesh);
      }
    }

    // 6. Invisible Hit Hull for effortless raycasting click & hover
    const hitGeo = new THREE.SphereGeometry(0.70, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.copy(subsurfacePos);
    gliderRoot.add(hitMesh);

    group.add(gliderRoot);

    interactiveEntries.push({
      obj: gliderRoot,
      hitObj: hitMesh,
      data: glider,
      type: 'glider'
    });

    animators.push({
      beaconRing,
      beaconMat: ringMat,
      gliderBodyGroup,
      phaseOffset: index * 1.35
    });
  });

  // Time-based pulse & rocking animation loop
  const updateTime = (timeSeconds: number) => {
    animators.forEach(({ beaconRing, beaconMat, gliderBodyGroup, phaseOffset }) => {
      const t = timeSeconds * 2.5 + phaseOffset;
      const scale = 1.0 + 0.28 * Math.sin(t);
      beaconRing.scale.set(scale, scale, 1.0);
      beaconMat.opacity = 0.45 + 0.35 * Math.sin(t);

      // Gentle rocking
      gliderBodyGroup.rotation.z = Math.sin(timeSeconds * 1.8 + phaseOffset) * 0.06;
      gliderBodyGroup.rotation.y = Math.cos(timeSeconds * 1.4 + phaseOffset) * 0.04;
    });
  };

  return { group, interactiveEntries, gliderMeshes, updateTime };
}
