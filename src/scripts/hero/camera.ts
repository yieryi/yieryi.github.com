import { PerspectiveCamera, Vector3 } from 'three';
import type { HeroQuality } from './quality';
import { terrainHeight, valleyCenter } from './terrain';

const UP = new Vector3(0, 1, 0);
const DURATION = 15;
/** Minimum distance the camera keeps above the terrain surface. */
const CLEARANCE = 1.8;

export function createCameraController(camera: PerspectiveCamera, quality: HeroQuality) {
  const cameraZ = quality.isMobile ? 42 : 40;
  const base = new Vector3(
    valleyCenter(cameraZ) + (quality.isMobile ? 1.0 : 0.8),
    quality.isMobile ? 18.0 : 17.0,
    cameraZ,
  );
  const focusZ = quality.isMobile ? -12 : -14;
  const focus = new Vector3(
    valleyCenter(focusZ) - (quality.isMobile ? 3.6 : 5.0),
    quality.isMobile ? -0.4 : -1.0,
    focusZ,
  );
  const forward = focus.clone().sub(base).normalize();
  const right = new Vector3().crossVectors(forward, UP).normalize();
  const amplitudeX = quality.isMobile ? 1.6 : 3.4;
  const amplitudeZ = quality.isMobile ? 1.9 : 3.8;

  camera.position.copy(base);
  camera.lookAt(focus);

  const position = new Vector3();

  return {
    update: (elapsed: number, reducedMotion: boolean) => {
      const t = reducedMotion ? 0.18 : (elapsed / DURATION) % 1;
      const r = amplitudeX * Math.sin(Math.PI * 2 * t);
      const f = (amplitudeZ * (1 - Math.cos(Math.PI * 2 * t))) / 2;

      position.copy(base).addScaledVector(right, r).addScaledVector(forward, f);

      // Safety rail: never let the camera sink into a ridge, which would
      // expose the inside of the terrain mesh.
      const ground = terrainHeight(position.x, position.z) + CLEARANCE;
      if (position.y < ground) position.y = ground;

      camera.position.copy(position);
      camera.lookAt(focus);
    },
  };
}