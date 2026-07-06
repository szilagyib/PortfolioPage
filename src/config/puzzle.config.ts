/**
 * Selects which puzzle gates each destination. Change the single line below
 * to switch — both engines stay in the repo, so reverting is a one-line edit.
 *
 *   'conduit'        rotate pipe segments to connect source ↔ destination
 *                    (original game; longer, more puzzle-like)
 *   'constellation'  click stars in order to draw a constellation
 *                    (lighter, fits the cosmic theme more directly)
 */
export type PuzzleEngine = 'conduit' | 'constellation';

export const PUZZLE_ENGINE: PuzzleEngine = 'constellation';
