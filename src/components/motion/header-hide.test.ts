import { describe, expect, it } from 'vitest';
import { HEADER_SCROLL_DELTA, HEADER_TOP_ZONE, nextHeaderHidden } from './header-hide';

describe('nextHeaderHidden', () => {
  it('keeps the header visible inside the top zone', () => {
    expect(nextHeaderHidden(true, HEADER_TOP_ZONE + 400, HEADER_TOP_ZONE)).toBe(false);
    expect(nextHeaderHidden(true, 40, 0)).toBe(false);
  });

  it('hides the header while scrolling down past the top zone', () => {
    expect(nextHeaderHidden(false, 200, 200 + HEADER_SCROLL_DELTA + 1)).toBe(true);
  });

  it('reveals the header as soon as the user scrolls up', () => {
    expect(nextHeaderHidden(true, 600, 600 - HEADER_SCROLL_DELTA - 1)).toBe(false);
  });

  it('ignores micro movements and preserves the current state', () => {
    expect(nextHeaderHidden(true, 600, 600 + HEADER_SCROLL_DELTA)).toBe(true);
    expect(nextHeaderHidden(false, 600, 600 - HEADER_SCROLL_DELTA)).toBe(false);
  });
});
