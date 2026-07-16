import { motion } from 'motion/react';
import type { Door } from '@/domain/door';
import { BodyBlocks } from './BodyBlocks';
import { CvPill } from './CvPill';

/* Baked in when the module first loads. Static-generated pages inline
 * it at build time; the client-side view reads whatever year the
 * visitor arrives in. Either way it's a small aliveness signal. */
const LAST_UPDATED_YEAR = new Date().getFullYear();

interface AllDoorsStackProps {
  readonly doors: readonly Door[];
  /** Omit to render as a standalone view (no sticky header — used by
   *  the reduced-motion fallback, where there's no canvas to go back
   *  to, and by MobileCanvas, whose own top bar handles identity +
   *  actions at a higher z-index). */
  readonly onClose?: () => void;
}

export function AllDoorsStack({ doors, onClose }: AllDoorsStackProps) {
  const showHeader = Boolean(onClose);

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
        background: 'rgba(6, 6, 15, 0.92)',
      }}
    >
      {showHeader && (
        <header className="all-doors-header">
          <div className="all-doors-header-inner">
            <div>
              <div className="all-doors-header-namerow">
                <div className="all-doors-header-name">Borbála Szilágyi</div>
                <CvPill className="all-doors-header-cv" />
              </div>
              <div className="all-doors-header-title">
                Software Engineer · Team Lead
              </div>
            </div>
            <div className="all-doors-header-actions">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="back to canvas"
                  title="back to canvas"
                  className="all-doors-header-btn"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="all-doors-cards">
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

      <footer className="all-doors-footer">
        updated · {LAST_UPDATED_YEAR}
      </footer>
    </motion.div>
  );
}
