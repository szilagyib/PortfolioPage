import type { Door } from '@/domain/door';
import { PUZZLE_ENGINE } from '@/config/puzzle.config';
import { PuzzleModal } from './PuzzleModal';
import { PuzzleGrid } from './PuzzleGrid';
import { ConstellationStage } from './ConstellationStage';

interface PuzzleHostProps {
  readonly door: Door;
  readonly onClose: () => void;
  readonly onSolved: () => void;
}

/**
 * Single entry point for the puzzle gating a destination. Picks the engine
 * from `PUZZLE_ENGINE` so Canvas doesn't have to know which game is wired —
 * switching engines is a one-line change in `src/config/puzzle.config.ts`.
 *
 * Note: the conduit engine renders a viewport-level modal; the constellation
 * engine renders directly into the stage. Mount this inside the stage
 * container so the constellation overlay can absolute-position to it.
 */
export function PuzzleHost({ door, onClose, onSolved }: PuzzleHostProps) {
  if (PUZZLE_ENGINE === 'constellation') {
    return <ConstellationStage door={door} onClose={onClose} onSolved={onSolved} />;
  }
  return (
    <PuzzleModal door={door} onClose={onClose} onSolved={onSolved}>
      {({ puzzle, rotate }) => (
        <PuzzleGrid puzzle={puzzle} destinationName={door.name} onRotate={rotate} />
      )}
    </PuzzleModal>
  );
}
