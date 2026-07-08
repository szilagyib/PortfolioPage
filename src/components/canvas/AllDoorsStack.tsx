import { motion } from 'motion/react';
import type { Door } from '@/domain/door';
import { BodyBlocks } from './ArtifactCard';

interface AllDoorsStackProps {
  readonly doors: readonly Door[];
  /** Omit to render as a standalone view (no close button — used by the
   *  reduced-motion fallback, where there's no canvas to go back to). */
  readonly onClose?: () => void;
  /** Optional "start over" — resets all state and closes the overlay.
   *  When present, renders next to the close button. */
  readonly onReset?: () => void;
}

export function AllDoorsStack({ doors, onClose, onReset }: AllDoorsStackProps) {
  return (
    <motion.div
      className="all-doors-outer"
      role="region"
      aria-label="all rooms"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 9,
        background: 'rgba(6,6,15,0.92)',
      }}
    >
      {(onClose || onReset) && (
        <div
          style={{
            /* Anchored to the modal content's right edge (max-width 720
             * centred), not the viewport corner — otherwise the buttons
             * feel detached from the cards on wide screens. On viewports
             * narrower than the content, the buttons fall back to a
             * viewport-margin of 18px. */
            position: 'fixed',
            top: 14,
            right: 'max(18px, calc(50vw - 360px))',
            display: 'flex',
            gap: 8,
            zIndex: 1,
          }}
        >
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              aria-label="start over"
              title="start over"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-bright)',
                border: '1px solid var(--tech-line)',
                padding: '6px 10px',
                borderRadius: 3,
                background: 'rgba(13,18,48,0.55)',
              }}
            >
              ↻ start over
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="back to canvas"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-bright)',
                border: '1px solid var(--tech-line)',
                padding: '6px 10px',
                borderRadius: 3,
                background: 'rgba(13,18,48,0.55)',
              }}
            >
              ✕ back to canvas
            </button>
          )}
        </div>
      )}
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 24 }}>
        {doors.map((d) => (
          <div
            key={d.id}
            className="all-doors-card"
            style={{
              background: 'linear-gradient(180deg, #0d1230 0%, #06060f 100%)',
              border: '1px solid rgba(178, 212, 229, 0.35)',
              borderRadius: 10,
              lineHeight: 1.6,
              boxShadow:
                '0 0 0 1px rgba(178, 212, 229, 0.12), ' +
                '0 0 24px rgba(178, 212, 229, 0.16), ' +
                '0 0 60px rgba(178, 212, 229, 0.08)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--tech-label)',
                letterSpacing: '0.1em',
                marginBottom: 20,
              }}
            >
              <span style={{ textTransform: 'lowercase' }}>{d.name}</span>
            </div>
            <BodyBlocks door={d} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
