/**
 * Pages Function: POST /api/chat
 *
 * Accepts a short message history, applies per-IP rate limits and a daily
 * token-budget cap (both persisted in KV), and forwards to Anthropic's
 * Messages API. Returns a single assistant turn — batch, not streaming.
 *
 * The system prompt is sent with `cache_control: ephemeral`, so repeat
 * requests within a short window cost the cached-input rate (~$0.08/Mt vs
 * $0.25/Mt for fresh input on Haiku).
 */

import { SYSTEM_PROMPT } from '../../src/content/ai-system-prompt';

/**
 * All runtime configuration this function needs comes through `Env`. The
 * values are set in `wrangler.toml` (vars) or via the Cloudflare dashboard
 * (secrets) — there is no other config seam.
 */
interface Env {
  /** Anthropic API key. Set as a SECRET, not a var. */
  ANTHROPIC_API_KEY?: string;
  /** KV namespace used for rate-limit + token-budget counters. */
  CHAT_LIMITS?: KVNamespace;
  /** Anthropic model id. Default: claude-haiku-4-5. */
  CHAT_MODEL?: string;
  /** Cap on max_tokens per response. Default: 700. */
  CHAT_MAX_OUTPUT_TOKENS?: string;
  CHAT_RATE_LIMIT_PER_HOUR?: string;
  CHAT_RATE_LIMIT_PER_DAY?: string;
  CHAT_DAILY_TOKEN_BUDGET?: string;
  /**
   * Comma-separated list of origins permitted to call this endpoint.
   * When unset, the endpoint accepts any origin — fine for local dev but
   * should always be set in production to make casual API scraping harder.
   */
  ALLOWED_ORIGIN?: string;
}

type ClientRole = 'user' | 'assistant';

interface ClientMessage {
  readonly role: ClientRole;
  readonly text: string;
}

interface RequestBody {
  readonly messages: readonly ClientMessage[];
}

interface ResponseBody {
  readonly role: 'assistant';
  readonly text: string;
  /** Set when the limiter returned a synthetic response. */
  readonly capped?: boolean;
}

// --- Code constants (defensive bounds, not visitor-tunable) ---------------
/** Cap on conversation length sent to Anthropic. Counts messages, not turns. */
const MAX_HISTORY_MESSAGES = 12;
/** Bound on raw inbound array length so we don't spend cycles parsing junk. */
const MAX_RAW_MESSAGES = 100;

// --- Fallbacks for env-tunable values (when wrangler.toml isn't read) ----
const DEFAULT_MODEL = 'claude-haiku-4-5';
const DEFAULT_MAX_OUTPUT_TOKENS = 700;
const DEFAULT_RATE_PER_HOUR = 10;
const DEFAULT_RATE_PER_DAY = 30;
const DEFAULT_DAILY_TOKEN_BUDGET = 200000;

const json = (body: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init?.headers ?? {}),
    },
  });

const cappedResponse = (text: string): Response =>
  json({ role: 'assistant', text, capped: true } satisfies ResponseBody);

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function parseIntOr(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function todayUTC(): { day: string; hour: string } {
  const d = new Date();
  const day = d.toISOString().slice(0, 10); // YYYY-MM-DD
  const hour = `${day}T${String(d.getUTCHours()).padStart(2, '0')}`;
  return { day, hour };
}

interface RateLimitDecision {
  readonly allowed: boolean;
  readonly reason?: 'hour' | 'day' | 'tokens';
}

async function checkAndIncrementRate(
  kv: KVNamespace,
  ipHash: string,
  limits: { perHour: number; perDay: number; dailyTokens: number },
): Promise<RateLimitDecision> {
  const { day, hour } = todayUTC();

  const hourKey = `rate:${ipHash}:${hour}`;
  const dayKey  = `rate:${ipHash}:${day}`;
  const tokensKey = `tokens:${day}`;

  const [hourStr, dayStr, tokensStr] = await Promise.all([
    kv.get(hourKey),
    kv.get(dayKey),
    kv.get(tokensKey),
  ]);

  const hourCount = parseIntOr(hourStr ?? undefined, 0);
  const dayCount  = parseIntOr(dayStr ?? undefined, 0);
  const tokens    = parseIntOr(tokensStr ?? undefined, 0);

  if (tokens >= limits.dailyTokens) return { allowed: false, reason: 'tokens' };
  if (dayCount  >= limits.perDay)   return { allowed: false, reason: 'day' };
  if (hourCount >= limits.perHour)  return { allowed: false, reason: 'hour' };

  // Optimistic increment — fine for a portfolio's traffic; not a strict semaphore.
  await Promise.all([
    kv.put(hourKey, String(hourCount + 1), { expirationTtl: 3700 }),
    kv.put(dayKey,  String(dayCount + 1),  { expirationTtl: 90000 }),
  ]);

  return { allowed: true };
}

async function recordTokenUsage(
  kv: KVNamespace,
  outputTokens: number,
): Promise<void> {
  const { day } = todayUTC();
  const key = `tokens:${day}`;
  const current = parseIntOr((await kv.get(key)) ?? undefined, 0);
  await kv.put(key, String(current + outputTokens), { expirationTtl: 90000 });
}

function rateLimitMessage(reason: RateLimitDecision['reason']): string {
  switch (reason) {
    case 'hour':
      return 'You\'ve hit the hourly question cap — try again in a little while. (The cap is per-IP so a chatty visitor doesn\'t exhaust the free tier for everyone.)';
    case 'day':
      return 'You\'ve hit the daily question cap. Come back tomorrow, or reach out via the contact links above.';
    case 'tokens':
      return 'The chat has used its daily allowance — Borbála will top it up tomorrow. Meanwhile, the contact links above are the fastest way to reach her.';
    default:
      return 'The chat is briefly unavailable. Try again in a moment, or use the contact links above.';
  }
}

interface AnthropicTextBlock {
  readonly type: 'text';
  readonly text: string;
}

interface AnthropicResponse {
  readonly content?: readonly AnthropicTextBlock[];
  readonly usage?: { readonly output_tokens?: number };
}

/**
 * Wrap user-supplied content with delimiter tags so the model can tell
 * visitor input apart from system text. HTML-escape angle brackets and
 * ampersands inside the content so a visitor can't close the wrapping
 * tag prematurely and inject text outside it.
 */
function wrapVisitorInput(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<visitor>${escaped}</visitor>`;
}

async function callAnthropic(
  apiKey: string,
  model: string,
  maxOutputTokens: number,
  history: readonly ClientMessage[],
): Promise<{ text: string; outputTokens: number }> {
  const body = {
    model,
    max_tokens: maxOutputTokens,
    system: [
      {
        type: 'text' as const,
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' as const },
      },
    ],
    messages: history.map((m) => ({
      role: m.role,
      content: m.role === 'user' ? wrapVisitorInput(m.text) : m.text,
    })),
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`anthropic ${res.status}: ${await res.text().catch(() => '')}`);
  }

  const data = (await res.json()) as AnthropicResponse;
  const text = (data.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('anthropic returned empty text');
  }

  return { text, outputTokens: data.usage?.output_tokens ?? 0 };
}

function validateBody(raw: unknown): RequestBody | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as { messages?: unknown };
  if (!Array.isArray(obj.messages)) return null;
  if (obj.messages.length === 0 || obj.messages.length > MAX_RAW_MESSAGES) return null;
  const cleaned: ClientMessage[] = [];
  for (const item of obj.messages) {
    if (!item || typeof item !== 'object') return null;
    const m = item as { role?: unknown; text?: unknown };
    if (m.role !== 'user' && m.role !== 'assistant') return null;
    if (typeof m.text !== 'string' || m.text.trim().length === 0) return null;
    if (m.text.length > 2000) return null;
    cleaned.push({ role: m.role, text: m.text });
  }
  // Last message must come from the user — we're answering it.
  if (cleaned[cleaned.length - 1].role !== 'user') return null;

  // Keep only the most recent slice. After slicing the first surviving
  // message might be an assistant turn (e.g. when total > cap and parity
  // doesn't line up); Anthropic requires the conversation to start with
  // a user message, so drop any leading assistants here.
  let sliced = cleaned.slice(-MAX_HISTORY_MESSAGES);
  while (sliced.length > 0 && sliced[0].role !== 'user') {
    sliced = sliced.slice(1);
  }
  if (sliced.length === 0) return null;

  return { messages: sliced };
}

function originAllowed(request: Request, allowed: string | undefined): boolean {
  if (!allowed) return true; // No allow-list configured → permissive.
  const allowedList = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowedList.length === 0) return true;

  const origin = request.headers.get('origin');
  if (origin && allowedList.includes(origin)) return true;

  // Some browsers omit Origin on same-origin POSTs from older form actions;
  // fall back to Referer's origin component.
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (allowedList.includes(refOrigin)) return true;
    } catch {
      /* malformed Referer — fall through to deny */
    }
  }
  return false;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!originAllowed(request, env.ALLOWED_ORIGIN)) {
    return json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, { status: 400 });
  }

  const parsed = validateBody(body);
  if (!parsed) {
    return json({ error: 'invalid messages' }, { status: 400 });
  }

  if (!env.ANTHROPIC_API_KEY) {
    return cappedResponse(
      'The chat is not configured yet — the API key is missing in the deployment. Use the contact links above to reach Borbála directly.',
    );
  }

  const limits = {
    perHour: parseIntOr(env.CHAT_RATE_LIMIT_PER_HOUR, DEFAULT_RATE_PER_HOUR),
    perDay:  parseIntOr(env.CHAT_RATE_LIMIT_PER_DAY,  DEFAULT_RATE_PER_DAY),
    dailyTokens: parseIntOr(env.CHAT_DAILY_TOKEN_BUDGET, DEFAULT_DAILY_TOKEN_BUDGET),
  };

  if (env.CHAT_LIMITS) {
    const ip = request.headers.get('cf-connecting-ip') ?? 'anonymous';
    const ipHash = await sha256Hex(`chat-v1:${ip}`);
    const decision = await checkAndIncrementRate(env.CHAT_LIMITS, ipHash, limits);
    if (!decision.allowed) {
      return cappedResponse(rateLimitMessage(decision.reason));
    }
  }

  const model = env.CHAT_MODEL?.trim() || DEFAULT_MODEL;
  const maxOutputTokens = parseIntOr(env.CHAT_MAX_OUTPUT_TOKENS, DEFAULT_MAX_OUTPUT_TOKENS);

  try {
    const { text, outputTokens } = await callAnthropic(
      env.ANTHROPIC_API_KEY,
      model,
      maxOutputTokens,
      parsed.messages,
    );
    if (env.CHAT_LIMITS && outputTokens > 0) {
      // Don't block the response on the bookkeeping write — context.waitUntil
      // lets it finish after the response is already on the wire.
      context.waitUntil(recordTokenUsage(env.CHAT_LIMITS, outputTokens));
    }
    return json({ role: 'assistant', text } satisfies ResponseBody);
  } catch (err) {
    console.error('chat error', err);
    return cappedResponse(
      'Something went wrong reaching the chat backend. Try again in a moment.',
    );
  }
};
