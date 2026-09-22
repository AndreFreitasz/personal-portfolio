import { describe, expect, it } from 'vitest';
import { parallaxOffset } from './parallax';

describe('parallaxOffset', () => {
  it('matches the prototype formula (top+height/2-vh/2) * -speed', () => {
    expect(parallaxOffset(100, 200, 800, 0.05)).toBeCloseTo((100 + 100 - 400) * -0.05);
  });

  it('is zero when the element center matches the viewport center', () => {
    expect(parallaxOffset(300, 200, 800, 0.06)).toBeCloseTo(0);
  });

  it('flips sign correctly above vs. below the viewport center', () => {
    expect(parallaxOffset(0, 0, 800, 0.05)).toBeGreaterThan(0);
    expect(parallaxOffset(800, 0, 800, 0.05)).toBeLessThan(0);
  });
});
