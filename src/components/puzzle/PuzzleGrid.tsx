import { useMemo } from 'react';
import type { Puzzle } from '@/domain/conduit-puzzle';
import { litCells, isSolved } from '@/domain/conduit-puzzle';
import { ConduitPiece } from './ConduitPiece';
import { SourceNode } from './SourceNode';
import { DestinationNode } from './DestinationNode';

interface PuzzleGridProps {
  readonly puzzle: Puzzle;
  readonly destinationName: string;
  readonly onRotate: (row: number, col: number) => void;
}

const CELL_SIZE = 78;
const EDGE_COL_WIDTH = 64;
const GAP = 6;

export function PuzzleGrid({ puzzle, destinationName, onRotate }: PuzzleGridProps) {
  const solved = useMemo(() => isSolved(puzzle), [puzzle]);
  const lit    = useMemo(() => litCells(puzzle), [puzzle]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          `${EDGE_COL_WIDTH}px repeat(${puzzle.cols}, ${CELL_SIZE}px) ${EDGE_COL_WIDTH}px`,
        gridTemplateRows: `repeat(${puzzle.rows}, ${CELL_SIZE}px)`,
        gap: GAP,
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      {/* Source on left edge at source row */}
      <div style={{ gridColumn: 1, gridRow: puzzle.sourceRow + 1 }}>
        <SourceNode />
      </div>

      {/* Destination on right edge at destination row */}
      <div style={{ gridColumn: puzzle.cols + 2, gridRow: puzzle.destinationRow + 1 }}>
        <DestinationNode name={destinationName} lit={solved} />
      </div>

      {/* Conduit cells */}
      {puzzle.cells.flatMap((row, r) =>
        row.map((piece, c) => (
          <div key={`${r}-${c}`} style={{ gridColumn: c + 2, gridRow: r + 1 }}>
            <ConduitPiece
              piece={piece}
              lit={lit.has(`${r},${c}`)}
              row={r}
              col={c}
              onRotate={onRotate}
            />
          </div>
        )),
      )}
    </div>
  );
}
