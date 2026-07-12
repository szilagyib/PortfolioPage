/**
 * Client-side wrapper around POST /api/chat. The endpoint is a Cloudflare
 * Pages Function — see functions/api/chat.ts.
 *
 * Errors that aren't worth surfacing to the visitor (network blips, unexpected
 * shape) are flattened into a polite assistant message rather than thrown, so
 * the chat UI can always present something coherent.
 */

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  readonly role: ChatRole;
  readonly text: string;
  /**
   * Set on assistant messages that came from a *client-side* error path
   * (network, 5xx, malformed JSON). The UI offers a retry button only on
   * failed messages — server-side capped responses are intentional and
   * retrying won't help, so they don't carry this flag.
   */
  readonly failed?: boolean;
}

const FALLBACK_TEXT =
  'The chat is briefly unreachable. Try again in a moment, or use the contact links above to reach Borbála directly.';

const failedReply = (): ChatMessage => ({
  role: 'assistant',
  text: FALLBACK_TEXT,
  failed: true,
});

interface ServerResponse {
  readonly role?: unknown;
  readonly text?: unknown;
  readonly capped?: unknown;
}

function parseAssistantReply(raw: unknown): ChatMessage {
  if (!raw || typeof raw !== 'object') {
    return failedReply();
  }
  const r = raw as ServerResponse;
  if (r.role !== 'assistant' || typeof r.text !== 'string' || r.text.trim().length === 0) {
    return failedReply();
  }
  return { role: 'assistant', text: r.text };
}

/**
 * Send a new user message along with prior turns. Returns the assistant reply.
 *
 * The full conversation is sent each turn (capped server-side at 12 messages).
 * The system prompt dominates the token count; message history is small.
 */
export async function sendChatMessage(
  history: readonly ChatMessage[],
  newUserText: string,
): Promise<ChatMessage> {
  const trimmed = newUserText.trim();
  if (trimmed.length === 0) {
    return { role: 'assistant', text: 'Please enter a question first.' };
  }

  const messages: readonly ChatMessage[] = [
    ...history,
    { role: 'user', text: trimmed },
  ];

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) {
      return failedReply();
    }
    const data = await res.json();
    return parseAssistantReply(data);
  } catch {
    return failedReply();
  }
}
