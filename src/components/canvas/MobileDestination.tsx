import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import type { DoorId } from '@/domain/door';
import { PortalGlyph } from './PortalGlyph';

interface MobileDestinationProps {
  readonly id: DoorId;
  readonly name: string;
  readonly tagline: string;
  readonly powered: boolean;
  readonly onSelect: () => void;
}

/**
 * Row-style destination used on mobile only. A round node-glyph on the left
 * (echoes the orbit nodes on desktop), name + tagline stacked to the right.
 * Tapping fires `onSelect` — Canvas decides whether to open the puzzle or
 * the artifact card based on `powered`.
 */
export function MobileDestination({
  id, name, tagline, powered, onSelect,
}: MobileDestinationProps) {
  const ringColor = powered ? '#fff' : 'var(--tech-label)';

  const buttonStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 16px',
    background: powered
      ? 'radial-gradient(ellipse 110% 130% at 0% 50%, ' +
          'rgba(178, 212, 229, 0.22) 0%, ' +
          'rgba(40, 52, 88, 0.82) 60%, ' +
          'rgba(18, 24, 52, 0.86) 100%)'
      : 'rgba(10, 14, 32, 0.78)',
    border: powered
      ? '1px solid rgba(178, 212, 229, 0.78)'
      : '1px solid rgba(95, 184, 214, 0.55)',
    borderRadius: 10,
    backdropFilter: 'blur(8px)',
    boxShadow: powered
      ? '0 0 0 1px rgba(178, 212, 229, 0.16), ' +
        '0 0 24px rgba(178, 212, 229, 0.18), ' +
        'inset 0 0 12px rgba(178, 212, 229, 0.08)'
      : '0 0 0 1px rgba(95, 184, 214, 0.12), ' +
        '0 0 18px rgba(95, 184, 214, 0.08), ' +
        '0 2px 14px rgba(0, 0, 0, 0.35)',
    color: 'var(--text-bright)',
    cursor: 'pointer',
    textAlign: 'left',
  };

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={`${name} — ${powered ? 'open' : 'standby'}`}
      data-door-id={id}
      data-powered={powered}
      style={buttonStyle}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <PortalGlyph id={id} powered={powered} ringColor={ringColor} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            letterSpacing: '0.08em',
            color: 'var(--text-bright)',
            lineHeight: 1.2,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
          }}
        >
          <span>{name}</span>
          {powered && (
            <span aria-label="open" style={{ color: 'var(--accent-cyan)', fontSize: 11 }}>
              ✦
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'var(--text-dim)',
            marginTop: 2,
          }}
        >
          {tagline}
        </div>
      </div>
    </motion.button>
  );
}
