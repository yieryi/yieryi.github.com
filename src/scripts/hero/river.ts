import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  ShaderMaterial,
} from 'three';
import { valleyCenter } from './terrain';
import { heroPalettes, type HeroPalette } from './palette';

export interface River {
  mesh: Mesh;
  updateTime: (time: number) => void;
  updateTheme: (palette: HeroPalette) => void;
}

export function createRiver(): River {
  const steps = 180;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const waterLevel = -0.32;

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const z = -36 + t * 48;
    const center = valleyCenter(z);
    const width = 0.72 + 0.3 * Math.sin(z * 0.2 + 1.2) + 0.15 * Math.sin(z * 0.06);

    positions.push(center - width, waterLevel, z);
    positions.push(center + width, waterLevel, z);
    uvs.push(0, t, 1, t);
  }

  for (let i = 0; i < steps; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new Color(heroPalettes.light.waterDeep) },
      uShallow: { value: new Color(heroPalettes.light.waterShallow) },
      uHighlight: { value: new Color(heroPalettes.light.waterHighlight) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      uniform vec3 uHighlight;
      varying vec2 vUv;

      void main() {
        float flow = sin(vUv.y * 95.0 - uTime * 2.2 + sin(vUv.x * 6.283) * 1.4);
        float band = smoothstep(0.82, 1.0, flow);
        float crossFlow = sin(vUv.y * 9.0 + uTime * 0.35) * 0.5 + 0.5;
        vec3 color = mix(uDeep, uShallow, 0.18 + crossFlow * 0.3);
        color = mix(color, uHighlight, band * 0.1);
        gl_FragColor = vec4(color, 0.9);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);
  mesh.renderOrder = 2;

  return {
    mesh,
    updateTime: (time) => {
      material.uniforms.uTime.value = time;
    },
    updateTheme: (palette) => {
      (material.uniforms.uDeep.value as Color).setHex(palette.waterDeep);
      (material.uniforms.uShallow.value as Color).setHex(palette.waterShallow);
      (material.uniforms.uHighlight.value as Color).setHex(palette.waterHighlight);
    },
  };
}