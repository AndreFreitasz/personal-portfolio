import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion-prefs';

const LERP = 0.16;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (prefersReducedMotion()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = -100;
    let y = -100;
    let ringX = -100;
    let ringY = -100;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let rafId = 0;
    const loop = () => {
      ringX += (x - ringX) * LERP;
      ringY += (y - ringY) * LERP;
      dot.style.transform = `translate3d(${x - 3.5}px,${y - 3.5}px,0)`;
      ring.style.transform = `translate3d(${ringX - 16}px,${ringY - 16}px,0)`;
      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <>
      <div
        id="afCursor"
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[130] h-[7px] w-[7px] -translate-x-[100px] -translate-y-[100px] rounded-full bg-volt"
      />
      <div
        id="afRing"
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[130] h-8 w-8 -translate-x-[100px] -translate-y-[100px] rounded-full border border-volt/45 transition-[width,height] duration-200"
      />
    </>
  );
}
