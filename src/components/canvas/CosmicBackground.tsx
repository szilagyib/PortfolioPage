import { useEffect, useMemo, useRef, type CSSProperties } from 'react';

type StarTint = 'white' | 'cool' | 'warm';

interface Star {
  readonly xPercent: number;
  readonly yPercent: number;
  readonly r: number;
  readonly o: number;
  readonly tint: StarTint;
  readonly bright: boolean;
}

interface Nebula {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly color: string;
}

const STAR_FILL: Record<StarTint, string> = {
  white: '#ffffff',
  cool:  '#dbeaff',
  warm:  '#ffeed1',
};

function pseudoRandom(seed: number, i: number): number {
  const x = Math.sin(seed * 9301 + i * 49297) * 233280;
  return x - Math.floor(x);
}

function generateStars(count: number, seed = 1): readonly Star[] {
  return Array.from({ length: count }, (_, i) => {
    const sizeRoll = pseudoRandom(seed, i * 11);
    const r =
      sizeRoll < 0.78 ? 0.5 + pseudoRandom(seed, i * 3) * 0.6
      : sizeRoll < 0.96 ? 1.2 + pseudoRandom(seed, i * 7) * 0.6
      :                   2.0 + pseudoRandom(seed, i * 9) * 1.2;
    const tintRoll = pseudoRandom(seed, i * 13);
    const tint: StarTint =
      tintRoll < 0.72 ? 'white' :
      tintRoll < 0.9  ? 'cool'  :
                        'warm';
    return {
      xPercent: pseudoRandom(seed, i * 2) * 100,
      yPercent: pseudoRandom(seed, i * 2 + 1) * 100,
      r,
      o: 0.5 + pseudoRandom(seed, i * 5) * 0.5,
      tint,
      bright: sizeRoll >= 0.96,
    };
  });
}

const STAR_COUNT = 90;
const ANIM_MIN_RADIUS = 1.2;

const NEBULAS: readonly Nebula[] = [
  { x: 18, y: 22, r: 38, color: 'rgba(122, 200, 255, 0.10)' },
  { x: 82, y: 30, r: 36, color: 'rgba(178, 212, 229, 0.08)' },
  { x: 65, y: 78, r: 42, color: 'rgba(236, 200, 117, 0.06)' },
  { x: 24, y: 78, r: 34, color: 'rgba(178, 212, 229, 0.06)' },
];

export function CosmicBackground() {
  const stars = useMemo(() => generateStars(STAR_COUNT), []);
  // Animate only mid + anchor stars; dust stays static.
  // Cuts ~70 ongoing animations on first paint with no visual loss.
  const animated = useMemo(() => stars.filter((s) => s.r >= ANIM_MIN_RADIUS), [stars]);
  const staticDust = useMemo(() => stars.filter((s) => s.r < ANIM_MIN_RADIUS), [stars]);
  const brightStars = useMemo(() => stars.filter((s) => s.bright), [stars]);

  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * Mouse-reactive parallax. Reads the pointer position once per move,
   * normalises to [-1, 1] from viewport centre, then lerps current toward
   * target each frame and writes two CSS vars on the root. Each star layer
   * uses those vars with a different multiplier (depth-dependent), so the
   * background feels three-dimensional without any per-star JS work.
   *
   * Respects prefers-reduced-motion: the effect is skipped entirely and
   * the vars stay at 0.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = rootRef.current;
    if (!root) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const smoothing = 0.08;

    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      targetX = (e.clientX / w) * 2 - 1;
      targetY = (e.clientY / h) * 2 - 1;
    };

    let raf = 0;
    const tick = () => {
      currentX += (targetX - currentX) * smoothing;
      currentY += (targetY - currentY) * smoothing;
      root.style.setProperty('--parallax-x', currentX.toFixed(3));
      root.style.setProperty('--parallax-y', currentY.toFixed(3));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background:
          'linear-gradient(180deg, #050818 0%, #0a0a2c 38%, #161236 62%, #06051a 100%)',
        overflow: 'hidden',
        // Parallax vars default to 0 so the page renders correctly before
        // the rAF loop has a chance to set them (and on reduced-motion).
        ['--parallax-x' as string]: '0',
        ['--parallax-y' as string]: '0',
      }}
    >
      {/* Two soft, circular nebula washes (CSS gradients keep them round).
       *   Drift gently with the cursor — they sit "deepest" in the field,
       *   so the multiplier is small. */}
      <div
        style={{
          position: 'absolute',
          left: '28%', top: '32%',
          width: '70vmax', height: '70vmax',
          transform:
            'translate(-50%, -50%) ' +
            'translate3d(calc(var(--parallax-x) * 6px), calc(var(--parallax-y) * 6px), 0)',
          background:
            'radial-gradient(circle, rgba(122, 200, 255, 0.10) 0%, rgba(0, 0, 0, 0) 60%)',
          willChange: 'transform',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '72%', top: '68%',
          width: '70vmax', height: '70vmax',
          transform:
            'translate(-50%, -50%) ' +
            'translate3d(calc(var(--parallax-x) * 6px), calc(var(--parallax-y) * 6px), 0)',
          background:
            'radial-gradient(circle, rgba(178, 212, 229, 0.08) 0%, rgba(0, 0, 0, 0) 60%)',
          willChange: 'transform',
        }}
      />

      {/* Subtle warm horizon hint near the lower third */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 32% at 50% 78%, rgba(236, 200, 117, 0.045) 0%, rgba(0, 0, 0, 0) 65%)',
        }}
      />

      {/* Halo behind anchor stars — foreground layer, parallaxes most. */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          transform:
            'translate3d(calc(var(--parallax-x) * 22px), calc(var(--parallax-y) * 22px), 0)',
          willChange: 'transform',
        }}
      >
        {brightStars.map((s, i) => (
          <circle
            key={`halo-${i}`}
            cx={`${s.xPercent}%`}
            cy={`${s.yPercent}%`}
            r={s.r * 3.5}
            fill={STAR_FILL[s.tint]}
            opacity={0.16}
          />
        ))}
      </svg>

      {/* Static dust stars — deepest layer, smallest drift. */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          transform:
            'translate3d(calc(var(--parallax-x) * 8px), calc(var(--parallax-y) * 8px), 0)',
          willChange: 'transform',
        }}
      >
        {staticDust.map((s, i) => (
          <circle
            key={`d-${i}`}
            cx={`${s.xPercent}%`}
            cy={`${s.yPercent}%`}
            r={s.r}
            fill={STAR_FILL[s.tint]}
            opacity={s.o}
          />
        ))}
      </svg>

      {/* Mid + anchor stars twinkle via a single CSS keyframe — mid-layer drift. */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          transform:
            'translate3d(calc(var(--parallax-x) * 15px), calc(var(--parallax-y) * 15px), 0)',
          willChange: 'transform',
        }}
      >
        {animated.map((s, i) => {
          const style: CSSProperties = {
            ['--star-op-max' as string]: s.o,
            ['--star-op-min' as string]: s.o * 0.35,
            animation: `star-twinkle ${5 + (i % 7)}s ease-in-out ${i * 0.13}s infinite`,
          };
          return (
            <circle
              key={`a-${i}`}
              cx={`${s.xPercent}%`}
              cy={`${s.yPercent}%`}
              r={s.r}
              fill={STAR_FILL[s.tint]}
              opacity={s.o}
              style={style}
            />
          );
        })}
      </svg>

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.55) 100%)',
        }}
      />
    </div>
  );
}
