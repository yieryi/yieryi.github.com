import { BufferGeometry, Group, Line, LineBasicMaterial, Vector3 } from 'three';
import type { HeroPalette } from './palette';
import type { HeroQuality } from './quality';
import { terrainHeight } from './terrain';

interface Bird {
  group: Group;
  leftWing: Line;
  rightWing: Line;
  base: Vector3;
  phase: number;
  flutter: number;
}

export interface Birds {
  group: Group;
  update: (time: number, delta: number) => void;
  setPointer: (x: number, y: number) => void;
  updateTheme: (palette: HeroPalette) => void;
}

/** Patrol volume sits in front of the camera, above the valley. */
const CENTER = new Vector3(3.2, 8.6, 5.0);
const FOLLOW_X = 6.0;
const FOLLOW_Y = 2.8;
const POINTER_TIMEOUT = 2600;
const EPSILON = 0.0001;

export function createBirds(quality: HeroQuality): Birds {
  const group = new Group();
  const material = new LineBasicMaterial({
    color: 0x26363d,
    transparent: true,
    opacity: 0.8,
  });

  if (quality.isMobile || quality.birdCount === 0) {
    return { group, update: () => {}, setPointer: () => {}, updateTheme: () => {} };
  }

  const birds: Bird[] = [];
  const count = quality.birdCount;

  for (let index = 0; index < count; index += 1) {
    const birdGroup = new Group();
    const leftWing = new Line(
      new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(-0.9, 0, 0.12)]),
      material,
    );
    const rightWing = new Line(
      new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0.9, 0, 0.12)]),
      material,
    );
    const body = new Line(
      new BufferGeometry().setFromPoints([new Vector3(0, 0, -0.35), new Vector3(0, 0, 0.35)]),
      material,
    );

    birdGroup.add(leftWing, rightWing, body);
    birdGroup.scale.setScalar(0.5 + Math.random() * 0.22);
    birdGroup.frustumCulled = false;
    group.add(birdGroup);

    // Loose cluster around the flock anchor: golden-angle spread + jitter.
    const spread = Math.sqrt((index + 0.6) / count);
    const angle = index * 2.39996 + Math.random() * 0.5;

    birds.push({
      group: birdGroup,
      leftWing,
      rightWing,
      base: new Vector3(
        Math.cos(angle) * spread * 3.0 + (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 1.1 + (index === 0 ? 0.3 : 0),
        Math.sin(angle) * spread * 1.9 + (Math.random() - 0.5) * 0.6,
      ),
      phase: Math.random() * Math.PI * 2,
      flutter: 0.7 + Math.random() * 0.6,
    });
  }

  const pointerTarget = new Vector3();
  const follow = new Vector3();
  const lastCenter = new Vector3();
  const center = new Vector3();
  let pointerX = 0;
  let pointerY = 0;
  let pointerAt = Number.NEGATIVE_INFINITY;
  let yaw = 0;
  let initialised = false;

  const setPointer = (x: number, y: number) => {
    pointerX = x;
    pointerY = y;
    pointerAt = performance.now();
  };

  return {
    group,
    update: (time, delta) => {
      const active = Math.max(0, 1 - (performance.now() - pointerAt) / POINTER_TIMEOUT);
      pointerTarget.set(pointerX * FOLLOW_X * active, pointerY * FOLLOW_Y * active, 0);
      follow.lerp(pointerTarget, 1 - Math.exp(-delta * 2.4));

      // Smooth pseudo-random patrol path: several incommensurate sine waves.
      center.set(
        CENTER.x + Math.sin(time * 0.21) * 2.3 + Math.sin(time * 0.073 + 1.7) * 1.2 + follow.x,
        CENTER.y +
          Math.sin(time * 0.29 + 0.6) * 0.8 +
          Math.sin(time * 0.11 + 2.4) * 0.45 +
          follow.y,
        CENTER.z + Math.sin(time * 0.16 + 2.1) * 2.6 + Math.sin(time * 0.051 + 0.4) * 1.6,
      );

      // Keep the flock above the terrain so it never clips a ridge.
      const ground = terrainHeight(center.x, center.z) + 2.8;
      if (center.y < ground) center.y = ground;

      if (initialised) {
        const dx = center.x - lastCenter.x;
        const dz = center.z - lastCenter.z;
        if (dx * dx + dz * dz > EPSILON) {
          const targetYaw = Math.atan2(dx, dz);
          let difference = targetYaw - yaw;
          while (difference > Math.PI) difference -= Math.PI * 2;
          while (difference < -Math.PI) difference += Math.PI * 2;
          yaw += difference * Math.min(1, delta * 3);
        }
      }

      group.position.copy(center);
      group.rotation.y = yaw;
      lastCenter.copy(center);
      initialised = true;

      birds.forEach((bird) => {
        const flutter = time * bird.flutter + bird.phase;
        bird.group.position.set(
          bird.base.x + Math.sin(flutter * 0.8) * 0.26,
          bird.base.y + Math.sin(flutter * 1.4) * 0.16,
          bird.base.z + Math.cos(flutter * 0.65) * 0.26,
        );

        const flap = Math.sin(time * 9 + bird.phase) * 0.55;
        bird.leftWing.rotation.z = flap;
        bird.rightWing.rotation.z = -flap;
      });
    },
    setPointer,
    updateTheme: (palette) => {
      material.color.setHex(palette.bird);
    },
  };
}