import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion } from './motion-prefs';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('prefersReducedMotion', () => {
  it('returns true when the media query matches', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }) as MediaQueryList);
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when the media query does not match', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    expect(prefersReducedMotion()).toBe(false);
  });
});
