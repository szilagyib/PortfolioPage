import { AnimatePresence, motion } from 'motion/react';
import { CV_PDF_PATH } from '@/config/cv';
import { useCvClickFeedback } from '@/services/cv-feedback';

/**
 * Quiet CV affordance, mounted directly beneath SystemReadout so anyone who
 * reads the name and role sees it immediately — no puzzle, no door click
 * required.
 *
 * Two actions inside one frame: "CV" opens the PDF in a new tab, "↓"
 * saves it. Viewing is the primary action because it's a one-page PDF
 * and most visitors want a glance, not a file — a forced download made
 * the cheap look expensive.
 *
 * The download segment still acknowledges the click for ~1.4s: "↓"
 * swaps to a checkmark and a soft cyan bloom runs across the
 * border-shadow, so the click doesn't land silently.
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

const SEGMENT = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: 'inherit',
  textDecoration: 'none',
  padding: '4px 9px',
} as const;

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
    </svg>
  );
}

export function CvDownload() {
  const { clicked, onClick } = useCvClickFeedback();

  return (
    <motion.div
      layout
      animate={{
        borderColor: clicked ? ACK_BORDER : REST_BORDER,
        boxShadow: clicked ? ACK_SHADOW : REST_SHADOW,
        color: clicked ? HOVER_COLOR : REST_COLOR,
      }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: 64,
        left: 22,
        display: 'inline-flex',
        alignItems: 'stretch',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.06em',
        border: `1px solid ${REST_BORDER}`,
        borderRadius: 4,
        background: REST_BG,
        color: REST_COLOR,
        overflow: 'hidden',
      }}
    >
      <motion.a
        href={CV_PDF_PATH}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="view CV"
        whileHover={{ background: HOVER_BG, color: HOVER_COLOR }}
        style={SEGMENT}
      >
        <DocIcon />
        <span>CV</span>
      </motion.a>

      <span
        aria-hidden
        style={{ width: 1, background: 'rgba(95, 184, 214, 0.32)' }}
      />

      <motion.a
        href={CV_PDF_PATH}
        download
        aria-label="download CV"
        onClick={onClick}
        whileHover={{ background: HOVER_BG, color: HOVER_COLOR }}
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
      </motion.a>
    </motion.div>
  );
}
