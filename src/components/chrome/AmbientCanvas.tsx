import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion-prefs';

const PARTICLE_COUNT = 216;
const CELL = 130;
const MOUSE_RADIUS = 190;
const MOUSE_FORCE = 46;

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hot: boolean;
  ph: number;
  sp: number;
}

export default function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (prefersReducedMotion()) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const dots: Dot[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r: 0.5 + Math.random() * 2.1,
      hot: Math.random() < 0.22,
      ph: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 1.4,
    }));

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let mouseX = -999;
    let mouseY = -999;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let frame = 0;
    let rafId = 0;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;
      const points = dots.map((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > 1) d.vx *= -1;
        if (d.y < 0 || d.y > 1) d.vy *= -1;
        let px = d.x * width;
        let py = d.y * height;
        const dx = px - mouseX;
        const dy = py - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          px += (dx / (dist || 1)) * force;
          py += (dy / (dist || 1)) * force;
        }
        return { px, py, d, near: dist < MOUSE_RADIUS };
      });

      const grid = new Map<string, number[]>();
      points.forEach((p, i) => {
        const key = `${(p.px / CELL) | 0}:${(p.py / CELL) | 0}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(i);
      });

      ctx.lineWidth = 1;
      grid.forEach((bucket, key) => {
        const [cx, cy] = key.split(':').map(Number);
        const neighbors: number[][] = [];
        for (let ox = 0; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            if (ox === 0 && oy < 0) continue;
            const b = grid.get(`${cx + ox}:${cy + oy}`);
            if (b) neighbors.push(b);
          }
        }
        bucket.forEach((i) => {
          neighbors.forEach((b) =>
            b.forEach((j) => {
              if (j <= i) return;
              const dd = Math.hypot(points[i].px - points[j].px, points[i].py - points[j].py);
              if (dd < CELL) {
                ctx.strokeStyle = `rgba(211,242,78,${(0.05 * (1 - dd / CELL)).toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(points[i].px, points[i].py);
                ctx.lineTo(points[j].px, points[j].py);
                ctx.stroke();
              }
            }),
          );
        });
      });

      points.forEach((p) => {
        const base = p.d.hot ? '255,156,123' : '211,242,78';
        const pulse = 0.72 + 0.28 * Math.sin(frame * 0.018 * p.d.sp + p.d.ph);
        ctx.fillStyle = `rgba(${base},${((p.near ? 0.55 : 0.2) * pulse).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.d.r * (p.near ? 1.7 : 1) * pulse, 0, Math.PI * 2);
        ctx.fill();
        if (p.near) {
          ctx.strokeStyle = `rgba(${base},.18)`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.d.r * 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      if (mouseX > -500) {
        const ringRadius = 150 + Math.sin(frame * 0.05) * 12;
        ctx.strokeStyle = 'rgba(211,242,78,.07)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,156,123,.05)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, ringRadius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90" />;
}
