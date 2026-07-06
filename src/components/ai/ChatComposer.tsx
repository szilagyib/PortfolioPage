import { useState, type KeyboardEvent } from 'react';

const MAX_LENGTH = 2000;
const COUNTER_SHOWS_AT = 1500;

interface ChatComposerProps {
  readonly disabled: boolean;
  readonly onSend: (text: string) => void;
}

export function ChatComposer({ disabled, onSend }: ChatComposerProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || disabled) return;
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

  const sendDisabled = disabled || value.trim().length === 0;
  const showCounter = value.length >= COUNTER_SHOWS_AT;
  const atLimit = value.length >= MAX_LENGTH;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginTop: 12,
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
          maxLength={MAX_LENGTH}
          style={{
            flex: 1,
            width: '100%',
            resize: 'none',
            minHeight: 88,
            maxHeight: 240,
            padding: '12px 14px',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
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
      {showCounter && (
        <div
          aria-live="polite"
          style={{
            alignSelf: 'flex-end',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: atLimit ? 'var(--accent-warm)' : 'var(--text-dim)',
          }}
        >
          {value.length} / {MAX_LENGTH}
        </div>
      )}
    </form>
  );
}
