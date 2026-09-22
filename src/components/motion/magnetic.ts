export function magneticOffset(
  cursor: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number },
  strength = 0.18,
): { dx: number; dy: number } {
  const centerX = box.left + box.width / 2;
  const centerY = box.top + box.height / 2;
  return {
    dx: (cursor.x - centerX) * strength,
    dy: (cursor.y - centerY) * strength,
  };
}

export function bindMagnetic(root: ParentNode = document): () => void {
  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-magnetic]'));
  const bound = elements.map((el) => {
    el.style.willChange = 'transform';
    const onMove = (e: MouseEvent) => {
      const { dx, dy } = magneticOffset({ x: e.clientX, y: e.clientY }, el.getBoundingClientRect());
      el.style.transition = 'transform .12s linear';
      el.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0)`;
    };
    const onLeave = () => {
      el.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)';
      el.style.transform = 'translate3d(0,0,0)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return { el, onMove, onLeave };
  });

  return () => {
    bound.forEach(({ el, onMove, onLeave }) => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    });
  };
}
