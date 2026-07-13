import { AnimatePresence, motion } from 'motion/react';
import { useCvClickFeedback } from '@/services/cv-feedback';

/**
 * Quiet download affordance, mounted directly beneath SystemReadout so a
 * recruiter who reads the name + role sees the CV link immediately —
 * no puzzle, no door click required.
 *
 * On click, the pill acknowledges the download for ~1.4s: doc icon
 * swaps to a checkmark, "CV" swaps to "saved", and a soft cyan bloom
 * runs across the border-shadow. Feedback that the click landed,
 * without a toast or interruption.
 */
const REST_BORDER = 'rgba(95, 184, 214, 0.4)';
const REST_BG = 'rgba(13,18,48,0.55)';
const REST_SHADOW = '0 0 14px rgba(95, 184, 214, 0.08)';
const REST_COLOR = 'var(--accent-cyan)';

const HOVER_BORDER = 'rgba(178, 212, 229, 0.78)';
const HOVER_BG = 'rgba(40, 52, 88, 0.7)';
const HOVER_SHADOW = '0 0 18px rgba(178, 212, 229, 0.18)';
const HOVER_COLOR = 'var(--text-bright)';

const ACK_BORDER = 'rgba(178, 212, 229, 0.9)';
const ACK_SHADOW =
  '0 0 18px rgba(178, 212, 229, 0.4), 0 0 40px rgba(95, 184, 214, 0.18)';

const LABEL_TRANSITION = { duration: 0.2, ease: 'easeOut' } as const;

function DocIcon() {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Document outline with a folded top-right corner */}
      <path d="M2 1.5h5.2L10.5 4.6V12c0 0.28-0.22 0.5-0.5 0.5H2c-0.28 0-0.5-0.22-0.5-0.5V2c0-0.28 0.22-0.5 0.5-0.5z" />
      <path d="M7.2 1.5v3.1h3.3" />
      {/* Down-arrow inside the page */}
      <path d="M6 6.4v3.6" />
      <path d="M4.4 8.6L6 10.2l1.6-1.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 7.6L5 10.5l5-6" />
    </svg>
  );
}

export function CvDownload() {
  const { clicked, onClick } = useCvClickFeedback();

  return (
    <motion.a
      href="/SzilagyiBorbala_CV_EN_2026_NoPhoto.pdf"
      download
      aria-label="CV"
      onClick={onClick}
      layout
      animate={{
        borderColor: clicked ? ACK_BORDER : REST_BORDER,
        boxShadow: clicked ? ACK_SHADOW : REST_SHADOW,
        color: clicked ? HOVER_COLOR : REST_COLOR,
      }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      whileHover={{
        borderColor: HOVER_BORDER,
        background: HOVER_BG,
        boxShadow: HOVER_SHADOW,
        color: HOVER_COLOR,
      }}
      style={{
        position: 'absolute',
        top: 64,
        left: 22,
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
        background: REST_BG,
        color: REST_COLOR,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {clicked ? (
          <motion.span
            key="ack"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={LABEL_TRANSITION}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <CheckIcon />
            <span>saved</span>
          </motion.span>
        ) : (
          <motion.span
            key="rest"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={LABEL_TRANSITION}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <DocIcon />
            <span>CV</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  );
}
