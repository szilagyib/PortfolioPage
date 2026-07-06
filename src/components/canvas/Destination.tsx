import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import type { DoorId } from '@/domain/door';
import { PortalGlyph } from './PortalGlyph';

interface DestinationProps {
  readonly id: DoorId;
  readonly name: string;
  readonly tagline: string;
  readonly xPercent: number;
  readonly yPercent: number;
  readonly powered: boolean;
  readonly onSelect: () => void;
  /** When true, fade this destination back so the open artifact takes focus. */
  readonly dimmed?: boolean;
}

export function Destination({
  id, name, tagline, xPercent, yPercent, powered, onSelect, dimmed = false,
}: DestinationProps) {
  const statusText = powered ? 'open ✦' : 'standby';
  const accent = powered ? 'var(--accent-violet)' : 'var(--tech-muted)';
  const ringColor = powered ? '#fff' : 'var(--tech-label)';

  /**
   * Outer wrapper handles positioning + centering translate. Inner motion.button
   * handles only hover/tap scaling, so motion's transform changes never collide
   * with the translate(-50%, -50%) used to anchor on the orbit point.
   */
  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    left: `${xPercent}%`,
    top: `${yPercent}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    opacity: dimmed ? 0.18 : 1,
    pointerEvents: dimmed ? 'none' : 'auto',
    transition:
      'opacity var(--d-mid) var(--ease-out)',
  };

  const buttonStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '12px 16px',
    /*
     * Powered state: a soft "lit from within" radial — a quiet glow falls
     * from the top-centre of the card and fades into dark navy. Reads as a
     * room with the light on, not just a darker shape.
     */
    background: powered
      ? 'radial-gradient(ellipse 115% 110% at 50% -5%, ' +
          'rgba(178, 212, 229, 0.18) 0%, ' +
          'rgba(40, 52, 88, 0.82) 55%, ' +
          'rgba(18, 24, 52, 0.86) 100%)'
      : 'rgba(10, 14, 32, 0.76)',
    /*
     * Border colour pulled from the same accent tokens the route line uses,
     * so the destination edge reads as a continuation of the connecting line
     * rather than a separate visual element.
     *   powered  ↔ accent-violet (pale cyan, matches the line's destination end)
     *   standby  ↔ accent-cyan   (matches the line's YOU end)
     */
    border: powered
      ? '1px solid rgba(178, 212, 229, 0.78)'
      : '1px solid rgba(95, 184, 214, 0.6)',
    borderRadius: 10,
    backdropFilter: 'blur(8px)',
    transition:
      'border-color var(--d-fast) var(--ease-out), ' +
      'background var(--d-fast) var(--ease-out), ' +
      'box-shadow var(--d-fast) var(--ease-out)',
    /* Multi-layer halo fades outward — softening the join with the route line. */
    boxShadow: powered
      ? '0 0 0 1px rgba(178, 212, 229, 0.16), ' +
        '0 0 28px rgba(178, 212, 229, 0.22), ' +
        '0 0 64px rgba(178, 212, 229, 0.10), ' +
        'inset 0 0 14px rgba(178, 212, 229, 0.10)'
      : '0 0 0 1px rgba(95, 184, 214, 0.14), ' +
        '0 0 24px rgba(95, 184, 214, 0.10), ' +
        '0 4px 18px rgba(0, 0, 0, 0.35)',
    cursor: 'pointer',
    minWidth: 148,
    color: 'var(--text-bright)',
    textAlign: 'center',
  };
  // ringColor and accent still inform the icon below
  void accent;

  return (
    <div style={wrapperStyle}>
      <motion.button
        type="button"
        onClick={onSelect}
        aria-label={`${name} — ${statusText}`}
        data-door-id={id}
        data-powered={powered}
        style={buttonStyle}
        className="destination"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <PortalGlyph id={id} powered={powered} ringColor={ringColor} />
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
            maxWidth: 200,
          }}
        >
          {tagline}
        </div>
      </motion.button>
    </div>
  );
}
