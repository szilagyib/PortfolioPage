import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Destination } from '@/components/canvas/Destination';

describe('<Destination />', () => {
  const baseProps = {
    id: 'leadership' as const,
    name: 'LEADERSHIP',
    tagline: 'team-lead since 2024',
    xPercent: 75,
    yPercent: 25,
  };

  it('renders the door name and tagline by default', () => {
    render(<Destination {...baseProps} powered={false} onSelect={() => {}} />);
    expect(screen.getByText(/LEADERSHIP/)).toBeInTheDocument();
    expect(screen.getByText(/team-lead since 2024/i)).toBeInTheDocument();
  });

  it('shows the "open" sparkle when powered', () => {
    render(<Destination {...baseProps} powered={true} onSelect={() => {}} />);
    expect(screen.getByLabelText('open')).toBeInTheDocument();
  });

  it('does not show the "open" sparkle when standby', () => {
    render(<Destination {...baseProps} powered={false} onSelect={() => {}} />);
    expect(screen.queryByLabelText('open')).not.toBeInTheDocument();
  });

  it('exposes itself as an accessible native button', () => {
    render(<Destination {...baseProps} powered={false} onSelect={() => {}} />);
    const button = screen.getByRole('button', { name: /LEADERSHIP/i });
    expect(button.tagName.toLowerCase()).toBe('button');
  });

  it('fires onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<Destination {...baseProps} powered={false} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /LEADERSHIP/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('fires onSelect on Enter when focused (native button a11y)', async () => {
    const onSelect = vi.fn();
    render(<Destination {...baseProps} powered={false} onSelect={onSelect} />);
    const button = screen.getByRole('button', { name: /LEADERSHIP/i });
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
