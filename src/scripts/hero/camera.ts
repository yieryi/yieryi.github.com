import { PerspectiveCamera, Vector3 } from 'three';
import type { HeroQuality } from './quality';

const UP = new Vector3(0, 1, 0);
const DURATION = 22;

export function createCameraController(camera: PerspectiveCamera, quality: HeroQuality) {
  const base = new Vector3(0, quality.isMobile ? 13 : 11.8, quality.cameraDistance + 14);
  const focus = new Vector3(quality.isMobile ? 2.5 : 3.0, quality.isMobile ? 1.5 : 1.0, quality.isMobile ? -8 : -10);
  const forward = focus.clone().sub(base).normalize();
  const right = new Vector3().crossVectors(forward, UP).normalize();
  const amplitudeX = quality.isMobile ? 0.45 : 0.58;
  const amplitudeZ = quality.isMobile ? 0.35 : 0.5;

  camera.position.copy(base);
  camera.lookAt(focus);

  return {
    update: (elapsed: number, reducedMotion: boolean) => {
      const t = reducedMotion ? 0.18 : (elapsed / DURATION) % 1;
      const r = amplitudeX * Math.sin(Math.PI * 2 * t);
      const f = (amplitudeZ * (1 - Math.cos(Math.PI * 2 * t))) / 2;

      camera.position.copy(base).addScaledVector(right, r).addScaledVector(forward, f);
      camera.lookAt(focus);
    },
  };
}