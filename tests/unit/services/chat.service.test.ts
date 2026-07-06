import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { sendChatMessage } from '@/services/chat.service';

const CHAT_URL = '*/api/chat';

const server = setupServer(
  http.post(CHAT_URL, () =>
    HttpResponse.json({ role: 'assistant', text: 'Borbála leads a team of four at Prolan.' }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('sendChatMessage', () => {
  it('returns the assistant reply on a successful response', async () => {
    const reply = await sendChatMessage([], 'What does she do at Prolan?');
    expect(reply.role).toBe('assistant');
    expect(reply.text).toMatch(/four at Prolan/i);
  });

  it('sends the full history plus the new user message in the body', async () => {
    let captured: unknown = null;
    server.use(
      http.post(CHAT_URL, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ role: 'assistant', text: 'ok' });
      }),
    );
    await sendChatMessage(
      [
        { role: 'user', text: 'first question' },
        { role: 'assistant', text: 'first reply' },
      ],
      'second question',
    );
    const body = captured as { messages: { role: string; text: string }[] };
    expect(body.messages).toHaveLength(3);
    expect(body.messages[2]).toEqual({ role: 'user', text: 'second question' });
  });

  it('falls back to a polite message on network error and marks the reply failed', async () => {
    server.use(http.post(CHAT_URL, () => HttpResponse.error()));
    const reply = await sendChatMessage([], 'anything');
    expect(reply.role).toBe('assistant');
    expect(reply.text.length).toBeGreaterThan(0);
    expect(reply.text).toMatch(/unreachable|contact/i);
    expect(reply.failed).toBe(true);
  });

  it('falls back to a polite message on non-2xx response and marks the reply failed', async () => {
    server.use(http.post(CHAT_URL, () => new HttpResponse(null, { status: 500 })));
    const reply = await sendChatMessage([], 'anything');
    expect(reply.text).toMatch(/unreachable|contact/i);
    expect(reply.failed).toBe(true);
  });

  it('falls back when the server returns a malformed payload and marks failed', async () => {
    server.use(http.post(CHAT_URL, () => HttpResponse.json({ unexpected: true })));
    const reply = await sendChatMessage([], 'anything');
    expect(reply.text).toMatch(/unreachable|contact/i);
    expect(reply.failed).toBe(true);
  });

  it('does NOT mark capped/synthetic server responses as failed (retry would not help)', async () => {
    server.use(
      http.post(CHAT_URL, () =>
        HttpResponse.json({ role: 'assistant', text: 'daily cap hit', capped: true }),
      ),
    );
    const reply = await sendChatMessage([], 'anything');
    expect(reply.text).toBe('daily cap hit');
    expect(reply.failed).toBeFalsy();
  });

  it('rejects an empty user message without hitting the network', async () => {
    let hit = false;
    server.use(
      http.post(CHAT_URL, () => {
        hit = true;
        return HttpResponse.json({ role: 'assistant', text: 'should not see this' });
      }),
    );
    const reply = await sendChatMessage([], '   ');
    expect(hit).toBe(false);
    expect(reply.text).toMatch(/enter a question/i);
  });
});
