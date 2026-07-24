import { useState, type KeyboardEvent } from 'react';

// Hard cap on a single question. Mirrors MAX_USER_MESSAGE_CHARS in
// functions/api/chat.ts — the server rejects anything longer, so keep the two
// in sync. A bio Q&A question fits well inside this; it's here to stop pastes.
const MAX_LENGTH = 250;
const COUNTER_SHOWS_AT = 200;

interface ChatComposerProps {
  readonly disabled: boolean;
  readonly onSend: (text: string) => void;
}

export function ChatComposer({ disabled, onSend }: ChatComposerProps) {
  const [value, setValue] = useState('');

  const trimmedLength = value.trim().length;
  const over = trimmedLength > MAX_LENGTH;

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter alone sends; Shift+Enter inserts a newline (default behaviour).
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const sendDisabled = disabled || trimmedLength === 0 || over;
  const showCounter = trimmedLength >= COUNTER_SHOWS_AT;

  return (
    <form
      onSubmit={handleSubmit}
      className="chat-composer-form"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          aria-label="ask me anything"
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type a question…"
          disabled={disabled}
          className="chat-composer-input"
          style={{
            flex: 1,
            width: '100%',
            resize: 'none',
            minHeight: 88,
            maxHeight: 240,
            padding: '12px 14px',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-input)',
            lineHeight: 1.55,
            color: 'var(--text-bright)',
            background: 'rgba(6, 8, 24, 0.7)',
            border: '1px solid rgba(178, 212, 229, 0.22)',
            borderRadius: 6,
            outline: 'none',
            transition: 'border-color var(--d-fast) var(--ease-out)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(95, 184, 214, 0.55)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(178, 212, 229, 0.22)')}
        />
        <button
          type="submit"
          disabled={sendDisabled}
          className="chat-composer-send"
          style={{
            padding: '10px 18px',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.08em',
            color: 'var(--text-bright)',
            background: 'rgba(95, 184, 214, 0.18)',
            border: '1px solid rgba(95, 184, 214, 0.5)',
            borderRadius: 6,
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
            opacity: sendDisabled ? 0.5 : 1,
            transition: 'background var(--d-fast) var(--ease-out)',
            flex: '0 0 auto',
          }}
        >
          send
        </button>
      </div>
      {over ? (
        <div
          aria-live="polite"
          style={{
            alignSelf: 'flex-end',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--accent-warm)',
          }}
        >
          That's more essay than question — trim {trimmedLength - MAX_LENGTH}{' '}
          character{trimmedLength - MAX_LENGTH === 1 ? '' : 's'} and I'll take it.
        </div>
      ) : showCounter ? (
        <div
          aria-live="polite"
          style={{
            alignSelf: 'flex-end',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-dim)',
          }}
        >
          {trimmedLength} / {MAX_LENGTH}
        </div>
      ) : null}
    </form>
  );
}
