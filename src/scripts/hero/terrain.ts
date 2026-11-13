import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  ShaderMaterial,
} from 'three';
import { clamp, fbm, smoothstep } from './utils';
import { heroPalettes, type HeroPalette } from './palette';
import type { HeroQuality } from './quality';

const TERRAIN_SIZE = 120;
const TERRAIN_CENTER_Z = -36;

export function valleyCenter(z: number): number {
  return 1.0 + Math.sin(z * 0.1) * 1.8 + Math.sin(z * 0.032 + 1.4) * 2.4;
}

export function terrainHeight(x: number, z: number): number {
  const center = valleyCenter(z);
  const distance = Math.abs(x - center);
  const valley = smoothstep(2.0, 14, distance);
  const far = 1 - smoothstep(-26, 8, z);

  const base = fbm(x * 0.05 + 10, z * 0.05 + 3, 4) * 3.4;
  const detail = fbm(x * 0.15 + 1, z * 0.15 + 8, 3) * 1.2;
  const ridgeNoise = fbm(x * 0.045 + 2, z * 0.045 + 5, 5);
  const ridge = Math.pow(1 - Math.abs(ridgeNoise * 2 - 1), 2.1) * 10.5;
  const massif = Math.exp(-(((x - 7) ** 2) / 90 + ((z + 14) ** 2) / 180)) * 4.4;
  const massif2 = Math.exp(-(((x + 11) ** 2) / 130 + ((z + 23) ** 2) / 210)) * 3.2;

  let height = (base + detail + ridge + massif + massif2) * (0.1 + 0.9 * valley);
  height *= 0.72 + 0.55 * far;
  // Keep the valley mouth (nearest the camera) low and open; let distant
  // ridges stay tall so the snow peaks still read as a skyline.
  height *= 1 - 0.55 * smoothstep(6, 26, z);
  height -= (1 - valley) * 1.2;
  // River channel: guarantee the bed sits below the water plane.
  height -= Math.exp(-((distance / 1.5) ** 2)) * 1.15;
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
    flatShading: false,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;

  const contourMaterial = new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(heroPalettes.light.contour) },
      uOpacity: { value: heroPalettes.light.contourOpacity },
      uInterval: { value: 1.3 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uInterval;
      varying vec3 vWorldPosition;
      void main() {
        float f = vWorldPosition.y / uInterval;
        float v = fract(f);
        float d = min(v, 1.0 - v);
        float w = fwidth(f) * 1.35;
        float alpha = 1.0 - smoothstep(0.0, w, d);
        gl_FragColor = vec4(uColor, alpha * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const contour = new Mesh(geometry, contourMaterial);
  contour.frustumCulled = false;
  contour.renderOrder = 2;

  const group = new Group();
  group.add(mesh, contour);

  const colorAttribute = geometry.getAttribute('color') as BufferAttribute;
  const positionAttribute = geometry.getAttribute('position') as BufferAttribute;

  const updateTheme = (palette: HeroPalette) => {
    low.setHex(palette.terrainLow);
    mid.setHex(palette.terrainMid);
    rock.setHex(palette.terrainRock);
    snow.setHex(palette.terrainSnow);
    (contourMaterial.uniforms.uColor.value as Color).setHex(palette.contour);
    contourMaterial.uniforms.uOpacity.value = palette.contourOpacity;

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