/**
 * Pure rules for the "Starlight Conduits" puzzle.
 *
 * A puzzle is a grid of cells. Each cell holds a conduit piece that has a
 * shape (straight, corner, T, cross, empty) and a rotation (0–3 quarter
 * turns clockwise). The player rotates pieces until starlight can flow from
 * the source (left edge of the source-row) to the destination (right edge of
 * the destination-row).
 *
 * No React, no DOM, no I/O. Everything in this module is referentially
 * transparent.
 */

export type ConduitShape = 'empty' | 'straight' | 'corner' | 'tee' | 'cross';

/** 0=0°, 1=90° CW, 2=180°, 3=270° CW. */
export type ConduitRotation = 0 | 1 | 2 | 3;

/** Openings indexed as [North, East, South, West]. */
export type ConduitConnections = readonly [boolean, boolean, boolean, boolean];

export interface ConduitPiece {
  readonly shape: ConduitShape;
  readonly rotation: ConduitRotation;
}

export interface Puzzle {
  readonly rows: number;
  readonly cols: number;
  readonly cells: readonly (readonly ConduitPiece[])[];
  /** Source enters from the left edge at this row. */
  readonly sourceRow: number;
  /** Destination exits to the right edge at this row. */
  readonly destinationRow: number;
}

/** Index helpers for the [N, E, S, W] tuple. */
const N = 0, E = 1, S = 2, W = 3;

const BASE_CONNECTIONS: Record<ConduitShape, ConduitConnections> = {
  empty:    [false, false, false, false],
  straight: [false, true,  false, true ],  // east + west
  corner:   [false, true,  true,  false],  // east + south
  tee:      [false, true,  true,  true ],  // east + south + west
  cross:    [true,  true,  true,  true ],
};

/**
 * Rotate the [N,E,S,W] tuple by `turns` quarter-turns clockwise.
 * A 90° CW rotation maps whatever was facing North to now face East, East
 * to South, and so on — equivalent to a right-shift of the array.
 */
function rotateConnections(
  conn: ConduitConnections,
  turns: ConduitRotation,
): ConduitConnections {
  const t = ((turns % 4) + 4) % 4;
  const out: boolean[] = [conn[N], conn[E], conn[S], conn[W]];
  for (let i = 0; i < t; i++) {
    const last = out.pop()!;
    out.unshift(last);
  }
  return out as unknown as ConduitConnections;
}

export function getEffectiveConnections(piece: ConduitPiece): ConduitConnections {
  return rotateConnections(BASE_CONNECTIONS[piece.shape], piece.rotation);
}

export function rotatePiece(piece: ConduitPiece): ConduitPiece {
  return { shape: piece.shape, rotation: ((piece.rotation + 1) % 4) as ConduitRotation };
}

export function setPieceAt(
  puzzle: Puzzle,
  row: number,
  col: number,
  piece: ConduitPiece,
): Puzzle {
  const next = puzzle.cells.map((r, ri) =>
    ri === row ? r.map((p, ci) => (ci === col ? piece : p)) : r,
  );
  return { ...puzzle, cells: next };
}

export function rotateCellAt(puzzle: Puzzle, row: number, col: number): Puzzle {
  const current = puzzle.cells[row]?.[col];
  if (!current) return puzzle;
  return setPieceAt(puzzle, row, col, rotatePiece(current));
}

/**
 * BFS from the source through connected openings. Returns true iff the
 * destination cell at the right edge of `destinationRow` is reachable AND
 * the chain exits eastward into the destination port.
 *
 * Adjacent cells are considered connected only when BOTH have openings
 * pointing toward each other (e.g. our East and their West).
 */
export function isSolved(puzzle: Puzzle): boolean {
  const { rows, cols, sourceRow, destinationRow, cells } = puzzle;

  if (sourceRow < 0 || sourceRow >= rows) return false;
  if (destinationRow < 0 || destinationRow >= rows) return false;

  const entryCell = cells[sourceRow]?.[0];
  if (!entryCell) return false;
  // Source pours starlight rightward into the cell's western opening.
  if (!getEffectiveConnections(entryCell)[W]) return false;

  const visited = new Set<string>();
  const queue: Array<readonly [number, number]> = [[sourceRow, 0]];
  visited.add(`${sourceRow},0`);

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const cell = cells[r]?.[c];
    if (!cell) continue;
    const conn = getEffectiveConnections(cell);

    // Direction tuples: [drow, dcol, ourDir, neighbourDir]
    const moves: ReadonlyArray<readonly [number, number, number, number]> = [
      [-1,  0, N, S],
      [ 0,  1, E, W],
      [ 1,  0, S, N],
      [ 0, -1, W, E],
    ];

    for (const [dr, dc, ourDir, theirDir] of moves) {
      if (!conn[ourDir]) continue;

      const nr = r + dr;
      const nc = c + dc;

      // Edge cases: exiting the grid.
      if (nc === cols && ourDir === E) {
        if (r === destinationRow) return true;
        continue;
      }
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;

      const neighbour = cells[nr]?.[nc];
      if (!neighbour) continue;
      if (!getEffectiveConnections(neighbour)[theirDir]) continue;

      visited.add(key);
      queue.push([nr, nc]);
    }
  }

  return false;
}

/**
 * Returns the set of cells that currently carry starlight (are reachable
 * from the source via valid connections). Used to draw the "lit" pieces in
 * the UI as the player makes progress.
 */
export function litCells(puzzle: Puzzle): ReadonlySet<string> {
  const { rows, cols, sourceRow, cells } = puzzle;
  const visited = new Set<string>();

  const entryCell = cells[sourceRow]?.[0];
  if (!entryCell) return visited;
  if (!getEffectiveConnections(entryCell)[W]) return visited;

  const queue: Array<readonly [number, number]> = [[sourceRow, 0]];
  visited.add(`${sourceRow},0`);

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const cell = cells[r]?.[c];
    if (!cell) continue;
    const conn = getEffectiveConnections(cell);

    const moves: ReadonlyArray<readonly [number, number, number, number]> = [
      [-1,  0, N, S],
      [ 0,  1, E, W],
      [ 1,  0, S, N],
      [ 0, -1, W, E],
    ];

    for (const [dr, dc, ourDir, theirDir] of moves) {
      if (!conn[ourDir]) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      const neighbour = cells[nr]?.[nc];
      if (!neighbour) continue;
      if (!getEffectiveConnections(neighbour)[theirDir]) continue;
      visited.add(key);
      queue.push([nr, nc]);
    }
  }

  return visited;
}
