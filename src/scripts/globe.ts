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

type Comet = {
  curve: QuadraticBezierCurve3;
  head: Sprite;
  tail: Line;
  tailGeometry: BufferGeometry;
  tailPositions: Float32Array;
  tailMaterial: LineBasicMaterial;
  offset: number;
  speed: number;
};

type OrbitNode = {
  node: Sprite;
  radius: number;
  speed: number;
  offset: number;
};

const TAIL_SEGMENTS = 16;

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
  const baseColor = 0x38e8c6;
  const lightColor = 0xd6fff8;
  const warmColor = 0xffb86b;

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
    color: baseColor,
    transparent: true,
    opacity: 0.055,
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
  group.add(
    new Line(
      new BufferGeometry().setFromPoints(equatorPoints),
      new LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    ),
  );

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
    color: lightColor,
    size: isMobile ? 0.018 : 0.014,
    transparent: true,
    opacity: 0.62,
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
    color: 0xffffff,
    size: isMobile ? 0.03 : 0.026,
    transparent: true,
    opacity: 0.9,
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
      color: baseColor,
      lift: 0.18,
      speed: 0.055,
      offset: 0.04,
    },
    {
      start: [56, 18],
      end: [-26, 148],
      color: lightColor,
      lift: 0.32,
      speed: 0.044,
      offset: 0.36,
    },
    {
      start: [-46, -98],
      end: [22, 32],
      color: warmColor,
      lift: 0.4,
      speed: 0.062,
      offset: 0.7,
    },
  ] as const;

  const comets: Comet[] = [];

  for (const spec of arcSpecs) {
    const start = pointOnSphere(spec.start[0], spec.start[1]);
    const end = pointOnSphere(spec.end[0], spec.end[1]);
    const mid = start
      .clone()
      .add(end)
      .normalize()
      .multiplyScalar(radius + spec.lift);
    const curve = new QuadraticBezierCurve3(start, mid, end);

    group.add(
      new Line(
        new BufferGeometry().setFromPoints(curve.getPoints(isMobile ? 36 : 56)),
        new LineBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: 0.24,
          depthWrite: false,
        }),
      ),
    );

    const tailPositions = new Float32Array(TAIL_SEGMENTS * 3);
    const tailGeometry = new BufferGeometry();
    tailGeometry.setAttribute('position', new BufferAttribute(tailPositions, 3));
    const tailMaterial = new LineBasicMaterial({
      color: spec.color,
      transparent: true,
      opacity: 0.7,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const tail = new Line(tailGeometry, tailMaterial);
    group.add(tail);

    const head = new Sprite(makeGlowMaterial(spec.color));
    head.scale.set(0.11, 0.11, 1);
    group.add(head);

    comets.push({
      curve,
      head,
      tail,
      tailGeometry,
      tailPositions,
      tailMaterial,
      offset: spec.offset,
      speed: spec.speed,
    });
  }

  // Thin orbital rings with a single moving node each.
  const orbitNodes: OrbitNode[] = [];

  const addOrbit = (orbitRadius: number, color: number, opacity: number, speed: number, tilt: number) => {
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
    orbit.add(
      new Line(
        new BufferGeometry().setFromPoints(ringPoints),
        new LineBasicMaterial({
          color,
          transparent: true,
          opacity,
          depthWrite: false,
        }),
      ),
    );

    const node = new Sprite(makeGlowMaterial(color));
    node.scale.set(0.075, 0.075, 1);
    orbit.add(node);
    group.add(orbit);

    orbitNodes.push({ node, radius: orbitRadius, speed, offset: Math.random() * Math.PI * 2 });
  };

  addOrbit(radius * 1.18, baseColor, 0.13, 0.16, Math.PI / 2.35);
  addOrbit(radius * 1.3, warmColor, 0.08, -0.11, Math.PI / 1.95);

  // Fresnel atmosphere: a clean rim light instead of a flat transparent shell.
  group.add(
    new Mesh(
      new SphereGeometry(radius * 1.025, isMobile ? 48 : 72, isMobile ? 32 : 48),
      new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color(baseColor) },
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
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
            gl_FragColor = vec4(uColor, rim * 0.24);
          }
        `,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );

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

    sparkMaterial.opacity = 0.72 + Math.sin(elapsed * 1.35) * 0.18;

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
      comet.tailMaterial.opacity = 0.12 + edge * 0.62;

      comet.curve.getPointAt(progress, temp);
      comet.head.position.copy(temp);
      const headScale = 0.065 + edge * 0.065;
      comet.head.scale.set(headScale, headScale, 1);
      comet.head.material.opacity = 0.35 + edge * 0.65;
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