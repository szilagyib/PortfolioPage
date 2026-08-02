import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CV_PDF_PATH } from '@/config/cv';
import { useCvClickFeedback } from '@/services/cv-feedback';

interface CvPillProps {
  readonly className?: string;
  readonly style?: CSSProperties;
}

const REST_SHADOW = '0 0 0 rgba(0, 0, 0, 0)';
const PEAK_SHADOW =
  '0 0 14px rgba(178, 212, 229, 0.32), 0 0 30px rgba(95, 184, 214, 0.14)';
const LABEL_TRANSITION = { duration: 0.18, ease: 'easeOut' } as const;

const SEGMENT: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  /* Padding belongs to the segments, not the pill: it is what makes each
   * half its own hit target rather than two labels sharing one button. */
  padding: '2px 6px',
  /* Collapse the leading so the box the flexbox centres is the type
   * itself. With inherited line-height the box carried leading the label
   * never used, and the pair rode high in the pill. */
  lineHeight: 1,
  color: 'inherit',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

/* Both labels are cap-height only — "CV" has no descender and the arrow
 * sits on the baseline — so the ink lands slightly above the centre of a
 * box that still reserves descender space. Half a pixel down puts the
 * glyphs on the optical centre rather than the metric one. */
const LABEL: CSSProperties = { transform: 'translateY(0.5px)' };

const SEGMENT_HOVER = {
  background: 'rgba(95, 184, 214, 0.16)',
  color: 'var(--text-bright)',
} as const;

/**
 * Compact CV pill used in the see-all sticky header (via
 * .all-doors-header-cv) and the mobile top bar (via inline style).
 *
 * Carries both actions in the width the old "↓ CV" label used: "CV"
 * opens the PDF in a new tab, "↓" saves it. On phones especially,
 * viewing beats a forced download — the browser's own PDF viewer has a
 * save button anyway.
 *
 * The download segment swaps "↓" to "✓" for ~1.4s and the pill glows,
 * so visitors get real feedback instead of a silent link. Motion
 * `layout` keeps the width from snapping during the swap.
 */
export function CvPill({ className, style }: CvPillProps) {
  const { clicked, onClick } = useCvClickFeedback();

  return (
    <motion.span
      className={className}
      layout
      animate={{ boxShadow: clicked ? PEAK_SHADOW : REST_SHADOW }}
      transition={{ boxShadow: { duration: 0.35, ease: 'easeOut' } }}
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        ...style,
        /* After the spread: the hover wash on a segment has to be clipped to
         * the pill's rounded corners, and the caller never needs to override
         * this. Padding stays the caller's, so the mobile bar keeps its
         * shared pill height. */
        overflow: 'hidden',
      }}
    >
      <motion.a
        href={CV_PDF_PATH}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="view CV"
        whileHover={SEGMENT_HOVER}
        style={SEGMENT}
      >
        <span style={LABEL}>CV</span>
      </motion.a>

      <span
        aria-hidden
        style={{
          width: 1,
          alignSelf: 'stretch',
          background: 'rgba(95, 184, 214, 0.32)',
        }}
      />

      <motion.a
        href={CV_PDF_PATH}
        download
        aria-label="download CV"
        onClick={onClick}
        whileHover={SEGMENT_HOVER}
        style={SEGMENT}
      >
        <AnimatePresence mode="wait" initial={false}>
          {clicked ? (
            <motion.span
              key="ack"
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={LABEL_TRANSITION}
            >
              <span style={LABEL}>✓</span>
            </motion.span>
          ) : (
            <motion.span
              key="rest"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={LABEL_TRANSITION}
            >
              <span style={LABEL}>↓</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.a>
    </motion.span>
  );
}
