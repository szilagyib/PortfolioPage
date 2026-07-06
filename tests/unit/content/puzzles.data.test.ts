import { describe, it, expect } from 'vitest';
import { puzzleForDoor } from '@/content/puzzles.data';
import { isSolved, rotateCellAt } from '@/domain/conduit-puzzle';
import type { Puzzle } from '@/domain/conduit-puzzle';
import type { DoorId } from '@/domain/door';

const DOORS: ReadonlyArray<Exclude<DoorId, 'fortune'>> = [
  'about',
  'elsewhere',
  'ai',
  'leadership',
  'engineering',
];

/** Brute-force solver: try every combination of rotations until isSolved. */
function findSolution(start: Puzzle): boolean {
  const rotatable: Array<[number, number]> = [];
  for (let r = 0; r < start.rows; r++) {
    for (let c = 0; c < start.cols; c++) {
      if (start.cells[r]![c]!.shape !== 'empty') rotatable.push([r, c]);
    }
  }
  const total = 4 ** rotatable.length;
  for (let combo = 0; combo < total; combo++) {
    let p = start;
    let v = combo;
    for (const [r, c] of rotatable) {
      const turns = v % 4;
      v = Math.floor(v / 4);
      for (let t = 0; t < turns; t++) p = rotateCellAt(p, r, c);
    }
    if (isSolved(p)) return true;
  }
  return false;
}

describe('puzzleForDoor', () => {
  it.each(DOORS)('returns a solvable puzzle for %s', (door) => {
    const p = puzzleForDoor(door);
    expect(findSolution(p)).toBe(true);
  });

  it.each(DOORS)('returns an *unsolved* puzzle for %s (player has work to do)', (door) => {
    const p = puzzleForDoor(door);
    expect(isSolved(p)).toBe(false);
  });

  it('returns different starting layouts for different doors', () => {
    const a = puzzleForDoor('about');
    const b = puzzleForDoor('leadership');
    const same = JSON.stringify(a.cells) === JSON.stringify(b.cells);
    expect(same).toBe(false);
  });

  it('returns the same puzzle each call for the same door (deterministic)', () => {
    const a1 = puzzleForDoor('elsewhere');
    const a2 = puzzleForDoor('elsewhere');
    expect(a1).toEqual(a2);
  });
});
