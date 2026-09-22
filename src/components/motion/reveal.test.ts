import { describe, expect, it } from 'vitest';
import { hiddenTransform, lineDelay, resolveDirection } from './reveal';

describe('resolveDirection', () => {
  it('resolves "auto" to left on even indexes and right on odd', () => {
    expect(resolveDirection('auto', 0)).toBe('left');
    expect(resolveDirection('auto', 1)).toBe('right');
  });

  it('passes explicit directions through unchanged', () => {
    expect(resolveDirection('pop', 3)).toBe('pop');
  });
});

describe('hiddenTransform', () => {
  it('matches the exact prototype offsets per direction', () => {
    expect(hiddenTransform('left', 0)).toBe('translate3d(-70px,14px,0) rotate(-1.6deg)');
    expect(hiddenTransform('right', 0)).toBe('translate3d(70px,14px,0) rotate(1.6deg)');
    expect(hiddenTransform('down', 0)).toBe('translate3d(0,-44px,0)');
    expect(hiddenTransform('pop', 0)).toBe('translate3d(0,26px,0) scale(.72)');
    expect(hiddenTransform('up', 0)).toBe('translate3d(0,48px,0)');
  });

  it('resolves "auto" by index parity before computing the offset', () => {
    expect(hiddenTransform('auto', 0)).toBe(hiddenTransform('left', 0));
    expect(hiddenTransform('auto', 1)).toBe(hiddenTransform('right', 1));
  });

  it('collapses to "none" under reduced motion regardless of direction', () => {
    expect(hiddenTransform('left', 0, true)).toBe('none');
    expect(hiddenTransform('pop', 2, true)).toBe('none');
  });
});

describe('lineDelay', () => {
  it('matches the prototype stagger formula i*0.09+0.06', () => {
    expect(lineDelay(0)).toBeCloseTo(0.06);
    expect(lineDelay(1)).toBeCloseTo(0.15);
    expect(lineDelay(2)).toBeCloseTo(0.24);
  });
});
