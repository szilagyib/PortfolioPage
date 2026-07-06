import { useState } from 'react';
import { doors } from '@/content/doors.data';
import { ArtifactCard } from '@/components/canvas/ArtifactCard';
import { FortuneStar } from '@/components/canvas/FortuneStar';
import { SystemReadout } from '@/components/canvas/SystemReadout';
import type { DoorId } from '@/domain/door';

export function DoorsGrid() {
  const [open, setOpen] = useState<DoorId | null>(null);
  const destinations = doors.filter((d) => d.id !== 'fortune');
  const cardDoor = open ? destinations.find((d) => d.id === open) ?? null : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        padding: '64px 18px 24px',
      }}
    >
      <SystemReadout />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
          maxWidth: 540,
          margin: '0 auto',
        }}
      >
        {destinations.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-label={d.name}
            onClick={() => setOpen(d.id)}
            style={{
              minHeight: 120,
              padding: 16,
              textAlign: 'left',
              background: 'rgba(13,18,48,0.7)',
              border: '1px solid var(--tech-line)',
              borderRadius: 6,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--text-bright)',
                letterSpacing: '0.08em',
              }}
            >
              ▣ {d.name}
            </div>
            <div
              style={{
                marginTop: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-dim)',
              }}
            >
              {d.tagline}
            </div>
          </button>
        ))}
      </div>
      <FortuneStar />
      {cardDoor && (
        <ArtifactCard door={cardDoor} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}
