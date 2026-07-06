import { lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { CosmicBackground } from './CosmicBackground';
import { MobileDestination } from './MobileDestination';
import { ArtifactCard } from './ArtifactCard';
import { AllDoorsStack } from './AllDoorsStack';
import { doors } from '@/content/doors.data';
import { useCanvasStore } from '@/state/canvas.store';
import type { DoorId } from '@/domain/door';

const PuzzleHost = lazy(() =>
  import('@/components/puzzle/PuzzleHost').then((m) => ({ default: m.PuzzleHost })),
);

const DOOR_ORDER: readonly DoorId[] =
  ['about', 'ai', 'leadership', 'engineering', 'elsewhere'];

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Mobile-only layout. Vertical strip: YOU pinned near the top, destinations
 * stacked below as full-width rows, connected by a glowing trunk line.
 * Constellation puzzles, artifact cards, and the all-doors stack are reused
 * from the desktop layer unchanged — they're already viewport-positioned.
 *
 * The top bar carries identity + CV download + "see all" skip button, so
 * a hurried visitor can bypass the puzzles entirely.
 */
export default function MobileCanvas() {
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

  const orderedDoors = DOOR_ORDER
    .map((id) => doors.find((d) => d.id === id))
    .filter((d): d is import('@/domain/door').Door => d !== undefined);

  const cardDoor = openCard ? doors.find((d) => d.id === openCard) ?? null : null;
  const puzzleDoor = activePuzzle ? doors.find((d) => d.id === activePuzzle) ?? null : null;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <CosmicBackground />

      {/* Top bar — identity on the left, CV + see-all on the right */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '14px 14px 10px',
          gap: 10,
          zIndex: 4,
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              color: 'var(--text-bright)',
              letterSpacing: '0.03em',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Borbála Szilágyi
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-dim)',
              letterSpacing: '0.06em',
              marginTop: 2,
            }}
          >
            Software Engineer · Team Lead
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flex: '0 0 auto' }}>
          <a
            href="/SzilagyiBorbala_CV_EN_2026_NoPhoto.pdf"
            download
            aria-label="download CV"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.06em',
              color: 'var(--accent-cyan)',
              textDecoration: 'none',
              padding: '5px 8px',
              border: '1px solid rgba(95, 184, 214, 0.45)',
              borderRadius: 4,
              background: 'rgba(13,18,48,0.55)',
            }}
          >
            ↓ CV
          </a>
          <button
            type="button"
            onClick={openAll}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.06em',
              color: 'var(--text-bright)',
              border: '1px solid var(--tech-line)',
              padding: '5px 8px',
              borderRadius: 4,
              background: 'rgba(13,18,48,0.55)',
            }}
          >
            ↓ see all
          </button>
        </div>
      </header>

      {/* Stage — YOU on top, destinations stacked below. Fade the whole strip
       *   in on first paint so the page doesn't pop into view. */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: REVEAL_EASE }}
        style={{
          position: 'absolute',
          top: 64,
          bottom: 0,
          left: 0,
          right: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 18px 28px',
          zIndex: 1,
        }}
      >
        {/* YOU star — diffraction-spike SVG with a slow halo pulse, mirroring
         *   the desktop YouStar at a mobile scale. */}
        <motion.svg
          width="72"
          height="72"
          viewBox="-36 -36 72 72"
          aria-hidden
          animate={{ opacity: [0.92, 1, 0.92], scale: [1, 1.05, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="mobile-you-halo">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="14%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="38%" stopColor="#a8d8ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <linearGradient id="mobile-you-spike-v" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id="mobile-you-spike-h" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          {/* Soft circular halo */}
          <circle cx="0" cy="0" r="32" fill="url(#mobile-you-halo)" />
          {/* Diffraction spikes — vertical + horizontal */}
          <rect x="-0.5" y="-30" width="1" height="60" fill="url(#mobile-you-spike-v)" />
          <rect x="-30" y="-0.5" width="60" height="1" fill="url(#mobile-you-spike-h)" />
          {/* Shorter diagonal spikes for 8-point sparkle */}
          <g transform="rotate(45)" opacity="0.5">
            <rect x="-0.4" y="-18" width="0.8" height="36" fill="url(#mobile-you-spike-v)" />
            <rect x="-18" y="-0.4" width="36" height="0.8" fill="url(#mobile-you-spike-h)" />
          </g>
          {/* Bright central core */}
          <circle cx="0" cy="0" r="2.4" fill="#ffffff" />
        </motion.svg>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18, ease: REVEAL_EASE }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-dim)',
            letterSpacing: '0.1em',
            marginTop: 2,
            marginBottom: 14,
          }}
        >
          YOU · here
        </motion.div>

        {/* Vertical trunk-and-destinations column */}
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 10,
            position: 'relative',
          }}
        >
          {/* Connecting trunk behind the destinations — soft cyan gradient
           *   with a subtle outer glow, replacing the static dashed line. */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -12,
              bottom: -10,
              left: '50%',
              width: 1.5,
              background:
                'linear-gradient(to bottom, ' +
                  'rgba(178, 212, 229, 0) 0%, ' +
                  'rgba(178, 212, 229, 0.55) 8%, ' +
                  'rgba(95, 184, 214, 0.4) 60%, ' +
                  'rgba(178, 212, 229, 0.15) 100%)',
              boxShadow: '0 0 6px rgba(95, 184, 214, 0.35)',
              transform: 'translateX(-50%)',
              zIndex: 0,
            }}
          />

          {orderedDoors.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.34,
                delay: 0.16 + i * 0.07,
                ease: REVEAL_EASE,
              }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <MobileDestination
                id={d.id}
                name={d.name}
                tagline={d.tagline}
                powered={poweredDoors.includes(d.id)}
                onSelect={() => {
                  if (poweredDoors.includes(d.id)) {
                    openCardFor(d.id);
                  } else {
                    openPuzzle(d.id);
                  }
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.main>

      {puzzleDoor && (
        <Suspense fallback={null}>
          <PuzzleHost
            door={puzzleDoor}
            onClose={closePuzzle}
            onSolved={() => solvePuzzle(puzzleDoor.id)}
          />
        </Suspense>
      )}

      {cardDoor && (
        <ArtifactCard
          door={cardDoor}
          onClose={() => openCardFor(null)}
        />
      )}

      {allDoorsOpen && (
        <AllDoorsStack
          doors={orderedDoors}
          onClose={closeAll}
        />
      )}
    </div>
  );
}
