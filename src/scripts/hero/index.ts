import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { getHeroQuality } from './quality';
import { heroPalettes } from './palette';
import { createTerrain } from './terrain';
import { createRiver } from './river';
import { createSky } from './sky';
import { createBirds } from './birds';
import { createCameraController } from './camera';
import { createTrail } from './trail';

interface HeroSceneOptions {
  canvas: HTMLCanvasElement;
  trailCanvas: HTMLCanvasElement;
  hero: HTMLElement;
}

const getTheme = (): 'light' | 'dark' =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

export function initHeroScene({ canvas, trailCanvas, hero }: HeroSceneOptions): void {
  const quality = getHeroQuality();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: quality.antialias,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(quality.dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;

  const scene = new Scene();
  const camera = new PerspectiveCamera(quality.fov, 1, 0.1, 180);
  const cameraController = createCameraController(camera, quality);

  const hemisphere = new HemisphereLight(0xe7f2f8, 0x58706d, 1.2);
  const sun = new DirectionalLight(0xfff4dd, 2.6);
  sun.position.set(24, 32, -24);
  scene.add(hemisphere, sun);

  const world = new Group();
  scene.add(world);

  const terrain = createTerrain(quality);
  const river = createRiver();
  const sky = createSky(quality);
  const birds = createBirds(quality);
  world.add(sky.group, terrain.group, river.mesh, birds.group);

  const trail = createTrail(trailCanvas, hero);

  let elapsed = 0;
  let lastTime = performance.now();
  let frame = 0;
  let inView = true;

  const applyTheme = () => {
    const palette = heroPalettes[getTheme()];
    terrain.updateTheme(palette);
    river.updateTheme(palette);
    sky.updateTheme(palette);
    birds.updateTheme(palette);

    hemisphere.color.setHex(palette.hemiSky);
    hemisphere.groundColor.setHex(palette.hemiGround);
    hemisphere.intensity = getTheme() === 'dark' ? 1.1 : 1.4;
    sun.color.setHex(palette.light);
    sun.intensity = palette.lightIntensity;
    if (scene.fog) {
      (scene.fog as Fog).color.setHex(palette.fog);
    }
    if (reducedMotion) {
      renderer.render(scene, camera);
    }
  };

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    trail.resize();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    birds.setPointer(x, y);
  };
  hero.addEventListener('pointermove', onPointerMove, { passive: true });

  const animate = () => {
    frame = 0;
    if (!inView || document.hidden) return;

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    elapsed += delta;

    cameraController.update(elapsed, reducedMotion);
    river.updateTime(elapsed);
    birds.update(elapsed, delta);
    trail.update(now, getTheme());

    renderer.render(scene, camera);
    if (!reducedMotion) frame = requestAnimationFrame(animate);
  };

  const start = () => {
    if (frame || reducedMotion) return;
    if (inView && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    }
  };

  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
    },
    { threshold: 0 },
  );
  intersectionObserver.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) start();
  });

  scene.fog = new Fog(heroPalettes.light.fog, 22, 100);
  applyTheme();
  resize();
  cameraController.update(0, reducedMotion);
  animate();
  canvas.classList.add('is-ready');
}