import { describe, expect, it } from 'vitest';
import { magneticOffset } from './magnetic';

const box = { left: 0, top: 0, width: 100, height: 40 };

describe('magneticOffset', () => {
  it('is zero at the element center', () => {
    expect(magneticOffset({ x: 50, y: 20 }, box)).toEqual({ dx: 0, dy: 0 });
  });

  it('scales the distance from center by the default strength (0.18)', () => {
    const { dx, dy } = magneticOffset({ x: 150, y: 20 }, box);
    expect(dx).toBeCloseTo((150 - 50) * 0.18);
    expect(dy).toBeCloseTo(0);
  });

  it('accepts a custom strength', () => {
    const squareBox = { left: 0, top: 0, width: 100, height: 100 };
    const { dx, dy } = magneticOffset({ x: 200, y: 200 }, squareBox, 0.5);
    expect(dx).toBeCloseTo((200 - 50) * 0.5);
    expect(dy).toBeCloseTo((200 - 50) * 0.5);
  });
});
