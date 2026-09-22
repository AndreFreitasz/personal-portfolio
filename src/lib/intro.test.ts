import { afterEach, describe, expect, it } from 'vitest';
import { INTRO_DURATION_MS, introAlreadySeen, markIntroSeen } from './intro';

afterEach(() => {
  window.sessionStorage.clear();
});

describe('intro session flag', () => {
  it('exposes the intro duration used by the splash animation', () => {
    expect(INTRO_DURATION_MS).toBe(2400);
  });

  it('is not seen before markIntroSeen is called', () => {
    expect(introAlreadySeen()).toBe(false);
  });

  it('is seen after markIntroSeen is called', () => {
    markIntroSeen();
    expect(introAlreadySeen()).toBe(true);
  });
});
