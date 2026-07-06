/**
 * Pages Function: GET /api/fortune
 *
 * Proxies api.adviceslip.com server-side so the request leaves Cloudflare
 * looking same-origin to the visitor's browser. Ad-blockers and tracking-
 * protection extensions frequently match third-party "fortune"/"advice"
 * domains and silently block them; routing through here avoids that.
 *
 * The client (src/services/fortune.service.ts) still keeps a curated
 * fallback list for the case where THIS function fails too.
 */

const ADVICE_URL = 'https://api.adviceslip.com/advice';

interface AdviceSlipResponse {
  slip?: {
    id?: number;
    advice?: string;
  };
}

interface FortunePayload {
  text: string;
  attribution: string;
}

export const onRequestGet: PagesFunction = async () => {
  try {
    const upstream = await fetch(ADVICE_URL, {
      cf: { cacheTtl: 0, cacheEverything: false } as RequestInitCfProperties,
      headers: { accept: 'application/json' },
    });
    if (!upstream.ok) {
      return errorResponse(`adviceslip status ${upstream.status}`, 502);
    }
    /* adviceslip returns Content-Type: text/html even though the body is
     * JSON. Read as text and parse explicitly so we don't depend on the
     * Content-Type header. */
    const raw = await upstream.text();
    const data = JSON.parse(raw) as AdviceSlipResponse;
    const slip = data?.slip;
    if (!slip?.advice || typeof slip.id !== 'number') {
      return errorResponse('malformed adviceslip response', 502);
    }
    const payload: FortunePayload = {
      text: slip.advice,
      attribution: `slip #${slip.id.toString().padStart(3, '0')}`,
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'unknown', 502);
  }
};

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
