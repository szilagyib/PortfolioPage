import { motion } from 'motion/react';
import type { DoorId } from '@/domain/door';

interface PortalGlyphProps {
  readonly id: DoorId;
  readonly powered: boolean;
  /** Stroke colour for the planet's ring outline. */
  readonly ringColor: string;
  readonly size?: number;
}

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The orbital-portal glyph shown inside every destination tile. Most doors
 * use the plain ringed disc (`standard`). The `elsewhere` door uses a
 * tilted-ring planet — Saturn-style — to mark it as visually distinct
 * (the "off-world" destination where projects + writings live).
 */
export function PortalGlyph({ id, powered, ringColor, size = 38 }: PortalGlyphProps) {
  const variant: 'standard' | 'ringed' = id === 'elsewhere' ? 'ringed' : 'standard';
  const gradId = `portal-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 38"
      aria-hidden
      style={{ display: 'block', flex: '0 0 auto' }}
    >
      <defs>
        <radialGradient id={gradId}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.5" stopColor="var(--accent-violet)" />
          <stop offset="1" stopColor="var(--accent-violet)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {powered && (
        <motion.circle
          cx="19" cy="19" r="18"
          fill={`url(#${gradId})`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 0.5, ease: REVEAL_EASE }}
          style={{ transformOrigin: '19px 19px', transformBox: 'fill-box' }}
        />
      )}

      {variant === 'standard' && (
        <>
          <circle
            cx="19" cy="19"
            r={powered ? 10 : 8}
            fill="none"
            stroke={ringColor}
            strokeWidth={powered ? 2 : 1.5}
          />
          {!powered && <circle cx="19" cy="19" r="1.6" fill="var(--tech-label)" opacity="0.7" />}
          {powered && <circle cx="19" cy="19" r="3.5" fill="#fff" />}
        </>
      )}

      {variant === 'ringed' && (
        <>
          {/* Saturn ring — drawn under the body circle. When unpowered the
           *   body's opaque dark fill hides the ring's back half, giving a
           *   clean "ring behind the planet" silhouette. When powered the
           *   body becomes transparent so the lit halo glows through the
           *   interior (same as the other portals) — the ring then reads
           *   stylistically across the lit planet, which is intentional. */}
          <ellipse
            cx="19" cy="19"
            rx="17" ry="4.3"
            fill="none"
            stroke={powered ? 'var(--accent-violet)' : 'var(--tech-label)'}
            strokeWidth={powered ? 1.5 : 1.1}
            opacity={powered ? 1 : 0.75}
            transform="rotate(-22 19 19)"
          />
          <circle
            cx="19" cy="19"
            r={powered ? 10 : 8}
            /* Unpowered: opaque navy (close to the button's standby bg)
             *   so the ring's back half is occluded.
             * Powered: fill=none so the lit halo bleeds through the body,
             *   matching the standard portal's lit interior exactly. */
            fill={powered ? 'none' : 'rgba(10, 14, 32, 0.97)'}
            stroke={ringColor}
            strokeWidth={powered ? 2 : 1.5}
          />
          {!powered && <circle cx="19" cy="19" r="1.6" fill="var(--tech-label)" opacity="0.7" />}
          {powered && <circle cx="19" cy="19" r="3.5" fill="#fff" />}
        </>
      )}
    </svg>
  );
}
