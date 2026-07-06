import type { ChatRole } from '@/services/chat.service';

interface ChatBubbleProps {
  readonly role: ChatRole;
  readonly text: string;
  readonly failed?: boolean;
}

export function ChatBubble({ role, text, failed = false }: ChatBubbleProps) {
  const isUser = role === 'user';

  const background = failed
    ? 'rgba(236, 200, 117, 0.08)'
    : isUser
      ? 'rgba(95, 184, 214, 0.14)'
      : 'rgba(178, 212, 229, 0.06)';

  const border = failed
    ? '1px solid rgba(236, 200, 117, 0.5)'
    : isUser
      ? '1px solid rgba(95, 184, 214, 0.32)'
      : '1px solid rgba(178, 212, 229, 0.18)';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        margin: '8px 0',
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: isUser ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
          background,
          border,
          color: 'var(--text-bright)',
          fontSize: 14,
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </div>
    </div>
  );
}
