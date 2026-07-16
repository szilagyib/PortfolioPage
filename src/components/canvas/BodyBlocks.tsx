import { Fragment, type ReactNode } from 'react';
import type { Door } from '@/domain/door';
import type { ArtifactBlock, ContactIconKind } from '@/domain/artifact';
import { AiChat } from '@/components/ai/AiChat';

function ContactIcon({ kind }: { kind: ContactIconKind }) {
  const common = {
    width: 22, height: 22,
    'aria-hidden': true,
    style: { display: 'block', color: 'var(--accent-cyan)' } as const,
  };
  switch (kind) {
    case 'github':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-1.94c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 015.77 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0z"/>
        </svg>
      );
    case 'mail':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
  }
}

function contactDisplay(href: string): string {
  return href.replace(/^(https?:\/\/(www\.)?|mailto:)/, '');
}

function isExternal(href: string): boolean {
  return /^https?:/.test(href);
}

function exhaustive(x: never): never {
  throw new Error(`Unhandled artifact block kind: ${JSON.stringify(x)}`);
}

function renderBlock(b: ArtifactBlock, i: number): ReactNode {
  switch (b.kind) {
    case 'heading':
      return (
        <h2 key={i} style={{ margin: '0 0 4px', fontSize: 'var(--fs-h2)', lineHeight: 1.25 }}>
          {b.text}
        </h2>
      );

    case 'paragraph':
      return (
        <p key={i} style={{ margin: '12px 0', lineHeight: 1.65 }}>
          {b.text}
        </p>
      );

    case 'bullet':
      /* Bullets sit flush with the surrounding paragraph text — the marker
       * lives inside a 1.1em hanging-indent so multi-line items wrap cleanly
       * without leaving the bullet floating in a separate column. */
      return (
        <ul
          key={i}
          style={{
            margin: '12px 0',
            paddingLeft: '1.1em',
            lineHeight: 1.65,
            listStylePosition: 'outside',
          }}
        >
          {b.items.map((item, j) => (
            <li key={j} style={{ marginBottom: 6 }}>{item}</li>
          ))}
        </ul>
      );

    case 'metric':
      /* Vertical stack: hero value on top, small mono label below. Hairline
       * border + inset top highlight give a subtle glass lift consistent
       * with the artifact panel. `.metric-block` still carries
       * `whiteSpace: nowrap` on wider viewports to keep each label on one
       * line, and drops to normal wrapping on phones. */
      return (
        <div
          key={i}
          className="metric-block"
          style={{
            padding: '12px 14px 10px',
            border: '1px solid rgba(178, 212, 229, 0.14)',
            borderRadius: 10,
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            background: 'linear-gradient(180deg, rgba(178, 212, 229, 0.03), transparent)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <div
            style={{
              color: 'var(--accent-cyan)',
              fontSize: 'var(--fs-h2)',
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {b.value}
          </div>
          <div
            style={{
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
            }}
          >
            {b.label}
          </div>
        </div>
      );

    case 'quote':
      return (
        <blockquote
          key={i}
          style={{
            borderLeft: '2px solid var(--accent-violet)',
            margin: '20px 0',
            paddingLeft: 16,
            color: 'var(--text-bright)',
            fontStyle: 'italic',
            lineHeight: 1.65,
          }}
        >
          {b.text}
          {b.attribution && (
            <footer style={{ marginTop: 8, fontSize: 'var(--fs-label)', color: 'var(--text-dim)' }}>
              — {b.attribution}
            </footer>
          )}
        </blockquote>
      );

    case 'productList':
      return (
        <ul
          key={i}
          style={{
            margin: '10px 0 4px',
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {b.products.map((p, j) => (
            <li
              key={j}
              style={{
                padding: '10px 0',
                borderTop: j === 0
                  ? '1px solid rgba(178, 212, 229, 0.12)'
                  : 'none',
                borderBottom: '1px solid rgba(178, 212, 229, 0.12)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <strong style={{ color: 'var(--text-bright)' }}>{p.name}</strong>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-readout)',
                    color: 'var(--tech-label)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {p.type}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', lineHeight: 1.5 }}>{p.summary}</p>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-readout)',
                  color: 'var(--text-dim)',
                  letterSpacing: '0.04em',
                }}
              >
                {p.stack.join(' · ')}
              </div>
            </li>
          ))}
        </ul>
      );

    case 'contactGroup':
      return (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 16,
            rowGap: 10,
            alignItems: 'center',
            margin: '16px 0 4px',
          }}
        >
          {b.contacts.map((c, j) => (
            <Fragment key={j}>
              <ContactIcon kind={c.icon} />
              <a
                href={c.href}
                aria-label={c.label}
                target={isExternal(c.href) ? '_blank' : undefined}
                rel={isExternal(c.href) ? 'noopener noreferrer' : undefined}
                style={{
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  paddingBottom: 1,
                  transition: 'border-color var(--d-fast) var(--ease-out)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = 'var(--accent-cyan)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
              >
                {contactDisplay(c.href)}
              </a>
            </Fragment>
          ))}
        </div>
      );

    case 'photo':
      return (
        <img
          key={i}
          src={b.src}
          alt={b.alt}
          loading="lazy"
          width={160}
          height={160}
          style={{
            display: 'block',
            margin: '4px 0 12px',
            width: 160,
            height: 160,
            objectFit: 'cover',
            borderRadius: '50%',
            border: '2px solid var(--accent-violet)',
          }}
        />
      );

    case 'profileHeader':
      /* Layout is now driven by CSS classes (see global.css .profile-header
       * and friends) so the mobile breakpoint can shrink the photo and
       * keep the contact icons stacked next to the name/location instead
       * of wrapping to a new row. */
      return (
        <div key={i} className="profile-header">
          <img
            className="profile-header-photo"
            src={b.photo.src}
            alt={b.photo.alt}
            loading="lazy"
            width={108}
            height={108}
          />
          <div className="profile-header-info">
            <h2 className="profile-header-name">{b.name}</h2>
            <p className="profile-header-location">{b.location}</p>
            <div className="profile-header-contacts">
              {b.contacts.map((c, j) => (
                <a
                  key={j}
                  className="profile-header-contact"
                  href={c.href}
                  aria-label={c.label}
                  title={c.label}
                  target={isExternal(c.href) ? '_blank' : undefined}
                  rel={isExternal(c.href) ? 'noopener noreferrer' : undefined}
                >
                  <ContactIcon kind={c.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      );

    case 'sectionLabel':
      return (
        <div
          key={i}
          style={{
            margin: '22px 0 10px',
            paddingBottom: 6,
            borderBottom: '1px solid rgba(178, 212, 229, 0.14)',
            color: 'var(--tech-label)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-readout)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {b.text}
        </div>
      );

    case 'projectCard': {
      /* The card is a plain box, not one big link: a project can have two
       * destinations (repo + deployed site) and an anchor cannot nest
       * inside another. The preview, the title and the ↗ each link to the
       * repo — three generous targets — and the live link sits beside the
       * title. Only the title is exposed to assistive tech; the other two
       * are the same href, so they'd just be noise.
       * `.project-card` lights up via :has(a:hover) rather than a hover on
       * the box itself, so it never looks clickable where it isn't. */
      const repoLink = {
        href: b.href,
        target: isExternal(b.href) ? '_blank' : undefined,
        rel: isExternal(b.href) ? 'noopener noreferrer' : undefined,
      } as const;
      return (
        <div key={i} className="project-card">
          {b.preview && (
            <a {...repoLink} tabIndex={-1} aria-hidden style={{ display: 'block' }}>
              <img
                src={b.preview.src}
                alt={b.preview.alt}
                loading="lazy"
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  /* contain (not cover) so wide screenshots like the
                   * portfolio one don't lose edge content to a crop.
                   * The dark background blends any small letterbox
                   * into the cosmic theme. */
                  objectFit: 'contain',
                  background: '#06060f',
                  borderRadius: 4,
                  marginBottom: 10,
                  border: '1px solid rgba(178, 212, 229, 0.12)',
                }}
              />
            </a>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <a {...repoLink} className="project-card-title">{b.name}</a>
              {b.liveHref && (
                <a
                  href={b.liveHref}
                  target={isExternal(b.liveHref) ? '_blank' : undefined}
                  rel={isExternal(b.liveHref) ? 'noopener noreferrer' : undefined}
                  className="project-card-live"
                >
                  live · {contactDisplay(b.liveHref)}
                </a>
              )}
            </div>
            <a {...repoLink} tabIndex={-1} aria-hidden className="project-card-arrow">
              ↗
            </a>
          </div>
          <p style={{ margin: '6px 0 0', lineHeight: 1.55 }}>{b.summary}</p>
          {b.stack && b.stack.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {b.stack.map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    padding: '2px 6px',
                    border: '1px solid var(--tech-line)',
                    borderRadius: 2,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'postCard':
      return (
        <a
          key={i}
          href={b.href}
          target={isExternal(b.href) ? '_blank' : undefined}
          rel={isExternal(b.href) ? 'noopener noreferrer' : undefined}
          style={{
            display: 'block',
            padding: '12px 0',
            borderBottom: '1px solid rgba(178, 212, 229, 0.08)',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div className="post-card-row">
            <strong style={{ color: 'var(--text-bright)' }}>
              {b.title}{' '}
              <span aria-hidden style={{ color: 'var(--accent-cyan)' }}>↗</span>
            </strong>
            <span
              style={{
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-readout)',
                whiteSpace: 'nowrap',
              }}
            >
              {b.publication ? `${b.publication} · ${b.date}` : b.date}
            </span>
          </div>
          <p
            style={{
              margin: '4px 0 0',
              color: 'var(--text-dim)',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            “{b.quote}”
          </p>
        </a>
      );

    case 'aiChat':
      return <AiChat key={i} />;

    default:
      return exhaustive(b);
  }
}

interface BodyBlocksProps {
  readonly door: Door;
}

/**
 * Render the door's artifact blocks. Consecutive `productCard` blocks are
 * grouped into a responsive grid (1 column at narrow widths, 2 columns
 * when the card is wide enough) — saves vertical space on Engineering.
 */
export function BodyBlocks({ door }: BodyBlocksProps) {
  const out: ReactNode[] = [];
  const blocks = door.artifact;
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].kind === 'projectCard') {
      const startedAt = i;
      const group: ReactNode[] = [];
      while (i < blocks.length && blocks[i].kind === 'projectCard') {
        group.push(renderBlock(blocks[i], i));
        i++;
      }
      out.push(
        <div
          key={`group-${startedAt}`}
          style={{
            display: 'grid',
            /* min(100%, 460px) — mobile collapses to a single full-width
             * column (never overflows sideways), and on wider containers
             * only 2 columns can fit at typical desktop widths so the
             * preview images stay big instead of shrinking to 4-across. */
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: 14,
            margin: '12px 0',
          }}
        >
          {group}
        </div>,
      );
    } else if (blocks[i].kind === 'metric') {
      /* Consecutive metric blocks lay out as a flex-wrap row. Each metric
       * sizes to its (one-line) content via flex: 1 1 auto, so long labels
       * get wider cells and short labels get narrower ones — uneven on
       * purpose. Cells wrap to the next row when the row fills up. */
      const startedAt = i;
      const group: ReactNode[] = [];
      while (i < blocks.length && blocks[i].kind === 'metric') {
        group.push(renderBlock(blocks[i], i));
        i++;
      }
      out.push(
        <div
          key={`metrics-${startedAt}`}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            margin: '12px 0',
          }}
        >
          {group}
        </div>,
      );
    } else {
      out.push(renderBlock(blocks[i], i));
      i++;
    }
  }
  return <>{out}</>;
}
