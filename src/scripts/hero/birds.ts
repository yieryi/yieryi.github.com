import { BufferGeometry, Group, Line, LineBasicMaterial, Vector3 } from 'three';
import type { HeroPalette } from './palette';
import type { HeroQuality } from './quality';

interface Bird {
  group: Group;
  leftWing: Line;
  rightWing: Line;
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  height: number;
  speed: number;
  phase: number;
}

export interface Birds {
  group: Group;
  update: (time: number) => void;
  updateTheme: (palette: HeroPalette) => void;
}

export function createBirds(quality: HeroQuality): Birds {
  const group = new Group();
  const material = new LineBasicMaterial({
    color: 0x26363d,
    transparent: true,
    opacity: 0.75,
  });

  const birds: Bird[] = [];

  for (let i = 0; i < quality.birdCount; i += 1) {
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
    birdGroup.scale.setScalar(0.45);
    birdGroup.frustumCulled = false;
    group.add(birdGroup);

    birds.push({
      group: birdGroup,
      leftWing,
      rightWing,
      centerX: -8 + Math.random() * 18,
      centerZ: -20 + Math.random() * 14,
      radiusX: 4 + Math.random() * 5,
      radiusZ: 2 + Math.random() * 3,
      height: 8 + Math.random() * 4,
      speed: 0.045 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return {
    group,
    update: (time) => {
      birds.forEach((bird) => {
        const angle = time * bird.speed + bird.phase;
        bird.group.position.set(
          bird.centerX + Math.cos(angle) * bird.radiusX,
          bird.height + Math.sin(angle * 2 + bird.phase) * 0.35,
          bird.centerZ + Math.sin(angle) * bird.radiusZ,
        );
        bird.group.rotation.y = -angle;
        const flap = Math.sin(time * 8 + bird.phase) * 0.5;
        bird.leftWing.rotation.z = flap;
        bird.rightWing.rotation.z = -flap;
      });
    },
    updateTheme: (palette) => {
      material.color.setHex(palette.bird);
    },
  };
}