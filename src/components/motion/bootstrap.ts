import { bindMagnetic } from './magnetic';
import { bindParallax } from './parallax';
import { setupReveal } from './reveal';

let cleanup: (() => void) | null = null;

// astro:page-load dispara tanto no load inicial quanto após cada navegação
// do ClientRouter — um único listener cobre os dois casos.
document.addEventListener('astro:page-load', () => {
  cleanup?.();
  const cleanups = [bindMagnetic(), bindParallax(), setupReveal()];
  cleanup = () => cleanups.forEach((fn) => fn());
});
