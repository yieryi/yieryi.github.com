type Point = {
  x: number;
  y: number;
  time: number;
};

export interface Trail {
  resize: () => void;
  update: (time: number, theme: 'light' | 'dark') => void;
  destroy: () => void;
}

const LIFETIME = 1100;

export function createTrail(canvas: HTMLCanvasElement, hero: HTMLElement): Trail {
  const context = canvas.getContext('2d');
  const points: Point[] = [];
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastPoint = 0;
  let enabled = finePointer && !reducedMotion;

  const onPointerMove = (event: PointerEvent) => {
    if (!enabled || event.pointerType !== 'mouse') return;
    const rect = hero.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

    const now = performance.now();
    const previous = points[points.length - 1];
    if (previous) {
      const distance = Math.hypot(x - previous.x, y - previous.y);
      if (distance < 3 && now - lastPoint < 30) return;
    }

    lastPoint = now;
    points.push({ x, y, time: now });
    if (points.length > 48) points.shift();
  };

  const onPointerLeave = () => {
    points.length = 0;
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const update = (time: number, theme: 'light' | 'dark') => {
    if (!context) return;
    if (points.length && time - points[0].time > LIFETIME) {
      while (points.length && time - points[0].time > LIFETIME) points.shift();
    }
    if (!points.length) {
      context.clearRect(0, 0, width, height);
      return;
    }

    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalCompositeOperation = theme === 'dark' ? 'lighter' : 'source-over';

    const baseColor = theme === 'dark' ? '56, 232, 198' : '8, 107, 94';

    for (let index = 1; index < points.length; index += 1) {
      const from = points[index - 1];
      const to = points[index];
      const age = Math.max(0, time - to.time);
      const alpha = Math.pow(Math.max(0, 1 - age / LIFETIME), 1.8);
      if (alpha <= 0.01) continue;

      for (const offset of [-4, 0, 4]) {
        context.beginPath();
        context.moveTo(from.x, from.y + offset);
        context.quadraticCurveTo(
          (from.x + to.x) / 2,
          (from.y + to.y) / 2 + offset * 0.8,
          to.x,
          to.y + offset,
        );
        context.strokeStyle = `rgba(${baseColor}, ${offset === 0 ? alpha * 0.72 : alpha * 0.22})`;
        context.lineWidth = offset === 0 ? 3.2 * alpha + 0.8 : 1.4 * alpha + 0.35;
        context.stroke();
      }
    }
  };

  const destroy = () => {
    hero.removeEventListener('pointermove', onPointerMove);
    hero.removeEventListener('pointerleave', onPointerLeave);
    points.length = 0;
    context?.clearRect(0, 0, width, height);
  };

  if (enabled) {
    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave);
  } else {
    canvas.style.display = 'none';
  }

  resize();

  return { resize, update, destroy };
}