import { useEffect, useState } from 'react';
import { sendChatMessage, type ChatMessage } from '@/services/chat.service';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';

const SUGGESTIONS: readonly string[] = [
  "What's the hardest part of being a team lead?",
  'How does she use AI in day-to-day coding?',
  'Surprise me with a fun fact!',
];

/* LocalStorage key + 24h retention. A visitor who reads Leadership,
 * closes it, and pops back into the chat within the day expects to
 * see their earlier questions. Longer than a day starts to feel
 * stale, so we bin it. */
const CHAT_STORAGE_KEY = 'pf.chat.v1';
const CHAT_STORAGE_TTL_MS = 24 * 60 * 60 * 1000;

interface StoredChat {
  readonly messages: readonly ChatMessage[];
  readonly savedAt: number;
}

function readStoredChat(): readonly ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChat;
    if (
      !parsed ||
      !Array.isArray(parsed.messages) ||
      typeof parsed.savedAt !== 'number' ||
      Date.now() - parsed.savedAt > CHAT_STORAGE_TTL_MS
    ) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return null;
    }
    return parsed.messages;
  } catch {
    return null;
  }
}

export function AiChat() {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const restored = readStoredChat();
    if (restored && restored.length > 0) setMessages(restored);
  }, []);

  useEffect(() => {
    try {
      if (messages.length === 0) {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        return;
      }
      const payload: StoredChat = { messages, savedAt: Date.now() };
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* private mode or storage full — silently give up on persistence */
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMessage: ChatMessage = { role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    try {
      const reply = await sendChatMessage(messages, text);
      setMessages((prev) => [...prev, reply]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    if (loading) return;
    setMessages([]);
  };

  /**
   * Drops the trailing failed assistant message and re-sends the user
   * message that preceded it. The history sent to the server matches
   * what would have been sent on the original attempt — so caching is
   * still effective and the conversation context is identical.
   */
  const retry = async () => {
    if (loading) return;
    if (messages.length < 2) return;
    const last = messages[messages.length - 1];
    const prev = messages[messages.length - 2];
    if (last.role !== 'assistant' || !last.failed) return;
    if (prev.role !== 'user') return;

    const trimmedHistory = messages.slice(0, -1);
    const historyBeforeUser = messages.slice(0, -2);

    setMessages(trimmedHistory);
    setLoading(true);
    try {
      const reply = await sendChatMessage(historyBeforeUser, prev.text);
      setMessages([...trimmedHistory, reply]);
    } finally {
      setLoading(false);
    }
  };

  const hasHistory = messages.length > 0;
  const last = messages[messages.length - 1];
  const canRetry =
    !loading &&
    last !== undefined &&
    last.role === 'assistant' &&
    last.failed === true;

  return (
    <section className="chat-shell" style={{ margin: '4px 0 0' }}>
      {/* The "ask me anything" label + model info live in the artifact card's
       * sticky header now (see ArtifactCard isChatOnly branch). The only
       * floating control kept here is "clear", shown once there's history. */}
      {hasHistory && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 6,
          }}
        >
          <button
            type="button"
            onClick={clear}
            disabled={loading}
            aria-label="clear conversation"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'var(--text-bright)',
              background: 'transparent',
              border: '1px solid rgba(178, 212, 229, 0.25)',
              borderRadius: 4,
              padding: '3px 8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            ↻ clear
          </button>
        </div>
      )}

      {/* No internal scroll — the artifact card scrolls. One context, not two. */}
      <div className="chat-log" style={{ padding: '4px 4px 8px' }}>
        {!hasHistory && !loading && (
          <div
            style={{
              padding: '12px 4px',
              fontSize: 13,
              color: 'var(--text-dim)',
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: '0 0 10px' }}>
              I'm an AI grounded on Borbála's bio — ask anything about her work, leadership, or AI experience.
            </p>
            {/* Layout + typography driven by CSS classes (see global.css
             *   .chat-suggestions) so mobile can switch to a stacked
             *   column with nowrap — each question stays on one line. */}
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void handleSend(s)}
                  className="chat-suggestion"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} failed={m.failed} />
        ))}

        {canRetry && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '-2px 0 8px' }}>
            <button
              type="button"
              onClick={() => void retry()}
              aria-label="retry last question"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.06em',
                color: 'var(--accent-warm)',
                background: 'transparent',
                border: '1px solid rgba(236, 200, 117, 0.5)',
                borderRadius: 4,
                padding: '4px 10px',
                cursor: 'pointer',
              }}
            >
              ↻ retry
            </button>
          </div>
        )}

        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              margin: '8px 0',
            }}
          >
            <div
              aria-live="polite"
              style={{
                padding: '10px 14px',
                borderRadius: '10px 10px 10px 2px',
                background: 'rgba(178, 212, 229, 0.06)',
                border: '1px solid rgba(178, 212, 229, 0.18)',
                color: 'var(--text-dim)',
                fontSize: 14,
              }}
            >
              <span className="ai-thinking-dots" aria-hidden>
                <span /> <span /> <span />
              </span>
              <span style={{ marginLeft: 8 }}>thinking…</span>
            </div>
          </div>
        )}
      </div>

      <ChatComposer disabled={loading} onSend={handleSend} />
    </section>
  );
}
