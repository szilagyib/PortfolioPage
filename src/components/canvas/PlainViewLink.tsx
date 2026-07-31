import type { CSSProperties } from 'react';
import { motion } from 'motion/react';

interface PlainViewLinkProps {
  readonly style?: CSSProperties;
}

/**
 * Way out of the canvas, to the written profile at "/". That page links
 * back here from its top bar; without this the trip was one-way — a visitor
 * who wanted the content without the puzzle had no route to it.
 *
 * "written profile" rather than "full profile": the canvas already offers
 * "see everything", and two controls both promising everything is a coin
 * toss for the visitor. Naming the format says what actually differs —
 * one expands the canvas in place, this one leaves for a page you read.
 * "plain" was the other option and undersells it; that page is the fuller
 * of the two.
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
/* A quiet underlined link, not a pill. Boxed, it sat directly under the CV
 * control as a second bordered button, and the two arrows fought — ↓ meaning
 * "save this file" beside ↗ meaning "go elsewhere" reads as one confused
 * pair. Dropping the box and the arrow leaves the CV as the only button in
 * that corner, and a verb ("read the…") carries the affordance instead. */
const REST_BORDER = 'rgba(236, 200, 117, 0.4)';

export function PlainViewLink({ style }: PlainViewLinkProps) {
  return (
    <motion.a
      href="/"
      aria-label="View the full written profile"
      whileHover={{ color: '#f7d887' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.08em',
        textDecoration: 'none',
        color: 'var(--accent-warm)',
        whiteSpace: 'nowrap',
        borderBottom: `1px solid ${REST_BORDER}`,
        paddingBottom: 1,
        ...style,
      }}
    >
      read the written profile
    </motion.a>
  );
}
