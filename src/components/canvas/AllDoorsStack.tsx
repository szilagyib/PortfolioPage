import { motion } from 'motion/react';
import type { Door } from '@/domain/door';
import { BodyBlocks } from './ArtifactCard';

interface AllDoorsStackProps {
  readonly doors: readonly Door[];
  /** Omit to render as a standalone view (no close button — used by the
   *  reduced-motion fallback, where there's no canvas to go back to). */
  readonly onClose?: () => void;
}

export function AllDoorsStack({ doors, onClose }: AllDoorsStackProps) {
  return (
    <motion.div
      role="region"
      aria-label="all rooms"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        zIndex: 9,
        background: 'rgba(6,6,15,0.92)',
        padding: '64px 24px',
      }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="back to canvas"
          style={{
            position: 'fixed',
            top: 14,
            right: 18,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-bright)',
            border: '1px solid var(--tech-line)',
            padding: '6px 10px',
            borderRadius: 3,
          }}
        >
          ✕ back to canvas
        </button>
      )}
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 28 }}>
        {doors.map((d) => (
          <div
            key={d.id}
            style={{
              background: 'linear-gradient(180deg, #0d1230 0%, #06060f 100%)',
              border: '1px solid rgba(178, 212, 229, 0.35)',
              borderRadius: 10,
              padding: '32px 40px 36px',
              lineHeight: 1.65,
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
