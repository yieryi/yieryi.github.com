import { BufferGeometry, Group, Line, LineBasicMaterial, Vector3 } from 'three';
import type { HeroPalette } from './palette';
import type { HeroQuality } from './quality';

interface FlockBird {
  group: Group;
  leftWing: Line;
  rightWing: Line;
  phase: number;
  baseY: number;
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
    opacity: 0.78,
  });

  if (quality.isMobile || quality.birdCount === 0) {
    return { group, update: () => {}, updateTheme: () => {} };
  }

  const formation: Array<{ x: number; y: number; z: number }> = [{ x: 0, y: 0, z: 0 }];
  for (let i = 1; i <= Math.ceil(quality.birdCount / 2); i += 1) {
    formation.push({ x: i * 0.78, y: Math.sin(i * 0.8) * 0.08, z: i * 0.34 });
    formation.push({ x: -i * 0.78, y: Math.sin(i * 0.8 + 1) * 0.08, z: i * 0.34 });
  }

  const birds: FlockBird[] = [];

  formation.slice(0, quality.birdCount).forEach((slot, index) => {
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
    birdGroup.position.set(slot.x, slot.y, slot.z);
    birdGroup.scale.setScalar(0.4 + (index % 3) * 0.07);
    birdGroup.frustumCulled = false;
    group.add(birdGroup);

    birds.push({
      group: birdGroup,
      leftWing,
      rightWing,
      phase: index * 0.7 + Math.random() * 0.6,
      baseY: slot.y,
    });
  });

  return {
    group,
    update: (time) => {
      const angle = time * 0.075;
      group.position.set(
        4.5 + Math.sin(angle) * 6,
        9.0 + Math.sin(time * 0.18) * 0.45,
        2.0 + Math.cos(angle) * 2.4,
      );
      group.rotation.y = -angle + Math.PI * 0.15;

      birds.forEach((bird) => {
        const flap = Math.sin(time * 8 + bird.phase) * 0.5;
        bird.leftWing.rotation.z = flap;
        bird.rightWing.rotation.z = -flap;
        bird.group.position.y = bird.baseY + Math.sin(time * 1.7 + bird.phase) * 0.03;
      });
    },
    updateTheme: (palette) => {
      material.color.setHex(palette.bird);
    },
  };
}