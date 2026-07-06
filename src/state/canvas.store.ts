import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DoorId } from '@/domain/door';
import { doors } from '@/content/doors.data';

interface CanvasState {
  /** Door whose puzzle modal is currently open; null if no puzzle is active. */
  readonly activePuzzle: DoorId | null;
  /** Doors that have been opened (puzzle solved or skipped via "see everything"). */
  readonly poweredDoors: readonly DoorId[];
  /** Whether the "see everything" overlay is currently shown. */
  readonly allDoorsOpen: boolean;
  /** Door whose artifact card overlay is currently shown. */
  readonly openCard: DoorId | null;

  openPuzzle: (id: DoorId) => void;
  closePuzzle: () => void;
  solvePuzzle: (id: DoorId) => void;
  openAll: () => void;
  /** Closes the see-everything overlay; preserves powered doors. */
  closeAll: () => void;
  openCardFor: (id: DoorId | null) => void;
  reset: () => void;
}

const STORAGE_KEY = 'borbala-portfolio-canvas';
const LEGACY_LOCALSTORAGE_KEY = STORAGE_KEY;

// One-time cleanup: an earlier build wrote to localStorage. Now that we use
// sessionStorage, remove the stale localStorage entry so old visitors don't
// carry permanently-saved state forever.
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try { localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY); } catch { /* ignore */ }
}

const INITIAL_STATE = {
  activePuzzle: null,
  poweredDoors: [] as readonly DoorId[],
  allDoorsOpen: false,
  openCard: null,
} as const;

/**
 * State store with sessionStorage persistence for the progress slice
 * (poweredDoors). sessionStorage is scoped to a single browser tab — so:
 *   - same-tab reloads / dev-server restarts keep your place
 *   - new tab, new window, or coming back later starts fresh
 *
 * Transient UI state (activePuzzle, openCard, allDoorsOpen) is intentionally
 * NOT persisted, so a refresh always lands you back on the canvas itself.
 */
export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      openPuzzle: (id) => set({ activePuzzle: id }),

      closePuzzle: () => set({ activePuzzle: null }),

      solvePuzzle: (id) => {
        const { poweredDoors } = get();
        set({
          activePuzzle: null,
          poweredDoors: poweredDoors.includes(id) ? poweredDoors : [...poweredDoors, id],
          openCard: id,
        });
      },

      openAll: () => set({
        allDoorsOpen: true,
        poweredDoors: doors.filter((d) => d.id !== 'fortune').map((d) => d.id),
      }),

      closeAll: () => set({ allDoorsOpen: false }),

      openCardFor: (id) => set({ openCard: id }),

      reset: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ poweredDoors: state.poweredDoors }),
    },
  ),
);
