import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useCvClickFeedback } from '@/services/cv-feedback';

interface CvPillProps {
  readonly className?: string;
  readonly style?: CSSProperties;
}

const REST_SHADOW = '0 0 0 rgba(0, 0, 0, 0)';
const PEAK_SHADOW =
  '0 0 14px rgba(178, 212, 229, 0.32), 0 0 30px rgba(95, 184, 214, 0.14)';
const LABEL_TRANSITION = { duration: 0.18, ease: 'easeOut' } as const;

/**
 * "↓ CV" text pill used in the see-all sticky header (via
 * .all-doors-header-cv) and the mobile top bar (via inline style).
 * On click, the label swaps to "✓ saved" for ~1.4s and the pill
 * glows briefly — visitors get real feedback that the download
 * fired instead of a silent link.
 *
 * Motion `layout` smooths the width change between "↓ CV" and
 * "✓ saved" so the pill doesn't snap.
 */
export function CvPill({ className, style }: CvPillProps) {
  const { clicked, onClick } = useCvClickFeedback();

  return (
    <motion.a
      href="/SzilagyiBorbala_CV_EN_2026_NoPhoto.pdf"
      download
      aria-label="download CV"
      onClick={onClick}
      className={className}
      layout
      animate={{ boxShadow: clicked ? PEAK_SHADOW : REST_SHADOW }}
      transition={{ boxShadow: { duration: 0.35, ease: 'easeOut' } }}
      style={style}
    >
      <AnimatePresence mode="wait" initial={false}>
        {clicked ? (
          <motion.span
            key="ack"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={LABEL_TRANSITION}
            style={{ display: 'inline-flex', gap: 6, whiteSpace: 'nowrap' }}
          >
            ✓ saved
          </motion.span>
        ) : (
          <motion.span
            key="rest"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={LABEL_TRANSITION}
            style={{ display: 'inline-flex', gap: 6, whiteSpace: 'nowrap' }}
          >
            ↓ CV
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  );
}
