import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import type { HeroPalette } from './palette';
import type { HeroQuality } from './quality';
import { terrainHeight } from './terrain';

interface Bird {
  group: Group;
  leftWing: Mesh;
  rightWing: Mesh;
  position: Vector3;
  velocity: Vector3;
  phase: number;
  wander: number;
}

export interface Birds {
  group: Group;
  update: (time: number, delta: number, camera: PerspectiveCamera) => void;
  setPointer: (x: number, y: number) => void;
  updateTheme: (palette: HeroPalette) => void;
}

const CENTER = new Vector3(2.5, 8.2, 4.0);
const BOUNDS_MIN = new Vector3(-10, 3.6, -10);
const BOUNDS_MAX = new Vector3(15, 15, 20);

const SEPARATION_RADIUS = 2.2;
const ALIGNMENT_RADIUS = 5.5;
const COHESION_RADIUS = 7.5;

const MAX_SPEED = 9.0;
const MIN_SPEED = 2.4;
const MAX_ACCEL = 26;
const POINTER_TIMEOUT = 2400;
const VIEW_DISTANCE = 21;

const UP = new Vector3(0, 1, 0);

function createWingGeometry(side: 1 | -1): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      [0, 0, -0.12, side * 0.9, 0, 0.26, 0, 0, 0.34],
      3,
    ),
  );
  geometry.computeVertexNormals();
  return geometry;
}

function createBodyGeometry(): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute([0, 0, -0.62, -0.1, 0, 0.34, 0.1, 0, 0.34], 3),
  );
  geometry.computeVertexNormals();
  return geometry;
}

export function createBirds(quality: HeroQuality): Birds {
  const group = new Group();
  const material = new MeshBasicMaterial({
    color: 0x26363d,
    transparent: true,
    opacity: 0.9,
    side: DoubleSide,
    depthWrite: true,
  });

  if (quality.isMobile || quality.birdCount === 0) {
    return { group, update: () => {}, setPointer: () => {}, updateTheme: () => {} };
  }

  const birds: Bird[] = [];
  const count = quality.birdCount;
  const wingGeometry = { left: createWingGeometry(-1), right: createWingGeometry(1) };
  const bodyGeometry = createBodyGeometry();

  for (let index = 0; index < count; index += 1) {
    const birdGroup = new Group();
    const leftWing = new Mesh(wingGeometry.left, material);
    const rightWing = new Mesh(wingGeometry.right, material);
    const body = new Mesh(bodyGeometry, material);

    birdGroup.add(leftWing, rightWing, body);
    birdGroup.scale.setScalar(0.2 + Math.random() * 0.08);
    birdGroup.rotation.order = 'YXZ';
    birdGroup.frustumCulled = false;
    group.add(birdGroup);

    const position = new Vector3(
      CENTER.x + (Math.random() - 0.5) * 7,
      CENTER.y + (Math.random() - 0.5) * 3,
      CENTER.z + (Math.random() - 0.5) * 5,
    );

    birds.push({
      group: birdGroup,
      leftWing,
      rightWing,
      position,
      velocity: new Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 2,
      ),
      phase: Math.random() * Math.PI * 2,
      wander: Math.random() * Math.PI * 2,
    });
  }

  const target = new Vector3();
  const desiredTarget = new Vector3();
  const roam = new Vector3();
  const cameraDir = new Vector3();
  const cameraRight = new Vector3();
  const cameraUp = new Vector3();
  const viewCenter = new Vector3();

  const acceleration = new Vector3();
  const offset = new Vector3();
  const steer = new Vector3();
  const neighborCenter = new Vector3();

  let pointerX = 0;
  let pointerY = 0;
  let pointerAt = Number.NEGATIVE_INFINITY;
  let initialised = false;

  const setPointer = (x: number, y: number) => {
    pointerX = x;
    pointerY = y;
    pointerAt = performance.now();
  };

  const clampToBounds = (point: Vector3) => {
    point.x = Math.min(BOUNDS_MAX.x, Math.max(BOUNDS_MIN.x, point.x));
    point.y = Math.min(BOUNDS_MAX.y, Math.max(BOUNDS_MIN.y, point.y));
    point.z = Math.min(BOUNDS_MAX.z, Math.max(BOUNDS_MIN.z, point.z));
    return point;
  };

  return {
    group,
    update: (time, delta, camera) => {
      const dt = Math.min(delta, 0.05);
      const pointerActive = performance.now() - pointerAt < POINTER_TIMEOUT;

      // Free-flight target: a slow random patrol around the valley.
      roam.set(
        CENTER.x + Math.sin(time * 0.23) * 3.0 + Math.sin(time * 0.08 + 1.7) * 1.8,
        CENTER.y + Math.sin(time * 0.31 + 0.5) * 0.9 + Math.sin(time * 0.12) * 0.5,
        CENTER.z + Math.sin(time * 0.17 + 2.1) * 2.6,
      );

      if (pointerActive) {
        camera.getWorldDirection(cameraDir);
        cameraRight.crossVectors(cameraDir, UP).normalize();
        cameraUp.crossVectors(cameraRight, cameraDir).normalize();

        // Place the target on a plane close to the camera, in front of the
        // mountain surface, so the flock stays visible under the cursor.
        const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * VIEW_DISTANCE;
        const halfWidth = halfHeight * camera.aspect;

        viewCenter.copy(camera.position).addScaledVector(cameraDir, VIEW_DISTANCE);
        desiredTarget
          .copy(viewCenter)
          .addScaledVector(cameraRight, pointerX * halfWidth)
          .addScaledVector(cameraUp, pointerY * halfHeight);
        clampToBounds(desiredTarget);
      } else {
        desiredTarget.copy(roam);
      }

      if (!initialised) {
        target.copy(desiredTarget);
        initialised = true;
      }

      // The flock chases the target as a whole, but every bird still applies
      // separation / alignment / cohesion to keep a natural flock shape.
      target.lerp(desiredTarget, 1 - Math.exp(-dt * (pointerActive ? 10 : 1.6)));

      neighborCenter.set(0, 0, 0);
      for (const bird of birds) neighborCenter.add(bird.position);
      neighborCenter.divideScalar(birds.length);

      const wanderWeight = pointerActive ? 0.3 : 0.6;

      birds.forEach((bird, index) => {
        acceleration.set(0, 0, 0);

        // Seek the cursor / patrol target.
        steer.subVectors(target, bird.position);
        const targetDistance = steer.length();
        if (targetDistance > 0.0001) {
          steer.multiplyScalar(MAX_SPEED / targetDistance).sub(bird.velocity);
          acceleration.addScaledVector(steer, pointerActive ? 2.6 : 1.5);
        }

        // Cohesion towards the flock centroid.
        offset.subVectors(neighborCenter, bird.position);
        acceleration.addScaledVector(offset, 0.16);

        for (let other = 0; other < birds.length; other += 1) {
          if (other === index) continue;
          const mate = birds[other];
          offset.subVectors(bird.position, mate.position);
          const distance = offset.length();

          if (distance < SEPARATION_RADIUS && distance > 0.0001) {
            offset.multiplyScalar(1 / distance);
            acceleration.addScaledVector(offset, (SEPARATION_RADIUS - distance) * 5.5);
          }

          if (distance < ALIGNMENT_RADIUS && distance > 0.0001) {
            steer.subVectors(mate.velocity, bird.velocity);
            acceleration.addScaledVector(steer, 0.55);
          }

          if (distance < COHESION_RADIUS && distance > 0.0001) {
            offset.multiplyScalar(-1 / distance);
            acceleration.addScaledVector(offset, 0.22);
          }
        }

        // Gentle wander so the flock never looks like it is on rails.
        acceleration.x += Math.sin(time * 0.9 + bird.wander) * wanderWeight;
        acceleration.y += Math.sin(time * 1.1 + bird.wander * 1.3) * wanderWeight * 0.65;
        acceleration.z += Math.cos(time * 0.8 + bird.wander) * wanderWeight;

        // Soft bounds.
        if (bird.position.x < BOUNDS_MIN.x) acceleration.x += (BOUNDS_MIN.x - bird.position.x) * 4;
        if (bird.position.x > BOUNDS_MAX.x) acceleration.x += (BOUNDS_MAX.x - bird.position.x) * 4;
        if (bird.position.y < BOUNDS_MIN.y) acceleration.y += (BOUNDS_MIN.y - bird.position.y) * 4;
        if (bird.position.y > BOUNDS_MAX.y) acceleration.y += (BOUNDS_MAX.y - bird.position.y) * 4;
        if (bird.position.z < BOUNDS_MIN.z) acceleration.z += (BOUNDS_MIN.z - bird.position.z) * 4;
        if (bird.position.z > BOUNDS_MAX.z) acceleration.z += (BOUNDS_MAX.z - bird.position.z) * 4;

        // Stay above the terrain.
        const ground = terrainHeight(bird.position.x, bird.position.z) + 2.4;
        if (bird.position.y < ground) acceleration.y += (ground - bird.position.y) * 12;

        const accelLength = acceleration.length();
        if (accelLength > MAX_ACCEL) acceleration.multiplyScalar(MAX_ACCEL / accelLength);

        bird.velocity.addScaledVector(acceleration, dt);
        const speed = bird.velocity.length();
        if (speed > MAX_SPEED) bird.velocity.multiplyScalar(MAX_SPEED / speed);
        else if (speed > 0.001 && speed < MIN_SPEED) bird.velocity.multiplyScalar(MIN_SPEED / speed);

        bird.position.addScaledVector(bird.velocity, dt);
        const floor = terrainHeight(bird.position.x, bird.position.z) + 1.7;
        if (bird.position.y < floor) {
          bird.position.y = floor;
          if (bird.velocity.y < 0) bird.velocity.y *= 0.3;
        }

        const horizontal = Math.hypot(bird.velocity.x, bird.velocity.z);
        bird.group.position.copy(bird.position);
        bird.group.rotation.y = Math.atan2(bird.velocity.x, bird.velocity.z);
        bird.group.rotation.x = -Math.atan2(bird.velocity.y, Math.max(horizontal, 0.001)) * 0.5;

        const flapSpeed = 8 + speed * 0.9;
        const flap = Math.sin(time * flapSpeed + bird.phase) * 0.55;
        bird.leftWing.rotation.z = -flap;
        bird.rightWing.rotation.z = flap;
      });
    },
    setPointer,
    updateTheme: (palette) => {
      material.color.setHex(palette.bird);
    },
  };
}