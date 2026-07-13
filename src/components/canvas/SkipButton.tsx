import type { MouseEventHandler } from 'react';
import { motion } from 'motion/react';

interface SkipButtonProps {
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Adds a restrained ambient glow while nothing has been engaged yet. */
  readonly highlight?: boolean;
}

const REST_BORDER  = 'rgba(95, 184, 214, 0.4)';
const REST_BG      = 'rgba(13, 18, 48, 0.55)';
const REST_SHADOW  = '0 0 12px rgba(178, 212, 229, 0.06), 0 0 28px rgba(95, 184, 214, 0)';
const REST_COLOR   = 'var(--accent-cyan)';
const PEAK_SHADOW  = '0 0 12px rgba(178, 212, 229, 0.32), 0 0 28px rgba(95, 184, 214, 0.14)';
const HOVER_BORDER = 'rgba(178, 212, 229, 0.78)';
const HOVER_BG     = 'rgba(40, 52, 88, 0.7)';
const HOVER_SHADOW = '0 0 18px rgba(178, 212, 229, 0.18)';
const HOVER_COLOR  = 'var(--text-bright)';

export function SkipButton({ onClick, highlight = false }: SkipButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={
        highlight
          ? { boxShadow: [REST_SHADOW, PEAK_SHADOW, REST_SHADOW] }
          : { boxShadow: REST_SHADOW }
      }
      transition={
        highlight
          ? { boxShadow: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } }
          : { duration: 0.3, ease: 'easeOut' }
      }
      whileHover={{
        borderColor: HOVER_BORDER,
        background: HOVER_BG,
        boxShadow: HOVER_SHADOW,
        color: HOVER_COLOR,
      }}
      style={{
        position: 'absolute',
        top: 14,
        right: 130,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.06em',
        color: REST_COLOR,
        border: `1px solid ${REST_BORDER}`,
        padding: '4px 9px',
        borderRadius: 4,
        background: REST_BG,
      }}
    >
      ⤓ see everything
    </motion.button>
  );
}
