import { motion } from 'motion/react';

interface DestinationNodeProps {
  readonly name: string;
  readonly lit: boolean;
}

/**
 * The puzzle's destination node — door module on the right edge that lights
 * up when starlight reaches it.
 */
export function DestinationNode({ name, lit }: DestinationNodeProps) {
  const accent = lit ? 'var(--accent-warm)' : 'var(--tech-muted)';
  const fill   = lit ? 'rgba(236, 200, 117, 0.16)' : 'rgba(13, 18, 48, 0.35)';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <svg
        viewBox="0 0 64 80"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Local gradient with userSpaceOnUse — independent of line bbox. */}
          <linearGradient
            id="dest-line-grad"
            gradientUnits="userSpaceOnUse"
            x1="0" y1="40" x2="20" y2="40"
          >
            <stop offset="0%"   stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-violet)" />
          </linearGradient>
        </defs>
        <line
          x1={0} y1={40} x2={20} y2={40}
          stroke={lit ? 'url(#dest-line-grad)' : 'rgba(140, 165, 210, 0.4)'}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <motion.rect
          x={20} y={18} width={38} height={44} rx={5}
          stroke={accent}
          strokeWidth={2}
          fill={fill}
          animate={lit ? { strokeOpacity: [0.7, 1, 0.7] } : { strokeOpacity: 1 }}
          transition={lit ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />
        <text
          x={39}
          y={43}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill={accent}
          letterSpacing="0.04em"
        >
          {name.slice(0, 4)}
        </text>
        {lit && (
          <text
            x={39}
            y={55}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="7"
            fill="var(--accent-cyan)"
          >
            ✦
          </text>
        )}
      </svg>
    </div>
  );
}
