import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiChat } from '@/components/ai/AiChat';

const CHAT_URL = '*/api/chat';

const server = setupServer(
  http.post(CHAT_URL, () =>
    HttpResponse.json({ role: 'assistant', text: 'She leads a team of four at Prolan.' }),
  ),
);

/* jsdom doesn't implement scrollIntoView; the auto-scroll effect calls it
 * on every exchange, so every test in this file needs the stub. */
const scrollIntoView = vi.fn();
Element.prototype.scrollIntoView = scrollIntoView;

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  scrollIntoView.mockClear();
  /* AiChat persists the transcript to localStorage, and jsdom shares one
   * store across the file — without this, each test remounts into the
   * previous test's conversation. */
  localStorage.clear();
});
afterAll(() => server.close());

describe('<AiChat />', () => {
  it('renders empty-state suggestions on first mount', () => {
    render(<AiChat />);
    expect(screen.getByRole('button', { name: /hardest part of being a team lead/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear conversation/i })).not.toBeInTheDocument();
  });

  it('sends a message when a suggestion is clicked and shows the reply', async () => {
    render(<AiChat />);
    await userEvent.click(screen.getByRole('button', { name: /hardest part of being a team lead/i }));
    expect(await screen.findByText(/team of four at Prolan/i)).toBeInTheDocument();
  });

  it('shows a clear button after the first exchange and resets state when clicked', async () => {
    render(<AiChat />);
    await userEvent.click(screen.getByRole('button', { name: /hardest part of being a team lead/i }));
    await screen.findByText(/team of four at Prolan/i);

    const clearButton = screen.getByRole('button', { name: /clear conversation/i });
    await userEvent.click(clearButton);

    // After clear, the empty state returns and history bubbles are gone.
    expect(screen.queryByText(/team of four at Prolan/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hardest part of being a team lead/i })).toBeInTheDocument();
  });

  it('sends typed input on Enter and clears the composer', async () => {
    render(<AiChat />);
    const textarea = screen.getByLabelText(/ask me anything/i);
    await userEvent.type(textarea, 'tell me more{Enter}');
    expect(await screen.findByText(/team of four at Prolan/i)).toBeInTheDocument();
    expect((textarea as HTMLTextAreaElement).value).toBe('');
  });

  it('blocks an over-length question with a nudge instead of sending', async () => {
    render(<AiChat />);
    const textarea = screen.getByLabelText(/ask me anything/i);
    await userEvent.click(textarea);
    await userEvent.paste('x'.repeat(260));

    // The funny nudge shows and Enter must not fire a request.
    expect(screen.getByText(/more essay than question/i)).toBeInTheDocument();
    await userEvent.type(textarea, '{Enter}');
    expect(screen.queryByText(/team of four at Prolan/i)).not.toBeInTheDocument();
  });

  it('shows a retry button after a failed reply and replaces it on success', async () => {
    // First call → server error (failed reply).
    server.use(http.post(CHAT_URL, () => new HttpResponse(null, { status: 500 })));

    render(<AiChat />);
    await userEvent.click(screen.getByRole('button', { name: /hardest part of being a team lead/i }));
    expect(await screen.findByText(/unreachable|contact/i)).toBeInTheDocument();

    // Retry now resolves successfully.
    server.use(
      http.post(CHAT_URL, () =>
        HttpResponse.json({ role: 'assistant', text: 'She leads a team of four at Prolan.' }),
      ),
    );

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(await screen.findByText(/team of four at Prolan/i)).toBeInTheDocument();
    expect(screen.queryByText(/unreachable|contact/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('keeps the composer font size at 16px or more so iOS Safari does not zoom on focus', () => {
    // The composer must render at --fs-input, the token must be ≥16px, and
    // global.css must not override it (rationale lives in tokens.css).
    render(<AiChat />);
    const textarea = screen.getByLabelText(/ask me anything/i);
    expect(textarea.style.fontSize).toBe('var(--fs-input)');

    const tokens = readFileSync(resolve(__dirname, '../../src/styles/tokens.css'), 'utf8');
    expect(parseFloat(tokens.match(/--fs-input:\s*([\d.]+)px/)?.[1] ?? '')).toBeGreaterThanOrEqual(16);

    const globalCss = readFileSync(resolve(__dirname, '../../src/styles/global.css'), 'utf8');
    expect(globalCss).not.toMatch(/\.chat-composer-input\s*\{[^}]*font-size/);
  });

  it('auto-scrolls to the newest message on reopen and after each exchange', async () => {
    localStorage.setItem(
      'pf.chat.v1',
      JSON.stringify({
        messages: [
          { role: 'user', text: 'earlier question' },
          { role: 'assistant', text: 'earlier answer' },
        ],
        savedAt: Date.now(),
      }),
    );
    render(<AiChat />);
    // Reopening with restored history lands on the newest message.
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());

    scrollIntoView.mockClear();
    await userEvent.type(screen.getByLabelText(/ask me anything/i), 'tell me more{Enter}');
    await screen.findByText(/team of four at Prolan/i);
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('does not auto-scroll an empty chat on first open', () => {
    render(<AiChat />);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls the composer into view when the input gains focus', async () => {
    render(<AiChat />);
    await userEvent.click(screen.getByLabelText(/ask me anything/i));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
  });

  it('does NOT show a retry button on capped/synthetic server responses', async () => {
    server.use(
      http.post(CHAT_URL, () =>
        HttpResponse.json({ role: 'assistant', text: 'daily cap hit', capped: true }),
      ),
    );
    render(<AiChat />);
    await userEvent.click(screen.getByRole('button', { name: /hardest part of being a team lead/i }));
    expect(await screen.findByText(/daily cap hit/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });
});
