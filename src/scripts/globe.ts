import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

type Pulse = {
  mesh: Mesh;
  curve: QuadraticBezierCurve3;
  offset: number;
};

export function initGlobe(canvas: HTMLCanvasElement): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const hero = canvas.closest<HTMLElement>('.hero');

  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.08, 5.4);

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance',
  });
  renderer.setClearAlpha(0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.15 : 1.5));

  const group = new Group();
  scene.add(group);

  const radius = 1.9;

  const sphere = new Mesh(
    new SphereGeometry(radius, isMobile ? 24 : 40, isMobile ? 16 : 28),
    new MeshBasicMaterial({
      color: 0x38e8c6,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    }),
  );
  group.add(sphere);

  const pointCount = isMobile ? 760 : 1800;
  const positions = new Float32Array(pointCount * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < pointCount; i += 1) {
    const y = 1 - (i / (pointCount - 1)) * 2;
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const r = radius * 1.005;
    positions[i * 3] = Math.cos(theta) * ringRadius * r;
    positions[i * 3 + 1] = y * r;
    positions[i * 3 + 2] = Math.sin(theta) * ringRadius * r;
  }

  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute('position', new BufferAttribute(positions, 3));
  group.add(
    new Points(
      pointGeometry,
      new PointsMaterial({
        color: 0xa8fff0,
        size: isMobile ? 0.022 : 0.017,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
        blending: AdditiveBlending,
        sizeAttenuation: true,
      }),
    ),
  );

  const randomPoint = (r = radius) => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return new Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  };

  const arcMaterials = [
    new LineBasicMaterial({
      color: 0x4c8dff,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
    new LineBasicMaterial({
      color: 0x38e8c6,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),
  ];

  const pulses: Pulse[] = [];
  const pulseGeometry = new SphereGeometry(0.013, 6, 6);
  const pulseMaterial = new MeshBasicMaterial({ color: 0x9ff9e8 });

  const arcCount = isMobile ? 4 : 7;
  for (let i = 0; i < arcCount; i += 1) {
    const start = randomPoint(radius * 0.995);
    const end = randomPoint(radius * 0.995);
    const mid = start
      .clone()
      .add(end)
      .normalize()
      .multiplyScalar(radius + 0.24 + Math.random() * 0.34);
    const curve = new QuadraticBezierCurve3(start, mid, end);
    const line = new Line(
      new BufferGeometry().setFromPoints(curve.getPoints(isMobile ? 28 : 44)),
      arcMaterials[i % arcMaterials.length],
    );
    group.add(line);

    const pulse = new Mesh(pulseGeometry, pulseMaterial);
    pulses.push({ mesh: pulse, curve, offset: Math.random() });
    group.add(pulse);
  }

  const orbit = new Mesh(
    new TorusGeometry(2.16, 0.0035, 6, 180),
    new MeshBasicMaterial({
      color: 0x38e8c6,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
  );
  orbit.rotation.x = Math.PI / 2.45;
  orbit.rotation.z = 0.25;
  group.add(orbit);

  const orbit2 = new Mesh(
    new TorusGeometry(2.38, 0.0025, 6, 180),
    new MeshBasicMaterial({
      color: 0x4c8dff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
  );
  orbit2.rotation.x = Math.PI / 2.05;
  orbit2.rotation.z = -0.35;
  group.add(orbit2);

  const pointer = { x: 0, y: 0 };
  hero?.addEventListener(
    'pointermove',
    (event) => {
      const rect = hero.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    },
    { passive: true },
  );

  let inView = true;
  let frame = 0;
  let elapsed = 0;
  let lastTime = performance.now();

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const draw = () => {
    frame = 0;
    if (!inView || document.hidden) return;

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    elapsed += delta;

    group.rotation.y += delta * 0.1;
    group.rotation.x = 0.16 + pointer.y * 0.1;
    group.rotation.z = -0.06 + pointer.x * 0.055;
    group.position.y = Math.sin(elapsed * 0.55) * 0.022;
    orbit.rotation.z += delta * 0.045;
    orbit2.rotation.z -= delta * 0.03;

    pulses.forEach((pulse) => {
      const progress = (elapsed * 0.09 + pulse.offset) % 1;
      pulse.mesh.position.copy(pulse.curve.getPointAt(progress));
      const fade = Math.sin(progress * Math.PI);
      pulse.mesh.scale.setScalar(0.6 + fade * 0.9);
    });

    renderer.render(scene, camera);
    if (!reduceMotion) frame = requestAnimationFrame(draw);
  };

  const start = () => {
    if (frame || reduceMotion) return;
    if (inView && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(draw);
    }
  };

  resize();
  draw();
  canvas.classList.add('is-ready');

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (reduceMotion) renderer.render(scene, camera);
  });
  resizeObserver.observe(canvas);

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
}