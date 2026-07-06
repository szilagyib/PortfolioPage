import { describe, it, expect } from 'vitest';
import {
  getEffectiveConnections,
  rotatePiece,
  rotateCellAt,
  isSolved,
  litCells,
  type Puzzle,
  type ConduitPiece,
} from '@/domain/conduit-puzzle';

const empty: ConduitPiece = { shape: 'empty', rotation: 0 };
const hStraight: ConduitPiece = { shape: 'straight', rotation: 0 };  // E+W
const vStraight: ConduitPiece = { shape: 'straight', rotation: 1 };  // N+S
const cornerES: ConduitPiece = { shape: 'corner', rotation: 0 };     // E+S
const cornerSW: ConduitPiece = { shape: 'corner', rotation: 1 };     // S+W
const cornerNW: ConduitPiece = { shape: 'corner', rotation: 2 };     // N+W
const cornerNE: ConduitPiece = { shape: 'corner', rotation: 3 };     // N+E

function mkPuzzle(cells: ConduitPiece[][]): Puzzle {
  return {
    rows: cells.length,
    cols: cells[0]!.length,
    cells,
    sourceRow: 1,
    destinationRow: 1,
  };
}

describe('getEffectiveConnections', () => {
  it('returns base connections at rotation 0', () => {
    expect(getEffectiveConnections({ shape: 'straight', rotation: 0 }))
      .toEqual([false, true, false, true]);
  });

  it('rotates straight 90° → vertical', () => {
    expect(getEffectiveConnections({ shape: 'straight', rotation: 1 }))
      .toEqual([true, false, true, false]);
  });

  it('rotates corner through all four orientations', () => {
    // base corner is E+S
    expect(getEffectiveConnections({ shape: 'corner', rotation: 0 }))
      .toEqual([false, true, true, false]);
    expect(getEffectiveConnections({ shape: 'corner', rotation: 1 }))
      .toEqual([false, false, true, true]);   // S+W
    expect(getEffectiveConnections({ shape: 'corner', rotation: 2 }))
      .toEqual([true, false, false, true]);   // N+W
    expect(getEffectiveConnections({ shape: 'corner', rotation: 3 }))
      .toEqual([true, true, false, false]);   // N+E
  });

  it('cross is rotation-invariant', () => {
    for (const r of [0, 1, 2, 3] as const) {
      expect(getEffectiveConnections({ shape: 'cross', rotation: r }))
        .toEqual([true, true, true, true]);
    }
  });
});

describe('rotatePiece', () => {
  it('advances rotation by 1, wrapping 3 → 0', () => {
    expect(rotatePiece({ shape: 'straight', rotation: 0 }).rotation).toBe(1);
    expect(rotatePiece({ shape: 'straight', rotation: 3 }).rotation).toBe(0);
  });
});

describe('rotateCellAt', () => {
  it('returns a new puzzle with the cell rotated', () => {
    const p = mkPuzzle([
      [empty, empty],
      [hStraight, empty],
    ]);
    const next = rotateCellAt(p, 1, 0);
    expect(next.cells[1]![0]).toEqual({ shape: 'straight', rotation: 1 });
    expect(p.cells[1]![0]).toEqual({ shape: 'straight', rotation: 0 });  // immutable
  });
});

describe('isSolved', () => {
  it('returns true for a single-row direct path of straights', () => {
    const p = mkPuzzle([
      [empty, empty, empty, empty],
      [hStraight, hStraight, hStraight, hStraight],
      [empty, empty, empty, empty],
    ]);
    expect(isSolved(p)).toBe(true);
  });

  it('returns false when a piece is rotated away from the path', () => {
    const p = mkPuzzle([
      [empty, empty, empty, empty],
      [hStraight, vStraight, hStraight, hStraight],
      [empty, empty, empty, empty],
    ]);
    expect(isSolved(p)).toBe(false);
  });

  it('returns false if the entry cell has no west opening', () => {
    const p = mkPuzzle([
      [empty, empty],
      [vStraight, hStraight],
      [empty, empty],
    ]);
    expect(isSolved(p)).toBe(false);
  });

  it('handles a path with a bend (up-and-over)', () => {
    // Path: (1,0) E+W → (1,1) corner N+W → (0,1) corner E+S → (0,2) corner S+W → (1,2) corner N+E → (1,3) E+W
    const p = mkPuzzle([
      [empty,    cornerES, cornerSW, empty   ],
      [hStraight, cornerNW, cornerNE, hStraight],
      [empty,    empty,    empty,    empty   ],
    ]);
    expect(isSolved(p)).toBe(true);
  });
});

describe('litCells', () => {
  it('marks only cells connected to the source', () => {
    const p = mkPuzzle([
      [empty, empty, empty],
      [hStraight, vStraight, hStraight],
      [empty, empty, empty],
    ]);
    const lit = litCells(p);
    expect(lit.has('1,0')).toBe(true);
    expect(lit.has('1,1')).toBe(false);
    expect(lit.has('1,2')).toBe(false);
  });

  it('marks all cells along a fully solved path', () => {
    const p = mkPuzzle([
      [empty, empty, empty, empty],
      [hStraight, hStraight, hStraight, hStraight],
      [empty, empty, empty, empty],
    ]);
    const lit = litCells(p);
    expect(lit.size).toBe(4);
    expect(lit.has('1,3')).toBe(true);
  });
});
