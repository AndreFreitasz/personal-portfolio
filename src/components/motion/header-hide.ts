import { prefersReducedMotion } from '../../lib/motion-prefs';

/** Abaixo deste scroll o header permanece sempre visível (topo da página). */
export const HEADER_TOP_ZONE = 72;
/** Movimento mínimo para trocar de estado, evitando tremor em micro-scrolls. */
export const HEADER_SCROLL_DELTA = 6;

/**
 * Decide se o header deve ficar escondido: some ao descer a página e
 * reaparece assim que o usuário começa a subir.
 */
export function nextHeaderHidden(hidden: boolean, previousY: number, currentY: number): boolean {
  if (currentY <= HEADER_TOP_ZONE) return false;
  const movement = currentY - previousY;
  if (movement > HEADER_SCROLL_DELTA) return true;
  if (movement < -HEADER_SCROLL_DELTA) return false;
  return hidden;
}

export function bindHeaderHide(root: ParentNode = document): () => void {
  const header = root.querySelector<HTMLElement>('[data-header]');
  if (!header) return () => {};

  let hidden = false;
  let previousY = window.scrollY;
  let rafId = 0;

  const apply = () => {
    rafId = 0;
    const currentY = window.scrollY;
    const next = prefersReducedMotion() ? false : nextHeaderHidden(hidden, previousY, currentY);
    previousY = currentY;
    if (next === hidden) return;
    hidden = next;
    header.dataset.hidden = hidden ? 'true' : 'false';
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
    header.dataset.hidden = 'false';
  };
}
