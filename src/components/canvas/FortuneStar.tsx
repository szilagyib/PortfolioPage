import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchFortune, type Fortune } from '@/services/fortune.service';

export function FortuneStar() {
  const [isOpen, setIsOpen] = useState(false);
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function open() {
    setIsOpen(true);
    setLoading(true);
    try {
      const f = await fetchFortune();
      setFortune(f);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const f = await fetchFortune();
      setFortune(f);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={open}
        aria-label="open fortune"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          position: 'fixed',
          top: 96,
          right: 70,
          width: 170,
          height: 58,
          padding: 0,
          background: 'transparent',
          border: 'none',
          color: 'var(--accent-warm)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.18em',
          zIndex: 6,
          cursor: 'pointer',
          display: 'block',
          textAlign: 'right',
        }}
      >
        <svg
          width="170"
          height="58"
          viewBox="0 0 170 58"
          aria-hidden
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            {/* Trail: same colour family as the YOU star's halo — white core
             *   fading through cosmic cyan to transparent. The "comet" reads
             *   as a piece of the same starlight rather than a warm intruder. */}
            <linearGradient id="fortuneTrail" gradientUnits="userSpaceOnUse" x1="8" y1="48" x2="136" y2="12">
              <stop offset="0%"   stopColor="#a8d8ff" stopOpacity="0" />
              <stop offset="60%"  stopColor="#a8d8ff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            {/* Halo: mirrors the YOU-star halo gradient stops. */}
            <radialGradient id="fortuneCore">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
              <stop offset="12%"  stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="32%"  stopColor="#a8d8ff" stopOpacity="0.22" />
              <stop offset="62%"  stopColor="#7a90c8" stopOpacity="0.06" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            {/* Diffraction spike gradients — identical to the YOU star. */}
            <linearGradient id="fortuneSpikeV" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
              <stop offset="50%"  stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id="fortuneSpikeH" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
              <stop offset="50%"  stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {/* Comet trail — gentle quadratic curve */}
          <motion.path
            d="M 8 48 Q 62 22 136 12"
            stroke="url(#fortuneTrail)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Soft halo behind the star — YOU-style cosmic halo */}
          <motion.circle
            cx="138"
            cy="12"
            r="18"
            fill="url(#fortuneCore)"
            animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '138px 12px', transformBox: 'fill-box' }}
          />

          {/* Diffraction spikes — same approach as the YOU star: long
           *   vertical + horizontal cross, shorter diagonal sparkle. */}
          <motion.g
            animate={{ opacity: [0.92, 1, 0.92] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="137.5" y="-4" width="1" height="32" fill="url(#fortuneSpikeV)" />
            <rect x="122" y="11.5" width="32" height="1" fill="url(#fortuneSpikeH)" />
            <g transform="rotate(45 138 12)" opacity="0.5">
              <rect x="137.6" y="2" width="0.8" height="20" fill="url(#fortuneSpikeV)" />
              <rect x="128" y="11.6" width="20" height="0.8" fill="url(#fortuneSpikeH)" />
            </g>
            <circle cx="138" cy="12" r="2.4" fill="#ffffff" />
          </motion.g>

          {/* Hover glitter — a cluster of tiny sparkle dots around the
           *   comet head that fade in when the mouse enters or the star
           *   is keyboard-focused. Each dot pulses on its own phase so
           *   the effect reads as glitter rather than a synced blink. */}
          <motion.g
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ pointerEvents: 'none' }}
          >
            <motion.circle
              cx="122" cy="4" r="1.1" fill="#ffffff"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="156" cy="6" r="0.9" fill="#ffffff"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="148" cy="26" r="0.8" fill="#a8d8ff"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="128" cy="22" r="0.7" fill="#ffffff"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="164" cy="18" r="0.6" fill="#a8d8ff"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.g>
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="fortune"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              /* Anchored just below the star (top: 144 sits right under the
               * sparkle's visible glow which ends around y≈124). Narrower
               * card with tighter padding so it feels like a hovering
               * notation, not a separate panel. */
              position: 'fixed',
              top: 144,
              right: 24,
              width: 'min(200px, calc(100vw - 48px))',
              transformOrigin: 'top right',
              background: 'rgba(13, 10, 28, 0.9)',
              border: '1px solid rgba(178, 212, 229, 0.4)',
              borderRadius: 6,
              padding: '10px 12px 8px',
              color: 'var(--text-bright)',
              zIndex: 12,
              fontFamily: 'var(--font-sans)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 22px rgba(0, 0, 0, 0.55), 0 0 18px rgba(178, 212, 229, 0.12)',
            }}
          >
            {/* Small pointer connecting the card to the star above.
             *   Two stacked triangles: outer in the border colour, inner in
             *   the card-background colour 1px inside, so it reads as a
             *   bordered arrowhead. Positioned under where the sparkle sits
             *   (≈78 px from the card's right edge given the current
             *   star position). */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -8,
                right: 70,
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '8px solid rgba(178, 212, 229, 0.4)',
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -6,
                right: 71,
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderBottom: '7px solid rgba(13, 10, 28, 0.9)',
              }}
            />
            {loading && !fortune ? (
              <FortuneSkeleton />
            ) : fortune ? (
              <>
                <p
                  style={{
                    margin: 0,
                    fontStyle: 'italic',
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: 'var(--text-bright)',
                  }}
                >
                  &ldquo;{fortune.text}&rdquo;
                </p>
                <p
                  style={{
                    marginTop: 4,
                    color: 'var(--accent-violet)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    opacity: 0.85,
                  }}
                >
                  — {fortune.attribution}
                </p>
              </>
            ) : null}

            <div
              style={{
                marginTop: 8,
                paddingTop: 6,
                borderTop: '1px solid rgba(178, 212, 229, 0.16)',
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                style={{
                  color: loading ? 'var(--text-dim)' : 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  cursor: loading ? 'wait' : 'pointer',
                  letterSpacing: '0.08em',
                }}
              >
                {loading ? 'loading…' : '↻ next'}
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="close"
                title="close"
                style={{
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                }}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FortuneSkeleton() {
  return (
    <div aria-hidden style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SkeletonLine widthPct={100} />
      <SkeletonLine widthPct={92} />
      <SkeletonLine widthPct={70} />
      <div style={{ height: 6 }} />
      <SkeletonLine widthPct={38} />
    </div>
  );
}

function SkeletonLine({ widthPct }: { widthPct: number }) {
  return (
    <motion.div
      style={{
        height: 12,
        width: `${widthPct}%`,
        background:
          'linear-gradient(90deg, rgba(178, 212, 229,0.08) 0%, rgba(178, 212, 229,0.22) 50%, rgba(178, 212, 229,0.08) 100%)',
        backgroundSize: '200% 100%',
        borderRadius: 3,
      }}
      animate={{ backgroundPosition: ['200% 0%', '-100% 0%'] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
    />
  );
}
