/**
 * Glowing source orb on the left edge of the puzzle. Visually echoes the
 * centre YOU star — same cool-violet halo, smaller scale.
 */
export function SourceNode() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <svg viewBox="0 0 64 80" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id="src-glow">
            <stop offset="0%"   stopColor="#ffffff" />
            <stop offset="35%"  stopColor="var(--accent-cyan)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity="0" />
          </radialGradient>
          {/* Local gradient with userSpaceOnUse so it works on a zero-height line bbox. */}
          <linearGradient
            id="src-line-grad"
            gradientUnits="userSpaceOnUse"
            x1="28" y1="40" x2="64" y2="40"
          >
            <stop offset="0%"   stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-violet)" />
          </linearGradient>
        </defs>
        <circle cx={24} cy={40} r={20} fill="url(#src-glow)" opacity={0.85} />
        <circle cx={24} cy={40} r={5}  fill="#ffffff" />
        <line
          x1={28} y1={40} x2={64} y2={40}
          stroke="url(#src-line-grad)"
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
