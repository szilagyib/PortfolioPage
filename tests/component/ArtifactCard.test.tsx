import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArtifactCard } from '@/components/canvas/ArtifactCard';
import { doors } from '@/content/doors.data';
import type { Door } from '@/domain/door';

const leadership = doors.find((d) => d.id === 'leadership') as Door;

describe('<ArtifactCard />', () => {
  it('renders paragraph content from the door artifact', () => {
    render(<ArtifactCard door={leadership} onClose={() => {}} />);
    expect(
      screen.getByText(/Team lead at Prolan since 2024/i)
    ).toBeInTheDocument();
  });

  it('renders within a labelled dialog', () => {
    render(<ArtifactCard door={leadership} onClose={() => {}} />);
    expect(
      screen.getByRole('dialog', { name: leadership.name })
    ).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<ArtifactCard door={leadership} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn();
    render(<ArtifactCard door={leadership} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders bullet items from a bullet block', () => {
    render(<ArtifactCard door={leadership} onClose={() => {}} />);
    expect(screen.getByText(/Rolled out AI tooling/i)).toBeInTheDocument();
  });
});
