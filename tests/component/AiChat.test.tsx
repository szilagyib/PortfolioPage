import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiChat } from '@/components/ai/AiChat';

const CHAT_URL = '*/api/chat';

const server = setupServer(
  http.post(CHAT_URL, () =>
    HttpResponse.json({ role: 'assistant', text: 'She leads a team of four at Prolan.' }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
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
