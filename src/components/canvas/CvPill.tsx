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
  gap: 4,
  padding: '0 4px',
  color: 'inherit',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

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
      style={{ display: 'inline-flex', alignItems: 'center', ...style }}
    >
      <a
        href={CV_PDF_PATH}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="view CV"
        style={SEGMENT}
      >
        CV
      </a>

      <span
        aria-hidden
        style={{
          width: 1,
          alignSelf: 'stretch',
          margin: '1px 2px',
          background: 'rgba(95, 184, 214, 0.32)',
        }}
      />

      <a
        href={CV_PDF_PATH}
        download
        aria-label="download CV"
        onClick={onClick}
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
              ✓
            </motion.span>
          ) : (
            <motion.span
              key="rest"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={LABEL_TRANSITION}
            >
              ↓
            </motion.span>
          )}
        </AnimatePresence>
      </a>
    </motion.span>
  );
}
