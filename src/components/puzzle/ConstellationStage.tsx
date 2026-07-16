import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Door } from '@/domain/door';
import {
  initial,
  isClicked,
  isSegmentLit,
  isSolved,
  tryClick,
  type ConstellationState,
  type DestinationDoorId,
} from '@/domain/constellation-puzzle';
import { constellationFor } from '@/content/constellations.data';

interface ConstellationStageProps {
  readonly door: Door;
  readonly onClose: () => void;
  readonly onSolved: () => void;
}

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Constellation puzzle drawn over the canvas. A semi-opaque backdrop dims
 * the cosmic background (so it stays visible, just quieter), the SVG floats
 * centred over the stage area, and clicking stars in any order lights them
 * and progressively brightens the polyline.
 */
export function ConstellationStage({ door, onClose, onSolved }: ConstellationStageProps) {
  const [state, setState] = useState<ConstellationState>(() =>
    initial(constellationFor(door.id as DestinationDoorId)),
  );
  /**
   * When the puzzle solves we play a short flourish — starbursts, a segment
   * pulse, a star-radius bump — before handing off to the artifact card.
   * 550ms feels long enough to register the win without becoming a wait.
   */
  const [celebrating, setCelebrating] = useState(false);
  const solvedRef = useRef(false);
  const CELEBRATION_MS = 550;

  useEffect(() => {
    if (solvedRef.current) return;
    if (isSolved(state)) {
      solvedRef.current = true;
      setCelebrating(true);
      const t = window.setTimeout(onSolved, CELEBRATION_MS);
      return () => window.clearTimeout(t);
    }
  }, [state, onSolved]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { stars, name } = state.constellation;
  const svgRef = useRef<SVGSVGElement>(null);

  /**
   * Drag-to-draw: pointer-down on a star captures the pointer and lights
   * the star; while dragging, a preview line follows the pointer; pointer-up
   * on another star (hit-tested in SVG coords) lights it too. A plain click
   * still works — it's just a drag with no movement.
   */
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null);
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null);

  /**
   * Convert a pointer event's client position into SVG viewBox coordinates
   * using the SVG's own current transformation matrix. Unlike a manual
   * `(clientX - rect.left) / rect.width * 100`, this is correct even when:
   *   - the SVG's rect isn't perfectly square (e.g. maxHeight clips the
   *     1:1 aspect ratio), so `preserveAspectRatio="xMidYMid meet"`
   *     letterboxes the viewBox inside the rect;
   *   - CSS transforms (zoom, motion's entry scale, etc.) are in effect.
   */
  const eventToSvgCoords = (e: ReactPointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = new DOMPointReadOnly(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  };

  const handleStarClick = (idx: number) => {
    setState((s) => tryClick(s, idx));
  };

  const handleStarPointerDown = (e: ReactPointerEvent<SVGCircleElement>, idx: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
    setDragFromIdx(idx);
    setDragPoint({ x: stars[idx].x, y: stars[idx].y });
    setState((s) => tryClick(s, idx));
  };

  const handleStarPointerMove = (e: ReactPointerEvent<SVGCircleElement>) => {
    if (dragFromIdx === null) return;
    const p = eventToSvgCoords(e);
    if (p) setDragPoint(p);
  };

  const handleStarPointerUp = (e: ReactPointerEvent<SVGCircleElement>) => {
    if (dragFromIdx === null) return;
    const p = eventToSvgCoords(e);
    if (p) {
      // Hit-test: which star (if any) is within 12 SVG units of release
      // point. On a ~340px-wide mobile puzzle this maps to ~40px radius
      // (~80px tap area) — well above Apple's 44px touch-target minimum,
      // so drag-drop lands even with a fingertip approximation.
      const hitIdx = stars.findIndex((s, i) => {
        if (i === dragFromIdx) return false;
        const dx = s.x - p.x;
        const dy = s.y - p.y;
        return Math.sqrt(dx * dx + dy * dy) <= 12;
      });
      if (hitIdx !== -1) {
        setState((s) => tryClick(s, hitIdx));
      }
    }
    setDragFromIdx(null);
    setDragPoint(null);
  };

  /**
   * One gradient ID per segment, scoped to the door so two stages can't
   * collide on the page. `userSpaceOnUse` + per-endpoint coordinates is
   * the key fix — the default `objectBoundingBox` collapses on horizontal
   * lines (zero-height bbox), making the lit overlay render invisible.
   */
  const gradientId = (i: number) => `constellation-${door.id}-seg-${i}`;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${door.name} — draw ${name}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          /* Dim backdrop — the cosmic canvas still shows through, but
           * the constellation becomes the focal action. */
          background: 'rgba(4, 5, 18, 0.78)',
          backdropFilter: 'blur(3px)',
          zIndex: 11,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          /* Asymmetric padding (more on top, less on bottom) shifts the
           *   centred constellation down toward the lower half of the
           *   screen — feels more anchored than a perfectly-centred puzzle. */
          padding: '160px 24px 50px',
          cursor: 'default',
        }}
      >
        {/* Header label */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(640px, 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--tech-label)',
          }}
        >
          <span style={{ textTransform: 'lowercase' }}>
            {door.name} · draw{' '}
            <span style={{ color: 'var(--accent-cyan)' }}>{name}</span>
          </span>
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
            ✕
          </button>
        </div>

        {/* Constellation stage */}
        <motion.svg
          ref={svgRef}
          onClick={(e) => e.stopPropagation()}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          width="min(640px, 100%)"
          style={{
            aspectRatio: '1 / 1',
            maxHeight: 'min(640px, 70vh)',
            display: 'block',
          }}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.42, ease: REVEAL_EASE }}
        >
          <defs>
            {/* Per-segment gradients in user space — handles horizontal,
             * vertical, and diagonal lines uniformly. */}
            {stars.slice(0, -1).map((star, i) => {
              const next = stars[i + 1];
              return (
                <linearGradient
                  key={`grad-${i}`}
                  id={gradientId(i)}
                  gradientUnits="userSpaceOnUse"
                  x1={star.x}
                  y1={star.y}
                  x2={next.x}
                  y2={next.y}
                >
                  <stop offset="0%" stopColor="var(--accent-cyan)" />
                  <stop offset="100%" stopColor="var(--accent-violet)" />
                </linearGradient>
              );
            })}
            <radialGradient id="constellation-halo">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="55%" stopColor="var(--accent-violet)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Segments — ghost (always faint) underneath, bright overlay when lit. */}
          {stars.slice(0, -1).map((star, i) => {
            const next = stars[i + 1];
            const lit = isSegmentLit(state, i, i + 1);
            return (
              <g key={`seg-${i}`}>
                <line
                  x1={star.x}
                  y1={star.y}
                  x2={next.x}
                  y2={next.y}
                  stroke="rgba(178, 212, 229, 0.32)"
                  strokeWidth="0.35"
                  strokeLinecap="round"
                  strokeDasharray="0.4 1.2"
                />
                {lit && (
                  <motion.line
                    x1={star.x}
                    y1={star.y}
                    x2={next.x}
                    y2={next.y}
                    stroke={`url(#${gradientId(i)})`}
                    strokeLinecap="round"
                    initial={{ opacity: 0, strokeWidth: 0.7 }}
                    animate={
                      celebrating
                        ? { opacity: 1, strokeWidth: [0.7, 1.5, 0.95] }
                        : { opacity: 1, strokeWidth: 0.7 }
                    }
                    transition={{
                      duration: celebrating ? 0.5 : 0.4,
                      ease: REVEAL_EASE,
                    }}
                    style={{
                      filter: celebrating
                        ? 'drop-shadow(0 0 1.8px rgba(178,212,229,0.85))'
                        : 'drop-shadow(0 0 1px rgba(178,212,229,0.55))',
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* First-visit drag hint — a bright dot that travels from star 0
           *   to star 1 along the first segment, showing new visitors that
           *   the puzzle expects a trace between stars. Renders only while
           *   no star has been lit; disappears the moment the user clicks
           *   or drags. */}
          {state.clicked.length === 0 && stars.length >= 2 && (
            <motion.circle
              r={0.9}
              fill="#fff"
              initial={{ opacity: 0 }}
              animate={{
                cx: [stars[0].x, stars[1].x, stars[0].x],
                cy: [stars[0].y, stars[1].y, stars[0].y],
                opacity: [0, 0.95, 0.95, 0],
              }}
              transition={{
                duration: 2.4,
                times: [0, 0.35, 0.65, 1],
                repeat: Infinity,
                repeatDelay: 0.6,
                ease: 'easeInOut',
                delay: 0.8,
              }}
              style={{
                filter: 'drop-shadow(0 0 1.2px rgba(255,255,255,0.9))',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Stars — no numbers; lit stars glow, unlit ones gently pulse. */}
          {stars.map((star, idx) => {
            const lit = isClicked(state, idx);
            return (
              <g
                key={`star-${idx}`}
                style={{ cursor: lit ? 'default' : 'pointer' }}
              >
                {lit && (
                  <circle cx={star.x} cy={star.y} r={5.5} fill="url(#constellation-halo)" />
                )}
                {!lit && (
                  <motion.circle
                    cx={star.x}
                    cy={star.y}
                    r={2.2}
                    fill="none"
                    stroke="var(--accent-cyan)"
                    strokeWidth="0.18"
                    animate={{ r: [2.2, 3.4, 2.2], opacity: [0.5, 0.05, 0.5] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <motion.circle
                  cx={star.x}
                  cy={star.y}
                  fill={lit ? '#fff' : 'rgba(220, 230, 255, 0.7)'}
                  animate={
                    celebrating && lit
                      ? { r: [1.6, 2.6, 1.9] }
                      : { r: lit ? 1.6 : 1.1 }
                  }
                  transition={{
                    duration: celebrating ? 0.5 : 0.22,
                    ease: REVEAL_EASE,
                  }}
                />
                {/* Solve flourish: expanding burst per lit star */}
                {celebrating && lit && (
                  <motion.circle
                    cx={star.x}
                    cy={star.y}
                    fill="#fff"
                    initial={{ r: 1, opacity: 0.85 }}
                    animate={{ r: 9, opacity: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                  />
                )}
                {/* Generous hit target — invisible, much larger than the
                 *   visible star. Radius 12 in SVG units is ~7× the visual
                 *   star size, giving a ~40px radius on a mobile puzzle
                 *   (~80px tap area, well above the 44px touch minimum)
                 *   so drag-to-draw doesn't demand fingertip precision.
                 *   Receives both clicks (keyboard / accessibility paths)
                 *   and pointer events (drag-to-draw). */}
                <circle
                  cx={star.x}
                  cy={star.y}
                  r={12}
                  fill="transparent"
                  onClick={() => handleStarClick(idx)}
                  onPointerDown={(e) => handleStarPointerDown(e, idx)}
                  onPointerMove={handleStarPointerMove}
                  onPointerUp={handleStarPointerUp}
                  aria-label={`star ${idx + 1}`}
                  style={{ touchAction: 'none' }}
                />
              </g>
            );
          })}

          {/* In-progress drag line — from the dragged-from star to the pointer */}
          {dragFromIdx !== null && dragPoint && (
            <line
              x1={stars[dragFromIdx].x}
              y1={stars[dragFromIdx].y}
              x2={dragPoint.x}
              y2={dragPoint.y}
              stroke="rgba(178, 212, 229, 0.65)"
              strokeWidth="0.45"
              strokeDasharray="0.7 1.0"
              strokeLinecap="round"
              pointerEvents="none"
            />
          )}
        </motion.svg>

        {/* Footer hint */}
        <div
          style={{
            marginTop: 14,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-dim)',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          click each star — or drag from one to another — to draw the constellation
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
