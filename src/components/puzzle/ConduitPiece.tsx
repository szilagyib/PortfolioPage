import { memo, useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { ConduitPiece as Piece, ConduitShape } from '@/domain/conduit-puzzle';

interface ConduitPieceProps {
  readonly piece: Piece;
  readonly lit: boolean;
  readonly row: number;
  readonly col: number;
  readonly onRotate: (row: number, col: number) => void;
}

const STROKE_WIDTH = 7;

function ShapePath({ shape, stroke }: { shape: ConduitShape; stroke: string }) {
  const common = {
    fill: 'none' as const,
    stroke,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (shape) {
    case 'empty':
      return null;
    case 'straight':
      return <line x1={0} y1={50} x2={100} y2={50} {...common} />;
    case 'corner':
      return <path d="M 100 50 Q 50 50 50 100" {...common} />;
    case 'tee':
      return (
        <g {...common}>
          <line x1={0} y1={50} x2={100} y2={50} />
          <line x1={50} y1={50} x2={50} y2={100} />
        </g>
      );
    case 'cross':
      return (
        <g {...common}>
          <line x1={0} y1={50} x2={100} y2={50} />
          <line x1={50} y1={0} x2={50} y2={100} />
        </g>
      );
  }
}

function ConduitPieceBase({ piece, lit, row, col, onRotate }: ConduitPieceProps) {
  const isEmpty = piece.shape === 'empty';
  const rawId = useId();
  const gradientId = `clit-${rawId.replace(/:/g, '')}`;
  const stroke = lit ? `url(#${gradientId})` : 'rgba(140, 165, 210, 0.42)';

  const prevRotation = useRef(piece.rotation);
  const [displayDeg, setDisplayDeg] = useState(() => piece.rotation * 90);

  useEffect(() => {
    if (prevRotation.current === piece.rotation) return;
    const forwardSteps = (piece.rotation - prevRotation.current + 4) % 4;
    if (forwardSteps > 0) {
      setDisplayDeg((d) => d + forwardSteps * 90);
    }
    prevRotation.current = piece.rotation;
  }, [piece.rotation]);

  return (
    <button
      type="button"
      onClick={() => onRotate(row, col)}
      disabled={isEmpty}
      aria-label={isEmpty ? 'empty cell' : `${piece.shape} conduit`}
      style={{
        width: '100%',
        height: '100%',
        padding: 0,
        background: 'transparent',
        border: '1px solid rgba(60, 80, 130, 0.18)',
        borderRadius: 6,
        cursor: isEmpty ? 'default' : 'pointer',
        display: 'block',
        overflow: 'visible',
      }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        overflow="visible"
        width="100%"
        height="100%"
        initial={{ rotate: displayDeg }}
        animate={{ rotate: displayDeg }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'block',
          overflow: 'visible',
          transformOrigin: '50% 50%',
          transformBox: 'view-box',
          willChange: 'transform',
          filter: lit ? 'drop-shadow(0 0 3px rgba(95, 184, 214, 0.55))' : undefined,
        }}
      >
        {/*
         * Local gradient with userSpaceOnUse — independent of the path's
         * bounding box. Fixes the bug where horizontal/vertical lines (zero
         * width or height bbox) caused the lit gradient to render as
         * transparent and the piece visually disappeared.
         */}
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0" y1="0" x2="100" y2="100"
          >
            <stop offset="0%"   stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-violet)" />
          </linearGradient>
        </defs>
        <ShapePath shape={piece.shape} stroke={stroke} />
      </motion.svg>
    </button>
  );
}

export const ConduitPiece = memo(ConduitPieceBase);
