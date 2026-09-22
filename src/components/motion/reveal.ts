import { INTRO_DURATION_MS, introAlreadySeen } from '../../lib/intro';
import { prefersReducedMotion } from '../../lib/motion-prefs';

export type RevealDirection = 'left' | 'right' | 'down' | 'pop' | 'up' | 'auto';
type ResolvedDirection = Exclude<RevealDirection, 'auto'>;

export function resolveDirection(dir: RevealDirection, index: number): ResolvedDirection {
  if (dir !== 'auto') return dir;
  return index % 2 ? 'right' : 'left';
}

export function hiddenTransform(dir: RevealDirection, index: number, reducedMotion = false): string {
  if (reducedMotion) return 'none';
  switch (resolveDirection(dir, index)) {
    case 'left':
      return 'translate3d(-70px,14px,0) rotate(-1.6deg)';
    case 'right':
      return 'translate3d(70px,14px,0) rotate(1.6deg)';
    case 'down':
      return 'translate3d(0,-44px,0)';
    case 'pop':
      return 'translate3d(0,26px,0) scale(.72)';
    default:
      return 'translate3d(0,48px,0)';
  }
}

export function lineDelay(index: number): number {
  return index * 0.09 + 0.06;
}

const EASE = 'cubic-bezier(.2,1.25,.32,1)';
const FALLBACK_MS = 1500;

function showEl(el: HTMLElement): void {
  const reduced = prefersReducedMotion();
  el.style.transition = `opacity .7s cubic-bezier(.16,1,.3,1), transform .9s ${EASE}`;
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.querySelectorAll<HTMLElement>('[data-line] > span').forEach((span, i) => {
    span.style.transition = `transform 1s ${EASE} ${lineDelay(i)}s`;
    span.style.transform = reduced ? 'none' : 'translateY(0) rotate(0deg)';
  });
  Array.from(el.querySelectorAll<HTMLElement>('[data-anim]')).forEach((unit, i) => {
    const delay = 0.16 + i * 0.075;
    unit.style.transition = `opacity .6s cubic-bezier(.16,1,.3,1) ${delay}s, transform .95s ${EASE} ${delay}s`;
    unit.style.opacity = '1';
    unit.style.transform = 'none';
  });
}

function hideEl(el: HTMLElement): void {
  const reduced = prefersReducedMotion();
  el.style.opacity = '0';
  el.style.transform = reduced ? 'none' : 'translate3d(0,34px,0)';
  el.querySelectorAll<HTMLElement>('[data-line] > span').forEach((span) => {
    span.style.transform = reduced ? 'none' : 'translateY(108%) rotate(3deg)';
  });
  Array.from(el.querySelectorAll<HTMLElement>('[data-anim]')).forEach((unit, i) => {
    unit.style.willChange = 'transform, opacity';
    unit.style.opacity = '0';
    const dir = (unit.getAttribute('data-anim') as RevealDirection) ?? 'up';
    unit.style.transform = hiddenTransform(dir, i, reduced);
  });
}

export function setupReveal(root: ParentNode = document): () => void {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!nodes.length || !('IntersectionObserver' in window)) {
    nodes.forEach((n) => showEl(n));
    return () => {};
  }

  // heroDelay mantém o reveal sincronizado com a duração real da intro:
  // curta (80ms) quando a intro já rodou nesta sessão, cheia (dur-400) na primeira visita.
  const heroDelayMs = introAlreadySeen() ? 80 : Math.max(200, INTRO_DURATION_MS - 400);

  nodes.forEach((el) => hideEl(el));
  const pending = new Set(nodes);
  let decided = false;
  let canReveal = false;

  // Every window.setTimeout id scheduled in this function is tracked here so
  // the returned cleanup can clear all of them — a stale timeout firing after
  // an astro:page-load teardown would otherwise mutate torn-down DOM nodes.
  const pendingTimeouts = new Set<ReturnType<typeof window.setTimeout>>();
  const schedule = (fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      pendingTimeouts.delete(id);
      fn();
    }, delay);
    pendingTimeouts.add(id);
    return id;
  };

  schedule(() => {
    canReveal = true;
  }, heroDelayMs);

  const revealIfPending = (el: HTMLElement) => {
    showEl(el);
    pending.delete(el);
  };

  const onScroll = () => {
    if (!canReveal || !pending.size) return;
    Array.from(pending).forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.6) revealIfPending(el);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const showAllStaggered = () => nodes.forEach((n, i) => schedule(() => revealIfPending(n), i * 140));

  const io = new IntersectionObserver(
    (entries) => {
      if (!decided) {
        decided = true;
        const offscreen = entries.filter((e) => !e.isIntersecting);
        if (!offscreen.length) {
          io.disconnect();
          schedule(showAllStaggered, heroDelayMs);
          return;
        }
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const delay = e.target === nodes[0] ? heroDelayMs : 0;
          schedule(() => revealIfPending(e.target as HTMLElement), delay);
          io.unobserve(e.target);
        });
        return;
      }
      entries.forEach((e) => {
        if (e.isIntersecting) {
          revealIfPending(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -40% 0px', threshold: 0.05 },
  );
  nodes.forEach((el) => io.observe(el));

  schedule(() => {
    if (!decided) {
      decided = true;
      io.disconnect();
      showAllStaggered();
    }
  }, FALLBACK_MS);

  return () => {
    pendingTimeouts.forEach((id) => window.clearTimeout(id));
    pendingTimeouts.clear();
    window.removeEventListener('scroll', onScroll);
    io.disconnect();
  };
}
