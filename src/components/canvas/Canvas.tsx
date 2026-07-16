import { lazy, Suspense } from 'react';
import { CosmicBackground } from './CosmicBackground';
import { SystemReadout } from './SystemReadout';
import { CvDownload } from './CvDownload';
import { SkipButton } from './SkipButton';
import { YouStar } from './YouStar';
import { Destination } from './Destination';
import { Route } from './Route';
import { FortuneStar } from './FortuneStar';
import { ResetButton } from './ResetButton';
import { Hint } from './Hint';
import { doors } from '@/content/doors.data';
import { LAST_UPDATED_YEAR } from '@/content/site';
import { useCanvasStore } from '@/state/canvas.store';
import { useBreakpoint, useReducedMotion } from '@/services/viewport.service';
import { useReturningVisitorAutoSkip } from '@/services/visitor.service';
import MobileCanvas from './MobileCanvas';
import type { DoorId } from '@/domain/door';

/*
 * Lazy-loaded — the puzzle UI is only needed once a visitor clicks a
 * destination. PuzzleHost dispatches to whichever engine is selected in
 * `src/config/puzzle.config.ts`. Keeping it out of the initial Canvas
 * chunk shaves several KB off first paint.
 */
const PuzzleHost = lazy(() =>
  import('@/components/puzzle/PuzzleHost').then((m) => ({ default: m.PuzzleHost })),
);

/*
 * Also lazy, for the same reason: none of this is on the path to first
 * paint. The pentagon renders without them, and each only appears after
 * a deliberate click — a destination (ArtifactCard) or "see everything"
 * (AllDoorsStack). Together they pull in the whole artifact-rendering
 * tree (BodyBlocks) and the AI chat, which is the bulk of the canvas
 * bundle and none of what a visitor first looks at.
 *
 * ReducedMotionView renders immediately for visitors who ask for it, so
 * for them this trades one extra request against a much smaller bundle
 * for everyone else. It shares AllDoorsStack's chunk either way.
 */
const ArtifactCard = lazy(() =>
  import('./ArtifactCard').then((m) => ({ default: m.ArtifactCard })),
);
const AllDoorsStack = lazy(() =>
  import('./AllDoorsStack').then((m) => ({ default: m.AllDoorsStack })),
);
const ReducedMotionView = lazy(() =>
  import('./ReducedMotionView').then((m) => ({ default: m.ReducedMotionView })),
);

const ORBIT_RX = 43;
const ORBIT_RY = 40;

const TOP_BAR_HEIGHT = 100;
const BOTTOM_BAR_HEIGHT = 140;
const RIGHT_GUTTER = 220;
const LEFT_GUTTER = 180;

interface PositionedDoor {
  readonly id: DoorId;
  readonly name: string;
  readonly tagline: string;
  readonly xPercent: number;
  readonly yPercent: number;
}

const DOOR_ORDER: readonly DoorId[] =
  ['about', 'ai', 'leadership', 'engineering', 'elsewhere'];

/**
 * Per-door fine-tuning in stage percentage units. Kept empty by default —
 * the pentagon math works cleanly once the orbit is wide enough.
 */
const DOOR_NUDGE: Partial<Record<DoorId, { dx?: number; dy?: number }>> = {};

function placeDoors(): readonly PositionedDoor[] {
  const destinations = doors.filter((d) => d.id !== 'fortune');
  // Pentagon walking clockwise from the top-left vertex.
  const baseAngleDeg = 198;
  const stepDeg = 360 / DOOR_ORDER.length;

  return DOOR_ORDER
    .map((id, i) => {
      const d = destinations.find((x) => x.id === id);
      if (!d) return null;
      const rad = ((baseAngleDeg + i * stepDeg) * Math.PI) / 180;
      const nudge = DOOR_NUDGE[id] ?? {};
      return {
        id: d.id,
        name: d.name,
        tagline: d.tagline,
        xPercent: 50 + ORBIT_RX * Math.cos(rad) + (nudge.dx ?? 0),
        yPercent: 50 + ORBIT_RY * Math.sin(rad) + (nudge.dy ?? 0),
      };
    })
    .filter((p): p is PositionedDoor => p !== null);
}

export default function Canvas() {
  const activePuzzle = useCanvasStore((s) => s.activePuzzle);
  const poweredDoors = useCanvasStore((s) => s.poweredDoors);
  const allDoorsOpen = useCanvasStore((s) => s.allDoorsOpen);
  const openCard     = useCanvasStore((s) => s.openCard);
  const openPuzzle   = useCanvasStore((s) => s.openPuzzle);
  const closePuzzle  = useCanvasStore((s) => s.closePuzzle);
  const solvePuzzle  = useCanvasStore((s) => s.solvePuzzle);
  const openAll      = useCanvasStore((s) => s.openAll);
  const closeAll     = useCanvasStore((s) => s.closeAll);
  const openCardFor  = useCanvasStore((s) => s.openCardFor);
  const reset        = useCanvasStore((s) => s.reset);

  const bp = useBreakpoint();
  const reducedMotion = useReducedMotion();

  useReturningVisitorAutoSkip();

  /* Reduced-motion users see the everything-at-once stack (no parallax,
   * no orbit animation, no puzzles). Mobile users get the vertical-strip
   * canvas. Desktop falls through to the pentagon below. */
  if (reducedMotion) {
    return (
      <Suspense fallback={null}>
        <ReducedMotionView />
      </Suspense>
    );
  }
  if (bp === 'mobile') {
    return <MobileCanvas />;
  }

  const positioned = placeDoors();
  const cardDoor = openCard ? doors.find((d) => d.id === openCard) ?? null : null;
  const puzzleDoor = activePuzzle ? doors.find((d) => d.id === activePuzzle) ?? null : null;
  const cardOrigin = openCard ? positioned.find((p) => p.id === openCard) ?? null : null;

  /* Canvas UI (identity, CV, see-everything, start-over) only makes
   * sense while the pentagon view is active. When a modal — artifact
   * card, puzzle, or see-all overlay — is open, hide them: they'd
   * either duplicate what the modal shows or be un-clickable. */
  const canvasIdle = !openCard && !activePuzzle && !allDoorsOpen;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <CosmicBackground />
      {canvasIdle && (
        <>
          <SystemReadout />
          <CvDownload />
          <SkipButton
            onClick={openAll}
            highlight={poweredDoors.length === 0}
          />
          <ResetButton
            visible={poweredDoors.length > 0}
            onClick={reset}
          />
        </>
      )}
      <FortuneStar />

      {/* Stage region — destinations fan around YOU, never crossing reserved zones */}
      <div
        style={{
          position: 'absolute',
          top: TOP_BAR_HEIGHT,
          bottom: BOTTOM_BAR_HEIGHT,
          left: LEFT_GUTTER,
          right: RIGHT_GUTTER,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 760,
            aspectRatio: '1.15 / 1',
            maxHeight: '100%',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            width="100%"
            height="100%"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            aria-hidden
          >
            <defs>
              <linearGradient id="forgedLine" x1="0" x2="1">
                <stop offset="0" stopColor="var(--accent-cyan)" />
                <stop offset="1" stopColor="var(--accent-violet)" />
              </linearGradient>
            </defs>
            {positioned.map((p) => (
              <Route
                key={`route-${p.id}`}
                id={p.id}
                fromX={50} fromY={50}
                toX={p.xPercent} toY={p.yPercent}
                powered={poweredDoors.includes(p.id)}
                dimmed={openCard !== null || activePuzzle !== null}
              />
            ))}
          </svg>

          <YouStar />

          {positioned.map((p) => {
            const isPowered = poweredDoors.includes(p.id);
            return (
              <Destination
                key={p.id}
                id={p.id}
                name={p.name}
                tagline={p.tagline}
                xPercent={p.xPercent}
                yPercent={p.yPercent}
                powered={isPowered}
                dimmed={openCard !== null || activePuzzle !== null}
                onSelect={() =>
                  isPowered ? openCardFor(p.id) : openPuzzle(p.id)
                }
              />
            );
          })}

        </div>
      </div>

      {/* Bottom bar — hint banner (only when nothing is powered and no
       *   puzzle/card is open) stacked above the updated-year footer.
       *   Column layout so the footer stays pinned to the bottom as the
       *   hint mounts and unmounts above it. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: BOTTOM_BAR_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          padding: '0 24px 14px',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      >
        <Hint
          visible={
            !activePuzzle &&
            poweredDoors.length === 0 &&
            !openCard &&
            !allDoorsOpen
          }
        />
        {canvasIdle && <div className="canvas-footer">updated · {LAST_UPDATED_YEAR}</div>}
      </div>

      {puzzleDoor && (
        <Suspense fallback={null}>
          <PuzzleHost
            door={puzzleDoor}
            onClose={closePuzzle}
            onSolved={() => solvePuzzle(puzzleDoor.id)}
          />
        </Suspense>
      )}

      {cardDoor && cardOrigin && (
        <Suspense fallback={null}>
          <ArtifactCard
            door={cardDoor}
            onClose={() => openCardFor(null)}
            originXPercent={cardOrigin.xPercent}
            originYPercent={cardOrigin.yPercent}
          />
        </Suspense>
      )}

      {allDoorsOpen && (
        <Suspense fallback={null}>
          <AllDoorsStack
            doors={DOOR_ORDER
              .map((id) => doors.find((d) => d.id === id))
              .filter((d): d is import('@/domain/door').Door => d !== undefined)}
            onClose={closeAll}
          />
        </Suspense>
      )}
    </div>
  );
}
