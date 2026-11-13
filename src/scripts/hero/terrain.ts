import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three';
import { clamp, fbm, smoothstep, valueNoise } from './utils';
import { heroPalettes, type HeroPalette } from './palette';
import type { HeroQuality } from './quality';

const TERRAIN_SIZE = 64;
const TERRAIN_CENTER_Z = -8;

export function valleyCenter(z: number): number {
  return 1.0 + Math.sin(z * 0.1) * 1.8 + Math.sin(z * 0.032 + 1.4) * 2.4;
}

export function terrainHeight(x: number, z: number): number {
  const center = valleyCenter(z);
  const distance = Math.abs(x - center);
  const valley = smoothstep(0.7, 5.2, distance);
  const far = 1 - smoothstep(-26, 8, z);

  const base = fbm(x * 0.055 + 10, z * 0.055 + 3, 4) * 3.6;
  const detail = fbm(x * 0.14 + 1, z * 0.14 + 8, 3) * 1.1;
  const ridge =
    Math.pow(1 - Math.abs(valueNoise(x * 0.07 + 2, z * 0.07 + 9) * 2 - 1), 1.7) * 7.2;

  let height = (base + detail + ridge) * (0.32 + 0.68 * valley);
  height *= 0.72 + 0.55 * far;
  height -= (1 - valley) * 2.8;
  height += 0.25 * Math.sin(x * 0.35) * Math.cos(z * 0.3);

  return height - 0.35;
}

export interface Terrain {
  group: Group;
  mesh: Mesh;
  updateTheme: (palette: HeroPalette) => void;
}

export function createTerrain(quality: HeroQuality): Terrain {
  const segments = quality.terrainSegments;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const gridSize = segments + 1;
  const heights = new Float32Array(gridSize * gridSize);
  const slopes = new Float32Array(gridSize * gridSize);

  const low = new Color(heroPalettes.light.terrainLow);
  const mid = new Color(heroPalettes.light.terrainMid);
  const rock = new Color(heroPalettes.light.terrainRock);
  const snow = new Color(heroPalettes.light.terrainSnow);
  const color = new Color();

  for (let j = 0; j <= segments; j += 1) {
    const z = TERRAIN_CENTER_Z + (j / segments - 0.5) * TERRAIN_SIZE;

    for (let i = 0; i <= segments; i += 1) {
      const x = (i / segments - 0.5) * TERRAIN_SIZE;
      const y = terrainHeight(x, z);
      positions.push(x, y, z);
      heights[j * gridSize + i] = y;
    }
  }

  for (let j = 0; j <= segments; j += 1) {
    const z = TERRAIN_CENTER_Z + (j / segments - 0.5) * TERRAIN_SIZE;

    for (let i = 0; i <= segments; i += 1) {
      const index = j * gridSize + i;
      const x = (i / segments - 0.5) * TERRAIN_SIZE;
      const y = heights[index];
      const left = heights[j * gridSize + Math.max(0, i - 1)];
      const right = heights[j * gridSize + Math.min(segments, i + 1)];
      const top = heights[Math.max(0, j - 1) * gridSize + i];
      const bottom = heights[Math.min(segments, j + 1) * gridSize + i];
      const slope = Math.abs(right - left) + Math.abs(bottom - top);
      slopes[index] = slope;

      const snowLine = 3.8 + fbm(x * 0.18 + 4, z * 0.18 + 7, 2) * 0.7;
      const snowMix =
        smoothstep(snowLine, snowLine + 0.9, y) *
        (1 - smoothstep(0.35, 0.85, slope) * 0.6);
      const lowMix = smoothstep(-1.2, 2.4, y);

      color.copy(low).lerp(mid, lowMix);
      color.lerp(rock, smoothstep(0.2, 0.65, slope) * 0.8);
      color.lerp(snow, clamp(snowMix, 0, 1));
      colors.push(color.r, color.g, color.b);
    }
  }

  for (let j = 0; j < segments; j += 1) {
    for (let i = 0; i < segments; i += 1) {
      const a = j * (segments + 1) + i;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });

  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;

  const wireMaterial = new MeshBasicMaterial({
    color: heroPalettes.light.wire,
    wireframe: true,
    transparent: true,
    opacity: heroPalettes.light.wireOpacity,
    depthWrite: false,
  });
  const wire = new Mesh(geometry, wireMaterial);
  wire.frustumCulled = false;
  wire.renderOrder = 1;

  const group = new Group();
  group.add(mesh, wire);

  const colorAttribute = geometry.getAttribute('color') as BufferAttribute;
  const positionAttribute = geometry.getAttribute('position') as BufferAttribute;

  const updateTheme = (palette: HeroPalette) => {
    low.setHex(palette.terrainLow);
    mid.setHex(palette.terrainMid);
    rock.setHex(palette.terrainRock);
    snow.setHex(palette.terrainSnow);
    wireMaterial.color.setHex(palette.wire);
    wireMaterial.opacity = palette.wireOpacity;

    for (let index = 0; index < colorAttribute.count; index += 1) {
      const x = positionAttribute.getX(index);
      const y = heights[index];
      const z = positionAttribute.getZ(index);
      const slope = slopes[index];
      const snowLine = 3.8 + fbm(x * 0.18 + 4, z * 0.18 + 7, 2) * 0.7;
      const snowMix =
        smoothstep(snowLine, snowLine + 0.9, y) *
        (1 - smoothstep(0.35, 0.85, slope) * 0.6);
      const lowMix = smoothstep(-1.2, 2.4, y);

      color.copy(low).lerp(mid, lowMix);
      color.lerp(rock, smoothstep(0.2, 0.65, slope) * 0.8);
      color.lerp(snow, clamp(snowMix, 0, 1));
      colorAttribute.setXYZ(index, color.r, color.g, color.b);
    }

    colorAttribute.needsUpdate = true;
  };

  return { group, mesh, updateTheme };
}