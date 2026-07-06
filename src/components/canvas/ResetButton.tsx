import type { MouseEventHandler } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface ResetButtonProps {
  readonly visible: boolean;
  readonly onClick: MouseEventHandler<HTMLButtonElement>;
}

const REST_BORDER  = 'rgba(95, 184, 214, 0.4)';
const REST_BG      = 'rgba(13, 18, 48, 0.55)';
const REST_SHADOW  = '0 0 14px rgba(95, 184, 214, 0.08)';
const REST_COLOR   = 'var(--accent-cyan)';
const HOVER_BORDER = 'rgba(178, 212, 229, 0.78)';
const HOVER_BG     = 'rgba(40, 52, 88, 0.7)';
const HOVER_SHADOW = '0 0 18px rgba(178, 212, 229, 0.18)';
const HOVER_COLOR  = 'var(--text-bright)';

/**
 * Quiet "start over" button — only appears once at least one door has been
 * opened, so the canvas stays uncluttered on first visit.
 */
export function ResetButton({ visible, onClick }: ResetButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={onClick}
          aria-label="start over"
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 6 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: 14,
            right: 18,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.06em',
            color: REST_COLOR,
            border: `1px solid ${REST_BORDER}`,
            padding: '4px 9px',
            borderRadius: 4,
            background: REST_BG,
            boxShadow: REST_SHADOW,
            zIndex: 5,
            cursor: 'pointer',
            transition:
              'border-color var(--d-fast) var(--ease-out), ' +
              'background var(--d-fast) var(--ease-out), ' +
              'box-shadow var(--d-fast) var(--ease-out), ' +
              'color var(--d-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = HOVER_BORDER;
            e.currentTarget.style.background = HOVER_BG;
            e.currentTarget.style.boxShadow = HOVER_SHADOW;
            e.currentTarget.style.color = HOVER_COLOR;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = REST_BORDER;
            e.currentTarget.style.background = REST_BG;
            e.currentTarget.style.boxShadow = REST_SHADOW;
            e.currentTarget.style.color = REST_COLOR;
          }}
        >
          ↻ start over
        </motion.button>
      )}
    </AnimatePresence>
  );
}
