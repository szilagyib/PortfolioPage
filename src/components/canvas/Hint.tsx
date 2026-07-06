import { AnimatePresence, motion } from 'motion/react';

interface HintProps {
  readonly visible: boolean;
}

export function Hint({ visible }: HintProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(13, 18, 48, 0.78)',
            border: '1px solid var(--tech-line)',
            borderRadius: 5,
            padding: '6px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-bright)',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: 'var(--accent-cyan)' }}>▸</span>
          select a destination to start the puzzle
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <span style={{ color: 'var(--text-dim)' }}>or see everything ↗</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
