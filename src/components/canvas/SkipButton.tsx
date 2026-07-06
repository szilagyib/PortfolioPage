import type { MouseEventHandler } from 'react';

interface SkipButtonProps {
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
}

const REST_BORDER  = 'rgba(95, 184, 214, 0.4)';
const REST_BG      = 'rgba(13, 18, 48, 0.55)';
const REST_SHADOW  = '0 0 14px rgba(95, 184, 214, 0.08)';
const REST_COLOR   = 'var(--accent-cyan)';
const HOVER_BORDER = 'rgba(178, 212, 229, 0.78)';
const HOVER_BG     = 'rgba(40, 52, 88, 0.7)';
const HOVER_SHADOW = '0 0 18px rgba(178, 212, 229, 0.18)';
const HOVER_COLOR  = 'var(--text-bright)';

export function SkipButton({ onClick }: SkipButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        top: 14,
        right: 130,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.06em',
        color: REST_COLOR,
        border: `1px solid ${REST_BORDER}`,
        padding: '4px 9px',
        borderRadius: 4,
        background: REST_BG,
        boxShadow: REST_SHADOW,
        transition:
          'border-color var(--d-fast) var(--ease-out), ' +
          'background var(--d-fast) var(--ease-out), ' +
          'box-shadow var(--d-fast) var(--ease-out), ' +
          'color var(--d-fast) var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = HOVER_BORDER;
        e.currentTarget.style.background = HOVER_BG;
        e.currentTarget.style.boxShadow = HOVER_SHADOW;
        e.currentTarget.style.color = HOVER_COLOR;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = REST_BORDER;
        e.currentTarget.style.background = REST_BG;
        e.currentTarget.style.boxShadow = REST_SHADOW;
        e.currentTarget.style.color = REST_COLOR;
      }}
    >
      ⤓ see everything
    </button>
  );
}
