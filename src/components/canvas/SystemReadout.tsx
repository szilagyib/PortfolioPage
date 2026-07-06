/**
 * Quiet identity block in the top-left corner. Just name + role, no sci-fi
 * HUD framing.
 */
export function SystemReadout() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 18,
        left: 22,
        fontFamily: 'var(--font-mono)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontSize: 15,
          color: 'var(--text-bright)',
          letterSpacing: '0.03em',
          fontWeight: 500,
        }}
      >
        Borbála Szilágyi
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-dim)',
          letterSpacing: '0.06em',
          marginTop: 3,
        }}
      >
        Software Engineer · Team Lead
      </div>
    </div>
  );
}
