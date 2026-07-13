import { useEffect } from 'react';
import { useCanvasStore } from '@/state/canvas.store';

const VISITED_KEY = 'pf.visited.v1';

/**
 * Returning-visitor UX:
 *   - Mark the visitor as "engaged" once they open a door, solve a
 *     puzzle, open a card, or click see-all. This is a persistent
 *     flag — surviving reloads and future sessions.
 *   - On next mount, if the flag is present, jump straight to the
 *     see-all overlay. The pentagon puzzle is a first-visit delight;
 *     nobody wants to solve the same puzzle twice.
 *
 * Called from Canvas and MobileCanvas so both entry points share the
 * behaviour. Safe under SSR — Canvas is client:only, so localStorage
 * is always available when this runs.
 */
export function useReturningVisitorAutoSkip(): void {
  const openAll = useCanvasStore((s) => s.openAll);
  const poweredDoors = useCanvasStore((s) => s.poweredDoors);
  const activePuzzle = useCanvasStore((s) => s.activePuzzle);
  const openCard = useCanvasStore((s) => s.openCard);
  const allDoorsOpen = useCanvasStore((s) => s.allDoorsOpen);

  useEffect(() => {
    try {
      if (localStorage.getItem(VISITED_KEY)) openAll();
    } catch {
      /* private mode / storage disabled — silently skip the shortcut */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const engaged =
      poweredDoors.length > 0 || activePuzzle || openCard || allDoorsOpen;
    if (!engaged) return;
    try {
      if (!localStorage.getItem(VISITED_KEY)) {
        localStorage.setItem(VISITED_KEY, String(Date.now()));
      }
    } catch {
      /* ignore — flag is best-effort */
    }
  }, [poweredDoors.length, activePuzzle, openCard, allDoorsOpen]);
}
