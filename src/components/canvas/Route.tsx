import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { DoorId } from '@/domain/door';

interface RouteProps {
  readonly id: DoorId;
  /** All coordinates are in stage percentages (0–100). */
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
  readonly powered: boolean;
  /** Fade the route while a card is expanded over the canvas. */
  readonly dimmed?: boolean;
}

export function Route({ id, fromX, fromY, toX, toY, powered, dimmed = false }: RouteProps) {
  const gradientId = `route-${id}-${powered ? 'on' : 'off'}`;

  const baseColor = powered ? 'var(--accent-cyan)' : 'var(--tech-muted)';
  const midColor  = powered ? 'var(--accent-violet)' : 'var(--tech-muted)';
  const peakOpacity = powered ? 1 : 0.7;

  const dasharray = powered ? undefined : '0.5,1.5';

  /**
   * One-shot power-up particle. It used to render on every re-render of
   * Route — so closing a card (which toggles `dimmed`) replayed the white
   * dot along every powered route. Now the particle only mounts during a
   * ~720 ms window after `powered` transitions false → true.
   */
  const [particleVisible, setParticleVisible] = useState(false);
  const wasPoweredRef = useRef(powered);
  useEffect(() => {
    if (powered && !wasPoweredRef.current) {
      setParticleVisible(true);
      const t = window.setTimeout(() => setParticleVisible(false), 720);
      wasPoweredRef.current = true;
      return () => window.clearTimeout(t);
    }
    wasPoweredRef.current = powered;
  }, [powered]);

  return (
    <motion.g
      aria-hidden
      initial={false}
      animate={{ opacity: dimmed ? 0.18 : 1 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={fromX} y1={fromY} x2={toX} y2={toY}
        >
          <stop offset="0%"  stopColor={baseColor} stopOpacity="0" />
          <stop offset="14%" stopColor={baseColor} stopOpacity={peakOpacity} />
          <stop offset="86%" stopColor={midColor}  stopOpacity={peakOpacity} />
          <stop offset="100%" stopColor={midColor}  stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1={fromX} y1={fromY} x2={toX} y2={toY}
        stroke={`url(#${gradientId})`}
        strokeWidth={powered ? 2.5 : 1.5}
        strokeDasharray={dasharray}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
      {particleVisible && (
        <motion.circle
          r="0.8"
          fill="#fff"
          initial={{ cx: fromX, cy: fromY, opacity: 0.95 }}
          animate={{ cx: toX, cy: toY, opacity: [0.95, 0.95, 0] }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      )}
    </motion.g>
  );
}
