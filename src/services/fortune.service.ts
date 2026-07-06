export interface Fortune {
  readonly text: string;
  readonly attribution: string;
}

const FALLBACKS: readonly Fortune[] = [
  { text: 'Make it work, make it right, make it fast.', attribution: 'Kent Beck' },
  { text: 'Simplicity is the ultimate sophistication.', attribution: 'Leonardo da Vinci' },
  { text: 'The bamboo that bends is stronger than the oak that resists.', attribution: 'Japanese proverb' },
  { text: 'Premature optimization is the root of all evil.', attribution: 'Donald Knuth' },
  { text: 'Talk is cheap. Show me the code.', attribution: 'Linus Torvalds' },
];

interface FortunePayload {
  readonly text: string;
  readonly attribution: string;
}

function pickFallback(): Fortune {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]!;
}

/**
 * Fetches a fortune via /api/fortune — a Pages Function that proxies
 * api.adviceslip.com server-side. The proxy avoids the common failure
 * mode where ad-blockers / tracking-protection extensions block the
 * direct call to a third-party advice/fortune host. The curated FALLBACKS
 * still kick in if the function fails (e.g. running `astro dev` without
 * `wrangler pages dev`, or a transient upstream outage).
 *
 * Errors are logged to console.error so any future regression is visible
 * in DevTools instead of silently degrading.
 */
export async function fetchFortune(): Promise<Fortune> {
  try {
    const res = await fetch('/api/fortune', { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as FortunePayload;
    if (!data?.text || !data?.attribution) throw new Error('malformed payload');
    return { text: data.text, attribution: data.attribution };
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.error('[fortune] using fallback:', err);
    }
    return pickFallback();
  }
}
