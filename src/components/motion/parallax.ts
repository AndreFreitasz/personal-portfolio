import { prefersReducedMotion } from '../../lib/motion-prefs';

export function parallaxOffset(rectTop: number, rectHeight: number, viewportHeight: number, speed: number): number {
  return (rectTop + rectHeight / 2 - viewportHeight / 2) * -speed;
}

export function bindParallax(root: ParentNode = document): () => void {
  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!elements.length) return () => {};

  let rafId = 0;
  const apply = () => {
    rafId = 0;
    if (prefersReducedMotion()) {
      elements.forEach((el) => {
        el.style.transform = 'translate3d(0,0,0)';
      });
      return;
    }
    const vh = window.innerHeight;
    elements.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax') ?? '0.05');
      const rect = el.getBoundingClientRect();
      const offset = parallaxOffset(rect.top, rect.height, vh, speed);
      el.style.transform = `translate3d(0,${offset.toFixed(1)}px,0)`;
    });
  };

  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(apply);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  apply();

  return () => {
    window.removeEventListener('scroll', onScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}
