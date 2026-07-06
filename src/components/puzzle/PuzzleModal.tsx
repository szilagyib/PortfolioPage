import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Door } from '@/domain/door';
import { isSolved, rotateCellAt } from '@/domain/conduit-puzzle';
import { puzzleForDoor } from '@/content/puzzles.data';

interface PuzzleModalProps {
  readonly door: Door;
  readonly onClose: () => void;
  readonly onSolved: () => void;
  readonly children: (renderProps: PuzzleRenderProps) => React.ReactNode;
}

export interface PuzzleRenderProps {
  readonly puzzle: ReturnType<typeof puzzleForDoor>;
  readonly rotate: (row: number, col: number) => void;
}

/**
 * Modal shell that owns the puzzle's in-progress rotation state and reports a
 * solve back to the caller. Rendering of the actual grid is delegated to a
 * render-prop child, which keeps the modal layer separated from the puzzle UI.
 */
export function PuzzleModal({ door, onClose, onSolved, children }: PuzzleModalProps) {
  const [puzzle, setPuzzle] = useState(() => puzzleForDoor(door.id as Exclude<typeof door.id, 'fortune'>));
  const solvedRef = useRef(false);

  // Watch for solve transitions
  useEffect(() => {
    if (solvedRef.current) return;
    if (isSolved(puzzle)) {
      solvedRef.current = true;
      // Brief pause to let the player see the lit-up state, then fire onSolved.
      const t = window.setTimeout(onSolved, 900);
      return () => window.clearTimeout(t);
    }
  }, [puzzle, onSolved]);

  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rotate = useCallback((row: number, col: number) => {
    setPuzzle((p) => rotateCellAt(p, row, col));
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${door.name} — starlight conduit puzzle`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(4, 3, 13, 0.82)',
          backdropFilter: 'blur(6px)',
          zIndex: 11,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(720px, 100%)',
            background: 'linear-gradient(180deg, #0b0b28 0%, #050513 100%)',
            border: '1px solid rgba(95, 184, 214, 0.18)',
            borderRadius: 10,
            padding: '24px 28px 28px',
            color: 'var(--text-bright)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 64px rgba(95, 184, 214, 0.08)',
          }}
        >
          {/* Shared SVG defs — referenced by ConduitPiece / SourceNode / DestinationNode */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="conduit-lit" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"  stopColor="var(--accent-cyan)" />
                <stop offset="100%" stopColor="var(--accent-violet)" />
              </linearGradient>
              <filter id="conduit-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 18,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              fontSize: 'var(--fs-readout)',
              color: 'var(--tech-label)',
            }}
          >
            <span style={{ textTransform: 'lowercase' }}>{door.name} · conduit</span>
            <button
              type="button"
              aria-label="close puzzle"
              onClick={onClose}
              style={{
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.05em',
              }}
            >
              ✕ close
            </button>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {children({ puzzle, rotate })}
          </div>

          {/* Instructional footer */}
          <p
            style={{
              marginTop: 18,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '0.04em',
              textAlign: 'center',
            }}
          >
            click a conduit to rotate it
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
