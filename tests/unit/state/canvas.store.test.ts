import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '@/state/canvas.store';

beforeEach(() => {
  // Clear persisted state so tests don't leak across each other.
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
  useCanvasStore.getState().reset();
});

describe('canvas.store', () => {
  it('starts clean: no active puzzle, no powered doors, no open card', () => {
    const s = useCanvasStore.getState();
    expect(s.activePuzzle).toBeNull();
    expect(s.poweredDoors).toEqual([]);
    expect(s.allDoorsOpen).toBe(false);
    expect(s.openCard).toBeNull();
  });

  it('openPuzzle sets activePuzzle to that door', () => {
    useCanvasStore.getState().openPuzzle('leadership');
    expect(useCanvasStore.getState().activePuzzle).toBe('leadership');
  });

  it('closePuzzle clears the active puzzle', () => {
    const s = useCanvasStore.getState();
    s.openPuzzle('leadership');
    s.closePuzzle();
    expect(useCanvasStore.getState().activePuzzle).toBeNull();
  });

  it('solvePuzzle clears the puzzle, powers the door, and opens its card', () => {
    const s = useCanvasStore.getState();
    s.openPuzzle('leadership');
    s.solvePuzzle('leadership');
    const next = useCanvasStore.getState();
    expect(next.activePuzzle).toBeNull();
    expect(next.poweredDoors).toEqual(['leadership']);
    expect(next.openCard).toBe('leadership');
  });

  it('solvePuzzle does not duplicate an already-powered door', () => {
    const s = useCanvasStore.getState();
    s.solvePuzzle('leadership');
    s.solvePuzzle('leadership');
    expect(useCanvasStore.getState().poweredDoors).toEqual(['leadership']);
  });

  it('openAll powers every non-fortune door and flags allDoorsOpen', () => {
    useCanvasStore.getState().openAll();
    const s = useCanvasStore.getState();
    expect(s.allDoorsOpen).toBe(true);
    expect(s.poweredDoors).toEqual(
      expect.arrayContaining(['leadership', 'engineering', 'elsewhere', 'ai', 'about'])
    );
    expect(s.poweredDoors).not.toContain('fortune');
  });

  it('closeAll hides the see-everything overlay but keeps powered doors intact', () => {
    const s = useCanvasStore.getState();
    s.openAll();
    s.closeAll();
    const after = useCanvasStore.getState();
    expect(after.allDoorsOpen).toBe(false);
    expect(after.poweredDoors.length).toBeGreaterThan(0);
  });

  it('openCardFor opens and closes the card overlay', () => {
    const s = useCanvasStore.getState();
    s.openCardFor('leadership');
    expect(useCanvasStore.getState().openCard).toBe('leadership');
    s.openCardFor(null);
    expect(useCanvasStore.getState().openCard).toBeNull();
  });

  it('reset returns to clean state', () => {
    const s = useCanvasStore.getState();
    s.openPuzzle('leadership');
    s.solvePuzzle('leadership');
    s.openAll();
    s.reset();
    const after = useCanvasStore.getState();
    expect(after.activePuzzle).toBeNull();
    expect(after.poweredDoors).toEqual([]);
    expect(after.allDoorsOpen).toBe(false);
    expect(after.openCard).toBeNull();
  });
});
