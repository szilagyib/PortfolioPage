import type { CSSProperties } from 'react';
import { motion } from 'motion/react';

interface PlainViewLinkProps {
  readonly style?: CSSProperties;
}

/**
 * Way out of the canvas. The plain page links back here from its top bar;
 * without this the trip was one-way — a visitor who wanted the content
 * without the puzzle had no route to it.
 *
 * Deliberately gold. It's the one piece of canvas chrome pointing at the
 * other surface, so the accent that carries the plain page reads as "the
 * other version of this site" rather than as a second brand colour. Cyan
 * stays the canvas's own colour; this is the only warm control here, which
 * is what keeps it legible as a signal.
 *
 * Kept visually lighter than "see everything" — that stays the primary
 * action, since it reveals the content without leaving the experience.
 */
const REST_BORDER = 'rgba(236, 200, 117, 0.4)';
const HOVER_BORDER = 'rgba(236, 200, 117, 0.8)';

export function PlainViewLink({ style }: PlainViewLinkProps) {
  return (
    <motion.a
      href="/"
      aria-label="View the full written profile"
      whileHover={{
        borderColor: HOVER_BORDER,
        background: 'rgba(236, 200, 117, 0.12)',
        color: '#f7d887',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.06em',
        textDecoration: 'none',
        padding: '4px 9px',
        border: `1px solid ${REST_BORDER}`,
        borderRadius: 4,
        background: 'rgba(13, 18, 48, 0.55)',
        color: 'var(--accent-warm)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      full profile ↗
    </motion.a>
  );
}
