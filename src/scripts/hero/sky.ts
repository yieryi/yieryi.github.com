import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  Mesh,
  Points,
  PointsMaterial,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
} from 'three';
import { createGlowTexture } from './utils';
import { heroPalettes, type HeroPalette } from './palette';
import type { HeroQuality } from './quality';

export interface Sky {
  group: Group;
  updateTheme: (palette: HeroPalette) => void;
}

export function createSky(quality: HeroQuality): Sky {
  const group = new Group();

  const skyMaterial = new ShaderMaterial({
    uniforms: {
      uTop: { value: new Color(heroPalettes.light.skyTop) },
      uBottom: { value: new Color(heroPalettes.light.skyBottom) },
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
      uniform vec3 uTop;
      uniform vec3 uBottom;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        float mixFactor = smoothstep(-0.08, 0.62, h);
        vec3 color = mix(uBottom, uTop, mixFactor);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: BackSide,
    depthWrite: false,
    fog: false,
  });

  const sky = new Mesh(new SphereGeometry(80, 32, 20), skyMaterial);
  sky.frustumCulled = false;
  group.add(sky);

  const glowTexture = new CanvasTexture(createGlowTexture());
  const sunMaterial = new SpriteMaterial({
    map: glowTexture,
    color: heroPalettes.light.sun,
    transparent: true,
    opacity: heroPalettes.light.sunOpacity,
    blending: AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  const sun = new Sprite(sunMaterial);
  sun.position.set(24, 19, -42);
  sun.scale.set(9, 9, 1);
  group.add(sun);

  const starPositions = new Float32Array(quality.starCount * 3);

  for (let i = 0; i < quality.starCount; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.75 + 0.05);
    const radius = 68;
    starPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    starPositions[i * 3 + 1] = Math.cos(phi) * radius;
    starPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  }

  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute('position', new BufferAttribute(starPositions, 3));
  const starMaterial = new PointsMaterial({
    color: 0xd8fff8,
    size: 0.16,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
    fog: false,
  });
  const stars = new Points(starGeometry, starMaterial);
  stars.frustumCulled = false;
  group.add(stars);

  return {
    group,
    updateTheme: (palette) => {
      (skyMaterial.uniforms.uTop.value as Color).setHex(palette.skyTop);
      (skyMaterial.uniforms.uBottom.value as Color).setHex(palette.skyBottom);
      sunMaterial.color.setHex(palette.sun);
      sunMaterial.opacity = palette.sunOpacity;
      starMaterial.opacity = palette.starOpacity;
      sun.scale.setScalar(palette.starOpacity > 0.5 ? 6.5 : 9);
    },
  };
}