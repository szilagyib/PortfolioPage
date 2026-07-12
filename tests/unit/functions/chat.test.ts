import { describe, it, expect, afterEach, vi } from 'vitest';
import { onRequestPost } from '../../../functions/api/chat';

interface MockKv extends KVNamespace {
  readonly store: Map<string, string>;
}

function mockKv(seed: Record<string, string> = {}): MockKv {
  const store = new Map(Object.entries(seed));
  return {
    store,
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  } as unknown as MockKv;
}

function request(init?: {
  readonly origin?: string;
  readonly url?: string;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
}): Request {
  const headers = new Headers(init?.headers);
  if (init?.origin) headers.set('origin', init.origin);
  return new Request(init?.url ?? 'https://borbalaszilagyi.com/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(init?.body ?? {
      messages: [{ role: 'user', text: 'What does Borbala do?' }],
    }),
  });
}

function context(req: Request, env: Record<string, unknown>) {
  const waitUntil: Promise<unknown>[] = [];
  return {
    request: req,
    env,
    waitUntil: (promise: Promise<unknown>) => {
      waitUntil.push(promise);
    },
    waitUntilAll: () => Promise.all(waitUntil),
  };
}

function openAIOk() {
  return vi.fn(async () =>
    new Response(JSON.stringify({
      choices: [{ message: { content: 'She leads engineering work.' } }],
      usage: {
        prompt_tokens: 150,
        completion_tokens: 40,
        total_tokens: 190,
      },
    }), { status: 200 }),
  );
}

function anthropicOk() {
  return vi.fn(async () =>
    new Response(JSON.stringify({
      content: [{ type: 'text', text: 'She leads engineering work.' }],
      usage: {
        input_tokens: 100,
        cache_creation_input_tokens: 20,
        cache_read_input_tokens: 30,
        output_tokens: 40,
      },
    }), { status: 200 }),
  );
}

async function json(res: Response): Promise<Record<string, unknown>> {
  return await res.json() as Record<string, unknown>;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('chat Pages Function guardrails', () => {
  it('rejects foreign origins before calling the model', async () => {
    const fetchMock = openAIOk();
    vi.stubGlobal('fetch', fetchMock);

    const res = await onRequestPost(context(request({ origin: 'https://evil.example' }), {
      CHAT_API_KEY: 'test-key',
      CHAT_LIMITS: mockKv(),
    }) as never);

    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed when the KV rate-limit binding is missing', async () => {
    const fetchMock = openAIOk();
    vi.stubGlobal('fetch', fetchMock);

    const res = await onRequestPost(context(request({ origin: 'https://borbalaszilagyi.com' }), {
      CHAT_API_KEY: 'test-key',
    }) as never);

    expect(res.status).toBe(200);
    expect(await json(res)).toMatchObject({ capped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('allows the explicit local no-KV bypass', async () => {
    const fetchMock = openAIOk();
    vi.stubGlobal('fetch', fetchMock);

    const res = await onRequestPost(context(request({ origin: 'https://borbalaszilagyi.com' }), {
      CHAT_API_KEY: 'test-key',
      CHAT_ALLOW_UNLIMITED_WITHOUT_KV: 'true',
    }) as never);

    expect(res.status).toBe(200);
    expect(await json(res)).toMatchObject({ role: 'assistant' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects oversized requests before parsing or model calls', async () => {
    const fetchMock = openAIOk();
    vi.stubGlobal('fetch', fetchMock);

    const res = await onRequestPost(context(request({
      origin: 'https://borbalaszilagyi.com',
      headers: { 'content-length': '20000' },
    }), {
      CHAT_API_KEY: 'test-key',
      CHAT_LIMITS: mockKv(),
    }) as never);

    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('records total OpenAI usage against the daily KV budget', async () => {
    const fetchMock = openAIOk();
    vi.stubGlobal('fetch', fetchMock);
    const kv = mockKv();
    const ctx = context(request({
      origin: 'https://borbalaszilagyi.com',
      headers: { 'cf-connecting-ip': '203.0.113.8' },
    }), {
      CHAT_API_KEY: 'test-key',
      CHAT_LIMITS: kv,
    });

    const res = await onRequestPost(ctx as never);
    await ctx.waitUntilAll();

    const today = new Date().toISOString().slice(0, 10);
    expect(res.status).toBe(200);
    expect(kv.store.get(`tokens:${today}`)).toBe('190');
  });

  it('routes to Anthropic when CHAT_PROVIDER=anthropic', async () => {
    const fetchMock = anthropicOk();
    vi.stubGlobal('fetch', fetchMock);
    const kv = mockKv();
    const ctx = context(request({
      origin: 'https://borbalaszilagyi.com',
      headers: { 'cf-connecting-ip': '203.0.113.9' },
    }), {
      CHAT_PROVIDER: 'anthropic',
      CHAT_API_KEY: 'test-key',
      CHAT_LIMITS: kv,
    });

    const res = await onRequestPost(ctx as never);
    await ctx.waitUntilAll();

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    expect(String(url)).toBe('https://api.anthropic.com/v1/messages');
    const today = new Date().toISOString().slice(0, 10);
    expect(kv.store.get(`tokens:${today}`)).toBe('190');
  });

  it('routes to OpenAI by default', async () => {
    const fetchMock = openAIOk();
    vi.stubGlobal('fetch', fetchMock);
    const ctx = context(request({
      origin: 'https://borbalaszilagyi.com',
      headers: { 'cf-connecting-ip': '203.0.113.10' },
    }), {
      CHAT_API_KEY: 'test-key',
      CHAT_LIMITS: mockKv(),
    });

    const res = await onRequestPost(ctx as never);
    expect(res.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    expect(String(url)).toBe('https://api.openai.com/v1/chat/completions');
  });
});
