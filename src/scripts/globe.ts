import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  NormalBlending,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';

type ArcColorKey = 'arc1' | 'arc2' | 'arc3';
type OrbitColorKey = 'orbit1' | 'orbit2';

type Comet = {
  curve: QuadraticBezierCurve3;
  head: Sprite;
  tail: Line;
  tailGeometry: BufferGeometry;
  tailPositions: Float32Array;
  tailMaterial: LineBasicMaterial;
  colorKey: ArcColorKey;
  offset: number;
  speed: number;
  tailOpacity: number;
  headOpacity: number;
};

type OrbitNode = {
  node: Sprite;
  radius: number;
  speed: number;
  offset: number;
  colorKey: OrbitColorKey;
};

const TAIL_SEGMENTS = 16;

const palette = {
  dark: {
    grid: 0x38e8c6,
    gridOpacity: 0.055,
    equator: 0x38e8c6,
    equatorOpacity: 0.18,
    point: 0xd6fff8,
    pointOpacity: 0.62,
    spark: 0xffffff,
    sparkOpacity: 0.9,
    arc1: 0x38e8c6,
    arc2: 0xd6fff8,
    arc3: 0xffb86b,
    arcOpacity: 0.24,
    tailOpacity: 0.7,
    headOpacity: 0.9,
    orbit1: 0x38e8c6,
    orbit2: 0xffb86b,
    orbit1Opacity: 0.13,
    orbit2Opacity: 0.08,
    atmosphere: 0x38e8c6,
    atmosphereOpacity: 0.24,
    atmosphereBase: 0.012,
    blending: AdditiveBlending,
    sparkTwinkle: 0.18,
  },
  light: {
    grid: 0x066f62,
    gridOpacity: 0.32,
    equator: 0x055247,
    equatorOpacity: 0.55,
    point: 0x055247,
    pointOpacity: 0.85,
    spark: 0x054a68,
    sparkOpacity: 0.95,
    arc1: 0x066f62,
    arc2: 0x24557f,
    arc3: 0xa65f18,
    arcOpacity: 0.7,
    tailOpacity: 0.95,
    headOpacity: 0.98,
    orbit1: 0x066f62,
    orbit2: 0xa65f18,
    orbit1Opacity: 0.42,
    orbit2Opacity: 0.32,
    atmosphere: 0x066f62,
    atmosphereOpacity: 0.28,
    atmosphereBase: 0.025,
    blending: NormalBlending,
    sparkTwinkle: 0.08,
  },
} as const;

export function initGlobe(canvas: HTMLCanvasElement): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const hero = canvas.closest<HTMLElement>('.hero');

  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.06, 7.4);

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

  const radius = 1.75;
  const glowTexture = createGlowTexture();

  const makeGlowMaterial = (color: number) =>
    new SpriteMaterial({
      map: glowTexture,
      color,
      transparent: true,
      opacity: 0.9,
      blending: AdditiveBlending,
      depthWrite: false,
    });

  // Sparse latitude / longitude surface grid.
  const grid = new Group();
  const gridMaterial = new LineBasicMaterial({
    color: palette.dark.grid,
    transparent: true,
    opacity: palette.dark.gridOpacity,
    depthWrite: false,
  });
  const latitudeCount = isMobile ? 6 : 9;
  const longitudeCount = isMobile ? 8 : 14;

  for (let i = 1; i < latitudeCount; i += 1) {
    const phi = (i / latitudeCount) * Math.PI;
    const y = Math.cos(phi) * radius;
    const ringRadius = Math.sin(phi) * radius;
    const points: Vector3[] = [];
    for (let j = 0; j <= 96; j += 1) {
      const angle = (j / 96) * Math.PI * 2;
      points.push(new Vector3(Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius));
    }
    grid.add(new Line(new BufferGeometry().setFromPoints(points), gridMaterial));
  }

  for (let i = 0; i < longitudeCount; i += 1) {
    const angle = (i / longitudeCount) * Math.PI * 2;
    const points: Vector3[] = [];
    for (let j = 0; j <= 64; j += 1) {
      const phi = (j / 64) * Math.PI;
      points.push(
        new Vector3(
          Math.sin(phi) * Math.cos(angle) * radius,
          Math.cos(phi) * radius,
          Math.sin(phi) * Math.sin(angle) * radius,
        ),
      );
    }
    grid.add(new Line(new BufferGeometry().setFromPoints(points), gridMaterial));
  }
  group.add(grid);

  // A single brighter equator gives the sphere a readable silhouette.
  const equatorPoints: Vector3[] = [];
  for (let i = 0; i <= 160; i += 1) {
    const angle = (i / 160) * Math.PI * 2;
    equatorPoints.push(
      new Vector3(Math.cos(angle) * radius * 1.002, 0, Math.sin(angle) * radius * 1.002),
    );
  }
  const equatorMaterial = new LineBasicMaterial({
    color: palette.dark.equator,
    transparent: true,
    opacity: palette.dark.equatorOpacity,
    depthWrite: false,
  });
  group.add(new Line(new BufferGeometry().setFromPoints(equatorPoints), equatorMaterial));

  // Sparse point cloud — deliberately small and quiet.
  const pointCount = isMobile ? 320 : 680;
  const positions = new Float32Array(pointCount * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < pointCount; i += 1) {
    const y = 1 - (i / (pointCount - 1)) * 2;
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const r = radius * (1.003 + Math.random() * 0.012);
    positions[i * 3] = Math.cos(theta) * ringRadius * r;
    positions[i * 3 + 1] = y * r;
    positions[i * 3 + 2] = Math.sin(theta) * ringRadius * r;
  }

  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute('position', new BufferAttribute(positions, 3));
  const pointMaterial = new PointsMaterial({
    color: palette.dark.point,
    size: isMobile ? 0.018 : 0.014,
    transparent: true,
    opacity: palette.dark.pointOpacity,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  });
  group.add(new Points(pointGeometry, pointMaterial));

  // A few brighter nodes to create depth.
  const sparkCount = isMobile ? 32 : 64;
  const sparkPositions = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount; i += 1) {
    const index = Math.floor((i * pointCount) / sparkCount);
    const r = radius * 1.018;
    sparkPositions[i * 3] = positions[index * 3] * (r / radius);
    sparkPositions[i * 3 + 1] = positions[index * 3 + 1] * (r / radius);
    sparkPositions[i * 3 + 2] = positions[index * 3 + 2] * (r / radius);
  }
  const sparkGeometry = new BufferGeometry();
  sparkGeometry.setAttribute('position', new BufferAttribute(sparkPositions, 3));
  const sparkMaterial = new PointsMaterial({
    color: palette.dark.spark,
    size: isMobile ? 0.03 : 0.026,
    transparent: true,
    opacity: palette.dark.sparkOpacity,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  });
  group.add(new Points(sparkGeometry, sparkMaterial));

  const pointOnSphere = (latDeg: number, lonDeg: number, r = radius) => {
    const lat = (latDeg * Math.PI) / 180;
    const lon = (lonDeg * Math.PI) / 180;
    return new Vector3(
      Math.cos(lat) * Math.cos(lon) * r,
      Math.sin(lat) * r,
      Math.cos(lat) * Math.sin(lon) * r,
    );
  };

  // Three deliberate arcs: teal, pale, and one warm accent.
  const arcSpecs = [
    {
      start: [-12, -40],
      end: [35, 82],
      colorKey: 'arc1',
      lift: 0.18,
      speed: 0.055,
      offset: 0.04,
    },
    {
      start: [56, 18],
      end: [-26, 148],
      colorKey: 'arc2',
      lift: 0.32,
      speed: 0.044,
      offset: 0.36,
    },
    {
      start: [-46, -98],
      end: [22, 32],
      colorKey: 'arc3',
      lift: 0.4,
      speed: 0.062,
      offset: 0.7,
    },
  ] as const;

  const comets: Comet[] = [];
  const arcBaseMaterials: Array<{ material: LineBasicMaterial; key: ArcColorKey }> = [];

  for (const spec of arcSpecs) {
    const start = pointOnSphere(spec.start[0], spec.start[1]);
    const end = pointOnSphere(spec.end[0], spec.end[1]);
    const mid = start
      .clone()
      .add(end)
      .normalize()
      .multiplyScalar(radius + spec.lift);
    const curve = new QuadraticBezierCurve3(start, mid, end);

    const arcMaterial = new LineBasicMaterial({
      color: palette.dark[spec.colorKey],
      transparent: true,
      opacity: palette.dark.arcOpacity,
      depthWrite: false,
    });
    arcBaseMaterials.push({ material: arcMaterial, key: spec.colorKey });
    group.add(
      new Line(
        new BufferGeometry().setFromPoints(curve.getPoints(isMobile ? 36 : 56)),
        arcMaterial,
      ),
    );

    const tailPositions = new Float32Array(TAIL_SEGMENTS * 3);
    const tailGeometry = new BufferGeometry();
    tailGeometry.setAttribute('position', new BufferAttribute(tailPositions, 3));
    const tailMaterial = new LineBasicMaterial({
      color: palette.dark[spec.colorKey],
      transparent: true,
      opacity: palette.dark.tailOpacity,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const tail = new Line(tailGeometry, tailMaterial);
    group.add(tail);

    const head = new Sprite(makeGlowMaterial(palette.dark[spec.colorKey]));
    head.scale.set(0.11, 0.11, 1);
    group.add(head);

    comets.push({
      curve,
      head,
      tail,
      tailGeometry,
      tailPositions,
      tailMaterial,
      colorKey: spec.colorKey,
      offset: spec.offset,
      speed: spec.speed,
      tailOpacity: palette.dark.tailOpacity,
      headOpacity: palette.dark.headOpacity,
    });
  }

  // Thin orbital rings with a single moving node each.
  const orbitNodes: OrbitNode[] = [];
  const orbitMaterials: Array<{ material: LineBasicMaterial; key: OrbitColorKey }> = [];

  const addOrbit = (orbitRadius: number, colorKey: OrbitColorKey, speed: number, tilt: number) => {
    const orbit = new Group();
    orbit.rotation.x = tilt;
    orbit.rotation.z = 0.24;

    const ringPoints: Vector3[] = [];
    for (let i = 0; i <= 200; i += 1) {
      const angle = (i / 200) * Math.PI * 2;
      ringPoints.push(
        new Vector3(Math.cos(angle) * orbitRadius, Math.sin(angle) * orbitRadius, 0),
      );
    }
    const ringMaterial = new LineBasicMaterial({
      color: palette.dark[colorKey],
      transparent: true,
      opacity: colorKey === 'orbit1' ? palette.dark.orbit1Opacity : palette.dark.orbit2Opacity,
      depthWrite: false,
    });
    orbitMaterials.push({ material: ringMaterial, key: colorKey });
    orbit.add(new Line(new BufferGeometry().setFromPoints(ringPoints), ringMaterial));

    const node = new Sprite(makeGlowMaterial(palette.dark[colorKey]));
    node.scale.set(0.075, 0.075, 1);
    orbit.add(node);
    group.add(orbit);

    orbitNodes.push({
      node,
      radius: orbitRadius,
      speed,
      offset: Math.random() * Math.PI * 2,
      colorKey,
    });
  };

  addOrbit(radius * 1.18, 'orbit1', 0.16, Math.PI / 2.35);
  addOrbit(radius * 1.3, 'orbit2', -0.11, Math.PI / 1.95);

  // Fresnel atmosphere: a clean rim light instead of a flat transparent shell.
  const atmosphereMaterial = new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color(palette.dark.atmosphere) },
          uOpacity: { value: palette.dark.atmosphereOpacity },
          uBase: { value: palette.dark.atmosphereBase },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mvPosition.xyz);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uBase;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
            gl_FragColor = vec4(uColor, uBase + rim * uOpacity);
          }
        `,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  group.add(
    new Mesh(
      new SphereGeometry(radius * 1.025, isMobile ? 48 : 72, isMobile ? 32 : 48),
      atmosphereMaterial,
    ),
  );

  let sparkBaseOpacity: number = palette.dark.sparkOpacity;
  let sparkTwinkle: number = palette.dark.sparkTwinkle;

  const applyTheme = () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const p = palette[theme];
    const blending = p.blending;

    gridMaterial.color.setHex(p.grid);
    gridMaterial.opacity = p.gridOpacity;

    equatorMaterial.color.setHex(p.equator);
    equatorMaterial.opacity = p.equatorOpacity;

    pointMaterial.color.setHex(p.point);
    pointMaterial.opacity = p.pointOpacity;
    pointMaterial.size = theme === 'light' ? (isMobile ? 0.026 : 0.021) : (isMobile ? 0.018 : 0.014);
    pointMaterial.blending = blending;
    pointMaterial.needsUpdate = true;

    sparkMaterial.color.setHex(p.spark);
    sparkMaterial.size = theme === 'light' ? (isMobile ? 0.04 : 0.034) : (isMobile ? 0.03 : 0.026);
    sparkBaseOpacity = p.sparkOpacity;
    sparkTwinkle = p.sparkTwinkle;
    sparkMaterial.blending = blending;
    sparkMaterial.needsUpdate = true;

    arcBaseMaterials.forEach(({ material, key }) => {
      material.color.setHex(p[key]);
      material.opacity = p.arcOpacity;
      material.blending = blending;
      material.needsUpdate = true;
    });

    comets.forEach((comet) => {
      const color = p[comet.colorKey];
      comet.tailMaterial.color.setHex(color);
      comet.tailMaterial.blending = blending;
      comet.tailMaterial.needsUpdate = true;
      comet.head.material.color.setHex(color);
      comet.head.material.blending = blending;
      comet.head.material.needsUpdate = true;
      comet.tailOpacity = p.tailOpacity;
      comet.headOpacity = p.headOpacity;
    });

    orbitMaterials.forEach(({ material, key }) => {
      material.color.setHex(p[key]);
      material.opacity = key === 'orbit1' ? p.orbit1Opacity : p.orbit2Opacity;
      material.blending = blending;
      material.needsUpdate = true;
    });

    orbitNodes.forEach((orbit) => {
      orbit.node.material.color.setHex(p[orbit.colorKey]);
      orbit.node.material.blending = blending;
      orbit.node.material.needsUpdate = true;
    });

    atmosphereMaterial.uniforms.uColor.value.setHex(p.atmosphere);
    atmosphereMaterial.uniforms.uOpacity.value = p.atmosphereOpacity;
    atmosphereMaterial.uniforms.uBase.value = p.atmosphereBase;
    atmosphereMaterial.blending = blending;
    atmosphereMaterial.needsUpdate = true;

    if (reduceMotion) renderer.render(scene, camera);
  };

  const targetPointer = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };

  hero?.addEventListener(
    'pointermove',
    (event) => {
      const rect = hero.getBoundingClientRect();
      targetPointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetPointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    },
    { passive: true },
  );

  let inView = true;
  let frame = 0;
  let elapsed = 0;
  let lastTime = performance.now();
  const introStart = lastTime;
  const introDuration = reduceMotion ? 0 : 2400;
  let baseZ = 6.1;

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const halfFov = (36 * Math.PI) / 360;
    baseZ =
      (radius / Math.tan(halfFov)) / Math.max(0.58, Math.min(1, camera.aspect)) * 1.12;
  };

  const temp = new Vector3();

  const draw = () => {
    frame = 0;
    if (!inView || document.hidden) return;

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    elapsed += delta;

    pointer.x += (targetPointer.x - pointer.x) * Math.min(1, delta * 2.4);
    pointer.y += (targetPointer.y - pointer.y) * Math.min(1, delta * 2.4);

    const intro = introDuration
      ? 1 - Math.pow(1 - Math.min(1, (now - introStart) / introDuration), 3)
      : 1;
    const breathe = Math.sin(elapsed * 0.22) * 0.24;
    const targetZ = baseZ + breathe;
    camera.position.z = baseZ + 1.35 + (targetZ - baseZ - 1.35) * intro;
    camera.position.x = pointer.x * 0.2;
    camera.position.y = 0.06 - pointer.y * 0.13;
    camera.fov = 36 + Math.sin(elapsed * 0.18) * 0.9;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);

    group.rotation.y += delta * 0.075;
    group.rotation.x = 0.1 + pointer.y * 0.06;
    group.rotation.z = -0.04 + pointer.x * 0.045;
    group.position.y = Math.sin(elapsed * 0.32) * 0.012;

    sparkMaterial.opacity = sparkBaseOpacity + Math.sin(elapsed * 1.35) * sparkTwinkle;

    for (const comet of comets) {
      const progress = 0.07 + ((elapsed * comet.speed + comet.offset) % 0.86);
      const edge = Math.sin(((progress - 0.07) / 0.86) * Math.PI);

      for (let i = 0; i < TAIL_SEGMENTS; i += 1) {
        const t = Math.max(0.001, progress - 0.13 * (1 - i / (TAIL_SEGMENTS - 1)));
        comet.curve.getPointAt(t, temp);
        comet.tailPositions[i * 3] = temp.x;
        comet.tailPositions[i * 3 + 1] = temp.y;
        comet.tailPositions[i * 3 + 2] = temp.z;
      }
      comet.tailGeometry.attributes.position.needsUpdate = true;
      comet.tailMaterial.opacity = comet.tailOpacity * (0.17 + edge * 0.83);

      comet.curve.getPointAt(progress, temp);
      comet.head.position.copy(temp);
      const headScale = 0.065 + edge * 0.065;
      comet.head.scale.set(headScale, headScale, 1);
      comet.head.material.opacity = comet.headOpacity * (0.4 + edge * 0.6);
    }

    for (const orbit of orbitNodes) {
      const angle = elapsed * orbit.speed + orbit.offset;
      orbit.node.position.set(
        Math.cos(angle) * orbit.radius,
        Math.sin(angle) * orbit.radius,
        0,
      );
    }

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

  applyTheme();
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

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

function createGlowTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.22, 'rgba(255,255,255,0.75)');
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.18)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}