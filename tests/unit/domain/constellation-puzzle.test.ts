import { describe, it, expect } from 'vitest';
import {
  initial,
  tryClick,
  isClicked,
  isSegmentLit,
  isSolved,
  type Constellation,
} from '@/domain/constellation-puzzle';
import { constellationFor } from '@/content/constellations.data';

const four: Constellation = {
  doorId: 'about',
  name: 'TestConstellation',
  stars: [
    { x: 50, y: 18 },
    { x: 22, y: 50 },
    { x: 50, y: 82 },
    { x: 78, y: 50 },
  ],
};

describe('constellation-puzzle', () => {
  it('starts with no stars lit and is not solved', () => {
    const state = initial(four);
    expect(state.clicked).toEqual([]);
    expect(isSolved(state)).toBe(false);
    expect(isClicked(state, 0)).toBe(false);
  });

  it('lights a star on click regardless of click order', () => {
    let s = initial(four);
    s = tryClick(s, 2); // out-of-data-order click still lights
    expect(isClicked(s, 2)).toBe(true);
    s = tryClick(s, 0);
    expect(isClicked(s, 0)).toBe(true);
    expect(isSolved(s)).toBe(false);
  });

  it('ignores duplicate clicks (already-lit star)', () => {
    let s = initial(four);
    s = tryClick(s, 1);
    const beforeDup = s;
    s = tryClick(s, 1);
    expect(s).toBe(beforeDup);
  });

  it('ignores clicks on out-of-range indices', () => {
    const s0 = initial(four);
    expect(tryClick(s0, -1)).toBe(s0);
    expect(tryClick(s0, 99)).toBe(s0);
  });

  it('lights a segment when both endpoints are clicked', () => {
    let s = initial(four);
    expect(isSegmentLit(s, 0, 1)).toBe(false);
    s = tryClick(s, 0);
    expect(isSegmentLit(s, 0, 1)).toBe(false);
    s = tryClick(s, 1);
    expect(isSegmentLit(s, 0, 1)).toBe(true);
  });

  it('reports solved once every star is lit, in any click order', () => {
    let s = initial(four);
    // Click in scrambled order: 2, 0, 3, 1
    s = tryClick(s, 2);
    s = tryClick(s, 0);
    s = tryClick(s, 3);
    s = tryClick(s, 1);
    expect(s.clicked).toEqual([2, 0, 3, 1]);
    expect(isSolved(s)).toBe(true);
  });

  it('provides one constellation per non-fortune door, each with ≥ 3 stars and valid coords', () => {
    const ids = ['about', 'ai', 'leadership', 'engineering', 'elsewhere'] as const;
    for (const id of ids) {
      const c = constellationFor(id);
      expect(c.doorId).toBe(id);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.stars.length).toBeGreaterThanOrEqual(3);
      const set = new Set(c.stars.map((s) => `${s.x},${s.y}`));
      expect(set.size).toBe(c.stars.length);
      for (const s of c.stars) {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.x).toBeLessThanOrEqual(100);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeLessThanOrEqual(100);
      }
    }
  });
});
