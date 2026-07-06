/**
 * Quiet download affordance, mounted directly beneath SystemReadout so a
 * recruiter who reads the name + role sees the CV link immediately —
 * no puzzle, no door click required.
 */
export function CvDownload() {
  return (
    <a
      href="/SzilagyiBorbala_CV_EN_2026_NoPhoto.pdf"
      download
      aria-label="CV"
      style={{
        position: 'absolute',
        top: 64,
        left: 22,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.06em',
        color: 'var(--accent-cyan)',
        textDecoration: 'none',
        padding: '4px 9px',
        border: '1px solid rgba(95, 184, 214, 0.4)',
        borderRadius: 4,
        background: 'rgba(13,18,48,0.55)',
        boxShadow: '0 0 14px rgba(95, 184, 214, 0.08)',
        transition:
          'border-color var(--d-fast) var(--ease-out), ' +
          'background var(--d-fast) var(--ease-out), ' +
          'box-shadow var(--d-fast) var(--ease-out), ' +
          'color var(--d-fast) var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(178, 212, 229, 0.78)';
        e.currentTarget.style.background = 'rgba(40, 52, 88, 0.7)';
        e.currentTarget.style.boxShadow = '0 0 18px rgba(178, 212, 229, 0.18)';
        e.currentTarget.style.color = 'var(--text-bright)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(95, 184, 214, 0.4)';
        e.currentTarget.style.background = 'rgba(13,18,48,0.55)';
        e.currentTarget.style.boxShadow = '0 0 14px rgba(95, 184, 214, 0.08)';
        e.currentTarget.style.color = 'var(--accent-cyan)';
      }}
    >
      <svg
        width="12"
        height="14"
        viewBox="0 0 12 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {/* Document outline with a folded top-right corner */}
        <path d="M2 1.5h5.2L10.5 4.6V12c0 0.28-0.22 0.5-0.5 0.5H2c-0.28 0-0.5-0.22-0.5-0.5V2c0-0.28 0.22-0.5 0.5-0.5z" />
        <path d="M7.2 1.5v3.1h3.3" />
        {/* Down-arrow inside the page */}
        <path d="M6 6.4v3.6" />
        <path d="M4.4 8.6L6 10.2l1.6-1.6" />
      </svg>
      <span>CV</span>
    </a>
  );
}
