import { motion } from 'motion/react';

/**
 * The centre node: a stylised star with diffraction spikes and a soft halo.
 * Renders as HTML-positioned SVG so it stays a consistent visual size on any
 * viewport aspect.
 */
export function YouStar() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <motion.svg
        width="220"
        height="220"
        viewBox="-110 -110 220 220"
        animate={{ opacity: [0.92, 1, 0.92], scale: [1, 1.025, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="you-halo">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
            <stop offset="12%"  stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="32%"  stopColor="#a8d8ff" stopOpacity="0.22" />
            <stop offset="62%"  stopColor="#7a90c8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <linearGradient id="you-spike-v" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
            <stop offset="50%"  stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="you-spike-h" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
            <stop offset="50%"  stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Soft circular halo */}
        <circle cx="0" cy="0" r="100" fill="url(#you-halo)" />

        {/* Long diffraction spikes — vertical + horizontal */}
        <rect x="-0.7" y="-96" width="1.4" height="192" fill="url(#you-spike-v)" />
        <rect x="-96" y="-0.7" width="192" height="1.4" fill="url(#you-spike-h)" />

        {/* Shorter, dimmer diagonal spikes for 8-point sparkle */}
        <g transform="rotate(45)" opacity="0.5">
          <rect x="-0.5" y="-58" width="1" height="116" fill="url(#you-spike-v)" />
          <rect x="-58" y="-0.5" width="116" height="1" fill="url(#you-spike-h)" />
        </g>

        {/* Bright central core */}
        <circle cx="0" cy="0" r="4.4" fill="#ffffff" />
      </motion.svg>
    </div>
  );
}
