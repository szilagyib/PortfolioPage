import type { DoorId } from '@/domain/door';
import type {
  ConduitPiece,
  ConduitRotation,
  Puzzle,
} from '@/domain/conduit-puzzle';

/**
 * Each door has its own solved layout, so each puzzle is a different shape.
 * The scramble offset is still seeded per door so the *starting* state never
 * accidentally matches the solved state.
 */
interface PuzzleTemplate {
  readonly rows: number;
  readonly cols: number;
  readonly sourceRow: number;
  readonly destinationRow: number;
  readonly solvedCells: readonly (readonly ConduitPiece[])[];
}

const _ = { shape: 'empty',   rotation: 0 } as const satisfies ConduitPiece;
const H = { shape: 'straight', rotation: 0 } as const satisfies ConduitPiece;  // E + W
const V = { shape: 'straight', rotation: 1 } as const satisfies ConduitPiece;  // N + S
const ES = { shape: 'corner', rotation: 0 } as const satisfies ConduitPiece;   // E + S  (┌)
const SW = { shape: 'corner', rotation: 1 } as const satisfies ConduitPiece;   // S + W  (┐)
const NW = { shape: 'corner', rotation: 2 } as const satisfies ConduitPiece;   // N + W  (┘)
const NE = { shape: 'corner', rotation: 3 } as const satisfies ConduitPiece;   // N + E  (└)

const BASE = {
  rows: 3,
  cols: 4,
  sourceRow: 1,
  destinationRow: 1,
} as const;

/** about — straight line. Gentle on-ramp; this is the door most visitors open first. */
const ABOUT_TEMPLATE: PuzzleTemplate = {
  ...BASE,
  solvedCells: [
    [_, _, _, _],
    [H, H, H, H],
    [_, _, _, _],
  ],
};

/** ai — single up-bump. Path arches over the middle of row 0. */
const AI_TEMPLATE: PuzzleTemplate = {
  ...BASE,
  solvedCells: [
    [_, ES, SW, _],
    [H, NW, NE, H],
    [_, _,  _,  _],
  ],
};

/** leadership — single down-bump. Path dips under the middle of row 2. */
const LEADERSHIP_TEMPLATE: PuzzleTemplate = {
  ...BASE,
  solvedCells: [
    [_, _,  _,  _],
    [H, SW, ES, H],
    [_, NE, NW, _],
  ],
};

/** engineering — long arch across the top row. Most pieces, longest detour. */
const ENGINEERING_TEMPLATE: PuzzleTemplate = {
  ...BASE,
  solvedCells: [
    [ES, H, H, SW],
    [NW, _, _, NE],
    [_,  _, _, _ ],
  ],
};

/** elsewhere — double up-bump (W-shape). Two arches; the hardest of the five. */
const ELSEWHERE_TEMPLATE: PuzzleTemplate = {
  ...BASE,
  solvedCells: [
    [ES, SW, ES, SW],
    [NW, NE, NW, NE],
    [_,  _,  _,  _ ],
  ],
};

const TEMPLATES: Record<Exclude<DoorId, 'fortune'>, PuzzleTemplate> = {
  about:       ABOUT_TEMPLATE,
  ai:          AI_TEMPLATE,
  leadership:  LEADERSHIP_TEMPLATE,
  engineering: ENGINEERING_TEMPLATE,
  elsewhere:   ELSEWHERE_TEMPLATE,
};

const SEEDS: Record<Exclude<DoorId, 'fortune'>, number> = {
  about:       2,
  elsewhere:   5,
  ai:          7,
  leadership:  3,
  engineering: 11,
};

function scrambleOffset(doorSeed: number, row: number, col: number): ConduitRotation {
  const mixed = (doorSeed * 31 + row * 7 + col * 13 + 1) % 4;
  return mixed as ConduitRotation;
}

function applyScramble(template: PuzzleTemplate, doorSeed: number): Puzzle {
  const cells = template.solvedCells.map((row, ri) =>
    row.map((piece, ci) => {
      if (piece.shape === 'empty') return piece;
      const offset = scrambleOffset(doorSeed, ri, ci);
      // Guarantee the starting rotation differs from the solved one.
      const adjusted = offset === 0 ? 1 : offset;
      const next = ((piece.rotation + adjusted) % 4) as ConduitRotation;
      return { shape: piece.shape, rotation: next };
    }),
  );
  return {
    rows: template.rows,
    cols: template.cols,
    sourceRow: template.sourceRow,
    destinationRow: template.destinationRow,
    cells,
  };
}

/** Returns a fresh, scrambled puzzle instance for the given door. */
export function puzzleForDoor(id: Exclude<DoorId, 'fortune'>): Puzzle {
  return applyScramble(TEMPLATES[id], SEEDS[id]);
}

/** Exposed for tests. */
export const __TEMPLATES = TEMPLATES;

// Re-exported under the old name so existing tests that import __TEMPLATE
// don't break. (The old shape exported a single template; new tests should
// prefer __TEMPLATES.)
export const __TEMPLATE = ABOUT_TEMPLATE;

// Re-export the V piece so callers that want a vertical straight can use it
// without redefining the literal here.
export const __pieces = { _, H, V, ES, SW, NW, NE } as const;
