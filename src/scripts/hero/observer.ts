import {
  BufferGeometry,
  CylinderGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { terrainHeight } from './terrain';
import type { HeroPalette } from './palette';
import type { HeroQuality } from './quality';

export interface Observer {
  group: Group;
  anchor: Vector3;
  update: (time: number) => void;
  updateTheme: (palette: HeroPalette) => void;
}

export function createObserver(quality: HeroQuality): Observer {
  const group = new Group();
  const x = 6.2;
  const z = 4.5;
  const y = terrainHeight(x, z) + 0.08;
  group.position.set(x, y, z);
  group.scale.setScalar(1.5);
  group.visible = !quality.isMobile;

  const figureMaterial = new MeshBasicMaterial({
    color: 0x083f39,
    transparent: true,
    opacity: 0.96,
  });
  const headMaterial = new MeshBasicMaterial({
    color: 0x083f39,
    transparent: true,
    opacity: 0.98,
  });

  const makeBone = (start: Vector3, end: Vector3, radius = 0.035) => {
    const direction = end.clone().sub(start);
    const length = direction.length();
    const bone = new Mesh(new CylinderGeometry(radius, radius, length, 6), figureMaterial);
    bone.position.copy(start).add(end).multiplyScalar(0.5);
    bone.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());
    return bone;
  };

  const body = makeBone(new Vector3(0, 0.55, 0), new Vector3(0, 1.12, 0), 0.04);
  const leftArm = makeBone(new Vector3(0, 0.98, 0), new Vector3(-0.3, 0.78, 0), 0.028);
  const rightArm = makeBone(new Vector3(0, 0.98, 0), new Vector3(0.3, 0.78, 0), 0.028);
  const leftLeg = makeBone(new Vector3(0, 0.55, 0), new Vector3(-0.2, 0, 0), 0.03);
  const rightLeg = makeBone(new Vector3(0, 0.55, 0), new Vector3(0.2, 0, 0), 0.03);
  const head = new Mesh(new SphereGeometry(0.13, 12, 10), headMaterial);
  head.position.set(0, 1.26, 0);

  const axisLength = 1.25;
  const axisXMaterial = new LineBasicMaterial({ color: 0xb85c38, transparent: true, opacity: 0.85 });
  const axisYMaterial = new LineBasicMaterial({ color: 0x087b6b, transparent: true, opacity: 0.85 });
  const axisZMaterial = new LineBasicMaterial({ color: 0x2f628c, transparent: true, opacity: 0.85 });

  const axisX = new Line(
    new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(axisLength, 0, 0)]),
    axisXMaterial,
  );
  const axisY = new Line(
    new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0, axisLength, 0)]),
    axisYMaterial,
  );
  const axisZ = new Line(
    new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, axisLength)]),
    axisZMaterial,
  );

  const ringMaterial = new MeshBasicMaterial({
    color: 0x087b6b,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const ring = new Mesh(new TorusGeometry(0.48, 0.009, 4, 48), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.015;

  group.add(axisX, axisY, axisZ, body, leftArm, rightArm, leftLeg, rightLeg, head, ring);

  const anchor = new Vector3();

  return {
    group,
    anchor,
    update: (time) => {
      ring.rotation.z = time * 0.45;
      ring.scale.setScalar(0.95 + Math.sin(time * 1.4) * 0.06);
      group.position.y = y + Math.sin(time * 0.8) * 0.012;
      anchor.copy(group.position);
      anchor.y += 2.1 * group.scale.y;
    },
    updateTheme: (palette) => {
      figureMaterial.color.setHex(palette.observer);
      headMaterial.color.setHex(palette.observer);
      axisXMaterial.color.setHex(palette.axisX);
      axisYMaterial.color.setHex(palette.axisY);
      axisZMaterial.color.setHex(palette.axisZ);
      ringMaterial.color.setHex(palette.ring);
    },
  };
}