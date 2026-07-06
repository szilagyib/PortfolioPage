import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DoorsGrid } from '@/components/fallback/DoorsGrid';

describe('<DoorsGrid />', () => {
  it('renders all 5 destination tiles', () => {
    render(<DoorsGrid />);
    expect(screen.getByRole('button', { name: 'LEADERSHIP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ENGINEERING' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ELSEWHERE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ASK ME' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ABOUT' })).toBeInTheDocument();
  });

  it('does not render the fortune door as a grid tile', () => {
    render(<DoorsGrid />);
    expect(screen.queryByRole('button', { name: 'FORTUNE' })).not.toBeInTheDocument();
  });

  it('opens an artifact dialog when a door is tapped', async () => {
    render(<DoorsGrid />);
    await userEvent.click(screen.getByRole('button', { name: 'LEADERSHIP' }));
    expect(
      await screen.findByRole('dialog', { name: 'LEADERSHIP' })
    ).toBeInTheDocument();
  });
});
