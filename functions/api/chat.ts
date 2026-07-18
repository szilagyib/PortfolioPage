/**
 * Pages Function: POST /api/chat
 *
 * Accepts a short message history, applies per-IP rate limits and a daily
 * token-budget cap (both persisted in KV), and forwards to the configured
 * chat model. Returns a single assistant turn — batch, not streaming.
 *
 * Provider is selected by the CHAT_PROVIDER env var ("openai" | "anthropic").
 * The OpenAI adapter honours CHAT_BASE_URL, so any OpenAI-compatible endpoint
 * (OpenRouter, Together, Groq, local Ollama/vLLM) works through it.
 * Swap models by env alone; no code change needed.
 */

import { SYSTEM_PROMPT } from '../../src/content/ai-system-prompt';

/**
 * All runtime configuration this function needs comes through `Env`. The
 * values are set in `wrangler.toml` (vars) or via the Cloudflare dashboard
 * (secrets) — there is no other config seam.
 */
interface Env {
  /** Chat model provider. "openai" (default) or "anthropic". */
  CHAT_PROVIDER?: string;
  /** API key for the selected provider. Set as a SECRET, not a var. */
  CHAT_API_KEY?: string;
  /** KV namespace used for rate-limit + token-budget counters. */
  CHAT_LIMITS?: KVNamespace;
  /** Model id (provider-specific). Default: gpt-4o-mini. */
  CHAT_MODEL?: string;
  /**
   * Base URL for the OpenAI-compatible API. Default: https://api.openai.com/v1.
   * Lets the same adapter reach OpenRouter, Together, Groq, or a local
   * Ollama/vLLM. Ignored when CHAT_PROVIDER=anthropic.
   */
  CHAT_BASE_URL?: string;
  /** Cap on max_tokens per response. Default: 700. */
  CHAT_MAX_OUTPUT_TOKENS?: string;
  CHAT_RATE_LIMIT_PER_HOUR?: string;
  CHAT_RATE_LIMIT_PER_DAY?: string;
  CHAT_DAILY_TOKEN_BUDGET?: string;
  CHAT_ALLOW_UNLIMITED_WITHOUT_KV?: string;
  /**
   * Comma-separated list of origins permitted to call this endpoint.
   * When unset, only same-origin requests are accepted.
   */
  ALLOWED_ORIGIN?: string;
}

type ClientRole = 'user' | 'assistant';
type Provider = 'openai' | 'anthropic';

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
/** Cap on conversation length sent to the model. Counts messages, not turns. */
const MAX_HISTORY_MESSAGES = 8;
/** Bound on raw inbound array length so we don't spend cycles parsing junk. */
const MAX_RAW_MESSAGES = 24;
/** Reject obviously oversized bodies before JSON parsing. */
const MAX_REQUEST_BYTES = 16_384;
/** Per-message text cap. Keeps prompt-injection spam and accidental pastes small. */
const MAX_MESSAGE_CHARS = 1200;
/** Total cleaned conversation cap after trimming. */
const MAX_TOTAL_MESSAGE_CHARS = 5000;

// --- Fallbacks for env-tunable values (when wrangler.toml isn't read) ----
const DEFAULT_PROVIDER: Provider = 'openai';
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
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
      'x-content-type-options': 'nosniff',
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

function boolEnv(value: string | undefined): boolean {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function resolveProvider(value: string | undefined): Provider {
  const v = value?.trim().toLowerCase();
  if (v === 'openai' || v === 'anthropic') return v;
  return DEFAULT_PROVIDER;
}

function requestTooLarge(request: Request): boolean {
  const raw = request.headers.get('content-length');
  if (!raw) return false;
  const length = Number.parseInt(raw, 10);
  return Number.isFinite(length) && length > MAX_REQUEST_BYTES;
}

function todayUTC(): { day: string; hour: string } {
  const d = new Date();
  const day = d.toISOString().slice(0, 10); // YYYY-MM-DD
  const hour = `${day}T${String(d.getUTCHours()).padStart(2, '0')}`;
  return { day, hour };
}

type LimitReason = 'hour' | 'day' | 'tokens';

type RateLimitDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: LimitReason };

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

function rateLimitMessage(reason: LimitReason): string {
  switch (reason) {
    case 'hour':
      return 'You\'ve hit the hourly question cap — try again in a little while. (The cap is per-IP so a chatty visitor doesn\'t exhaust the free tier for everyone.)';
    case 'day':
      return 'You\'ve hit the daily question cap. Come back tomorrow, or reach out via the contact links above.';
    case 'tokens':
      return 'The chat has used its daily allowance — Borbála will top it up tomorrow. Meanwhile, the contact links above are the fastest way to reach her.';
  }
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

interface ProviderReply {
  readonly text: string;
  readonly usageTokens: number;
}

// --- Provider: Anthropic ---------------------------------------------------

interface AnthropicTextBlock {
  readonly type: 'text';
  readonly text: string;
}

interface AnthropicResponse {
  readonly content?: readonly AnthropicTextBlock[];
  readonly usage?: {
    readonly input_tokens?: number;
    readonly cache_creation_input_tokens?: number;
    readonly cache_read_input_tokens?: number;
    readonly output_tokens?: number;
  };
}

function anthropicUsage(usage: AnthropicResponse['usage']): number {
  if (!usage) return 0;
  return (
    (usage.input_tokens ?? 0) +
    (usage.cache_creation_input_tokens ?? 0) +
    (usage.cache_read_input_tokens ?? 0) +
    (usage.output_tokens ?? 0)
  );
}

async function callAnthropic(
  apiKey: string,
  model: string,
  maxOutputTokens: number,
  history: readonly ClientMessage[],
): Promise<ProviderReply> {
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

  return { text, usageTokens: anthropicUsage(data.usage) };
}

// --- Provider: OpenAI ------------------------------------------------------

interface OpenAIChoice {
  readonly message?: { readonly content?: string | null };
}

interface OpenAIResponse {
  readonly choices?: readonly OpenAIChoice[];
  readonly usage?: {
    readonly prompt_tokens?: number;
    readonly completion_tokens?: number;
    readonly total_tokens?: number;
  };
}

function openAIUsage(usage: OpenAIResponse['usage']): number {
  if (!usage) return 0;
  if (typeof usage.total_tokens === 'number') return usage.total_tokens;
  return (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0);
}

async function callOpenAI(
  apiKey: string,
  model: string,
  maxOutputTokens: number,
  history: readonly ClientMessage[],
  baseUrl: string,
): Promise<ProviderReply> {
  // `max_completion_tokens` supersedes `max_tokens` on OpenAI and is
  // accepted by both the older chat models and the newer reasoning ones
  // (o1/o3/gpt-5-*), so we always send this form.
  const body = {
    model,
    max_completion_tokens: maxOutputTokens,
    messages: [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...history.map((m) => ({
        role: m.role,
        content: m.role === 'user' ? wrapVisitorInput(m.text) : m.text,
      })),
    ],
  };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`openai ${res.status}: ${await res.text().catch(() => '')}`);
  }

  const data = (await res.json()) as OpenAIResponse;
  const text = (data.choices?.[0]?.message?.content ?? '').trim();

  if (!text) {
    throw new Error('openai returned empty text');
  }

  return { text, usageTokens: openAIUsage(data.usage) };
}

// --- Provider dispatch -----------------------------------------------------

function callProvider(
  provider: Provider,
  apiKey: string,
  model: string,
  maxOutputTokens: number,
  history: readonly ClientMessage[],
  baseUrl: string,
): Promise<ProviderReply> {
  switch (provider) {
    case 'anthropic':
      return callAnthropic(apiKey, model, maxOutputTokens, history);
    case 'openai':
      return callOpenAI(apiKey, model, maxOutputTokens, history, baseUrl);
  }
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
    if (typeof m.text !== 'string') return null;
    const text = m.text.trim();
    if (text.length === 0 || text.length > MAX_MESSAGE_CHARS) return null;
    cleaned.push({ role: m.role, text });
  }
  // Last message must come from the user — we're answering it.
  if (cleaned[cleaned.length - 1].role !== 'user') return null;

  // Keep only the most recent slice. After slicing the first surviving
  // message might be an assistant turn (e.g. when total > cap and parity
  // doesn't line up); the API requires the conversation to start with
  // a user message, so drop any leading assistants here.
  let sliced = cleaned.slice(-MAX_HISTORY_MESSAGES);
  while (sliced.length > 0 && sliced[0].role !== 'user') {
    sliced = sliced.slice(1);
  }
  if (sliced.length === 0) return null;
  const totalChars = sliced.reduce((sum, m) => sum + m.text.length, 0);
  if (totalChars > MAX_TOTAL_MESSAGE_CHARS) return null;

  return { messages: sliced };
}

function originAllowed(request: Request, allowed: string | undefined): boolean {
  const configured = allowed?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  const requestOrigin = new URL(request.url).origin;
  const allowedList = configured.length > 0 ? configured : [requestOrigin];

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

  if (requestTooLarge(request)) {
    return json({ error: 'request too large' }, { status: 413 });
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

  if (!env.CHAT_API_KEY) {
    return cappedResponse(
      'The chat is not configured yet — the API key is missing in the deployment. Use the contact links above to reach Borbála directly.',
    );
  }

  const limits = {
    perHour: parseIntOr(env.CHAT_RATE_LIMIT_PER_HOUR, DEFAULT_RATE_PER_HOUR),
    perDay:  parseIntOr(env.CHAT_RATE_LIMIT_PER_DAY,  DEFAULT_RATE_PER_DAY),
    dailyTokens: parseIntOr(env.CHAT_DAILY_TOKEN_BUDGET, DEFAULT_DAILY_TOKEN_BUDGET),
  };

  if (!env.CHAT_LIMITS && !boolEnv(env.CHAT_ALLOW_UNLIMITED_WITHOUT_KV)) {
    return cappedResponse(
      'The chat is temporarily unavailable because rate limiting is not configured. Use the contact links above to reach Borbála directly.',
    );
  }

  if (env.CHAT_LIMITS) {
    const ip = request.headers.get('cf-connecting-ip') ?? 'anonymous';
    const ipHash = await sha256Hex(`chat-v1:${ip}`);
    const decision = await checkAndIncrementRate(env.CHAT_LIMITS, ipHash, limits);
    if (!decision.allowed) {
      return cappedResponse(rateLimitMessage(decision.reason));
    }
  }

  const provider = resolveProvider(env.CHAT_PROVIDER);
  const model = env.CHAT_MODEL?.trim() || DEFAULT_MODEL;
  const maxOutputTokens = parseIntOr(env.CHAT_MAX_OUTPUT_TOKENS, DEFAULT_MAX_OUTPUT_TOKENS);
  const baseUrl =
    env.CHAT_BASE_URL?.trim().replace(/\/+$/, '') || DEFAULT_OPENAI_BASE_URL;

  try {
    const { text, usageTokens } = await callProvider(
      provider,
      env.CHAT_API_KEY,
      model,
      maxOutputTokens,
      parsed.messages,
      baseUrl,
    );
    if (env.CHAT_LIMITS && usageTokens > 0) {
      // Don't block the response on the bookkeeping write — context.waitUntil
      // lets it finish after the response is already on the wire.
      context.waitUntil(recordTokenUsage(env.CHAT_LIMITS, usageTokens));
    }
    return json({ role: 'assistant', text } satisfies ResponseBody);
  } catch (err) {
    console.error('chat error', err);
    return cappedResponse(
      'Something went wrong reaching the chat backend. Try again in a moment.',
    );
  }
};
